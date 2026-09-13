import { cache } from "react";
import { createServerClient } from "@/lib/supabase/server";

export interface AdminAuth {
  user: {
    id: string;
    email: string | null;
    avatarUrl: string | null;
    fullName: string | null;
  } | null;
  isAdmin: boolean;
  canAccessAdmin: boolean;
}

/**
 * Returns cached admin auth data for the current request.
 * Uses React's `cache()` so multiple calls in the same request
 * only hit Supabase once.
 */
export const getAdminAuth = cache(async (): Promise<AdminAuth> => {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, isAdmin: false, canAccessAdmin: false };
  }

  const { data: userRole } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  const roles: string[] = userRole?.role ?? [];
  const isAdmin = roles.includes("admin");
  const canAccessAdmin = roles.includes("admin") || roles.includes("agent");

  return {
    user: {
      id: user.id,
      email: user.email ?? null,
      avatarUrl: user.user_metadata?.avatar_url ?? null,
      fullName: user.user_metadata?.full_name ?? null,
    },
    isAdmin,
    canAccessAdmin,
  };
});
