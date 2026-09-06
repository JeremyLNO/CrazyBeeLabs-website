import { NextResponse } from "next/server";
import { db, pageViews } from "@/lib/db";
import { LOCALES } from "@/lib/i18n/config";

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

  const data = (body ?? {}) as {
    path?: unknown;
    siteLocale?: unknown;
    browserLocale?: unknown;
  };
  const path = typeof data.path === "string" ? data.path.split("?")[0].slice(0, 200) : "";
  if (!path.startsWith("/")) {
    return NextResponse.json({ ok: false }, { status: 200 });
  }

  // Both are validated to a known shape rather than stored as sent, so a
  // crafted beacon can't inject junk into the language stats.
  const siteLocale =
    typeof data.siteLocale === "string" &&
    (LOCALES as readonly string[]).includes(data.siteLocale)
      ? data.siteLocale
      : null;
  const browserLocale =
    typeof data.browserLocale === "string" && /^[a-z]{2,3}$/.test(data.browserLocale)
      ? data.browserLocale
      : null;

  try {
    await db.insert(pageViews).values({ path, siteLocale, browserLocale });
  } catch (e) {
    // Best-effort: never surface errors to the visitor, and don't block on
    // the migration having run yet.
    console.error("[track] insert failed (table not migrated?)", e);
  }
  return NextResponse.json({ ok: true });
}
