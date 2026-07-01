import { NextResponse } from "next/server";
import { db, newsletterSubscribers } from "@/lib/db";

export const runtime = "nodejs";

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

/** Home-page newsletter opt-in: email + optional first name. */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const data = (body ?? {}) as { email?: unknown; firstName?: unknown };
  const email = typeof data.email === "string" ? data.email.trim().toLowerCase() : "";
  const firstName =
    typeof data.firstName === "string" ? data.firstName.trim() : "";
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Invalid email." }, { status: 400 });
  }

  try {
    await db
      .insert(newsletterSubscribers)
      .values({ email, firstName: firstName || null, source: "home" })
      .onConflictDoUpdate({
        target: newsletterSubscribers.email,
        set: { firstName: firstName || null },
      });
    return NextResponse.json({ ok: true });
  } catch (e) {
    // Best-effort: don't fail the UX if the table isn't migrated yet.
    console.error("[newsletter] subscribe failed", e);
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
