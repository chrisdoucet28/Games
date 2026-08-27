import type { RaceTrackStatePayload, RaceTrackActionPayload } from "../../lib/liveSession";

type Props = {
  state: RaceTrackStatePayload;
  teamId: string | number;
  onAction: (payload: RaceTrackActionPayload) => void;
};

// The simplest phone view of the six games — no question text, no ticket board, no typing.
// Everyone's already looking at the one shared screen; a phone's only job is to be a personal,
// low-latency buzz button. Screen-authoritative like every other phone-mode game: this view never
// decides who buzzed in first, it just renders the screen's latest broadcast and forwards a tap.
export function PhoneRaceTrackView({ state, teamId, onAction }: Props) {
  const team = state.roster.find(t => t.id === teamId);

  const wrapStyle: React.CSSProperties = {
    minHeight: "100vh", padding: "20px 18px", fontFamily: "'Segoe UI',system-ui,sans-serif", color: "white",
    background: "radial-gradient(ellipse at 40% 40%,#0E2040 0%,#060E1C 100%)",
    display: "flex", flexDirection: "column", justifyContent: "center", textAlign: "center",
  };

  if (state.phase === "final") {
    return (
      <div style={wrapStyle}>
        <div style={{ fontSize: "44px", marginBottom: "10px" }}>🏁</div>
        <div style={{ fontWeight: "900", fontSize: "20px", color: "#F7C948" }}>The race is over!</div>
        <div style={{ color: "#93C5FD", fontSize: "14px", marginTop: "8px" }}>Check the big screen for final results.</div>
      </div>
    );
  }

  if (state.phase === "lobby") {
    return (
      <div style={wrapStyle}>
        <div style={{ fontSize: "36px", marginBottom: "6px" }}>{team?.mascot ?? team?.color.emoji}</div>
        <div style={{ fontWeight: "900", fontSize: "18px", color: "#F87171", marginBottom: "8px" }}>You're in as {team?.name}!</div>
        <div style={{ color: "#93C5FD", fontSize: "14px", lineHeight: 1.6 }}>Get ready — waiting for your teacher to start the race…</div>
      </div>
    );
  }

  if (state.phase === "interlude") {
    return (
      <div style={wrapStyle}>
        <div style={{ fontSize: "40px", marginBottom: "10px" }}>🎲</div>
        <div style={{ fontWeight: "800", fontSize: "16px", color: "#93C5FD" }}>Racing… watch the big screen!</div>
        <div style={{ fontSize: "13px", color: "#5A7399", marginTop: "10px" }}>Space {state.positions[String(teamId)] ?? 0}</div>
      </div>
    );
  }

  // phase === "task"
  if (state.buzzedTeamId === teamId) {
    return (
      <div style={wrapStyle}>
        <div style={{ fontSize: "44px", marginBottom: "10px" }}>⚡</div>
        <div style={{ fontWeight: "900", fontSize: "19px", color: "#F7C948" }}>You buzzed in first!</div>
        <div style={{ color: "#93C5FD", fontSize: "14px", marginTop: "8px" }}>Tell your teacher your answer.</div>
      </div>
    );
  }

  if (state.buzzedTeamId !== null) {
    const winner = state.roster.find(t => t.id === state.buzzedTeamId);
    return (
      <div style={wrapStyle}>
        <div style={{ fontSize: "36px", marginBottom: "10px" }}>😔</div>
        <div style={{ fontWeight: "800", fontSize: "16px", color: "#93C5FD" }}>{winner?.mascot ?? winner?.color.emoji} {winner?.name} buzzed in first.</div>
        <div style={{ color: "#5A7399", fontSize: "13px", marginTop: "8px" }}>Wait for the next question.</div>
      </div>
    );
  }

  if (state.rejectedTeamIds.includes(teamId)) {
    return (
      <div style={wrapStyle}>
        <div style={{ fontSize: "36px", marginBottom: "10px" }}>❌</div>
        <div style={{ fontWeight: "800", fontSize: "16px", color: "#93C5FD" }}>You already tried this question.</div>
        <div style={{ color: "#5A7399", fontSize: "13px", marginTop: "8px" }}>Wait for the next one.</div>
      </div>
    );
  }

  return (
    <div style={wrapStyle}>
      <button
        onClick={() => onAction({ teamId, action: "buzz", ts: Date.now() })}
        style={{
          width: "220px", height: "220px", borderRadius: "50%", margin: "0 auto",
          background: "radial-gradient(circle at 35% 30%,#F87171,#B91C1C)", color: "white",
          border: "6px solid #FCA5A5", boxShadow: "0 8px 30px rgba(239,68,68,0.6)",
          fontSize: "24px", fontWeight: "900", cursor: "pointer",
        }}
      >
        🔔<br />BUZZ!
      </button>
      <div style={{ color: "#93C5FD", fontSize: "13px", marginTop: "18px" }}>{team?.mascot ?? team?.color.emoji} {team?.name}</div>
    </div>
  );
}
