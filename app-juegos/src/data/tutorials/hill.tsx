// Tutorial mockup for KingOfHillGame.tsx — update if that game's rules/scoring change.
import type { TutorialStep } from "../../types";

type ZoneDef = { id: string; icon: string; pts: number; label: string };

// Mirrors KingOfHillGame.tsx's real HILL_ZONES_GRAMMAR/HILL_ZONES_THEME and the plus-shaped
// 3-column grid layout it renders them in (empty, North, empty / West, Center, East / empty,
// South, empty) — kept in sync by hand, same as every other tutorial mockup.
const ZONES_GRAMMAR: ZoneDef[] = [
  { id: "North", icon: "🚩", pts: 3, label: "North" },
  { id: "South", icon: "🚩", pts: 3, label: "South" },
  { id: "East", icon: "🚩", pts: 2, label: "East" },
  { id: "West", icon: "🚩", pts: 2, label: "West" },
  { id: "Center", icon: "👑", pts: 5, label: "Center" },
];

const ZONES_THEME: ZoneDef[] = [
  { id: "North", icon: "❓", pts: 3, label: "Question" },
  { id: "South", icon: "💭", pts: 3, label: "Example" },
  { id: "East", icon: "🤝", pts: 2, label: "Agree/Disagree" },
  { id: "West", icon: "💡", pts: 2, label: "Alternative" },
  { id: "Center", icon: "👑", pts: 5, label: "Opinion" },
];

// owners: zone id -> { name, color } for zones that are claimed. highlight: zone id to ring/scale
// up, for "this is the one we're talking about" steps. attacker: shows a small badge on one zone
// for "another team is trying to take this" steps.
function ZoneMap({ zones, owners = {}, highlight, attacker, small }: { zones: ZoneDef[]; owners?: Record<string, { name: string; color: string }>; highlight?: string; attacker?: { zoneId: string; name: string; color: string }; small?: boolean }) {
  const cell = (zId: string | null) => {
    if (!zId) return <div />;
    const z = zones.find(zz => zz.id === zId)!;
    const owner = owners[zId];
    const isHi = highlight === zId;
    const isAttacked = attacker?.zoneId === zId;
    return (
      <div
        key={zId}
        style={{
          position: "relative",
          background: owner ? owner.color : "#FCE7F3",
          border: `2.5px solid ${isAttacked ? "#F59E0B" : isHi ? "#DB2777" : owner ? owner.color : "#F9A8D4"}`,
          borderRadius: "10px",
          padding: small ? "4px 2px" : "6px 4px",
          textAlign: "center",
          transform: isHi || isAttacked ? "scale(1.08)" : "scale(1)",
          boxShadow: isAttacked ? "0 0 0 3px #FDE68A" : isHi ? "0 0 0 3px #FBCFE8" : "none",
        }}
      >
        {isAttacked && (
          <div style={{ position: "absolute", top: "-10px", right: "-8px", background: attacker!.color, color: "white", borderRadius: "999px", padding: "1px 5px", fontSize: "8px", fontWeight: 900 }}>
            ⚔️ {attacker!.name}
          </div>
        )}
        <div style={{ fontSize: small ? "12px" : "15px" }}>{z.icon}</div>
        {!small && <div style={{ fontWeight: 900, fontSize: "9px", color: owner ? "white" : "#831843" }}>{z.label}</div>}
        <div style={{ fontWeight: 800, fontSize: "9px", color: owner ? "white" : "#DB2777" }}>+{z.pts}/rnd</div>
        {!small && <div style={{ fontSize: "8px", color: owner ? "white" : "#9D174D", marginTop: "1px" }}>{owner ? owner.name : "Free"}</div>}
      </div>
    );
  };
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "6px", maxWidth: small ? "150px" : "220px", margin: "0 auto" }}>
      {cell(null)}{cell("North")}{cell(null)}
      {cell("West")}{cell("Center")}{cell("East")}
      {cell(null)}{cell("South")}{cell(null)}
    </div>
  );
}

const CLAIM_STEP_GRAMMAR: TutorialStep = {
  narration: "Pick a FREE zone and you get a grammar question. Answer it correctly and the zone is yours now. Answer wrong and it just stays free — your turn ends.",
  visual: (
    <div style={{ textAlign: "center" }}>
      <ZoneMap zones={ZONES_GRAMMAR} owners={{ North: { name: "Red", color: "#DC2626" } }} highlight="North" />
      <div style={{ fontSize: "11px", color: "#166534", fontWeight: 800, marginTop: "6px" }}>✅ Correct! Team Red now owns North.</div>
    </div>
  ),
};

const CLAIM_STEP_THEME: TutorialStep = {
  narration: "Pick a FREE zone and you get a speaking prompt for that zone's move (like Question or Example). If your team's answer counts, the zone is yours now.",
  visual: (
    <div style={{ textAlign: "center" }}>
      <ZoneMap zones={ZONES_THEME} owners={{ North: { name: "Red", color: "#DC2626" } }} highlight="North" />
      <div style={{ fontSize: "11px", color: "#166534", fontWeight: 800, marginTop: "6px" }}>✅ Team Red now owns the Question zone.</div>
    </div>
  ),
};

const ATTACK_STEP_GRAMMAR: TutorialStep = {
  narration: "Pick a zone another team OWNS and that's an attack — both teams get the exact same question, and whoever answers correctly first wins the showdown. Win it as the attacker and you take the zone (plus a bonus); win it as the defender and you keep it (plus a smaller one).",
  visual: (
    <div style={{ textAlign: "center" }}>
      <ZoneMap zones={ZONES_GRAMMAR} owners={{ North: { name: "Red", color: "#DC2626" } }} attacker={{ zoneId: "North", name: "Blue", color: "#2563EB" }} />
      <div style={{ fontSize: "10px", color: "#831843", fontWeight: 700, marginTop: "4px" }}>Blue is attacking Red's North zone!</div>
    </div>
  ),
};

const ATTACK_STEP_THEME: TutorialStep = {
  narration: "Pick a zone another team OWNS and that's an attack — both teams speak on the same prompt, and the teacher decides whose answer was better. Win it as the attacker and you take the zone (plus a bonus); win it as the defender and you keep it (plus a smaller one).",
  visual: (
    <div style={{ textAlign: "center" }}>
      <ZoneMap zones={ZONES_THEME} owners={{ North: { name: "Red", color: "#DC2626" } }} attacker={{ zoneId: "North", name: "Blue", color: "#2563EB" }} />
      <div style={{ fontSize: "10px", color: "#831843", fontWeight: 700, marginTop: "4px" }}>Blue is attacking Red's Question zone!</div>
    </div>
  ),
};

const ROLL_DICE_STEP: TutorialStep = {
  narration: "One more thing before your first turn: everyone rolls a dice to decide the order, highest first, then it's turn by turn from there.",
  visual: (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: "26px" }}>🎲</div>
      <div style={{ fontSize: "12px", color: "#831843", fontWeight: 700, marginTop: "4px" }}>Team Red rolls 5 — Team Red goes first!</div>
    </div>
  ),
};

// Its own step rather than tacked onto ATTACK_STEP above — one idea per slide.
const SOLO_DUEL_STEP: TutorialStep = {
  narration: "Playing solo against the CPU or teacher? A duel works differently for you: instead of racing to answer first, you get your own clock — answer correctly before it runs out to win the zone.",
  visual: (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: "22px" }}>⏱️</div>
      <div style={{ fontSize: "11px", fontWeight: 700, color: "#831843", marginTop: "4px" }}>Solo duels: beat the clock, not the other team</div>
    </div>
  ),
};

function ScoringVisual({ zones }: { zones: ZoneDef[] }) {
  const owners = { North: { name: "Red", color: "#DC2626" }, Center: { name: "Red", color: "#DC2626" } };
  return (
    <div style={{ display: "flex", justifyContent: "center", gap: "18px", alignItems: "flex-end" }}>
      <div style={{ textAlign: "center" }}>
        <ZoneMap zones={zones} owners={owners} small />
        <div style={{ fontSize: "10px", fontWeight: 800, color: "#166534", marginTop: "4px" }}>Round 1 end: Red scores for both zones</div>
      </div>
      <div style={{ fontSize: "16px", alignSelf: "center" }}>→</div>
      <div style={{ textAlign: "center" }}>
        <ZoneMap zones={zones} owners={owners} small />
        <div style={{ fontSize: "10px", fontWeight: 800, color: "#166534", marginTop: "4px" }}>Round 2 end: Red scores again</div>
      </div>
    </div>
  );
}

const SCORING_STEP_GRAMMAR: TutorialStep = {
  narration: "The bigger picture: at the end of EVERY round, each team scores for every zone they still own — again and again, round after round. Holding onto the Center zone (👑) the whole game adds up fast.",
  visual: <ScoringVisual zones={ZONES_GRAMMAR} />,
};

const SCORING_STEP_THEME: TutorialStep = {
  narration: "The bigger picture: at the end of EVERY round, each team scores for every zone they still own — again and again, round after round. Holding onto the Opinion zone (👑) the whole game adds up fast.",
  visual: <ScoringVisual zones={ZONES_THEME} />,
};

const FINAL_STEP: TutorialStep = {
  narration: "The number of rounds depends on how many teams are playing. After the last round's scores are added up, the team with the most total points wins!",
  visual: (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: "22px" }}>🏆</div>
      <div style={{ fontWeight: 900, color: "#831843", fontSize: "13px", marginTop: "4px" }}>Final round — final scores!</div>
    </div>
  ),
};

export const HILL_THEME_STEPS: TutorialStep[] = [
  {
    narration: "King of the Hill is a territory game. Teams fight over zones on a shared board by answering questions — whoever controls the most when the game ends wins. In theme mode, each zone is a different move in a conversation: Question, Example, Agree/Disagree, Alternative, and Opinion (bigger classes add 4 more corner zones). Right now every zone is Free.",
    visual: <ZoneMap zones={ZONES_THEME} />,
  },
  {
    narration: "Here's what you actually do: on your turn, pick ONE zone on the board — a Free one to claim, or one another team already owns to attack.",
    visual: <ZoneMap zones={ZONES_THEME} highlight="North" />,
  },
  CLAIM_STEP_THEME,
  ATTACK_STEP_THEME,
  ROLL_DICE_STEP,
  SOLO_DUEL_STEP,
  SCORING_STEP_THEME,
  FINAL_STEP,
];

export const HILL_GRAMMAR_STEPS: TutorialStep[] = [
  {
    narration: "King of the Hill is a territory game. Teams fight over zones on a shared board by answering grammar questions — whoever controls the most when the game ends wins. Some zones (like the Center 👑) are worth more than others, and bigger classes add 4 more corner zones. Right now every zone is Free.",
    visual: <ZoneMap zones={ZONES_GRAMMAR} />,
  },
  {
    narration: "Here's what you actually do: on your turn, pick ONE zone on the board — a Free one to claim, or one another team already owns to attack.",
    visual: <ZoneMap zones={ZONES_GRAMMAR} highlight="North" />,
  },
  CLAIM_STEP_GRAMMAR,
  ATTACK_STEP_GRAMMAR,
  ROLL_DICE_STEP,
  SOLO_DUEL_STEP,
  SCORING_STEP_GRAMMAR,
  FINAL_STEP,
];
