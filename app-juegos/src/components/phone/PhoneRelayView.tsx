import type { RelayStatePayload, RelayActionPayload } from "../../lib/liveSession";
import { TeamIcon } from "../shared/TeamIcon";

type Props = {
  state: RelayStatePayload;
  teamId: string | number;
  onAction: (payload: RelayActionPayload) => void;
};

// Screen-authoritative, like PhoneHotSeatView — this view never draws its own word or runs any
// logic of its own, it just renders whatever the screen's latest broadcast says and forwards taps
// back as one-shot actions. Simpler than Hot Seat's phone view since there's no teamStructure
// branch: the rule is always the same one — the active team's own phone shows the word.
export function PhoneRelayView({ state, teamId, onAction }: Props) {
  const team = state.roster.find(t => t.id === teamId);

  const wrapStyle: React.CSSProperties = {
    minHeight: "100vh", padding: "20px 18px", fontFamily: "'Segoe UI',system-ui,sans-serif", color: "white",
    background: "radial-gradient(ellipse at 50% 105%,#0D9488 0%,#134E4A 45%,#042F2E 100%)",
  };

  if (state.phase === "final") {
    return (
      <div style={{ ...wrapStyle, textAlign: "center", display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ fontSize: "44px", marginBottom: "10px" }}>🏁</div>
        <div style={{ fontWeight: "900", fontSize: "20px", color: "#5EEAD4" }}>That's a wrap!</div>
        <div style={{ color: "#99F6E4", fontSize: "14px", marginTop: "8px" }}>Check the big screen for final results.</div>
      </div>
    );
  }

  const amActive = state.activeTeamId === teamId;

  if (!amActive) {
    const activeTeam = state.roster.find(t => t.id === state.activeTeamId);
    return (
      <div style={{ ...wrapStyle, textAlign: "center" }}>
        <div style={{ fontSize: "22px", marginBottom: "4px" }}><TeamIcon team={team} size={22} /></div>
        <div style={{ fontWeight: "900", fontSize: "16px", marginBottom: "18px" }}>{team?.name}</div>
        <div style={{ fontSize: "36px", marginBottom: "8px" }}>📣</div>
        <div style={{ fontWeight: "800", fontSize: "16px", color: "#5EEAD4", marginBottom: "18px" }}>
          {activeTeam ? `${activeTeam.name} has the word — give them clues!` : "Get ready — waiting for the game to start…"}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxWidth: "300px", margin: "0 auto" }}>
          {state.roster.map(t => (
            <div key={t.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: t.id === state.activeTeamId ? "rgba(94,234,212,0.15)" : "rgba(255,255,255,0.06)", border: `1.5px solid ${t.id === state.activeTeamId ? "#5EEAD4" : "rgba(255,255,255,0.15)"}`, borderRadius: "10px", padding: "8px 12px" }}>
              <span style={{ fontSize: "13px", fontWeight: "700" }}><TeamIcon team={t} /> {t.name}</span>
              <span style={{ fontSize: "13px", fontWeight: "800", color: "#5EEAD4" }}>{state.wordsByTeam[String(t.id)] ?? 0} words</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // It's this team's turn — the word (facing away from the holder, toward everyone else), and
  // the two controls someone nearby taps on their behalf.
  return (
    <div style={wrapStyle}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
        <span style={{ fontWeight: "900", fontSize: "15px" }}><TeamIcon team={team} /> {team?.name}</span>
        <span style={{ fontSize: "13px", fontWeight: "800", color: "#5EEAD4" }}>{state.wordsByTeam[String(teamId)] ?? 0} words</span>
      </div>

      <div style={{ textAlign: "center", fontSize: "12px", color: "#99F6E4", fontWeight: "700", marginBottom: "10px" }}>
        Hold the phone facing away from you — someone nearby taps for you
      </div>

      <div style={{ background: "linear-gradient(160deg,#022C22,#031F19)", border: "4px solid #0D9488", borderRadius: "22px", padding: "22px 16px", textAlign: "center", marginBottom: "16px", boxShadow: "0 0 30px rgba(13,148,136,0.35)" }}>
        <div style={{ color: "#5EEAD4", fontWeight: "800", fontSize: "12px", textTransform: "uppercase", marginBottom: "10px" }}>The word is</div>
        <div style={{ background: "rgba(0,0,0,0.4)", borderRadius: "16px", border: "3px solid #14B8A655", padding: "20px 10px", color: "#F0FDFA", fontWeight: "900", fontSize: "clamp(28px,9vw,44px)", lineHeight: 1.1, minHeight: "80px", display: "flex", alignItems: "center", justifyContent: "center", overflowWrap: "anywhere" }}>
          {state.currentWord}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <button
          onClick={() => onAction({ teamId, action: "correct" })}
          style={{ background: "linear-gradient(135deg,#15803D,#22C55E)", color: "white", border: "none", borderRadius: "14px", padding: "18px", fontSize: "18px", fontWeight: "900", cursor: "pointer" }}
        >
          Got it! ✅
        </button>
        <button
          onClick={() => onAction({ teamId, action: "skip" })}
          style={{ background: "rgba(0,0,0,0.3)", color: "#5EEAD4", border: "3px solid #14B8A6", borderRadius: "14px", padding: "14px", fontSize: "15px", fontWeight: "900", cursor: "pointer" }}
        >
          Skip
        </button>
      </div>
    </div>
  );
}
