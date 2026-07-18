/**
 * Full app showcase for the site (all apps, not just the licensed ones).
 * macOS apps have a detail page (/apps/<slug>) and are downloaded + licensed
 * here; iPhone apps live on the App Store. Categories & devices drive the
 * filters and the "Our apps" mega-menu.
 */

export type Category = "work-smarter" | "personal" | "games";
export type Device = "mac" | "iphone" | "web";

export interface ShowcaseApp {
  slug: string;
  name: string;
  tagline: string;
  category: Category;
  device: Device;
  icon: string; // /apps/<slug>.png
  /** On-site detail page (all apps have one now). */
  href: string;
  /** true when href points off-site. */
  external?: boolean;
  /** iPhone apps: the App Store URL used only by the "Download" button. */
  appStoreUrl?: string;
  /** Screenshot image URLs for the detail page (optional; placeholders if empty). */
  screenshots?: string[];
}

/** Display order of the categories in the mega-menu and filters. */
export const CATEGORY_ORDER: Category[] = ["work-smarter", "personal", "games"];

// iPhone apps: replace href with the real App Store URLs when published.
const APP_STORE = "https://apps.apple.com/";

export const SHOWCASE: ShowcaseApp[] = [
  // ── Work smarter (macOS, licensed here) ──
  { slug: "shotbox", name: "Shotbox", tagline: "Screenshots, finally organized.", category: "work-smarter", device: "mac", icon: "/apps/shotbox.png", href: "/apps/shotbox" },
  { slug: "macnap-blocker", name: "Macnap Blocker", tagline: "Keep your Mac wide awake.", category: "work-smarter", device: "mac", icon: "/apps/macnap-blocker.png", href: "/apps/macnap-blocker" },
  { slug: "energy-manager", name: "Energy Manager", tagline: "Understand and protect your battery.", category: "work-smarter", device: "mac", icon: "/apps/energy-manager.png", href: "/apps/energy-manager" },
  { slug: "fastrename", name: "FastRename", tagline: "Rename hundreds of files in seconds.", category: "work-smarter", device: "mac", icon: "/apps/fastrename.png", href: "/apps/fastrename" },
  { slug: "spaceonmydisk", name: "SpaceOnMyDisk", tagline: "Find what's eating your disk.", category: "work-smarter", device: "mac", icon: "/apps/spaceonmydisk.png", href: "/apps/spaceonmydisk" },
  { slug: "never-miss-a-meeting", name: "Never Miss a Meeting", tagline: "Playful nudges so you're never late again.", category: "work-smarter", device: "mac", icon: "/apps/never-miss-a-meeting.png", href: "/apps/never-miss-a-meeting" },
  { slug: "opti-worktime", name: "TopDeck", tagline: "Focus timer in your notch. Grow a garden.", category: "work-smarter", device: "mac", icon: "/apps/opti-worktime.png", href: "/apps/opti-worktime" },
  { slug: "spacespilot", name: "SpacesPilot", tagline: "Snap windows into place, instantly.", category: "work-smarter", device: "mac", icon: "/apps/spacespilot.png", href: "/apps/spacespilot" },
  // ── Work smarter (iPhone) ──
  { slug: "qualiscan", name: "QualiScan", tagline: "A pocket scanner that reads your docs.", category: "work-smarter", device: "iphone", icon: "/apps/qualiscan.png", href: "/apps/qualiscan", appStoreUrl: APP_STORE },

  // ── Personal ──
  { slug: "sunshine", name: "Sunshine", tagline: "Weather you'll actually want to look at.", category: "personal", device: "mac", icon: "/apps/sunshine.png", href: "/apps/sunshine" },
  { slug: "deskmate", name: "Deskmate", tagline: "A desktop companion you can talk to.", category: "personal", device: "mac", icon: "/apps/deskmate.png", href: "/apps/deskmate" },
  { slug: "cycles", name: "Cycles", tagline: "Your cycle, calmly tracked.", category: "personal", device: "iphone", icon: "/apps/cycles.png", href: "/apps/cycles", appStoreUrl: APP_STORE },
  { slug: "menu-island", name: "MenuIsland", tagline: "Launch your apps from the Dynamic Island.", category: "personal", device: "iphone", icon: "/apps/menu-island.png", href: "/apps/menu-island", appStoreUrl: APP_STORE },
  { slug: "dualcam-oxo", name: "DualCam OxO", tagline: "Film with two lenses at once.", category: "personal", device: "iphone", icon: "/apps/dualcam-oxo.png", href: "/apps/dualcam-oxo", appStoreUrl: APP_STORE },
  { slug: "wallspaces", name: "WallSpaces", tagline: "A different wallpaper for every Space.", category: "personal", device: "mac", icon: "/apps/wallspaces.png", href: "/apps/wallspaces" },
  { slug: "respire", name: "Respire", tagline: "Quit smoking, vaping or nicotine — one day at a time.", category: "personal", device: "iphone", icon: "/apps/respire.png", href: "/apps/respire", appStoreUrl: APP_STORE },
  { slug: "pillo", name: "Pillo", tagline: "Never miss your pill again.", category: "personal", device: "iphone", icon: "/apps/pillo.png", href: "/apps/pillo", appStoreUrl: APP_STORE },

  // ── Games ── (coming back soon)
];

export function showcaseByCategory(cat: Category): ShowcaseApp[] {
  return SHOWCASE.filter((a) => a.category === cat);
}

export function getShowcaseApp(slug: string): ShowcaseApp | undefined {
  return SHOWCASE.find((a) => a.slug === slug);
}

/** iPhone apps that have an on-site detail page. */
export const IPHONE_APPS = SHOWCASE.filter((a) => a.device === "iphone");
