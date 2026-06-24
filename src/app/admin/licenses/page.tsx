import { getAllLicensesAdmin } from "@/lib/admin";
import { appName, PLAN_LABELS } from "@/lib/catalog";
import { formatDate } from "@/lib/format";
import { Hex } from "@/components/ui/Hex";

export const metadata = { title: "Admin · Licenses" };

export default async function AdminLicensesPage() {
  const lic = await getAllLicensesAdmin();

  return (
    <>
      <div className="page-head">
        <span className="kicker">
          <Hex /> Admin
        </span>
        <h1>All licenses</h1>
        <p className="lead">
          {lic.length} license{lic.length === 1 ? "" : "s"}.
        </p>
      </div>

      {lic.length ? (
        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>App</th>
                <th>Customer</th>
                <th>Plan</th>
                <th>Status</th>
                <th>Valid until</th>
                <th>Key</th>
              </tr>
            </thead>
            <tbody>
              {lic.map((l) => {
                const blocked =
                  l.status === "blocked" ||
                  l.subStatus === "blocked" ||
                  l.subStatus === "past_due";
                const cls = blocked ? "blocked" : l.status;
                const label = blocked
                  ? "Blocked"
                  : l.status.charAt(0).toUpperCase() + l.status.slice(1);
                return (
                  <tr key={l.id}>
                    <td>{appName(l.appSlug)}</td>
                    <td className="mono-sm">{l.email ?? "—"}</td>
                    <td>{l.plan ? PLAN_LABELS[l.plan] : "—"}</td>
                    <td>
                      <span className={`badge badge-${cls}`}>{label}</span>
                    </td>
                    <td>{l.validUntil ? formatDate(l.validUntil) : "Lifetime"}</td>
                    <td className="mono-sm">{l.licenseKey}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty">
          <h3>No licenses yet</h3>
          <p className="muted mt-s">Licenses appear here after the first purchase.</p>
        </div>
      )}
    </>
  );
}
