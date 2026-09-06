"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useT } from "@/lib/i18n/LanguageProvider";

/** Base tag of the visitor's first preferred browser language ("it", "nl", …). */
function primaryBrowserLocale(): string | null {
  const raw =
    (typeof navigator !== "undefined" && navigator.languages?.[0]) ||
    (typeof navigator !== "undefined" && navigator.language) ||
    "";
  const base = raw.toLowerCase().split("-")[0];
  return /^[a-z]{2,3}$/.test(base) ? base : null;
}

/**
 * First-party, anonymous pageview beacon. Also carries the language signal:
 * the locale we served, and the browser's preferred language — so the admin
 * can see which unsupported languages visitors actually read.
 */
export function PageViewTracker() {
  const pathname = usePathname();
  const { lang, ready } = useT();
  // Guards against double-counting: a language switch re-runs this effect,
  // but a pageview should be sent once per path.
  const sentFor = useRef<string | null>(null);

  useEffect(() => {
    // Wait for the real locale. Before `ready`, `lang` is still the default,
    // and sending it would record every visitor as English.
    if (!pathname || !ready) return;
    if (sentFor.current === pathname) return;
    sentFor.current = pathname;

    fetch("/api/track", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        path: pathname,
        siteLocale: lang,
        browserLocale: primaryBrowserLocale(),
      }),
      keepalive: true,
    }).catch(() => {});
  }, [pathname, ready, lang]);

  return null;
}
