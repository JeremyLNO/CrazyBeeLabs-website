export function formatMoney(
  cents: number | string | null | undefined,
  currency?: string | null,
): string {
  const value = Number(cents ?? 0) / 100;
  try {
    return new Intl.NumberFormat("en", {
      style: "currency",
      currency: currency || "EUR",
    }).format(value);
  } catch {
    return `${value.toFixed(2)} ${currency ?? ""}`.trim();
  }
}

export function formatDate(d: Date | string | null | undefined): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
