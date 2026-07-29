-- Adds Google Sign-In linkage to users (mirrors apple_user_id).
-- Apply once in the Neon SQL editor (schema changes are never auto-applied to a live DB).
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "google_user_id" text;
CREATE UNIQUE INDEX IF NOT EXISTS "users_google_user_id_unique" ON "users" ("google_user_id");
