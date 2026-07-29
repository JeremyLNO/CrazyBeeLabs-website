import { SignJWT, jwtVerify } from "jose";
import { auth } from "@/lib/auth";

const ISSUER = "crazybeelabs-app";
const AUDIENCE = "crazybeelabs-mobile";
/** Long-lived: native apps have no refresh-token dance, so this is the whole session. */
const TOKEN_TTL = "180d";

function secretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET is not set.");
  return new TextEncoder().encode(secret);
}

/** Issues a bearer token a native app stores (Keychain) and sends as `Authorization: Bearer <token>`. */
export async function issueMobileToken(userId: string): Promise<string> {
  return new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(TOKEN_TTL)
    .sign(secretKey());
}

/** Verifies a bearer token from a native client; returns the user id, or null if absent/invalid/expired. */
export async function getMobileUserId(req: Request): Promise<string | null> {
  const header = req.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return null;
  const token = header.slice("Bearer ".length).trim();
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey(), { issuer: ISSUER, audience: AUDIENCE });
    return typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
}

/**
 * Resolves the signed-in user id from either surface: the web's cookie-based
 * Auth.js session, or a native app's bearer token. Account endpoints (delete,
 * profile, export) call this instead of `auth()` directly so both work.
 */
export async function getSessionUserId(req: Request): Promise<string | null> {
  const mobileId = await getMobileUserId(req);
  if (mobileId) return mobileId;
  const session = await auth();
  return session?.user?.id ?? null;
}
