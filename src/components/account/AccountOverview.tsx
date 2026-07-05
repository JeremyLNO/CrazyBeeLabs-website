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
  return (
    <>
      <div className="page-head">
        <span className="kicker">{t("account.kicker")}</span>
        <h1>{t("account.title")}</h1>
      </div>

      <div className="card row-between">
        <div>
          <div className="muted" style={{ fontSize: 13 }}>
            {t("account.email")}
          </div>
          <div>{email}</div>
        </div>
        {verified ? (
          <span className="badge badge-active">{t("account.verified")}</span>
        ) : (
          <span className="badge badge-past_due">{t("account.unverified")}</span>
        )}
      </div>

      <div className="mt-m">
        <ProfileForm
          initialName={name}
          initialLastName={lastName}
          initialBirthDate={birthDate}
        />
      </div>

      <MyDownloads rows={downloads} />

      <div className="card mt-m">
        <h3>{t("account.exportTitle")}</h3>
        <p className="muted mt-s">{t("account.exportHint")}</p>
        <a className="btn btn-secondary btn-sm mt-s" href="/api/account/export">
          {t("account.exportButton")}
        </a>
      </div>

      <DangerZone />

      <div className="mt-m">
        <SignOutButton />
      </div>
    </>
  );
}
