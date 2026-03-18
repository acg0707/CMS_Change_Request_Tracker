import { createClient } from '@supabase/supabase-js';

/**
 * Server-only Supabase client with service role key. Bypasses RLS.
 * Use only in API routes for operations that must run as admin (e.g. ticket update by clinic reopen).
 * Requires env SUPABASE_SERVICE_ROLE_KEY.
 */
export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY (and NEXT_PUBLIC_SUPABASE_URL) required for service client');
  }
  return createClient(url, key);
}
