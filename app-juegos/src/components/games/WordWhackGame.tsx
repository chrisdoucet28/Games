import { useState, useRef, useEffect } from "react";
import type { GameProps, QuestionData } from "../../types";
import { useTurnTimer } from "../../hooks/useTurnTimer";
import { TurnTimerBar } from "../shared/TurnTimerBar";
import { teamsGridCols, GAME_MODES } from "../../data/constants";
import { denseRank, medalForRank } from "../../utils/ranking";
import { HowToPlayModal } from "../shared/HowToPlayModal";
import { WHACK_TUTORIAL_STEPS } from "../../data/tutorials/whack";

const GM = GAME_MODES.find(g => g.id === "whack")!;

const TOTAL_HOLES = 6;
const TURN_SECONDS = 90;
const BASE_HIT_PTS = 20;
const COMBO_STEP = 5;
const MAX_COMBO_BONUS = 40;

// Difficulty only changes how long each mole stays up before ducking — the 90s turn length
// never changes. Each mode still ramps faster as the clock runs down (t>60/t>30/t>10/else),
// just calibrated to a different overall pace. "Hard" is deliberately still a little gentler
// than the original single-speed version this replaced.
type Difficulty = "easy" | "medium" | "hard";
const DIFFICULTY_OPTIONS: Difficulty[] = ["easy", "medium", "hard"];
const DUCK_MS: Record<Difficulty, [number, number, number, number]> = {
  easy: [5300, 4500, 3900, 3300],
  medium: [4400, 3700, 3100, 2500],
  hard: [4000, 3300, 2600, 2100],
};

type ParsedMCQ = { prompt: string; choices: string[]; correctIdx: number };

// "choose correct grammar" content already embeds its options in the question text itself,
// e.g. "'___ you ever tried sushi?' (Have/Did/Do)" — parsing that out means the entire existing
// pool becomes mole content for free, no new authoring needed.
function parseChoices(q: QuestionData): ParsedMCQ | null {
  const text = q.question || "";
  const m = /\(([^)]+)\)\s*$/.exec(text);
  if (!m) return null;
  const raw = m[1];
  if (/\bor\b/i.test(raw)) return null; // skip compound multi-blank "X/Y or A/B" patterns — too messy for moles
  const parts = raw.split("/").map(s => s.trim()).filter(Boolean);
  if (parts.length < 2 || parts.length > 4) return null;
  const ans = (q.answer || "").trim().toLowerCase();
  const correctIdx = parts.findIndex(p => p.toLowerCase() === ans);
  if (correctIdx === -1) return null;
  const prompt = text.slice(0, m.index).trim();
  if (!prompt) return null;
  return { prompt, choices: parts, correctIdx };
}

type Mole = { holeIdx: number; text: string; isCorrect: boolean; key: number };
type Fx = { holeIdx: number; kind: "hit" | "miss"; key: number };

const AMBIENT_BITS = Array.from({ length: 10 }, (_, i) => ({
  left: (i * 41) % 100,
  top: (i * 23) % 100,
  size: 10 + (i % 3) * 4,
  dur: 4 + (i % 5),
  delay: (i % 6) * 0.4,
  emoji: ["✨", "⭐", "💫"][i % 3],
}));

const STYLE_TAG = (
  <style>{`
    @keyframes wwDrift{0%{transform:translateY(0) rotate(0deg);opacity:0.15}50%{opacity:0.4}100%{transform:translateY(-36px) rotate(20deg);opacity:0.15}}
    @keyframes wwPopUp{0%{transform:translateY(30px) scale(0.5);opacity:0}60%{transform:translateY(-4px) scale(1.08);opacity:1}100%{transform:translateY(0) scale(1);opacity:1}}
    @keyframes wwDuckDown{0%{transform:translateY(0) scale(1);opacity:1}100%{transform:translateY(30px) scale(0.6);opacity:0}}
    @keyframes wwHitBurst{0%{transform:scale(0.3);opacity:1}60%{transform:scale(1.6);opacity:0.9}100%{transform:scale(2);opacity:0}}
    @keyframes wwBonk{0%,100%{transform:translate(0,0) rotate(0deg)}25%{transform:translate(-3px,1px) rotate(-8deg)}50%{transform:translate(3px,-1px) rotate(8deg)}75%{transform:translate(-2px,1px) rotate(-4deg)}}
    @keyframes wwCountPulse{0%{transform:scale(0.5);opacity:0}50%{transform:scale(1.2);opacity:1}100%{transform:scale(1);opacity:1}}
    @keyframes wwComboGlow{0%,100%{filter:brightness(1)}50%{filter:brightness(1.4)}}
    @keyframes wwShine{0%,100%{opacity:0.5}50%{opacity:0.9}}
    .ww-btn:hover:not(:disabled){transform:translateY(-2px) scale(1.02);filter:brightness(1.08)}
    .ww-btn:active:not(:disabled){transform:translateY(0) scale(0.97)}
    .ww-mole:hover{filter:brightness(1.15)}
    .ww-mole:active{filter:brightness(0.85)}
  `}</style>
);

function AmbientBackdrop() {
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
      {AMBIENT_BITS.map((b, i) => (
        <div key={i} style={{ position: "absolute", left: `${b.left}%`, top: `${b.top}%`, fontSize: `${b.size}px`, animation: `wwDrift ${b.dur}s ease-in-out infinite ${b.delay}s` }}>{b.emoji}</div>
      ))}
    </div>
  );
}

export function WordWhackGame({ questions, teams, onUpdateScore, onEnd, forceFinalRef }: GameProps) {
  const pool = useRef((() => {
    const mcqOnly = questions.filter(q => q.type === "choose correct grammar");
    const parsedMcq = mcqOnly.map(parseChoices).filter((p): p is ParsedMCQ => p !== null);
    const finalPool = parsedMcq.length >= 4
      ? parsedMcq
      : questions.map(parseChoices).filter((p): p is ParsedMCQ => p !== null);
    return [...finalPool].sort(() => Math.random() - 0.5);
  })()).current;

  const [phase, setPhase] = useState<"intro" | "countdown" | "playing" | "turn-end" | "final">("intro");
  const [showHowTo, setShowHowTo] = useState(false);

  useEffect(() => {
    if (!forceFinalRef) return;
    forceFinalRef.current = phase === "final" ? null : () => { setPhase("final"); return true; };
    return () => { if (forceFinalRef) forceFinalRef.current = null; };
  }, [forceFinalRef, phase]);
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [teamIdx, setTeamIdx] = useState(0);
  const [countdown, setCountdown] = useState(3);
  const [moles, setMoles] = useState<Mole[]>([]);
  const [prompt, setPrompt] = useState("");
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [turnScore, setTurnScore] = useState(0);
  const [fx, setFx] = useState<Fx | null>(null);
  const [finalScores, setFinalScores] = useState<Record<string | number, number>>({});

  const fxIdRef = useRef(0);
  const roundTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const roundIdxRef = useRef(0);
  const comboRef = useRef(0);
  const bestComboRef = useRef(0);
  const turnScoreRef = useRef(0);
  const turnTimeLeftRef = useRef(TURN_SECONDS);

  const activeTeam = teams[teamIdx];

  const endTurn = () => {
    if (roundTimerRef.current) clearTimeout(roundTimerRef.current);
    setMoles([]);
    const finalTurnScore = turnScoreRef.current;
    if (finalTurnScore > 0) onUpdateScore(activeTeam.id, finalTurnScore);
    setFinalScores(prev => ({ ...prev, [activeTeam.id]: finalTurnScore }));
    setPhase("turn-end");
  };

  const { timeLeft: turnTimeLeft } = useTurnTimer(TURN_SECONDS, phase === "playing", endTurn, teamIdx);
  useEffect(() => { turnTimeLeftRef.current = turnTimeLeft; }, [turnTimeLeft]);

  const spawnFx = (holeIdx: number, kind: "hit" | "miss") => {
    const key = fxIdRef.current++;
    setFx({ holeIdx, kind, key });
    setTimeout(() => setFx(prev => (prev?.key === key ? null : prev)), 500);
  };

  const spawnRound = () => {
    if (roundTimerRef.current) clearTimeout(roundTimerRef.current);
    if (!pool.length) return;
    const idx = roundIdxRef.current % pool.length;
    roundIdxRef.current += 1;
    const item = pool[idx];
    const holeIndices = Array.from({ length: TOTAL_HOLES }, (_, i) => i).sort(() => Math.random() - 0.5).slice(0, item.choices.length);
    const newMoles: Mole[] = holeIndices.map((holeIdx, i) => ({ holeIdx, text: item.choices[i], isCorrect: i === item.correctIdx, key: fxIdRef.current++ }));
    setMoles(newMoles);
    setPrompt(item.prompt);

    const t = turnTimeLeftRef.current;
    const [calm, warm, brisk, frantic] = DUCK_MS[difficulty];
    const duckMs = t > 60 ? calm : t > 30 ? warm : t > 10 ? brisk : frantic;
    roundTimerRef.current = setTimeout(() => {
      comboRef.current = 0;
      setCombo(0);
      setMoles([]);
      spawnRound();
    }, duckMs);
  };

  useEffect(() => {
    if (phase !== "playing") { if (roundTimerRef.current) clearTimeout(roundTimerRef.current); return; }
    spawnRound();
    return () => { if (roundTimerRef.current) clearTimeout(roundTimerRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, teamIdx]);

  useEffect(() => {
    if (phase !== "countdown") return;
    if (countdown <= 0) { setPhase("playing"); return; }
    const t = setTimeout(() => setCountdown(c => c - 1), 650);
    return () => clearTimeout(t);
  }, [phase, countdown]);

  const hitMole = (mole: Mole) => {
    if (phase !== "playing") return;
    if (mole.isCorrect) {
      if (roundTimerRef.current) clearTimeout(roundTimerRef.current);
      const bonus = Math.min(MAX_COMBO_BONUS, comboRef.current * COMBO_STEP);
      turnScoreRef.current += BASE_HIT_PTS + bonus;
      setTurnScore(turnScoreRef.current);
      comboRef.current += 1;
      setCombo(comboRef.current);
      if (comboRef.current > bestComboRef.current) { bestComboRef.current = comboRef.current; setBestCombo(bestComboRef.current); }
      spawnFx(mole.holeIdx, "hit");
      setMoles([]);
      // A brief pause before the next mole pops up — long enough to see the +hit land
      // and to stop a reflexive next click from landing mid pop-up on the new mole.
      roundTimerRef.current = setTimeout(() => spawnRound(), 260);
    } else {
      comboRef.current = 0;
      setCombo(0);
      spawnFx(mole.holeIdx, "miss");
      setMoles(prev => prev.filter(m => m.holeIdx !== mole.holeIdx));
    }
  };

  const startTeamTurn = () => {
    turnScoreRef.current = 0;
    setTurnScore(0);
    comboRef.current = 0;
    setCombo(0);
    bestComboRef.current = 0;
    setBestCombo(0);
    setCountdown(3);
    setPhase("countdown");
  };

  const nextTeam = () => {
    const next = teamIdx + 1;
    if (next >= teams.length) { setPhase("final"); return; }
    setTeamIdx(next);
    startTeamTurn();
  };

  const arenaStyle: React.CSSProperties = {
    margin: "-20px", padding: "20px", borderRadius: "20px", position: "relative", overflow: "hidden",
    background: "radial-gradient(ellipse at 50% -10%,#65A30D 0%,#365314 45%,#0F1A05 100%)",
  };

  if (pool.length === 0) {
    return (
      <div style={{ ...arenaStyle, textAlign: "center" }}>
        <AmbientBackdrop />
        {STYLE_TAG}
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: "40px", marginBottom: "10px" }}>🔨</div>
          <div style={{ fontWeight: "800", fontSize: "18px", color: "white" }}>No multiple-choice content found for this topic selection.</div>
          <button onClick={onEnd} className="ww-btn" style={{ marginTop: "16px", background: "linear-gradient(135deg,#3F6212,#84CC16)", color: "#0F1A05", border: "none", borderRadius: "14px", padding: "14px 32px", fontSize: "16px", fontWeight: "900", cursor: "pointer" }}>🏁 End Game</button>
        </div>
      </div>
    );
  }

  // Tutorial mockup: src/data/tutorials/whack.tsx — update if this intro's rules text changes.
  if (phase === "intro") return (
    <div style={{ ...arenaStyle, textAlign: "center" }}>
      <AmbientBackdrop />
      {STYLE_TAG}
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ background: "linear-gradient(160deg,#3F6212,#1A2E05)", border: "2px solid #BEF26455", borderRadius: "20px", padding: "28px 24px", marginBottom: "10px", color: "white", maxWidth: "540px", margin: "0 auto 10px", boxShadow: "0 0 50px rgba(132,204,22,0.4)" }}>
          <div style={{ fontSize: "36px", marginBottom: "10px" }}>🔨</div>
          <div style={{ fontWeight: "900", fontSize: "20px", marginBottom: "10px", color: "#BEF264" }}>Word Whack</div>
          <div style={{ fontSize: "15px", lineHeight: 1.7 }}>
            One team plays at a time — everyone else watches the clock!<br />
            You get <strong style={{ color: "#BEF264" }}>90 seconds</strong>. Moles pop up showing possible answers — whack the <strong style={{ color: "#BEF264" }}>correct one</strong> before it ducks!<br />
            Hit right = points + the next one loads instantly. Hit wrong = that mole's gone, but the correct one's still up.<br />
            Chain hits without a miss for a growing <strong style={{ color: "#BEF264" }}>combo bonus</strong>.<br />
            Moles duck faster as your clock runs down — stay sharp to the end!
          </div>
        </div>
        <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap", marginBottom: "20px" }}>
          {teams.map((t, i) => (
            <div key={t.id} style={{ background: `linear-gradient(160deg,${t.color.dark}55,#1A2E05)`, border: `3px solid ${t.color.bg}`, borderRadius: "14px", padding: "10px 18px", fontWeight: "800", fontSize: "14px", color: "white" }}>
              {i + 1}. {t.color.emoji} {t.name}
            </div>
          ))}
        </div>
        <div style={{ marginBottom: "24px" }}>
          <div style={{ fontSize: "13px", fontWeight: "700", color: "#BEF264", marginBottom: "8px" }}>🔨 Whack speed (turn is always 90s):</div>
          <div style={{ display: "flex", gap: "8px", justifyContent: "center", flexWrap: "wrap" }}>
            {DIFFICULTY_OPTIONS.map(d => (
              <button key={d} onClick={() => setDifficulty(d)} className="ww-btn" style={{
                background: difficulty === d ? "linear-gradient(135deg,#3F6212,#84CC16)" : "rgba(255,255,255,0.08)",
                color: difficulty === d ? "#0F1A05" : "#D9F99D",
                border: `2px solid ${difficulty === d ? "#84CC16" : "#BEF26455"}`,
                borderRadius: "12px", padding: "10px 20px", cursor: "pointer",
                fontWeight: "800", fontSize: "14px", minWidth: "84px", textTransform: "capitalize", transition: "all 0.15s",
              }}>
                {d}
              </button>
            ))}
          </div>
        </div>
        <button onClick={() => setShowHowTo(true)} className="ww-btn" style={{ display: "block", margin: "0 auto 14px", background: "rgba(255,255,255,0.95)", color: GM.color, border: `2px solid ${GM.color}`, boxShadow: "0 2px 8px rgba(0,0,0,0.18)", borderRadius: "12px", padding: "10px 24px", fontSize: "14px", fontWeight: "800", cursor: "pointer" }}>
          ❓ How to Play
        </button>
        {showHowTo && (
          <HowToPlayModal
            gameName={GM.name} gameIcon={GM.icon} accentColor={GM.color}
            steps={WHACK_TUTORIAL_STEPS}
            onClose={() => setShowHowTo(false)}
          />
        )}
        <button onClick={() => { setTeamIdx(0); startTeamTurn(); }} className="ww-btn" style={{ background: "linear-gradient(135deg,#3F6212,#84CC16)", color: "#0F1A05", border: "none", borderRadius: "16px", padding: "16px 48px", fontSize: "19px", fontWeight: "900", cursor: "pointer", boxShadow: "0 6px 24px rgba(132,204,22,0.5)", transition: "transform 0.15s ease" }}>
          🔨 Start Whacking!
        </button>
      </div>
    </div>
  );

  if (phase === "final") {
    // Dense rank on final score — two teams tied for first both get gold instead of an
    // arbitrary array-order winner/runner-up split.
    const ranking = denseRank(teams, t => finalScores[t.id] ?? 0).sort((a, b) => b.value - a.value);
    const winners = ranking.filter(r => r.rank === 0);
    const isTie = winners.length > 1;
    const headline = isTie
      ? `${winners.map(w => w.item.name).join(" & ")} tied for the most whacks!`
      : `${winners[0]?.item.name} whacked the most!`;
    return (
      <div style={{ ...arenaStyle, textAlign: "center" }}>
        <AmbientBackdrop />
        {STYLE_TAG}
        <div style={{ fontSize: "48px", marginBottom: "6px" }}>🏆</div>
        <div style={{ fontWeight: "900", fontSize: "24px", color: "#BEF264", marginBottom: "16px" }}>{headline}</div>
        <div style={{ display: "grid", gridTemplateColumns: teamsGridCols(teams.length), gap: "10px", margin: "0 auto 20px", maxWidth: "700px" }}>
          {ranking.map(({ item: t, rank, value }) => (
            <div key={t.id} style={{ background: `linear-gradient(160deg,${t.color.dark}55,#1A2E05)`, border: `2px solid ${t.color.bg}`, borderRadius: "14px", padding: "12px" }}>
              <div style={{ fontSize: "22px" }}>{medalForRank(rank)}</div>
              <div style={{ fontWeight: "800", color: "white", fontSize: "14px", marginTop: "4px" }}>{t.mascot ?? t.color.emoji} {t.name}</div>
              <div style={{ color: "#BEF264", fontWeight: "800", fontSize: "15px", marginTop: "4px" }}>{value} pts</div>
            </div>
          ))}
        </div>
        <button onClick={onEnd} className="ww-btn" style={{ background: "linear-gradient(135deg,#3F6212,#84CC16)", color: "#0F1A05", border: "none", borderRadius: "12px", padding: "12px 28px", fontSize: "16px", fontWeight: "800", cursor: "pointer", transition: "transform 0.15s ease" }}>🏁 End Game</button>
      </div>
    );
  }

  return (
    <div style={arenaStyle}>
      <AmbientBackdrop />
      {STYLE_TAG}
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ background: `linear-gradient(90deg,${activeTeam.color.dark},${activeTeam.color.bg})`, borderRadius: "14px", padding: "10px 16px", marginBottom: "14px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px", boxShadow: `0 4px 18px ${activeTeam.color.bg}55` }}>
          <span style={{ color: "white", fontWeight: "900", fontSize: "16px", textShadow: "0 1px 3px rgba(0,0,0,0.4)" }}>🔨 {activeTeam.mascot ?? activeTeam.color.emoji} {activeTeam.name}'s turn — Team {teamIdx + 1} of {teams.length}</span>
          {phase === "playing" && <TurnTimerBar timeLeft={turnTimeLeft} totalSeconds={TURN_SECONDS} />}
        </div>

        {(phase === "playing" || phase === "countdown") && (
          <>
            <div style={{ display: "flex", gap: "8px", justifyContent: "center", marginBottom: "12px", flexWrap: "wrap" }}>
              <div style={{ background: "rgba(255,255,255,0.1)", border: "1.5px solid #BEF26466", borderRadius: "10px", padding: "6px 14px", fontSize: "13px", fontWeight: "800", color: "#BEF264" }}>🪙 {turnScore} pts</div>
              <div style={{ background: combo > 0 ? "linear-gradient(135deg,#CA8A04,#F59E0B)" : "rgba(255,255,255,0.1)", border: "1.5px solid #FCD34D66", borderRadius: "10px", padding: "6px 14px", fontSize: "13px", fontWeight: "800", color: combo > 0 ? "#1F1300" : "#FCD34D88", animation: combo > 2 ? "wwComboGlow 0.8s ease-in-out infinite" : "none" }}>🔥 Combo x{combo}</div>
            </div>

            <div style={{ background: "rgba(255,255,255,0.08)", border: "2px solid #BEF26455", borderRadius: "14px", padding: "14px 18px", marginBottom: "14px", textAlign: "center" }}>
              <div style={{ fontSize: "11px", fontWeight: "800", color: "#BEF264", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>Whack the correct answer</div>
              <div style={{ fontWeight: "800", fontSize: "clamp(15px,2.5vw,19px)", color: "white" }}>{prompt || "…"}</div>
            </div>

            <div style={{ position: "relative" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "12px", maxWidth: "420px", margin: "0 auto" }}>
                {Array.from({ length: TOTAL_HOLES }).map((_, holeIdx) => {
                  const mole = moles.find(m => m.holeIdx === holeIdx);
                  const holeFx = fx && fx.holeIdx === holeIdx ? fx : null;
                  return (
                    <div key={holeIdx} style={{ position: "relative", height: "88px" }}>
                      <div style={{ position: "absolute", left: "50%", bottom: "6px", transform: "translateX(-50%)", width: "70px", height: "26px", borderRadius: "50%", background: "radial-gradient(ellipse,#1A2E05,#0F1A05)", boxShadow: "inset 0 4px 8px rgba(0,0,0,0.6)" }} />
                      {mole && (
                        <button
                          key={mole.key}
                          onClick={() => hitMole(mole)}
                          className="ww-mole"
                          style={{
                            // Centered via left/right/margin (not transform) so that no animation or
                            // pseudo-class state can ever knock the button off-center by clobbering a
                            // transform-based centering trick — transform is free for pure motion/scale.
                            position: "absolute", left: 0, right: 0, margin: "0 auto", bottom: "10px",
                            width: "92px", minHeight: "56px", border: "none", borderRadius: "14px", cursor: "pointer",
                            background: "linear-gradient(160deg,#A16207,#78350F)", color: "#FEF3C7",
                            fontWeight: "800", fontSize: mole.text.length > 14 ? "9.5px" : mole.text.length > 9 ? "10.5px" : "12px",
                            lineHeight: 1.15, padding: "8px 5px", boxShadow: "0 4px 10px rgba(0,0,0,0.5)",
                            // Long single words (e.g. "cosmopolitan", "extracurricular") have no space to wrap
                            // on — without this they overflow past the button's own edge, so the tail of the
                            // word renders outside the actual clickable hitbox and clicking it does nothing.
                            overflowWrap: "break-word", wordBreak: "break-word", hyphens: "auto",
                            display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center",
                            animation: holeFx?.kind === "miss" ? "wwBonk 0.35s ease-in-out" : "wwPopUp 0.3s ease-out",
                          }}
                        >
                          {activeTeam.mascot ?? "🦫"} {mole.text}
                        </button>
                      )}
                      {holeFx?.kind === "hit" && (
                        <div style={{ position: "absolute", left: "50%", bottom: "30px", transform: "translateX(-50%)", pointerEvents: "none" }}>
                          <div style={{ position: "absolute", width: "70px", height: "70px", left: "-35px", top: "-35px", borderRadius: "50%", background: "radial-gradient(circle,#BEF264AA,transparent 70%)", animation: "wwHitBurst 0.5s ease-out forwards" }} />
                          <div style={{ fontWeight: "900", fontSize: "16px", color: "#BEF264", textShadow: "0 2px 4px rgba(0,0,0,0.6)" }}>+{BASE_HIT_PTS + Math.min(MAX_COMBO_BONUS, (comboRef.current - 1) * COMBO_STEP)}</div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {phase === "countdown" && (
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(15,26,5,0.7)", borderRadius: "14px" }}>
                  <div key={countdown} style={{ fontSize: "64px", fontWeight: "900", color: "#BEF264", animation: "wwCountPulse 0.6s ease-out", textShadow: "0 4px 12px rgba(0,0,0,0.6)" }}>
                    {countdown > 0 ? countdown : "GO!"}
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {phase === "turn-end" && (
          <div style={{ textAlign: "center" }}>
            <div style={{ background: "linear-gradient(160deg,#3F6212,#1A2E05)", border: "2px solid #BEF26466", borderRadius: "16px", padding: "20px", marginBottom: "16px" }}>
              <div style={{ fontSize: "34px", marginBottom: "6px" }}>🔨</div>
              <div style={{ fontWeight: "900", fontSize: "20px", color: "white", marginBottom: "8px" }}>{activeTeam.name}'s turn is over!</div>
              <div style={{ fontWeight: "800", fontSize: "26px", color: "#BEF264" }}>+{finalScores[activeTeam.id] ?? 0} pts</div>
              <div style={{ fontSize: "13px", color: "#D9F99D", marginTop: "6px" }}>Best combo this turn: 🔥 x{bestCombo}</div>
            </div>
            <button onClick={nextTeam} className="ww-btn" style={{ background: "linear-gradient(135deg,#3F6212,#84CC16)", color: "#0F1A05", border: "none", borderRadius: "14px", padding: "14px 36px", fontSize: "17px", fontWeight: "900", cursor: "pointer", transition: "transform 0.15s ease" }}>
              {teamIdx + 1 >= teams.length ? "🏆 See Final Results" : "➡️ Next Team's Turn"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
