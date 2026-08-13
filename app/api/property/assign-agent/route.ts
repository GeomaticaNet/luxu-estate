import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { propertyId, agentId } = body;

    if (!propertyId) {
      return NextResponse.json(
        { error: "Missing propertyId" },
        { status: 400 }
      );
    }

    const supabase = await createServerClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Only admins can reassign agents
    const { data: userRole } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    const roles: string[] = userRole?.role ?? [];
    if (!roles.includes("admin")) {
      return NextResponse.json({ error: "Only admins can assign agents" }, { status: 403 });
    }

    // Validate agentId if provided: must be an existing user
    if (agentId) {
      const { data: agentRole } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("user_id", agentId)
        .single();

      if (!agentRole) {
        return NextResponse.json({ error: "Agent not found" }, { status: 404 });
      }
    }

    const { error } = await supabase
      .from("properties")
      .update({ agent_id: agentId || null })
      .eq("id", propertyId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
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
