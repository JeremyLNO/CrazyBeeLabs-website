import { type Locale } from "@/lib/i18n/config";
import en from "./en.json";
import fr from "./fr.json";
import de from "./de.json";
import es from "./es.json";
import pt from "./pt.json";

export interface QA {
  q: string;
  a: string;
}
export interface Section {
  h: string;
  p: string;
}
export interface LegalDoc {
  title: string;
  updated: string;
  sections: Section[];
}
export interface StudioContent {
  title: string;
  lead: string;
  sections: Section[];
}
export interface AppCopy {
  tagline: string;
  description: string;
  features: string[];
}
export interface SiteContent {
  studio: StudioContent;
  commitment: StudioContent;
  appCopy: Record<string, AppCopy>;
  globalFaq: QA[];
  appFaq: Record<string, QA[]>;
  legal: Record<LegalSlug, LegalDoc>;
}

export const LEGAL_DOCS = ["privacy", "terms", "refund", "notice", "apps"] as const;
export type LegalSlug = (typeof LEGAL_DOCS)[number];

const CONTENT: Record<Locale, SiteContent> = {
  en: en as unknown as SiteContent,
  fr: fr as unknown as SiteContent,
  de: de as unknown as SiteContent,
  es: es as unknown as SiteContent,
  pt: pt as unknown as SiteContent,
};

/** Full localized content for a locale (falls back to English). */
export function getContent(lang: Locale): SiteContent {
  return CONTENT[lang] ?? CONTENT.en;
}

/** Localized copy for one app (per-field English fallback). */
export function getAppCopy(lang: Locale, slug: string): AppCopy | undefined {
  return getContent(lang).appCopy[slug] ?? CONTENT.en.appCopy[slug];
}

/** Localized FAQ for one app (English fallback). */
export function getAppFaq(lang: Locale, slug: string): QA[] {
  return getContent(lang).appFaq[slug] ?? CONTENT.en.appFaq[slug] ?? [];
}
