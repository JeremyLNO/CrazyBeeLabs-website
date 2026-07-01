"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  DEFAULT_LOCALE,
  LOCALES,
  matchLocale,
  type Locale,
} from "@/lib/i18n/config";
import { dictionaries } from "@/lib/i18n/dictionaries";
import en from "@/lib/i18n/en";

const STORAGE_KEY = "cbl_lang";

interface LangContextValue {
  lang: Locale;
  setLang: (l: Locale) => void;
  /** Translate a dot-path key, e.g. t("nav.ourApps"). Supports {var} interpolation. */
  t: (key: string, vars?: Record<string, string | number>) => string;
  /** Return an array value (e.g. rotating words). */
  tArray: (key: string) => string[];
  locales: readonly Locale[];
  ready: boolean;
}

const LangContext = createContext<LangContextValue | null>(null);

function resolve(dict: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, part) => {
    if (acc && typeof acc === "object" && part in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[part];
    }
    return undefined;
  }, dict);
}

function interpolate(str: string, vars?: Record<string, string | number>): string {
  if (!vars) return str;
  return str.replace(/\{(\w+)\}/g, (m, k) =>
    k in vars ? String(vars[k]) : m,
  );
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Start with the default so server and first client render match; the real
  // locale is applied in the effect below (after reading storage / navigator).
  const [lang, setLangState] = useState<Locale>(DEFAULT_LOCALE);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let chosen: Locale | null = null;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && (LOCALES as readonly string[]).includes(stored)) {
        chosen = stored as Locale; // user's explicit choice wins
      }
    } catch {
      /* ignore */
    }
    if (!chosen) chosen = matchLocale(navigator.language); // browser default
    const final = chosen ?? DEFAULT_LOCALE; // fallback English
    setLangState(final);
    document.documentElement.lang = final;
    setReady(true);
  }, []);

  const setLang = useCallback((l: Locale) => {
    setLangState(l);
    document.documentElement.lang = l;
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {
      /* ignore */
    }
  }, []);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => {
      const val = resolve(dictionaries[lang], key) ?? resolve(en, key);
      if (typeof val === "string") return interpolate(val, vars);
      return key;
    },
    [lang],
  );

  const tArray = useCallback(
    (key: string) => {
      const val = resolve(dictionaries[lang], key) ?? resolve(en, key);
      return Array.isArray(val) ? (val as string[]) : [];
    },
    [lang],
  );

  const value = useMemo(
    () => ({ lang, setLang, t, tArray, locales: LOCALES, ready }),
    [lang, setLang, t, tArray, ready],
  );

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useT(): LangContextValue {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useT must be used within LanguageProvider");
  return ctx;
}
