"use server";

import { createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function togglePropertyActive(formData: FormData) {
  const propertyId = formData.get("propertyId") as string;
  const currentActive = formData.get("currentActive") === "true";
  
  if (!propertyId) {
    throw new Error("Property ID is required");
  }

  const supabase = await createServerClient();
  
  const { error } = await supabase
    .from("properties")
    .update({ active: !currentActive })
    .eq("id", propertyId);

  if (error) {
    console.error("Error toggling property active status:", error);
    throw new Error(`Failed to update property status: ${error.message}`);
  }

  revalidatePath("/admin/properties");
  return { success: true, active: !currentActive };
}
