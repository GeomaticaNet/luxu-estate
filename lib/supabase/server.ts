import { createClient } from "@supabase/supabase-js";

/**
 * Supabase client for Server Components / Server Actions.
 * Uses the anon key — RLS controls access.
 */
export function createServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createClient(url, anonKey);
}
