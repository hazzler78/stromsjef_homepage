import { createClient, SupabaseClient } from '@supabase/supabase-js';

function sanitizeEnv(value: string | undefined): string | undefined {
  if (!value) return value;
  const trimmed = value.trim();
  return trimmed.replace(/^"|"$/g, '');
}

export function getSupabaseServerClient(): SupabaseClient {
  const url = sanitizeEnv(process.env.SUPABASE_URL);
  const key = sanitizeEnv(process.env.SUPABASE_SERVICE_ROLE_KEY);
  if (!url || !key) {
    throw new Error('Supabase credentials are not configured');
  }
  return createClient(url, key);
}


