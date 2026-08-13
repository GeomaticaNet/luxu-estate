import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { sendEmail, classifyEmailError } from "@/lib/email";
import { verifyEmail } from "@/lib/email-verify";
import { replyTemplate } from "@/lib/email-templates";

export async function POST(req: NextRequest) {
  try {
    const { leadId, leadName, leadEmail, replyText, images } = await req.json();

    if (!leadId || !leadEmail || !replyText?.trim()) {
      return NextResponse.json({ error: "leadId, leadEmail and replyText are required" }, { status: 400 });
    }

    const imageList: string[] = Array.isArray(images)
      ? images.filter((url): url is string => typeof url === "string" && url.includes("/storage/v1/object/public/leads/")).slice(0, 5)
      : [];

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return req.cookies.getAll(); },
          setAll() {},
        },
      }
    );

    // Get the replying user's profile for the signature
    const { data: { user } } = await supabase.auth.getUser();
    let agentName: string | undefined;
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("user_id", user.id)
        .maybeSingle();
      agentName = profile?.full_name || undefined;
    }

    // Store the agent's message in the conversation thread
    const { error: msgError } = await supabase.from("lead_messages").insert({
      lead_id: leadId,
      sender_type: "agent",
      sender_id: user?.id || null,
      body: replyText.trim(),
      images: imageList,
      is_read: false,
    });

    if (msgError) {
      console.error("DB error inserting agent message:", msgError);
      return NextResponse.json({ error: "Failed to save message" }, { status: 500 });
    }

    const { error: dbError } = await supabase
      .from("contact_leads")
      .update({
        replied_at: new Date().toISOString(),
        reply_message: replyText.trim(),
        status: "contacted",
      })
      .eq("id", leadId);

    if (dbError) {
      console.error("DB error saving reply:", dbError);
    }

    // Notify the user by email (best effort). First validate the mailbox so
    // a non-existent address is caught synchronously (Gmail otherwise accepts
    // the message and bounces it later, leaving the agent without feedback).
    let emailStatus: "sent" | "invalid_mailbox" | "error" = "sent";
    let emailMessage: string | undefined;

    const verification = await verifyEmail(leadEmail);
    if (verification.status === "invalid") {
      emailStatus = "invalid_mailbox";
      emailMessage = "Mailbox not found";
    } else {
      try {
        const html = replyTemplate(replyText.trim(), leadName || "there", agentName);
        const text = replyText.trim();
        await sendEmail({
          to: leadEmail,
          subject: "Respuesta de Luxe Estate",
          text,
          html,
        });
      } catch (emailErr) {
        console.error("Email send error:", emailErr);
        const info = classifyEmailError(emailErr);
        emailStatus = info.kind === "mailbox_not_found" ? "invalid_mailbox" : "error";
        emailMessage = info.message;
      }
    }

    return NextResponse.json({ success: true, email: { status: emailStatus, message: emailMessage } });
  } catch (err) {
    console.error("Reply error:", err);
    const message = err instanceof Error ? err.message : "Failed to send reply";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
