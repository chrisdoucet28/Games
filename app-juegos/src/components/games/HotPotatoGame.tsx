import { useState, useEffect, useRef } from "react";
import type { GameProps } from "../../types";
import { teamsGridCols } from "../../data/constants";

export function HotPotatoGame({ questions, teams, onUpdateScore, onEnd, level }: GameProps) {
  const showSpanish = level === "A1" || level === "A2";
  const STARTING_BANK = 100;
  const TOTAL_ROUNDS = 5;
  const ROUND_SECONDS = 40;
  const Q_SECONDS = 10;
  const PENALTY_PTS = 30;

  const [phase, setPhase] = useState<"intro" | "play" | "roundend" | "gameover">("intro");
  const [round, setRound] = useState(1);
  const [qi, setQi] = useState(0);
  const [holderIdx, setHolderIdx] = useState(0);
  const [roundTimeLeft, setRoundTimeLeft] = useState(ROUND_SECONDS);
  const [qTimeLeft, setQTimeLeft] = useState(Q_SECONDS);
  const [showAnswer, setShowAnswer] = useState(false);
  const [passing, setPassing] = useState(false);
  const [history, setHistory] = useState<{ round: number, holderName: string, holderId: string | number }[]>([]);

  const roundTimeRef = useRef(ROUND_SECONDS);
  const timerPaused = useRef(false);
  const roundTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const qTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const roundEndedRef = useRef(false);
  const holderIdxRef = useRef(0);
  const seededStartRef = useRef(false);
  const penalizedRoundRef = useRef<number | null>(null);

  useEffect(() => { holderIdxRef.current = holderIdx; }, [holderIdx]);

  useEffect(() => {
    if (phase === "roundend" && penalizedRoundRef.current !== round) {
      penalizedRoundRef.current = round;
      onUpdateScore(teams[holderIdxRef.current].id, -PENALTY_PTS);
    }
  }, [phase, round, onUpdateScore, teams]);

  useEffect(() => {
    roundTimeRef.current = ROUND_SECONDS;
    roundEndedRef.current = false;
    timerPaused.current = false;
    setRoundTimeLeft(ROUND_SECONDS);
  }, [round]);

  useEffect(() => {
    if (phase !== "play") {
      if (roundTimerRef.current) clearInterval(roundTimerRef.current);
      return;
    }
    if (roundTimerRef.current) clearInterval(roundTimerRef.current);
    roundTimerRef.current = setInterval(() => {
      if (timerPaused.current) return;
      roundTimeRef.current -= 1;
      setRoundTimeLeft(roundTimeRef.current);
      if (roundTimeRef.current <= 0) {
        if (roundTimerRef.current) clearInterval(roundTimerRef.current);
        if (!roundEndedRef.current) {
          roundEndedRef.current = true;
          const loser = teams[holderIdxRef.current];
          setHistory(h => [...h, { round, holderName: loser.name, holderId: loser.id }]);
          setPhase("roundend");
        }
      }
    }, 1000);
    return () => { if (roundTimerRef.current) clearInterval(roundTimerRef.current); };
  }, [phase, round, teams]);

  useEffect(() => {
    if (phase !== "play") return;
    setQTimeLeft(Q_SECONDS);
    setShowAnswer(false);
    if (qTimerRef.current) clearInterval(qTimerRef.current);
    qTimerRef.current = setInterval(() => {
      setQTimeLeft(t => {
        if (t <= 1) {
          if (qTimerRef.current) clearInterval(qTimerRef.current);
          timerPaused.current = true;
          setShowAnswer(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => { if (qTimerRef.current) clearInterval(qTimerRef.current); };
  }, [qi, phase]);

  const revealAnswer = () => {
    if (qTimerRef.current) clearInterval(qTimerRef.current);
    timerPaused.current = true;
    setShowAnswer(true);
  };

  const confirmPass = () => {
    setPassing(true);
    setTimeout(() => {
      setPassing(false);
      setHolderIdx(i => (i + 1) % teams.length);
    }, 650);
    setShowAnswer(false);
    timerPaused.current = false;
    setQi(i => i + 1);
  };

  const confirmKeep = () => {
    setShowAnswer(false);
    timerPaused.current = false;
    setQi(i => i + 1);
  };

  const startNextRound = () => {
    if (round >= TOTAL_ROUNDS) { setPhase("gameover"); return; }
    setShowAnswer(false);
    setRound(r => r + 1);
    setPhase("play");
  };

  const CIRCLE_R = 88, CX = 128, CY = 128, SVG_SIZE = 256;
  const n = teams.length;
  const teamPos = teams.map((_, i) => {
    const a = -Math.PI / 2 + (2 * Math.PI * i) / n;
    return { x: CX + CIRCLE_R * Math.cos(a), y: CY + CIRCLE_R * Math.sin(a) };
  });
  const potatoX = passing ? teamPos[(holderIdx + 1) % n].x : teamPos[holderIdx].x;
  const potatoY = passing ? teamPos[(holderIdx + 1) % n].y : teamPos[holderIdx].y;

  const roundTimePct = (roundTimeLeft / ROUND_SECONDS) * 100;
  const qTimePct = (qTimeLeft / Q_SECONDS) * 100;
  const qColor = qTimeLeft > 6 ? "#22C55E" : qTimeLeft > 3 ? "#F59E0B" : "#EF4444";
  const holder = teams[holderIdx];
  const q = questions[qi % Math.max(questions.length, 1)];

  const [showQPreview, setShowQPreview] = useState(false);

  if (phase === "intro") return (
    <div style={{ textAlign: "center" }}>
      <div style={{ background: "linear-gradient(135deg,#EA580C,#F97316)", borderRadius: "20px", padding: "28px 24px", marginBottom: "10px", position: "relative", color: "white", maxWidth: "520px", margin: "0 auto 10px" }}>
        <div style={{ fontSize: "40px", marginBottom: "10px" }}>🥔</div>
        <div style={{ fontWeight: "900", fontSize: "20px", marginBottom: "10px" }}>Hot Potato</div>
        <div style={{ fontSize: "15px", lineHeight: 1.8, opacity: 0.95 }}>
          Each team starts with <strong>{STARTING_BANK} pts</strong> for this game.<br />
          <strong>5 rounds × 40 seconds.</strong> One team holds the potato.<br />
          Each team has <strong>10 seconds</strong> to answer — timer auto-reveals.<br />
          Teacher judges: <strong>✅ Answered in time → Pass it on!</strong><br />
          <strong>❌ Too slow or wrong → Keep the potato!</strong><br />
          Whoever holds it at 0 <strong>loses {PENALTY_PTS} pts 🔥</strong>
        </div>
        <div style={{ position: "absolute", bottom: "-14px", left: "50%", transform: "translateX(-50%)", width: 0, height: 0, borderLeft: "14px solid transparent", borderRight: "14px solid transparent", borderTop: "14px solid #F97316" }} />
      </div>
      <div style={{ marginTop: "24px", marginBottom: "16px", fontSize: "14px", color: "#6B7280", fontWeight: "600" }}>
        Pass the potato as fast as possible — the clock is always ticking!
      </div>

      <div style={{ marginBottom: "20px" }}>
        <button
          onClick={() => setShowQPreview(v => !v)}
          style={{
            background: showQPreview ? "#7C2D12" : "white",
            color: showQPreview ? "white" : "#7C2D12",
            border: "2px solid #7C2D12",
            borderRadius: "10px", padding: "8px 20px",
            fontWeight: "800", fontSize: "13px", cursor: "pointer",
            transition: "all 0.15s"
          }}
        >
          {showQPreview ? "🙈 Hide question list" : "👁️ Preview all questions & answers"}
        </button>

        {showQPreview && (
          <div style={{
            background: "white", border: "2px solid #FED7AA",
            borderRadius: "14px", padding: "16px", marginTop: "12px",
            textAlign: "left", maxHeight: "340px", overflowY: "auto"
          }}>
            <div style={{ fontWeight: "800", color: "#7C2D12", fontSize: "13px", marginBottom: "12px" }}>
              📋 All questions in this game ({questions.length} total) — pre-teach anything unfamiliar!
            </div>
            {questions.map((q, i) => (
              <div key={i} style={{
                borderBottom: i < questions.length - 1 ? "1px solid #FED7AA" : "none",
                paddingBottom: "10px", marginBottom: "10px"
              }}>
                <div style={{ fontWeight: "700", color: "#1C1917", fontSize: "13px", marginBottom: "3px" }}>
                  {i + 1}. {q.prompt}
                </div>
                <div style={{ fontWeight: "600", color: "#EA580C", fontSize: "12px" }}>
                  ✅ {q.answer}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap", marginBottom: "24px" }}>
        {teams.map(t => (<div key={t.id} style={{ background: t.color.light, border: `3px solid ${t.color.bg}`, borderRadius: "14px", padding: "10px 18px", fontWeight: "800", fontSize: "14px", color: t.color.dark }}>{t.color.emoji} {t.name}</div>))}
      </div>
      <button onClick={() => {
        if (!seededStartRef.current) {
          teams.forEach(team => onUpdateScore(team.id, STARTING_BANK));
          seededStartRef.current = true;
        }
        setPhase("play");
      }} style={{ background: "linear-gradient(135deg,#EA580C,#F97316)", color: "white", border: "none", borderRadius: "16px", padding: "16px 48px", fontSize: "19px", fontWeight: "900", cursor: "pointer", boxShadow: "0 6px 24px rgba(249,115,22,0.4)" }}>
        🥔 Start Round 1!
      </button>
    </div>
  );

  if (phase === "roundend") {
    const lastEntry = history[history.length - 1];
    return (
      <div style={{ textAlign: "center", padding: "10px" }}>
        <div style={{ fontSize: "52px", marginBottom: "8px" }}>🔥</div>
        <div style={{ fontWeight: "900", fontSize: "22px", color: "#C2410C", marginBottom: "6px" }}>Round {round} Over!</div>
        <div style={{ background: "linear-gradient(135deg,#FEF2F2,#FEE2E2)", border: "3px solid #EF4444", borderRadius: "16px", padding: "16px", marginBottom: "16px" }}>
          <div style={{ fontWeight: "800", fontSize: "16px", color: "#991B1B", marginBottom: "4px" }}>
            🥔 {lastEntry?.holderName} was holding the potato!
          </div>
          <div style={{ fontWeight: "900", fontSize: "24px", color: "#DC2626" }}>−{PENALTY_PTS} pts</div>
        </div>
        {history.length > 0 && (
          <div style={{ background: "#F9FAFB", border: "2px solid #E5E7EB", borderRadius: "14px", padding: "12px", marginBottom: "16px", textAlign: "left" }}>
            <div style={{ fontWeight: "800", fontSize: "13px", color: "#374151", marginBottom: "8px" }}>Round history:</div>
            {history.map((h, i) => {
              const t = teams.find(tm => tm.id === h.holderId);
              return (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px", fontSize: "13px" }}>
                  <span style={{ color: "#6B7280", fontWeight: "600" }}>Round {h.round}</span>
                  <span style={{ fontWeight: "800", color: t?.color.dark ?? "#374151" }}>🥔 {h.holderName} −{PENALTY_PTS}pts</span>
                </div>
              );
            })}
          </div>
        )}
        {round < TOTAL_ROUNDS ? (
          <button onClick={startNextRound} style={{ background: "linear-gradient(135deg,#EA580C,#F97316)", color: "white", border: "none", borderRadius: "16px", padding: "14px 40px", fontSize: "17px", fontWeight: "900", cursor: "pointer", boxShadow: "0 6px 20px rgba(249,115,22,0.4)" }}>
            ▶️ Start Round {round + 1}
          </button>
        ) : (
          <button onClick={() => setPhase("gameover")} style={{ background: "linear-gradient(135deg,#1E1B4B,#4338CA)", color: "white", border: "none", borderRadius: "16px", padding: "14px 40px", fontSize: "17px", fontWeight: "900", cursor: "pointer" }}>
            🏁 See Final Results
          </button>
        )}
      </div>
    );
  }

  if (phase === "gameover") {
    const penaltyCounts: Record<string | number, number> = {};
    teams.forEach(t => { penaltyCounts[t.id] = 0; });
    history.forEach(h => { penaltyCounts[h.holderId] = (penaltyCounts[h.holderId] || 0) + 1; });
    const sorted = [...teams].sort((a, b) => penaltyCounts[a.id] - penaltyCounts[b.id]);
    return (
      <div style={{ textAlign: "center", padding: "10px" }}>
        <div style={{ fontSize: "52px", marginBottom: "8px" }}>🥔</div>
        <div style={{ fontWeight: "900", fontSize: "24px", color: "#1E1B4B", marginBottom: "16px" }}>Game Over!</div>
        <div style={{ display: "grid", gridTemplateColumns: teamsGridCols(teams.length), gap: "10px", marginBottom: "20px" }}>
          {sorted.map(t => {
            const count = penaltyCounts[t.id] || 0;
            const isWorst = count === Math.max(...Object.values(penaltyCounts));
            return (
              <div key={t.id} style={{ background: isWorst ? "linear-gradient(135deg,#FEF2F2,#FEE2E2)" : t.color.light, border: `3px solid ${isWorst ? "#EF4444" : t.color.bg}`, borderRadius: "16px", padding: "14px", textAlign: "center" }}>
                <div style={{ fontSize: "28px", marginBottom: "4px" }}>{count === 0 ? "🏆" : isWorst ? "🥔" : "😬"}</div>
                <div style={{ fontWeight: "800", color: isWorst ? "#991B1B" : t.color.dark, fontSize: "14px", marginBottom: "4px" }}>{t.name}</div>
                <div style={{ fontSize: "12px", fontWeight: "700", color: "#6B7280" }}>Held potato {count}×</div>
                <div style={{ fontWeight: "900", color: isWorst ? "#DC2626" : "#374151", fontSize: "15px", marginTop: "4px" }}>−{count * PENALTY_PTS} pts</div>
              </div>
            );
          })}
        </div>
        <div style={{ background: "#F9FAFB", border: "2px solid #E5E7EB", borderRadius: "14px", padding: "12px", marginBottom: "20px", textAlign: "left" }}>
          <div style={{ fontWeight: "800", fontSize: "13px", color: "#374151", marginBottom: "8px" }}>Full history:</div>
          {history.map((h, i) => {
            const t = teams.find(tm => tm.id === h.holderId);
            return (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px", fontSize: "13px" }}>
                <span style={{ color: "#6B7280", fontWeight: "600" }}>Round {h.round}</span>
                <span style={{ fontWeight: "800", color: t?.color.dark ?? "#374151" }}>🥔 {h.holderName} −{PENALTY_PTS}pts</span>
              </div>
            );
          })}
        </div>
        <button onClick={onEnd} style={{ background: "linear-gradient(135deg,#F97316,#EF4444)", color: "white", border: "none", borderRadius: "16px", padding: "16px 48px", fontSize: "18px", fontWeight: "900", cursor: "pointer", boxShadow: "0 6px 24px rgba(249,115,22,0.4)" }}>🏁 End Game</button>
      </div>
    );
  }

  return (
    <div>
      <div style={{ background: "linear-gradient(135deg,#EA580C,#F97316)", borderRadius: "14px", padding: "12px 16px", marginBottom: "14px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
        <div style={{ color: "white" }}>
          <div style={{ fontWeight: "900", fontSize: "16px" }}>🥔 Round {round} / {TOTAL_ROUNDS}</div>
          <div style={{ fontSize: "12px", opacity: 0.8 }}>Pass it before time runs out!</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ width: "90px", height: "8px", background: "rgba(255,255,255,0.25)", borderRadius: "4px", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${roundTimePct}%`, background: "white", borderRadius: "4px", transition: "width 1s linear" }} />
          </div>
          <span style={{ color: "rgba(255,255,255,0.65)", fontSize: "11px", fontWeight: "700" }}>???</span>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "center", marginBottom: "12px" }}>
        <svg width={SVG_SIZE} height={SVG_SIZE} style={{ overflow: "visible" }}>
          <circle cx={CX} cy={CY} r={CIRCLE_R} fill="none" stroke="#E0E7FF" strokeWidth="2" strokeDasharray="6 4" />
          {teams.map((_, i) => {
            const from = teamPos[i], to = teamPos[(i + 1) % n];
            const mx = (from.x + to.x) / 2, my = (from.y + to.y) / 2;
            const dx = mx - CX, dy = my - CY, mag = Math.sqrt(dx * dx + dy * dy) || 1;
            const ax = CX + (dx / mag) * CIRCLE_R, ay = CY + (dy / mag) * CIRCLE_R;
            const ang = Math.atan2(to.y - from.y, to.x - from.x) * 180 / Math.PI;
            return <text key={i} x={ax} y={ay} textAnchor="middle" dominantBaseline="middle" fontSize="11" fill="#94A3B8" transform={`rotate(${ang},${ax},${ay})`}>›</text>;
          })}
          {teams.map((t, i) => {
            const pos = teamPos[i], isHolder = i === holderIdx;
            return (
              <g key={t.id}>
                <circle cx={pos.x} cy={pos.y} r={isHolder ? 33 : 27}
                  fill={isHolder ? t.color.bg : t.color.light} stroke={t.color.bg} strokeWidth={isHolder ? 3 : 2}
                  style={{ filter: isHolder ? `drop-shadow(0 0 9px ${t.color.bg}95)` : "none", transition: "all 0.4s" }} />
                <text x={pos.x} y={pos.y - (isHolder ? 5 : 3)} textAnchor="middle" dominantBaseline="middle"
                  fontSize={isHolder ? "13" : "11"} fontWeight="800" fill={isHolder ? "white" : t.color.dark}
                  style={{ userSelect: "none", pointerEvents: "none" }}>
                  {t.name.length > 7 ? t.name.slice(0, 6) + "…" : t.name}
                </text>
                {isHolder && <text x={pos.x} y={pos.y + 10} textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.85)" fontWeight="700" style={{ userSelect: "none" }}>HOLDING</text>}
              </g>
            );
          })}
          <g style={{ transition: passing ? "transform 0.65s cubic-bezier(0.34,1.56,0.64,1)" : "transform 0s" }} transform={`translate(${potatoX},${potatoY})`}>
            <circle r="20" fill="#F97316" opacity="0.12" />
            <text x="0" y="1" textAnchor="middle" dominantBaseline="middle" fontSize="24" style={{ userSelect: "none", filter: passing ? "drop-shadow(0 0 8px #F97316)" : "none" }}>🥔</text>
          </g>
        </svg>
      </div>

      <div style={{ background: "white", border: "2px solid #E0E7FF", borderRadius: "16px", padding: "18px", marginBottom: "14px" }}>
        {!showAnswer && (
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px" }}>
            <div style={{ position: "relative", width: "48px", height: "48px", flexShrink: 0 }}>
              <svg width="48" height="48" style={{ transform: "rotate(-90deg)" }}>
                <circle cx="24" cy="24" r="20" fill="none" stroke="#E5E7EB" strokeWidth="5" />
                <circle cx="24" cy="24" r="20" fill="none" stroke={qColor} strokeWidth="5"
                  strokeDasharray={`${2 * Math.PI * 20}`}
                  strokeDashoffset={`${2 * Math.PI * 20 * (1 - qTimePct / 100)}`}
                  strokeLinecap="round" style={{ transition: "stroke-dashoffset 1s linear,stroke 0.3s" }} />
              </svg>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "900", fontSize: "15px", color: qColor }}>{qTimeLeft}</div>
            </div>
            <div style={{ flex: 1, fontWeight: "700", color: "#374151", fontSize: "13px" }}>
              {holder.color.emoji} <strong>{holder.name}</strong> — answer now!<br />
              <span style={{ color: qColor, fontSize: "12px" }}>{qTimeLeft > 6 ? "⏱️ Take your time…" : qTimeLeft > 3 ? "⚡ Hurry!" : "🔴 Last seconds!"}</span>
            </div>
          </div>
        )}
        <div style={{ fontWeight: "900", fontSize: "clamp(17px,3vw,22px)", color: "#1E1B4B", lineHeight: 1.5, textAlign: "center", marginBottom: (showSpanish && q?.spanish) || showAnswer ? "10px" : "0" }}>
          {q?.prompt}
        </div>
        {showSpanish && q?.spanish && (
          <div style={{ textAlign: "center", marginBottom: showAnswer ? "10px" : "0" }}>
            <span style={{ display: "inline-block", background: "#FEF9C3", border: "1px solid #FCD34D", borderRadius: "8px", padding: "4px 12px", fontSize: "13px", fontWeight: "700", color: "#92400E" }}>
              🇪🇸 {q.spanish}
            </span>
          </div>
        )}
        {showAnswer && (
          <div style={{ background: "#F0F9FF", border: "2px solid #0EA5E9", borderRadius: "10px", padding: "10px 14px", marginTop: "4px", textAlign: "center" }}>
            <div style={{ fontSize: "11px", fontWeight: "800", color: "#0369A1", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.06em" }}>💡 Expected answer</div>
            <div style={{ fontWeight: "800", color: "#0C4A6E", fontSize: "16px" }}>{q?.answer}</div>
          </div>
        )}
      </div>

      {!showAnswer ? (
        <button onClick={revealAnswer} style={{ width: "100%", background: "#F8F7FF", color: "#4338CA", border: "2px solid #C4B5FD", borderRadius: "12px", padding: "13px", fontSize: "15px", fontWeight: "800", cursor: "pointer" }}>
          👁️ Reveal answer early
        </button>
      ) : (
        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={confirmPass} style={{ flex: 1, background: "linear-gradient(135deg,#16A34A,#22C55E)", color: "white", border: "none", borderRadius: "12px", padding: "14px 8px", fontSize: "14px", fontWeight: "900", cursor: "pointer", boxShadow: "0 4px 14px #22C55E40" }}>
            ✅ Answered in time<br /><span style={{ fontSize: "12px", opacity: 0.85 }}>Pass potato →</span>
          </button>
          <button onClick={confirmKeep} style={{ flex: 1, background: "linear-gradient(135deg,#DC2626,#EF4444)", color: "white", border: "none", borderRadius: "12px", padding: "14px 8px", fontSize: "14px", fontWeight: "900", cursor: "pointer", boxShadow: "0 4px 14px #EF444440" }}>
            ❌ Too slow / wrong<br /><span style={{ fontSize: "12px", opacity: 0.85 }}>Keep potato 🥔</span>
          </button>
        </div>
      )}
    </div>
  );
}
