"use server";

import { createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function togglePropertyActive(formData: FormData) {
  const propertyId = formData.get("propertyId") as string;
  const currentActive = formData.get("currentActive") === "true";
  const currentPage = formData.get("currentPage") as string;
  
  if (!propertyId) return;

  const supabase = await createServerClient();
  
  const { error } = await supabase
    .from("properties")
    .update({ active: !currentActive })
    .eq("id", propertyId);

  if (error) {
    console.error("DB error:", error);
    return;
  }

  console.log("Redirecting to page:", currentPage);
  redirect(`/admin/properties?page=${currentPage || "1"}`);
}
