import { AppsExplorer } from "@/components/home/AppsExplorer";
import { Hex } from "@/components/ui/Hex";

export const metadata = {
  title: "Our apps",
  description:
    "Browse every Crazy Bee Labs app — filter by category and device. Mac, iPhone and browser games.",
};

export default function OurAppsPage() {
  return (
    <section className="section">
      <div className="wrap">
        <div className="page-head">
          <span className="kicker">
            <Hex /> Our apps
          </span>
          <h1>Our apps</h1>
          <p className="lead">
            Filter by category or device. macOS apps are licensed here; iPhone apps
            live on the App Store; games are free in your browser.
          </p>
        </div>
        <AppsExplorer />
      </div>
    </section>
  );
}
