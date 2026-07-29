import { createRemoteJWKSet, jwtVerify } from "jose";
import { googleAllowedAudiences } from "@/lib/env";

// Google issues ID tokens from accounts.google.com; its signing keys live here.
const GOOGLE_ISSUERS = ["https://accounts.google.com", "accounts.google.com"];
const GOOGLE_JWKS = createRemoteJWKSet(new URL("https://www.googleapis.com/oauth2/v3/certs"));

export interface GoogleIdentity {
  /** Google's stable per-user id ("sub" claim). */
  googleUserId: string;
  email: string | null;
  emailVerified: boolean;
  name: string | null;
}

/**
 * Verifies a Google ID token (from native Google Sign-In) against Google's
 * public keys. Throws if the signature, issuer or audience don't check out —
 * `aud` must be one of the configured GOOGLE_CLIENT_IDS.
 */
export async function verifyGoogleIdToken(idToken: string): Promise<GoogleIdentity> {
  if (googleAllowedAudiences.length === 0) {
    throw new Error("Google sign-in is not configured (GOOGLE_CLIENT_IDS).");
  }

  const { payload } = await jwtVerify(idToken, GOOGLE_JWKS, {
    issuer: GOOGLE_ISSUERS,
    audience: googleAllowedAudiences,
  });

  const sub = payload.sub;
  if (!sub) throw new Error("Google id token has no subject.");

  const claims = payload as Record<string, unknown>;
  const emailVerifiedClaim = claims.email_verified;
  return {
    googleUserId: sub,
    email: typeof claims.email === "string" ? claims.email : null,
    emailVerified: emailVerifiedClaim === true || emailVerifiedClaim === "true",
    name: typeof claims.name === "string" ? claims.name : null,
  };
}
