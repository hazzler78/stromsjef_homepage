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

export type ParsedSalesysDay = {
  grossOrders: number;
  products: { product: string; orders: number }[];
  foundBruttosalg: boolean;
  tileNamesSample: string[];
};

function normalizeName(value: unknown): string {
  if (typeof value !== 'string') return '';
  return value.trim().toLowerCase();
}

function isBruttosalgName(name: string): boolean {
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

function readOrderCount(node: unknown): number | null {
  if (!node || typeof node !== 'object') return null;
  const rec = node as Record<string, unknown>;
  const candidates = [
    rec.value,
    rec.count,
    rec.total,
    rec.orders,
    rec.orderCount,
    (rec.data as Record<string, unknown> | undefined)?.value,
    (rec.data as Record<string, unknown> | undefined)?.count,
    (rec.result as Record<string, unknown> | undefined)?.value,
  ];
  for (const c of candidates) {
    if (typeof c === 'number' && Number.isFinite(c)) return Math.round(c);
    if (typeof c === 'string' && c.trim() !== '' && Number.isFinite(Number(c))) {
      return Math.round(Number(c));
    }
  }
  return null;
}

function readName(node: unknown): string {
  if (!node || typeof node !== 'object') return '';
  const rec = node as Record<string, unknown>;
  const raw =
    rec.name ??
    rec.title ??
    rec.header ??
    rec.label ??
    rec.productName ??
    rec.displayName;
  return typeof raw === 'string' ? raw.trim() : '';
}

function childNodes(node: unknown): unknown[] {
  if (!node || typeof node !== 'object') return [];
  const rec = node as Record<string, unknown>;
  const keys = [
    'children',
    'subTiles',
    'subtiles',
    'tiles',
    'widgets',
    'items',
    'products',
    'rows',
    'breakdown',
  ];
  const out: unknown[] = [];
  for (const k of keys) {
    const v = rec[k];
    if (Array.isArray(v)) out.push(...v);
  }
  if (Array.isArray(rec.results)) out.push(...rec.results);
  return out;
}

/** Collect tile/widget names for safe diagnostics (no values). */
export function collectSalesysTileNames(payload: unknown, max = 20): string[] {
  const names: string[] = [];
  const seen = new Set<string>();

  const walk = (node: unknown): void => {
    if (!node || typeof node !== 'object' || names.length >= max) return;
    if (Array.isArray(node)) {
      for (const item of node) walk(item);
      return;
    }
    const name = readName(node);
    if (name) {
      const key = name.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        names.push(name);
      }
    }
    for (const child of childNodes(node)) walk(child);
    const rec = node as Record<string, unknown>;
    for (const value of Object.values(rec)) {
      if (value && typeof value === 'object') walk(value);
    }
  };

  walk(payload);
  return names;
}

function findBruttosalgNode(payload: unknown): Record<string, unknown> | null {
  const walk = (node: unknown): Record<string, unknown> | null => {
    if (!node || typeof node !== 'object') return null;
    if (Array.isArray(node)) {
      for (const item of node) {
        const found = walk(item);
        if (found) return found;
      }
      return null;
    }
    const rec = node as Record<string, unknown>;
    if (isBruttosalgName(readName(rec))) return rec;
    for (const child of childNodes(rec)) {
      const found = walk(child);
      if (found) return found;
    }
    return null;
  };
  return walk(payload);
}

/**
 * Parse dashboard POST /results JSON for Bruttosalg tile (+ product breakdown).
 */
export function parseSalesysBruttosalgResults(payload: unknown): ParsedSalesysDay {
  const products: { product: string; orders: number }[] = [];
  const bruttoNode = findBruttosalgNode(payload);
  let grossOrders = bruttoNode ? readOrderCount(bruttoNode) : null;

  if (bruttoNode) {
    const seen = new Set<string>();
    for (const child of childNodes(bruttoNode)) {
      const childName = readName(child);
      const childCount = readOrderCount(child);
      if (!childName || isBruttosalgName(childName) || childCount === null) continue;
      const key = childName.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      products.push({ product: childName, orders: childCount });
    }
  }

  if (grossOrders === null && products.length > 0) {
    grossOrders = products.reduce((s, p) => s + p.orders, 0);
  }

  return {
    grossOrders: grossOrders ?? 0,
    products,
    foundBruttosalg: Boolean(bruttoNode),
    tileNamesSample: collectSalesysTileNames(payload),
  };
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