/**
 * SaleSys public dashboard API (statistik.salesys.se).
 * linkId stays server-side only — never import this from client components.
 */

import { readRuntimeEnv } from '@/lib/runtimeEnv';

export type SalesysSupplierConfig = {
  supplier: string;
  label: string;
  dashboardId: string;
  /** Env var name that holds the dashboard link id */
  linkIdEnv: string;
  enabled: boolean;
};

export function getSalesysSupplierDashboards(): SalesysSupplierConfig[] {
  return [
    {
      supplier: 'kilden-kraft',
      label: 'Kilden Kraft',
      dashboardId:
        readRuntimeEnv('SALESYS_DASHBOARD_ID_KILDEN_KRAFT') ||
        '671b4e2f7936c320a601c078',
      linkIdEnv: 'SALESYS_DASHBOARD_LINK_ID',
      enabled: true,
    },
    {
      supplier: 'elify-norge',
      label: 'Elify Norge',
      dashboardId: readRuntimeEnv('SALESYS_DASHBOARD_ID_ELIFY') || '',
      linkIdEnv: 'SALESYS_DASHBOARD_LINK_ID_ELIFY',
      enabled: Boolean(readRuntimeEnv('SALESYS_DASHBOARD_LINK_ID_ELIFY')),
    },
  ];
}

const SALESYS_BASE = 'https://statistik.salesys.se';

/** Kilden Kraft dashboard — Bruttosalg reader (from GET definition). */
export const KILDEN_KRAFT_BRUTTO_READER_ID = '679234030719d33e3566dc6c';

export type SalesysReaderRow = {
  readerId: string;
  intervals?: { value?: number; intervalStart?: string }[];
  groupedId?: string;
};

export type ParsedSalesysDay = {
  grossOrders: number;
  products: { product: string; orders: number }[];
  foundBruttosalg: boolean;
  tileNamesSample: string[];
};

export type ParseSalesysOptions = {
  readerNames?: Record<string, string>;
  bruttoReaderId?: string;
};

function normalizeName(value: unknown): string {
  if (typeof value !== 'string') return '';
  return value.trim().toLowerCase();
}

export function isBruttosalgName(name: string): boolean {
  const n = normalizeName(name);
  return (
    n === 'bruttosalg' ||
    n.includes('bruttosalg') ||
    n.includes('brutto salg') ||
    n.includes('bruttoförsäljning') ||
    n === 'brutto' ||
    n.includes('gross sales') ||
    n.includes('gross order')
  );
}

export function resolveBruttosalgReaderId(
  readerNames: Record<string, string> | undefined,
  explicitId?: string
): string | undefined {
  if (explicitId) return explicitId;
  if (readerNames) {
    for (const [id, name] of Object.entries(readerNames)) {
      if (isBruttosalgName(name)) return id;
    }
  }
  return KILDEN_KRAFT_BRUTTO_READER_ID;
}

function sumIntervalValues(row: SalesysReaderRow): number | null {
  const intervals = row.intervals;
  if (!Array.isArray(intervals) || intervals.length === 0) return null;
  let sum = 0;
  let any = false;
  for (const iv of intervals) {
    if (typeof iv?.value === 'number' && Number.isFinite(iv.value)) {
      sum += iv.value;
      any = true;
    }
  }
  return any ? Math.round(sum) : null;
}

function isResultsArray(payload: unknown): payload is SalesysReaderRow[] {
  return (
    Array.isArray(payload) &&
    payload.length > 0 &&
    typeof payload[0] === 'object' &&
    payload[0] !== null &&
    'readerId' in (payload[0] as object)
  );
}

/**
 * Parse POST /results JSON (array of readerId + intervals) for Bruttosalg.
 */
export function parseSalesysBruttosalgResults(
  payload: unknown,
  options?: ParseSalesysOptions
): ParsedSalesysDay {
  const readerNames = options?.readerNames ?? {};
  const bruttoId = resolveBruttosalgReaderId(readerNames, options?.bruttoReaderId);

  if (Array.isArray(payload) && payload.length === 0) {
    return {
      grossOrders: 0,
      products: [],
      foundBruttosalg: true,
      tileNamesSample: [],
    };
  }

  if (!isResultsArray(payload)) {
    return {
      grossOrders: 0,
      products: [],
      foundBruttosalg: false,
      tileNamesSample: [],
    };
  }

  const bruttoRow = bruttoId
    ? payload.find((r) => r.readerId === bruttoId)
    : undefined;
  const grossOrders = bruttoRow ? sumIntervalValues(bruttoRow) : null;
  const foundBruttosalg =
    Boolean(bruttoRow) && grossOrders !== null;

  const products: { product: string; orders: number }[] = [];
  const seen = new Set<string>();

  for (const row of payload) {
    if (bruttoId && row.readerId === bruttoId) continue;
    const count = sumIntervalValues(row);
    if (count === null) continue;
    const label = readerNames[row.readerId] ?? row.readerId;
    if (isBruttosalgName(label)) continue;
    const key = label.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    products.push({ product: label, orders: count });
  }

  const tileNamesSample = payload
    .map((r) => readerNames[r.readerId] ?? r.readerId)
    .slice(0, 20);

  return {
    grossOrders: foundBruttosalg ? grossOrders! : 0,
    products: foundBruttosalg ? products : [],
    foundBruttosalg,
    tileNamesSample,
  };
}

export async function fetchSalesysReaderNames(
  linkId: string,
  dashboardId: string
): Promise<Record<string, string>> {
  const url = `${SALESYS_BASE}/api/users/dashboard-links-v1/${encodeURIComponent(linkId)}`;
  const res = await fetch(url, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) {
    throw new Error(`SaleSys definition ${res.status}`);
  }
  const json = (await res.json()) as {
    dashboards?: { id: string; readers?: { id: string; name: string }[] }[];
  };
  const dashboard = json.dashboards?.find((d) => d.id === dashboardId);
  const map: Record<string, string> = {};
  for (const reader of dashboard?.readers ?? []) {
    if (reader.id && reader.name) map[reader.id] = reader.name;
  }
  return map;
}

export function resolveSalesysLinkId(config: SalesysSupplierConfig): string | null {
  return readRuntimeEnv(config.linkIdEnv) ?? null;
}

export async function fetchSalesysDayResults(
  linkId: string,
  dashboardId: string,
  after: string,
  before: string
): Promise<unknown> {
  const url = `${SALESYS_BASE}/api/users/dashboard-links-v1/${encodeURIComponent(linkId)}/${encodeURIComponent(dashboardId)}/results`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ filters: { after, before } }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`SaleSys ${res.status}: ${text.slice(0, 200)}`);
  }
  return res.json();
}