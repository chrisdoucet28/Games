// Tutorial mockup for KingOfHillGame.tsx — update if that game's rules/scoring change.
import type { TutorialStep } from "../../types";

const ZONE_MAP = (
  <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "6px", maxWidth: "180px", margin: "0 auto" }}>
    <div />
    <div style={{ background: "#FCE7F3", border: "2px solid #EC4899", borderRadius: "8px", padding: "8px", fontSize: "16px" }}>🚩</div>
    <div />
    <div style={{ background: "#FCE7F3", border: "2px solid #EC4899", borderRadius: "8px", padding: "8px", fontSize: "16px" }}>🚩</div>
    <div style={{ background: "#FBCFE8", border: "2px solid #DB2777", borderRadius: "8px", padding: "8px", fontSize: "18px" }}>👑</div>
    <div style={{ background: "#FCE7F3", border: "2px solid #EC4899", borderRadius: "8px", padding: "8px", fontSize: "16px" }}>🚩</div>
    <div />
    <div style={{ background: "#FCE7F3", border: "2px solid #EC4899", borderRadius: "8px", padding: "8px", fontSize: "16px" }}>🚩</div>
    <div />
  </div>
);

const ROLL_DICE_STEP: TutorialStep = {
  narration: "Roll the dice to set turn order, then take turns answering to claim zones.",
  visual: (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: "26px" }}>🎲</div>
      <div style={{ fontSize: "12px", color: "#831843", fontWeight: 700, marginTop: "4px" }}>Team Red rolls 5 — goes first!</div>
    </div>
  ),
};

export const HILL_TOPIC_STEPS: TutorialStep[] = [
  {
    narration: "A map of 5 zones is up for grabs. In topic mode, each zone is a different move in the conversation: Opinion, Question, Example, Agree/Disagree, Alternative.",
    visual: ZONE_MAP,
  },
  ROLL_DICE_STEP,
  {
    narration: "Attack a zone someone already owns? Both teams respond to the same prompt, and the teacher picks the stronger answer — defend well!",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "22px" }}>⚔️🛡️</div>
        <div style={{ fontWeight: 900, color: "#831843", fontSize: "13px", marginTop: "4px" }}>Teacher judges: whose answer was better?</div>
      </div>
    ),
  },
  {
    narration: "Score points for every zone you own at the end of each round. The Opinion zone scores the most — expect fierce competition for it!",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "20px" }}>👑 +5 pts/round</div>
      </div>
    ),
  },
];

export const HILL_GRAMMAR_STEPS: TutorialStep[] = [
  {
    narration: "A map of 5 zones is up for grabs, each worth different points. Every zone is a quick grammar challenge — finish the sentence or fix the mistake.",
    visual: ZONE_MAP,
  },
  ROLL_DICE_STEP,
  {
    narration: "Attack a zone someone already owns? Both teams see the exact same blank, and the fastest correct answer wins — be quick!",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "22px" }}>⚔️🛡️</div>
        <div style={{ fontWeight: 900, color: "#831843", fontSize: "13px", marginTop: "4px" }}>Fastest correct answer wins the zone!</div>
      </div>
    ),
  },
  {
    narration: "Score points for every zone you own at the end of each round. The Center zone scores the most — expect fierce competition for it!",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "20px" }}>👑 +5 pts/round</div>
      </div>
    ),
  },
];
