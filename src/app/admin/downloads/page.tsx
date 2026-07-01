import { getDownloads } from "@/lib/admin";
import { appName } from "@/lib/catalog";
import { getShowcaseApp } from "@/lib/showcase";
import { formatDate } from "@/lib/format";
import { Hex } from "@/components/ui/Hex";

export const metadata = { title: "Admin · Downloads" };

function displayName(slug: string): string {
  return getShowcaseApp(slug)?.name ?? appName(slug);
}

export default async function AdminDownloadsPage() {
  const rows = await getDownloads();

  return (
    <>
      <div className="page-head">
        <span className="kicker">
          <Hex /> Admin
        </span>
        <h1>Downloads</h1>
        <p className="lead">
          {rows.length} download{rows.length === 1 ? "" : "s"} — who grabbed what, and when.
        </p>
      </div>

      {rows.length ? (
        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Customer</th>
                <th>App</th>
                <th>Platform</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((d) => (
                <tr key={d.id}>
                  <td>{formatDate(d.createdAt)}</td>
                  <td className="mono-sm">{d.email ?? "—"}</td>
                  <td>{displayName(d.appSlug)}</td>
                  <td>{d.platform ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty">
          <h3>No downloads yet</h3>
          <p className="muted mt-s">
            Downloads appear here once a signed-in user grabs an app (and the
            <code> downloads </code> table has been created in Neon).
          </p>
        </div>
      )}
    </>
  );
}
