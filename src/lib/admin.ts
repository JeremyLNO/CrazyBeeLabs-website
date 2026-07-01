import {
  and,
  count,
  countDistinct,
  desc,
  eq,
  gt,
  gte,
  isNull,
  or,
  sql,
} from "drizzle-orm";
import { db, downloads, invoices, licenses, subscriptions, users } from "@/lib/db";

export async function getSalesSummary() {
  const now = new Date();
  const since = new Date(now.getTime() - 30 * 86_400_000);

  const revenue = await db
    .select({
      currency: invoices.currency,
      totalCents: sql<number>`coalesce(sum(${invoices.amountCents}), 0)`,
      orders: count(),
    })
    .from(invoices)
    .groupBy(invoices.currency);

  const revenue30 = await db
    .select({
      currency: invoices.currency,
      totalCents: sql<number>`coalesce(sum(${invoices.amountCents}), 0)`,
    })
    .from(invoices)
    .where(gte(invoices.createdAt, since))
    .groupBy(invoices.currency);

  const activeWhere = and(
    eq(licenses.status, "active"),
    or(isNull(licenses.validUntil), gt(licenses.validUntil, now)),
  );
  const activeLicenses =
    (await db.select({ n: count() }).from(licenses).where(activeWhere))[0]?.n ?? 0;
  const payingCustomers =
    (
      await db
        .select({ n: countDistinct(licenses.userId) })
        .from(licenses)
        .where(activeWhere)
    )[0]?.n ?? 0;
  const ordersCount = (await db.select({ n: count() }).from(invoices))[0]?.n ?? 0;
  const totalCustomers = (await db.select({ n: count() }).from(users))[0]?.n ?? 0;

  return {
    revenue,
    revenue30,
    activeLicenses,
    payingCustomers,
    ordersCount,
    totalCustomers,
  };
}

export async function getSubscriptionBreakdown() {
  const byApp = await db
    .select({ appSlug: subscriptions.appSlug, n: count() })
    .from(subscriptions)
    .where(eq(subscriptions.status, "active"))
    .groupBy(subscriptions.appSlug);
  const byPlan = await db
    .select({ plan: subscriptions.plan, n: count() })
    .from(subscriptions)
    .where(eq(subscriptions.status, "active"))
    .groupBy(subscriptions.plan);
  return { byApp, byPlan };
}

export async function getOrders(limit?: number) {
  const base = db
    .select({
      id: invoices.id,
      createdAt: invoices.createdAt,
      amountCents: invoices.amountCents,
      currency: invoices.currency,
      number: invoices.number,
      url: invoices.url,
      txn: invoices.paddleTransactionId,
      email: users.email,
      appSlug: subscriptions.appSlug,
      plan: subscriptions.plan,
    })
    .from(invoices)
    .leftJoin(users, eq(invoices.userId, users.id))
    .leftJoin(subscriptions, eq(invoices.subscriptionId, subscriptions.id))
    .orderBy(desc(invoices.createdAt));
  return limit ? await base.limit(limit) : await base;
}

export async function getAllLicensesAdmin() {
  return db
    .select({
      id: licenses.id,
      appSlug: licenses.appSlug,
      licenseKey: licenses.licenseKey,
      status: licenses.status,
      validUntil: licenses.validUntil,
      createdAt: licenses.createdAt,
      email: users.email,
      plan: subscriptions.plan,
      subStatus: subscriptions.status,
    })
    .from(licenses)
    .leftJoin(users, eq(licenses.userId, users.id))
    .leftJoin(subscriptions, eq(licenses.subscriptionId, subscriptions.id))
    .orderBy(desc(licenses.createdAt));
}

export interface DownloadRow {
  id: string;
  createdAt: Date;
  appSlug: string;
  platform: string | null;
  email: string | null;
  name: string | null;
}

/** Recent downloads for the admin view. Returns [] if the table isn't migrated yet. */
export async function getDownloads(limit = 200): Promise<DownloadRow[]> {
  try {
    return await db
      .select({
        id: downloads.id,
        createdAt: downloads.createdAt,
        appSlug: downloads.appSlug,
        platform: downloads.platform,
        email: users.email,
        name: users.name,
      })
      .from(downloads)
      .leftJoin(users, eq(downloads.userId, users.id))
      .orderBy(desc(downloads.createdAt))
      .limit(limit);
  } catch (e) {
    console.error("[admin] getDownloads failed (table not migrated?)", e);
    return [];
  }
}
