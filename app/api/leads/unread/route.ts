import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET(_req: NextRequest) {
  try {
    const supabase = await createServerClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ count: 0 });
    }

    // My lead ids
    const { data: leads } = await supabase
      .from("contact_leads")
      .select("id")
      .eq("user_id", user.id);

    const leadIds = (leads || []).map((l) => l.id);

    if (leadIds.length === 0) {
      return NextResponse.json({ count: 0 });
    }

    const { count } = await supabase
      .from("lead_messages")
      .select("*", { count: "exact", head: true })
      .eq("sender_type", "agent")
      .eq("is_read", false)
      .in("lead_id", leadIds);

    return NextResponse.json({ count: count || 0 });
  } catch (err) {
    console.error("Unread count error:", err);
    return NextResponse.json({ count: 0 });
  }
}
