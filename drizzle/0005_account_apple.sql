-- Account compliance: Sign in with Apple, password reset, and invoice retention.
-- No Node locally → run this ONCE in the Neon SQL Editor.

-- Apple-only accounts have no password.
ALTER TABLE "users" ALTER COLUMN "password_hash" DROP NOT NULL;

-- Apple's stable per-app user identifier ("sub" claim).
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "apple_user_id" text;
CREATE UNIQUE INDEX IF NOT EXISTS "users_apple_user_id_unique" ON "users" ("apple_user_id");

-- Invoices must outlive account deletion (French Code de commerce Art. L123-22:
-- ~10-year retention for accounting records). Detach instead of cascading.
ALTER TABLE "invoices" ALTER COLUMN "user_id" DROP NOT NULL;
ALTER TABLE "invoices" DROP CONSTRAINT IF EXISTS "invoices_user_id_fkey";
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL;
