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
    // Null for accounts created via Sign in with Apple that never set a password.
    passwordHash: text("password_hash"),
    // Apple's stable per-app user identifier ("sub" claim). Null for email/password accounts.
    appleUserId: text("apple_user_id"),
    // Google's stable per-user identifier ("sub" claim). Null unless linked via native Google Sign-In.
    googleUserId: text("google_user_id"),
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
  (t) => [
    uniqueIndex("users_email_unique").on(t.email),
    uniqueIndex("users_apple_user_id_unique").on(t.appleUserId),
    uniqueIndex("users_google_user_id_unique").on(t.googleUserId),
  ],
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

/* ───────────────────────── invoices ─────────────────────────
   Accounting records must outlive account deletion (French Code de
   commerce Art. L123-22: ~10-year retention). Deleting a user detaches
   their invoices (userId → null) instead of deleting the rows — the
   amounts/currency/dates/Paddle transaction id are kept, the link to
   the person is not. */
export const invoices = pgTable(
  "invoices",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
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

/* ───────────────────── app waitlist signups ─────────────────────
   "Notify me" opt-in on a not-yet-published app's page (email + first
   name), one row per email+app so someone can join more than one
   app's waitlist. Emailed once when that app's comingSoon flag flips. */
export const waitlistSignups = pgTable(
  "waitlist_signups",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    email: text("email").notNull(),
    firstName: text("first_name"),
    appSlug: text("app_slug").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [uniqueIndex("waitlist_email_app_unique").on(t.email, t.appSlug)],
);

/* ───────────────────────── page views ─────────────────────────
   First-party, anonymous pageview counter (no cookies, no IP stored).
   Feeds the admin analytics funnel: visits → downloads → orders. */
export const pageViews = pgTable(
  "page_views",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    path: text("path").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index("page_views_created_idx").on(t.createdAt),
    index("page_views_path_idx").on(t.path),
  ],
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
export type WaitlistSignup = typeof waitlistSignups.$inferSelect;
export type PageView = typeof pageViews.$inferSelect;
