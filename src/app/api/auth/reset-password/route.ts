import { NextResponse } from "next/server";
import { resetPasswordSchema } from "@/lib/validators";
import { consumeEmailToken } from "@/lib/tokens";
import { setUserPassword } from "@/lib/users";

export const runtime = "nodejs";

/** Confirms a password reset: consumes the one-time token and sets the new password. */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = resetPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input." },
      { status: 400 },
    );
  }

  const row = await consumeEmailToken(parsed.data.token, "reset");
  if (!row) {
    return NextResponse.json(
      { error: "This link has expired. Request a new one." },
      { status: 400 },
    );
  }

  try {
    await setUserPassword(row.userId, parsed.data.password);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[auth/reset-password] failed", e);
    return NextResponse.json({ error: "Could not reset your password." }, { status: 500 });
  }
}
