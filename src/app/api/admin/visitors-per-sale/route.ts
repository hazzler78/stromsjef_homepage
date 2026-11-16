import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/adminAuth';
import { fetchCloudflareDailyVisitors } from '@/lib/cloudflareZoneAnalytics';
import {
  defaultVisitorsPerSaleRange,
  stockholmDateRange,
  stockholmDayIsoBounds,
} from '@/lib/stockholmDates';
import {
  fetchSalesysDayResults,
  parseSalesysBruttosalgResults,
  resolveSalesysLinkId,
  SALESYS_SUPPLIER_DASHBOARDS,
} from '@/lib/salesysDashboard';
import { getSupabaseServerClient } from '@/lib/supabaseServer';
import { supplierTextToSlug } from '@/lib/supplierSlug';
import { buildVisitorsPerSaleMockResponse } from '@/lib/visitorsPerSaleMock';

export const runtime = 'edge';

const START_HER_PATHS = ['/start-her', '/starta-har'];
const TOTAL_PRODUCT = '__total__';
const CACHE_MAX_AGE_MS = 6 * 60 * 60 * 1000;

type DailyRow = {
  date: string;
  edgeUniques: number;
  pageViews: number;
  startHerSessions: number;
  planClicks: number;
  supplierClicks: Record<string, number>;
  salesBySupplier: Record<string, number>;
  totalSales: number;
};

async function syncSalesysForDay(
  saleDate: string,
  warnings: string[]
): Promise<void> {
  const supabase = getSupabaseServerClient();
  const { after, before } = stockholmDayIsoBounds(saleDate);

  for (const cfg of SALESYS_SUPPLIER_DASHBOARDS) {
    if (!cfg.enabled || !cfg.dashboardId) continue;
    const linkId = resolveSalesysLinkId(cfg);
    if (!linkId) {
      warnings.push(`${cfg.label}: saknar link-id (${cfg.linkIdEnv})`);
      continue;
    }

    const { data: existing } = await supabase
      .from('salesys_daily_sales')
      .select('fetched_at')
      .eq('sale_date', saleDate)
      .eq('supplier', cfg.supplier)
      .eq('product', TOTAL_PRODUCT)
      .maybeSingle();

    const fresh =
      existing?.fetched_at &&
      Date.now() - new Date(existing.fetched_at).getTime() < CACHE_MAX_AGE_MS;
    if (fresh) continue;

    try {
      const payload = await fetchSalesysDayResults(
        linkId,
        cfg.dashboardId,
        after,
        before
      );
      const parsed = parseSalesysBruttosalgResults(payload);
      const rows = [
        {
          sale_date: saleDate,
          supplier: cfg.supplier,
          product: TOTAL_PRODUCT,
          orders: parsed.grossOrders,
          fetched_at: new Date().toISOString(),
        },
        ...parsed.products.map((p) => ({
          sale_date: saleDate,
          supplier: cfg.supplier,
          product: p.product,
          orders: p.orders,
          fetched_at: new Date().toISOString(),
        })),
      ];

      const { error } = await supabase.from('salesys_daily_sales').upsert(rows, {
        onConflict: 'sale_date,supplier,product',
      });
      if (error) warnings.push(`${cfg.label} ${saleDate}: ${error.message}`);
    } catch (err) {
      warnings.push(
        `${cfg.label} ${saleDate}: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }
}

function emptyDaily(date: string): DailyRow {
  return {
    date,
    edgeUniques: 0,
    pageViews: 0,
    startHerSessions: 0,
    planClicks: 0,
    supplierClicks: {},
    salesBySupplier: {},
    totalSales: 0,
  };
}

export async function GET(req: NextRequest) {
  const authError = verifyAdminRequest(req);
  if (authError) return authError;

  const url = req.nextUrl;
  const defaults = defaultVisitorsPerSaleRange();
  const from = url.searchParams.get('from') || defaults.from;
  const to = url.searchParams.get('to') || defaults.to;

  if (url.searchParams.get('mock') === '1') {
    return NextResponse.json(buildVisitorsPerSaleMockResponse(from, to));
  }

  const warnings: string[] = [];
  const dates = stockholmDateRange(from, to);

  for (const d of dates) {
    await syncSalesysForDay(d, warnings);
  }

  const cf = await fetchCloudflareDailyVisitors(from, to);
  if (!cf.configured) {
    warnings.push(
      'Cloudflare Analytics ej konfigurerad (sätt CF_ANALYTICS_API_TOKEN och CF_ZONE_ID).'
    );
  } else if (cf.error) {
    warnings.push(`Cloudflare Analytics: ${cf.error}`);
  }

  const supabase = getSupabaseServerClient();

  const fromUtc = stockholmDayIsoBounds(from).after;
  const toUtc = stockholmDayIsoBounds(to).before;

  const { data: searches, error: searchErr } = await supabase
    .from('postal_code_searches')
    .select(
      'created_at, session_id, page_path, clicked_plan, clicked_supplier'
    )
    .gte('created_at', fromUtc)
    .lte('created_at', toUtc);

  if (searchErr) {
    warnings.push(`postal_code_searches: ${searchErr.message}`);
  }

  const { data: salesRows, error: salesErr } = await supabase
    .from('salesys_daily_sales')
    .select('sale_date, supplier, product, orders')
    .gte('sale_date', from)
    .lte('sale_date', to)
    .eq('product', TOTAL_PRODUCT);

  if (salesErr) {
    warnings.push(`salesys_daily_sales: ${salesErr.message}`);
  }

  const dailyMap = new Map<string, DailyRow>();
  for (const date of dates) {
    dailyMap.set(date, emptyDaily(date));
  }

  for (const row of cf.rows) {
    const day = dailyMap.get(row.date);
    if (day) {
      day.edgeUniques = row.uniques;
      day.pageViews = row.pageViews;
    }
  }

  const sessionSets = new Map<string, Set<string>>();
  for (const s of searches ?? []) {
    const path = s.page_path ?? '';
    const isStartHer = START_HER_PATHS.some(
      (p) => path === p || path.startsWith(`${p}?`)
    );
    if (!isStartHer) continue;

    const day = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Europe/Stockholm',
    }).format(new Date(s.created_at));
    const dayRow = dailyMap.get(day);
    if (!dayRow) continue;

    if (s.clicked_plan) dayRow.planClicks += 1;
    const slug = supplierTextToSlug(s.clicked_supplier);
    if (slug) {
      dayRow.supplierClicks[slug] = (dayRow.supplierClicks[slug] ?? 0) + 1;
    }

    const sid = s.session_id || `row-${s.created_at}`;
    const key = `${day}`;
    if (!sessionSets.has(key)) sessionSets.set(key, new Set());
    sessionSets.get(key)!.add(sid);
  }

  for (const [day, set] of sessionSets) {
    const dayRow = dailyMap.get(day);
    if (dayRow) dayRow.startHerSessions = set.size;
  }

  for (const row of salesRows ?? []) {
    const day = row.sale_date as string;
    const dayRow = dailyMap.get(day);
    if (!dayRow) continue;
    const supplier = row.supplier as string;
    const orders = Number(row.orders) || 0;
    dayRow.salesBySupplier[supplier] =
      (dayRow.salesBySupplier[supplier] ?? 0) + orders;
    dayRow.totalSales += orders;
  }

  const daily = dates.map((d) => dailyMap.get(d)!);

  const sum = (fn: (d: DailyRow) => number) =>
    daily.reduce((acc, d) => acc + fn(d), 0);

  const totalVisitors = sum((d) => d.edgeUniques);
  const totalSessions = sum((d) => d.startHerSessions);
  const totalSales = sum((d) => d.totalSales);

  const configuredSuppliers = SALESYS_SUPPLIER_DASHBOARDS.filter(
    (c) => c.enabled
  ).map((c) => c.supplier);

  const supplierKpis = configuredSuppliers.map((slug) => {
    const cfg = SALESYS_SUPPLIER_DASHBOARDS.find((c) => c.supplier === slug)!;
    const clicks = sum((d) => d.supplierClicks[slug] ?? 0);
    const sales = sum((d) => d.salesBySupplier[slug] ?? 0);
    return {
      supplier: slug,
      label: cfg.label,
      clicks,
      sales,
      clicksPerSale: sales > 0 ? clicks / sales : null,
    };
  });

  return NextResponse.json({
    from,
    to,
    timezone: 'Europe/Stockholm',
    mock: false,
    kpis: {
      visitorsPerSale: totalSales > 0 ? totalVisitors / totalSales : null,
      startHerSessionsPerSale:
        totalSales > 0 ? totalSessions / totalSales : null,
      supplier: supplierKpis,
    },
    totals: {
      visitors: totalVisitors,
      sessions: totalSessions,
      planClicks: sum((d) => d.planClicks),
      sales: totalSales,
    },
    daily,
    visitorsMeta: {
      label: 'Edge unique visitors',
      utcDays: true,
      includesBots: true,
      note: 'Cloudflare httpRequests1dGroups räknar UTC-dagar och inkluderar en del bottrafik.',
    },
    salesCaveat:
      'Salgsiffror gäller endast konfigurerade SaleSys-dashboards (Kilden Kraft / ev. Elify Norge).',
    configuredSuppliers,
    warnings,
  });
}