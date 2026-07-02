"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useT } from "@/lib/i18n/LanguageProvider";

export function ProfileForm({
  initialName,
  initialLastName,
  initialBirthDate,
}: {
  initialName: string;
  initialLastName: string;
  initialBirthDate: string;
}) {
  const { t } = useT();
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [lastName, setLastName] = useState(initialLastName);
  const [birthDate, setBirthDate] = useState(initialBirthDate);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    setLoading(true);
    try {
      const res = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, lastName, birthDate }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error || t("auth.error"));
        return;
      }
      setSaved(true);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="card stack" onSubmit={onSubmit} noValidate>
      {error && <div className="alert alert-error">{error}</div>}
      <div className="field-row">
        <div className="field">
          <label htmlFor="pf-fn">{t("account.firstName")}</label>
          <input
            id="pf-fn"
            className="input"
            type="text"
            autoComplete="given-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="pf-ln">{t("account.lastName")}</label>
          <input
            id="pf-ln"
            className="input"
            type="text"
            autoComplete="family-name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>
      </div>
      <div className="field">
        <label htmlFor="pf-bd">
          {t("account.dateOfBirth")} <span className="muted">({t("account.optional")})</span>
        </label>
        <input
          id="pf-bd"
          className="input"
          type="date"
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
        />
      </div>
      <div className="row-between">
        <button className="btn btn-primary btn-sm" disabled={loading}>
          {loading ? t("account.saving") : t("account.save")}
        </button>
        {saved && !loading && <span className="muted">{t("account.saved")}</span>}
      </div>
    </form>
  );
}
