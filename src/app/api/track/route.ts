import { NextResponse } from "next/server";
import { db, pageViews } from "@/lib/db";

export const runtime = "nodejs";

/**
 * First-party, anonymous pageview beacon. No cookies, no IP address stored —
 * just a path and a timestamp, feeding the admin analytics funnel.
 */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 200 });
  }

  const raw = (body as { path?: unknown })?.path;
  const path = typeof raw === "string" ? raw.split("?")[0].slice(0, 200) : "";
  if (!path.startsWith("/")) {
    return NextResponse.json({ ok: false }, { status: 200 });
  }

  try {
    await db.insert(pageViews).values({ path });
  } catch (e) {
    // Best-effort: never surface errors to the visitor, and don't block on
    // the migration having run yet.
    console.error("[track] insert failed (table not migrated?)", e);
  }
  return NextResponse.json({ ok: true });
}
