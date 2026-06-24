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

export function isLicenseGateConfigured(): boolean {
  return Boolean(process.env.LICENSEGATE_API_KEY);
}
