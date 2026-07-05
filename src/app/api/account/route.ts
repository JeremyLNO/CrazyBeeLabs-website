import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db, users } from "@/lib/db";

export const runtime = "nodejs";

/**
 * Self-service account deletion. Requires an explicit confirmation string so a
 * stray or repeated request can't silently delete the account. Deleting the
 * user row cascades to their downloads, licenses, subscriptions, invoices and
 * email tokens (all FKs are ON DELETE CASCADE).
 */
export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
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
    await db.delete(users).where(eq(users.id, session.user.id));
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[account] delete failed", e);
    return NextResponse.json({ error: "Could not delete your account." }, { status: 500 });
  }
}
