import { useEffect, useRef, useState } from "react";
import type { GameMode } from "../../types";
import type { Theme } from "../../data/themes";
import { GAME_ICONS } from "../../data/constants";
import { getGameBlocks, orderedGameModes, gameModalityIcon, helpLevelColor } from "../../data/gameCategories";
import { GameGauge } from "./GameGauge";
import { IconBadge } from "./IconBadge";
import { Icon } from "./Icon";

// The games area of the game-select screen: games grouped into "I need…" blocks (each with a
// help-level dial), plus a teacher's checklist beside them that jumps to a block. Grouping and order
// come entirely from data/gameCategories.ts — this file has no opinion about which game is where.
// `randomSpinIndex` indexes orderedGameModes() (the on-screen order), which is also what the
// Surprise Me wheel in LessonGamesGenerator steps through.
const CSS = `
  .cc-gs-layout { display: grid; grid-template-columns: 250px minmax(0,1fr); gap: 24px; align-items: start; }
  .cc-gs-checklist { position: sticky; top: 16px; }
  .cc-gs-checklist-items { display: flex; flex-direction: column; gap: 8px; }
  .cc-gs-card:focus-visible { outline: 3px solid #0C1E3D; outline-offset: 3px; }
  @media (max-width: 860px) {
    .cc-gs-layout { grid-template-columns: minmax(0,1fr); gap: 14px; }
    .cc-gs-checklist { position: static; }
    .cc-gs-checklist-items { flex-direction: row; overflow-x: auto; padding-bottom: 8px; }
    .cc-gs-checklist-items button { flex: 0 0 auto; width: 210px; }
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
  const [flashId, setFlashId] = useState<string | null>(null);
  const flashTimer = useRef<number | null>(null);
  useEffect(() => () => { if (flashTimer.current) window.clearTimeout(flashTimer.current); }, []);

  const jumpTo = (id: string) => {
    document.getElementById(`cc-block-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setFlashId(id);
    if (flashTimer.current) window.clearTimeout(flashTimer.current);
    flashTimer.current = window.setTimeout(() => setFlashId(null), 1500);
  };

  const canPick = !loadingGame && randomSpinIndex === null;

  return (
    <div className="cc-gs-layout">
      <style>{CSS}</style>

      <aside className="cc-gs-checklist" aria-label="Teacher's checklist">
        <div style={{ background: "white", border: "3px solid #0C1E3D", borderRadius: "16px", boxShadow: "4px 4px 0 #0C1E3D", padding: "14px" }}>
          <div style={{ fontWeight: 900, fontSize: "15px", color: theme.heroBg[0], fontFamily: theme.headingFont, marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
            <Icon name="clipboard" size={15} /> I need:
          </div>
          <div className="cc-gs-checklist-items">
            {blocks.map(({ category }) => (
              <button
                key={category.id} onClick={() => jumpTo(category.id)}
                style={{
                  display: "flex", alignItems: "flex-start", gap: "8px", textAlign: "left", background: "#F0F9FF",
                  border: "2px solid #E0F2FE", borderRadius: "10px", padding: "8px 10px", cursor: "pointer",
                  fontSize: "12.5px", fontWeight: 700, color: "#1F2937", lineHeight: 1.35, fontFamily: "inherit",
                }}
              >
                <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: helpLevelColor(category.helpLevel), border: "2px solid #0C1E3D", flexShrink: 0, marginTop: "3px", boxSizing: "border-box" }} />
                {category.need}
              </button>
            ))}
          </div>
        </div>
      </aside>

      <div style={{ display: "flex", flexDirection: "column", gap: "26px", minWidth: 0 }}>
        {blocks.map(({ category, games }) => (
          <section
            key={category.id} id={`cc-block-${category.id}`}
            style={{
              scrollMarginTop: "16px", borderRadius: "20px", padding: "14px", margin: "-14px",
              background: flashId === category.id ? "rgba(3,105,161,0.08)" : "transparent", transition: "background 0.4s ease",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "14px", flexWrap: "wrap" }}>
              <GameGauge level={category.helpLevel} />
              <div style={{ flex: "1 1 220px", minWidth: 0 }}>
                <div style={{ fontSize: "11px", fontWeight: 800, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.06em" }}>I need</div>
                <h2 style={{ margin: "1px 0 3px", fontSize: "19px", fontWeight: 900, lineHeight: 1.25, color: theme.heroBg[0], fontFamily: theme.headingFont }}>{category.need}</h2>
                <div style={{ fontSize: "13px", color: "#6B7280", lineHeight: 1.45 }}>{category.blurb}</div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(210px,1fr))", gap: "14px" }}>
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
    </div>
  );
}
