import Link from "next/link";
import { Hex } from "@/components/ui/Hex";
import { RotatingWord } from "@/components/home/RotatingWord";

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="home-hero">
        <div className="wrap">
          <span className="kicker">
            <Hex /> Independent app studio
          </span>
          <h1 className="home-hero-title mt-s">
            We make <RotatingWord /> apps
          </h1>
          <p className="lead mt-m" style={{ maxWidth: "48ch" }}>
            Small, sharp Mac and iPhone apps — made with the rigor of a hive and the
            energy of a laboratory. Try them free, keep what earns its place.
          </p>
          <div className="home-cta">
            <Link className="btn btn-primary" href="/apps">
              Browse our apps
            </Link>
            <Link className="btn btn-secondary" href="/signup">
              Create your account
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="section section-alt">
        <div className="wrap">
          <div className="page-head">
            <span className="kicker">
              <Hex /> How it works
            </span>
            <h2>Free to try, yours to keep</h2>
          </div>
          <div className="grid-cards">
            <div className="card">
              <div className="step-num">1</div>
              <h3>Download free</h3>
              <p className="muted">
                Grab any app and use it right away — no account needed to start.
              </p>
            </div>
            <div className="card">
              <div className="step-num">2</div>
              <h3>Try for 7 days</h3>
              <p className="muted">
                A full week to see if it earns a spot on your Mac or iPhone.
              </p>
            </div>
            <div className="card">
              <div className="step-num">3</div>
              <h3>Keep it with a license</h3>
              <p className="muted">
                Monthly, quarterly, annual — or pay once for lifetime.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why */}
      <section className="section">
        <div className="wrap">
          <div className="page-head">
            <span className="kicker">
              <Hex /> Why Crazy Bee Labs
            </span>
            <h2>Less busywork. More output.</h2>
          </div>
          <div className="grid-cards">
            <div className="card">
              <h3>Native &amp; minimal</h3>
              <p className="muted">
                Built with the platform, not against it. Light, fast, right at home on
                your device.
              </p>
            </div>
            <div className="card">
              <h3>Private by design</h3>
              <p className="muted">
                Your data stays on your device. No tracking, no profiling, no surprises.
              </p>
            </div>
            <div className="card">
              <h3>Useful by default</h3>
              <p className="muted">
                Each app solves one real problem well, then gets out of the way.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA band */}
      <section className="section section-dark">
        <div className="wrap" style={{ textAlign: "center" }}>
          <h2>Built in the lab. Ready for your desk.</h2>
          <p
            className="lead"
            style={{ margin: "14px auto 26px", maxWidth: "44ch", color: "rgba(255,255,255,0.72)" }}
          >
            Browse the full collection of Mac and iPhone apps.
          </p>
          <Link className="btn btn-accent" href="/apps">
            See all apps
          </Link>
        </div>
      </section>
    </>
  );
}
