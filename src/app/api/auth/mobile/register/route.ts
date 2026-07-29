import { NextResponse } from "next/server";
import { mobileRegisterSchema } from "@/lib/validators";
import { getUserByEmail, createUser } from "@/lib/users";
import { issueMobileToken } from "@/lib/mobile-auth";
import { createEmailToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/email/brevo";

export const runtime = "nodejs";

/**
 * Native sign-up: creates an email/password account and returns a bearer token
 * so the app is signed in immediately (mirrors /api/signup, which is web-session
 * based and returns no token).
 */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = mobileRegisterSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input." },
      { status: 400 },
    );
  }

  const { email, password, name } = parsed.data;

  const existing = await getUserByEmail(email);
  if (existing) {
    return NextResponse.json(
      { error: "An account with this email already exists." },
      { status: 409 },
    );
  }

  const user = await createUser({ email, password, name: name || undefined });

  // Fire the verification email (no-op until Brevo is configured).
  try {
    const token = await createEmailToken(user.id, "verify");
    await sendVerificationEmail(user.email, token, user.name ?? undefined);
  } catch (e) {
    console.error("[auth/mobile/register] verification email failed", e);
  }

  const bearer = await issueMobileToken(user.id);
  return NextResponse.json({
    token: bearer,
    user: { id: user.id, email: user.email, name: user.name },
  });
}
