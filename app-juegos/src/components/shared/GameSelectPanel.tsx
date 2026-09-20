import type { GameMode } from "../../types";
import type { Theme } from "../../data/themes";
import { GAME_ICONS } from "../../data/constants";
import { getGameBlocks, orderedGameModes, gameModalityIcon, helpLevelColor } from "../../data/gameCategories";
import { GameGauge } from "./GameGauge";
import { IconBadge } from "./IconBadge";
import { Icon } from "./Icon";

// The games area of the game-select screen: games grouped into "I need…" blocks. Each block is a row
// with an info box on the left (help-level dial + what the teacher needs) that sits beside that
// block's games and scrolls with them (deliberately not sticky), and the game cards on the right. Grouping and order come
// entirely from data/gameCategories.ts — this file has no opinion about which game is where.
// `randomSpinIndex` indexes orderedGameModes() (the on-screen order), which is also what the
// Surprise Me wheel in LessonGamesGenerator steps through.
const CSS = `
  .cc-gs-block { display: grid; grid-template-columns: 250px minmax(0,1fr); gap: 22px; align-items: start; }
  .cc-gs-info-inner { display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 12px 14px 16px; }
  .cc-gs-card:focus-visible { outline: 3px solid #0C1E3D; outline-offset: 3px; }
  @media (max-width: 860px) {
    .cc-gs-block { grid-template-columns: minmax(0,1fr); gap: 14px; }
    .cc-gs-info-inner { flex-direction: row; flex-wrap: wrap; align-items: center; justify-content: center; }
    .cc-gs-info-text { width: auto !important; flex: 1 1 200px; }
  }
`;

type Props = {
  theme: Theme;
  loadingGame: boolean;
  randomSpinIndex: number | null;
  onPick: (game: GameMode) => void;
};

export function GameSelectPanel({ theme, loadingGame, randomSpinIndex, onPick }: Props) {
  const blocks = getGameBlocks();
  const order = orderedGameModes();
  const canPick = !loadingGame && randomSpinIndex === null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "34px" }}>
      <style>{CSS}</style>
      {blocks.map(({ category, games }) => (
        <section key={category.id} className="cc-gs-block" aria-label={`I need: ${category.need}`}>
          <aside className="cc-gs-info">
            <div style={{ background: "white", border: "3px solid #0C1E3D", borderRadius: "16px", boxShadow: "4px 4px 0 #0C1E3D", overflow: "hidden" }}>
              <div style={{ height: "8px", background: helpLevelColor(category.helpLevel), borderBottom: "3px solid #0C1E3D" }} />
              <div className="cc-gs-info-inner">
                <GameGauge level={category.helpLevel} size="lg" />
                <div className="cc-gs-info-text" style={{ minWidth: 0, width: "100%" }}>
                  <div style={{ fontSize: "11px", fontWeight: 800, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.06em" }}>I need</div>
                  <h2 style={{ margin: "1px 0 4px", fontSize: "17px", fontWeight: 900, lineHeight: 1.25, color: theme.heroBg[0], fontFamily: theme.headingFont }}>{category.need}</h2>
                  <div style={{ fontSize: "13px", color: "#6B7280", lineHeight: 1.45 }}>{category.blurb}</div>
                </div>
              </div>
            </div>
          </aside>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(210px,1fr))", gap: "14px", minWidth: 0 }}>
            {games.map(g => {
              const isSpinLit = randomSpinIndex === order.findIndex(o => o.id === g.id);
              return (
                <div
                  key={g.id} className="cc-gs-card" role="button" tabIndex={0} aria-label={`Play ${g.name}`}
                  onClick={() => canPick && onPick(g)}
                  onKeyDown={e => { if ((e.key === "Enter" || e.key === " ") && canPick) { e.preventDefault(); onPick(g); } }}
                  style={{
                    background: isSpinLit ? `${g.color}1A` : "white",
                    border: `3px solid ${g.color}`,
                    borderRadius: "18px",
                    padding: "18px",
                    cursor: randomSpinIndex === null ? "pointer" : "default",
                    transition: "transform 0.12s ease, box-shadow 0.12s ease, background 0.12s ease",
                    transform: isSpinLit ? "scale(1.06)" : "scale(1)",
                    boxShadow: isSpinLit ? `0 0 0 4px ${g.color}55, 0 10px 24px ${g.color}55` : "none",
                  }}
                >
                  <div style={{ marginBottom: "10px" }}><IconBadge icon={GAME_ICONS[g.id]} color={g.color} size={52} /></div>
                  <div style={{ fontWeight: 900, fontSize: "17px", color: theme.heroBg[0], marginBottom: "4px", fontFamily: theme.headingFont }}>{g.name}</div>
                  <div style={{ fontSize: "13px", color: "#6B7280", marginBottom: "8px" }}>{g.desc}</div>
                  <div style={{ fontSize: "12px", color: g.color, fontWeight: 700, lineHeight: 1.4, borderTop: `1px solid ${g.color}33`, paddingTop: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                    <Icon name={gameModalityIcon(g.id)} size={13} /> {g.tag}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
