import { NextResponse } from "next/server";
import { signupSchema } from "@/lib/validators";
import { getUserByEmail, createUser } from "@/lib/users";
import { createEmailToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/email/brevo";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = signupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input." },
      { status: 400 },
    );
  }

  const { email, password, name, lastName, birthDate } = parsed.data;

  const existing = await getUserByEmail(email);
  if (existing) {
    return NextResponse.json(
      { error: "An account with this email already exists." },
      { status: 409 },
    );
  }

  const user = await createUser({
    email,
    password,
    name: name || undefined,
    lastName: lastName || undefined,
    birthDate: birthDate || undefined,
  });

  // Fire the verification email (no-op until Brevo is configured).
  try {
    const token = await createEmailToken(user.id, "verify");
    await sendVerificationEmail(user.email, token, user.name ?? undefined);
  } catch (e) {
    console.error("[signup] verification email failed", e);
  }

  return NextResponse.json({ ok: true });
}
