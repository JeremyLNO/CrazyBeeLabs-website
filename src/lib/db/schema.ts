import {
  pgTable,
  pgEnum,
  uuid,
  text,
  timestamp,
  integer,
  date,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

/* ───────────────────────── enums ───────────────────────── */
export const planIntervalEnum = pgEnum("plan_interval", [
  "month",
  "quarter",
  "year",
  "lifetime",
]);

export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "active",
  "trialing",
  "past_due",
  "canceled",
  "blocked",
]);

export const licenseStatusEnum = pgEnum("license_status", [
  "active",
  "expired",
  "blocked",
  "revoked",
]);

export const tokenTypeEnum = pgEnum("token_type", ["verify", "reset"]);

/* ───────────────────────── users ───────────────────────── */
export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    email: text("email").notNull(),
    passwordHash: text("password_hash").notNull(),
    name: text("name"),
    lastName: text("last_name"),
    birthDate: date("birth_date"),
    emailVerifiedAt: timestamp("email_verified_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [uniqueIndex("users_email_unique").on(t.email)],
);

/* ──────────────────── email / reset tokens ──────────────────── */
export const emailTokens = pgTable(
  "email_tokens",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: tokenTypeEnum("type").notNull(),
    token: text("token").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    uniqueIndex("email_tokens_token_unique").on(t.token),
    index("email_tokens_user_idx").on(t.userId),
  ],
);

/* ───────────────────── subscriptions ─────────────────────
   One row per purchased plan (per app, per user). `appSlug`
   references the in-code CATALOG, not a DB table. */
export const subscriptions = pgTable(
  "subscriptions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    appSlug: text("app_slug").notNull(),
    plan: planIntervalEnum("plan").notNull(),
    status: subscriptionStatusEnum("status").notNull().default("active"),
    // Paddle linkage (null for a lifetime one-time purchase has no subscription id)
    paddleSubscriptionId: text("paddle_subscription_id"),
    paddleCustomerId: text("paddle_customer_id"),
    paddleTransactionId: text("paddle_transaction_id"),
    // null = perpetual (lifetime); otherwise the paid-through date
    currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }),
    canceledAt: timestamp("canceled_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index("subscriptions_user_idx").on(t.userId),
    index("subscriptions_app_idx").on(t.appSlug),
    // not unique: one Paddle subscription can cover several apps (multi-item cart)
    index("subscriptions_paddle_sub_idx").on(t.paddleSubscriptionId),
  ],
);

/* ───────────────────────── licenses ─────────────────────────
   The key the user enters in the macOS app. Mirrors a LicenseGate
   license; `validUntil` is what the app checks in the background. */
export const licenses = pgTable(
  "licenses",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    appSlug: text("app_slug").notNull(),
    subscriptionId: uuid("subscription_id").references(() => subscriptions.id, {
      onDelete: "set null",
    }),
    licenseKey: text("license_key").notNull(),
    licensegateLicenseId: text("licensegate_license_id"),
    status: licenseStatusEnum("status").notNull().default("active"),
    // null = perpetual (lifetime)
    validUntil: timestamp("valid_until", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    uniqueIndex("licenses_key_unique").on(t.licenseKey),
    index("licenses_user_idx").on(t.userId),
    index("licenses_app_idx").on(t.appSlug),
  ],
);

/* ───────────────────────── invoices ───────────────────────── */
export const invoices = pgTable(
  "invoices",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    subscriptionId: uuid("subscription_id").references(() => subscriptions.id, {
      onDelete: "set null",
    }),
    paddleTransactionId: text("paddle_transaction_id"),
    number: text("number"),
    url: text("url"),
    amountCents: integer("amount_cents"),
    currency: text("currency"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [index("invoices_user_idx").on(t.userId)],
);

/* ───────────────────────── downloads ─────────────────────────
   One row per app download by a signed-in user. Feeds marketing
   automations (e.g. OneSignal) — "who downloaded what, and when". */
export const downloads = pgTable(
  "downloads",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    appSlug: text("app_slug").notNull(),
    platform: text("platform"), // "mac" | "ios"
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index("downloads_user_idx").on(t.userId),
    index("downloads_app_idx").on(t.appSlug),
    index("downloads_created_idx").on(t.createdAt),
  ],
);

/* ─────────────────── newsletter subscribers ───────────────────
   Home-page opt-in (email + first name). Feeds marketing (OneSignal). */
export const newsletterSubscribers = pgTable(
  "newsletter_subscribers",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    email: text("email").notNull(),
    firstName: text("first_name"),
    source: text("source"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [uniqueIndex("newsletter_email_unique").on(t.email)],
);

/* ───────────────────── inferred types ───────────────────── */
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Subscription = typeof subscriptions.$inferSelect;
export type License = typeof licenses.$inferSelect;
export type Invoice = typeof invoices.$inferSelect;
export type EmailToken = typeof emailTokens.$inferSelect;
export type Download = typeof downloads.$inferSelect;
export type NewsletterSubscriber = typeof newsletterSubscribers.$inferSelect;
