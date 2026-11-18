/** Strip accidental REST path suffixes from Supabase project URL env vars. */
export function normalizeSupabaseProjectUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;
  const trimmed = url.trim().replace(/^"|"$/g, '');
  return trimmed.replace(/\/rest\/v1\/?$/i, '').replace(/\/$/, '');
}