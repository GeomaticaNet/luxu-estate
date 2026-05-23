"use server";

import { createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

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
