import { db, downloads } from "@/lib/db";

/** Records that a signed-in user downloaded an app (feeds marketing automations). */
export async function recordDownload(input: {
  userId: string;
  appSlug: string;
  platform?: string;
}): Promise<void> {
  await db.insert(downloads).values({
    userId: input.userId,
    appSlug: input.appSlug,
    platform: input.platform ?? null,
  });
}
