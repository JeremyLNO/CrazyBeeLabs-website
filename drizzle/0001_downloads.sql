-- Downloads: one row per app download by a signed-in user.
-- Feeds marketing automations (e.g. OneSignal): who downloaded what, and when.
CREATE TABLE IF NOT EXISTS "downloads" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "app_slug" text NOT NULL,
  "platform" text,
  "created_at" timestamptz DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "downloads_user_idx" ON "downloads" ("user_id");
CREATE INDEX IF NOT EXISTS "downloads_app_idx" ON "downloads" ("app_slug");
CREATE INDEX IF NOT EXISTS "downloads_created_idx" ON "downloads" ("created_at");
