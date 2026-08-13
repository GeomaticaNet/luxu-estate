import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

interface ThreadMessage {
  id: string;
  lead_id: string;
  sender_type: string;
  sender_id: string | null;
  body: string;
  images?: string[];
  is_read: boolean;
  created_at: string;
}

export async function GET(_req: NextRequest) {
  try {
    const supabase = await createServerClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // My leads (conversations)
    const { data: leads, error: leadsError } = await supabase
      .from("contact_leads")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (leadsError) {
      console.error("Error fetching my leads:", leadsError);
      return NextResponse.json({ error: "Failed to load messages" }, { status: 500 });
    }

    const leadIds = (leads || []).map((l) => l.id);

    // Resolve assigned agent display names (for the chat header / list)
    const assignedIds = [
      ...new Set(
        (leads || [])
          .map((l) => l.assigned_to)
          .filter((id): id is string => Boolean(id))
      ),
    ];
    let agentNames: Record<string, string> = {};
    if (assignedIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name")
        .in("user_id", assignedIds);
      if (profiles) {
        agentNames = Object.fromEntries(
          profiles.map((p) => [p.user_id, p.full_name || "Agente"])
        );
      }
    }

    const messagesMap: Record<string, ThreadMessage[]> = {};
    if (leadIds.length > 0) {
      const { data: messages } = await supabase
        .from("lead_messages")
        .select("*")
        .in("lead_id", leadIds)
        .order("created_at", { ascending: true });

      if (messages) {
        for (const m of messages as ThreadMessage[]) {
          if (!messagesMap[m.lead_id]) messagesMap[m.lead_id] = [];
          messagesMap[m.lead_id].push(m);
        }
      }
    }

    // Unread count: agent messages not read yet
    const { count: unreadCount } = await supabase
      .from("lead_messages")
      .select("*", { count: "exact", head: true })
      .eq("sender_type", "agent")
      .eq("is_read", false)
      .in("lead_id", leadIds);

    return NextResponse.json({
      leads: leads || [],
      messages: messagesMap,
      unreadCount: unreadCount || 0,
      agentNames,
    });
  } catch (err) {
    console.error("My leads error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
