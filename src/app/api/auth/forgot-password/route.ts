import { NextResponse } from "next/server";
import { forgotPasswordSchema } from "@/lib/validators";
import { getUserByEmail } from "@/lib/users";
import { createEmailToken } from "@/lib/tokens";
import { sendPasswordResetEmail } from "@/lib/email/brevo";

export const runtime = "nodejs";

/**
 * Requests a password-reset email. Used by both the website and the native
 * apps (the reset itself is completed on the `/reset` web page the email
 * links to). Always returns `{ ok: true }` — whether or not the email is
 * registered — so this can't be used to enumerate accounts.
 */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = forgotPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid email." }, { status: 400 });
  }

  try {
    const user = await getUserByEmail(parsed.data.email);
    if (user) {
      const token = await createEmailToken(user.id, "reset", 60);
      await sendPasswordResetEmail(user.email, token, user.name ?? undefined);
    }
  } catch (e) {
    console.error("[auth/forgot-password] failed", e);
    // Still report success to the client — don't leak whether it broke because
    // the account exists or not.
  }

  return NextResponse.json({ ok: true });
}
