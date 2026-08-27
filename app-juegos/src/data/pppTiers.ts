// A lookup layered on top of GAME_MODES (data/constants.ts) — that array is already ordered
// low-to-high speech-demand (see its own comment) and each entry's `tag` carries the exact
// descriptor text. This groups those 15 games into 4 broad tiers for the PPP diagram (see
// PPPDiagram.tsx) without touching GameMode's type or any of the 15 game files that import it.
export type PPPTierId = "presentation" | "practice" | "production" | "free-production";

export type PPPTier = {
  id: PPPTierId;
  label: string;
  blurb: string;
  color: string;
  gameIds: string[];
};

export const PPP_TIERS: PPPTier[] = [
  {
    id: "presentation",
    label: "Presentation",
    blurb: "No speech required — silent recognition and judgment calls.",
    color: "#0EA5E9",
    gameIds: ["whack", "auction"],
  },
  {
    id: "practice",
    label: "Practice",
    blurb: "Short, controlled spoken answers — low-pressure reps.",
    color: "#22C55E",
    gameIds: ["battleship", "vault", "hill", "hotpotato", "castle", "racetrack"],
  },
  {
    id: "production",
    label: "Production",
    blurb: "Full sentences, prompted — students build language, not just pick it.",
    color: "#F59E0B",
    gameIds: ["minefield", "rocket", "orderup", "cards"],
  },
  {
    id: "free-production",
    label: "Free Production",
    blurb: "Sustained, unscripted talking — full fluency practice.",
    color: "#EF4444",
    gameIds: ["hotseat", "spy", "zombie"],
  },
];

export function getGameTier(gameId: string): PPPTier | undefined {
  return PPP_TIERS.find(t => t.gameIds.includes(gameId));
}
