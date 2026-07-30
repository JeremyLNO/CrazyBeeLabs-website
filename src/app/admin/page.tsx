import Link from "next/link";
import { getSalesSummary, getSubscriptionBreakdown, getOrders } from "@/lib/admin";
import { appName, PLAN_LABELS } from "@/lib/catalog";
import { formatMoney, formatDate } from "@/lib/format";
import { Hex } from "@/components/ui/Hex";
import { PERIODS, isPeriod, type Period } from "@/lib/adminPeriod";
import { isPaddleWebhookConfigured } from "@/lib/env";

export const metadata = { title: "Admin · Sales" };

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const { period: rawPeriod } = await searchParams;
  const period: Period = isPeriod(rawPeriod) ? rawPeriod : "all";

  const [summary, breakdown, recent] = await Promise.all([
    getSalesSummary(period),
    getSubscriptionBreakdown(),
    getOrders(8),
  ]);

  const allTime = summary.revenueAll.length
    ? summary.revenueAll
    : [{ currency: "EUR", totalCents: 0, orders: 0 }];
  const periodRevenue = summary.revenuePeriod.length
    ? summary.revenuePeriod
    : [{ currency: "EUR", totalCents: 0 }];
  const periodLabel = PERIODS.find((p) => p.key === period)?.label ?? "All time";

  return (
    <>
      <div className="page-head">
        <span className="kicker">
          <Hex /> Admin
        </span>
        <h1>Sales dashboard</h1>
      </div>

      {!isPaddleWebhookConfigured() && (
        <div className="alert alert-error">
          <strong>PADDLE_WEBHOOK_SECRET is not set.</strong> The webhook accepts
          requests but discards every event, so purchases would not create
          licenses or invoices. Set it in the Vercel project before taking real
          payments.
        </div>
      )}

      <div className="filter-row mt-s">
        {PERIODS.map((p) => (
          <Link
            key={p.key}
            href={p.key === "all" ? "/admin" : `/admin?period=${p.key}`}
            className={`chip${period === p.key ? " active" : ""}`}
          >
            {p.label}
          </Link>
        ))}
      </div>

      <div className="kpi-grid mt-m">
        <div className="kpi">
          <div className="kpi-label">Revenue · all time</div>
          <div className="kpi-value">
            {allTime.map((r) => formatMoney(r.totalCents, r.currency)).join(" · ")}
          </div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Revenue · {periodLabel}</div>
          <div className="kpi-value">
            {periodRevenue.map((r) => formatMoney(r.totalCents, r.currency)).join(" · ")}
          </div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Orders · {periodLabel}</div>
          <div className="kpi-value">{summary.ordersPeriodCount}</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">New accounts · {periodLabel}</div>
          <div className="kpi-value">{summary.newAccounts}</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Active licenses</div>
          <div className="kpi-value">{summary.activeLicenses}</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Paying customers</div>
          <div className="kpi-value">{summary.payingCustomers}</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Accounts · all time</div>
          <div className="kpi-value">{summary.totalCustomers}</div>
        </div>
      </div>

      <div className="admin-cols mt-l">
        <div className="card">
          <h3>Active by app</h3>
          {breakdown.byApp.length ? (
            <ul className="bar-list mt-s">
              {breakdown.byApp.map((b) => (
                <li key={b.appSlug}>
                  <span>{appName(b.appSlug)}</span>
                  <b>{b.n}</b>
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted mt-s">No active subscriptions yet.</p>
          )}
        </div>
        <div className="card">
          <h3>Active by plan</h3>
          {breakdown.byPlan.length ? (
            <ul className="bar-list mt-s">
              {breakdown.byPlan.map((b) => (
                <li key={b.plan}>
                  <span>{PLAN_LABELS[b.plan]}</span>
                  <b>{b.n}</b>
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted mt-s">No active subscriptions yet.</p>
          )}
        </div>
      </div>

      <div className="row-between mt-l" style={{ marginBottom: 14 }}>
        <h3>Recent orders</h3>
        <Link className="btn btn-ghost btn-sm" href="/admin/orders">
          All orders →
        </Link>
      </div>
      {recent.length ? (
        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Customer</th>
                <th>App</th>
                <th>Plan</th>
                <th>Amount</th>
                <th>Invoice</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((o) => (
                <tr key={o.id}>
                  <td>{formatDate(o.createdAt)}</td>
                  <td className="mono-sm">{o.email ?? "—"}</td>
                  <td>{o.appSlug ? appName(o.appSlug) : "—"}</td>
                  <td>{o.plan ? PLAN_LABELS[o.plan] : "—"}</td>
                  <td>{formatMoney(o.amountCents, o.currency)}</td>
                  <td>
                    {o.url ? (
                      <a href={o.url} target="_blank" rel="noopener noreferrer">
                        View
                      </a>
                    ) : (
                      (o.number ?? "—")
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty">
          <h3>No orders yet</h3>
          <p className="muted mt-s">Sales will appear here after the first purchase.</p>
        </div>
      )}
    </>
  );
}
