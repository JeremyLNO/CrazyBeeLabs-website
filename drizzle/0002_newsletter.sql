-- Newsletter subscribers: home-page opt-in (email + first name). Feeds marketing.
CREATE TABLE IF NOT EXISTS "newsletter_subscribers" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "email" text NOT NULL,
  "first_name" text,
  "source" text,
  "created_at" timestamptz DEFAULT now() NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "newsletter_email_unique" ON "newsletter_subscribers" ("email");
