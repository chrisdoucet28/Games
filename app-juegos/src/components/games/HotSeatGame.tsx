import { useState, useEffect, useRef } from "react";
import type { GameProps } from "../../types";
import { teamsGridCols } from "../../data/constants";

export function HotSeatGame({ questions, teams, onUpdateScore, onEnd }: GameProps) {
  const ROUND_SECONDS = 45;
  const [qi, setQi] = useState(0);
  const [phase, setPhase] = useState<"intro" | "play" | "roundend">("intro");
  const [winner, setWinner] = useState<string | number | null>(null);
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const wordsForTeams = questions.slice(qi * teams.length, qi * teams.length + teams.length);
  const hasMore = (qi + 1) * teams.length < questions.length;

  const roundEndedRef = useRef(false);

  useEffect(() => {
    roundEndedRef.current = false;
  }, [qi]);

  useEffect(() => {
    if (phase !== "play") return;
    setTimeLeft(ROUND_SECONDS);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          if (!roundEndedRef.current) {
            roundEndedRef.current = true;
            setPhase("roundend");
          }
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [qi, phase]);

  const markCorrect = (teamId: string | number) => {
    if (roundEndedRef.current) return;
    roundEndedRef.current = true;
    if (timerRef.current) clearInterval(timerRef.current);
    const elapsed = ROUND_SECONDS - timeLeft;
    const pts = Math.max(20, 100 - elapsed * 2);
    onUpdateScore(teamId, Math.round(pts));
    setWinner(teamId);
    setPhase("roundend");
  };

  const nextRound = () => {
    if (!hasMore) { onEnd(); return; }
    setQi(i => i + 1);
    setWinner(null);
    setPhase("intro");
  };

  const [showLegend, setShowLegend] = useState(false);
  const timerPct = (timeLeft / ROUND_SECONDS) * 100;
  const timerColor = timeLeft > 20 ? "#22C55E" : timeLeft > 10 ? "#F59E0B" : "#EF4444";

  // Unique words
  const allWordsMap = new Map();
  questions.forEach(q => { if (q.word) allWordsMap.set(q.word, q); });
  const allWords = Array.from(allWordsMap.values()).map(q => q.word);

  if (phase === "intro") return (
    <div style={{ textAlign: "center" }}>
      <div style={{ background: "linear-gradient(135deg,#7C3AED,#DB2777)", borderRadius: "20px", padding: "28px 24px", marginBottom: "10px", color: "white" }}>
        <div style={{ fontSize: "32px", marginBottom: "10px" }}>🔥</div>
        <div style={{ fontWeight: "900", fontSize: "20px", marginBottom: "10px" }}>Hot Seat — Round {qi + 1}</div>
        <div style={{ fontSize: "15px", lineHeight: 1.7 }}>
          One player per team <strong>faces away from the screen.</strong><br />
          Teammates describe their word — <strong>no spelling, no saying it directly!</strong>
        </div>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <button onClick={() => setShowLegend(v => !v)} style={{ background: showLegend ? "#1E1B4B" : "white", color: showLegend ? "white" : "#1E1B4B", border: "2px solid #1E1B4B", borderRadius: "10px", padding: "8px 20px", fontWeight: "800", cursor: "pointer" }}>
          {showLegend ? "🙈 Hide word list" : "👁️ Show all words"}
        </button>
        {showLegend && (
          <div style={{ background: "white", border: "2px solid #E0E7FF", borderRadius: "14px", padding: "16px", marginTop: "12px", textAlign: "left", display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {allWords.sort().map((w, i) => (
              <span key={i} style={{ background: "#EEF2FF", color: "#4338CA", borderRadius: "6px", padding: "4px 10px", fontSize: "13px", fontWeight: "700" }}>{w}</span>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap", marginBottom: "24px" }}>
        {teams.map(t => (
          <div key={t.id} style={{ background: t.color.light, border: `3px solid ${t.color.bg}`, borderRadius: "14px", padding: "10px 18px", fontWeight: "800", color: t.color.dark }}>{t.color.emoji} {t.name}</div>
        ))}
      </div>
      <button onClick={() => setPhase("play")} style={{ background: "linear-gradient(135deg,#7C3AED,#DB2777)", color: "white", border: "none", borderRadius: "16px", padding: "16px 48px", fontSize: "19px", fontWeight: "900", cursor: "pointer" }}>✅ Everyone's ready — Start!</button>
    </div>
  );

  return (
    <div>
      <div style={{ background: "linear-gradient(135deg,#7C3AED,#DB2777)", borderRadius: "14px", padding: "12px 16px", marginBottom: "16px", textAlign: "center", color: "white" }}>
        <div style={{ fontWeight: "900", fontSize: "16px" }}>🔥 Hot Seat — Round {qi + 1}</div>
      </div>

      {phase === "play" && (
        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "16px", background: "white", border: "2px solid #E0E7FF", borderRadius: "14px", padding: "12px 16px" }}>
          <div style={{ position: "relative", width: "72px", height: "72px", flexShrink: 0 }}>
            <svg width="72" height="72" style={{ transform: "rotate(-90deg)" }}>
              <circle cx="36" cy="36" r="30" fill="none" stroke="#E5E7EB" strokeWidth="6" />
              <circle cx="36" cy="36" r="30" fill="none" stroke={timerColor} strokeWidth="6" strokeDasharray={`${2 * Math.PI * 30}`} strokeDashoffset={`${2 * Math.PI * 30 * (1 - timerPct / 100)}`} strokeLinecap="round" style={{ transition: "stroke-dashoffset 1s linear, stroke 0.3s" }} />
            </svg>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "900", fontSize: "20px", color: timerColor }}>{timeLeft}</div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: "800", color: "#374151", fontSize: "14px", marginBottom: "6px" }}>{timeLeft > 20 ? "🟢 Keep describing!" : timeLeft > 10 ? "🟡 Speed up!" : "🔴 Last chance!"}</div>
            <div style={{ height: "8px", background: "#E5E7EB", borderRadius: "4px", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${timerPct}%`, background: timerColor, borderRadius: "4px", transition: "width 1s linear, background 0.3s" }} />
            </div>
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: teamsGridCols(teams.length), gap: "12px", marginBottom: "16px" }}>
        {teams.map((team, i) => {
          const item = wordsForTeams[i];
          if (!item) return null;
          const won = winner !== null && winner === team.id;
          return (
            <div key={team.id} style={{ background: won ? "linear-gradient(135deg,#ECFDF5,#D1FAE5)" : `linear-gradient(135deg,${team.color.light},white)`, border: `3px solid ${won ? "#22C55E" : team.color.bg}`, borderRadius: "18px", overflow: "hidden", transform: won ? "scale(1.04)" : "scale(1)", transition: "all 0.35s" }}>
              <div style={{ background: won ? "#22C55E" : team.color.bg, padding: "8px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontWeight: "900", fontSize: "13px", color: "white" }}>{team.color.emoji} {team.name}</span>
                {won && <span style={{ fontSize: "18px" }}>🏆</span>}
              </div>
              <div style={{ padding: "14px 12px", textAlign: "center" }}>
                <div style={{ background: won ? "white" : "rgba(255,255,255,0.8)", borderRadius: "12px", padding: "14px 10px", fontWeight: "900", fontSize: "clamp(16px,3vw,22px)", color: won ? "#14532D" : team.color.dark, lineHeight: 1.3, marginBottom: "12px", minHeight: "56px", display: "flex", alignItems: "center", justifyContent: "center", border: `2px solid ${won ? "#22C55E" : team.color.bg}33` }}>
                  {item.word}
                </div>
                {phase === "play" && winner === null && (
                  <button onClick={() => markCorrect(team.id)} style={{ background: `linear-gradient(135deg,${team.color.bg},${team.color.dark})`, color: "white", border: "none", borderRadius: "10px", padding: "10px 16px", fontWeight: "800", cursor: "pointer", width: "100%" }}>✅ Guessed it!</button>
                )}
                {won && <div style={{ fontWeight: "900", color: "#14532D", fontSize: "15px" }}>🎉 +{Math.max(20, 100 - (ROUND_SECONDS - timeLeft) * 2)} pts!</div>}
              </div>
            </div>
          );
        })}
      </div>

      {phase === "roundend" && (
        <div style={{ textAlign: "center" }}>
          {winner !== null ? (
            <div style={{ background: "#ECFDF5", border: "2px solid #22C55E", borderRadius: "14px", padding: "14px", marginBottom: "14px" }}>
              <div style={{ fontWeight: "900", fontSize: "17px", color: "#14532D" }}>🏆 {teams.find(t => t.id === winner)?.name} guessed correctly!</div>
            </div>
          ) : (
            <div style={{ background: "#FEF9C3", border: "2px solid #F59E0B", borderRadius: "14px", padding: "14px", marginBottom: "14px" }}>
              <div style={{ fontWeight: "900", fontSize: "17px", color: "#92400E" }}>⏰ Time's up! No team guessed in time.</div>
            </div>
          )}
          <button onClick={nextRound} style={{ background: "#7C3AED", color: "white", border: "none", borderRadius: "14px", padding: "12px 32px", fontSize: "16px", fontWeight: "900", cursor: "pointer" }}>
            {hasMore ? "➡️ Next Words" : "🏁 End Game"}
          </button>
        </div>
      )}
    </div>
  );
}