import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: parseInt(process.env.SMTP_PORT || "587") === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface SendEmailParams {
  to: string;
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
}

export interface EmailErrorInfo {
  kind: "mailbox_not_found" | "other";
  message: string;
}

/**
 * Classifies a nodemailer/SMTP error. Gmail rejects unknown mailboxes at
 * send time with 550 / 5.1.1 ("does not exist"), which lets us tell the
 * agent that the mailbox wasn't found instead of failing silently.
 */
export function classifyEmailError(error: unknown): EmailErrorInfo {
  const raw = error as {
    responseCode?: number;
    response?: string;
    message?: string;
  };
  const responseCode = raw?.responseCode ?? 0;
  const response = (raw?.response || raw?.message || "").toLowerCase();

  const mailboxNotFound =
    response.includes("user not found") ||
    (responseCode === 550 &&
      (response.includes("5.1.1") ||
        response.includes("does not exist") ||
        response.includes("no such") ||
        response.includes("unknown user") ||
        response.includes("mailbox unavailable") ||
        response.includes("recipient address rejected") ||
        response.includes("invalid mailbox"))) ||
    responseCode === 551 ||
    responseCode === 553;

  return {
    kind: mailboxNotFound ? "mailbox_not_found" : "other",
    message: raw?.message || "Unknown email error",
  };
}

export async function sendEmail({ to, subject, text, html, replyTo }: SendEmailParams) {
  const from = process.env.SMTP_FROM || process.env.SMTP_USER || "noreply@luxeestate.com";
  const fromName = process.env.SMTP_FROM_NAME || "LuxeEstate";

  const info = await transporter.sendMail({
    from: `"${fromName}" <${from}>`,
    to,
    subject,
    text,
    html: html || text.replace(/\n/g, "<br>"),
    replyTo,
  });

  return info;
}
