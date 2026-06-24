import { auth } from "@/lib/auth";
import { getUserInvoices } from "@/lib/invoices";
import { Hex } from "@/components/ui/Hex";

export const metadata = { title: "Invoices" };

function fmtDate(d: Date): string {
  return new Date(d).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function fmtAmount(cents: number | null, currency: string | null): string {
  if (cents == null) return "—";
  try {
    return new Intl.NumberFormat("en", {
      style: "currency",
      currency: currency || "EUR",
    }).format(cents / 100);
  } catch {
    return `${(cents / 100).toFixed(2)} ${currency ?? ""}`.trim();
  }
}

export default async function InvoicesPage() {
  const session = await auth();
  const list = session?.user ? await getUserInvoices(session.user.id) : [];

  return (
    <>
      <div className="page-head">
        <span className="kicker">
          <Hex /> Invoices
        </span>
        <h1>Invoices</h1>
        <p className="lead">Your purchase receipts.</p>
      </div>

      {list.length === 0 ? (
        <div className="empty">
          <h3>No invoices yet</h3>
          <p className="muted mt-s">Receipts show up here after your first purchase.</p>
        </div>
      ) : (
        <div className="license-list">
          {list.map((inv) => (
            <div className="license-row" key={inv.id}>
              <div className="lr-main">
                <div className="lr-app">{inv.number || "Receipt"}</div>
                <div className="lr-sub">
                  {fmtDate(inv.createdAt)} · {fmtAmount(inv.amountCents, inv.currency)}
                </div>
              </div>
              {inv.url ? (
                <a
                  className="btn btn-secondary btn-sm"
                  href={inv.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View / download
                </a>
              ) : (
                <span className="muted" style={{ fontSize: 13 }}>
                  Emailed to you
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
