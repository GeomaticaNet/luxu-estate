import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: "Lead ID is required" }, { status: 400 });
    }

    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Atomic assign: only succeeds if assigned_to is still null
    const { data, error } = await supabase
      .from("contact_leads")
      .update({ assigned_to: user.id, assigned_at: new Date().toISOString() })
      .eq("id", id)
      .is("assigned_to", null)
      .select("id, assigned_to")
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "Lead was already taken by another agent", alreadyTaken: true },
        { status: 409 }
      );
    }

    // Fetch the assigned user's name for response
    const { data: assignee } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("user_id", user.id)
      .single();

    return NextResponse.json({ success: true, assigned_to: user.id });
  } catch (err) {
    console.error("Assign lead error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
