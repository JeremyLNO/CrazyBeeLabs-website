"use client";

import { useState } from "react";
import { useT } from "@/lib/i18n/LanguageProvider";
import { useAuthModal } from "@/components/auth/AuthModalProvider";
import { Hex } from "@/components/ui/Hex";

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export function NewsletterSignup() {
  const { t } = useT();
  const { openAuth } = useAuthModal();
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const mail = email.trim();
    if (!EMAIL_RE.test(mail)) {
      setError(t("newsletter.errorEmail"));
      return;
    }
    setLoading(true);
    try {
      await fetch("/api/newsletter", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: mail, firstName: firstName.trim() }),
      });
    } catch {
      /* best-effort — still show success */
    } finally {
      setLoading(false);
      setDone(true);
    }
  }

  return (
    <section className="section newsletter-band">
      <div className="wrap newsletter">
        {done ? (
          <div className="newsletter-done">
            <h2>{t("newsletter.successTitle")}</h2>
            <p className="lead">
              {t("newsletter.successBody", { name: firstName.trim() })}
            </p>
            <p className="muted mt-s">{t("newsletter.accountPrompt")}</p>
            <button
              type="button"
              className="btn btn-primary mt-m"
              onClick={() =>
                openAuth({
                  email: email.trim(),
                  firstName: firstName.trim(),
                  intro: t("newsletter.accountPrompt"),
                })
              }
            >
              {t("newsletter.createAccount")}
            </button>
          </div>
        ) : (
          <>
            <div className="newsletter-head">
              <span className="kicker">
                <Hex /> {t("newsletter.title")}
              </span>
              <h2>{t("newsletter.title")}</h2>
              <p className="lead">{t("newsletter.lead")}</p>
            </div>
            <form className="newsletter-form" onSubmit={onSubmit} noValidate>
              <input
                className="input"
                placeholder={t("newsletter.firstName")}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                autoComplete="given-name"
              />
              <input
                className="input"
                type="email"
                placeholder={t("newsletter.email")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
              <button className="btn btn-primary" disabled={loading}>
                {loading ? t("newsletter.sending") : t("newsletter.subscribe")}
              </button>
            </form>
            {error && <p className="newsletter-error">{error}</p>}
          </>
        )}
      </div>
    </section>
  );
}
