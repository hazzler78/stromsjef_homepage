/** Map postal_code_searches.clicked_supplier free text to config supplier slug. */
export function supplierTextToSlug(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const n = raw.trim().toLowerCase();
  if (!n) return null;
  if (n.includes('kilden')) return 'kilden-kraft';
  if (n.includes('elify')) return 'elify-norge';
  return n.replace(/\s+/g, '-');
}