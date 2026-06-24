import { eq } from "drizzle-orm";
import { db, users, type User } from "@/lib/db";
import { hashPassword } from "@/lib/password";

export async function getUserByEmail(email: string): Promise<User | undefined> {
  const rows = await db
    .select()
    .from(users)
    .where(eq(users.email, email.toLowerCase()))
    .limit(1);
  return rows[0];
}

export async function getUserById(id: string): Promise<User | undefined> {
  const rows = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return rows[0];
}

export async function createUser(input: {
  email: string;
  password: string;
  name?: string;
}): Promise<User> {
  const passwordHash = await hashPassword(input.password);
  const rows = await db
    .insert(users)
    .values({
      email: input.email.toLowerCase(),
      passwordHash,
      name: input.name?.trim() || null,
    })
    .returning();
  return rows[0];
}
