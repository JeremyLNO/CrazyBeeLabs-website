import { randomBytes } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { db, emailTokens, type EmailToken } from "@/lib/db";

type TokenType = "verify" | "reset";

export async function createEmailToken(
  userId: string,
  type: TokenType,
  ttlMinutes = 60,
): Promise<string> {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + ttlMinutes * 60_000);
  await db.insert(emailTokens).values({ userId, type, token, expiresAt });
  return token;
}

/** Returns the (now-deleted) token row if valid & unexpired, else null. */
export async function consumeEmailToken(
  token: string,
  type: TokenType,
): Promise<EmailToken | null> {
  const rows = await db
    .select()
    .from(emailTokens)
    .where(and(eq(emailTokens.token, token), eq(emailTokens.type, type)))
    .limit(1);
  const row = rows[0];
  if (!row) return null;
  await db.delete(emailTokens).where(eq(emailTokens.id, row.id));
  if (row.expiresAt.getTime() < Date.now()) return null;
  return row;
}
