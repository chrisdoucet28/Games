// Tutorial mockup for SpyAmongUsGame.tsx — update if that game's rules/scoring change.
import type { TutorialStep } from "../../types";

const CARD_BASE: React.CSSProperties = {
  borderRadius: "12px",
  padding: "10px 14px",
  color: "white",
  fontWeight: 800,
  fontSize: "12px",
  textAlign: "center",
};

// A small, consistent "this part is made up" flag — sits on its own line below the example
// content (never inline beside it, which would throw off the content's own centering), since the
// #1 confusion this tutorial exists to prevent is a student locking onto these specific topics as
// if that's literally what they'll get, when it's really whatever subject the teacher picked.
function ExampleTag() {
  return (
    <div style={{ marginTop: "8px" }}>
      <span style={{ display: "inline-block", background: "#FDE68A", color: "#78350F", fontSize: "9px", fontWeight: 900, letterSpacing: "0.06em", padding: "2px 8px", borderRadius: "999px", textTransform: "uppercase" }}>
        Just an example
      </span>
    </div>
  );
}

// A real spyRounds pair from topics.ts (Food & Eating) — used throughout as ONE consistent,
// concrete example so students see the same two topics again and again instead of a new
// abstract example every step.
const CREW_TOPIC = "Food You Love";
const SPY_TOPIC = "Food You Hate or Can't Eat";

const TopicPairVisual = () => (
  <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
    <div style={{ ...CARD_BASE, background: "linear-gradient(135deg,#1D4ED8,#1E3A8A)", border: "2px solid #60A5FA" }}>
      👨‍🚀 Crewmates get:<br />"{CREW_TOPIC}"
    </div>
    <div style={{ ...CARD_BASE, background: "linear-gradient(135deg,#7F1D1D,#450A0A)", border: "2px solid #EF4444" }}>
      🕵️ The Spy gets:<br />"{SPY_TOPIC}"
    </div>
  </div>
);

export const SPY_TWOPLAYER_STEPS: TutorialStep[] = [
  {
    narration: "Spy Among Us is a secret-topic speaking game for two. You and your partner each secretly get a different (but related) topic — you don't know theirs, and they don't know yours.",
    visual: (
      <div style={{ textAlign: "center", fontSize: "26px" }}>🕵️ 🤔 👨‍🚀</div>
    ),
  },
  {
    narration: "Here's what you do: look at your own topic, then take turns speaking about it out loud — without making it too obvious. Avoid clear giveaways like 'I love this' or 'I hate this.'",
    visual: (
      <div style={{ textAlign: "center" }}>
        <TopicPairVisual />
        <ExampleTag />
      </div>
    ),
  },
  {
    narration: "Once you've both spoken, each of you tries to guess the other player's topic.",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "20px" }}>🤔</div>
        <div style={{ fontSize: "11px", fontWeight: 800, color: "#374151", marginTop: "4px" }}>Which topic did they have?</div>
      </div>
    ),
  },
  {
    narration: "Guess right and you score for it. Guess wrong and you get nothing — but it's entirely independent, so you can both win, or neither.",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "20px" }}>✅</div>
        <div style={{ fontSize: "11px", fontWeight: 800, color: "#166534", marginTop: "4px" }}>+100 pts for a correct guess</div>
      </div>
    ),
  },
];

export const SPY_GROUP_STEPS: TutorialStep[] = [
  {
    narration: "Spy Among Us is a social deduction speaking game. Every round, one team is secretly the Spy — their topic looks similar to everyone else's, but it's not quite the same.",
    visual: <div style={{ textAlign: "center", fontSize: "26px" }}>🕵️ 👥 👥 👥</div>,
  },
  {
    narration: "Here's what you do: privately look at your own topic, then — when it's your turn — talk about it out loud for the group to hear.",
    visual: (
      <div style={{ textAlign: "center" }}>
        <TopicPairVisual />
        <ExampleTag />
      </div>
    ),
  },
  {
    narration: "Before anyone speaks: you get 2 quiet minutes to plan what you'll say without giving your topic away. Then everyone rolls a dice to decide speaking order — highest goes first.",
    visual: (
      <div style={{ display: "flex", justifyContent: "center", gap: "20px" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "20px" }}>🤫⏱️</div>
          <div style={{ fontSize: "10px", fontWeight: 700, color: "#374151", marginTop: "4px" }}>2 min to prepare</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "20px" }}>🎲</div>
          <div style={{ fontSize: "10px", fontWeight: 700, color: "#374151", marginTop: "4px" }}>Highest roll speaks first</div>
        </div>
      </div>
    ),
  },
  {
    narration: "Crewmates just talk normally about their topic. But if YOU are the Spy: say something vague that could fit either topic instead — this is called 'blending in', since you don't actually know what the real one is.",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ background: "#FEF2F2", border: "2px solid #EF4444", borderRadius: "10px", padding: "8px 12px", display: "inline-block" }}>
          <div style={{ fontSize: "11px", fontWeight: 800, color: "#B91C1C" }}>🕵️ Spy (topic: Food You Hate)</div>
          <div style={{ fontSize: "11px", color: "#7F1D1D", marginTop: "2px" }}>"Pizza is something I have a lot of feelings about..."</div>
        </div>
        <ExampleTag />
      </div>
    ),
  },
  {
    narration: "After everyone's spoken, every team votes for who they think the Spy is.",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "24px" }}>🚨</div>
        <div style={{ fontWeight: 900, color: "#374151", fontSize: "13px", marginTop: "4px" }}>"I vote... Team Blue!"</div>
      </div>
    ),
  },
  {
    narration: "A correct vote for the Spy always earns points, whether or not the Spy ends up caught. If the group's votes land on the Spy, they get one guess at the real topic to try to still escape; otherwise the Spy walks away clean.",
    visual: (
      <div style={{ display: "flex", justifyContent: "center", gap: "14px" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "20px" }}>👨‍🚀</div>
          <div style={{ fontSize: "10px", fontWeight: 800, color: "#166534" }}>+60 — correct vote</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "20px" }}>🕵️</div>
          <div style={{ fontSize: "10px", fontWeight: 800, color: "#B91C1C" }}>caught → one guess</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "20px" }}>🛸</div>
          <div style={{ fontSize: "10px", fontWeight: 800, color: "#4B5563" }}>not caught → escapes</div>
        </div>
      </div>
    ),
  },
];
