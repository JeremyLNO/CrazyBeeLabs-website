/**
 * In-code product catalogue.
 *
 * The paid macOS apps and their 4 plans. This is the single source of truth
 * for what can be sold; the database only stores *who bought what*.
 *
 * To go live: create the matching prices in Paddle and paste each
 * `pri_…` id into `paddlePriceId`. While a price id is empty the plan's
 * checkout button stays disabled.
 *
 * iOS apps (QualiScan, Cycles) are sold on the App Store and are NOT here.
 * Browser games are free and are NOT here.
 */

export type PlanInterval = "month" | "quarter" | "year" | "lifetime";

export interface CatalogPlan {
  interval: PlanInterval;
  /** Display price, e.g. "€2.99 / mo". Real billing amount comes from Paddle. */
  priceLabel: string;
  /** Paddle price id (pri_…). Empty until configured. */
  paddlePriceId: string;
  recommended?: boolean;
  note?: string;
}

export interface CatalogApp {
  slug: string;
  name: string;
  tagline: string;
  platform: "mac";
  /** Bundle id used by the macOS app when it validates a license. */
  bundleId: string;
  /** Icon served from /public/apps/<slug>.png */
  icon: string;
  /** Direct download of the notarized build. Absent/null until the file is published. */
  downloadUrl?: string | null;
  /** Screenshot image URLs shown on the detail page (horizontal scroller). */
  screenshots?: string[];
  plans: CatalogPlan[];
}

function plans(month: string, quarter: string, year: string, lifetime: string): CatalogPlan[] {
  return [
    { interval: "month", priceLabel: month, paddlePriceId: "" },
    { interval: "quarter", priceLabel: quarter, paddlePriceId: "" },
    { interval: "year", priceLabel: year, paddlePriceId: "", recommended: true, note: "Best value" },
    { interval: "lifetime", priceLabel: lifetime, paddlePriceId: "", note: "Pay once" },
  ];
}

export const PLAN_LABELS: Record<PlanInterval, string> = {
  month: "Monthly",
  quarter: "Quarterly",
  year: "Annual",
  lifetime: "Lifetime",
};

export const CATALOG: CatalogApp[] = [
  {
    slug: "shotbox",
    name: "Shotbox",
    tagline: "Screenshots, finally organized.",
    platform: "mac",
    bundleId: "company.lno.shotbox",
    icon: "/apps/shotbox.png",
    plans: plans("€2.99 / mo", "€7.99 / 3 mo", "€24.99 / yr", "€49.99"),
  },
  {
    slug: "macnap-blocker",
    name: "Macnap Blocker",
    tagline: "Keep your Mac wide awake.",
    platform: "mac",
    bundleId: "company.lno.macnapblocker",
    icon: "/apps/macnap-blocker.png",
    plans: plans("€1.99 / mo", "€4.99 / 3 mo", "€14.99 / yr", "€29.99"),
  },
  {
    slug: "energy-manager",
    name: "Energy Manager",
    tagline: "Understand and protect your battery.",
    platform: "mac",
    bundleId: "company.lno.energymanager",
    icon: "/apps/energy-manager.png",
    plans: plans("€2.99 / mo", "€7.99 / 3 mo", "€24.99 / yr", "€49.99"),
  },
  {
    slug: "fastrename",
    name: "FastRename",
    tagline: "Rename hundreds of files in seconds.",
    platform: "mac",
    bundleId: "company.lno.bulkrenamer",
    icon: "/apps/fastrename.png",
    plans: plans("€2.99 / mo", "€7.99 / 3 mo", "€24.99 / yr", "€49.99"),
  },
  {
    slug: "spaceonmydisk",
    name: "SpaceOnMyDisk",
    tagline: "Find what's eating your disk.",
    platform: "mac",
    bundleId: "company.lno.spaceonmydisk",
    icon: "/apps/spaceonmydisk.png",
    plans: plans("€2.99 / mo", "€7.99 / 3 mo", "€24.99 / yr", "€49.99"),
  },
  {
    slug: "sunshine",
    name: "Sunshine",
    tagline: "Weather you'll actually want to look at.",
    platform: "mac",
    bundleId: "company.lno.weather",
    icon: "/apps/sunshine.png",
    plans: plans("€1.99 / mo", "€4.99 / 3 mo", "€14.99 / yr", "€29.99"),
  },
  {
    slug: "never-miss-a-meeting",
    name: "Never Miss a Meeting",
    tagline: "Playful nudges so you're never late again.",
    platform: "mac",
    bundleId: "company.lno.nevermissameeting",
    icon: "/apps/never-miss-a-meeting.png",
    plans: plans("€1.99 / mo", "€4.99 / 3 mo", "€14.99 / yr", "€29.99"),
  },
  {
    slug: "opti-worktime",
    name: "Opti Worktime",
    tagline: "Focus timer in your notch. Grow a garden.",
    platform: "mac",
    bundleId: "company.lno.optiworktime",
    icon: "/apps/opti-worktime.png",
    plans: plans("€2.99 / mo", "€7.99 / 3 mo", "€24.99 / yr", "€49.99"),
  },
  {
    slug: "spacespilot",
    name: "SpacesPilot",
    tagline: "Snap windows into place, instantly.",
    platform: "mac",
    bundleId: "company.lno.spacespilot",
    icon: "/apps/spacespilot.png",
    plans: plans("€2.99 / mo", "€7.99 / 3 mo", "€24.99 / yr", "€49.99"),
  },
  {
    slug: "deskmate",
    name: "Deskmate",
    tagline: "A desktop companion you can talk to.",
    platform: "mac",
    bundleId: "company.lno.deskmate",
    icon: "/apps/deskmate.png",
    plans: plans("€2.99 / mo", "€7.99 / 3 mo", "€24.99 / yr", "€49.99"),
  },
  {
    slug: "wallspaces",
    name: "WallSpaces",
    tagline: "A different wallpaper for every Space.",
    platform: "mac",
    bundleId: "company.lno.wallspaces",
    icon: "/apps/wallspaces.png",
    plans: plans("€1.99 / mo", "€4.99 / 3 mo", "€14.99 / yr", "€29.99"),
  },
];

export function getApp(slug: string): CatalogApp | undefined {
  return CATALOG.find((a) => a.slug === slug);
}

export function getAppByBundleId(bundleId: string): CatalogApp | undefined {
  return CATALOG.find((a) => a.bundleId === bundleId);
}

export function appName(slug: string): string {
  return getApp(slug)?.name ?? slug;
}

export function getPlan(slug: string, interval: PlanInterval): CatalogPlan | undefined {
  return getApp(slug)?.plans.find((p) => p.interval === interval);
}
