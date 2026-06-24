import { and, eq, inArray } from "drizzle-orm";
import { db, subscriptions, licenses, invoices } from "@/lib/db";
import { addInterval } from "@/lib/dates";
import { issueLicense, setLicenseGateActive } from "@/lib/licensegate";
import type { PlanInterval } from "@/lib/catalog";

export interface ProvisionItem {
  appSlug: string;
  interval: PlanInterval;
}

export interface PaddleRef {
  transactionId?: string | null;
  subscriptionId?: string | null;
  customerId?: string | null;
  invoiceNumber?: string | null;
  invoiceUrl?: string | null;
  amountCents?: number | null;
  currency?: string | null;
}

export interface IssuedLicense {
  appSlug: string;
  licenseKey: string;
  validUntil: Date | null;
}

type SubStatus = "active" | "trialing" | "past_due" | "canceled" | "blocked";

/**
 * Provisions (or extends) a license for each purchased item, after a successful
 * payment. Idempotent: re-delivery upserts to the same state; the invoice insert
 * is guarded by the transaction id.
 */
export async function provisionItems(
  userId: string,
  items: ProvisionItem[],
  ref: PaddleRef,
): Promise<IssuedLicense[]> {
  const now = new Date();
  const issued: IssuedLicense[] = [];

  for (const item of items) {
    const validUntil = addInterval(now, item.interval);

    // ── subscription (one row per user + app) ──
    const existingSub = (
      await db
        .select()
        .from(subscriptions)
        .where(
          and(
            eq(subscriptions.userId, userId),
            eq(subscriptions.appSlug, item.appSlug),
          ),
        )
        .limit(1)
    )[0];

    let subscriptionId: string;
    if (existingSub) {
      await db
        .update(subscriptions)
        .set({
          plan: item.interval,
          status: "active",
          paddleSubscriptionId: ref.subscriptionId ?? existingSub.paddleSubscriptionId,
          paddleCustomerId: ref.customerId ?? existingSub.paddleCustomerId,
          paddleTransactionId: ref.transactionId ?? existingSub.paddleTransactionId,
          currentPeriodEnd: validUntil,
          canceledAt: null,
          updatedAt: now,
        })
        .where(eq(subscriptions.id, existingSub.id));
      subscriptionId = existingSub.id;
    } else {
      const row = (
        await db
          .insert(subscriptions)
          .values({
            userId,
            appSlug: item.appSlug,
            plan: item.interval,
            status: "active",
            paddleSubscriptionId: ref.subscriptionId ?? null,
            paddleCustomerId: ref.customerId ?? null,
            paddleTransactionId: ref.transactionId ?? null,
            currentPeriodEnd: validUntil,
          })
          .returning()
      )[0];
      subscriptionId = row.id;
    }

    // ── license (keep the key on renewal/re-purchase) ──
    const existingLic = (
      await db
        .select()
        .from(licenses)
        .where(
          and(eq(licenses.userId, userId), eq(licenses.appSlug, item.appSlug)),
        )
        .limit(1)
    )[0];

    let licenseKey: string;
    if (existingLic) {
      licenseKey = existingLic.licenseKey;
      await db
        .update(licenses)
        .set({
          status: "active",
          validUntil,
          subscriptionId,
          updatedAt: now,
        })
        .where(eq(licenses.id, existingLic.id));
      await setLicenseGateActive(existingLic.licensegateLicenseId, true);
    } else {
      const { licenseKey: key, licensegateId } = await issueLicense({
        appSlug: item.appSlug,
        validUntil,
      });
      licenseKey = key;
      await db.insert(licenses).values({
        userId,
        appSlug: item.appSlug,
        subscriptionId,
        licenseKey: key,
        licensegateLicenseId: licensegateId,
        status: "active",
        validUntil,
      });
    }

    issued.push({ appSlug: item.appSlug, licenseKey, validUntil });
  }

  // ── invoice (one per transaction) ──
  if (ref.transactionId) {
    const existingInv = (
      await db
        .select()
        .from(invoices)
        .where(eq(invoices.paddleTransactionId, ref.transactionId))
        .limit(1)
    )[0];
    if (!existingInv) {
      await db.insert(invoices).values({
        userId,
        paddleTransactionId: ref.transactionId,
        number: ref.invoiceNumber ?? null,
        url: ref.invoiceUrl ?? null,
        amountCents: ref.amountCents ?? null,
        currency: ref.currency ?? null,
      });
    }
  }

  return issued;
}

/**
 * Applies a subscription state change from Paddle to every row carrying that
 * Paddle subscription id (a multi-app cart can share one subscription), and
 * follows it on the matching licenses: active → unblock (and extend if a new
 * period end is given), anything else → block.
 */
export async function setSubscriptionState(
  paddleSubscriptionId: string,
  state: SubStatus,
  periodEnd?: Date,
): Promise<void> {
  const subs = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.paddleSubscriptionId, paddleSubscriptionId));
  if (!subs.length) return;

  const now = new Date();
  const subSet: Partial<typeof subscriptions.$inferInsert> = {
    status: state,
    updatedAt: now,
  };
  if (periodEnd !== undefined) subSet.currentPeriodEnd = periodEnd;
  if (state === "canceled") subSet.canceledAt = now;
  await db
    .update(subscriptions)
    .set(subSet)
    .where(eq(subscriptions.paddleSubscriptionId, paddleSubscriptionId));

  const active = state === "active" || state === "trialing";
  const ids = subs.map((s) => s.id);
  const licSet: Partial<typeof licenses.$inferInsert> = {
    status: active ? "active" : "blocked",
    updatedAt: now,
  };
  if (active && periodEnd !== undefined) licSet.validUntil = periodEnd;
  await db
    .update(licenses)
    .set(licSet)
    .where(inArray(licenses.subscriptionId, ids));

  // mirror to LicenseGate (best-effort)
  const lics = await db
    .select()
    .from(licenses)
    .where(inArray(licenses.subscriptionId, ids));
  for (const l of lics) await setLicenseGateActive(l.licensegateLicenseId, active);
}

/** Subscription renewal payment: extend the period + license validity. */
export async function renewBySubscription(
  paddleSubscriptionId: string,
  ref: PaddleRef,
): Promise<void> {
  const subs = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.paddleSubscriptionId, paddleSubscriptionId));
  if (!subs.length) return;

  const now = new Date();
  for (const sub of subs) {
    const validUntil = addInterval(now, sub.plan);
    await db
      .update(subscriptions)
      .set({ status: "active", currentPeriodEnd: validUntil, updatedAt: now })
      .where(eq(subscriptions.id, sub.id));
    await db
      .update(licenses)
      .set({ status: "active", validUntil, updatedAt: now })
      .where(eq(licenses.subscriptionId, sub.id));
  }

  if (ref.transactionId) {
    const existing = (
      await db
        .select()
        .from(invoices)
        .where(eq(invoices.paddleTransactionId, ref.transactionId))
        .limit(1)
    )[0];
    if (!existing) {
      await db.insert(invoices).values({
        userId: subs[0].userId,
        paddleTransactionId: ref.transactionId,
        number: ref.invoiceNumber ?? null,
        url: ref.invoiceUrl ?? null,
        amountCents: ref.amountCents ?? null,
        currency: ref.currency ?? null,
      });
    }
  }
}
