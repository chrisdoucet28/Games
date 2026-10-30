// Tutorial mockup for MinefieldGame.tsx — update if that game's rules/scoring change.
import type { TutorialStep } from "../../types";

// Mirrors MinefieldGame.tsx's real 5x5 grid: column headers are subjects, row headers are verb
// prompts, and picking a tile combines that column + row into one sentence to complete and speak.
// These exact words ("I/She/They/We/He", "go/eat/see/buy/write") are a STAND-IN — every ExampleTag
// next to this grid exists specifically so a student never mistakes this for what they'll actually
// get (that depends entirely on whatever topic(s) the teacher picked for today's class).
const COLS = ["I", "She", "They", "We", "He"];
const ROWS = ["go", "eat", "see", "buy", "write"];

// A small, consistent "this part is made up" flag — sits on its own line below the example
// content (never inline beside it, which would throw off the content's own centering), since the
// #1 confusion this tutorial exists to prevent is a student locking onto the specific demo content
// as if it's literally what they'll be asked.
function ExampleTag() {
  return (
    <div style={{ marginTop: "8px" }}>
      <span style={{ display: "inline-block", background: "#FDE68A", color: "#78350F", fontSize: "9px", fontWeight: 900, letterSpacing: "0.06em", padding: "2px 8px", borderRadius: "999px", textTransform: "uppercase" }}>
        Just an example
      </span>
    </div>
  );
}

const MineGrid = ({ pick, boom, safe }: { pick?: [number, number]; boom?: [number, number]; safe?: [number, number] }) => (
  <div style={{ display: "inline-block" }}>
    <div style={{ display: "grid", gridTemplateColumns: "34px repeat(5, 24px)", gap: "3px", marginBottom: "3px" }}>
      <div />
      {COLS.map(c => <div key={c} style={{ fontSize: "8px", fontWeight: 800, color: "#4C1D95", textAlign: "center" }}>{c}</div>)}
    </div>
    {ROWS.map((r, ri) => (
      <div key={r} style={{ display: "grid", gridTemplateColumns: "34px repeat(5, 24px)", gap: "3px", marginBottom: "3px" }}>
        <div style={{ fontSize: "8px", fontWeight: 800, color: "#4C1D95", display: "flex", alignItems: "center" }}>{r}</div>
        {COLS.map((_, ci) => {
          const isPick = pick && pick[0] === ci && pick[1] === ri;
          const isBoom = boom && boom[0] === ci && boom[1] === ri;
          const isSafe = safe && safe[0] === ci && safe[1] === ri;
          const bg = isBoom ? "linear-gradient(135deg,#EF4444,#B91C1C)" : isSafe ? "linear-gradient(135deg,#22C55E,#15803D)" : isPick ? "linear-gradient(135deg,#FCD34D,#F59E0B)" : "linear-gradient(135deg,#6366F1,#4338CA)";
          return (
            <div key={ci} style={{ width: "24px", height: "24px", borderRadius: "5px", background: bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px" }}>
              {isBoom ? "💥" : isSafe ? "✅" : isPick ? "❓" : ""}
            </div>
          );
        })}
      </div>
    ))}
  </div>
);

export const MINEFIELD_TUTORIAL_STEPS: TutorialStep[] = [
  {
    narration: "Minefield is a speaking game your whole class plays together on one shared grid. Most tiles are safe — a handful are hidden mines nobody can see yet.",
    visual: (
      <div style={{ textAlign: "center" }}>
        <MineGrid />
        <div style={{ fontSize: "11px", color: "#6B7280", fontWeight: 700, marginTop: "6px" }}>25 tiles. A few are mines. Nobody knows which yet.</div>
      </div>
    ),
  },
  {
    narration: "Here's what you actually do: on your turn, pick ONE hidden tile. Every tile mixes its column header with its row header into the start of a sentence — you finish it out loud.",
    visual: (
      <div style={{ textAlign: "center" }}>
        <MineGrid pick={[1, 0]} />
        <div style={{ fontSize: "11px", color: "#4C1D95", fontWeight: 800, marginTop: "4px" }}>She + go = "She ___ (go) to..."</div>
        <ExampleTag />
      </div>
    ),
  },
  {
    narration: "Say the complete sentence out loud. Your teacher listens and decides whether it's right — there's no typing, no app judging it for you.",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ background: "#F5F3FF", border: "2px solid #7C3AED", borderRadius: "10px", padding: "8px 14px", fontWeight: 700, color: "#4C1D95", fontSize: "12px" }}>
          "She went to the park yesterday."
        </div>
        <ExampleTag />
      </div>
    ),
  },
  {
    narration: "Get it right on a safe tile and it's cleared for good — green, done, can't hurt anyone. Get it wrong on a safe tile and nothing bad happens; it just stays hidden for another team to try.",
    visual: (
      <div style={{ display: "flex", justifyContent: "center", gap: "18px", alignItems: "center" }}>
        <div style={{ textAlign: "center" }}>
          <MineGrid safe={[1, 0]} />
          <div style={{ fontSize: "10px", fontWeight: 800, color: "#166534", marginTop: "4px" }}>Right → safe for good</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "10px", fontWeight: 800, color: "#9D174D" }}>Wrong → stays hidden,<br />try again later</div>
        </div>
      </div>
    ),
  },
  {
    narration: "But if the tile you picked IS a hidden mine — right or wrong answer, doesn't matter — BOOM. That one costs your team, so think about which tiles are worth the risk.",
    visual: (
      <div style={{ textAlign: "center" }}>
        <MineGrid boom={[3, 2]} />
        <div style={{ fontSize: "11px", fontWeight: 800, color: "#B91C1C", marginTop: "4px" }}>💥 A mine — ouch.</div>
      </div>
    ),
  },
  {
    narration: "If your teacher picked more than one topic, the grid's words rotate through each one in turns as you play — same board, same mines, just a fresh set of prompts each round.",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ background: "rgba(109,40,217,0.1)", borderRadius: "999px", padding: "6px 14px", display: "inline-block", fontWeight: "900", fontSize: "12px", color: "#4C1D95" }}>
          Topic 1 of 3 → Topic 2 of 3 → Topic 3 of 3 → back to 1...
        </div>
      </div>
    ),
  },
  {
    narration: "Keep going until every safe tile has been found. Whoever has the most points when the field is clear wins — a correct answer earns points, a mine costs some.",
    visual: (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "26px" }}>💣</div>
        <div style={{ fontWeight: 900, color: "#4C1D95", fontSize: "13px", marginTop: "4px" }}>18/18 safe tiles found!</div>
      </div>
    ),
  },
];
