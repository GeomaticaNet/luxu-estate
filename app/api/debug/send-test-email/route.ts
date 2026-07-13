import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

async function runTest(to: string) {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = parseInt(process.env.SMTP_PORT || "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  const errors: string[] = [];
  let verifyOk = false;

  try {
    await transporter.verify();
    verifyOk = true;
  } catch (err) {
    errors.push(`SMTP verify failed: ${err instanceof Error ? err.message : String(err)}`);
  }

  let sendResult = null;
  try {
    const info = await transporter.sendMail({
      from: `"LuxeEstate Debug" <${user}>`,
      to,
      subject: "SMTP Debug Test - LuxeEstate",
      text: "This is a test email to verify Gmail SMTP is working correctly.",
    });
    sendResult = { messageId: info.messageId, accepted: info.accepted, rejected: info.rejected };
  } catch (err) {
    errors.push(`Send failed: ${err instanceof Error ? err.message : String(err)}`);
  }

  return {
    smtp: { host, port, user: user?.split("@")[0] + "@..." },
    verifyOk,
    sendResult,
    errors: errors.length > 0 ? errors : undefined,
  };
}

export async function GET(req: NextRequest) {
  const to = req.nextUrl.searchParams.get("to");
  if (!to) {
    return NextResponse.json({ error: "?to=email is required" }, { status: 400 });
  }
  return NextResponse.json(await runTest(to));
}

export async function POST(req: NextRequest) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const to = body?.to;
  if (!to) {
    return NextResponse.json({ error: "{ to: email } is required" }, { status: 400 });
  }
  return NextResponse.json(await runTest(to));
}
