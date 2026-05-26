import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { propertyId, active } = body;

    if (!propertyId) {
      return NextResponse.json({ error: "Missing propertyId" }, { status: 400 });
    }

    const supabase = await createServerClient();
    
    const { error } = await supabase
      .from("properties")
      .update({ active })
      .eq("id", propertyId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
