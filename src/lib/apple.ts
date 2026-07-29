import { createRemoteJWKSet, jwtVerify } from "jose";
import { appleAllowedAudiences } from "@/lib/env";

const APPLE_ISSUER = "https://appleid.apple.com";
const APPLE_JWKS = createRemoteJWKSet(new URL(`${APPLE_ISSUER}/auth/keys`));

export interface AppleIdentity {
  /** Apple's stable per-app-group user id ("sub" claim). */
  appleUserId: string;
  /** Present on every token; may be a private relay address. */
  email: string | null;
  emailVerified: boolean;
}

/**
 * Verifies a "Sign in with Apple" identity token (a JWT the native app gets
 * from `ASAuthorizationAppleIDCredential.identityToken`) against Apple's
 * public keys. Throws if the signature, issuer or audience don't check out.
 */
export async function verifyAppleIdentityToken(identityToken: string): Promise<AppleIdentity> {
  const { payload } = await jwtVerify(identityToken, APPLE_JWKS, {
    issuer: APPLE_ISSUER,
    audience: appleAllowedAudiences,
  });

  const sub = payload.sub;
  if (!sub) throw new Error("Apple identity token has no subject.");

  const emailVerifiedClaim = payload.email_verified;
  return {
    appleUserId: sub,
    email: typeof payload.email === "string" ? payload.email : null,
    emailVerified: emailVerifiedClaim === true || emailVerifiedClaim === "true",
  };
}
