// Tutorial mockup for SpyAmongUsGame.tsx — update if that game's rules/scoring change.
import type { TutorialStep } from "../../types";

const CARD_BASE: React.CSSProperties = {
  borderRadius: "12px",
  padding: "12px 16px",
  color: "white",
  fontWeight: 800,
  fontSize: "13px",
  textAlign: "center",
};

export const SPY_TWOPLAYER_STEPS: TutorialStep[] = [
  {
    narration: "Just the two of you — you'll each secretly get a different topic to talk about.",
    visual: (
      <div style={{ display: "flex", justifyContent: "center", gap: "14px" }}>
        <div style={{ ...CARD_BASE, background: "linear-gradient(135deg,#1D4ED8,#1E3A8A)", border: "2px solid #60A5FA" }}>
          👨‍🚀 You<br />"Your favorite holiday"
        </div>
        <div style={{ ...CARD_BASE, background: "linear-gradient(135deg,#7F1D1D,#450A0A)", border: "2px solid #EF4444" }}>
          🕵️ Them<br />"A trip you took"
        </div>
      </div>
    ),
  },
  {
    narration: "Take turns speaking about your own topic — without giving away exactly what it is. Listen closely to what the other person says!",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "22px" }}>🎙️</div>
        <div style={{ fontSize: "12px", color: "#374151", fontWeight: 700, marginTop: "4px" }}>"We went somewhere really hot last summer..."</div>
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
          <div style={{ fontSize: "11px", fontWeight: 800, color: "#374151" }}>What was their topic?</div>
        </div>
      </div>
    ),
  },
];

export const SPY_GROUP_STEPS: TutorialStep[] = [
  {
    narration: "Each round, one team is secretly the Spy and gets a slightly different topic than everyone else. Everyone peeks their own secret topic first.",
    visual: (
      <div style={{ display: "flex", justifyContent: "center", gap: "10px", flexWrap: "wrap" }}>
        <div style={{ ...CARD_BASE, background: "linear-gradient(135deg,#1D4ED8,#1E3A8A)", border: "2px solid #60A5FA", fontSize: "12px" }}>👨‍🚀 Red<br />Crewmate</div>
        <div style={{ ...CARD_BASE, background: "linear-gradient(135deg,#7F1D1D,#450A0A)", border: "2px solid #EF4444", fontSize: "12px" }}>🕵️ Blue<br />Spy</div>
        <div style={{ ...CARD_BASE, background: "linear-gradient(135deg,#1D4ED8,#1E3A8A)", border: "2px solid #60A5FA", fontSize: "12px" }}>👨‍🚀 Green<br />Crewmate</div>
      </div>
    ),
  },
  {
    narration: "Each team takes a turn speaking about their topic — try to sound like you belong. Spy tip: you don't have to stick rigidly to your own prompt — straying toward what you think the real topic is can help you blend in!",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "22px" }}>🎙️</div>
        <div style={{ fontSize: "12px", color: "#374151", fontWeight: 700, marginTop: "4px" }}>"I spent the weekend visiting my cousins..."</div>
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
