import { desc, eq } from "drizzle-orm";
import { db, invoices, type Invoice } from "@/lib/db";

export async function getUserInvoices(userId: string): Promise<Invoice[]> {
  return db
    .select()
    .from(invoices)
    .where(eq(invoices.userId, userId))
    .orderBy(desc(invoices.createdAt));
}
