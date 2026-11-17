import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { readRuntimeEnv } from '@/lib/runtimeEnv';

export function getSupabaseServerClient(): SupabaseClient {
  const url = readRuntimeEnv('SUPABASE_URL') ?? readRuntimeEnv('NEXT_PUBLIC_SUPABASE_URL');
  const key = readRuntimeEnv('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !key) {
    throw new Error('Supabase credentials are not configured');
  }
  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
    },
  });
}