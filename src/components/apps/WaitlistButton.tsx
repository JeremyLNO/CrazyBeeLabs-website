"use client";

import { useState } from "react";
import { useT } from "@/lib/i18n/LanguageProvider";

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export function WaitlistButton({
  appSlug,
  appName,
  className,
}: {
  appSlug: string;
  appName: string;
  className?: string;
}) {
  const { t } = useT();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function close() {
    setOpen(false);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const mail = email.trim().toLowerCase();
    if (!EMAIL_RE.test(mail)) {
      setError(t("waitlist.errorEmail"));
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: mail, firstName: firstName.trim(), appSlug }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean };
      if (!res.ok || data.ok === false) {
        setError(t("waitlist.errorGeneric"));
        return;
      }
      setDone(true);
    } catch {
      setError(t("waitlist.errorGeneric"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button type="button" className={className ?? "btn btn-secondary btn-sm"} onClick={() => setOpen(true)}>
        {t("waitlist.cta")}
      </button>

      {open && (
        <div className="modal-overlay" onClick={close} role="presentation">
          <div className="modal-card" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={close} aria-label="Close">
              ✕
            </button>

            {done ? (
              <div>
                <h3>{t("waitlist.successTitle")}</h3>
                <p className="muted mt-s">{t("waitlist.successBody", { app: appName })}</p>
              </div>
            ) : (
              <form className="stack" onSubmit={onSubmit} noValidate>
                <div>
                  <h3>{t("waitlist.title", { app: appName })}</h3>
                  <p className="muted mt-s">{t("waitlist.lead")}</p>
                </div>
                <div className="field">
                  <label htmlFor="wl-fn">{t("waitlist.firstName")}</label>
                  <input
                    id="wl-fn"
                    className="input"
                    type="text"
                    autoComplete="given-name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
                <div className="field">
                  <label htmlFor="wl-email">{t("waitlist.email")}</label>
                  <input
                    id="wl-email"
                    className="input"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                {error && <p className="newsletter-error">{error}</p>}
                <button className="btn btn-primary" disabled={loading}>
                  {loading ? t("waitlist.sending") : t("waitlist.submit")}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
