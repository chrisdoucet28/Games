// Tutorial mockup for RaceTrackGame.tsx — update if that game's rules/scoring change.
import type { TutorialStep } from "../../types";

// Mirrors RaceTrackGame.tsx's real ZONES (task type by track position) and SPACE_DEFS (special
// space types) — a simplified straight strip instead of the real rectangular loop, since a loop
// doesn't fit in a small modal, but the zones/spaces/order are the real ones.
const TrackStrip = ({ carPos }: { carPos: number }) => {
  const zones = [
    { label: "Error Fix", short: "🔍", color: "#60A5FA" },
    { label: "Multi Choice", short: "🔤", color: "#4ADE80" },
    { label: "Fill Blank", short: "✏️", color: "#F97316" },
    { label: "Speaking", short: "🗣️", color: "#F7C948" },
  ];
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
        <div style={{ fontSize: "16px" }}>🏁</div>
        {zones.map((z, i) => (
          <div key={z.label} style={{ flex: 1, textAlign: "center", position: "relative" }}>
            <div style={{ background: z.color, borderRadius: "6px", padding: "6px 2px", fontSize: "13px" }}>{z.short}</div>
            <div style={{ fontSize: "7px", fontWeight: 800, color: "#374151", marginTop: "1px" }}>{z.label}</div>
            {carPos === i && <div style={{ position: "absolute", top: "-16px", left: "50%", transform: "translateX(-50%)", fontSize: "16px" }}>🚗</div>}
          </div>
        ))}
        <div style={{ fontSize: "16px" }}>🏆</div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "8px", color: "#6B7280", fontWeight: 700, marginTop: "2px" }}>
        <span>Start</span><span>Finish</span>
      </div>
    </div>
  );
};

export const RACETRACK_TUTORIAL_STEPS: TutorialStep[] = [
  {
    narration: "This is the track. It goes from Start to Finish. The track has 4 zones. Early zones have short written tasks. Later zones move to speaking.",
    visual: <TrackStrip carPos={0} />,
  },
  {
    narration: "Every team sees the SAME question — the one matching the zone the leading team is in. There is no separate turn order.",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ background: "#FEF2F2", border: "2px solid #EF4444", borderRadius: "10px", padding: "10px 16px", fontWeight: 700, color: "#7F1D1D", fontSize: "13px" }}>
          "She ___ (go) to school every day."
        </div>
      </div>
    ),
  },
  {
    narration: "Raise your hand fast! Whoever answers correctly FIRST rolls the dice. No one gets it right? Tap 'No one got it' — nobody moves.",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "22px" }}>🙋🙋‍♀️</div>
        <div style={{ fontSize: "11px", fontWeight: 700, color: "#7F1D1D", marginTop: "4px" }}>First correct hand wins the roll!</div>
      </div>
    ),
  },
  {
    narration: "The team that answered first rolls the dice and moves forward that many spaces on the track.",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "24px" }}>🎲</div>
        <div style={{ fontSize: "11px", fontWeight: 800, color: "#166534", marginTop: "2px" }}>Rolled a 4 — move forward 4 spaces!</div>
      </div>
    ),
  },
  {
    narration: "Landing on a special space does something extra! ⚡Boost and 🚀Shortcut send you forward. 🟫Mud makes you skip a turn, and 💥Trap sends you back — 🛡️Shield can block those.",
    visual: (
      <div style={{ display: "flex", justifyContent: "center", gap: "6px", flexWrap: "wrap", maxWidth: "220px", margin: "0 auto" }}>
        {[
          { icon: "⚡", label: "+3" }, { icon: "🚀", label: "+5" }, { icon: "🟫", label: "skip" },
          { icon: "💥", label: "-3" }, { icon: "🌀", label: "warp" }, { icon: "🛡️", label: "block" },
        ].map(s => (
          <div key={s.icon} style={{ background: "#F3F4F6", borderRadius: "8px", padding: "4px 6px", textAlign: "center", minWidth: "34px" }}>
            <div style={{ fontSize: "14px" }}>{s.icon}</div>
            <div style={{ fontSize: "8px", fontWeight: 800, color: "#374151" }}>{s.label}</div>
          </div>
        ))}
      </div>
    ),
  },
  {
    narration: "🪙Coin spaces and ❓question spaces give you coins or powerups. Between turns, spend coins on things like a Rocket (+6 spaces) or a Banana Trap for other teams.",
    visual: (
      <div style={{ display: "flex", justifyContent: "center", gap: "8px" }}>
        <span style={{ fontSize: "11px", fontWeight: 800, color: "#92400E" }}>🪙 10 coins</span>
        <span style={{ fontSize: "11px", fontWeight: 800, color: "#92400E" }}>🚀 Rocket — 15 coins</span>
      </div>
    ),
  },
  {
    narration: "The first team to reach Finish wins the race! Then every team scores points based on how far they got — 1st place scores the most, but everyone gets something.",
    visual: (
      <div style={{ display: "flex", flexDirection: "column", gap: "3px", maxWidth: "160px", margin: "0 auto", fontSize: "11px", fontWeight: 800, color: "#374151" }}>
        <div>🥇 1st — 100 pts</div>
        <div>🥈 2nd — 65 pts</div>
        <div>🥉 3rd — 40 pts</div>
      </div>
    ),
  },
];
