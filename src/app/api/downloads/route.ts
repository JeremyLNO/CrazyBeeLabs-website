import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { recordDownload } from "@/lib/downloads";

export const runtime = "nodejs";

/** Logs an app download for the signed-in user (date + app), for OneSignal etc. */
export async function POST(req: Request) {
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

  const data = (body ?? {}) as { appSlug?: unknown; platform?: unknown };
  const appSlug = typeof data.appSlug === "string" ? data.appSlug.trim() : "";
  const platform = typeof data.platform === "string" ? data.platform : undefined;
  if (!appSlug) {
    return NextResponse.json({ error: "Missing appSlug." }, { status: 400 });
  }

  try {
    await recordDownload({ userId: session.user.id, appSlug, platform });
    return NextResponse.json({ ok: true });
  } catch (e) {
    // Best-effort: never block the user's download if logging fails
    // (e.g. before the `downloads` table migration is applied).
    console.error("[downloads] record failed", e);
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
