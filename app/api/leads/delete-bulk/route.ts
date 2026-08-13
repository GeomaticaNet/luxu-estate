import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const { leadIds } = await req.json();

    if (!Array.isArray(leadIds) || leadIds.length === 0) {
      return NextResponse.json({ error: "leadIds must be a non-empty array" }, { status: 400 });
    }

    const supabase = await createServerClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: userRole } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();
    const roles: string[] = userRole?.role ?? [];
    const isAdmin = roles.includes("admin");

    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // lead_messages cascade-deletes via FK
    const { error } = await supabase
      .from("contact_leads")
      .delete()
      .in("id", leadIds);

    if (error) {
      console.error("Bulk delete error:", error);
      return NextResponse.json({ error: "Failed to delete chats" }, { status: 500 });
    }

    return NextResponse.json({ success: true, deleted: leadIds.length });
  } catch (err) {
    console.error("Bulk delete error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}