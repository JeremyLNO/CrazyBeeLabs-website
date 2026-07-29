import { NextResponse } from "next/server";
import { appleAuthSchema } from "@/lib/validators";
import { verifyAppleIdentityToken } from "@/lib/apple";
import { findOrCreateAppleUser } from "@/lib/users";
import { issueMobileToken } from "@/lib/mobile-auth";

export const runtime = "nodejs";

/**
 * Native "Sign in with Apple" entry point. The app sends the identity token
 * from `ASAuthorizationAppleIDCredential`; we verify it against Apple's keys,
 * find-or-create the matching user, and hand back a long-lived bearer token
 * the app stores in the Keychain and sends as `Authorization: Bearer …`.
 */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = appleAuthSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input." },
      { status: 400 },
    );
  }

  let identity;
  try {
    identity = await verifyAppleIdentityToken(parsed.data.identityToken);
  } catch (e) {
    console.error("[auth/mobile/apple] token verification failed", e);
    return NextResponse.json({ error: "Could not verify Apple sign-in." }, { status: 401 });
  }

  try {
    const user = await findOrCreateAppleUser({
      appleUserId: identity.appleUserId,
      email: identity.email,
      name: parsed.data.name,
    });
    const token = await issueMobileToken(user.id);
    return NextResponse.json({
      token,
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (e) {
    console.error("[auth/mobile/apple] sign-in failed", e);
    return NextResponse.json({ error: "Sign-in failed. Please try again." }, { status: 500 });
  }
}
