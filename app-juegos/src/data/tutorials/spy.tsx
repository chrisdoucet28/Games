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
    narration: "Just the two of you — you'll each secretly get a different topic to talk about. Look at this example: one topic is 'Food You Love', the other is 'Food You Hate'. The topics are always close like this, about the same subject.",
    visual: <TopicPairVisual />,
  },
  {
    narration: "Take turns speaking about your own topic. Try not to make it too obvious which topic you have — for example, don't say 'I love this food' or 'I hate this food'. Just talk about the food in a general way.",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "20px" }}>🎙️</div>
        <div style={{ fontSize: "11px", color: "#374151", fontWeight: 700, marginTop: "4px" }}>"This food is something I think about a lot..."</div>
      </div>
    ),
  },
  {
    narration: "Once you've both spoken, each try to guess the other player's topic. Guess right and you score +100 pts — you can both win, or neither!",
    visual: (
      <div style={{ display: "flex", justifyContent: "center", gap: "16px" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "20px" }}>✅</div>
          <div style={{ fontSize: "11px", fontWeight: 800, color: "#166534" }}>+100 pts</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "20px" }}>🤔</div>
          <div style={{ fontSize: "11px", fontWeight: 800, color: "#374151" }}>Which topic did they have?</div>
        </div>
      </div>
    ),
  },
];

export const SPY_GROUP_STEPS: TutorialStep[] = [
  {
    narration: "Each round, one team is secretly the Spy. Every team's topic looks similar, but the Spy's topic is a little different. Look at this example: Crewmates get 'Food You Love'. The Spy secretly gets 'Food You Hate or Can't Eat'.",
    visual: <TopicPairVisual />,
  },
  {
    narration: "First, everyone privately looks at their own topic. After that, you get 2 quiet minutes to think about what you will say. Do NOT say your topic out loud yet — just plan it in your head.",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "20px" }}>🤫⏱️</div>
        <div style={{ fontSize: "11px", fontWeight: 700, color: "#374151", marginTop: "4px" }}>2 minutes to prepare, quietly</div>
      </div>
    ),
  },
  {
    narration: "Next, everyone rolls a dice to decide the speaking order. The highest roll speaks first.",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "22px" }}>🎲</div>
        <div style={{ fontSize: "11px", fontWeight: 700, color: "#374151", marginTop: "4px" }}>Team Red rolls 6 — speaks first!</div>
      </div>
    ),
  },
  {
    narration: "Now, one team at a time, everyone talks about their topic. Crewmates just talk normally about their topic.",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "20px" }}>🎙️</div>
        <div style={{ fontSize: "11px", fontWeight: 700, color: "#374151", marginTop: "4px" }}>"I love pizza — it's my favorite food!"</div>
      </div>
    ),
  },
  {
    narration: "If YOU are the Spy: do not say clear words like 'I love it' or 'I hate it'. Say something that could be true for EITHER topic instead. This is called 'blending in'.",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ background: "#FEF2F2", border: "2px solid #EF4444", borderRadius: "10px", padding: "8px 12px", display: "inline-block" }}>
          <div style={{ fontSize: "11px", fontWeight: 800, color: "#B91C1C" }}>🕵️ Spy (topic: Food You Hate)</div>
          <div style={{ fontSize: "11px", color: "#7F1D1D", marginTop: "2px" }}>"Pizza is something I have a lot of feelings about..."</div>
        </div>
        <div style={{ fontSize: "10px", fontWeight: 700, color: "#9D174D", marginTop: "6px" }}>Vague on purpose — could mean love OR hate!</div>
      </div>
    ),
  },
  {
    narration: "After everyone speaks, every team votes for who they think the Spy is.",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "24px" }}>🚨</div>
        <div style={{ fontWeight: 900, color: "#374151", fontSize: "13px", marginTop: "4px" }}>"I vote... Team Blue!"</div>
      </div>
    ),
  },
  {
    narration: "Caught the Spy? They get one guess at the real topic — right and they still escape with +60 pts, wrong and every crewmate gets +80 pts. Votes split with no clear leader? The Spy escapes clean with +100 pts.",
    visual: (
      <div style={{ display: "flex", justifyContent: "center", gap: "14px" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "20px" }}>🕵️</div>
          <div style={{ fontSize: "11px", fontWeight: 800, color: "#B91C1C" }}>caught → guesses</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "20px" }}>🛸</div>
          <div style={{ fontSize: "11px", fontWeight: 800, color: "#166534" }}>not caught → +100</div>
        </div>
      </div>
    ),
  },
  {
    narration: "Voted correctly for the real Spy? You score +60 pts, whether or not the group ends up catching them.",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "20px" }}>👨‍🚀 +60 pts</div>
        <div style={{ fontSize: "11px", color: "#374151", fontWeight: 700, marginTop: "4px" }}>for every correct vote</div>
      </div>
    ),
  },
];
