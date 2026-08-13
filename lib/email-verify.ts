import dns from "node:dns";
import net from "node:net";
import os from "node:os";
import { promisify } from "node:util";

const resolveMx = promisify(dns.resolveMx);

export interface EmailVerificationResult {
  status: "valid" | "invalid" | "unknown";
}

const COMMAND_TIMEOUT_MS = 8000;

function nextCode(conn: net.Socket): Promise<number> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      conn.removeListener("data", onData);
      resolve(-1);
    }, COMMAND_TIMEOUT_MS);
    function onData(chunk: Buffer) {
      const m = chunk.toString().match(/^\s*(\d{3})/);
      if (m) {
        clearTimeout(timer);
        conn.removeListener("data", onData);
        resolve(parseInt(m[1], 10));
      }
    }
    conn.on("data", onData);
  });
}

/**
 * Minimal SMTP session against the recipient's MX server to check whether the
 * mailbox exists (RCPT TO is rejected with 5xx for non-existent mailboxes).
 * No API key / subscription required — fully free, no external dependency.
 *
 * Returns true (accepts), false (rejected → mailbox not found) or null when it
 * can't be determined (DNS/port/timeout issues) so sending stays best-effort.
 */
async function checkMailboxViaSMTP(email: string): Promise<boolean | null> {
  const at = email.indexOf("@");
  const domain = email.slice(at + 1).toLowerCase();
  if (!domain) return null;

  let mxs: dns.MxRecord[];
  try {
    mxs = await resolveMx(domain);
  } catch {
    return null;
  }
  if (!mxs || mxs.length === 0) return null;
  mxs.sort((a, b) => a.priority - b.priority);

  const helo = os.hostname() || "localhost";

  for (const mx of mxs.slice(0, 2)) {
    const host = mx.exchange;

    const result = await new Promise<boolean | null>((resolve) => {
      const conn = net.createConnection(25, host);
      let settled = false;
      let overallTimer: NodeJS.Timeout | null = null;

      const done = (v: boolean | null) => {
        if (settled) return;
        settled = true;
        if (overallTimer) clearTimeout(overallTimer);
        try { conn.write("QUIT\r\n"); } catch { /* noop */ }
        try { conn.end(); } catch { /* noop */ }
        resolve(v);
      };

      overallTimer = setTimeout(() => done(null), COMMAND_TIMEOUT_MS * 3);
      conn.on("error", () => done(null));

      conn.on("connect", async () => {
        try {
          // Read the server greeting banner (e.g. "220 mx.google.com ...")
          let code = await nextCode(conn);
          if (code < 200 || code >= 300) return done(null);

          conn.write(`EHLO ${helo}\r\n`);
          code = await nextCode(conn);
          if (code < 250 || code >= 300) return done(null);

          conn.write("MAIL FROM:<>\r\n");
          code = await nextCode(conn);
          if (code < 250 || code >= 300) return done(null);

          conn.write(`RCPT TO:<${email}>\r\n`);
          code = await nextCode(conn);
          if (code >= 250 && code < 300) return done(true);
          if (code >= 500) return done(false);
          return done(null);
        } catch {
          return done(null);
        }
      });
    });

    if (result !== null) return result;
  }

  return null;
}

export async function verifyEmail(email: string): Promise<EmailVerificationResult> {
  const result = await checkMailboxViaSMTP(email);
  if (result === false) return { status: "invalid" };
  if (result === true) return { status: "valid" };
  return { status: "unknown" };
}