import Link from "next/link";
import { auth } from "@/lib/auth";
import { getUserLicenses } from "@/lib/licenses";
import { getUserInvoices } from "@/lib/invoices";
import { getApp, appName, PLAN_LABELS } from "@/lib/catalog";
import { Hex } from "@/components/ui/Hex";

export const metadata = { title: "Licenses" };

function fmtDate(d: Date | null): string {
  if (!d) return "no expiry";
  return new Date(d).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default async function LicensesPage({
  searchParams,
}: {
  searchParams: Promise<{ purchase?: string }>;
}) {
  const session = await auth();
  const list = session?.user ? await getUserLicenses(session.user.id) : [];
  const invoiceList = session?.user ? await getUserInvoices(session.user.id) : [];
  const invoiceUrlBySub = new Map<string, string>();
  for (const inv of invoiceList) {
    if (inv.subscriptionId && inv.url && !invoiceUrlBySub.has(inv.subscriptionId)) {
      invoiceUrlBySub.set(inv.subscriptionId, inv.url);
    }
  }
  const { purchase } = await searchParams;

  return (
    <>
      <div className="page-head">
        <span className="kicker">
          <Hex /> Licenses
        </span>
        <h1>Your licenses</h1>
        <p className="lead">Each plan you&apos;ve purchased, its key, and its invoice.</p>
      </div>

      {purchase === "success" && (
        <div className="alert alert-success">
          Payment received — thank you! Your license appears below within a few
          seconds (we&apos;re finalising it). A copy is also on its way by email.
        </div>
      )}

      {list.length === 0 ? (
        <div className="empty">
          <div className="hexmark">
            <Hex size={26} />
          </div>
          <h3>No licenses yet</h3>
          <p className="muted mt-s" style={{ maxWidth: "44ch", margin: "8px auto 0" }}>
            Buy a plan for any macOS app and your license key shows up here — paste
            it into the app&apos;s Settings to unlock it.
          </p>
          <div className="mt-m">
            <Link className="btn btn-primary" href="/#apps">
              Browse apps
            </Link>
          </div>
        </div>
      ) : (
        <div className="license-list">
          {list.map((l) => {
            const app = getApp(l.appSlug);
            const blocked =
              l.status === "blocked" ||
              l.subStatus === "blocked" ||
              l.subStatus === "past_due";
            const badgeClass = blocked ? "blocked" : l.status;
            const invUrl = l.subscriptionId
              ? invoiceUrlBySub.get(l.subscriptionId)
              : undefined;
            return (
              <div className="license-row" key={l.id}>
                <span className="app-icon">
                  {app && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={app.icon} alt="" />
                  )}
                </span>
                <div className="lr-main">
                  <div className="lr-app">{appName(l.appSlug)}</div>
                  <div className="lr-sub">
                    {l.plan ? PLAN_LABELS[l.plan] : "—"} · valid until{" "}
                    {fmtDate(l.validUntil)}
                  </div>
                  <div className="license-actions mt-s">
                    <code className="license-key">{l.licenseKey}</code>
                    {invUrl ? (
                      <a
                        className="btn btn-ghost btn-sm"
                        href={invUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Invoice ↗
                      </a>
                    ) : (
                      <Link className="btn btn-ghost btn-sm" href="/account/invoices">
                        Invoices
                      </Link>
                    )}
                  </div>
                </div>
                <span className={`badge badge-${badgeClass}`}>
                  {blocked
                    ? "Blocked"
                    : l.status.charAt(0).toUpperCase() + l.status.slice(1)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
