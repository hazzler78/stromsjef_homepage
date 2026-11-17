import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  readSupabaseServiceRoleKey,
  readSupabaseUrl,
} from '@/lib/runtimeEnv';

/** Same pattern as working admin routes — env read inside the request, no extra headers. */
export function getSupabaseServerClient(): SupabaseClient {
  const url = readSupabaseUrl();
  const key = readSupabaseServiceRoleKey();
  if (!url || !key) {
    throw new Error('Supabase credentials are not configured');
  }
  return createClient(url, key);
}