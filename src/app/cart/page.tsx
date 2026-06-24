import { auth } from "@/lib/auth";
import { CartView } from "@/components/cart/CartView";
import { Hex } from "@/components/ui/Hex";

export const metadata = { title: "Cart" };

export default async function CartPage() {
  const session = await auth();
  const user =
    session?.user && session.user.email
      ? { id: session.user.id, email: session.user.email }
      : null;

  return (
    <section className="section">
      <div className="wrap">
        <div className="page-head">
          <span className="kicker">
            <Hex /> Cart
          </span>
          <h1>Your cart</h1>
        </div>
        <CartView user={user} />
      </div>
    </section>
  );
}
