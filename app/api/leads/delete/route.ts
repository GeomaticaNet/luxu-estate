import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const { leadId } = await req.json();

    if (!leadId) {
      return NextResponse.json({ error: "leadId is required" }, { status: 400 });
    }

    const supabase = await createServerClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only the lead owner or an admin can delete a chat
    const { data: userRole } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();
    const roles: string[] = userRole?.role ?? [];
    const isAdmin = roles.includes("admin");

    const { data: lead } = await supabase
      .from("contact_leads")
      .select("user_id")
      .eq("id", leadId)
      .maybeSingle();

    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    const isOwner = lead.user_id === user.id;
    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // lead_messages cascade-deletes via FK
    const { error } = await supabase
      .from("contact_leads")
      .delete()
      .eq("id", leadId);

    if (error) {
      console.error("Error deleting lead:", error);
      return NextResponse.json({ error: "Failed to delete chat" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Delete lead error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
