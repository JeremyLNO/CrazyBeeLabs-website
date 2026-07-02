import { getAppStats } from "@/lib/admin";
import { appName, PLAN_LABELS, type PlanInterval } from "@/lib/catalog";
import { Hex } from "@/components/ui/Hex";

export const metadata = { title: "Admin · Apps" };

export default async function AdminAppsPage() {
  const stats = await getAppStats();

  return (
    <>
      <div className="page-head">
        <span className="kicker">
          <Hex /> Admin
        </span>
        <h1>Apps</h1>
        <p className="lead">Downloaders, licenses and license mix for every macOS app.</p>
      </div>

      <div className="stack mt-l">
        {stats.map((s) => (
          <div className="card" key={s.appSlug}>
            <div className="row-between">
              <h3>{appName(s.appSlug)}</h3>
              <span className="muted">
                {s.downloaders} downloader{s.downloaders === 1 ? "" : "s"} · {s.licensesTotal}{" "}
                license{s.licensesTotal === 1 ? "" : "s"}
              </span>
            </div>
            <div className="admin-cols mt-s">
              <div>
                <div className="kpi-label">By plan</div>
                {s.byPlan.length ? (
                  <ul className="bar-list mt-s">
                    {s.byPlan.map((b) => (
                      <li key={b.plan}>
                        <span>{PLAN_LABELS[b.plan as PlanInterval] ?? b.plan}</span>
                        <b>{b.n}</b>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="muted mt-s">No licenses yet.</p>
                )}
              </div>
              <div>
                <div className="kpi-label">By status</div>
                {s.byStatus.length ? (
                  <ul className="bar-list mt-s">
                    {s.byStatus.map((b) => (
                      <li key={b.status}>
                        <span style={{ textTransform: "capitalize" }}>{b.status}</span>
                        <b>{b.n}</b>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="muted mt-s">No licenses yet.</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
