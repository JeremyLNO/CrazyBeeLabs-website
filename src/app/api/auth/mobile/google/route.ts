import { NextResponse } from "next/server";
import { googleAuthSchema } from "@/lib/validators";
import { verifyGoogleIdToken } from "@/lib/google";
import { findOrCreateGoogleUser } from "@/lib/users";
import { issueMobileToken } from "@/lib/mobile-auth";

export const runtime = "nodejs";

/**
 * Native Google Sign-In entry point. The app sends the Google ID token from
 * GIDSignIn; we verify it against Google's keys, find-or-create the user, and
 * hand back a long-lived bearer token stored in the Keychain.
 */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = googleAuthSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input." },
      { status: 400 },
    );
  }

  let identity;
  try {
    identity = await verifyGoogleIdToken(parsed.data.idToken);
  } catch (e) {
    console.error("[auth/mobile/google] token verification failed", e);
    return NextResponse.json({ error: "Could not verify Google sign-in." }, { status: 401 });
  }

  try {
    const user = await findOrCreateGoogleUser({
      googleUserId: identity.googleUserId,
      email: identity.email,
      name: parsed.data.name ?? identity.name,
    });
    const token = await issueMobileToken(user.id);
    return NextResponse.json({
      token,
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (e) {
    console.error("[auth/mobile/google] sign-in failed", e);
    return NextResponse.json({ error: "Sign-in failed. Please try again." }, { status: 500 });
  }
}
