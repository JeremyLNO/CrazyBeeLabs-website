import crypto from "node:crypto";

/**
 * Verifies a Paddle Billing webhook signature.
 * Header format: "ts=<unix>;h1=<hex hmac>". The signed payload is `ts:rawBody`,
 * HMAC-SHA256 with the notification destination's secret key.
 */
export function verifyPaddleSignature(
  rawBody: string,
  signatureHeader: string | null,
  secret: string,
): boolean {
  if (!signatureHeader) return false;
  const parts: Record<string, string> = {};
  for (const kv of signatureHeader.split(";")) {
    const idx = kv.indexOf("=");
    if (idx > 0) parts[kv.slice(0, idx).trim()] = kv.slice(idx + 1).trim();
  }
  const ts = parts["ts"];
  const h1 = parts["h1"];
  if (!ts || !h1) return false;

  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${ts}:${rawBody}`)
    .digest("hex");

  try {
    return crypto.timingSafeEqual(
      Buffer.from(h1, "hex"),
      Buffer.from(expected, "hex"),
    );
  } catch {
    return false;
  }
}

export function paddleApiBase(): string {
  return process.env.NEXT_PUBLIC_PADDLE_ENV === "production"
    ? "https://api.paddle.com"
    : "https://sandbox-api.paddle.com";
}

/** Fetches the hosted invoice URL for a transaction (best-effort). */
export async function getInvoiceUrl(transactionId: string): Promise<string | null> {
  if (!process.env.PADDLE_API_KEY) return null;
  try {
    const res = await fetch(
      `${paddleApiBase()}/transactions/${transactionId}/invoice`,
      { headers: { Authorization: `Bearer ${process.env.PADDLE_API_KEY}` } },
    );
    if (!res.ok) return null;
    const json = (await res.json().catch(() => null)) as
      | { data?: { url?: string } }
      | null;
    return json?.data?.url ?? null;
  } catch {
    return null;
  }
}
