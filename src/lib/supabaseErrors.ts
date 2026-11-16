/** Returns true when PostgREST/Supabase reports a missing relation. */
export function isMissingTableError(err: { code?: string; message?: string } | null): boolean {
  if (!err) return false;
  if (err.code === '42P01' || err.code === 'PGRST205') return true;
  const msg = (err.message ?? '').toLowerCase();
  return msg.includes('does not exist') && msg.includes('relation');
}