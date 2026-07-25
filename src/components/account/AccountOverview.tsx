"use client";

import { useT } from "@/lib/i18n/LanguageProvider";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { ProfileForm } from "@/components/account/ProfileForm";
import { MyDownloads, type MyDownloadRow } from "@/components/account/MyDownloads";
import { DangerZone } from "@/components/account/DangerZone";

export function AccountOverview({
  email,
  verified,
  name,
  lastName,
  birthDate,
  downloads,
}: {
  email: string;
  verified: boolean;
  name: string;
  lastName: string;
  birthDate: string;
  downloads: MyDownloadRow[];
}) {
  const { t } = useT();
  const firstName = name || email.split("@")[0];
  return (
    <>
      <span className="kicker">{t("account.kicker")}</span>
      <h1 className="dash-welcome">{t("nav.greeting", { name: firstName })}</h1>

      <div className="dash-status-card mt-m">
        <span className="dash-status-icon" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 4h16v16H4z" opacity="0" />
            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </span>
        <div>
          <div className="dash-status-title">{t("account.email")}</div>
          <div className="dash-status-value">{email}</div>
        </div>
        <span className={`badge ${verified ? "badge-active" : "badge-past_due"}`} style={{ marginLeft: "auto" }}>
          {verified ? t("account.verified") : t("account.unverified")}
        </span>
      </div>

      <div className="dash-cards">
        <ProfileForm
          initialName={name}
          initialLastName={lastName}
          initialBirthDate={birthDate}
        />

        <div className="dash-card">
          <div className="dash-card-head">
            <h2>{t("account.exportTitle")}</h2>
          </div>
          <p className="muted">{t("account.exportHint")}</p>
          <a className="btn btn-secondary btn-sm mt-s" href="/api/account/export">
            {t("account.exportButton")}
          </a>
        </div>
      </div>

      <MyDownloads rows={downloads} />

      <DangerZone />

      <div className="mt-m">
        <SignOutButton />
      </div>
    </>
  );
}
