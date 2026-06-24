import Link from "next/link";
import { auth } from "@/lib/auth";

export async function Header() {
  const session = await auth();
  const user = session?.user;

  return (
    <header className="site-header">
      <div className="wrap">
        <Link href="/" className="brand" aria-label="Crazy Bee Labs — home">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Crazy Bee Labs" />
          <b>Crazy Bee Labs</b>
        </Link>

        <nav className="header-nav" aria-label="Primary">
          <Link href="/#apps">Apps</Link>
          {user && <Link href="/account/licenses">Licenses</Link>}
        </nav>

        <div className="header-actions">
          {user ? (
            <>
              <span className="header-user">{user.email}</span>
              <Link href="/account" className="btn btn-secondary btn-sm">
                Account
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" className="btn btn-ghost btn-sm">
                Log in
              </Link>
              <Link href="/signup" className="btn btn-primary btn-sm">
                Create account
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
