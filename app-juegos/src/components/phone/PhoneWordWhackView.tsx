import { useEffect, useRef, useState } from "react";
import type { WhackStatePayload, WhackTurnReportPayload } from "../../lib/liveSession";
import { useMoleGame, TOTAL_HOLES } from "../../hooks/useMoleGame";
import { useTurnTimer } from "../../hooks/useTurnTimer";

type Props = {
  state: WhackStatePayload;
  teamId: string | number;
  onTurnReport: (payload: WhackTurnReportPayload) => void;
};

// The active team's phone runs the entire mole-spawn/duck/hit loop locally (useMoleGame — the
// same hook the teacher's screen uses in screen mode) so tapping feels instant, with zero network
// round-trip in the loop itself. It only ever talks back once per turn, when its own local 90s
// timer runs out. Every other phone (and the shared screen) just shows a live scoreboard while
// waiting — no mole content is mirrored anywhere else, deliberately, to avoid a second, harder
// sync problem for no real benefit (nobody watching can act on it anyway).
export function PhoneWordWhackView({ state, teamId, onTurnReport }: Props) {
  const isMyTurn = state.phase === "turn" && state.activeTeamId === teamId;
  const team = state.roster.find(t => t.id === teamId);

  // Flips once this phone has already reported its turn's result, so it shows a "nice work" card
  // instead of a dead mole grid while waiting for the screen to broadcast the next team's turn.
  const [reported, setReported] = useState(false);
  const [lastResult, setLastResult] = useState<{ score: number; combo: number } | null>(null);

  useEffect(() => {
    // A fresh turn for this team (new startRoundIdx) means the previous "reported" flag no longer
    // applies — without this a team's second turn (round 2) would never show its own mole grid.
    setReported(false);
  }, [state.startRoundIdx, state.activeTeamId]);

  const turnTimeLeftRef = useRef(state.turnSeconds);

  const handleTurnEnd = () => {
    if (reported) return;
    setReported(true);
    setLastResult({ score: game.turnScore, combo: game.bestCombo });
    onTurnReport({
      teamId,
      finalScore: game.turnScore,
      bestCombo: game.bestCombo,
      endRoundIdx: game.roundIdxRef.current,
      playedRounds: game.playedRounds,
    });
  };

  const { timeLeft } = useTurnTimer(state.turnSeconds, isMyTurn && !reported, handleTurnEnd, state.startRoundIdx);
  useEffect(() => { turnTimeLeftRef.current = timeLeft; }, [timeLeft]);

  const game = useMoleGame({
    pool: state.pool,
    difficulty: state.difficulty,
    startRoundIdx: state.startRoundIdx,
    active: isMyTurn && !reported,
    resetKey: state.startRoundIdx,
    turnTimeLeftRef,
  });

  const wrapStyle: React.CSSProperties = {
    minHeight: "100vh", padding: "20px 18px", fontFamily: "'Segoe UI',system-ui,sans-serif", color: "white",
    background: "radial-gradient(ellipse at 50% -10%,#65A30D 0%,#365314 45%,#0F1A05 100%)",
  };

  if (state.phase === "review" || state.phase === "final") {
    return (
      <div style={wrapStyle}>
        <div style={{ textAlign: "center", marginBottom: "16px" }}>
          <div style={{ fontSize: "32px" }}>📋</div>
          <div style={{ fontWeight: "900", fontSize: "18px", color: "#BEF264" }}>Review the Questions</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {state.playedRounds.map((r, i) => (
            <div key={i} style={{ background: "rgba(255,255,255,0.08)", border: "1.5px solid #BEF26455", borderRadius: "10px", padding: "10px 12px" }}>
              <div style={{ fontSize: "13px", fontWeight: "700", marginBottom: "4px" }}>{r.prompt}</div>
              <div style={{ fontSize: "12px", color: "#BEF264", fontWeight: "800" }}>✅ {r.choices[r.correctIdx]}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Checked before the generic "not my turn" view below — the instant this phone's local timer
  // expires it reports and locally flips `reported`, but the screen's own next broadcast (turn-end,
  // activeTeamId already cleared back to null) arrives almost immediately after and would otherwise
  // make `isMyTurn` false before this team ever saw their own "nice work" card. `reported` only
  // clears once a genuinely new turn (fresh startRoundIdx/activeTeamId) is broadcast, so this stays
  // up exactly until that happens, not just for one tick.
  if (reported) {
    return (
      <div style={{ ...wrapStyle, textAlign: "center", display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ fontSize: "40px", marginBottom: "8px" }}>🔨</div>
        <div style={{ fontWeight: "900", fontSize: "20px", color: "#BEF264", marginBottom: "6px" }}>Nice work!</div>
        <div style={{ fontWeight: "800", fontSize: "28px", marginBottom: "4px" }}>+{lastResult?.score ?? 0} pts</div>
        <div style={{ fontSize: "13px", color: "#D9F99D" }}>Best combo: 🔥 x{lastResult?.combo ?? 0}</div>
      </div>
    );
  }

  if (!isMyTurn) {
    const activeTeam = state.roster.find(t => t.id === state.activeTeamId);
    return (
      <div style={{ ...wrapStyle, textAlign: "center" }}>
        <div style={{ fontSize: "22px", marginBottom: "4px" }}>{team?.mascot ?? team?.color.emoji}</div>
        <div style={{ fontWeight: "900", fontSize: "16px", marginBottom: "16px" }}>{team?.name}</div>
        <div style={{ fontSize: "36px", marginBottom: "8px" }}>🔨</div>
        <div style={{ fontWeight: "800", fontSize: "16px", color: "#BEF264", marginBottom: "18px" }}>
          {activeTeam ? `${activeTeam.name} is playing now!` : "Get ready — waiting for the warm-up to start…"}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxWidth: "300px", margin: "0 auto" }}>
          {state.roster.map(t => (
            <div key={t.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: t.id === state.activeTeamId ? "rgba(190,242,100,0.15)" : "rgba(255,255,255,0.06)", border: `1.5px solid ${t.id === state.activeTeamId ? "#BEF264" : "rgba(255,255,255,0.15)"}`, borderRadius: "10px", padding: "8px 12px" }}>
              <span style={{ fontSize: "13px", fontWeight: "700" }}>{t.mascot ?? t.color.emoji} {t.name}</span>
              <span style={{ fontSize: "13px", fontWeight: "800", color: "#BEF264" }}>{state.scores[String(t.id)] ?? 0} pts</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={wrapStyle}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
        <span style={{ fontWeight: "900", fontSize: "15px" }}>{team?.mascot ?? team?.color.emoji} {team?.name}</span>
        <span style={{ fontSize: "13px", fontWeight: "800", color: "#BEF264" }}>⏱️ {timeLeft}s</span>
      </div>

      <div style={{ display: "flex", gap: "8px", justifyContent: "center", marginBottom: "10px" }}>
        <div style={{ background: "rgba(255,255,255,0.1)", border: "1.5px solid #BEF26466", borderRadius: "10px", padding: "5px 12px", fontSize: "12px", fontWeight: "800", color: "#BEF264" }}>🪙 {game.turnScore} pts</div>
        <div style={{ background: game.combo > 0 ? "linear-gradient(135deg,#CA8A04,#F59E0B)" : "rgba(255,255,255,0.1)", border: "1.5px solid #FCD34D66", borderRadius: "10px", padding: "5px 12px", fontSize: "12px", fontWeight: "800", color: game.combo > 0 ? "#1F1300" : "#FCD34D88" }}>🔥 x{game.combo}</div>
      </div>

      <div style={{ background: "rgba(255,255,255,0.08)", border: "2px solid #BEF26455", borderRadius: "12px", padding: "10px 14px", marginBottom: "12px", textAlign: "center" }}>
        <div style={{ fontSize: "10px", fontWeight: "800", color: "#BEF264", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "3px" }}>Whack the correct answer</div>
        <div style={{ fontWeight: "800", fontSize: "14px" }}>{game.prompt || "…"}</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "8px", maxWidth: "340px", margin: "0 auto" }}>
        {Array.from({ length: TOTAL_HOLES }).map((_, holeIdx) => {
          const mole = game.moles.find(m => m.holeIdx === holeIdx);
          const holeFx = game.fx && game.fx.holeIdx === holeIdx ? game.fx : null;
          return (
            <div key={holeIdx} style={{ position: "relative", height: "68px" }}>
              <div style={{ position: "absolute", left: "50%", bottom: "4px", transform: "translateX(-50%)", width: "54px", height: "20px", borderRadius: "50%", background: "radial-gradient(ellipse,#1A2E05,#0F1A05)", boxShadow: "inset 0 3px 6px rgba(0,0,0,0.6)" }} />
              {mole && (
                <button
                  key={mole.key}
                  onClick={() => game.hitMole(mole)}
                  style={{
                    position: "absolute", left: 0, right: 0, margin: "0 auto", bottom: "8px",
                    width: "76px", minHeight: "46px", border: "none", borderRadius: "12px", cursor: "pointer",
                    background: "linear-gradient(160deg,#A16207,#78350F)", color: "#FEF3C7",
                    fontWeight: "800", fontSize: mole.text.length > 14 ? "8.5px" : mole.text.length > 9 ? "9.5px" : "11px",
                    lineHeight: 1.1, padding: "6px 4px", boxShadow: "0 3px 8px rgba(0,0,0,0.5)",
                    overflowWrap: "break-word", wordBreak: "break-word", hyphens: "auto",
                    display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center",
                  }}
                >
                  {team?.mascot ?? "🦫"} {mole.text}
                </button>
              )}
              {holeFx?.kind === "hit" && (
                <div style={{ position: "absolute", left: "50%", bottom: "22px", transform: "translateX(-50%)", pointerEvents: "none", fontWeight: "900", fontSize: "13px", color: "#BEF264", textShadow: "0 2px 4px rgba(0,0,0,0.6)" }}>
                  +hit!
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
