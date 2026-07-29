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

export async function getUserByAppleId(appleUserId: string): Promise<User | undefined> {
  const rows = await db.select().from(users).where(eq(users.appleUserId, appleUserId)).limit(1);
  return rows[0];
}

/**
 * Finds-or-creates the user behind a verified Apple identity. If an account
 * with that email already exists (e.g. created with a password on the
 * website) it's linked rather than duplicated.
 */
export async function findOrCreateAppleUser(input: {
  appleUserId: string;
  email: string | null;
  name?: string | null;
}): Promise<User> {
  const byApple = await getUserByAppleId(input.appleUserId);
  if (byApple) return byApple;

  if (input.email) {
    const byEmail = await getUserByEmail(input.email);
    if (byEmail) {
      const rows = await db
        .update(users)
        .set({ appleUserId: input.appleUserId, updatedAt: new Date() })
        .where(eq(users.id, byEmail.id))
        .returning();
      return rows[0];
    }
  }

  const rows = await db
    .insert(users)
    .values({
      email: (input.email ?? `${input.appleUserId}@privaterelay.appleid.local`).toLowerCase(),
      passwordHash: null,
      appleUserId: input.appleUserId,
      name: input.name?.trim() || null,
      // Apple has already verified this address before issuing the identity token.
      emailVerifiedAt: new Date(),
    })
    .returning();
  return rows[0];
}

export async function getUserByGoogleId(googleUserId: string): Promise<User | undefined> {
  const rows = await db.select().from(users).where(eq(users.googleUserId, googleUserId)).limit(1);
  return rows[0];
}

/**
 * Finds-or-creates the user behind a verified Google identity. Links to an
 * existing account with the same email (created with a password or via Apple)
 * rather than duplicating it.
 */
export async function findOrCreateGoogleUser(input: {
  googleUserId: string;
  email: string | null;
  name?: string | null;
}): Promise<User> {
  const byGoogle = await getUserByGoogleId(input.googleUserId);
  if (byGoogle) return byGoogle;

  if (input.email) {
    const byEmail = await getUserByEmail(input.email);
    if (byEmail) {
      const rows = await db
        .update(users)
        .set({ googleUserId: input.googleUserId, updatedAt: new Date() })
        .where(eq(users.id, byEmail.id))
        .returning();
      return rows[0];
    }
  }

  const rows = await db
    .insert(users)
    .values({
      email: (input.email ?? `${input.googleUserId}@googleuser.local`).toLowerCase(),
      passwordHash: null,
      googleUserId: input.googleUserId,
      name: input.name?.trim() || null,
      // Google verified the address before issuing the id token (email_verified).
      emailVerifiedAt: new Date(),
    })
    .returning();
  return rows[0];
}

/** Used by the reset-password flow to set a fresh password (also usable to add one to an Apple-only account). */
export async function setUserPassword(userId: string, plainPassword: string): Promise<void> {
  const passwordHash = await hashPassword(plainPassword);
  await db.update(users).set({ passwordHash, updatedAt: new Date() }).where(eq(users.id, userId));
}

export async function createUser(input: {
  email: string;
  password: string;
  name?: string;
  lastName?: string;
  birthDate?: string;
}): Promise<User> {
  const passwordHash = await hashPassword(input.password);
  const rows = await db
    .insert(users)
    .values({
      email: input.email.toLowerCase(),
      passwordHash,
      name: input.name?.trim() || null,
      lastName: input.lastName?.trim() || null,
      birthDate: input.birthDate?.trim() || null,
    })
    .returning();
  return rows[0];
}

export async function updateUserProfile(
  userId: string,
  input: { name?: string; lastName?: string; birthDate?: string },
): Promise<User> {
  const rows = await db
    .update(users)
    .set({
      name: input.name?.trim() || null,
      lastName: input.lastName?.trim() || null,
      birthDate: input.birthDate?.trim() || null,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
    .returning();
  return rows[0];
}
