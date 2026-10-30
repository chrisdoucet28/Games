// Tutorial mockup for VaultHeistGame.tsx — update if that game's rules/scoring change.
import type { TutorialStep } from "../../types";

// A small, consistent "this part is made up" flag — every example sentence/tag in this tutorial
// sits right under one of these, since the #1 confusion this tutorial exists to prevent is a
// student locking onto "PAST SIMPLE — NEGATIVE" as if that's literally what they'll be asked, when
// it's really whatever tense and topic the teacher actually picked for today's class.
function ExampleTag() {
  return (
    <div style={{ display: "inline-block", background: "#FDE68A", color: "#78350F", fontSize: "9px", fontWeight: 900, letterSpacing: "0.06em", padding: "2px 8px", borderRadius: "999px", marginBottom: "6px", textTransform: "uppercase" }}>
      Just an example
    </div>
  );
}

export const VAULT_TUTORIAL_STEPS: TutorialStep[] = [
  {
    narration: "Vault Heist is a sentence-building game. Each team has their own vault, locked with 5 locks at the start — you crack it open by building correct sentences, one per lock.",
    visual: (
      <div style={{ display: "flex", justifyContent: "center", gap: "6px" }}>
        {["🔒", "🔒", "🔒", "🔒", "🔒"].map((l, i) => (
          <div key={i} style={{ fontSize: "22px" }}>{l}</div>
        ))}
      </div>
    ),
  },
  {
    narration: "Here's what you actually do: before every lock, a card tells you exactly what to build — a tense, and whether it should be positive, negative, or a question. This changes every time, based on whatever your teacher picked for today's class.",
    visual: (
      <div style={{ textAlign: "center" }}>
        <ExampleTag />
        <div style={{ background: "linear-gradient(135deg,#7A5C1E,#D4AF37)", color: "#1F1608", borderRadius: "10px", padding: "8px 16px", display: "inline-block", fontWeight: 900, fontSize: "13px", letterSpacing: "0.04em" }}>
          PAST SIMPLE — NEGATIVE
        </div>
        <div style={{ fontSize: "10px", color: "#9CA3AF", fontWeight: 700, marginTop: "6px" }}>Your real card could say anything — this is just one possible example.</div>
      </div>
    ),
  },
  {
    narration: "You'll also get a few word pieces to build from. Rearrange them into one full sentence matching the card, and say it out loud — your teacher decides if it's right.",
    visual: (
      <div style={{ textAlign: "center" }}>
        <ExampleTag />
        <div style={{ fontSize: "12px", color: "#7A5C1E", fontWeight: 700 }}>'he / work / on Saturday'</div>
        <div style={{ fontSize: "13px", color: "#3B0764", fontWeight: 800, marginTop: "4px" }}>→ "He didn't work on Saturday."</div>
      </div>
    ),
  },
  {
    narration: "Right? The lock cracks open and your team keeps going, straight into the next lock. Wrong? There's no partial credit — your most recently cracked lock re-locks, and the turn passes to the next team.",
    visual: (
      <div style={{ display: "flex", justifyContent: "center", gap: "18px", alignItems: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ display: "flex", gap: "4px" }}>
            {["🔓", "🔓", "🔒", "🔒", "🔒"].map((l, i) => <div key={i} style={{ fontSize: "20px" }}>{l}</div>)}
          </div>
          <div style={{ fontSize: "10px", fontWeight: 800, color: "#166534", marginTop: "4px" }}>Right → next lock</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ display: "flex", gap: "4px" }}>
            {["🔓", "🔒", "🔒", "🔒", "🔒"].map((l, i) => <div key={i} style={{ fontSize: "20px" }}>{l}</div>)}
          </div>
          <div style={{ fontSize: "10px", fontWeight: 800, color: "#991B1B", marginTop: "4px" }}>Wrong → re-locks</div>
        </div>
      </div>
    ),
  },
  {
    narration: "Dice decide which team cracks first, then it's turn by turn from there. Crack all 5 locks to finish your vault — it stays open until every team finishes.",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "24px" }}>🎲</div>
        <div style={{ fontSize: "12px", color: "#7A5C1E", fontWeight: 700, marginTop: "4px" }}>Team Red rolls 5 — Team Red goes first!</div>
      </div>
    ),
  },
  {
    narration: "Finishing earns a bonus on top of your points so far — the earlier your team finishes, the bigger it is.",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "26px" }}>🥇</div>
        <div style={{ fontWeight: 900, color: "#7A5C1E", fontSize: "14px", marginTop: "4px" }}>Team Red finished 1st — bonus points!</div>
      </div>
    ),
  },
];
