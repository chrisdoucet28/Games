// Dense rank (1,1,2 — not 1,1,3) over a numeric value, descending by default. Ties share a rank
// (and therefore the same medal) instead of an arbitrary array-index sort handing a tie an
// unearned winner/runner-up split. Mirrors the rankByFuel/distinctPosDesc pattern already proven
// out in RocketFuelGame.tsx and RaceTrackGame.tsx — pulled out here so every game (and the shared
// ScoreBoard) can use the same tie-aware ranking instead of re-deriving it per file.
export function denseRank<T>(items: T[], valueOf: (item: T) => number, order: "desc" | "asc" = "desc"): Array<{ item: T; rank: number; value: number }> {
  const withValue = items.map(item => ({ item, value: valueOf(item) }));
  const distinct = [...new Set(withValue.map(x => x.value))].sort((a, b) => (order === "desc" ? b - a : a - b));
  return withValue.map(x => ({ ...x, rank: distinct.indexOf(x.value) }));
}

export function medalForRank(rank: number): string {
  return rank === 0 ? "🥇" : rank === 1 ? "🥈" : rank === 2 ? "🥉" : "🎖️";
}
