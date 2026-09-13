"use server";

import { createServerClient } from "@/lib/supabase/server";

export async function signOutAction() {
  const supabase = await createServerClient();
  await supabase.auth.signOut();
  // Don't redirect here — the client handles navigation with a hard reload
}
