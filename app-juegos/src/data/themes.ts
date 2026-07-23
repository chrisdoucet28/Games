export type Theme = {
  id: string;
  name: string;
  emoji: string;
  // 3-stop gradient for full-screen hero backgrounds (welcome, game-select, results screens).
  heroBg: [string, string, string];
  // 2-stop gradient for primary "do the thing" buttons (Start a Game, Resume, Play Again).
  cta: [string, string];
  // 2-stop gradient + solid for secondary chrome (headers, "+ New Class", back-button borders,
  // step badges, the in-game top bar — everything that isn't a specific game's own visuals).
  accent: [string, string];
  accentSolid: string;
  // Applied only to big screen titles (h1/h2), never body text or buttons — a system font stack
  // (no network font loading), so each theme reads with a bit of its own personality without
  // touching legibility anywhere else.
  headingFont: string;
};

export const THEMES: Theme[] = [
  // The brand default — bright "game show stage" sky blue, first in the list so it's what every
  // new signup and the pre-auth screens see. cta uses a warm coral-to-pink "buzz in" pop against
  // the blue, same contrast logic a real game-show set uses (cool stage lighting, hot action button).
  { id: "sky", name: "Sky", emoji: "☀️", heroBg: ["#0C1E3D", "#0369A1", "#0EA5E9"], cta: ["#F59E0B", "#D97706"], accent: ["#38BDF8", "#7DD3FC"], accentSolid: "#0EA5E9", headingFont: "'Arial Rounded MT Bold', 'Century Gothic', 'Segoe UI', sans-serif" },
  { id: "violet", name: "Violet",  emoji: "💜", heroBg: ["#1E1B4B", "#312E81", "#4C1D95"], cta: ["#F59E0B", "#EF4444"], accent: ["#6366F1", "#8B5CF6"], accentSolid: "#6366F1", headingFont: "'Segoe UI', system-ui, sans-serif" },
  { id: "sunset", name: "Sunset",  emoji: "🌅", heroBg: ["#7C2D12", "#9A3412", "#C2410C"], cta: ["#F43F5E", "#FB923C"], accent: ["#F97316", "#F59E0B"], accentSolid: "#F97316", headingFont: "'Trebuchet MS', 'Segoe UI', sans-serif" },
  { id: "ocean",  name: "Ocean",   emoji: "🌊", heroBg: ["#0C2340", "#0E4C6B", "#155E75"], cta: ["#06B6D4", "#3B82F6"], accent: ["#0891B2", "#0EA5E9"], accentSolid: "#0891B2", headingFont: "'Verdana', 'Tahoma', sans-serif" },
  { id: "forest", name: "Forest",  emoji: "🌲", heroBg: ["#052E1A", "#064E3B", "#065F46"], cta: ["#22C55E", "#84CC16"], accent: ["#059669", "#10B981"], accentSolid: "#059669", headingFont: "'Century Gothic', 'Segoe UI', sans-serif" },
  { id: "rose",   name: "Rose",    emoji: "🌹", heroBg: ["#4C0519", "#831843", "#9D174D"], cta: ["#EC4899", "#F43F5E"], accent: ["#DB2777", "#EC4899"], accentSolid: "#DB2777", headingFont: "Georgia, 'Segoe UI', serif" },
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
