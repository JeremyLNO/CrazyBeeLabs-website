/**
 * Long-form copy shown on each app's detail page: a description paragraph and
 * the main features. Keyed by slug (covers both macOS and iPhone apps).
 * Content is English for now (like the taglines); section headings are localized.
 */
export interface AppContent {
  description: string;
  features: string[];
}

export const APP_CONTENT: Record<string, AppContent> = {
  shotbox: {
    description:
      "Shotbox lives in your menu bar and turns messy screenshots into an organized library. Capture a region, a window, or the whole screen — as an image, an animated GIF, or a scrolling capture — and everything lands somewhere you can actually find it again.",
    features: [
      "Image capture: full screen, window, or region",
      "Animated GIF capture (2–5 seconds)",
      "Auto-scrolling capture of long windows",
      "Configurable global keyboard shortcuts",
      "Smart naming by date and app, with a built-in gallery",
    ],
  },
  "macnap-blocker": {
    description:
      "Macnap Blocker keeps your Mac awake for exactly as long as you need — a presentation, a long download, a movie — then quietly steps aside. One click from the menu bar, no Terminal, no fuss.",
    features: [
      "Prevent display and system sleep on demand",
      "Timed durations or keep-awake until you stop",
      "Scheduling and a global shortcut (⌃⌥⌘A)",
      "Notifications when a session ends",
      "Lightweight menu-bar app",
    ],
  },
  "energy-manager": {
    description:
      "Energy Manager gives you a clear read on your Mac's battery health and what's draining it. A single Battery Score, live charge details, and the apps burning the most energy — all from the menu bar, from real system data.",
    features: [
      "Battery Score at a glance",
      "Live charge and power-draw details",
      "See the most energy-hungry apps",
      "Advisory charge limit",
      "Real IOKit data, no guesswork",
    ],
  },
  fastrename: {
    description:
      "FastRename renames hundreds of files in seconds. Build a rule once — find & replace, numbering, case, dates — preview every change live, then apply it all in a single pass.",
    features: [
      "Batch rename with live preview",
      "Find & replace and sequential numbering",
      "Case and date formatting",
      "Non-destructive, easy to review before applying",
      "Native macOS, five languages",
    ],
  },
  spaceonmydisk: {
    description:
      "SpaceOnMyDisk shows you exactly what's eating your disk. A fast, parallel scan maps every folder by size so you can spot the space hogs and clear them out — safely, straight to the Trash.",
    features: [
      "Fast parallel disk scan",
      "Visual size breakdown by folder",
      "Find the biggest files fast",
      "Move items to the Trash safely",
      "Command-line mode (--scan)",
    ],
  },
  sunshine: {
    description:
      "Sunshine is weather you'll actually want to look at — clean, bright forecasts with soft animated 3D icons, from current conditions to a 16-day outlook, plus air quality. Powered by Open-Meteo with no API key.",
    features: [
      "Current, hourly and 3–16 day forecast",
      "Animated 3D weather icons",
      "Air quality index",
      "Menu-bar summary and notifications",
      "Offline cache, five languages",
    ],
  },
  "never-miss-a-meeting": {
    description:
      "Never Miss a Meeting turns reminders into something you can't ignore. A playful character bounces across your screen minutes before a call, with a one-click Join button — synced to your Google Calendar.",
    features: [
      "Full-screen playful reminder before each meeting",
      "One-click Join",
      "Five characters to choose from",
      "Google Calendar sync (read-only)",
      "Menu-bar app, five languages",
    ],
  },
  "opti-worktime": {
    description:
      "Opti Worktime is a focus timer that lives in your notch, Dynamic Island-style. Each focused session grows a little garden — stay on track and it blooms, abandon it and it wilts. Presets, stats and streaks keep you honest.",
    features: [
      "Pomodoro timer docked in the notch",
      "A garden that grows as you focus",
      "Presets, stats, streaks and a heatmap",
      "Auto-pause on lock, sleep or idle",
      "Global shortcuts, five languages",
    ],
  },
  spacespilot: {
    description:
      "SpacesPilot snaps your windows into place instantly. Pop the tile picker, click a zone — halves, quarters, thirds, full or center — and your window jumps there, across every display. A global shortcut makes it muscle memory.",
    features: [
      "Clickable mini-screen tile picker",
      "Halves, quarters, thirds, full, center",
      "Multi-display support",
      "Global shortcut (⌃⌥⌘Space)",
      "Native macOS, five languages",
    ],
  },
  qualiscan: {
    description:
      "QualiScan turns your iPhone into a pocket scanner that actually reads your documents. Capture a page, get a crisp, evenly-lit scan, and export a searchable PDF thanks to on-device OCR.",
    features: [
      "Edge-detection document scanning",
      "Illumination normalization for clean scans",
      "On-device OCR for searchable text",
      "Searchable PDF export",
      "Markup with PencilKit, five languages",
    ],
  },
  cycles: {
    description:
      "Cycles tracks your period and ovulation, calmly. A clear hero shows the days until your next period or fertile window, with multiple profiles, gentle reminders, and private data synced through iCloud.",
    features: [
      "Countdown to your period and ovulation",
      "Multiple profiles",
      "Day-before reminders and home-screen widgets",
      "Face ID lock and private iCloud sync",
      "Five languages",
    ],
  },
  "menu-island": {
    description:
      "MenuIsland puts an app launcher in your Dynamic Island. Long-press to open a grid of your favorite apps and jump straight to any of them — a shortcut that's always one tap away.",
    features: [
      "Launch apps from the Dynamic Island",
      "Long-press grid of your favorites",
      "Set up to 8 apps plus custom shortcuts",
      "Built on Live Activities",
      "Five languages",
    ],
  },
  "dualcam-oxo": {
    description:
      "DualCam OxO films with two lenses at the same time. Shoot wide and ultra-wide side by side, or front and back together, then save one stacked video or two separate files — in up to 4K.",
    features: [
      "Record two lenses simultaneously",
      "Portrait+Landscape or Front+Back modes",
      "720p, 1080p or 4K, with torch",
      "Save one combined video or two separate files",
      "Five languages",
    ],
  },
};

export function getAppContent(slug: string): AppContent | undefined {
  return APP_CONTENT[slug];
}
