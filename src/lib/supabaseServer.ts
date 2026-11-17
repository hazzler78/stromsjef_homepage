import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  readSupabaseServiceRoleKey,
  readSupabaseUrl,
  supabaseJwtRole,
} from '@/lib/runtimeEnv';

/** Same pattern as working admin routes — service_role JWT only. */
export function getSupabaseServerClient(): SupabaseClient {
  const url = readSupabaseUrl();
  const key = readSupabaseServiceRoleKey();
  if (!url || !key) {
    throw new Error('Supabase credentials are not configured');
  }
  if (supabaseJwtRole(key) !== 'service_role') {
    throw new Error('Supabase service role key is missing or invalid');
  }
  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}