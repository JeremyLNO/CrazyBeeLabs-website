"use client";

import { useEffect, useRef, useState } from "react";
import { useT } from "@/lib/i18n/LanguageProvider";
import { LOCALE_LABELS, type Locale } from "@/lib/i18n/config";

export function LanguageSwitcher() {
  const { lang, setLang, locales, t } = useT();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div className="lang-switch" ref={ref}>
      <button
        type="button"
        className="lang-trigger"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t("nav.language")}
      >
        <span aria-hidden="true">🌐</span>
        <span className="lang-code">{lang.toUpperCase()}</span>
      </button>
      {open && (
        <ul className="lang-menu" role="listbox">
          {locales.map((l: Locale) => (
            <li key={l}>
              <button
                type="button"
                role="option"
                aria-selected={l === lang}
                className={`lang-item${l === lang ? " active" : ""}`}
                onClick={() => {
                  setLang(l);
                  setOpen(false);
                }}
              >
                {LOCALE_LABELS[l]}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
