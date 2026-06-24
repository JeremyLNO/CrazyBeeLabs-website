import { desc, eq } from "drizzle-orm";
import { db, licenses, subscriptions, type License } from "@/lib/db";

export async function getLicenseByKey(key: string): Promise<License | undefined> {
  const rows = await db
    .select()
    .from(licenses)
    .where(eq(licenses.licenseKey, key))
    .limit(1);
  return rows[0];
}

export interface UserLicense {
  id: string;
  appSlug: string;
  licenseKey: string;
  status: "active" | "expired" | "blocked" | "revoked";
  validUntil: Date | null;
  subscriptionId: string | null;
  plan: "month" | "quarter" | "year" | "lifetime" | null;
  subStatus: "active" | "trialing" | "past_due" | "canceled" | "blocked" | null;
}

export async function getUserLicenses(userId: string): Promise<UserLicense[]> {
  const rows = await db
    .select({
      id: licenses.id,
      appSlug: licenses.appSlug,
      licenseKey: licenses.licenseKey,
      status: licenses.status,
      validUntil: licenses.validUntil,
      subscriptionId: licenses.subscriptionId,
      plan: subscriptions.plan,
      subStatus: subscriptions.status,
    })
    .from(licenses)
    .leftJoin(subscriptions, eq(licenses.subscriptionId, subscriptions.id))
    .where(eq(licenses.userId, userId))
    .orderBy(desc(licenses.createdAt));

  return rows as UserLicense[];
}
