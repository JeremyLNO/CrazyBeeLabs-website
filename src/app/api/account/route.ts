import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getSessionUserId } from "@/lib/mobile-auth";
import { db, users } from "@/lib/db";

export const runtime = "nodejs";

/**
 * Self-service account deletion — called from the website (cookie session) or
 * a native app (bearer token). Requires an explicit confirmation string so a
 * stray or repeated request can't silently delete the account.
 *
 * Deleting the user row cascades to their downloads, licenses, subscriptions
 * and email tokens (real deletion — none of that is legally required once the
 * account is gone). Invoices are detached instead of deleted: French
 * accounting law requires keeping transaction records for ~10 years, so the
 * `invoices` FK is `ON DELETE SET NULL`, not cascade.
 */
export async function DELETE(req: Request) {
  const userId = await getSessionUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const confirm = (body as { confirm?: unknown })?.confirm;
  if (confirm !== "DELETE") {
    return NextResponse.json({ error: "Confirmation text did not match." }, { status: 400 });
  }

  try {
    await db.delete(users).where(eq(users.id, userId));
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[account] delete failed", e);
    return NextResponse.json({ error: "Could not delete your account." }, { status: 500 });
  }
}
