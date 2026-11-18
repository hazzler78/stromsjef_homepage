import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  isSupabaseServerKey,
  readSupabaseServiceRoleKey,
  readSupabaseUrl,
} from '@/lib/runtimeEnv';
import { normalizeSupabaseProjectUrl } from '@/lib/supabaseUrl';

/** Server admin client — legacy `service_role` JWT or new `sb_secret_` key. */
export function getSupabaseServerClient(): SupabaseClient {
  const url = normalizeSupabaseProjectUrl(readSupabaseUrl());
  const key = readSupabaseServiceRoleKey();
  if (!url || !key) {
    throw new Error('Supabase credentials are not configured');
  }
  if (!isSupabaseServerKey(key)) {
    throw new Error('Supabase service role key is missing or invalid');
  }
  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}