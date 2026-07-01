import type { Locale } from "@/lib/i18n/config";
import type { Dict } from "@/lib/i18n/en";
import en from "@/lib/i18n/en";
import fr from "@/lib/i18n/fr";
import de from "@/lib/i18n/de";
import es from "@/lib/i18n/es";
import pt from "@/lib/i18n/pt";

export const dictionaries: Record<Locale, Dict> = { en, fr, de, es, pt };
