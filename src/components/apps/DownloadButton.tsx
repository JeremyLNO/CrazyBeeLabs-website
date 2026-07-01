"use client";

import { useState } from "react";
import { useAuthModal } from "@/components/auth/AuthModalProvider";
import { useT } from "@/lib/i18n/LanguageProvider";

export function DownloadButton({
  appName,
  downloadUrl,
  label,
  className = "btn btn-accent btn-sm",
}: {
  appName: string;
  downloadUrl?: string | null;
  label?: string;
  className?: string;
}) {
  const { t } = useT();
  const { requireAuth } = useAuthModal();
  const [pending, setPending] = useState(false);

  function start() {
    if (downloadUrl) {
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.rel = "noopener";
      a.click();
      setPending(false);
    } else {
      // File not published yet — the account/email is captured all the same.
      setPending(true);
    }
  }

  return (
    <>
      <button
        type="button"
        className={className}
        onClick={() =>
          requireAuth({
            intro: t("auth.downloadLead", { app: appName }),
            afterAuth: start,
          })
        }
      >
        {label || t("apps.download")}
      </button>
      {pending && <p className="download-note">{t("apps.downloadSoon")}</p>}
    </>
  );
}
