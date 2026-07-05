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
