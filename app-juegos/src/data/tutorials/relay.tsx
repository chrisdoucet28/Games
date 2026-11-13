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
    narration: "Here's what you do: teams take turns, one question at a time. The person at the front asks a yes/no question (or takes a guess). The teacher — or, on phones, their teammates — knows the word and answers, then it's the next team's turn.",
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
    narration: "Guessed it? The word is REVEALED and that person sits down — a teammate swaps in with a brand new word. Run out of questions without guessing and the next teammate swaps in anyway, so nobody gets stuck.",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ background: "#F0FDF4", border: "2px solid #22C55E", borderRadius: "10px", padding: "10px 14px", fontWeight: 700, color: "#14532D", fontSize: "13px" }}>
          Team Red guessed "jacket"! ✅ Time to swap!
        </div>
      </div>
    ),
  },
  {
    narration: "Everyone gets 5 questions of their own, and the sooner you guess, the more it's worth — guessing right away is worth the most, and it drops a little with every question you use up.",
    visual: (
      <div style={{ textAlign: "center", fontSize: "13px", fontWeight: 700, color: "#374151", lineHeight: 1.7 }}>
        <div>Guess on question 1 → <strong style={{ color: "#15803D" }}>+300</strong></div>
        <div>Guess on question 2 → <strong style={{ color: "#15803D" }}>+230</strong></div>
        <div>Guess on question 3 → <strong style={{ color: "#15803D" }}>+160</strong></div>
        <div>Guess on question 4 → <strong style={{ color: "#15803D" }}>+80</strong></div>
        <div>Guess on question 5 → <strong style={{ color: "#15803D" }}>+10</strong></div>
      </div>
    ),
  },
  {
    narration: "Once EVERY person on a team has had a turn, that's one round done — the team loops back to the first person again with a brand new word, for as many rounds as the teacher picked. Only once the LAST round ends does the team sit down for good.",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "26px" }}>🔁</div>
        <div style={{ fontSize: "12px", fontWeight: 700, color: "#374151" }}>Round 1 complete! Team Red goes again — round 2 of 3.</div>
      </div>
    ),
  },
  {
    narration: "On phones, everyone joins on their own phone — however many phones are on a team is automatically that team's number of people, so uneven teams are fine. Teammates' phones show the word and hold the buttons; the asker's phone never shows it, and turns rotate through everyone automatically.",
    visual: (
      <div style={{ textAlign: "center", fontSize: "13px", fontWeight: 700, color: "#94A3B8" }}>
        📱 asker: "You're up!" · 📱 teammate: the word + buttons
      </div>
    ),
  },
  {
    narration: "On phones you can also pick ALL AT ONCE: every team huddles up and plays its own word at the same time, no waiting for other teams. The screen becomes a live race board. Every team needs at least 2 phones for this (one asks, the others answer) — a team with only one phone should use Take turns instead.",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
          {FRONT_LINE.map(p => (
            <div key={p.team} style={{ border: `2px dashed ${p.color}`, borderRadius: "12px", padding: "6px 8px" }}>
              <div style={{ fontSize: "20px", lineHeight: 1 }}>🙋📱📱</div>
              <div style={{ background: p.color, color: "white", borderRadius: "8px", padding: "2px 8px", fontSize: "11px", fontWeight: 800, marginTop: "4px" }}>{p.team}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: "8px", fontSize: "11px", fontWeight: 700, color: "#6B7280" }}>⚡ All at once: every team asks in its own huddle</div>
      </div>
    ),
  },
  {
    narration: "Playing solo? A CPU teammate joins and takes its own turns too, thinking for a moment before taking its own guess — so it's not just you alone.",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "22px" }}>🤖</div>
        <div style={{ fontSize: "11px", fontWeight: 700, color: "#374151" }}>Solo mode: a CPU teammate joins you</div>
      </div>
    ),
  },
  {
    narration: "The teacher picks how many rounds to play on the welcome screen — once every team has finished its last round, the game ends and the team with the most points wins!",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "20px" }}>🏁</div>
        <div style={{ fontSize: "11px", fontWeight: 700, color: "#374151" }}>Most points once every round is done wins</div>
      </div>
    ),
  },
];
