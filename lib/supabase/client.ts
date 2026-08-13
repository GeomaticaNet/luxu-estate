import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

// Single browser client shared across the whole app.
// Creating one client per component caused concurrent session inits and
// token-refresh races (several instances trying to use the same refresh
// token), which left `auth.updateUser/getUser` requests hanging for seconds.
let client: SupabaseClient | null = null;

export function createClient() {
  if (!client) {
    client = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return client;
}
