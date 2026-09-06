import Link from "next/link";
import { getLanguageStats, type LanguageRow } from "@/lib/admin";
import { LOCALE_LABELS, type Locale } from "@/lib/i18n/config";
import { Hex } from "@/components/ui/Hex";
import { PERIODS, isPeriod, type Period } from "@/lib/adminPeriod";

export const metadata = { title: "Admin · Languages" };

function pct(n: number): string {
  return `${(n * 100).toFixed(n >= 0.1 ? 0 : 1)}%`;
}

/** Proportional bar so the ranking reads at a glance, not just as numbers. */
function Bar({ share, tone }: { share: number; tone: "honey" | "violet" }) {
  return (
    <span className="lang-bar" aria-hidden="true">
      <span
        className={`lang-bar-fill ${tone}`}
        style={{ width: `${Math.max(share * 100, 1.5)}%` }}
      />
    </span>
  );
}

function LangTable({
  rows,
  tone,
  emptyLabel,
}: {
  rows: LanguageRow[];
  tone: "honey" | "violet";
  emptyLabel: string;
}) {
  if (!rows.length) {
    return <p className="muted mt-s">{emptyLabel}</p>;
  }
  return (
    <div className="table-wrap mt-s">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Language</th>
            <th>Tag</th>
            <th>Pageviews</th>
            <th>Share</th>
            <th style={{ width: "30%" }} />
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.tag}>
              <td>{r.label}</td>
              <td className="mono-sm">{r.tag}</td>
              <td>{r.views}</td>
              <td>{pct(r.share)}</td>
              <td>
                <Bar share={r.share} tone={tone} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default async function AdminLanguagesPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const { period: raw } = await searchParams;
  const period: Period = isPeriod(raw) ? raw : "all";
  const stats = await getLanguageStats(period);

  const offered = (Object.keys(LOCALE_LABELS) as Locale[]).length;
  const topMissing = stats.missing[0];
  const missingShare = stats.missing.reduce((s, r) => s + r.share, 0);

  return (
    <>
      <div className="page-head">
        <span className="kicker">
          <Hex /> Admin
        </span>
        <h1>Languages</h1>
        <p className="lead">
          Which language visitors read the site in, and which languages they&apos;d
          rather read — so you can see what&apos;s worth translating next.
        </p>
      </div>

      <div className="filter-row mt-s">
        {PERIODS.map((p) => (
          <Link
            key={p.key}
            href={p.key === "all" ? "/admin/languages" : `/admin/languages?period=${p.key}`}
            className={`chip${period === p.key ? " active" : ""}`}
          >
            {p.label}
          </Link>
        ))}
      </div>

      <div className="kpi-grid mt-m">
        <div className="kpi">
          <div className="kpi-label">Languages offered</div>
          <div className="kpi-value">{offered}</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Pageviews with a language signal</div>
          <div className="kpi-value">{stats.withSignal}</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Not covered by our languages</div>
          <div className="kpi-value">{pct(missingShare)}</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Top missing language</div>
          <div className="kpi-value" style={{ fontSize: 20 }}>
            {topMissing ? topMissing.label : "—"}
          </div>
        </div>
      </div>

      {stats.withSignal === 0 && (
        <div className="alert alert-warn mt-m">
          <strong>No language data yet.</strong> The signal ships with the
          pageview beacon, so it starts filling in as visitors browse. If it
          stays empty, the two new <code>page_views</code> columns may not be
          migrated — run <code>POST /api/admin/migrate</code>.
          {stats.totalViews > 0 && (
            <> {stats.totalViews} pageview(s) in this period predate the signal.</>
          )}
        </div>
      )}

      <h3 className="mt-l">Languages we don&apos;t offer</h3>
      <p className="muted" style={{ fontSize: 13.5 }}>
        Ranked by demand. These visitors are being served a fallback language
        today — the top entries are the best candidates to translate next.
      </p>
      <LangTable
        rows={stats.missing}
        tone="violet"
        emptyLabel="Every visitor's preferred language is already offered."
      />

      <h3 className="mt-l">Language the site was shown in</h3>
      <p className="muted" style={{ fontSize: 13.5 }}>
        What visitors actually read, after their saved choice, their browser
        setting, then the English fallback.
      </p>
      <LangTable rows={stats.served} tone="honey" emptyLabel="No data yet." />

      <h3 className="mt-l">Browser language, all visitors</h3>
      <p className="muted" style={{ fontSize: 13.5 }}>
        Every preferred browser language, offered or not — the full picture the
        two tables above split.
      </p>
      <LangTable rows={stats.browser} tone="honey" emptyLabel="No data yet." />

      <p className="form-note mt-l">
        Counted in pageviews, not people: the beacon stores no cookie, no IP and
        no visitor id, so there&apos;s nothing to deduplicate on. Someone reading
        ten pages counts ten times — read these as relative weight, not a
        headcount. Only the base language tag is kept (&quot;pt&quot;, never
        &quot;pt-BR&quot;).
      </p>
    </>
  );
}
