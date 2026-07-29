import { NextResponse } from "next/server";
import { loginSchema } from "@/lib/validators";
import { getUserByEmail } from "@/lib/users";
import { verifyPassword } from "@/lib/password";
import { issueMobileToken } from "@/lib/mobile-auth";
import { allowUnverified } from "@/lib/env";

export const runtime = "nodejs";

/** Native email/password sign-in — returns a bearer token, mirroring the web Credentials provider. */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid email and password." }, { status: 400 });
  }
  const { email, password } = parsed.data;

  const user = await getUserByEmail(email);
  if (!user?.passwordHash) {
    return NextResponse.json({ error: "Incorrect email or password." }, { status: 401 });
  }

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) {
    return NextResponse.json({ error: "Incorrect email or password." }, { status: 401 });
  }

  if (!allowUnverified && !user.emailVerifiedAt) {
    return NextResponse.json({ error: "Please verify your email first." }, { status: 403 });
  }

  const token = await issueMobileToken(user.id);
  return NextResponse.json({
    token,
    user: { id: user.id, email: user.email, name: user.name },
  });
}
