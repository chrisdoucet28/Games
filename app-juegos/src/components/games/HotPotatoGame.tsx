import { useState, useEffect, useRef, useMemo } from "react";
import type { GameProps } from "../../types";
import { teamsGridCols, GAME_MODES } from "../../data/constants";
import { makeSoloCpuTeam } from "../../lib/soloOpponent";
import { HowToPlayModal } from "../shared/HowToPlayModal";
import { HOTPOTATO_TUTORIAL_STEPS } from "../../data/tutorials/hotpotato";

const GM = GAME_MODES.find(g => g.id === "hotpotato")!;

const TURN_SECONDS_OPTIONS = [15, 20, 25, 30];
const ROUND_SECONDS_MULT = 4;
// How long the CPU realistically "holds" the potato before passing it back — standing in for
// the fact it can't actually answer a real question out loud.
const CPU_HOLD_MS_MIN = 1800;
const CPU_HOLD_MS_MAX = 4500;

const AMBIENT_BITS = Array.from({ length: 12 }, (_, i) => ({
  left: (i * 41) % 100,
  top: (i * 29) % 100,
  size: 16 + (i % 3) * 6,
  delay: (i % 6) * 0.5,
  dur: 3 + (i % 4) * 0.8,
  emoji: i % 5 === 0 ? "✨" : i % 4 === 0 ? "💨" : "🥔",
}));

const STYLE_TAG = (
  <style>{`
    @keyframes drift{0%{transform:translateY(0) rotate(0deg);opacity:0.18}50%{opacity:0.32}100%{transform:translateY(-22px) rotate(25deg);opacity:0.18}}
    @keyframes potatoWobbleCalm{0%,100%{transform:rotate(-4deg)}50%{transform:rotate(4deg)}}
    @keyframes potatoWobbleWarn{0%,100%{transform:rotate(-8deg) scale(1.02)}50%{transform:rotate(8deg) scale(1.06)}}
    @keyframes potatoWobbleCritical{0%,100%{transform:rotate(-14deg) scale(1.08)}25%{transform:rotate(10deg) scale(1.12)}50%{transform:rotate(-10deg) scale(1.08)}75%{transform:rotate(14deg) scale(1.12)}}
    @keyframes potatoTumble{0%{transform:rotate(0deg) scale(1)}50%{transform:rotate(360deg) scale(1.3)}100%{transform:rotate(720deg) scale(1)}}
    @keyframes trailFade{0%{opacity:0.7;transform:scale(1)}100%{opacity:0;transform:scale(0.4) translateX(-10px)}}
    @keyframes figureBob{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}
    @keyframes figureThrow{0%{transform:rotate(0deg) scale(1)}30%{transform:rotate(-18deg) scale(1.05)}60%{transform:rotate(22deg) scale(1.15)}100%{transform:rotate(0deg) scale(1)}}
    @keyframes figureCatch{0%{transform:scale(1)}40%{transform:scale(1.35) rotate(-8deg)}70%{transform:scale(0.9) rotate(6deg)}100%{transform:scale(1) rotate(0deg)}}
    @keyframes sweatDrop{0%{opacity:0;transform:translateY(-4px)}30%{opacity:1}100%{opacity:0;transform:translateY(10px)}}
    @keyframes cardShake{0%,100%{transform:translateX(0)}20%{transform:translateX(-3px) rotate(-0.4deg)}40%{transform:translateX(3px) rotate(0.4deg)}60%{transform:translateX(-2px)}80%{transform:translateX(2px)}}
    @keyframes roundPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.09)}}
    @keyframes burstPop{0%{transform:translate(-50%,-50%) scale(0.3);opacity:1}60%{transform:translate(-50%,-50%) scale(1.4);opacity:1}100%{transform:translate(-50%,-50%) scale(1.8);opacity:0}}
    @keyframes burstBit{0%{opacity:1;transform:translate(-50%,-50%) rotate(var(--a)) translateY(0) scale(1)}100%{opacity:0;transform:translate(-50%,-50%) rotate(var(--a)) translateY(-70px) scale(1.3)}}
    .hp-btn:hover{transform:translateY(-2px) scale(1.02)}
    .hp-btn:active{transform:translateY(0) scale(0.97)}
  `}</style>
);

function ChaosBackdrop() {
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
      {AMBIENT_BITS.map((b, i) => (
        <div key={i} style={{
          position: "absolute", left: `${b.left}%`, top: `${b.top}%`, fontSize: `${b.size}px`,
          animation: `drift ${b.dur}s ease-in-out infinite ${b.delay}s`,
        }}>{b.emoji}</div>
      ))}
    </div>
  );
}

export function HotPotatoGame({ questions, teams: propTeams, onUpdateScore, onEnd, level, forceFinalRef }: GameProps) {
  // Solo play makes the CPU a real second holder — a genuine participant in the pass cycle, not
  // a passive prop. It can't actually answer a real question, so it just holds the potato for a
  // randomized, realistic stretch before passing it back (see the effect below).
  const isSolo = propTeams.length === 1;
  const cpuRef = useRef(isSolo ? makeSoloCpuTeam() : null);
  const [cpuScore, setCpuScore] = useState(0);
  // Memoized so `teams` is referentially stable across renders when nothing has actually
  // changed — effects in this file depend on `teams` by reference, and a fresh array literal
  // every render would make them re-fire (and re-setState) forever.
  const teams = useMemo(
    () => (isSolo ? [propTeams[0], { ...cpuRef.current!, score: cpuScore }] : propTeams),
    [isSolo, propTeams, cpuScore]
  );
  const updateScore = (id: string | number, delta: number) => {
    if (isSolo && id === cpuRef.current?.id) { setCpuScore(s => s + delta); }
    else { onUpdateScore(id, delta); }
  };

  const showSpanish = level === "A1" || level === "A2";
  const STARTING_BANK = 100;
  const TOTAL_ROUNDS = 5;
  const PENALTY_PTS = 30;

  const [turnSeconds, setTurnSeconds] = useState(TURN_SECONDS_OPTIONS[0]);
  const Q_SECONDS = turnSeconds;
  const ROUND_SECONDS = turnSeconds * ROUND_SECONDS_MULT;

  const [phase, setPhase] = useState<"intro" | "play" | "exploding" | "roundend" | "gameover">("intro");
  const [showHowTo, setShowHowTo] = useState(false);

  useEffect(() => {
    if (!forceFinalRef) return;
    forceFinalRef.current = phase === "gameover" ? null : () => { setPhase("gameover"); return true; };
    return () => { if (forceFinalRef) forceFinalRef.current = null; };
  }, [forceFinalRef, phase]);
  const [round, setRound] = useState(1);
  const [qi, setQi] = useState(0);
  const [holderIdx, setHolderIdx] = useState(0);
  const [roundTimeLeft, setRoundTimeLeft] = useState(ROUND_SECONDS);
  const [qTimeLeft, setQTimeLeft] = useState(Q_SECONDS);
  const [showAnswer, setShowAnswer] = useState(false);
  const [passing, setPassing] = useState(false);
  const [justCaught, setJustCaught] = useState(false);
  const [passId, setPassId] = useState(0);
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
      updateScore(teams[holderIdxRef.current].id, -PENALTY_PTS);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, round, teams]);

  // CPU can't actually answer a real question — it just holds the potato for a randomized,
  // realistic stretch before passing it back, reusing the exact same confirmPass() a human's
  // "Answered in time" click would trigger. Must stay above every early return below (Rules of
  // Hooks).
  useEffect(() => {
    if (!isSolo || phase !== "play" || teams[holderIdx]?.id !== cpuRef.current?.id) return;
    const holdMs = CPU_HOLD_MS_MIN + Math.random() * (CPU_HOLD_MS_MAX - CPU_HOLD_MS_MIN);
    const timer = setTimeout(() => {
      if (!roundEndedRef.current) confirmPass();
    }, holdMs);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSolo, phase, holderIdx]);

  useEffect(() => {
    roundTimeRef.current = ROUND_SECONDS;
    roundEndedRef.current = false;
    timerPaused.current = false;
    setRoundTimeLeft(ROUND_SECONDS);
    // ROUND_SECONDS depends on turnSeconds, which can only change on the intro screen
    // (before "round" ever changes) — including it here keeps roundTimeLeft in sync if
    // the teacher picks a duration after this effect's first mount-time run.
  }, [round, ROUND_SECONDS]);

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
          setPhase("exploding");
          setTimeout(() => setPhase("roundend"), 750);
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
    setPassId(id => id + 1);
    setTimeout(() => {
      setPassing(false);
      setHolderIdx(i => (i + 1) % teams.length);
      setJustCaught(true);
      setTimeout(() => setJustCaught(false), 420);
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
  const roundCritical = roundTimePct <= 20;
  const roundWarn = roundTimePct <= 45;
  const roundMins = Math.floor(roundTimeLeft / 60);
  const roundSecs = roundTimeLeft % 60;
  const roundTimeLabel = `${roundMins}:${String(roundSecs).padStart(2, "0")}`;
  const qTimePct = (qTimeLeft / Q_SECONDS) * 100;
  const qColor = qTimeLeft > 6 ? "#22C55E" : qTimeLeft > 3 ? "#F59E0B" : "#EF4444";
  const potatoWobble = qTimeLeft > 6 ? "potatoWobbleCalm 1.8s ease-in-out infinite" : qTimeLeft > 3 ? "potatoWobbleWarn 0.6s ease-in-out infinite" : "potatoWobbleCritical 0.15s linear infinite";
  const holder = teams[holderIdx];
  const q = questions[qi % Math.max(questions.length, 1)];

  const [showQPreview, setShowQPreview] = useState(false);

  const arenaStyle: React.CSSProperties = {
    margin: "-20px", padding: "20px", borderRadius: "20px", position: "relative", overflow: "hidden",
    background: "linear-gradient(160deg,#FED7AA 0%,#FB923C 45%,#EA580C 100%)",
  };

  // Tutorial mockup: src/data/tutorials/hotpotato.tsx — update if this intro's rules text changes.
  if (phase === "intro") return (
    <div style={{ ...arenaStyle, textAlign: "center" }}>
      <ChaosBackdrop />
      {STYLE_TAG}
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ background: "linear-gradient(135deg,#EA580C,#F97316)", borderRadius: "20px", padding: "28px 24px", marginBottom: "10px", position: "relative", color: "white", maxWidth: "520px", margin: "0 auto 10px", boxShadow: "0 8px 30px rgba(124,45,18,0.35)" }}>
          <div style={{ fontSize: "40px", marginBottom: "10px", display: "inline-block", animation: "potatoWobbleCalm 1.8s ease-in-out infinite" }}>🥔</div>
          <div style={{ fontWeight: "900", fontSize: "20px", marginBottom: "10px" }}>Hot Potato</div>
          <div style={{ fontSize: "15px", lineHeight: 1.8, opacity: 0.95 }}>
            Each team starts with <strong>{STARTING_BANK} pts</strong> for this game.<br />
            <strong>{TOTAL_ROUNDS} rounds × {ROUND_SECONDS} seconds.</strong> One team holds the potato.<br />
            Each team has <strong>{Q_SECONDS} seconds</strong> to answer — timer auto-reveals.<br />
            Teacher judges: <strong>✅ Answered in time → Pass it on!</strong><br />
            <strong>❌ Too slow or wrong → Keep the potato!</strong><br />
            Whoever holds it at 0 <strong>loses {PENALTY_PTS} pts 🔥</strong>
          </div>
          <div style={{ position: "absolute", bottom: "-14px", left: "50%", transform: "translateX(-50%)", width: 0, height: 0, borderLeft: "14px solid transparent", borderRight: "14px solid transparent", borderTop: "14px solid #F97316" }} />
        </div>
        <div style={{ marginTop: "24px", marginBottom: "16px", fontSize: "14px", color: "#7C2D12", fontWeight: "700" }}>
          Pass the potato as fast as possible — the clock is always ticking!
        </div>

        <div style={{ marginBottom: "20px" }}>
          <button
            onClick={() => setShowQPreview(v => !v)}
            className="hp-btn"
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

        <div style={{ marginBottom: "24px" }}>
          <div style={{ fontSize: "13px", fontWeight: "700", color: "#7C2D12", marginBottom: "8px" }}>⏱️ Answer time per turn (round time is always {ROUND_SECONDS_MULT}×):</div>
          <div style={{ display: "flex", gap: "8px", justifyContent: "center", flexWrap: "wrap" }}>
            {TURN_SECONDS_OPTIONS.map(secs => (
              <button key={secs} onClick={() => setTurnSeconds(secs)} className="hp-btn" style={{
                background: turnSeconds === secs ? "linear-gradient(135deg,#EA580C,#F97316)" : "white",
                color: turnSeconds === secs ? "white" : "#7C2D12",
                border: `2px solid ${turnSeconds === secs ? "#EA580C" : "#FED7AA"}`,
                borderRadius: "12px", padding: "10px 16px", cursor: "pointer",
                fontWeight: "800", fontSize: "14px", minWidth: "78px", transition: "all 0.15s"
              }}>
                {secs}s
                <div style={{ fontSize: "10px", fontWeight: "700", opacity: 0.8, marginTop: "2px" }}>round: {secs * ROUND_SECONDS_MULT}s</div>
              </button>
            ))}
          </div>
        </div>

        <button onClick={() => setShowHowTo(true)} className="hp-btn" style={{ display: "block", margin: "0 auto 14px", background: "transparent", color: GM.color, border: `2px solid ${GM.color}88`, borderRadius: "12px", padding: "10px 24px", fontSize: "14px", fontWeight: "800", cursor: "pointer" }}>
          ❓ How to Play
        </button>
        {showHowTo && (
          <HowToPlayModal
            gameName={GM.name} gameIcon={GM.icon} accentColor={GM.color}
            steps={HOTPOTATO_TUTORIAL_STEPS}
            onClose={() => setShowHowTo(false)}
          />
        )}
        <button onClick={() => {
          if (!seededStartRef.current) {
            teams.forEach(team => updateScore(team.id, STARTING_BANK));
            seededStartRef.current = true;
          }
          setPhase("play");
        }} className="hp-btn" style={{ background: "linear-gradient(135deg,#EA580C,#F97316)", color: "white", border: "none", borderRadius: "16px", padding: "16px 48px", fontSize: "19px", fontWeight: "900", cursor: "pointer", boxShadow: "0 6px 24px rgba(249,115,22,0.4)", transition: "transform 0.15s ease" }}>
          🥔 Start Round 1!
        </button>
      </div>
    </div>
  );

  if (phase === "roundend") {
    const lastEntry = history[history.length - 1];
    return (
      <div style={{ ...arenaStyle, textAlign: "center", padding: "20px 20px 30px" }}>
        <ChaosBackdrop />
        {STYLE_TAG}
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: "52px", marginBottom: "8px" }}>💥</div>
          <div style={{ fontWeight: "900", fontSize: "22px", color: "white", textShadow: "0 2px 6px rgba(124,45,18,0.5)", marginBottom: "6px" }}>Round {round} Over!</div>
          <div style={{ background: "white", border: "3px solid #EF4444", borderRadius: "16px", padding: "16px", marginBottom: "16px", boxShadow: "0 6px 20px rgba(0,0,0,0.15)" }}>
            <div style={{ fontWeight: "800", fontSize: "16px", color: "#991B1B", marginBottom: "4px" }}>
              🥔 {lastEntry?.holderName} was holding the potato!
            </div>
            <div style={{ fontWeight: "900", fontSize: "24px", color: "#DC2626" }}>−{PENALTY_PTS} pts</div>
          </div>
          {history.length > 0 && (
            <div style={{ background: "rgba(255,255,255,0.92)", border: "2px solid #FED7AA", borderRadius: "14px", padding: "12px", marginBottom: "16px", textAlign: "left" }}>
              <div style={{ fontWeight: "800", fontSize: "13px", color: "#7C2D12", marginBottom: "8px" }}>Round history:</div>
              {history.map((h, i) => {
                const t = teams.find(tm => tm.id === h.holderId);
                return (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px", fontSize: "13px" }}>
                    <span style={{ color: "#78350F", fontWeight: "600" }}>Round {h.round}</span>
                    <span style={{ fontWeight: "800", color: t?.color.dark ?? "#374151" }}>🥔 {h.holderName} −{PENALTY_PTS}pts</span>
                  </div>
                );
              })}
            </div>
          )}
          {round < TOTAL_ROUNDS ? (
            <button onClick={startNextRound} className="hp-btn" style={{ background: "white", color: "#EA580C", border: "none", borderRadius: "16px", padding: "14px 40px", fontSize: "17px", fontWeight: "900", cursor: "pointer", boxShadow: "0 6px 20px rgba(0,0,0,0.2)", transition: "transform 0.15s ease" }}>
              ▶️ Start Round {round + 1}
            </button>
          ) : (
            <button onClick={() => setPhase("gameover")} className="hp-btn" style={{ background: "#1E1B4B", color: "white", border: "none", borderRadius: "16px", padding: "14px 40px", fontSize: "17px", fontWeight: "900", cursor: "pointer", transition: "transform 0.15s ease" }}>
              🏁 See Final Results
            </button>
          )}
        </div>
      </div>
    );
  }

  if (phase === "gameover") {
    const penaltyCounts: Record<string | number, number> = {};
    teams.forEach(t => { penaltyCounts[t.id] = 0; });
    history.forEach(h => { penaltyCounts[h.holderId] = (penaltyCounts[h.holderId] || 0) + 1; });
    const sorted = [...teams].sort((a, b) => penaltyCounts[a.id] - penaltyCounts[b.id]);
    return (
      <div style={{ ...arenaStyle, textAlign: "center", padding: "20px 20px 30px" }}>
        <ChaosBackdrop />
        {STYLE_TAG}
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: "52px", marginBottom: "8px" }}>🥔</div>
          <div style={{ fontWeight: "900", fontSize: "24px", color: "white", textShadow: "0 2px 6px rgba(124,45,18,0.5)", marginBottom: "16px" }}>Game Over!</div>
          <div style={{ display: "grid", gridTemplateColumns: teamsGridCols(teams.length), gap: "10px", marginBottom: "20px" }}>
            {sorted.map(t => {
              const count = penaltyCounts[t.id] || 0;
              const isWorst = count === Math.max(...Object.values(penaltyCounts));
              return (
                <div key={t.id} style={{ background: isWorst ? "linear-gradient(135deg,#FEF2F2,#FEE2E2)" : "white", border: `3px solid ${isWorst ? "#EF4444" : t.color.bg}`, borderRadius: "16px", padding: "14px", textAlign: "center", boxShadow: "0 4px 14px rgba(0,0,0,0.12)" }}>
                  <div style={{ fontSize: "28px", marginBottom: "4px" }}>{count === 0 ? "🏆" : isWorst ? "🥔" : "😬"}</div>
                  <div style={{ fontWeight: "800", color: isWorst ? "#991B1B" : t.color.dark, fontSize: "14px", marginBottom: "4px" }}>{t.mascot ?? t.color.emoji} {t.name}</div>
                  <div style={{ fontSize: "12px", fontWeight: "700", color: "#6B7280" }}>Held potato {count}×</div>
                  <div style={{ fontWeight: "900", color: isWorst ? "#DC2626" : "#374151", fontSize: "15px", marginTop: "4px" }}>−{count * PENALTY_PTS} pts</div>
                </div>
              );
            })}
          </div>
          <div style={{ background: "rgba(255,255,255,0.92)", border: "2px solid #FED7AA", borderRadius: "14px", padding: "12px", marginBottom: "20px", textAlign: "left" }}>
            <div style={{ fontWeight: "800", fontSize: "13px", color: "#7C2D12", marginBottom: "8px" }}>Full history:</div>
            {history.map((h, i) => {
              const t = teams.find(tm => tm.id === h.holderId);
              return (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px", fontSize: "13px" }}>
                  <span style={{ color: "#78350F", fontWeight: "600" }}>Round {h.round}</span>
                  <span style={{ fontWeight: "800", color: t?.color.dark ?? "#374151" }}>🥔 {h.holderName} −{PENALTY_PTS}pts</span>
                </div>
              );
            })}
          </div>
          <button onClick={onEnd} className="hp-btn" style={{ background: "white", color: "#EA580C", border: "none", borderRadius: "16px", padding: "16px 48px", fontSize: "18px", fontWeight: "900", cursor: "pointer", boxShadow: "0 6px 24px rgba(0,0,0,0.2)", transition: "transform 0.15s ease" }}>🏁 End Game</button>
        </div>
      </div>
    );
  }

  const isExploding = phase === "exploding";

  return (
    <div style={arenaStyle}>
      <ChaosBackdrop />
      {STYLE_TAG}
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{
          background: "linear-gradient(135deg,#EA580C,#F97316)", borderRadius: "14px", padding: "12px 16px", marginBottom: "14px",
          boxShadow: "0 4px 16px rgba(124,45,18,0.3)",
          animation: !isExploding && ((qTimeLeft <= 3 && !showAnswer) || roundCritical) ? "cardShake 0.4s ease-in-out infinite" : "none",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
            <div style={{ color: "white" }}>
              <div style={{ fontWeight: "900", fontSize: "16px" }}>🥔 Round {round} / {TOTAL_ROUNDS}</div>
              <div style={{ fontSize: "12px", opacity: 0.85 }}>Pass it before time runs out!</div>
            </div>
            <div style={{
              display: "flex", alignItems: "center", gap: "7px",
              background: roundCritical ? "#B91C1C" : roundWarn ? "rgba(0,0,0,0.28)" : "rgba(0,0,0,0.2)",
              borderRadius: "999px", padding: "7px 16px",
              boxShadow: roundCritical ? "0 0 0 2px rgba(255,255,255,0.5)" : "none",
              animation: !isExploding && roundCritical ? "roundPulse 0.6s ease-in-out infinite" : "none",
            }}>
              <span style={{ fontSize: "18px" }}>⏳</span>
              <span style={{ color: "white", fontWeight: "900", fontSize: "22px", fontVariantNumeric: "tabular-nums", letterSpacing: "0.02em" }}>{roundTimeLabel}</span>
            </div>
          </div>
          <div style={{ marginTop: "10px", height: "11px", background: "rgba(255,255,255,0.25)", borderRadius: "6px", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${roundTimePct}%`, background: roundCritical ? "#FCA5A5" : "white", borderRadius: "6px", transition: "width 1s linear, background 0.3s" }} />
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "center", marginBottom: "12px", position: "relative" }}>
          <svg width={SVG_SIZE} height={SVG_SIZE} style={{ overflow: "visible" }}>
            <circle cx={CX} cy={CY} r={CIRCLE_R} fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeDasharray="6 4" />
            {teams.map((_, i) => {
              const from = teamPos[i], to = teamPos[(i + 1) % n];
              const mx = (from.x + to.x) / 2, my = (from.y + to.y) / 2;
              const dx = mx - CX, dy = my - CY, mag = Math.sqrt(dx * dx + dy * dy) || 1;
              const ax = CX + (dx / mag) * CIRCLE_R, ay = CY + (dy / mag) * CIRCLE_R;
              const ang = Math.atan2(to.y - from.y, to.x - from.x) * 180 / Math.PI;
              return <text key={i} x={ax} y={ay} textAnchor="middle" dominantBaseline="middle" fontSize="11" fill="rgba(124,45,18,0.5)" transform={`rotate(${ang},${ax},${ay})`}>›</text>;
            })}
            {teams.map((t, i) => {
              const pos = teamPos[i], isHolder = i === holderIdx;
              const isThrowing = passing && i === holderIdx;
              const isCatching = justCaught && i === holderIdx;
              return (
                <g key={t.id}>
                  <circle cx={pos.x} cy={pos.y} r={isHolder ? 33 : 27}
                    fill={isHolder ? t.color.bg : "white"} stroke={t.color.bg} strokeWidth={isHolder ? 3 : 2}
                    style={{ filter: isHolder ? `drop-shadow(0 0 9px ${t.color.bg}95)` : "none", transition: "all 0.4s" }} />
                  <text x={pos.x} y={pos.y - (isHolder ? 5 : 3)} textAnchor="middle" dominantBaseline="middle"
                    fontSize={isHolder ? "13" : "11"} fontWeight="800" fill={isHolder ? "white" : t.color.dark}
                    style={{ userSelect: "none", pointerEvents: "none" }}>
                    {t.name.length > 7 ? t.name.slice(0, 6) + "…" : t.name}
                  </text>
                  {isHolder && <text x={pos.x} y={pos.y + 10} textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.85)" fontWeight="700" style={{ userSelect: "none" }}>HOLDING</text>}
                  {/* little figure below each position */}
                  <text
                    x={pos.x} y={pos.y + (isHolder ? 52 : 44)} textAnchor="middle" fontSize="18"
                    style={{
                      userSelect: "none", transformBox: "fill-box", transformOrigin: "center",
                      animation: isThrowing ? "figureThrow 0.5s ease-out" : isCatching ? "figureCatch 0.42s ease-out" : `figureBob 2s ease-in-out infinite ${i * 0.2}s`,
                    }}
                  >{t.mascot ?? "🧍"}</text>
                </g>
              );
            })}

            {!isExploding && (
              <g style={{ transition: passing ? "transform 0.65s cubic-bezier(0.34,1.56,0.64,1)" : "transform 0s" }} transform={`translate(${potatoX},${potatoY})`}>
                <circle r="22" fill="#F97316" opacity="0.15" />
                {passing && <text key={"trail" + passId} x="-16" y="-4" fontSize="16" style={{ animation: "trailFade 0.5s ease-out forwards" }}>💨</text>}
                <g key={passing ? "throwing" + passId : "idle"} style={{
                  transformBox: "fill-box", transformOrigin: "center",
                  animation: passing ? "potatoTumble 0.65s linear" : potatoWobble,
                }}>
                  <text x="0" y="1" textAnchor="middle" dominantBaseline="middle" fontSize="26" style={{ userSelect: "none", filter: passing ? "drop-shadow(0 0 8px #F97316)" : "none" }}>🥔</text>
                  {!passing && qTimeLeft <= 3 && <text x="15" y="-12" fontSize="13" style={{ animation: "sweatDrop 0.9s ease-in-out infinite" }}>💦</text>}
                </g>
              </g>
            )}

            {isExploding && (
              <g transform={`translate(${teamPos[holderIdx].x},${teamPos[holderIdx].y})`}>
                <circle r="30" fill="#FCD34D" style={{ animation: "burstPop 0.7s ease-out forwards" }} />
                {[0, 45, 90, 135, 180, 225, 270, 315].map(a => (
                  <text key={a} x="0" y="0" fontSize="18" textAnchor="middle" style={{ ["--a" as any]: `${a}deg`, animation: "burstBit 0.7s ease-out forwards" }}>
                    {a % 90 === 0 ? "💥" : "🥔"}
                  </text>
                ))}
              </g>
            )}
          </svg>
        </div>

        <div style={{ background: "white", border: "2px solid #FED7AA", borderRadius: "16px", padding: "18px", marginBottom: "14px", boxShadow: "0 6px 20px rgba(124,45,18,0.15)" }}>
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
                {holder.mascot ?? holder.color.emoji} <strong>{holder.name}</strong> — answer now!<br />
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
          <button onClick={revealAnswer} className="hp-btn" style={{ width: "100%", background: "white", color: "#4338CA", border: "2px solid #C4B5FD", borderRadius: "12px", padding: "13px", fontSize: "15px", fontWeight: "800", cursor: "pointer", transition: "transform 0.15s ease" }}>
            👁️ Reveal answer early
          </button>
        ) : (
          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={confirmPass} className="hp-btn" style={{ flex: 1, background: "linear-gradient(135deg,#16A34A,#22C55E)", color: "white", border: "none", borderRadius: "12px", padding: "14px 8px", fontSize: "14px", fontWeight: "900", cursor: "pointer", boxShadow: "0 4px 14px #22C55E40", transition: "transform 0.15s ease" }}>
              ✅ Answered in time<br /><span style={{ fontSize: "12px", opacity: 0.85 }}>Pass potato →</span>
            </button>
            <button onClick={confirmKeep} className="hp-btn" style={{ flex: 1, background: "linear-gradient(135deg,#DC2626,#EF4444)", color: "white", border: "none", borderRadius: "12px", padding: "14px 8px", fontSize: "14px", fontWeight: "900", cursor: "pointer", boxShadow: "0 4px 14px #EF444440", transition: "transform 0.15s ease" }}>
              ❌ Too slow / wrong<br /><span style={{ fontSize: "12px", opacity: 0.85 }}>Keep potato 🥔</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
