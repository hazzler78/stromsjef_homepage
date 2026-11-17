import type { SupabaseClient } from '@supabase/supabase-js';
import {
  addStockholmDays,
  stockholmDayIsoBounds,
  toStockholmDateString,
} from '@/lib/stockholmDates';
import {
  fetchSalesysDayResults,
  fetchSalesysReaderNames,
  getSalesysSupplierDashboards,
  parseSalesysBruttosalgResults,
  resolveSalesysLinkId,
} from '@/lib/salesysDashboard';

export const TOTAL_PRODUCT = '__total__';
export const CACHE_MAX_AGE_MS = 6 * 60 * 60 * 1000;
/**
 * Rows cached before the Bruttosalg parser fix (#15) are often bogus `orders=0`.
 * Re-fetch zero-order cache written before this timestamp.
 */
export const SALESYS_TRUSTED_CACHE_AFTER_MS = Date.parse(
  '2026-11-17T09:30:00.000Z'
);
/** Max calendar days to backfill from SaleSys per HTTP request (Worker subrequest budget). */
export const MAX_SALESYS_DAYS_PER_REQUEST = 8;

export type SalesysSyncAttempt = {
  date: string;
  supplier: string;
  foundBruttosalg: boolean;
  parsedOrders: number;
  saved: boolean;
  errorCode?: string;
};

export type SalesysSyncResult = {
  daysSynced: string[];
  daysStillMissing: number;
  attempts: SalesysSyncAttempt[];
};

type CacheRow = {
  sale_date: string;
  supplier: string;
  fetched_at: string;
  orders?: number | null;
};

function isPoisonedLegacyZero(
  orders: number | null | undefined,
  fetchedAt: string | undefined
): boolean {
  if (orders === null || orders === undefined) return false;
  if (orders !== 0) return false;
  if (!fetchedAt) return true;
  const fetchedMs = Date.parse(fetchedAt);
  if (Number.isNaN(fetchedMs)) return true;
  return fetchedMs < SALESYS_TRUSTED_CACHE_AFTER_MS;
}

function cacheNeedsRefresh(
  fetchedAt: string | undefined,
  saleDate: string,
  orders: number | null | undefined
): boolean {
  if (!fetchedAt) return true;
  if (isPoisonedLegacyZero(orders, fetchedAt)) return true;
  return isStale(fetchedAt, saleDate);
}

function isStale(fetchedAt: string | undefined, saleDate: string): boolean {
  if (!fetchedAt) return true;
  const age = Date.now() - new Date(fetchedAt).getTime();
  if (age < CACHE_MAX_AGE_MS) return false;
  const today = toStockholmDateString();
  const yesterday = addStockholmDays(today, -1);
  return saleDate === today || saleDate === yesterday;
}

function isRlsError(message: string): boolean {
  const m = message.toLowerCase();
  return m.includes('row-level security') || m.includes('rls');
}

async function upsertSalesRows(
  supabase: SupabaseClient,
  rows: Record<string, unknown>[]
): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabase.from('salesys_daily_sales').upsert(rows, {
    onConflict: 'sale_date,supplier,product',
  });
  if (!error) return { ok: true };
  if (!isRlsError(error.message)) {
    return { ok: false, error: error.message };
  }

  const { error: rpcError } = await supabase.rpc('admin_upsert_salesys_daily_sales', {
    p_rows: rows,
  });
  if (rpcError) {
    return { ok: false, error: `RLS fallback RPC: ${rpcError.message}` };
  }
  return { ok: true };
}

/**
 * Pick at most MAX_SALESYS_DAYS_PER_REQUEST dates that need SaleSys fetch across enabled suppliers.
 */
export function pickDaysToSync(
  rangeDates: string[],
  configs: ReturnType<typeof getSalesysSupplierDashboards>,
  cached: CacheRow[]
): { toSync: string[]; stillMissing: number } {
  const cacheKey = (date: string, supplier: string) => `${date}|${supplier}`;
  const cacheByKey = new Map<
    string,
    { fetched_at: string; orders: number | null | undefined }
  >();
  for (const row of cached) {
    cacheByKey.set(cacheKey(row.sale_date, row.supplier), {
      fetched_at: row.fetched_at,
      orders: row.orders,
    });
  }

  const today = toStockholmDateString();
  const yesterday = addStockholmDays(today, -1);

  const needs = new Set<string>();

  for (const date of rangeDates) {
    let dateNeeds = false;
    for (const cfg of configs) {
      if (!cfg.enabled || !cfg.dashboardId) continue;
      const key = cacheKey(date, cfg.supplier);
      const hit = cacheByKey.get(key);
      if (
        !hit ||
        cacheNeedsRefresh(hit.fetched_at, date, hit.orders)
      ) {
        dateNeeds = true;
        break;
      }
    }
    if (!dateNeeds) continue;
    needs.add(date);
  }

  const priority = (d: string) => {
    if (d === today) return 0;
    if (d === yesterday) return 1;
    return 2;
  };

  const ordered = [...needs].sort((a, b) => {
    const pa = priority(a);
    const pb = priority(b);
    if (pa !== pb) return pa - pb;
    return a.localeCompare(b);
  });

  const toSync = ordered.slice(0, MAX_SALESYS_DAYS_PER_REQUEST);
  const remaining = Math.max(0, ordered.length - toSync.length);

  return { toSync, stillMissing: remaining };
}

export function countSubrequestsEstimate(daysToSync: number, supplierCount: number): number {
  const supplierOps = Math.max(1, supplierCount) * 2;
  // +1 GET dashboard definition per supplier
  return 4 + supplierCount + daysToSync * supplierOps;
}

export const WORKER_SUBREQUEST_SOFT_LIMIT = 45;

export async function syncSalesysDaysLimited(
  saleDates: string[],
  supabase: SupabaseClient,
  warnings: string[]
): Promise<SalesysSyncResult> {
  const configs = getSalesysSupplierDashboards().filter((c) => c.enabled && c.dashboardId);
  const daysSynced: string[] = [];
  const attempts: SalesysSyncAttempt[] = [];
  const today = toStockholmDateString();

  const readerNamesByConfig = new Map<string, Record<string, string>>();
  for (const cfg of configs) {
    const linkId = resolveSalesysLinkId(cfg);
    if (!linkId) continue;
    try {
      readerNamesByConfig.set(
        cfg.supplier,
        await fetchSalesysReaderNames(linkId, cfg.dashboardId)
      );
    } catch (err) {
      warnings.push(
        `${cfg.label}: kunne ikke lese dashboard-definisjon (${
          err instanceof Error ? err.message : String(err)
        })`
      );
    }
  }

  for (const saleDate of saleDates) {
    if (saleDate === today) {
      warnings.push(
        `${saleDate}: dagens salg caches ikke (fortsatt i endring) — vises fra Supabase etter midnatt.`
      );
      continue;
    }
    const { after, before } = stockholmDayIsoBounds(saleDate);
    let anySupplier = false;

    for (const cfg of configs) {
      const linkId = resolveSalesysLinkId(cfg);
      if (!linkId) {
        warnings.push(`${cfg.label}: saknar link-id (${cfg.linkIdEnv})`);
        continue;
      }

      const attempt: SalesysSyncAttempt = {
        date: saleDate,
        supplier: cfg.supplier,
        foundBruttosalg: false,
        parsedOrders: 0,
        saved: false,
      };

      try {
        const payload = await fetchSalesysDayResults(
          linkId,
          cfg.dashboardId,
          after,
          before
        );
        const parsed = parseSalesysBruttosalgResults(payload, {
          readerNames: readerNamesByConfig.get(cfg.supplier),
        });
        attempt.foundBruttosalg = parsed.foundBruttosalg;
        attempt.parsedOrders = parsed.grossOrders;

        if (!parsed.foundBruttosalg) {
          warnings.push(
            `${cfg.label} ${saleDate}: fant ikke Bruttosalg i SaleSys-svar (flisnavn: ${parsed.tileNamesSample.slice(0, 5).join(', ') || 'ingen'})`
          );
          attempts.push(attempt);
          continue;
        }

        const fetchedAt = new Date().toISOString();
        const rows = [
          {
            sale_date: saleDate,
            supplier: cfg.supplier,
            product: TOTAL_PRODUCT,
            orders: parsed.grossOrders,
            fetched_at: fetchedAt,
          },
          ...parsed.products.map((p) => ({
            sale_date: saleDate,
            supplier: cfg.supplier,
            product: p.product,
            orders: p.orders,
            fetched_at: fetchedAt,
          })),
        ];

        const result = await upsertSalesRows(supabase, rows);
        if (result.error) {
          attempt.errorCode = 'upsert_failed';
          warnings.push(`${cfg.label} ${saleDate}: ${result.error}`);
        } else {
          attempt.saved = true;
          anySupplier = true;
        }
      } catch (err) {
        attempt.errorCode = 'fetch_failed';
        warnings.push(
          `${cfg.label} ${saleDate}: ${err instanceof Error ? err.message : String(err)}`
        );
      }

      attempts.push(attempt);
    }

    if (anySupplier) daysSynced.push(saleDate);
  }

  return { daysSynced, daysStillMissing: 0, attempts };
}