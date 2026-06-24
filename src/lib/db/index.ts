import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  // Surfaced at runtime rather than build so Vercel build doesn't fail before env is set.
  console.warn("[db] DATABASE_URL is not set — database calls will fail.");
}

const sql = neon(process.env.DATABASE_URL ?? "");
export const db = drizzle(sql, { schema });

export * from "./schema";
