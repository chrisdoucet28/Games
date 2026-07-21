import { useState, useRef, useEffect, useCallback } from "react";
import type { GameProps, QuestionData } from "../../types";
import { useTurnTimer } from "../../hooks/useTurnTimer";
import { TurnTimerBar } from "../shared/TurnTimerBar";
import { QuestionCard } from "../shared/QuestionCard";
import { teamsGridCols } from "../../data/constants";

const TURN_SECONDS = 90;
const POINTS_PER_CORRECT = 20;
const LAUNCH_BONUS_BY_RANK = [50, 30, 15, 5];
const MAX_FLIGHT_PX = 460;
const MIN_HEIGHT_FRACTION = 0.12; // even a 0-fuel rocket still visibly lifts off
const ASCENT_MS = 14000;
const IGNITION_MS = 550;
const HOLD_MS = 1600;

const STARS = Array.from({ length: 40 }, (_, i) => ({
  left: (i * 53) % 100,
  top: (i * 31) % 55,
  size: 1 + (i % 3),
  dur: 2 + (i % 4),
  delay: (i % 10) * 0.3,
}));

const CLOUD_LAYERS = [
  { bottom: 22, scale: 1, opacity: 0.9, drift: 26 },
  { bottom: 42, scale: 0.85, opacity: 0.75, drift: 34 },
  { bottom: 60, scale: 0.7, opacity: 0.55, drift: 22 },
];
const CLOUDS_PER_LAYER = 5;

const STYLE_TAG = (
  <style>{`
    @keyframes rfTwinkle{0%,100%{opacity:0.2}50%{opacity:1}}
    @keyframes rfCountPulse{0%{transform:scale(0.5);opacity:0}50%{transform:scale(1.25);opacity:1}100%{transform:scale(1);opacity:1}}
    @keyframes rfFlameFlicker{0%,100%{transform:scaleY(1) scaleX(1);opacity:0.9}50%{transform:scaleY(1.3) scaleX(0.8);opacity:0.6}}
    @keyframes rfShake{0%,100%{transform:translateX(0)}25%{transform:translateX(-2px)}75%{transform:translateX(2px)}}
    @keyframes rfCloudDrift{0%{transform:translateX(0)}100%{transform:translateX(-40px)}}
    @keyframes rfIgnitionFlash{0%{opacity:0}30%{opacity:1}100%{opacity:0}}
    @keyframes rfMiniShake{0%,100%{transform:translate(0,0) rotate(0deg)}20%{transform:translate(-4px,-2px) rotate(-7deg)}40%{transform:translate(4px,-5px) rotate(6deg)}60%{transform:translate(-3px,-7px) rotate(-4deg)}80%{transform:translate(2px,-3px) rotate(3deg)}}
    @keyframes rfFuelRise{0%{transform:translate(-50%,0) scale(1);opacity:1}100%{transform:translate(-50%,-64px) scale(0.5);opacity:0}}
    .rf-btn:hover:not(:disabled){transform:translateY(-2px) scale(1.02);filter:brightness(1.1)}
    .rf-btn:active:not(:disabled){transform:translateY(0) scale(0.97)}
  `}</style>
);

function Starfield() {
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
      {STARS.map((s, i) => (
        <div key={i} style={{ position: "absolute", left: `${s.left}%`, top: `${s.top}%`, width: `${s.size}px`, height: `${s.size}px`, borderRadius: "50%", background: "white", animation: `rfTwinkle ${s.dur}s ease-in-out infinite ${s.delay}s` }} />
      ))}
    </div>
  );
}

function CloudField() {
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
      {CLOUD_LAYERS.map((layer, li) => (
        Array.from({ length: CLOUDS_PER_LAYER }).map((_, i) => (
          <div key={`${li}-${i}`} style={{
            position: "absolute",
            left: `${(i * 97 + li * 31) % 110 - 5}%`,
            bottom: `${layer.bottom}%`,
            fontSize: `${32 * layer.scale}px`,
            opacity: layer.opacity,
            animation: `rfCloudDrift ${layer.drift}s linear infinite alternate`,
          }}>☁️</div>
        ))
      ))}
    </div>
  );
}

// Ranks teams by fuel count, treating equal fuel as an equal rank (a 2-way tie for 1st means
// both teams get rank 0 — the 50pt bonus and the gold medal — and the next distinct fuel
// value becomes rank 1, not rank 2. A plain array-index sort would otherwise hand ties an
// arbitrary winner/runner-up split despite identical performance.
function rankByFuel(teams: GameProps["teams"], fuelById: Record<string | number, number>) {
  const withFuel = teams.map(t => ({ team: t, fuel: fuelById[t.id] ?? 0 }));
  const distinctFuelDesc = [...new Set(withFuel.map(x => x.fuel))].sort((a, b) => b - a);
  return withFuel
    .map(x => ({ ...x, rank: distinctFuelDesc.indexOf(x.fuel) }))
    .sort((a, b) => b.fuel - a.fuel);
}

export function RocketFuelGame({ questions, teams, onUpdateScore, onEnd, forceFinalRef }: GameProps) {
  const pool = useRef((() => {
    const uvs = questions.filter(q => q.type === "use vocabulary in a sentence");
    const finalPool = uvs.length ? uvs : questions;
    return [...finalPool].sort(() => Math.random() - 0.5);
  })()).current;

  const [phase, setPhase] = useState<"intro" | "team-turn" | "team-end" | "launchpad" | "igniting" | "launching" | "final">("intro");
  const [teamIdx, setTeamIdx] = useState(0);
  const [currentQ, setCurrentQ] = useState<QuestionData | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [turnFuel, setTurnFuel] = useState(0);
  const [countdown, setCountdown] = useState(3);
  const [launched, setLaunched] = useState(false);
  const [bonusAwarded, setBonusAwarded] = useState<Record<string | number, number>>({});

  const cursorRef = useRef(0);
  const fuelRef = useRef<Record<string | number, number>>({});
  const turnFuelRef = useRef(0);
  // Guards against double-awarding points if the launch payout fires both from the natural
  // "landing" timeout and a forced early end racing each other.
  const payoutDoneRef = useRef(false);

  const finalizeLaunch = useCallback(() => {
    if (payoutDoneRef.current) return;
    payoutDoneRef.current = true;
    const ranked = rankByFuel(teams, fuelRef.current);
    const bonuses: Record<string | number, number> = {};
    ranked.forEach(({ team, fuel, rank }) => {
      const basePts = fuel * POINTS_PER_CORRECT;
      const bonus = LAUNCH_BONUS_BY_RANK[rank] ?? 0;
      bonuses[team.id] = bonus;
      onUpdateScore(team.id, basePts + bonus);
    });
    setBonusAwarded(bonuses);
    setPhase("final");
  }, [teams, onUpdateScore]);

  useEffect(() => {
    if (!forceFinalRef) return;
    forceFinalRef.current = phase === "final" ? null : () => { finalizeLaunch(); return true; };
    return () => { if (forceFinalRef) forceFinalRef.current = null; };
  }, [forceFinalRef, phase, finalizeLaunch]);

  const activeTeam = teams[teamIdx];

  const drawPrompt = () => {
    if (!pool.length) { setCurrentQ(null); return; }
    const idx = cursorRef.current % pool.length;
    cursorRef.current += 1;
    setCurrentQ(pool[idx]);
    setShowAnswer(false);
  };

  const endTurn = () => setPhase("team-end");

  const { timeLeft } = useTurnTimer(TURN_SECONDS, phase === "team-turn", endTurn, teamIdx);

  const startTeamTurn = (idx: number) => {
    setTeamIdx(idx);
    turnFuelRef.current = 0;
    setTurnFuel(0);
    fuelRef.current[teams[idx].id] = fuelRef.current[teams[idx].id] ?? 0;
    drawPrompt();
    setPhase("team-turn");
  };

  // Points are NOT awarded live — every team's fuel count is a secret until the final
  // reveal during the launch sequence, so nobody knows who's ahead until the very end.
  const judge = (correct: boolean) => {
    if (correct) {
      fuelRef.current[activeTeam.id] = (fuelRef.current[activeTeam.id] ?? 0) + 1;
      turnFuelRef.current += 1;
      setTurnFuel(turnFuelRef.current);
    }
    drawPrompt();
  };

  const nextTeam = () => {
    const next = teamIdx + 1;
    if (next >= teams.length) { setPhase("launchpad"); return; }
    startTeamTurn(next);
  };

  useEffect(() => {
    if (phase !== "launchpad") return;
    setCountdown(3);
    setLaunched(false);
  }, [phase]);

  useEffect(() => {
    if (phase !== "launchpad") return;
    if (countdown <= 0) { setPhase("igniting"); return; }
    const t = setTimeout(() => setCountdown(c => c - 1), 750);
    return () => clearTimeout(t);
  }, [phase, countdown]);

  useEffect(() => {
    if (phase !== "igniting") return;
    const t = setTimeout(() => setPhase("launching"), IGNITION_MS);
    return () => clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    if (phase !== "launching") return;
    const liftoffT = setTimeout(() => setLaunched(true), 50);
    // All points — base fuel points AND the launch-rank bonus — land together right as
    // the flight resolves, so the scoreboard stays blank through the whole simulation.
    const finishT = setTimeout(finalizeLaunch, ASCENT_MS + HOLD_MS);
    return () => { clearTimeout(liftoffT); clearTimeout(finishT); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const arenaStyle: React.CSSProperties = {
    margin: "-20px", padding: "20px", borderRadius: "20px", position: "relative", overflow: "hidden",
    background: "radial-gradient(ellipse at 50% 110%,#1E1B4B 0%,#0B0B2E 55%,#030014 100%)",
  };

  if (phase === "intro") return (
    <div style={{ ...arenaStyle, textAlign: "center" }}>
      <Starfield />
      {STYLE_TAG}
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ background: "linear-gradient(160deg,#312E81,#0B0B2E)", border: "2px solid #A5B4FC55", borderRadius: "20px", padding: "28px 24px", marginBottom: "10px", color: "white", maxWidth: "560px", margin: "0 auto 10px", boxShadow: "0 0 50px rgba(99,102,241,0.4)" }}>
          <div style={{ fontSize: "36px", marginBottom: "10px" }}>🚀</div>
          <div style={{ fontWeight: "900", fontSize: "20px", marginBottom: "10px", color: "#A5B4FC" }}>Rocket Fuel</div>
          <div style={{ fontSize: "15px", lineHeight: 1.7 }}>
            Each team gets <strong style={{ color: "#A5B4FC" }}>90 seconds</strong> at mission control.<br />
            Use the given word in your own sentence — every correct one adds fuel. Keep going as many times as you can before the clock runs out!<br />
            Can't think of anything for a prompt? Skip it for a new one — no penalty.<br />
            Nobody's fuel level is revealed until launch day — not even the scoreboard! Once every team has fuelled up, all rockets <strong style={{ color: "#A5B4FC" }}>launch together</strong> and the points land as they fly — whoever fuelled the most flies the highest!
          </div>
        </div>
        <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap", marginBottom: "24px" }}>
          {teams.map((t, i) => (
            <div key={t.id} style={{ background: `linear-gradient(160deg,${t.color.dark}55,#0B0B2E)`, border: `3px solid ${t.color.bg}`, borderRadius: "14px", padding: "10px 18px", fontWeight: "800", fontSize: "14px", color: "white" }}>
              {i + 1}. {t.color.emoji} {t.name}
            </div>
          ))}
        </div>
        <button onClick={() => startTeamTurn(0)} className="rf-btn" style={{ background: "linear-gradient(135deg,#4338CA,#818CF8)", color: "white", border: "none", borderRadius: "16px", padding: "16px 48px", fontSize: "19px", fontWeight: "900", cursor: "pointer", boxShadow: "0 6px 24px rgba(99,102,241,0.5)", transition: "transform 0.15s ease" }}>
          🔥 Ignite Engines!
        </button>
      </div>
    </div>
  );

  if (phase === "team-turn" || phase === "team-end") return (
    <div style={arenaStyle}>
      <Starfield />
      {STYLE_TAG}
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ background: `linear-gradient(90deg,${activeTeam.color.dark},${activeTeam.color.bg})`, borderRadius: "14px", padding: "10px 16px", marginBottom: "14px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px", boxShadow: `0 4px 18px ${activeTeam.color.bg}55` }}>
          <span style={{ color: "white", fontWeight: "900", fontSize: "16px", textShadow: "0 1px 3px rgba(0,0,0,0.4)" }}>🚀 {activeTeam.name}'s turn — Team {teamIdx + 1} of {teams.length}</span>
          {phase === "team-turn" && (
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <TurnTimerBar timeLeft={timeLeft} totalSeconds={TURN_SECONDS} />
              <button onClick={endTurn} className="rf-btn" style={{ background: "rgba(0,0,0,0.25)", color: "white", border: "1.5px solid rgba(255,255,255,0.4)", borderRadius: "10px", padding: "6px 14px", fontSize: "12px", fontWeight: "800", cursor: "pointer", whiteSpace: "nowrap", transition: "transform 0.15s ease" }}>🛑 End Turn</button>
            </div>
          )}
        </div>

        {phase === "team-turn" && (
          <>
            {/* No number shown here on purpose — a live count would tip off every other team.
                A correct answer just makes the rocket visibly gulp down a bit of fuel. */}
            <div style={{ textAlign: "center", marginBottom: "10px", position: "relative", height: "70px" }}>
              <div key={`shake-${turnFuel}`} style={{ display: "inline-block", fontSize: "44px", filter: `drop-shadow(0 0 10px ${activeTeam.color.bg})`, animation: turnFuel > 0 ? "rfMiniShake 0.45s ease-in-out" : "none" }}>🚀</div>
              {turnFuel > 0 && (
                <div key={`burst-${turnFuel}`} style={{ position: "absolute", left: "50%", bottom: "0", fontSize: "20px", animation: "rfFuelRise 0.6s ease-out forwards" }}>⛽</div>
              )}
            </div>

            <div style={{ maxWidth: "520px", margin: "0 auto" }}>
              <QuestionCard question={currentQ} showAnswer={showAnswer} onReveal={() => setShowAnswer(true)} />
              <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginTop: "14px" }}>
                {showAnswer ? (
                  <>
                    <button onClick={() => judge(true)} className="rf-btn" style={{ background: "linear-gradient(135deg,#15803D,#22C55E)", color: "white", border: "none", borderRadius: "12px", padding: "12px 28px", fontSize: "15px", fontWeight: "800", cursor: "pointer", transition: "transform 0.15s ease" }}>✅ Fuelled it!</button>
                    <button onClick={() => judge(false)} className="rf-btn" style={{ background: "linear-gradient(135deg,#B91C1C,#EF4444)", color: "white", border: "none", borderRadius: "12px", padding: "12px 28px", fontSize: "15px", fontWeight: "800", cursor: "pointer", transition: "transform 0.15s ease" }}>❌ No fuel</button>
                  </>
                ) : (
                  <button onClick={drawPrompt} className="rf-btn" style={{ background: "rgba(255,255,255,0.1)", color: "#C7D2FE", border: "2px solid #A5B4FC55", borderRadius: "12px", padding: "10px 22px", fontSize: "14px", fontWeight: "700", cursor: "pointer", transition: "transform 0.15s ease" }}>⏭ Skip — try a different one</button>
                )}
              </div>
            </div>
          </>
        )}

        {phase === "team-end" && (
          <div style={{ textAlign: "center" }}>
            <div style={{ background: "linear-gradient(160deg,#312E81,#0B0B2E)", border: "2px solid #A5B4FC66", borderRadius: "16px", padding: "20px", marginBottom: "16px" }}>
              <div style={{ fontSize: "34px", marginBottom: "6px" }}>🚀</div>
              <div style={{ fontWeight: "900", fontSize: "20px", color: "white", marginBottom: "8px" }}>{activeTeam.name}'s tank is sealed!</div>
              <div style={{ fontSize: "14px", color: "#C7D2FE" }}>Nice work! Time for the next team.</div>
            </div>
            <button onClick={nextTeam} className="rf-btn" style={{ background: "linear-gradient(135deg,#4338CA,#818CF8)", color: "white", border: "none", borderRadius: "14px", padding: "14px 36px", fontSize: "17px", fontWeight: "900", cursor: "pointer", transition: "transform 0.15s ease" }}>
              {teamIdx + 1 >= teams.length ? "🚀 Go to Launchpad" : "➡️ Next Team's Turn"}
            </button>
          </div>
        )}
      </div>
    </div>
  );

  if (phase === "launchpad" || phase === "igniting" || phase === "launching") {
    const maxFuel = Math.max(1, ...teams.map(t => fuelRef.current[t.id] ?? 0));
    return (
      <div style={{ ...arenaStyle, textAlign: "center" }}>
        <Starfield />
        {(phase === "igniting" || phase === "launching") && <CloudField />}
        {STYLE_TAG}
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ fontWeight: "900", fontSize: "20px", color: "#A5B4FC", marginBottom: "18px" }}>
            {phase === "launchpad" ? "🛰️ All engines fuelled. Prepare for launch!" : phase === "igniting" ? "🔥 IGNITION..." : "🚀 LAUNCH!"}
          </div>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-end", gap: "28px", height: `${MAX_FLIGHT_PX + 90}px`, position: "relative" }}>
            {phase === "igniting" && (
              <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 100%,rgba(253,224,71,0.5),transparent 60%)", animation: `rfIgnitionFlash ${IGNITION_MS}ms ease-out` }} />
            )}
            {teams.map(t => {
              const heightFraction = launched ? Math.max(MIN_HEIGHT_FRACTION, (fuelRef.current[t.id] ?? 0) / maxFuel) : 0;
              const flightPx = heightFraction * MAX_FLIGHT_PX;
              return (
                <div key={t.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", width: "70px", height: "100%", position: "relative" }}>
                  <div style={{
                    position: "relative",
                    transform: `translateY(-${flightPx}px)`,
                    transition: `transform ${ASCENT_MS}ms cubic-bezier(0.16,0.55,0.25,1)`,
                  }}>
                    {(phase === "igniting" || (phase === "launching" && launched)) && (
                      <div style={{ position: "absolute", left: "50%", bottom: "-18px", transform: "translateX(-50%)", fontSize: "22px", animation: "rfFlameFlicker 0.15s ease-in-out infinite" }}>🔥</div>
                    )}
                    <div style={{ fontSize: "40px", filter: `drop-shadow(0 0 8px ${t.color.bg})`, animation: phase === "launchpad" ? "none" : "rfShake 0.1s linear infinite" }}>🚀</div>
                  </div>
                  {/* Centered explicitly (not just via the flex parent's static position) and
                      capped with maxWidth so a long custom team name wraps onto another line
                      instead of growing wide enough to overlap the neighbouring rocket's bubble. */}
                  <div style={{ position: "absolute", bottom: "0", left: "50%", transform: "translateX(-50%)", maxWidth: "94px", background: `linear-gradient(180deg,${t.color.dark}88,#0B0B2E)`, border: `2px solid ${t.color.bg}`, borderRadius: "10px", padding: "6px 10px", fontSize: "12px", fontWeight: "800", color: "white", textAlign: "center" }}>
                    {t.color.emoji} {t.name}<br />
                    <span style={{ color: "#FDBA74" }}>⛽ ???</span>
                  </div>
                </div>
              );
            })}
          </div>
          {phase === "launchpad" && (
            <div key={countdown} style={{ fontSize: "64px", fontWeight: "900", color: "#A5B4FC", animation: "rfCountPulse 0.6s ease-out", textShadow: "0 4px 12px rgba(0,0,0,0.6)", marginTop: "20px" }}>
              {countdown > 0 ? countdown : "GO!"}
            </div>
          )}
        </div>
      </div>
    );
  }

  const ranked = rankByFuel(teams, fuelRef.current);
  const winners = ranked.filter(r => r.rank === 0);
  const isTie = winners.length > 1;
  const headline = isTie
    ? `${winners.map(w => w.team.name).join(" & ")} tied for the highest flight!`
    : `${winners[0]?.team.name}'s rocket flew the highest!`;
  return (
    <div style={{ ...arenaStyle, textAlign: "center" }}>
      <Starfield />
      {STYLE_TAG}
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ fontSize: "48px", marginBottom: "6px" }}>🏆</div>
        <div style={{ fontWeight: "900", fontSize: "24px", color: "#A5B4FC", marginBottom: "16px" }}>{headline}</div>
        <div style={{ display: "grid", gridTemplateColumns: teamsGridCols(teams.length), gap: "10px", margin: "0 auto 20px", maxWidth: "700px" }}>
          {ranked.map(({ team: t, fuel: fuelCount, rank }) => {
            const basePts = fuelCount * POINTS_PER_CORRECT;
            return (
              <div key={t.id} style={{ background: `linear-gradient(160deg,${t.color.dark}55,#0B0B2E)`, border: `2px solid ${t.color.bg}`, borderRadius: "14px", padding: "12px" }}>
                <div style={{ fontSize: "22px" }}>{rank === 0 ? "🥇" : rank === 1 ? "🥈" : rank === 2 ? "🥉" : "🚀"}</div>
                <div style={{ fontWeight: "800", color: "white", fontSize: "14px", marginTop: "4px" }}>{t.name}</div>
                <div style={{ color: "#FDBA74", fontWeight: "800", fontSize: "13px", marginTop: "2px" }}>⛽ {fuelCount} fuelled · {basePts} pts</div>
                {bonusAwarded[t.id] > 0 && <div style={{ color: "#86EFAC", fontWeight: "700", fontSize: "12px", marginTop: "2px" }}>+{bonusAwarded[t.id]} launch bonus</div>}
              </div>
            );
          })}
        </div>
        <button onClick={onEnd} className="rf-btn" style={{ background: "linear-gradient(135deg,#4338CA,#818CF8)", color: "white", border: "none", borderRadius: "12px", padding: "12px 28px", fontSize: "16px", fontWeight: "800", cursor: "pointer", transition: "transform 0.15s ease" }}>🏁 End Game</button>
      </div>
    </div>
  );
}
