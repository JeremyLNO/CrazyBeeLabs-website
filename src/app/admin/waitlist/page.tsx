import Link from "next/link";
import { getWaitlistStats, getWaitlistSignups } from "@/lib/admin";
import { formatDate } from "@/lib/format";
import { Hex } from "@/components/ui/Hex";

export const metadata = { title: "Admin · Waitlist" };

export default async function AdminWaitlistPage() {
  const [apps, signups] = await Promise.all([getWaitlistStats(), getWaitlistSignups()]);

  const total = apps.reduce((n, a) => n + a.signups, 0);
  const withSignups = apps.filter((a) => a.signups > 0).length;
  const uniquePeople = new Set(signups.map((s) => s.email)).size;
  const names = new Map(apps.map((a) => [a.appSlug, a.appName]));

  return (
    <>
      <div className="page-head">
        <span className="kicker">
          <Hex /> Admin
        </span>
        <h1>Waitlist</h1>
        <p className="lead">
          People waiting on an app that hasn&apos;t shipped yet. Email them when you flip an
          app&apos;s <code>comingSoon</code> flag off.
        </p>
      </div>

      <div className="kpi-grid">
        <div className="kpi">
          <div className="kpi-label">Total signups</div>
          <div className="kpi-value">{total}</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Unique people</div>
          <div className="kpi-value">{uniquePeople}</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Apps with signups</div>
          <div className="kpi-value">
            {withSignups}
            <span className="muted" style={{ fontSize: 16, fontWeight: 500 }}>
              {" / "}
              {apps.length}
            </span>
          </div>
        </div>
      </div>

      <h3 className="mt-l">Signups per app</h3>
      {apps.length ? (
        <div className="table-wrap mt-s">
          <table className="admin-table">
            <thead>
              <tr>
                <th>App</th>
                <th>Platform</th>
                <th>Signups</th>
              </tr>
            </thead>
            <tbody>
              {apps.map((a) => (
                <tr key={a.appSlug}>
                  <td>
                    <Link href={`/apps/${a.appSlug}`}>{a.appName}</Link>
                  </td>
                  <td>{a.device === "iphone" ? "iPhone" : a.device === "web" ? "Browser" : "Mac"}</td>
                  <td>{a.signups}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty mt-s">
          <h3>No unreleased apps</h3>
          <p className="muted mt-s">Every app has shipped — nothing to collect signups for.</p>
        </div>
      )}

      <h3 className="mt-l">Recent signups</h3>
      {signups.length ? (
        <div className="table-wrap mt-s">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Email</th>
                <th>First name</th>
                <th>App</th>
              </tr>
            </thead>
            <tbody>
              {signups.map((s) => (
                <tr key={s.id}>
                  <td>{formatDate(s.createdAt)}</td>
                  <td className="mono-sm">{s.email}</td>
                  <td>{s.firstName ?? "—"}</td>
                  <td>{names.get(s.appSlug) ?? s.appSlug}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty mt-s">
          <h3>No signups yet</h3>
          <p className="muted mt-s">
            Appears once someone joins a waitlist from an app&apos;s page.
          </p>
        </div>
      )}
    </>
  );
}
