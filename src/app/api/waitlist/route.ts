import { NextResponse } from "next/server";
import { db, waitlistSignups } from "@/lib/db";
import { SHOWCASE } from "@/lib/showcase";

export const runtime = "nodejs";

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

/** App detail "Coming soon" opt-in: email + optional first name, tied to one app. */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const data = (body ?? {}) as {
    email?: unknown;
    firstName?: unknown;
    appSlug?: unknown;
  };
  const email = typeof data.email === "string" ? data.email.trim().toLowerCase() : "";
  const firstName = typeof data.firstName === "string" ? data.firstName.trim() : "";
  const appSlug = typeof data.appSlug === "string" ? data.appSlug.trim() : "";

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Invalid email." }, { status: 400 });
  }
  if (!SHOWCASE.some((a) => a.slug === appSlug)) {
    return NextResponse.json({ error: "Unknown app." }, { status: 400 });
  }

  try {
    await db
      .insert(waitlistSignups)
      .values({ email, firstName: firstName || null, appSlug })
      .onConflictDoUpdate({
        target: [waitlistSignups.email, waitlistSignups.appSlug],
        set: { firstName: firstName || null },
      });
    return NextResponse.json({ ok: true });
  } catch (e) {
    // Best-effort: don't fail the UX if the table isn't migrated yet.
    console.error("[waitlist] signup failed", e);
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
