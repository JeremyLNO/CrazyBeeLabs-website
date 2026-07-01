import { isBrevoConfigured, siteUrl } from "@/lib/env";
import { appName } from "@/lib/catalog";

interface OutgoingEmail {
  to: string;
  toName?: string;
  subject: string;
  html: string;
  replyTo?: { email: string; name?: string };
  attachments?: { name: string; content: string }[]; // content = base64
}

/**
 * Sends a transactional email through Brevo. If BREVO_API_KEY is not set the
 * call is a no-op (logged), so sign-up / reset / support flows still work
 * end-to-end before the integration is live.
 */
export async function sendEmail(email: OutgoingEmail): Promise<{ sent: boolean }> {
  if (!isBrevoConfigured()) {
    console.info(`[brevo:inactive] would send "${email.subject}" → ${email.to}`);
    return { sent: false };
  }
  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": process.env.BREVO_API_KEY as string,
      "content-type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({
      sender: {
        email: process.env.BREVO_SENDER_EMAIL || "jeremy@lno.company",
        name: process.env.BREVO_SENDER_NAME || "Crazy Bee Labs",
      },
      to: [{ email: email.to, name: email.toName }],
      ...(email.replyTo ? { replyTo: email.replyTo } : {}),
      subject: email.subject,
      htmlContent: email.html,
      ...(email.attachments?.length ? { attachment: email.attachments } : {}),
    }),
  });
  if (!res.ok) {
    console.error("[brevo] send failed", res.status, await res.text().catch(() => ""));
    return { sent: false };
  }
  return { sent: true };
}

export interface SupportSubmission {
  kind: "support" | "idea";
  appLabel: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  message: string;
  attachment?: { name: string; content: string };
}

/** Routes a Support & ideas submission to support@crazybeelabs.com. */
export function sendSupportEmail(s: SupportSubmission) {
  const label = s.kind === "idea" ? "💡 Idea" : "🛟 Support";
  const rows: [string, string][] = [
    ["Type", s.kind === "idea" ? "Idea" : "Support"],
    ["App", s.appLabel],
    ["Name", `${s.firstName} ${s.lastName}`.trim()],
    ["Email", s.email],
    ["Phone", s.phone || "—"],
  ];
  const table = rows
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 14px 6px 0;color:#5F636B">${k}</td><td style="padding:6px 0;font-weight:600">${escapeHtml(v)}</td></tr>`,
    )
    .join("");
  return sendEmail({
    to: process.env.SUPPORT_INBOX || "support@crazybeelabs.com",
    subject: `[${s.kind === "idea" ? "Idea" : "Support"}] ${s.appLabel} — ${s.firstName} ${s.lastName}`.trim(),
    replyTo: { email: s.email, name: `${s.firstName} ${s.lastName}`.trim() || undefined },
    attachments: s.attachment ? [s.attachment] : undefined,
    html: branded(
      `<h1 style="font-size:20px">${label}</h1>
       <table style="border-collapse:collapse;margin:8px 0 18px">${table}</table>
       <div style="white-space:pre-wrap;background:#F7F4EE;border:1px solid #E6E2DA;border-radius:12px;padding:16px">${escapeHtml(s.message)}</div>
       ${s.attachment ? `<p style="color:#5F636B;font-size:13px;margin-top:14px">📎 Attachment: ${escapeHtml(s.attachment.name)}</p>` : ""}`,
    ),
  });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function branded(inner: string): string {
  return `<div style="font-family:Inter,Helvetica,Arial,sans-serif;color:#080808;line-height:1.55;max-width:560px;margin:auto">
    ${inner}
    <hr style="border:none;border-top:1px solid #E6E2DA;margin:28px 0" />
    <p style="color:#5F636B;font-size:12px">Crazy Bee Labs — smart tools, mad experiments, useful apps.</p>
  </div>`;
}

function button(href: string, label: string): string {
  return `<a href="${href}" style="display:inline-block;background:#080808;color:#fff;text-decoration:none;font-weight:600;padding:12px 22px;border-radius:12px">${label}</a>`;
}

export function sendVerificationEmail(to: string, token: string, name?: string) {
  const url = `${siteUrl}/verify?token=${encodeURIComponent(token)}`;
  return sendEmail({
    to,
    toName: name,
    subject: "Confirm your email — Crazy Bee Labs",
    html: branded(
      `<h1 style="font-size:22px">Welcome${name ? `, ${name}` : ""} 🐝</h1>
       <p>Confirm your email to finish setting up your Crazy Bee Labs account.</p>
       <p style="margin:24px 0">${button(url, "Confirm my email")}</p>
       <p style="color:#5F636B;font-size:13px">This link expires in 1 hour.</p>`,
    ),
  });
}

export function sendPasswordResetEmail(to: string, token: string, name?: string) {
  const url = `${siteUrl}/reset?token=${encodeURIComponent(token)}`;
  return sendEmail({
    to,
    toName: name,
    subject: "Reset your password — Crazy Bee Labs",
    html: branded(
      `<h1 style="font-size:22px">Reset your password</h1>
       <p>Click below to choose a new password.</p>
       <p style="margin:24px 0">${button(url, "Choose a new password")}</p>
       <p style="color:#5F636B;font-size:13px">If you didn't request this, you can ignore this email.</p>`,
    ),
  });
}

export function sendLicenseEmail(
  to: string,
  name: string | undefined,
  issued: { appSlug: string; licenseKey: string; validUntil: Date | null }[],
) {
  const rows = issued
    .map(
      (i) =>
        `<tr>
          <td style="padding:10px 12px 10px 0;font-weight:600">${appName(i.appSlug)}</td>
          <td style="padding:10px 12px;font-family:ui-monospace,Menlo,monospace">${i.licenseKey}</td>
          <td style="padding:10px 0;color:#5F636B;white-space:nowrap">${
            i.validUntil
              ? "until " + i.validUntil.toLocaleDateString("en-GB")
              : "lifetime"
          }</td>
        </tr>`,
    )
    .join("");
  return sendEmail({
    to,
    toName: name,
    subject: `Your Crazy Bee Labs license${issued.length > 1 ? "s" : ""}`,
    html: branded(
      `<h1 style="font-size:22px">Thanks for your purchase 🐝</h1>
       <p>Paste the key into the app's <b>Settings → License</b> to unlock it.</p>
       <table style="width:100%;border-collapse:collapse;margin:18px 0">${rows}</table>
       <p style="margin:24px 0">${button(`${siteUrl}/account/licenses`, "View my licenses")}</p>`,
    ),
  });
}
