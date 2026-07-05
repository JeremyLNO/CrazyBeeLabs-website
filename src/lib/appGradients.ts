/** Per-app accent gradient [from, to] — from the design handoff (1a Clean Bento). */
export const APP_GRADIENTS: Record<string, [string, string]> = {
  shotbox: ["#6EA8FE", "#3B82F6"],
  "macnap-blocker": ["#A78BFA", "#7C3AED"],
  "energy-manager": ["#34D399", "#059669"],
  fastrename: ["#FBBF24", "#F59E0B"],
  spaceonmydisk: ["#F472B6", "#DB2777"],
  "never-miss-a-meeting": ["#FB7185", "#E11D48"],
  "opti-worktime": ["#22D3EE", "#0891B2"],
  spacespilot: ["#818CF8", "#4F46E5"],
  qualiscan: ["#4ADE80", "#16A34A"],
  sunshine: ["#FDE047", "#F59E0B"],
  deskmate: ["#FCA5A5", "#EF4444"],
  cycles: ["#5EEAD4", "#14B8A6"],
  "menu-island": ["#C4B5FD", "#8B5CF6"],
  "dualcam-oxo": ["#93C5FD", "#2563EB"],
};

export function appGradientCss(slug: string): string {
  const [a, b] = APP_GRADIENTS[slug] ?? ["#FFCE4B", "#F5A623"];
  return `linear-gradient(135deg, ${a}, ${b})`;
}
