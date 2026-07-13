"use server";

import { createServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

export async function deleteUser(userId: string) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { autoRefreshToken: false, persistSession: false },
    }
  );

  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

  if (error) {
    console.error('Error deleting user:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/users');
  return { success: true };
}

export async function updateUserRole(userId: string, newRole: string) {
  const supabase = await createServerClient();
  
  const { error } = await supabase
    .rpc('update_user_role', {
      p_user_id: userId,
      p_role: newRole,
    });

  if (error) {
    console.error('Error updating role:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/users');
  return { success: true };
}

export async function toggleUserActive(userId: string, active: boolean) {
  const supabase = await createServerClient();
  
  const { error } = await supabase
    .rpc('toggle_user_active', {
      p_user_id: userId,
      p_active: active,
    });

  if (error) {
    console.error('Error toggling user active:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/users');
  return { success: true };
}
