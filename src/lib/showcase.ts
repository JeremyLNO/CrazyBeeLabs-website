/**
 * Full app showcase for the home page (all apps, not just the licensed ones).
 * macOS apps link to their pricing page; iPhone apps to the App Store; games play
 * in the browser. Categories & devices drive the home filters.
 */

export type Category = "work-smarter" | "personal" | "games";
export type Device = "mac" | "iphone" | "web";

export interface ShowcaseApp {
  slug: string;
  name: string;
  tagline: string;
  category: Category;
  device: Device;
  icon: string | null; // /apps/<slug>.png for native apps; null → use glyph
  glyph?: string; // inline SVG for games
  href: string;
  cta: string;
  external?: boolean;
}

export const CATEGORY_LABELS: Record<Category, string> = {
  "work-smarter": "Work smarter",
  personal: "Personal",
  games: "Games",
};

export const DEVICE_LABELS: Record<Device, string> = {
  mac: "Mac",
  iphone: "iPhone",
  web: "Browser",
};

const PLANET =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="M3.5 16c4 3 12 2.5 16-2.5M19 7c2 2.5 1.5 4-1 4.5"/></svg>';
const BALL =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7l3.5 2.5-1.3 4.2h-4.4L8.5 9.5z"/><path d="M12 3v4M4.5 9.5l3.5 2M19.5 9.5L16 11.5M7.5 19l1.8-4.3M16.5 19l-1.8-4.3"/></svg>';
const FLAG =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 21V4M5 4h11l-2 3 2 3H5"/></svg>';

// iPhone apps: replace href with the real App Store URLs when published.
const APP_STORE = "https://apps.apple.com/";

export const SHOWCASE: ShowcaseApp[] = [
  { slug: "shotbox", name: "Shotbox", tagline: "Screenshots, finally organized.", category: "work-smarter", device: "mac", icon: "/apps/shotbox.png", href: "/apps/shotbox", cta: "View plans" },
  { slug: "macnap-blocker", name: "Macnap Blocker", tagline: "Keep your Mac wide awake.", category: "work-smarter", device: "mac", icon: "/apps/macnap-blocker.png", href: "/apps/macnap-blocker", cta: "View plans" },
  { slug: "energy-manager", name: "Energy Manager", tagline: "Understand and protect your battery.", category: "work-smarter", device: "mac", icon: "/apps/energy-manager.png", href: "/apps/energy-manager", cta: "View plans" },
  { slug: "fastrename", name: "FastRename", tagline: "Rename hundreds of files in seconds.", category: "work-smarter", device: "mac", icon: "/apps/fastrename.png", href: "/apps/fastrename", cta: "View plans" },
  { slug: "spaceonmydisk", name: "SpaceOnMyDisk", tagline: "Find what's eating your disk.", category: "work-smarter", device: "mac", icon: "/apps/spaceonmydisk.png", href: "/apps/spaceonmydisk", cta: "View plans" },
  { slug: "qualiscan", name: "QualiScan", tagline: "A pocket scanner that reads your docs.", category: "work-smarter", device: "iphone", icon: "/apps/qualiscan.png", href: APP_STORE, cta: "App Store", external: true },
  { slug: "sunshine", name: "Sunshine", tagline: "Weather you'll actually want to look at.", category: "personal", device: "mac", icon: "/apps/sunshine.png", href: "/apps/sunshine", cta: "View plans" },
  { slug: "cycles", name: "Cycles", tagline: "Your cycle, calmly tracked.", category: "personal", device: "iphone", icon: "/apps/cycles.png", href: APP_STORE, cta: "App Store", external: true },
  { slug: "star-hive", name: "Star Hive", tagline: "Explore a galaxy, build your hive.", category: "games", device: "web", icon: null, glyph: PLANET, href: "#", cta: "Play", external: true },
  { slug: "penalty-cup", name: "Penalty Cup", tagline: "Win the shootout. Lift the cup.", category: "games", device: "web", icon: null, glyph: BALL, href: "#", cta: "Play", external: true },
  { slug: "spacetrack", name: "SpaceTrack", tagline: "Anti-gravity time trials.", category: "games", device: "web", icon: null, glyph: FLAG, href: "#", cta: "Play", external: true },
];
