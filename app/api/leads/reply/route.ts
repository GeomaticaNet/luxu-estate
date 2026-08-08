import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { sendEmail } from "@/lib/email";
import { replyTemplate } from "@/lib/email-templates";

export async function POST(req: NextRequest) {
  try {
    const { leadId, leadName, leadEmail, replyText } = await req.json();

    if (!leadId || !leadEmail || !replyText?.trim()) {
      return NextResponse.json({ error: "leadId, leadEmail and replyText are required" }, { status: 400 });
    }

    const html = replyTemplate(replyText.trim(), leadName || "there");
    const text = replyText.trim();

    await sendEmail({
      to: leadEmail,
      subject: "Respuesta de Luxe Estate",
      text,
      html,
    });

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

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Reply error:", err);
    const message = err instanceof Error ? err.message : "Failed to send reply";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
