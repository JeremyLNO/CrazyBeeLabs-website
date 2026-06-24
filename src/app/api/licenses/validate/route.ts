import { NextResponse } from "next/server";
import { getLicenseByKey } from "@/lib/licenses";
import { getApp, getAppByBundleId } from "@/lib/catalog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * License validation for the macOS apps. CrazyBeeLabs.com (this DB) is the source
 * of truth. Apps POST { licenseKey, bundleId } in the background; if `valid` is
 * false (expired / blocked / wrong app), the app disables itself.
 *
 * GET with ?key=&bundleId= is supported for quick manual testing.
 *
 * TODO (production): add rate-limiting on this endpoint.
 */
async function validate(key: string, bundleId?: string) {
  const licenseKey = key.trim();
  if (!licenseKey) return { status: 400, body: { valid: false, reason: "missing_key" } };

  const license = await getLicenseByKey(licenseKey);
  if (!license) return { status: 200, body: { valid: false, reason: "not_found" } };

  // bind the key to its app (a key for app A can't unlock app B)
  if (bundleId) {
    const app = getAppByBundleId(bundleId);
    if (!app || app.slug !== license.appSlug) {
      return {
        status: 200,
        body: { valid: false, reason: "wrong_app", appSlug: license.appSlug },
      };
    }
  }

  const expired =
    license.validUntil != null &&
    new Date(license.validUntil).getTime() <= Date.now();
  const valid = license.status === "active" && !expired;
  const reason = valid
    ? undefined
    : license.status !== "active"
      ? license.status // blocked / expired / revoked
      : "expired";

  return {
    status: 200,
    body: {
      valid,
      status: license.status,
      appSlug: license.appSlug,
      appName: getApp(license.appSlug)?.name ?? license.appSlug,
      validUntil: license.validUntil
        ? new Date(license.validUntil).toISOString()
        : null,
      reason,
    },
  };
}

export async function POST(req: Request) {
  let body: { licenseKey?: string; bundleId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ valid: false, reason: "bad_request" }, { status: 400 });
  }
  const { status, body: out } = await validate(body.licenseKey ?? "", body.bundleId);
  return NextResponse.json(out, { status });
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const key = url.searchParams.get("key") ?? "";
  const bundleId = url.searchParams.get("bundleId") ?? undefined;
  const { status, body: out } = await validate(key, bundleId);
  return NextResponse.json(out, { status });
}
