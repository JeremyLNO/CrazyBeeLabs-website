import Link from "next/link";
import { getFunnelSummary, getDailyTrend } from "@/lib/admin";
import { Hex } from "@/components/ui/Hex";
import { PERIODS, isPeriod, type Period } from "@/lib/adminPeriod";

export const metadata = { title: "Admin · Analytics" };

function rate(part: number, whole: number): string {
  if (!whole) return "—";
  return `${((part / whole) * 100).toFixed(1)}%`;
}

export default async function AdminAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const { period: rawPeriod } = await searchParams;
  const period: Period = isPeriod(rawPeriod) ? rawPeriod : "all";

  const [funnel, trend] = await Promise.all([
    getFunnelSummary(period),
    getDailyTrend(14),
  ]);

  const periodLabel = PERIODS.find((p) => p.key === period)?.label ?? "All time";
  const maxN = Math.max(1, ...trend.map((d) => Math.max(d.visits, d.downloads)));

  return (
    <>
      <div className="page-head">
        <span className="kicker">
          <Hex /> Admin
        </span>
        <h1>Analytics</h1>
        <p className="lead">
          A first-party funnel — no third-party trackers, no cookies, no IP addresses
          stored.
        </p>
      </div>

      <div className="filter-row mt-s">
        {PERIODS.map((p) => (
          <Link
            key={p.key}
            href={p.key === "all" ? "/admin/analytics" : `/admin/analytics?period=${p.key}`}
            className={`chip${period === p.key ? " active" : ""}`}
          >
            {p.label}
          </Link>
        ))}
      </div>

      <div className="kpi-grid mt-m">
        <div className="kpi">
          <div className="kpi-label">Visits · {periodLabel}</div>
          <div className="kpi-value">{funnel.visits}</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Downloads · {periodLabel}</div>
          <div className="kpi-value">{funnel.downloads}</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Orders · {periodLabel}</div>
          <div className="kpi-value">{funnel.orders}</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Visit → download</div>
          <div className="kpi-value">{rate(funnel.downloads, funnel.visits)}</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Download → order</div>
          <div className="kpi-value">{rate(funnel.orders, funnel.downloads)}</div>
        </div>
      </div>

      <h3 className="mt-l">Last 14 days</h3>
      <div className="card mt-s">
        <div className="trend-list">
          {trend.map((d) => (
            <div className="trend-row" key={d.day}>
              <span className="trend-date muted">{d.day.slice(5)}</span>
              <div className="trend-bars">
                <div
                  className="trend-bar trend-bar-visits"
                  style={{ width: `${(d.visits / maxN) * 100}%` }}
                  title={`${d.visits} visits`}
                />
                <div
                  className="trend-bar trend-bar-downloads"
                  style={{ width: `${(d.downloads / maxN) * 100}%` }}
                  title={`${d.downloads} downloads`}
                />
              </div>
              <span className="trend-nums muted">
                {d.visits} visits · {d.downloads} downloads
              </span>
            </div>
          ))}
        </div>
        <div className="trend-legend mt-s">
          <span>
            <i className="trend-swatch trend-swatch-visits" /> Visits
          </span>
          <span>
            <i className="trend-swatch trend-swatch-downloads" /> Downloads
          </span>
        </div>
      </div>
    </>
  );
}
