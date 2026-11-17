import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/adminAuth';
import { fetchCloudflareDailyVisitors } from '@/lib/cloudflareZoneAnalytics';
import {
  defaultVisitorsPerSaleRange,
  stockholmDateRange,
  stockholmDayIsoBounds,
} from '@/lib/stockholmDates';
import { getSalesysSupplierDashboards } from '@/lib/salesysDashboard';
import { getSupabaseServerClient } from '@/lib/supabaseServer';
import { supplierTextToSlug } from '@/lib/supplierSlug';
import { buildVisitorsPerSaleMockResponse } from '@/lib/visitorsPerSaleMock';
import { buildEnvDiagnostics } from '@/lib/runtimeEnv';
import {
  countSubrequestsEstimate,
  pickDaysToSync,
  syncSalesysDaysLimited,
  TOTAL_PRODUCT,
  WORKER_SUBREQUEST_SOFT_LIMIT,
} from '@/lib/visitorsPerSaleSync';

export const runtime = 'edge';

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

type FunnelRpcRow = {
  day: string;
  start_her_sessions: number;
  plan_clicks: number;
  supplier_clicks: Record<string, number> | null;
};

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
  const supplierConfigs = getSalesysSupplierDashboards();
  const enabledSuppliers = supplierConfigs.filter((c) => c.enabled && c.dashboardId);

  let supabase;
  try {
    supabase = getSupabaseServerClient();
  } catch (err) {
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : 'Supabase not configured',
      },
      { status: 503 }
    );
  }

  const { data: cacheRows, error: cacheErr } = await supabase
    .from('salesys_daily_sales')
    .select('sale_date, supplier, fetched_at, orders')
    .gte('sale_date', from)
    .lte('sale_date', to)
    .eq('product', TOTAL_PRODUCT);

  if (cacheErr) {
    warnings.push(`salesys_daily_sales (cache): ${cacheErr.message}`);
  }

  const { toSync, stillMissing } = pickDaysToSync(
    dates,
    supplierConfigs,
    cacheRows ?? []
  );

  const syncResult = await syncSalesysDaysLimited(toSync, supabase, warnings);

  const cf = await fetchCloudflareDailyVisitors(from, to);
  if (!cf.configured) {
    warnings.push(
      'Cloudflare Analytics ej konfigurerad (sätt CF_ANALYTICS_API_TOKEN och CF_ZONE_ID).'
    );
  } else if (cf.error) {
    warnings.push(`Cloudflare Analytics: ${cf.error}`);
  }

  const fromUtc = stockholmDayIsoBounds(from).after;
  const toUtc = stockholmDayIsoBounds(to).before;

  const { data: funnelRows, error: funnelErr } = await supabase.rpc(
    'admin_start_her_funnel_daily',
    { p_from: fromUtc, p_to: toUtc }
  );

  if (funnelErr) {
    const msg = funnelErr.message ?? String(funnelErr);
    warnings.push(`postal_code_searches: ${msg}`);
    if (msg.toLowerCase().includes('admin_start_her_funnel_daily')) {
      warnings.push(
        'Kör migrasjon supabase/migrations/20261117103000_admin_start_her_funnel_daily_rpc.sql for aggregert funnel-data.'
      );
    }
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

  for (const row of (funnelRows ?? []) as FunnelRpcRow[]) {
    const day = row.day;
    const dayRow = dailyMap.get(day);
    if (!dayRow) continue;
    dayRow.startHerSessions = Number(row.start_her_sessions) || 0;
    dayRow.planClicks = Number(row.plan_clicks) || 0;
    const clicks = row.supplier_clicks ?? {};
    for (const [rawSupplier, count] of Object.entries(clicks)) {
      const slug = supplierTextToSlug(rawSupplier) ?? rawSupplier;
      dayRow.supplierClicks[slug] =
        (dayRow.supplierClicks[slug] ?? 0) + Number(count);
    }
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

  const configuredSuppliers = enabledSuppliers.map((c) => c.supplier);

  const supplierKpis = configuredSuppliers.map((slug) => {
    const cfg = supplierConfigs.find((c) => c.supplier === slug)!;
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

  const daysSyncedCount = syncResult.daysSynced.length;
  const subrequestsEstimate = countSubrequestsEstimate(
    toSync.length,
    enabledSuppliers.length
  );

  if (stillMissing > 0) {
    warnings.push(
      `SaleSys-cache: ${stillMissing} dag(er) mangler ennå — last siden på nytt for gradvis backfill (maks ${toSync.length} dag(er) hentet denne runden).`
    );
  }
  if (subrequestsEstimate > WORKER_SUBREQUEST_SOFT_LIMIT) {
    warnings.push(
      `Internt: estimerte ${subrequestsEstimate} subrequests (soft limit ${WORKER_SUBREQUEST_SOFT_LIMIT}).`
    );
  }

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
    backfill: {
      salesysDaysSyncedThisRequest: daysSyncedCount,
      salesysDaysQueuedThisRequest: toSync.length,
      salesysDaysRemainingEstimate: stillMissing,
      subrequestsEstimate,
    },
    salesysSync: {
      cacheRowsInRange: cacheRows?.length ?? 0,
      attempts: syncResult.attempts,
    },
    envDiagnostics: buildEnvDiagnostics(),
    warnings,
  });
}