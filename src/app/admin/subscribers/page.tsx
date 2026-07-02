import { getAccountsAdmin, getNewsletterSubscribers } from "@/lib/admin";
import { formatDate } from "@/lib/format";
import { Hex } from "@/components/ui/Hex";

export const metadata = { title: "Admin · Subscribers" };

export default async function AdminSubscribersPage() {
  const [accounts, subscribers] = await Promise.all([
    getAccountsAdmin(),
    getNewsletterSubscribers(),
  ]);

  const accountsWithLicense = accounts.filter((a) => a.activeLicenses > 0).length;
  const convertedSubscribers = subscribers.filter((s) => s.hasAccount).length;

  return (
    <>
      <div className="page-head">
        <span className="kicker">
          <Hex /> Admin
        </span>
        <h1>Subscribers</h1>
        <p className="lead">Registered accounts and newsletter subscribers.</p>
      </div>

      <div className="kpi-grid">
        <div className="kpi">
          <div className="kpi-label">Accounts</div>
          <div className="kpi-value">{accounts.length}</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Accounts with a license</div>
          <div className="kpi-value">{accountsWithLicense}</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Newsletter subscribers</div>
          <div className="kpi-value">{subscribers.length}</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Subscribers with an account</div>
          <div className="kpi-value">{convertedSubscribers}</div>
        </div>
      </div>

      <h3 className="mt-l">Accounts</h3>
      {accounts.length ? (
        <div className="table-wrap mt-s">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Joined</th>
                <th>Email</th>
                <th>Name</th>
                <th>Verified</th>
                <th>Active licenses</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((a) => (
                <tr key={a.id}>
                  <td>{formatDate(a.createdAt)}</td>
                  <td className="mono-sm">{a.email}</td>
                  <td>{a.name ?? "—"}</td>
                  <td>{a.emailVerifiedAt ? "✓" : "—"}</td>
                  <td>{a.activeLicenses}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty mt-s">
          <h3>No accounts yet</h3>
        </div>
      )}

      <h3 className="mt-l">Newsletter subscribers</h3>
      {subscribers.length ? (
        <div className="table-wrap mt-s">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Email</th>
                <th>First name</th>
                <th>Source</th>
                <th>Has account</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.map((s) => (
                <tr key={s.id}>
                  <td>{formatDate(s.createdAt)}</td>
                  <td className="mono-sm">{s.email}</td>
                  <td>{s.firstName ?? "—"}</td>
                  <td>{s.source ?? "—"}</td>
                  <td>{s.hasAccount ? "✓" : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty mt-s">
          <h3>No subscribers yet</h3>
          <p className="muted mt-s">
            Appears once the newsletter table is migrated and someone subscribes on the home page.
          </p>
        </div>
      )}
    </>
  );
}
