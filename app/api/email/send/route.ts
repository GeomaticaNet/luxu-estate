import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { to, subject, text, html, replyTo } = body;

    if (!to || !subject || !text) {
      return NextResponse.json(
        { error: "to, subject and text are required" },
        { status: 400 }
      );
    }

    await sendEmail({ to, subject, text, html, replyTo });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Email send error:", err);
    const message = err instanceof Error ? err.message : "Failed to send email";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
