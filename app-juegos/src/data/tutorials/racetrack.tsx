// Tutorial mockup for RaceTrackGame.tsx — update if that game's rules/scoring change.
import type { TutorialStep } from "../../types";

// A small, consistent "this part is made up" flag — sits on its own line below the example
// content (never inline beside it, which would throw off the content's own centering), since a
// student shouldn't mistake a sample question for literally what they'll be asked — that depends
// on whatever topic(s) the teacher picked for today's class.
function ExampleTag() {
  return (
    <div style={{ marginTop: "8px" }}>
      <span style={{ display: "inline-block", background: "#FDE68A", color: "#78350F", fontSize: "9px", fontWeight: 900, letterSpacing: "0.06em", padding: "2px 8px", borderRadius: "999px", textTransform: "uppercase" }}>
        Just an example
      </span>
    </div>
  );
}

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
    narration: "Race Track is a board game your whole class races together on one shared track, from Start to Finish. It's split into 4 zones — early ones are short written tasks, later ones move to speaking.",
    visual: <TrackStrip carPos={0} />,
  },
  {
    narration: "Here's what you do: everyone sees the SAME question, matching whichever zone the leading team is in. Raise your hand fast — the first team to answer correctly wins the roll.",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ background: "#FEF2F2", border: "2px solid #EF4444", borderRadius: "10px", padding: "10px 16px", fontWeight: 700, color: "#7F1D1D", fontSize: "13px" }}>
          "She ___ (go) to school every day."
        </div>
        <ExampleTag />
      </div>
    ),
  },
  {
    narration: "Whoever won the roll rolls the dice and moves their team forward that many spaces on the track.",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "24px" }}>🎲</div>
        <div style={{ fontSize: "11px", fontWeight: 800, color: "#166534", marginTop: "2px" }}>Rolled a 4 — move forward 4 spaces!</div>
      </div>
    ),
  },
  {
    narration: "Landing on a special space does something extra: ⚡Boost and 🚀Shortcut send you forward, 🟫Mud and 💥Trap set you back, 🛡️Shield blocks the bad ones, and 🪙Coin/❓spaces earn coins to spend on powerups between turns.",
    visual: (
      <div style={{ display: "flex", justifyContent: "center", gap: "6px", flexWrap: "wrap", maxWidth: "220px", margin: "0 auto" }}>
        {[
          { icon: "⚡", label: "+3" }, { icon: "🚀", label: "+5" }, { icon: "🟫", label: "skip" },
          { icon: "💥", label: "-3" }, { icon: "🛡️", label: "block" }, { icon: "🪙", label: "coins" },
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
    narration: "Playing solo? There's no one to race against, so you get your own clock instead — pick easy, medium, or hard on the setup screen, then answer correctly before it runs out to roll.",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "22px" }}>⏱️</div>
        <div style={{ fontSize: "11px", fontWeight: 700, color: "#7F1D1D", marginTop: "4px" }}>Solo mode: beat your own clock</div>
      </div>
    ),
  },
  {
    narration: "The first team to reach Finish wins the race! Then every team scores points based on how far they got — 1st place scores the most, but everyone gets something.",
    visual: (
      <div style={{ display: "flex", flexDirection: "column", gap: "3px", maxWidth: "160px", margin: "0 auto", fontSize: "11px", fontWeight: 800, color: "#374151" }}>
        <div>🥇 1st — 300 pts</div>
        <div>🥈 2nd — 195 pts</div>
        <div>🥉 3rd — 120 pts</div>
      </div>
    ),
  },
];
