import { GAME_ICONS } from "../../data/constants";
import { getGameBlocks, helpLevelColor } from "../../data/gameCategories";
import { Icon } from "./Icon";

// The homepage's "pick games by what you need" section — the same blocks the game-select page shows,
// on the marketing page's dark background. Reads straight from data/gameCategories.ts, so it can never
// drift from what a teacher sees once they're logged in. Deliberately NO help-level dials here: seven
// of them side by side looked cluttered — the dial lives only on the in-app game-select screen. The
// colored edge is the only trace of the help level.
export function GameCategoryGuide() {
  const blocks = getGameBlocks();
  return (
    <div style={{ maxWidth: "980px", margin: "0 auto" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(270px,1fr))", gap: "14px" }}>
        {blocks.map(({ category, games }) => (
          <div
            key={category.id}
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", borderLeft: `5px solid ${helpLevelColor(category.helpLevel)}`, borderRadius: "14px", padding: "16px 14px", display: "flex", flexDirection: "column", gap: "8px" }}
          >
            <div>
              <div style={{ color: "#7DB8DB", fontSize: "11px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em" }}>I need</div>
              <div style={{ color: "white", fontWeight: 900, fontSize: "15px", lineHeight: 1.3 }}>{category.need}</div>
            </div>
            <div style={{ color: "#BAE6FD", fontSize: "12px", lineHeight: 1.45 }}>{category.blurb}</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "auto" }}>
              {games.map(g => (
                <span key={g.id} style={{ background: "rgba(255,255,255,0.1)", color: "white", borderRadius: "8px", padding: "3px 8px", fontSize: "11px", fontWeight: 700, whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                  <Icon name={GAME_ICONS[g.id]} size={11} /> {g.name}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div style={{ textAlign: "center", color: "#7DB8DB", fontSize: "13px", marginTop: "14px", lineHeight: 1.6 }}>
        Pre-teach with a Learn lesson, then pick the group that matches what you need today.
      </div>
    </div>
  );
}
