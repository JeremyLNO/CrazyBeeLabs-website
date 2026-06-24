import Link from "next/link";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap">
        <Link href="/" className="brand" aria-label="Crazy Bee Labs">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Crazy Bee Labs" />
        </Link>
        <div className="footer-links">
          <Link href="/account">Account</Link>
          <Link href="/login">Log in</Link>
          <a href="mailto:jeremy@lno.company">Support</a>
        </div>
        <span style={{ fontSize: 13 }}>© 2026 Crazy Bee Labs</span>
      </div>
    </footer>
  );
}
