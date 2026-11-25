/**
 * Make a partner or order URL safe to use as an href.
 * Scheme-less values such as "kildenkraft.no/..." are otherwise resolved
 * relative to stromsjef.no and 404.
 */
export function normalizeExternalUrl(value: string | null | undefined): string {
  const trimmed = (value ?? '').trim();
  if (!trimmed) return '';

  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith('http://') ||
    lower.startsWith('https://') ||
    trimmed.startsWith('/') ||
    lower.startsWith('mailto:') ||
    lower.startsWith('tel:')
  ) {
    return trimmed;
  }

  return `https://${trimmed}`;
}
