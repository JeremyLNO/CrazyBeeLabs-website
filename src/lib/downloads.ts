import { desc, eq } from "drizzle-orm";
import { db, downloads, type Download } from "@/lib/db";

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

/** The signed-in user's own download history, newest first. */
export async function getMyDownloads(userId: string): Promise<Download[]> {
  return db
    .select()
    .from(downloads)
    .where(eq(downloads.userId, userId))
    .orderBy(desc(downloads.createdAt));
}
