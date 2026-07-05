"use client";

import { useT } from "@/lib/i18n/LanguageProvider";
import { appName } from "@/lib/catalog";
import { getShowcaseApp } from "@/lib/showcase";
import { formatDate } from "@/lib/format";

export interface MyDownloadRow {
  id: string;
  appSlug: string;
  platform: string | null;
  createdAt: string | Date;
}

function displayName(slug: string): string {
  return getShowcaseApp(slug)?.name ?? appName(slug);
}

export function MyDownloads({ rows }: { rows: MyDownloadRow[] }) {
  const { t } = useT();
  return (
    <div className="card mt-m">
      <h3>{t("account.myDownloads")}</h3>
      {rows.length ? (
        <div className="table-wrap mt-s">
          <table className="admin-table">
            <thead>
              <tr>
                <th>{t("account.colDate")}</th>
                <th>{t("account.colApp")}</th>
                <th>{t("account.colPlatform")}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((d) => (
                <tr key={d.id}>
                  <td>{formatDate(d.createdAt)}</td>
                  <td>{displayName(d.appSlug)}</td>
                  <td>{d.platform ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="muted mt-s">{t("account.noDownloads")}</p>
      )}
    </div>
  );
}
