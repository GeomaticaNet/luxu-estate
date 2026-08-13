import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const { leadId, body, images } = await req.json();

    if (!leadId || !body?.trim()) {
      return NextResponse.json({ error: "leadId and body are required" }, { status: 400 });
    }

    const imageList: string[] = Array.isArray(images)
      ? images.filter((url): url is string => typeof url === "string" && url.includes("/storage/v1/object/public/leads/")).slice(0, 5)
      : [];

    const supabase = await createServerClient();

    // Only the lead owner can reply (RLS also enforces this)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: lead, error: leadError } = await supabase
      .from("contact_leads")
      .select("user_id")
      .eq("id", leadId)
      .maybeSingle();

    if (leadError || !lead || lead.user_id !== user.id) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    const { error: insertError } = await supabase.from("lead_messages").insert({
      lead_id: leadId,
      sender_type: "user",
      sender_id: user.id,
      body: body.trim(),
      images: imageList,
      is_read: false,
    });

    if (insertError) {
      console.error("Error inserting user reply:", insertError);
      return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
    }

    // The lead is now considered read/contacted again
    await supabase
      .from("contact_leads")
      .update({ status: "read", replied_at: new Date().toISOString() })
      .eq("id", leadId);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("User reply error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
