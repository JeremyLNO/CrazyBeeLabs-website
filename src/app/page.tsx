import Link from "next/link";
import { Hex } from "@/components/ui/Hex";
import { RotatingWord } from "@/components/home/RotatingWord";
import { AppsExplorer } from "@/components/home/AppsExplorer";

export default function HomePage() {
  return (
    <>
      <section className="home-hero">
        <div className="wrap">
          <span className="kicker">
            <Hex /> Independent app studio
          </span>
          <h1 className="home-hero-title mt-s">
            We make <RotatingWord /> apps
          </h1>
          <p className="lead mt-m" style={{ maxWidth: "48ch" }}>
            Download our apps free and try them for 7 days. Keep the macOS ones with a
            license — monthly, quarterly, annual, or lifetime.
          </p>
          <div className="home-cta">
            <Link className="btn btn-primary" href="/signup">
              Create your account
            </Link>
            <a className="btn btn-secondary" href="#apps">
              Browse apps
            </a>
          </div>
        </div>
      </section>

      <section className="section" id="apps">
        <div className="wrap">
          <div className="page-head">
            <span className="kicker">
              <Hex /> Apps
            </span>
            <h2>Browse the apps</h2>
            <p className="lead">
              Filter by category or device. macOS apps are licensed here; iPhone apps
              live on the App Store; games are free in your browser.
            </p>
          </div>
          <AppsExplorer />
        </div>
      </section>
    </>
  );
}
