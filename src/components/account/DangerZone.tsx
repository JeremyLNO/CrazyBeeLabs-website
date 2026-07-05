"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { useT } from "@/lib/i18n/LanguageProvider";

export function DangerZone() {
  const { t } = useT();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onDelete() {
    setError(null);
    if (confirmText !== "DELETE") {
      setError(t("account.deleteMismatch"));
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/account", {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ confirm: confirmText }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error || t("auth.error"));
        setLoading(false);
        return;
      }
      await signOut({ redirect: false });
      router.push("/");
      router.refresh();
    } catch {
      setError(t("auth.error"));
      setLoading(false);
    }
  }

  return (
    <div className="card mt-m" style={{ borderColor: "#e0b4b4" }}>
      <h3>{t("account.dangerZone")}</h3>
      {!open ? (
        <button
          type="button"
          className="btn btn-secondary btn-sm mt-s"
          onClick={() => setOpen(true)}
        >
          {t("account.deleteAccount")}
        </button>
      ) : (
        <div className="stack mt-s">
          {error && <div className="alert alert-error">{error}</div>}
          <p className="muted">{t("account.deleteWarning")}</p>
          <div className="field">
            <label htmlFor="danger-confirm">{t("account.deleteConfirmLabel")}</label>
            <input
              id="danger-confirm"
              className="input"
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="DELETE"
            />
          </div>
          <div className="row-between">
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => {
                setOpen(false);
                setConfirmText("");
                setError(null);
              }}
              disabled={loading}
            >
              {t("account.cancel")}
            </button>
            <button
              type="button"
              className="btn btn-sm"
              style={{ background: "#c0392b", color: "#fff" }}
              onClick={onDelete}
              disabled={loading || confirmText !== "DELETE"}
            >
              {loading ? t("account.deleting") : t("account.deleteConfirmButton")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
