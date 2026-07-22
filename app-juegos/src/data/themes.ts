export type Theme = {
  id: string;
  name: string;
  emoji: string;
  // 3-stop gradient for full-screen hero backgrounds (welcome screen).
  heroBg: [string, string, string];
  // 2-stop gradient for primary "do the thing" buttons (Start a Game, Resume).
  cta: [string, string];
  // 2-stop gradient + solid for secondary chrome (headers, "+ New Class", back-button borders).
  accent: [string, string];
  accentSolid: string;
};

export const THEMES: Theme[] = [
  { id: "violet", name: "Violet",  emoji: "💜", heroBg: ["#1E1B4B", "#312E81", "#4C1D95"], cta: ["#F59E0B", "#EF4444"], accent: ["#6366F1", "#8B5CF6"], accentSolid: "#6366F1" },
  { id: "sunset", name: "Sunset",  emoji: "🌅", heroBg: ["#7C2D12", "#9A3412", "#C2410C"], cta: ["#F43F5E", "#FB923C"], accent: ["#F97316", "#F59E0B"], accentSolid: "#F97316" },
  { id: "ocean",  name: "Ocean",   emoji: "🌊", heroBg: ["#0C2340", "#0E4C6B", "#155E75"], cta: ["#06B6D4", "#3B82F6"], accent: ["#0891B2", "#0EA5E9"], accentSolid: "#0891B2" },
  { id: "forest", name: "Forest",  emoji: "🌲", heroBg: ["#052E1A", "#064E3B", "#065F46"], cta: ["#22C55E", "#84CC16"], accent: ["#059669", "#10B981"], accentSolid: "#059669" },
  { id: "rose",   name: "Rose",    emoji: "🌹", heroBg: ["#4C0519", "#831843", "#9D174D"], cta: ["#EC4899", "#F43F5E"], accent: ["#DB2777", "#EC4899"], accentSolid: "#DB2777" },
];

export const DEFAULT_THEME = THEMES[0];

export function getTheme(themeId: string | null | undefined): Theme {
  return THEMES.find(t => t.id === themeId) ?? DEFAULT_THEME;
}

// For glow/shadow effects that need to tint with a theme's own color instead of a fixed hue.
export function hexToRgba(hex: string, alpha: number): string {
  const n = parseInt(hex.replace("#", ""), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`;
}
