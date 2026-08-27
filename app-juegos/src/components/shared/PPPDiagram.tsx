import { GAME_MODES } from "../../data/constants";
import { PPP_TIERS } from "../../data/pppTiers";

type Props = { variant: "full" | "compact" };

// Handles the row->column reflow on narrow screens and the arrow-glyph swap that goes with it —
// inline styles can't express a media query, so this follows the same "inject a small scoped
// <style> block" precedent LearnScreen.tsx already uses for its print stylesheet.
const DIAGRAM_CSS = `
  .ppp-flow { display: flex; align-items: stretch; gap: 0; }
  .ppp-arrow { display: flex; align-items: center; justify-content: center; min-width: 32px; }
  .ppp-arrow::after { content: "\\2192"; font-size: 22px; color: #94A3B8; }
  @media (max-width: 860px) {
    .ppp-flow { flex-direction: column; }
    .ppp-arrow { min-height: 24px; }
    .ppp-arrow::after { content: "\\2193"; }
  }
`;

const PRETEACH_NODE = { icon: "🎓", label: "Pre-teach", caption: "Start with a Learn lesson" };

export function PPPDiagram({ variant }: Props) {
  if (variant === "compact") {
    // A genuinely thin, single-line legend — not a diagram with its own visual weight. Just a
    // quick "here's the order, here's why" reminder that sits quietly wherever it's placed.
    return (
      <div style={{ maxWidth: "700px", margin: "10px auto 50px", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: "5px", fontSize: "11.5px", color: "#6B7280", lineHeight: 1.4 }}>
        <span style={{ fontWeight: "700", whiteSpace: "nowrap" }}>{PRETEACH_NODE.icon} {PRETEACH_NODE.label}</span>
        <span style={{ color: "#CBD5E1" }}>→</span>
        {PPP_TIERS.map((tier, i) => (
          <span key={tier.id} style={{ display: "inline-flex", alignItems: "center", gap: "5px", whiteSpace: "nowrap" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontWeight: "700" }}>
              <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: tier.color, flexShrink: 0 }} />
              {tier.label}
            </span>
            {i < PPP_TIERS.length - 1 && <span style={{ color: "#CBD5E1" }}>→</span>}
          </span>
        ))}
        <span style={{ color: "#9CA3AF" }}>— least to most speaking</span>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "980px", margin: "0 auto" }}>
      <style>{DIAGRAM_CSS}</style>
      <div className="ppp-flow" style={{ alignItems: "stretch" }}>
        <div style={{
          background: "rgba(255,255,255,0.06)", border: "1px dashed rgba(255,255,255,0.35)", borderRadius: "16px",
          padding: "18px 16px", minWidth: "140px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", gap: "6px",
        }}>
          <div style={{ fontSize: "28px" }}>{PRETEACH_NODE.icon}</div>
          <div style={{ color: "white", fontWeight: "900", fontSize: "14px" }}>{PRETEACH_NODE.label}</div>
          <div style={{ color: "#BAE6FD", fontSize: "12px", lineHeight: 1.4 }}>{PRETEACH_NODE.caption}</div>
        </div>

        <div className="ppp-arrow" />

        {PPP_TIERS.map((tier, i) => {
          const games = GAME_MODES.filter(g => tier.gameIds.includes(g.id));
          return (
            <div key={tier.id} style={{ display: "contents" }}>
              <div style={{
                background: "rgba(255,255,255,0.06)", border: `2px solid ${tier.color}`, borderRadius: "16px",
                padding: "16px 14px", minWidth: "170px", flex: 1, display: "flex", flexDirection: "column", gap: "8px",
              }}>
                <div>
                  <span style={{ background: tier.color, color: "white", borderRadius: "999px", padding: "3px 12px", fontSize: "12px", fontWeight: "800" }}>{tier.label}</span>
                </div>
                <div style={{ color: "#BAE6FD", fontSize: "12px", lineHeight: 1.4 }}>{tier.blurb}</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "auto" }}>
                  {games.map(g => (
                    <span key={g.id} style={{ background: "rgba(255,255,255,0.1)", color: "white", borderRadius: "8px", padding: "3px 8px", fontSize: "11px", fontWeight: "700", whiteSpace: "nowrap" }}>
                      {g.icon} {g.name}
                    </span>
                  ))}
                </div>
              </div>
              {i < PPP_TIERS.length - 1 && <div className="ppp-arrow" />}
            </div>
          );
        })}
      </div>
      <div style={{ textAlign: "center", color: "#7DB8DB", fontSize: "13px", marginTop: "14px", lineHeight: 1.6 }}>
        Pre-teach the language, then play — moving left to right asks more of your students as they get comfortable speaking.
      </div>
    </div>
  );
}
