-- Adds the user's last name (first name already existed as "name").
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "last_name" text;
