import { NextResponse } from "next/server";
import { eq, desc } from "drizzle-orm";
import { getSessionUserId } from "@/lib/mobile-auth";
import { db, downloads, invoices, licenses, subscriptions } from "@/lib/db";
import { getUserById } from "@/lib/users";

export const runtime = "nodejs";

/** Lets a signed-in user download a JSON export of everything we hold about them. */
export async function GET(req: Request) {
  const userId = await getSessionUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const user = await getUserById(userId);
  if (!user) {
    return NextResponse.json({ error: "Account not found." }, { status: 404 });
  }

  const [myDownloads, myLicenses, myInvoices, mySubscriptions] = await Promise.all([
    db.select().from(downloads).where(eq(downloads.userId, userId)).orderBy(desc(downloads.createdAt)),
    db.select().from(licenses).where(eq(licenses.userId, userId)).orderBy(desc(licenses.createdAt)),
    db.select().from(invoices).where(eq(invoices.userId, userId)).orderBy(desc(invoices.createdAt)),
    db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId))
      .orderBy(desc(subscriptions.createdAt)),
  ]);

  const payload = {
    exportedAt: new Date().toISOString(),
    profile: {
      email: user.email,
      firstName: user.name,
      lastName: user.lastName,
      birthDate: user.birthDate,
      emailVerifiedAt: user.emailVerifiedAt,
      createdAt: user.createdAt,
    },
    downloads: myDownloads.map((d) => ({
      appSlug: d.appSlug,
      platform: d.platform,
      createdAt: d.createdAt,
    })),
    subscriptions: mySubscriptions.map((s) => ({
      appSlug: s.appSlug,
      plan: s.plan,
      status: s.status,
      currentPeriodEnd: s.currentPeriodEnd,
      createdAt: s.createdAt,
    })),
    licenses: myLicenses.map((l) => ({
      appSlug: l.appSlug,
      licenseKey: l.licenseKey,
      status: l.status,
      validUntil: l.validUntil,
      createdAt: l.createdAt,
    })),
    invoices: myInvoices.map((i) => ({
      number: i.number,
      amountCents: i.amountCents,
      currency: i.currency,
      createdAt: i.createdAt,
    })),
  };

  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      "content-type": "application/json",
      "content-disposition": "attachment; filename=\"crazybeelabs-my-data.json\"",
    },
  });
}
