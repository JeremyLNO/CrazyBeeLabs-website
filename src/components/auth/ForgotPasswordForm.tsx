"use client";

import { useState } from "react";
import { useT } from "@/lib/i18n/LanguageProvider";

export function ForgotPasswordForm({ initialEmail = "" }: { initialEmail?: string }) {
  const { t } = useT();
  const [email, setEmail] = useState(initialEmail);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error || t("auth.error"));
        return;
      }
      setSent(true);
    } catch {
      setError(t("auth.networkError"));
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div>
        <h2 className="authflow-title">{t("auth.forgotSentTitle")}</h2>
        <p className="muted authflow-lead">{t("auth.forgotSentLead", { email })}</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <h2 className="authflow-title">{t("auth.forgotTitle")}</h2>
      <p className="muted authflow-lead">{t("auth.forgotLead")}</p>
      {error && <div className="alert alert-error">{error}</div>}
      <div className="field">
        <label htmlFor="fp-email">{t("auth.emailLabel")}</label>
        <input
          id="fp-email"
          className="input"
          type="email"
          autoComplete="email"
          autoFocus
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <button className="btn btn-primary btn-block" disabled={loading}>
        {loading ? t("auth.checking") : t("auth.forgotSubmit")}
      </button>
    </form>
  );
}
