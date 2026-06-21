import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

type ActionType = "toggle" | "forSale" | "forRent" | "sold" | "rented" | "toggleFeatured";

const actionMap: Record<ActionType, { type: string; active: boolean }> = {
  toggle: { type: "", active: true }, // special: toggle current active state only
  forSale: { type: "SALE", active: true },
  forRent: { type: "RENT", active: true },
  sold: { type: "SOLD", active: true },
  rented: { type: "RENTED", active: true },
  toggleFeatured: { type: "", active: true }, // special: toggle is_featured
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { propertyId, action } = body;

    if (!propertyId || !action) {
      return NextResponse.json(
        { error: "Missing propertyId or action" },
        { status: 400 }
      );
    }

    const supabase = await createServerClient();

    if (action === "toggle") {
      // Get current state
      const { data: property } = await supabase
        .from("properties")
        .select("active")
        .eq("id", propertyId)
        .single();

      if (!property) {
        return NextResponse.json({ error: "Property not found" }, { status: 404 });
      }

      const { error } = await supabase
        .from("properties")
        .update({ active: !property.active })
        .eq("id", propertyId);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    } else if (action === "toggleFeatured") {
      // Get current state
      const { data: property } = await supabase
        .from("properties")
        .select("is_featured")
        .eq("id", propertyId)
        .single();

      if (!property) {
        return NextResponse.json({ error: "Property not found" }, { status: 404 });
      }

      const { error } = await supabase
        .from("properties")
        .update({ is_featured: !property.is_featured })
        .eq("id", propertyId);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    } else {
      const config = actionMap[action as ActionType];
      if (!config) {
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
      }

      const { error } = await supabase
        .from("properties")
        .update({ type: config.type, active: config.active })
        .eq("id", propertyId);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    revalidateTag('properties', 'max');
    revalidateTag('featured-properties', 'max');
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
