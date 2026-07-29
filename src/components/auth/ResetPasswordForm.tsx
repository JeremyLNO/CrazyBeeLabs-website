"use client";

import { useState } from "react";
import Link from "next/link";
import { useT } from "@/lib/i18n/LanguageProvider";

export function ResetPasswordForm({ token }: { token: string | null }) {
  const { t } = useT();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!token) {
    return (
      <div>
        <h2 className="authflow-title">{t("auth.resetInvalidTitle")}</h2>
        <p className="muted authflow-lead">{t("auth.resetInvalidLead")}</p>
        <Link className="btn btn-primary btn-block" href="/forgot-password">
          {t("auth.forgotSubmit")}
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div>
        <h2 className="authflow-title">{t("auth.resetDoneTitle")}</h2>
        <p className="muted authflow-lead">{t("auth.resetDoneLead")}</p>
        <Link className="btn btn-primary btn-block" href="/login">
          {t("auth.login")}
        </Link>
      </div>
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError(t("auth.passwordHint"));
      return;
    }
    if (password !== confirm) {
      setError(t("auth.mismatch"));
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error || t("auth.error"));
        return;
      }
      setDone(true);
    } catch {
      setError(t("auth.networkError"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <h2 className="authflow-title">{t("auth.resetTitle")}</h2>
      <p className="muted authflow-lead">{t("auth.resetLead")}</p>
      {error && <div className="alert alert-error">{error}</div>}
      <div className="field">
        <label htmlFor="rp-pass">{t("auth.passwordLabel")}</label>
        <input
          id="rp-pass"
          className="input"
          type="password"
          autoComplete="new-password"
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
        />
        <span className="form-note">{t("auth.passwordHint")}</span>
      </div>
      <div className="field">
        <label htmlFor="rp-pass2">{t("auth.confirmLabel")}</label>
        <input
          id="rp-pass2"
          className="input"
          type="password"
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          minLength={8}
        />
      </div>
      <button className="btn btn-primary btn-block" disabled={loading}>
        {loading ? "…" : t("auth.resetSubmit")}
      </button>
    </form>
  );
}
