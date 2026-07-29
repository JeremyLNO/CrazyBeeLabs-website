"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { useT } from "@/lib/i18n/LanguageProvider";

type Step = "email" | "login" | "register";

export function AuthFlow({
  onSuccess,
  intro,
  initialEmail = "",
  initialFirstName = "",
}: {
  /** Called after a successful login or signup. */
  onSuccess?: (firstName: string | null) => void;
  /** Optional lead paragraph shown on the first (email) step. */
  intro?: string;
  /** Prefill the email (e.g. carried over from the newsletter). */
  initialEmail?: string;
  /** Prefill the first name on the register step. */
  initialFirstName?: string;
}) {
  const { t } = useT();
  const router = useRouter();
  const { update } = useSession();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [firstName, setFirstName] = useState(initialFirstName);
  const [lastName, setLastName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function finish(fn: string | null) {
    await update?.();
    router.refresh();
    onSuccess?.(fn);
  }

  async function onEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/check-email", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = (await res.json().catch(() => ({}))) as { exists?: boolean; error?: string };
      if (!res.ok) {
        setError(data.error || t("auth.error"));
        return;
      }
      setStep(data.exists ? "login" : "register");
    } finally {
      setLoading(false);
    }
  }

  async function onLoginSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (!res || res.error) {
      setError(t("auth.wrongPassword"));
      return;
    }
    await finish(null);
  }

  async function onRegisterSubmit(e: React.FormEvent) {
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
    const res = await fetch("/api/signup", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: firstName, lastName, email, password, birthDate }),
    });
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    if (!res.ok) {
      setError(data.error || t("auth.error"));
      setLoading(false);
      return;
    }
    const si = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (!si || si.error) {
      setError(t("auth.error"));
      return;
    }
    await finish(firstName.trim() || null);
  }

  function changeEmail() {
    setStep("email");
    setPassword("");
    setConfirm("");
    setError(null);
  }

  return (
    <div className="authflow">
      {error && <div className="alert alert-error">{error}</div>}

      {step === "email" && (
        <form onSubmit={onEmailSubmit} noValidate>
          <h2 className="authflow-title">{t("auth.emailTitle")}</h2>
          <p className="muted authflow-lead">{intro || t("auth.emailLead")}</p>
          <div className="field">
            <label htmlFor="af-email">{t("auth.emailLabel")}</label>
            <input
              id="af-email"
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
            {loading ? t("auth.checking") : t("auth.continue")}
          </button>
        </form>
      )}

      {step === "login" && (
        <form onSubmit={onLoginSubmit} noValidate>
          <h2 className="authflow-title">{t("auth.loginTitle")}</h2>
          <p className="muted authflow-lead">{t("auth.loginLead")}</p>
          <div className="field authflow-email-row">
            <span>{email}</span>
            <button type="button" className="link-btn" onClick={changeEmail}>
              {t("auth.changeEmail")}
            </button>
          </div>
          <div className="field">
            <label htmlFor="af-pass">{t("auth.passwordLabel")}</label>
            <input
              id="af-pass"
              className="input"
              type="password"
              autoComplete="current-password"
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <a className="link-btn form-note" href={`/forgot-password?email=${encodeURIComponent(email)}`}>
              {t("auth.forgotLink")}
            </a>
          </div>
          <button className="btn btn-primary btn-block" disabled={loading}>
            {loading ? "…" : t("auth.login")}
          </button>
        </form>
      )}

      {step === "register" && (
        <form onSubmit={onRegisterSubmit} noValidate>
          <h2 className="authflow-title">{t("auth.registerTitle")}</h2>
          <p className="muted authflow-lead">{t("auth.registerLead")}</p>
          <div className="field authflow-email-row">
            <span>{email}</span>
            <button type="button" className="link-btn" onClick={changeEmail}>
              {t("auth.changeEmail")}
            </button>
          </div>
          <div className="field-row">
            <div className="field">
              <label htmlFor="af-fn">{t("auth.firstNameLabel")}</label>
              <input
                id="af-fn"
                className="input"
                type="text"
                autoComplete="given-name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="af-ln">{t("auth.lastNameLabel")}</label>
              <input
                id="af-ln"
                className="input"
                type="text"
                autoComplete="family-name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>
          <div className="field">
            <label htmlFor="af-pass2">{t("auth.passwordLabel")}</label>
            <input
              id="af-pass2"
              className="input"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
            <span className="form-note">{t("auth.passwordHint")}</span>
          </div>
          <div className="field">
            <label htmlFor="af-conf">{t("auth.confirmLabel")}</label>
            <input
              id="af-conf"
              className="input"
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="af-bd">
              {t("auth.birthDateLabel")}{" "}
              <span className="muted">({t("auth.optional")})</span>
            </label>
            <input
              id="af-bd"
              className="input"
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
            />
          </div>
          <button className="btn btn-primary btn-block" disabled={loading}>
            {loading ? t("auth.creating") : t("auth.create")}
          </button>
        </form>
      )}
    </div>
  );
}
