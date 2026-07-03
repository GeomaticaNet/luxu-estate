import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, message, property_id, property_title, lead_type, preferred_date } = body;

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

    const supabase = await createServerClient();

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
