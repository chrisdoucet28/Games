// Tutorial mockup for KingOfHillGame.tsx — update if that game's rules/scoring change.
import type { TutorialStep } from "../../types";

type ZoneDef = { id: string; icon: string; pts: number; label: string };

// Mirrors KingOfHillGame.tsx's real HILL_ZONES_GRAMMAR/HILL_ZONES_TOPIC and the plus-shaped
// 3-column grid layout it renders them in (empty, North, empty / West, Center, East / empty,
// South, empty) — kept in sync by hand, same as every other tutorial mockup.
const ZONES_GRAMMAR: ZoneDef[] = [
  { id: "North", icon: "🚩", pts: 3, label: "North" },
  { id: "South", icon: "🚩", pts: 3, label: "South" },
  { id: "East", icon: "🚩", pts: 2, label: "East" },
  { id: "West", icon: "🚩", pts: 2, label: "West" },
  { id: "Center", icon: "👑", pts: 5, label: "Center" },
];

const ZONES_TOPIC: ZoneDef[] = [
  { id: "North", icon: "❓", pts: 3, label: "Question" },
  { id: "South", icon: "💭", pts: 3, label: "Example" },
  { id: "East", icon: "🤝", pts: 2, label: "Agree/Disagree" },
  { id: "West", icon: "💡", pts: 2, label: "Alternative" },
  { id: "Center", icon: "👑", pts: 5, label: "Opinion" },
];

// owners: zone id -> { name, color } for zones that are claimed. highlight: zone id to ring/scale
// up, for "this is the one we're talking about" steps.
function ZoneMap({ zones, owners = {}, highlight }: { zones: ZoneDef[]; owners?: Record<string, { name: string; color: string }>; highlight?: string }) {
  const cell = (zId: string | null) => {
    if (!zId) return <div />;
    const z = zones.find(zz => zz.id === zId)!;
    const owner = owners[zId];
    const isHi = highlight === zId;
    return (
      <div
        key={zId}
        style={{
          background: owner ? owner.color : "#FCE7F3",
          border: `2.5px solid ${isHi ? "#DB2777" : owner ? owner.color : "#F9A8D4"}`,
          borderRadius: "10px",
          padding: "6px 4px",
          textAlign: "center",
          transform: isHi ? "scale(1.08)" : "scale(1)",
          boxShadow: isHi ? "0 0 0 3px #FBCFE8" : "none",
        }}
      >
        <div style={{ fontSize: "15px" }}>{z.icon}</div>
        <div style={{ fontWeight: 900, fontSize: "9px", color: owner ? "white" : "#831843" }}>{z.label}</div>
        <div style={{ fontWeight: 800, fontSize: "9px", color: owner ? "white" : "#DB2777" }}>+{z.pts}/rnd</div>
        <div style={{ fontSize: "8px", color: owner ? "white" : "#9D174D", marginTop: "1px" }}>{owner ? owner.name : "Free"}</div>
      </div>
    );
  };
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "6px", maxWidth: "220px", margin: "0 auto" }}>
      {cell(null)}{cell("North")}{cell(null)}
      {cell("West")}{cell("Center")}{cell("East")}
      {cell(null)}{cell("South")}{cell(null)}
    </div>
  );
}

const ROLL_DICE_STEP: TutorialStep = {
  narration: "First, every team rolls one dice. The team with the highest number goes first. Then teams take turns, one at a time, in that order.",
  visual: (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: "26px" }}>🎲</div>
      <div style={{ fontSize: "12px", color: "#831843", fontWeight: 700, marginTop: "4px" }}>Team Red rolls 5 — Team Red goes first!</div>
    </div>
  ),
};

const CLAIM_STEP_GRAMMAR: TutorialStep = {
  narration: "If you pick a FREE zone: you get a grammar question. Answer it correctly, and the zone is yours now! Answer wrong, and the zone stays free — your turn ends.",
  visual: (
    <div style={{ textAlign: "center" }}>
      <ZoneMap zones={ZONES_GRAMMAR} owners={{ North: { name: "Red", color: "#DC2626" } }} highlight="North" />
      <div style={{ fontSize: "11px", color: "#166534", fontWeight: 800, marginTop: "6px" }}>✅ Correct! Team Red now owns North.</div>
    </div>
  ),
};

const CLAIM_STEP_TOPIC: TutorialStep = {
  narration: "If you pick a FREE zone: you get a speaking prompt for that zone's move (like Question or Example). Give your answer. If your team's answer counts, the zone is yours now!",
  visual: (
    <div style={{ textAlign: "center" }}>
      <ZoneMap zones={ZONES_TOPIC} owners={{ North: { name: "Red", color: "#DC2626" } }} highlight="North" />
      <div style={{ fontSize: "11px", color: "#166534", fontWeight: 800, marginTop: "6px" }}>✅ Team Red now owns the Question zone.</div>
    </div>
  ),
};

const ATTACK_STEP_GRAMMAR: TutorialStep = {
  narration: "If you pick a zone another team OWNS: this is an attack! Both teams get the exact same question. Whoever answers correctly first wins it. Attacker wins = takes the zone + 30 bonus points. Defender wins = keeps the zone + 20 bonus points.",
  visual: (
    <div style={{ textAlign: "center" }}>
      <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginBottom: "6px" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "20px" }}>⚔️</div>
          <div style={{ fontSize: "10px", fontWeight: 800, color: "#DC2626" }}>Blue attacks</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "20px" }}>🛡️</div>
          <div style={{ fontSize: "10px", fontWeight: 800, color: "#B91C1C" }}>Red defends</div>
        </div>
      </div>
      <div style={{ fontSize: "11px", color: "#831843", fontWeight: 700 }}>Same question for both — first correct answer wins!</div>
    </div>
  ),
};

const ATTACK_STEP_TOPIC: TutorialStep = {
  narration: "If you pick a zone another team OWNS: this is an attack! Both teams speak on the same prompt. The teacher decides which answer was better. The winner takes the zone (attacker: +30 pts) or keeps it (defender: +20 pts).",
  visual: (
    <div style={{ textAlign: "center" }}>
      <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginBottom: "6px" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "20px" }}>⚔️</div>
          <div style={{ fontSize: "10px", fontWeight: 800, color: "#DC2626" }}>Blue attacks</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "20px" }}>🛡️</div>
          <div style={{ fontSize: "10px", fontWeight: 800, color: "#B91C1C" }}>Red defends</div>
        </div>
      </div>
      <div style={{ fontSize: "11px", color: "#831843", fontWeight: 700 }}>Teacher picks the stronger answer.</div>
    </div>
  ),
};

const SCORING_STEP: TutorialStep = {
  narration: "Every zone shows its own points, like +5/rnd. At the end of EVERY round, each team gets points for every zone they still own — again and again, round after round. Owning the Center zone (👑) the whole game is worth a lot!",
  visual: (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: "12px", color: "#831843", fontWeight: 800 }}>Round 1 end: Red owns Center (+5) and North (+3) = +8 pts</div>
      <div style={{ fontSize: "12px", color: "#831843", fontWeight: 800, marginTop: "4px" }}>Round 2 end: Red still owns them = +8 MORE pts</div>
    </div>
  ),
};

const FINAL_STEP: TutorialStep = {
  narration: "The game lasts 4 rounds. After round 4's points are added up, the team with the most total points wins!",
  visual: (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: "22px" }}>🏆</div>
      <div style={{ fontWeight: 900, color: "#831843", fontSize: "13px", marginTop: "4px" }}>Round 4 of 4 — final scores!</div>
    </div>
  ),
};

export const HILL_TOPIC_STEPS: TutorialStep[] = [
  {
    narration: "This is the board. It has 5 zones. In topic mode, each zone is a different move in a conversation: Question, Example, Agree/Disagree, Alternative, and Opinion. Right now, every zone is Free — no team owns any of them yet.",
    visual: <ZoneMap zones={ZONES_TOPIC} />,
  },
  ROLL_DICE_STEP,
  {
    narration: "On your turn, pick ONE zone on the board. You can pick a Free zone, or you can attack a zone another team already owns.",
    visual: <ZoneMap zones={ZONES_TOPIC} highlight="North" />,
  },
  CLAIM_STEP_TOPIC,
  ATTACK_STEP_TOPIC,
  SCORING_STEP,
  FINAL_STEP,
];

export const HILL_GRAMMAR_STEPS: TutorialStep[] = [
  {
    narration: "This is the board. It has 5 zones, each worth different points — North and South are worth 3, East and West are worth 2, and the Center (👑) is worth 5. Right now, every zone is Free — no team owns any of them yet.",
    visual: <ZoneMap zones={ZONES_GRAMMAR} />,
  },
  ROLL_DICE_STEP,
  {
    narration: "On your turn, pick ONE zone on the board. You can pick a Free zone, or you can attack a zone another team already owns.",
    visual: <ZoneMap zones={ZONES_GRAMMAR} highlight="North" />,
  },
  CLAIM_STEP_GRAMMAR,
  ATTACK_STEP_GRAMMAR,
  SCORING_STEP,
  FINAL_STEP,
];
