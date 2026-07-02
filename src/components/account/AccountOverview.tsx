"use client";

import { useT } from "@/lib/i18n/LanguageProvider";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { ProfileForm } from "@/components/account/ProfileForm";

export function AccountOverview({
  email,
  verified,
  name,
  lastName,
  birthDate,
}: {
  email: string;
  verified: boolean;
  name: string;
  lastName: string;
  birthDate: string;
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

      <div className="mt-m">
        <SignOutButton />
      </div>
    </>
  );
}
