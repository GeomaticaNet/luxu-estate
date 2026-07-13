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
