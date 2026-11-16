import { addStockholmDays, toStockholmDateString } from '@/lib/stockholmDates';

export function buildVisitorsPerSaleMockResponse(from: string, to: string) {
  const daily: {
    date: string;
    edgeUniques: number;
    pageViews: number;
    startHerSessions: number;
    planClicks: number;
    supplierClicks: Record<string, number>;
    salesBySupplier: Record<string, number>;
    totalSales: number;
  }[] = [];

  let day = from;
  let i = 0;
  while (day <= to) {
    const uniques = 180 + (i % 5) * 12;
    const sales = i % 4 === 0 ? 2 : 1;
    daily.push({
      date: day,
      edgeUniques: uniques,
      pageViews: Math.round(uniques * 1.35),
      startHerSessions: Math.round(uniques * 0.42),
      planClicks: Math.round(uniques * 0.18),
      supplierClicks: { 'kilden-kraft': Math.round(uniques * 0.09) },
      salesBySupplier: { 'kilden-kraft': sales },
      totalSales: sales,
    });
    if (day === to) break;
    day = addStockholmDays(day, 1);
    i += 1;
  }

  const sum = (fn: (d: (typeof daily)[0]) => number) => daily.reduce((s, d) => s + fn(d), 0);
  const visitors = sum((d) => d.edgeUniques);
  const sessions = sum((d) => d.startHerSessions);
  const kildenClicks = sum((d) => d.supplierClicks['kilden-kraft'] ?? 0);
  const totalSales = sum((d) => d.totalSales);

  return {
    from,
    to,
    timezone: 'Europe/Stockholm',
    mock: true,
    kpis: {
      visitorsPerSale: totalSales > 0 ? visitors / totalSales : null,
      startHerSessionsPerSale: totalSales > 0 ? sessions / totalSales : null,
      supplier: [
        {
          supplier: 'kilden-kraft',
          label: 'Kilden Kraft',
          clicksPerSale:
            totalSales > 0 ? kildenClicks / sum((d) => d.salesBySupplier['kilden-kraft'] ?? 0) : null,
          clicks: kildenClicks,
          sales: sum((d) => d.salesBySupplier['kilden-kraft'] ?? 0),
        },
      ],
    },
    totals: { visitors, sessions, planClicks: sum((d) => d.planClicks), sales: totalSales },
    daily,
    visitorsMeta: {
      label: 'Edge unique visitors (mock)',
      utcDays: true,
      includesBots: true,
    },
    salesCaveat:
      'Salgsiffror gäller endast konfigurerade SaleSys-dashboards (Kilden Kraft / ev. Elify Norge).',
    configuredSuppliers: ['kilden-kraft'],
    warnings: [],
    generatedAt: toStockholmDateString(),
  };
}