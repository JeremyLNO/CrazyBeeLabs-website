import {
  and,
  count,
  countDistinct,
  desc,
  eq,
  gt,
  gte,
  isNull,
  lt,
  or,
  sql,
  type SQL,
} from "drizzle-orm";
import type { AnyPgColumn } from "drizzle-orm/pg-core";
import {
  db,
  downloads,
  invoices,
  licenses,
  newsletterSubscribers,
  pageViews,
  subscriptions,
  users,
  waitlistSignups,
} from "@/lib/db";
import { CATALOG } from "@/lib/catalog";
import { SHOWCASE, getShowcaseApp, type Device } from "@/lib/showcase";
import { LOCALES } from "@/lib/i18n/config";
import { periodRange, type Period } from "@/lib/adminPeriod";

const TRUE = sql`true`;

/** AND-combine start/end bounds on a timestamp column; `TRUE` if unbounded (all time). */
function rangeWhere(col: AnyPgColumn, start?: Date, end?: Date) {
  const conds: SQL[] = [];
  if (start) conds.push(gte(col, start));
  if (end) conds.push(lt(col, end));
  return conds.length ? and(...conds)! : TRUE;
}

export async function getSalesSummary(period: Period = "all") {
  const now = new Date();
  const { start, end } = periodRange(period, now);

  const revenueAll = await db
    .select({
      currency: invoices.currency,
      totalCents: sql<number>`coalesce(sum(${invoices.amountCents}), 0)`,
      orders: count(),
    })
    .from(invoices)
    .groupBy(invoices.currency);

  const invoiceWhere = rangeWhere(invoices.createdAt, start, end);
  const revenuePeriod = await db
    .select({
      currency: invoices.currency,
      totalCents: sql<number>`coalesce(sum(${invoices.amountCents}), 0)`,
    })
    .from(invoices)
    .where(invoiceWhere)
    .groupBy(invoices.currency);

  const ordersPeriodCount =
    (await db.select({ n: count() }).from(invoices).where(invoiceWhere))[0]?.n ?? 0;

  const userWhere = rangeWhere(users.createdAt, start, end);
  const newAccounts =
    (await db.select({ n: count() }).from(users).where(userWhere))[0]?.n ?? 0;

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
    period,
    revenueAll,
    revenuePeriod,
    ordersPeriodCount,
    newAccounts,
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

/* ───────────────────── accounts & newsletter ───────────────────── */

export interface AccountRow {
  id: string;
  email: string;
  name: string | null;
  createdAt: Date;
  emailVerifiedAt: Date | null;
  activeLicenses: number;
}

/** Registered accounts, each with its count of currently-active licenses. */
export async function getAccountsAdmin(limit = 500): Promise<AccountRow[]> {
  const allUsers = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      createdAt: users.createdAt,
      emailVerifiedAt: users.emailVerifiedAt,
    })
    .from(users)
    .orderBy(desc(users.createdAt))
    .limit(limit);

  const licenseCounts = await db
    .select({ userId: licenses.userId, n: count() })
    .from(licenses)
    .where(eq(licenses.status, "active"))
    .groupBy(licenses.userId);
  const counts = new Map(licenseCounts.map((l) => [l.userId, l.n]));

  return allUsers.map((u) => ({ ...u, activeLicenses: counts.get(u.id) ?? 0 }));
}

export interface SubscriberRow {
  id: string;
  email: string;
  firstName: string | null;
  source: string | null;
  createdAt: Date;
  hasAccount: boolean;
}

/** Newsletter subscribers, flagged with whether they've also created an account. Returns [] if the table isn't migrated yet. */
export async function getNewsletterSubscribers(limit = 500): Promise<SubscriberRow[]> {
  try {
    const rows = await db
      .select({
        id: newsletterSubscribers.id,
        email: newsletterSubscribers.email,
        firstName: newsletterSubscribers.firstName,
        source: newsletterSubscribers.source,
        createdAt: newsletterSubscribers.createdAt,
        accountId: users.id,
      })
      .from(newsletterSubscribers)
      .leftJoin(users, eq(users.email, newsletterSubscribers.email))
      .orderBy(desc(newsletterSubscribers.createdAt))
      .limit(limit);
    return rows.map((r) => ({ ...r, hasAccount: Boolean(r.accountId) }));
  } catch (e) {
    console.error("[admin] getNewsletterSubscribers failed (table not migrated?)", e);
    return [];
  }
}

/* ───────────────────────── languages ───────────────────────── */

export interface LanguageRow {
  /** Base language tag, e.g. "fr", "it". */
  tag: string;
  /** Human name ("Italian"), or the tag itself if the runtime can't name it. */
  label: string;
  views: number;
  share: number;
  /** True when the site already ships this language. */
  supported: boolean;
}

export interface LanguageStats {
  /** Pageviews by the locale we actually served. */
  served: LanguageRow[];
  /** Pageviews by the browser's preferred language, supported or not. */
  browser: LanguageRow[];
  /** Browser languages we don't offer, ranked — the translation shortlist. */
  missing: LanguageRow[];
  /** Pageviews carrying a language signal (older rows predate it). */
  withSignal: number;
  /** Total pageviews in the period, including pre-signal rows. */
  totalViews: number;
}

/** "it" -> "Italian". Falls back to the raw tag if Intl can't name it. */
function languageLabel(tag: string): string {
  try {
    const name = new Intl.DisplayNames(["en"], { type: "language" }).of(tag);
    return name && name !== tag ? name : tag;
  } catch {
    return tag;
  }
}

function toRows(
  counts: { tag: string | null; n: number }[],
  denominator: number,
): LanguageRow[] {
  return counts
    .filter((c): c is { tag: string; n: number } => Boolean(c.tag))
    .map((c) => ({
      tag: c.tag,
      label: languageLabel(c.tag),
      views: c.n,
      share: denominator > 0 ? c.n / denominator : 0,
      supported: (LOCALES as readonly string[]).includes(c.tag),
    }))
    .sort((a, b) => b.views - a.views || a.label.localeCompare(b.label));
}

/**
 * Language breakdown from the anonymous pageview beacon.
 *
 * Counted in pageviews, not people — there's no visitor id to dedupe on, by
 * design. Someone browsing ten pages counts ten times, so read these as
 * relative weight rather than a headcount.
 */
export async function getLanguageStats(period: Period = "all"): Promise<LanguageStats> {
  const { start, end } = periodRange(period, new Date());
  const where = rangeWhere(pageViews.createdAt, start, end);

  try {
    const [totals, servedRows, browserRows] = await Promise.all([
      db.select({ n: count() }).from(pageViews).where(where),
      db
        .select({ tag: pageViews.siteLocale, n: count() })
        .from(pageViews)
        .where(where)
        .groupBy(pageViews.siteLocale),
      db
        .select({ tag: pageViews.browserLocale, n: count() })
        .from(pageViews)
        .where(where)
        .groupBy(pageViews.browserLocale),
    ]);

    const totalViews = totals[0]?.n ?? 0;
    const withSignal = browserRows
      .filter((r) => r.tag)
      .reduce((sum, r) => sum + r.n, 0);

    const served = toRows(servedRows, withSignal);
    const browser = toRows(browserRows, withSignal);
    return {
      served,
      browser,
      missing: browser.filter((r) => !r.supported),
      withSignal,
      totalViews,
    };
  } catch (e) {
    console.error("[admin] getLanguageStats failed (columns not migrated?)", e);
    return { served: [], browser: [], missing: [], withSignal: 0, totalViews: 0 };
  }
}

/* ───────────────────────── waitlist ───────────────────────── */

export interface WaitlistAppRow {
  appSlug: string;
  appName: string;
  device: Device;
  signups: number;
}

export interface WaitlistSignupRow {
  id: string;
  email: string;
  firstName: string | null;
  appSlug: string;
  createdAt: Date;
}

/**
 * Signup counts per unreleased app. Every app still flagged `comingSoon` is
 * listed (zero included) so the table shows what's *not* getting traction too;
 * a slug that has signups but is no longer coming soon still shows up, so
 * shipping an app never silently hides its list.
 */
export async function getWaitlistStats(): Promise<WaitlistAppRow[]> {
  let counts = new Map<string, number>();
  try {
    const rows = await db
      .select({ appSlug: waitlistSignups.appSlug, n: count() })
      .from(waitlistSignups)
      .groupBy(waitlistSignups.appSlug);
    counts = new Map(rows.map((r) => [r.appSlug, r.n]));
  } catch (e) {
    console.error("[admin] waitlist aggregate failed (table not migrated?)", e);
  }

  const slugs = new Set<string>([
    ...SHOWCASE.filter((a) => a.comingSoon).map((a) => a.slug),
    ...counts.keys(),
  ]);

  return [...slugs]
    .map((slug) => {
      const app = getShowcaseApp(slug);
      return {
        appSlug: slug,
        appName: app?.name ?? slug,
        device: app?.device ?? "mac",
        signups: counts.get(slug) ?? 0,
      };
    })
    .sort((a, b) => b.signups - a.signups || a.appName.localeCompare(b.appName));
}

/** Individual waitlist signups, newest first. Returns [] if the table isn't migrated yet. */
export async function getWaitlistSignups(limit = 500): Promise<WaitlistSignupRow[]> {
  try {
    return await db
      .select({
        id: waitlistSignups.id,
        email: waitlistSignups.email,
        firstName: waitlistSignups.firstName,
        appSlug: waitlistSignups.appSlug,
        createdAt: waitlistSignups.createdAt,
      })
      .from(waitlistSignups)
      .orderBy(desc(waitlistSignups.createdAt))
      .limit(limit);
  } catch (e) {
    console.error("[admin] getWaitlistSignups failed (table not migrated?)", e);
    return [];
  }
}

/* ───────────────────────── per-app stats ───────────────────────── */

export interface AppStat {
  appSlug: string;
  downloaders: number;
  licensesTotal: number;
  byPlan: { plan: string; n: number }[];
  byStatus: { status: string; n: number }[];
}

/** Downloaders, license count and license mix (plan / status) for every licensed macOS app. */
export async function getAppStats(): Promise<AppStat[]> {
  let dlRows: { appSlug: string; n: number }[] = [];
  try {
    dlRows = await db
      .select({ appSlug: downloads.appSlug, n: countDistinct(downloads.userId) })
      .from(downloads)
      .groupBy(downloads.appSlug);
  } catch (e) {
    console.error("[admin] downloads aggregate failed (table not migrated?)", e);
  }

  const licTotalRows = await db
    .select({ appSlug: licenses.appSlug, n: count() })
    .from(licenses)
    .groupBy(licenses.appSlug);

  const byStatusRows = await db
    .select({ appSlug: licenses.appSlug, status: licenses.status, n: count() })
    .from(licenses)
    .groupBy(licenses.appSlug, licenses.status);

  const byPlanRows = await db
    .select({ appSlug: licenses.appSlug, plan: subscriptions.plan, n: count() })
    .from(licenses)
    .leftJoin(subscriptions, eq(licenses.subscriptionId, subscriptions.id))
    .groupBy(licenses.appSlug, subscriptions.plan);

  return CATALOG.map((app) => ({
    appSlug: app.slug,
    downloaders: dlRows.find((r) => r.appSlug === app.slug)?.n ?? 0,
    licensesTotal: licTotalRows.find((r) => r.appSlug === app.slug)?.n ?? 0,
    byStatus: byStatusRows
      .filter((r) => r.appSlug === app.slug)
      .map((r) => ({ status: r.status, n: r.n })),
    byPlan: byPlanRows
      .filter((r) => r.appSlug === app.slug && r.plan)
      .map((r) => ({ plan: r.plan as string, n: r.n })),
  }));
}

/* ───────────────────────── analytics funnel ───────────────────────── */
/* First-party only (page_views): no third-party trackers, no cookies, no IP. */

export interface FunnelSummary {
  period: Period;
  visits: number;
  downloads: number;
  orders: number;
}

/** Visits → downloads → orders for a period. Visits is 0 if page_views isn't migrated yet. */
export async function getFunnelSummary(period: Period = "all"): Promise<FunnelSummary> {
  const { start, end } = periodRange(period);

  let visits = 0;
  try {
    visits =
      (
        await db
          .select({ n: count() })
          .from(pageViews)
          .where(rangeWhere(pageViews.createdAt, start, end))
      )[0]?.n ?? 0;
  } catch (e) {
    console.error("[admin] page_views aggregate failed (table not migrated?)", e);
  }

  const downloadsCount =
    (
      await db
        .select({ n: count() })
        .from(downloads)
        .where(rangeWhere(downloads.createdAt, start, end))
    )[0]?.n ?? 0;

  const ordersCount =
    (
      await db
        .select({ n: count() })
        .from(invoices)
        .where(rangeWhere(invoices.createdAt, start, end))
    )[0]?.n ?? 0;

  return { period, visits, downloads: downloadsCount, orders: ordersCount };
}

export interface DailyTrendRow {
  day: string;
  visits: number;
  downloads: number;
}

/** Visits + downloads per day for the last N days (UTC), zero-filled. */
export async function getDailyTrend(days = 14): Promise<DailyTrendRow[]> {
  const since = new Date(Date.now() - days * 86_400_000);
  const dayCol = <T extends AnyPgColumn>(col: T) =>
    sql<string>`to_char(date_trunc('day', ${col}), 'YYYY-MM-DD')`;

  let visitRows: { day: string; n: number }[] = [];
  try {
    visitRows = await db
      .select({ day: dayCol(pageViews.createdAt), n: count() })
      .from(pageViews)
      .where(gte(pageViews.createdAt, since))
      .groupBy(sql`1`);
  } catch (e) {
    console.error("[admin] page_views daily trend failed (table not migrated?)", e);
  }

  const downloadRows = await db
    .select({ day: dayCol(downloads.createdAt), n: count() })
    .from(downloads)
    .where(gte(downloads.createdAt, since))
    .groupBy(sql`1`);

  const visitsByDay = new Map(visitRows.map((r) => [r.day, r.n]));
  const downloadsByDay = new Map(downloadRows.map((r) => [r.day, r.n]));

  const out: DailyTrendRow[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86_400_000);
    const day = d.toISOString().slice(0, 10);
    out.push({
      day,
      visits: visitsByDay.get(day) ?? 0,
      downloads: downloadsByDay.get(day) ?? 0,
    });
  }
  return out;
}
