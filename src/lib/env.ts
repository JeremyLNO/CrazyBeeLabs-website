/**
 * Small helpers around environment configuration. Third-party tools are
 * "configured" only once their key is present — until then the related
 * features stay inert (no crashes, just disabled paths).
 */

export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "http://localhost:3000";

export const allowUnverified = process.env.AUTH_ALLOW_UNVERIFIED !== "false";

export function isBrevoConfigured(): boolean {
  return Boolean(process.env.BREVO_API_KEY);
}

export function isPaddleConfigured(): boolean {
  return Boolean(process.env.PADDLE_API_KEY);
}

/**
 * Without this secret the Paddle webhook returns 200 and *discards* the event
 * (see api/webhooks/paddle). That's the right behaviour pre-launch, but once
 * real checkouts exist it would silently drop purchases — so the admin
 * dashboard surfaces it rather than letting it fail quietly.
 */
export function isPaddleWebhookConfigured(): boolean {
  return Boolean(process.env.PADDLE_WEBHOOK_SECRET);
}

export function isLicenseGateConfigured(): boolean {
  return Boolean(process.env.LICENSEGATE_API_KEY);
}

/** Bundle ids allowed to sign in via native "Sign in with Apple" (checked against the identity token's `aud`). */
export const appleAllowedAudiences = (process.env.APPLE_BUNDLE_IDS || "company.lno.dualcamoxo")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

/** Google OAuth client ids allowed to sign in via native Google Sign-In (checked against the id token's `aud`). */
export const googleAllowedAudiences = (process.env.GOOGLE_CLIENT_IDS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

export function isGoogleConfigured(): boolean {
  return googleAllowedAudiences.length > 0;
}
