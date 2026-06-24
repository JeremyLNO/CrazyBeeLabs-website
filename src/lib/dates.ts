import type { PlanInterval } from "@/lib/catalog";

/** Returns the new validity end for a plan, or null for lifetime (perpetual). */
export function addInterval(from: Date, interval: PlanInterval): Date | null {
  if (interval === "lifetime") return null;
  const d = new Date(from);
  if (interval === "month") d.setMonth(d.getMonth() + 1);
  else if (interval === "quarter") d.setMonth(d.getMonth() + 3);
  else if (interval === "year") d.setFullYear(d.getFullYear() + 1);
  return d;
}
