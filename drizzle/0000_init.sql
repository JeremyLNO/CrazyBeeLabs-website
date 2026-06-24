-- Crazy Bee Labs — initial schema.
-- No Node locally → run this ONCE in the Neon SQL Editor to create the tables.
-- (Equivalent to `drizzle-kit push` against the schema in src/lib/db/schema.ts.)

CREATE TYPE "plan_interval" AS ENUM ('month', 'quarter', 'year', 'lifetime');
CREATE TYPE "subscription_status" AS ENUM ('active', 'trialing', 'past_due', 'canceled', 'blocked');
CREATE TYPE "license_status" AS ENUM ('active', 'expired', 'blocked', 'revoked');
CREATE TYPE "token_type" AS ENUM ('verify', 'reset');

CREATE TABLE "users" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "email" text NOT NULL,
  "password_hash" text NOT NULL,
  "name" text,
  "email_verified_at" timestamptz,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL
);
CREATE UNIQUE INDEX "users_email_unique" ON "users" ("email");

CREATE TABLE "email_tokens" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "type" "token_type" NOT NULL,
  "token" text NOT NULL,
  "expires_at" timestamptz NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL
);
CREATE UNIQUE INDEX "email_tokens_token_unique" ON "email_tokens" ("token");
CREATE INDEX "email_tokens_user_idx" ON "email_tokens" ("user_id");

CREATE TABLE "subscriptions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "app_slug" text NOT NULL,
  "plan" "plan_interval" NOT NULL,
  "status" "subscription_status" DEFAULT 'active' NOT NULL,
  "paddle_subscription_id" text,
  "paddle_customer_id" text,
  "paddle_transaction_id" text,
  "current_period_end" timestamptz,
  "canceled_at" timestamptz,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL
);
CREATE INDEX "subscriptions_user_idx" ON "subscriptions" ("user_id");
CREATE INDEX "subscriptions_app_idx" ON "subscriptions" ("app_slug");
CREATE UNIQUE INDEX "subscriptions_paddle_sub_unique" ON "subscriptions" ("paddle_subscription_id");

CREATE TABLE "licenses" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "app_slug" text NOT NULL,
  "subscription_id" uuid REFERENCES "subscriptions"("id") ON DELETE SET NULL,
  "license_key" text NOT NULL,
  "licensegate_license_id" text,
  "status" "license_status" DEFAULT 'active' NOT NULL,
  "valid_until" timestamptz,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL
);
CREATE UNIQUE INDEX "licenses_key_unique" ON "licenses" ("license_key");
CREATE INDEX "licenses_user_idx" ON "licenses" ("user_id");
CREATE INDEX "licenses_app_idx" ON "licenses" ("app_slug");

CREATE TABLE "invoices" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "subscription_id" uuid REFERENCES "subscriptions"("id") ON DELETE SET NULL,
  "paddle_transaction_id" text,
  "number" text,
  "url" text,
  "amount_cents" integer,
  "currency" text,
  "created_at" timestamptz DEFAULT now() NOT NULL
);
CREATE INDEX "invoices_user_idx" ON "invoices" ("user_id");
