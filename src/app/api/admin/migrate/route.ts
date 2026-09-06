import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { isAdminEmail } from "@/lib/admin-auth";
import { db } from "@/lib/db";

export const runtime = "nodejs";

/**
 * Admin-only, idempotent schema migration. Runs a FIXED set of DDL statements
 * (never user input) using the app's own DB connection — so it works without a
 * separate DATABASE_URL CI secret. Safe to run multiple times.
 */
const STATEMENTS: string[] = [
  `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "birth_date" date`,
  `CREATE TABLE IF NOT EXISTS "downloads" (
     "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
     "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
     "app_slug" text NOT NULL,
     "platform" text,
     "created_at" timestamptz DEFAULT now() NOT NULL)`,
  `CREATE INDEX IF NOT EXISTS "downloads_user_idx" ON "downloads" ("user_id")`,
  `CREATE INDEX IF NOT EXISTS "downloads_app_idx" ON "downloads" ("app_slug")`,
  `CREATE INDEX IF NOT EXISTS "downloads_created_idx" ON "downloads" ("created_at")`,
  `CREATE TABLE IF NOT EXISTS "newsletter_subscribers" (
     "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
     "email" text NOT NULL,
     "first_name" text,
     "source" text,
     "created_at" timestamptz DEFAULT now() NOT NULL)`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "newsletter_email_unique" ON "newsletter_subscribers" ("email")`,
  `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "last_name" text`,
  `CREATE TABLE IF NOT EXISTS "page_views" (
     "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
     "path" text NOT NULL,
     "created_at" timestamptz DEFAULT now() NOT NULL)`,
  `CREATE INDEX IF NOT EXISTS "page_views_created_idx" ON "page_views" ("created_at")`,
  `CREATE INDEX IF NOT EXISTS "page_views_path_idx" ON "page_views" ("path")`,

  // ── Sign in with Apple / Google (drizzle/0001, 0005) ──
  // Apple- or Google-only accounts never set a password.
  `ALTER TABLE "users" ALTER COLUMN "password_hash" DROP NOT NULL`,
  `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "apple_user_id" text`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "users_apple_user_id_unique" ON "users" ("apple_user_id")`,
  `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "google_user_id" text`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "users_google_user_id_unique" ON "users" ("google_user_id")`,

  // Invoices must outlive account deletion (French Code de commerce Art.
  // L123-22: ~10-year retention). Detach instead of cascading.
  `ALTER TABLE "invoices" ALTER COLUMN "user_id" DROP NOT NULL`,
  `ALTER TABLE "invoices" DROP CONSTRAINT IF EXISTS "invoices_user_id_fkey"`,
  `ALTER TABLE "invoices" ADD CONSTRAINT "invoices_user_id_fkey"
     FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL`,

  // ── App waitlist (drizzle/0006) ──
  `CREATE TABLE IF NOT EXISTS "waitlist_signups" (
     "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
     "email" text NOT NULL,
     "first_name" text,
     "app_slug" text NOT NULL,
     "created_at" timestamptz DEFAULT now() NOT NULL)`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "waitlist_email_app_unique" ON "waitlist_signups" ("email", "app_slug")`,

  // ── Language signal on pageviews (drizzle/0007) ──
  `ALTER TABLE "page_views" ADD COLUMN IF NOT EXISTS "site_locale" text`,
  `ALTER TABLE "page_views" ADD COLUMN IF NOT EXISTS "browser_locale" text`,
];

export async function POST() {
  const session = await auth();
  if (!isAdminEmail(session?.user?.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const results: { stmt: string; ok: boolean; error?: string }[] = [];
  for (const stmt of STATEMENTS) {
    const label = stmt.replace(/\s+/g, " ").trim().slice(0, 70);
    try {
      await db.execute(sql.raw(stmt));
      results.push({ stmt: label, ok: true });
    } catch (e) {
      results.push({ stmt: label, ok: false, error: String((e as Error)?.message ?? e) });
    }
  }
  return NextResponse.json({ results });
}
