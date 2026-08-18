import type { SpyStatePayload } from "../../lib/liveSession";

type Props = {
  state: SpyStatePayload;
  teamId: string | number;
};

// Read-only — unlike PhoneAuctionView, nothing here ever sends a broadcast back. Phones in Spy
// Among Us are a pure privacy/convenience layer: whether they're connected or not never changes
// what happens on the shared screen.
export function PhoneSpyView({ state, teamId }: Props) {
  const team = state.roster.find(t => t.id === teamId);
  const role = state.roles[String(teamId)];

  // "speak" (group mode) and "speak-2p" (solo/1v1) both track their own turn the same way —
  // state.speakOrder/state.speakIdx already point at whichever ruleset's data sendState() chose.
  const isSpeakPhase = state.phase === "speak" || state.phase === "speak-2p";
  const speakerIdx = state.speakOrder.indexOf(teamId);
  const isMyTurn = isSpeakPhase && state.speakOrder[state.speakIdx] === teamId;
  const hasSpoken = isSpeakPhase && speakerIdx !== -1 && speakerIdx < state.speakIdx;
  const currentSpeaker = isSpeakPhase ? state.roster.find(t => t.id === state.speakOrder[state.speakIdx]) : undefined;

  // Once a team has had its turn, hide the role card — the ask was "keep the prompt up until
  // they finish speaking," which implies it's fine (and a nice fairness nudge against quietly
  // re-checking wording after the fact) to hide it once they're done.
  const showRoleCard = !hasSpoken;

  let statusLine = "";
  if (state.phase === "peek") statusLine = "🧑‍🏫 Your teacher is looking at their own card — get ready!";
  else if (state.phase === "discuss") statusLine = "💬 Discuss as a group — look at your card, get ready to speak.";
  else if (state.phase === "order-roll") statusLine = "🎲 Rolling for speaking order…";
  else if (isMyTurn) statusLine = "🎙️ Your turn — speak now!";
  else if (hasSpoken) statusLine = "✅ You've spoken — listening to the rest of the crew…";
  // roster is filtered to exclude the teacher stand-in (solo play) — a speaker id with no match
  // there can only be the teacher, never a real team.
  else if (isSpeakPhase) statusLine = `⏳ Waiting your turn — ${currentSpeaker?.name ?? "your teacher"} is speaking now.`;
  else if (state.phase === "vote" || state.phase === "spy-guess" || state.phase === "guess-2p" || state.phase === "reveal" || state.phase === "reveal-2p") {
    statusLine = "👀 Look at the big screen!";
  }

  const isSpy = role?.role === "spy";

  return (
    <div style={{
      minHeight: "100vh", padding: "20px 18px", fontFamily: "'Segoe UI',system-ui,sans-serif", color: "white",
      background: "radial-gradient(ellipse at 50% -15%,#1E293B 0%,#0F172A 55%,#020617 100%)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: "900", fontSize: "16px", marginBottom: "16px" }}>
        <span style={{ fontSize: "22px" }}>{team?.mascot ?? team?.color.emoji}</span>
        {team?.name}
      </div>

      {showRoleCard && role && (
        <div style={{
          background: isSpy ? "linear-gradient(135deg,#7F1D1D,#450A0A)" : "linear-gradient(135deg,#1E3A8A,#1D4ED8)",
          border: isSpy ? "2px solid #EF4444" : "2px solid #60A5FA",
          borderRadius: "16px", padding: "20px", marginBottom: "16px", textAlign: "center",
        }}>
          <div style={{ fontSize: "32px", marginBottom: "8px" }}>{isSpy ? "🕵️" : "👨‍🚀"}</div>
          <div style={{ fontWeight: "900", fontSize: "18px", marginBottom: "10px" }}>
            {isSpy ? "You are the SPY!" : "You are a CREWMATE"}
          </div>
          <div style={{
            background: "rgba(0,0,0,0.25)", borderRadius: "12px", padding: "14px",
            fontSize: "15px", lineHeight: 1.6, fontWeight: "700",
          }}>
            {role.prompt}
          </div>
          {isSpy && (
            <div style={{ fontSize: "12px", opacity: 0.8, marginTop: "10px" }}>
              Blend in and try to guess the real topic if you get caught.
            </div>
          )}
        </div>
      )}

      {statusLine && (
        <div style={{
          textAlign: "center", background: isMyTurn ? "rgba(34,197,94,0.15)" : "rgba(56,189,248,0.1)",
          border: `2px solid ${isMyTurn ? "#22C55E" : "#38BDF8"}`, borderRadius: "12px", padding: "14px",
          fontWeight: "800", fontSize: "14px", color: isMyTurn ? "#4ADE80" : "#7DD3FC",
        }}>
          {statusLine}
        </div>
      )}
    </div>
  );
}
