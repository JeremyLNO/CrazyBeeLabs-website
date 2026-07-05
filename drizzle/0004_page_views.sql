-- First-party, anonymous pageview counter (no cookies, no IP stored).
CREATE TABLE IF NOT EXISTS "page_views" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "path" text NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "page_views_created_idx" ON "page_views" ("created_at");
CREATE INDEX IF NOT EXISTS "page_views_path_idx" ON "page_views" ("path");
