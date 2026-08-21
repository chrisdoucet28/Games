import type { HotSeatStatePayload, HotSeatActionPayload } from "../../lib/liveSession";

type Props = {
  state: HotSeatStatePayload;
  teamId: string | number;
  onAction: (payload: HotSeatActionPayload) => void;
};

// Screen-authoritative — this view never draws its own word or runs its own timer, it just
// renders whatever the screen's latest broadcast says and forwards taps back as one-shot actions.
// No per-tap latency pressure here (unlike Word Whack's mole grid), so a small round-trip on
// Correct/Skip is imperceptible.
export function PhoneHotSeatView({ state, teamId, onAction }: Props) {
  const team = state.roster.find(t => t.id === teamId);

  const wrapStyle: React.CSSProperties = {
    minHeight: "100vh", padding: "20px 18px", fontFamily: "'Segoe UI',system-ui,sans-serif", color: "white",
    background: "radial-gradient(ellipse at 50% 105%,#9A3412 0%,#431407 45%,#0A0300 100%)",
  };

  if (state.phase === "final") {
    return (
      <div style={{ ...wrapStyle, textAlign: "center", display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ fontSize: "44px", marginBottom: "10px" }}>🌋</div>
        <div style={{ fontWeight: "900", fontSize: "20px", color: "#FDBA74" }}>Thanks for playing!</div>
        <div style={{ color: "#FED7AA", fontSize: "14px", marginTop: "8px" }}>Check the big screen for final results.</div>
      </div>
    );
  }

  const amActive = state.activeTeamId === teamId;
  const isDescribingNow = state.teamStructure === "groups" ? amActive : !amActive;

  // Solo mode + I'm the active team = I'm the one guessing, not describing — the only case where
  // being "active" does NOT mean "I have the word."
  if (state.teamStructure === "solo" && amActive) {
    return (
      <div style={{ ...wrapStyle, textAlign: "center" }}>
        <div style={{ fontSize: "22px", marginBottom: "4px" }}>{team?.mascot ?? team?.color.emoji}</div>
        <div style={{ fontWeight: "900", fontSize: "16px", marginBottom: "18px" }}>{team?.name}</div>
        <div style={{ fontSize: "40px", marginBottom: "10px" }}>🔥</div>
        <div style={{ fontWeight: "900", fontSize: "18px", color: "#FDBA74", marginBottom: "10px" }}>You're up — listen for clues!</div>
        <div style={{ fontSize: "13px", color: "#FED7AA", marginBottom: "18px" }}>Everyone else is describing for you right now.</div>
        <div style={{ fontWeight: "900", fontSize: "40px", color: "#FDBA74" }}>{state.timeLeft}s</div>
        <div style={{ fontSize: "13px", color: "#FED7AA", marginTop: "10px" }}>This turn: {state.turnCorrect} words</div>
      </div>
    );
  }

  if (!isDescribingNow) {
    const activeTeam = state.roster.find(t => t.id === state.activeTeamId);
    return (
      <div style={{ ...wrapStyle, textAlign: "center" }}>
        <div style={{ fontSize: "22px", marginBottom: "4px" }}>{team?.mascot ?? team?.color.emoji}</div>
        <div style={{ fontWeight: "900", fontSize: "16px", marginBottom: "18px" }}>{team?.name}</div>
        <div style={{ fontSize: "36px", marginBottom: "8px" }}>🔥</div>
        <div style={{ fontWeight: "800", fontSize: "16px", color: "#FDBA74", marginBottom: "18px" }}>
          {activeTeam ? `${activeTeam.name} is on the hot seat!` : "Get ready — waiting for the game to start…"}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxWidth: "300px", margin: "0 auto" }}>
          {state.roster.map(t => (
            <div key={t.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: t.id === state.activeTeamId ? "rgba(253,186,116,0.15)" : "rgba(255,255,255,0.06)", border: `1.5px solid ${t.id === state.activeTeamId ? "#FDBA74" : "rgba(255,255,255,0.15)"}`, borderRadius: "10px", padding: "8px 12px" }}>
              <span style={{ fontSize: "13px", fontWeight: "700" }}>{t.mascot ?? t.color.emoji} {t.name}</span>
              <span style={{ fontSize: "13px", fontWeight: "800", color: "#FDBA74" }}>{state.scores[String(t.id)] ?? 0} words</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Describing now — the word, a countdown, this turn's tally, and the same three controls the
  // shared screen normally has.
  return (
    <div style={wrapStyle}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
        <span style={{ fontWeight: "900", fontSize: "15px" }}>
          {state.teamStructure === "groups" ? `${team?.mascot ?? team?.color.emoji} ${team?.name}` : "🔥 Describing"}
        </span>
        <span style={{ fontSize: "13px", fontWeight: "800", color: "#FDBA74" }}>⏱️ {state.timeLeft}s</span>
      </div>

      <div style={{ textAlign: "center", fontSize: "13px", color: "#FED7AA", fontWeight: "700", marginBottom: "10px" }}>
        This turn: {state.turnCorrect} words
      </div>

      <div style={{ background: "linear-gradient(160deg,#1C0701,#2D0A00)", border: "4px solid #F97316", borderRadius: "22px", padding: "22px 16px", textAlign: "center", marginBottom: "16px", boxShadow: "0 0 30px rgba(249,115,22,0.35)" }}>
        <div style={{ color: "#FDBA74", fontWeight: "800", fontSize: "12px", textTransform: "uppercase", marginBottom: "10px" }}>Describe this word</div>
        <div style={{ background: "rgba(0,0,0,0.4)", borderRadius: "16px", border: "3px solid #F9731655", padding: "20px 10px", color: "#FFF7ED", fontWeight: "900", fontSize: "clamp(28px,9vw,44px)", lineHeight: 1.1, minHeight: "80px", display: "flex", alignItems: "center", justifyContent: "center", overflowWrap: "anywhere" }}>
          {state.currentWord}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <button
          onClick={() => onAction({ teamId, action: "correct" })}
          style={{ background: "linear-gradient(135deg,#15803D,#22C55E)", color: "white", border: "none", borderRadius: "14px", padding: "16px", fontSize: "17px", fontWeight: "900", cursor: "pointer" }}
        >
          Correct ✅
        </button>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={() => onAction({ teamId, action: "skip" })}
            style={{ flex: 1, background: "rgba(0,0,0,0.3)", color: "#FDBA74", border: "3px solid #F59E0B", borderRadius: "14px", padding: "12px", fontSize: "14px", fontWeight: "900", cursor: "pointer" }}
          >
            Skip
          </button>
          <button
            onClick={() => onAction({ teamId, action: "endTurn" })}
            style={{ flex: 1, background: "rgba(0,0,0,0.3)", color: "#FCA5A5", border: "3px solid #EF4444", borderRadius: "14px", padding: "12px", fontSize: "14px", fontWeight: "900", cursor: "pointer" }}
          >
            End Turn
          </button>
        </div>
      </div>
    </div>
  );
}
