// Tutorial mockup for RelayGame.tsx — update if that game's rules/scoring change.
import type { TutorialStep } from "../../types";

// One asker per team, all standing at the front at once — each wondering what their own team's word is.
const FRONT_LINE = [
  { team: "Red", color: "#EF4444" },
  { team: "Blue", color: "#3B82F6" },
  { team: "Green", color: "#22C55E" },
];

export const RELAY_TUTORIAL_STEPS: TutorialStep[] = [
  {
    narration: "Every team has its own hidden word. One person from EACH team comes to the front at the same time — so there's always one person from every team standing up there, all facing away from the word, all wondering what theirs is.",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ display: "flex", gap: "14px", justifyContent: "center", alignItems: "flex-end" }}>
          {FRONT_LINE.map(p => (
            <div key={p.team} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
              <div style={{ background: "#022C22", border: "2px solid #14B8A6", borderRadius: "10px", padding: "3px 10px", fontSize: "15px", fontWeight: 900, color: "#5EEAD4" }}>???</div>
              <div style={{ fontSize: "30px", lineHeight: 1 }}>🙋</div>
              <div style={{ background: p.color, color: "white", borderRadius: "8px", padding: "2px 10px", fontSize: "11px", fontWeight: 800 }}>{p.team}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: "8px", fontSize: "11px", fontWeight: 700, color: "#6B7280" }}>One from each team, side by side at the front</div>
      </div>
    ),
  },
  {
    narration: "Teams take turns — one question at a time. The person at the front asks a yes/no question (or takes a guess). The teacher (or, on phones, their teammates) knows the word and answers. Then the teacher taps \"Question asked\" and it's the next team's turn.",
    visual: (
      <div style={{ textAlign: "center", fontSize: "13px", fontWeight: 700, color: "#5EEAD4" }}>
        🙋 Red: "Is it something you wear?" · 🧑‍🏫 "Yes!"
        <div style={{ marginTop: "8px" }}>
          <span style={{ display: "inline-block", background: "rgba(0,0,0,0.3)", border: "2px solid #14B8A6", borderRadius: "10px", padding: "6px 12px", fontSize: "12px", fontWeight: 800, color: "#0F766E" }}>Question asked → next team</span>
        </div>
      </div>
    ),
  },
  {
    narration: "Each team has 15 questions in total, shared out between its people — 5 each for a team of 3. The sooner you guess, the more you score: a word is worth 10 points plus up to 10 bonus points. Guess on your first question and it's 20 points; use every question and it's 10.",
    visual: (
      <div style={{ textAlign: "center", fontSize: "13px", fontWeight: 700, color: "#374151", lineHeight: 1.7 }}>
        <div>Guess on question 1 → <strong style={{ color: "#15803D" }}>+20</strong></div>
        <div>Guess on question 3 → <strong style={{ color: "#15803D" }}>+15</strong></div>
        <div>Guess on question 5 → <strong style={{ color: "#15803D" }}>+10</strong></div>
        <div style={{ fontSize: "11px", color: "#6B7280" }}>(a team of 3 — 5 questions each)</div>
      </div>
    ),
  },
  {
    narration: "Guessed it? The word is REVEALED and the person sits down — a teammate swaps in with a brand new word. Run out of your questions without guessing and the next teammate swaps in anyway, so nobody gets stuck.",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ background: "#F0FDF4", border: "2px solid #22C55E", borderRadius: "10px", padding: "10px 14px", fontWeight: 700, color: "#14532D", fontSize: "13px" }}>
          Team Red guessed "jacket"! ✅ +18 — time to swap!
        </div>
      </div>
    ),
  },
  {
    narration: "When the LAST person on a team finishes, the whole team is done — everyone on that team sits down and waits while the other teams finish their turns.",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "26px" }}>🪑🪑🪑</div>
        <div style={{ fontSize: "12px", fontWeight: 700, color: "#374151" }}>Team Red is finished — sit down and wait!</div>
      </div>
    ),
  },
  {
    narration: "On phones, everyone joins on their own phone. Teammates' phones show the word and hold the buttons; the asker's phone never shows it, and the turns rotate through everyone automatically.",
    visual: (
      <div style={{ textAlign: "center", fontSize: "13px", fontWeight: 700, color: "#94A3B8" }}>
        📱 asker: "You're up!" · 📱 teammate: the word + buttons
      </div>
    ),
  },
  {
    narration: "The teacher picks how many people are on each team before the game starts — every one of them gets a turn at the front. The team with the most points once everyone has had their turn wins!",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "20px" }}>🏁</div>
        <div style={{ fontSize: "11px", fontWeight: 700, color: "#374151" }}>15 questions per team — most points wins</div>
      </div>
    ),
  },
];
