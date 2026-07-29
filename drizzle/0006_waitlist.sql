-- App waitlist signups: "Notify me" opt-in on a not-yet-published app's page
-- (email + first name), one row per email+app. Emailed once the app ships.
CREATE TABLE IF NOT EXISTS "waitlist_signups" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "email" text NOT NULL,
  "first_name" text,
  "app_slug" text NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "waitlist_email_app_unique" ON "waitlist_signups" ("email", "app_slug");
