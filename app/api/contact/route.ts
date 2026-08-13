import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, message, property_id, property_title, lead_type, preferred_date, images } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required" },
        { status: 400 }
      );
    }

    if (!["sell", "contact", "visit"].includes(lead_type)) {
      return NextResponse.json(
        { error: "Invalid lead type" },
        { status: 400 }
      );
    }

    // Validate the uploaded image URLs (must live in the public 'leads' bucket)
    const imageList: string[] = Array.isArray(images)
      ? images.filter((url): url is string => typeof url === "string" && url.includes("/storage/v1/object/public/leads/")).slice(0, 5)
      : [];

    const supabase = await createServerClient();

    // Link the lead to the logged-in user when present (they can then see
    // and reply from /messages). Anonymous property inquiries remain allowed.
    const { data: { user } } = await supabase.auth.getUser();

    // Auto-assign property-related leads (contact/visit) to the property's agent.
    // 'sell' leads are shared with every agent + admin, so they stay unassigned.
    let assignedTo: string | null = null;
    if (lead_type !== "sell" && property_id) {
      const { data: prop } = await supabase
        .from("properties")
        .select("agent_id")
        .eq("id", property_id)
        .maybeSingle();
      if (prop?.agent_id) {
        assignedTo = prop.agent_id;
      }
    }

    const { error } = await supabase.from("contact_leads").insert({
      name,
      email,
      phone: phone || null,
      message,
      property_id: property_id || null,
      property_title: property_title || null,
      lead_type,
      preferred_date: preferred_date || null,
      status: "new",
      assigned_to: assignedTo,
      images: imageList,
      user_id: user?.id || null,
    });

    if (error) {
      console.error("Error inserting lead:", error);
      return NextResponse.json(
        { error: "Failed to save message" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Contact API error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
