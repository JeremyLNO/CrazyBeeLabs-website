export const LOCALES = ["en", "fr", "de", "es", "pt"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  fr: "Français",
  de: "Deutsch",
  es: "Español",
  pt: "Português",
};

/** Map a raw navigator language (e.g. "fr-CA") to a supported locale, or null. */
export function matchLocale(input?: string | null): Locale | null {
  if (!input) return null;
  const base = input.toLowerCase().split("-")[0];
  return (LOCALES as readonly string[]).includes(base) ? (base as Locale) : null;
}
