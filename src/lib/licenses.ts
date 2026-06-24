import { desc, eq } from "drizzle-orm";
import { db, licenses, subscriptions } from "@/lib/db";

export interface UserLicense {
  id: string;
  appSlug: string;
  licenseKey: string;
  status: "active" | "expired" | "blocked" | "revoked";
  validUntil: Date | null;
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
      plan: subscriptions.plan,
      subStatus: subscriptions.status,
    })
    .from(licenses)
    .leftJoin(subscriptions, eq(licenses.subscriptionId, subscriptions.id))
    .where(eq(licenses.userId, userId))
    .orderBy(desc(licenses.createdAt));

  return rows as UserLicense[];
}
