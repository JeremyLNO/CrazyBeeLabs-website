"use client";

import { useRef, useState } from "react";
import { useT } from "@/lib/i18n/LanguageProvider";
import { SHOWCASE } from "@/lib/showcase";

const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];

type Kind = "support" | "idea";

export function SupportForm({
  initialEmail = "",
  initialFirstName = "",
}: {
  initialEmail?: string;
  initialFirstName?: string;
}) {
  const { t } = useT();
  const [kind, setKind] = useState<Kind>("support");
  const [appLabel, setAppLabel] = useState("");
  const [firstName, setFirstName] = useState(initialFirstName);
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState(initialEmail);
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  function pickFile(f: File | null) {
    setError(null);
    if (!f) {
      setFile(null);
      return;
    }
    if (!ALLOWED.includes(f.type)) {
      setError(t("support.errorFileType"));
      return;
    }
    if (f.size > MAX_BYTES) {
      setError(t("support.errorFileSize"));
      return;
    }
    setFile(f);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const fd = new FormData();
    fd.set("kind", kind);
    fd.set("appLabel", appLabel || t("support.appGeneral"));
    fd.set("firstName", firstName);
    fd.set("lastName", lastName);
    fd.set("email", email);
    fd.set("phone", phone);
    fd.set("message", message);
    if (file) fd.set("file", file);

    try {
      const res = await fetch("/api/support", { method: "POST", body: fd });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error || t("support.errorGeneric"));
        return;
      }
      setDone(true);
    } catch {
      setError(t("support.errorGeneric"));
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="card support-done">
        <div className="trial-badge" style={{ alignSelf: "flex-start" }}>
          ✓
        </div>
        <h2>{t("support.successTitle")}</h2>
        <p className="muted">{t("support.successBody")}</p>
        <button
          type="button"
          className="btn btn-secondary btn-sm mt-m"
          onClick={() => {
            setDone(false);
            setMessage("");
            setFile(null);
          }}
        >
          {t("support.sendAnother")}
        </button>
      </div>
    );
  }

  return (
    <form className="support-form card" onSubmit={onSubmit} noValidate>
      {error && <div className="alert alert-error">{error}</div>}

      {/* Type */}
      <div className="field">
        <label>{t("support.type")}</label>
        <div className="seg">
          <button
            type="button"
            className={`seg-btn${kind === "support" ? " active" : ""}`}
            onClick={() => setKind("support")}
          >
            <b>{t("support.typeSupport")}</b>
            <span>{t("support.typeSupportHint")}</span>
          </button>
          <button
            type="button"
            className={`seg-btn${kind === "idea" ? " active" : ""}`}
            onClick={() => setKind("idea")}
          >
            <b>{t("support.typeIdea")}</b>
            <span>{t("support.typeIdeaHint")}</span>
          </button>
        </div>
      </div>

      {/* App */}
      <div className="field">
        <label htmlFor="sf-app">{t("support.app")}</label>
        <select
          id="sf-app"
          className="input"
          value={appLabel}
          onChange={(e) => setAppLabel(e.target.value)}
          required
        >
          <option value="">{t("support.appPlaceholder")}</option>
          <option value={t("support.appGeneral")}>{t("support.appGeneral")}</option>
          {SHOWCASE.map((a) => (
            <option key={a.slug} value={a.name}>
              {a.name}
            </option>
          ))}
        </select>
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor="sf-fn">{t("support.firstName")}</label>
          <input id="sf-fn" className="input" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
        </div>
        <div className="field">
          <label htmlFor="sf-ln">{t("support.lastName")}</label>
          <input id="sf-ln" className="input" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
        </div>
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor="sf-email">{t("support.email")}</label>
          <input id="sf-email" className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="field">
          <label htmlFor="sf-phone">
            {t("support.phone")} <span className="muted">({t("support.phoneOpt")})</span>
          </label>
          <input id="sf-phone" className="input" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
      </div>

      <div className="field">
        <label htmlFor="sf-msg">{t("support.message")}</label>
        <textarea
          id="sf-msg"
          className="input"
          rows={6}
          placeholder={t("support.messagePlaceholder")}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        />
      </div>

      {/* Attachment */}
      <div className="field">
        <label>{t("support.attachment")}</label>
        <div
          className="dropzone"
          onClick={() => fileInput.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            pickFile(e.dataTransfer.files?.[0] ?? null);
          }}
          role="button"
          tabIndex={0}
        >
          {file ? (
            <div className="dropzone-file">
              <span>📎 {file.name}</span>
              <button
                type="button"
                className="link-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  pickFile(null);
                  if (fileInput.current) fileInput.current.value = "";
                }}
              >
                {t("support.remove")}
              </button>
            </div>
          ) : (
            <span className="muted">{t("support.attachmentHint")}</span>
          )}
          <input
            ref={fileInput}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
            hidden
            onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
          />
        </div>
      </div>

      <button className="btn btn-primary btn-block" disabled={loading}>
        {loading ? t("support.sending") : t("support.submit")}
      </button>
    </form>
  );
}
