import { getOrders } from "@/lib/admin";
import { appName, PLAN_LABELS } from "@/lib/catalog";
import { formatMoney, formatDate } from "@/lib/format";
import { Hex } from "@/components/ui/Hex";

export const metadata = { title: "Admin · Orders" };

export default async function AdminOrdersPage() {
  const orders = await getOrders();

  return (
    <>
      <div className="page-head">
        <span className="kicker">
          <Hex /> Admin
        </span>
        <h1>All orders</h1>
        <p className="lead">
          {orders.length} order{orders.length === 1 ? "" : "s"}.
        </p>
      </div>

      {orders.length ? (
        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Customer</th>
                <th>App</th>
                <th>Plan</th>
                <th>Amount</th>
                <th>Transaction</th>
                <th>Invoice</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td>{formatDate(o.createdAt)}</td>
                  <td className="mono-sm">{o.email ?? "—"}</td>
                  <td>{o.appSlug ? appName(o.appSlug) : "—"}</td>
                  <td>{o.plan ? PLAN_LABELS[o.plan] : "—"}</td>
                  <td>{formatMoney(o.amountCents, o.currency)}</td>
                  <td className="mono-sm">{o.txn ?? "—"}</td>
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
          <p className="muted mt-s">Sales appear here after the first purchase.</p>
        </div>
      )}
    </>
  );
}
