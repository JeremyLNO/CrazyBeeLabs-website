"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/** Fires a first-party, anonymous pageview beacon on every route change. */
export function PageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;
    fetch("/api/track", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ path: pathname }),
      keepalive: true,
    }).catch(() => {});
  }, [pathname]);

  return null;
}
