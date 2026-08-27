import type { HillStatePayload, HillActionPayload } from "../../lib/liveSession";

type Props = {
  state: HillStatePayload;
  teamId: string | number;
  onAction: (payload: HillActionPayload) => void;
};

// The simplest phone view of the seven games — King of the Hill is turn-based, so almost the whole
// game has nothing for a phone to do beyond "watch the shared screen." The one exception is a
// contested duel, where the buzzer is a pure informational overlay (see liveSession.ts) — this view
// never decides who won a duel, it just renders the screen's latest broadcast and forwards a tap.
export function PhoneKingOfHillView({ state, teamId, onAction }: Props) {
  const team = state.roster.find(t => t.id === teamId);

  const wrapStyle: React.CSSProperties = {
    minHeight: "100vh", padding: "20px 18px", fontFamily: "'Segoe UI',system-ui,sans-serif", color: "white",
    background: "radial-gradient(ellipse at 50% -10%,#DB2777 0%,#831843 45%,#1F0A1F 100%)",
    display: "flex", flexDirection: "column", justifyContent: "center", textAlign: "center",
  };

  if (state.phase === "final") {
    return (
      <div style={wrapStyle}>
        <div style={{ fontSize: "44px", marginBottom: "10px" }}>👑</div>
        <div style={{ fontWeight: "900", fontSize: "20px", color: "#FCD34D" }}>The game is over!</div>
        <div style={{ color: "#F9A8D4", fontSize: "14px", marginTop: "8px" }}>Check the big screen for final results.</div>
      </div>
    );
  }

  const waitingCard = (
    <div style={wrapStyle}>
      <div style={{ fontSize: "36px", marginBottom: "6px" }}>{team?.mascot ?? team?.color.emoji}</div>
      <div style={{ fontWeight: "900", fontSize: "18px", color: "#F9A8D4", marginBottom: "8px" }}>{team?.name}</div>
      <div style={{ color: "#F9A8D488", fontSize: "14px", lineHeight: 1.6 }}>👑 Watching the board — wait for the next duel!</div>
    </div>
  );

  if (state.phase !== "duel") return waitingCard;

  const inDuel = teamId === state.attackerId || teamId === state.defenderId;
  if (!inDuel) return waitingCard;

  if (state.buzzedTeamId === teamId) {
    return (
      <div style={wrapStyle}>
        <div style={{ fontSize: "44px", marginBottom: "10px" }}>⚡</div>
        <div style={{ fontWeight: "900", fontSize: "19px", color: "#FCD34D" }}>You buzzed in first!</div>
        <div style={{ color: "#F9A8D4", fontSize: "14px", marginTop: "8px" }}>Tell your teacher your answer.</div>
      </div>
    );
  }

  if (state.buzzedTeamId !== null) {
    const winner = state.roster.find(t => t.id === state.buzzedTeamId);
    return (
      <div style={wrapStyle}>
        <div style={{ fontSize: "36px", marginBottom: "10px" }}>😔</div>
        <div style={{ fontWeight: "800", fontSize: "16px", color: "#F9A8D4" }}>{winner?.mascot ?? winner?.color.emoji} {winner?.name} buzzed in first.</div>
      </div>
    );
  }

  return (
    <div style={wrapStyle}>
      <div style={{ fontWeight: "800", fontSize: "15px", color: "#F9A8D4", marginBottom: "18px" }}>⚔️ Duel! {team?.mascot ?? team?.color.emoji} {team?.name}</div>
      <button
        onClick={() => onAction({ teamId, action: "buzz", ts: Date.now() })}
        style={{
          width: "220px", height: "220px", borderRadius: "50%", margin: "0 auto",
          background: "radial-gradient(circle at 35% 30%,#F9A8D4,#DB2777)", color: "white",
          border: "6px solid #F9A8D4", boxShadow: "0 8px 30px rgba(219,39,119,0.6)",
          fontSize: "24px", fontWeight: "900", cursor: "pointer",
        }}
      >
        🔔<br />BUZZ!
      </button>
    </div>
  );
}
