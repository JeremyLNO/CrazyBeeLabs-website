import { NextResponse } from "next/server";
import { checkEmailSchema } from "@/lib/validators";
import { getUserByEmail } from "@/lib/users";

export const runtime = "nodejs";

/** Tells the unified auth flow whether an email already has an account. */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = checkEmailSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid email." }, { status: 400 });
  }

  const user = await getUserByEmail(parsed.data.email);
  return NextResponse.json({ exists: Boolean(user) });
}
