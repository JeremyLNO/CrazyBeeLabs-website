export type Period = "7d" | "month" | "3m" | "year" | "lastyear" | "all";

export const PERIODS: { key: Period; label: string }[] = [
  { key: "7d", label: "Last 7 days" },
  { key: "month", label: "This month" },
  { key: "3m", label: "Last 3 months" },
  { key: "year", label: "This year" },
  { key: "lastyear", label: "Last year" },
  { key: "all", label: "All time" },
];

export function isPeriod(v: string | undefined): v is Period {
  return !!v && PERIODS.some((p) => p.key === v);
}

function startOfMonth(d: Date, monthsAgo = 0): Date {
  return new Date(d.getFullYear(), d.getMonth() - monthsAgo, 1, 0, 0, 0, 0);
}

function startOfYear(year: number): Date {
  return new Date(year, 0, 1, 0, 0, 0, 0);
}

/** Inclusive start / exclusive end for a period, relative to `now`. Empty = no filter (all time). */
export function periodRange(
  period: Period,
  now: Date = new Date(),
): { start?: Date; end?: Date } {
  switch (period) {
    case "7d":
      return { start: new Date(now.getTime() - 7 * 86_400_000) };
    case "month":
      return { start: startOfMonth(now) };
    case "3m":
      // Last 3 months including the current one.
      return { start: startOfMonth(now, 2) };
    case "year":
      return { start: startOfYear(now.getFullYear()) };
    case "lastyear":
      return { start: startOfYear(now.getFullYear() - 1), end: startOfYear(now.getFullYear()) };
    case "all":
    default:
      return {};
  }
}
