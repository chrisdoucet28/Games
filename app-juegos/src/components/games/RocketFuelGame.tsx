import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { TeamIcon, MascotSprite } from "../shared/TeamIcon";
import { Icon, type IconName } from "../shared/Icon";
import { RankBadge } from "../shared/RankBadge";
import type { GameProps, QuestionData } from "../../types";
import { useTurnTimer } from "../../hooks/useTurnTimer";
import { TurnTimerBar } from "../shared/TurnTimerBar";
import { QuestionCard } from "../shared/QuestionCard";
import { teamsGridCols, GAME_MODES, GAME_ICONS } from "../../data/constants";
import { HowToPlayModal } from "../shared/HowToPlayModal";
import { ROCKET_TUTORIAL_STEPS } from "../../data/tutorials/rocket";

const GM = GAME_MODES.find(g => g.id === "rocket")!;

const TURN_SECONDS = 90;
// Every team gets this many 90s turns (each building more secret fuel) before launch — a single
// turn per team felt too short on its own, per teacher feedback; 2 gives the full experience
// without dragging the game out.
const TOTAL_ROUNDS = 2;
// Solo only: after the first launch, one optional bonus round for "one more launch, try to beat
// it" — see the "One More Launch!" button on the final screen. Multi-team never reaches this;
// TOTAL_ROUNDS stays exactly 2 for everyone as before.
const SOLO_MAX_ROUNDS = 3;
const POINTS_PER_CORRECT = 20;
const LAUNCH_BONUS_BY_RANK = [50, 30, 15, 5];
const MAX_FLIGHT_PX = 460;
const MIN_HEIGHT_FRACTION = 0.12; // even a 0-fuel rocket still visibly lifts off
const ASCENT_MS = 14000;
const IGNITION_MS = 550;
const HOLD_MS = 1600;
// Solo has no other team to measure height against — comparing to an absolute ceiling instead
// means the flight actually reflects how many correct answers were banked, rather than always
// maxing out.
const SOLO_FUEL_CEILING = 12;
// Solo's launch is a "camera locked on the rocket" flythrough. The rocket lifts off the pad
// (see LIFTOFF_MS/groundOffsetPx below), rises to a fixed cruise position, and then never moves
// again — from that point on, the illusion of climbing comes entirely from clouds/stars/the
// moon/planets scrolling from the top of the frame down past the rocket and off the bottom, the
// same direction the ground is falling away, not from anything flying "out of" the rocket
// itself. A better run means a longer flight through more distant stages; a poor run barely
// clears the clouds before the sequence ends. Multi-team has no use for this — with a real rival
// to race against, seeing everyone's rocket side by side at relatively different heights (best
// team visibly leaving the others behind) tells the story better than isolating each team in
// its own camera, so multi-team keeps the classic shared-frame comparative climb instead.
const LIFTOFF_MS = 1800;
const SOLO_FLIGHT_MS_MIN = 5000;
const SOLO_FLIGHT_MS_MAX = 16000;
const SOLO_FLYBY_COUNT = 26;
// How far below its cruise (frame-centered) position the rocket sits while still on the pad, for
// a frame of the given height.
const groundOffsetPx = (frameH: number) => frameH / 2 - 70;

// Solo's "beat your own best" record — deliberately session-only (sessionStorage, not Supabase):
// resets next class visit, but survives "Play Again" and the bonus round within one sitting, which
// is exactly what a live "race your ghost" comparison needs. Keyed by team.id (stable across a
// session — teams are owned by LessonGamesGenerator and never rebuilt between games), not name.
const bestFuelKey = (teamId: string | number) => `classcade-rocketfuel-best-${teamId}`;
function getBestFuel(teamId: string | number): number {
  try { return Number(sessionStorage.getItem(bestFuelKey(teamId))) || 0; } catch { return 0; }
}
function setBestFuelIfHigher(teamId: string | number, fuel: number): void {
  try { if (fuel > getBestFuel(teamId)) sessionStorage.setItem(bestFuelKey(teamId), String(fuel)); } catch { /* private browsing etc — a missing personal-best is a fine degradation */ }
}
// Each stage's emoji pool takes over once the flight's elapsed fraction crosses `from` — later
// stages layer in on top of earlier ones as the rocket climbs higher, exactly like passing
// through progressively higher altitude bands.
const FLYBY_STAGES = [
  { from: 0, icons: ["cloud", "cloud"] as IconName[] },
  { from: 0.3, icons: ["sparkle", "star"] as IconName[] },
  { from: 0.62, icons: ["moon"] as IconName[] },
  { from: 0.82, icons: ["planet", "sparkle"] as IconName[] },
] as const;

type FlybyParticle = {
  id: number;
  iconName: IconName;
  delayMs: number;
  durMs: number;
  xPct: number;
  sizePx: number;
};

// Precomputes every particle's whole top-to-bottom trajectory (lane, size, timing) up front
// rather than animating anything from React state — each particle just gets a CSS keyframe
// scheduled to play once at its own delay, so nothing needs a per-frame JS update loop. Every
// particle enters near the top of the frame and exits off the bottom, exactly opposite the
// rocket's real direction of travel, which is what sells "the rocket is climbing" while it
// actually stays fixed on screen. Size stays constant for the whole pass (no growing-as-it-
// approaches effect) — simpler, and reads less busy than a scaling swarm.
function buildFlybyParticles(flightMs: number, count: number): FlybyParticle[] {
  const particles: FlybyParticle[] = [];
  // Stratified sampling for lane (x) and start time — plain Math.random() for either tends to
  // clump by chance, which reads as crowded rather than an evenly spread field. Shuffling a
  // fixed set of evenly-spaced slots, then jittering within each slot, keeps the spread even
  // while still looking organic rather than a rigid grid.
  const laneOrder = [...Array(count).keys()].sort(() => Math.random() - 0.5);
  const timeOrder = [...Array(count).keys()].sort(() => Math.random() - 0.5);
  const laneWidth = 100 / count;
  const timeSlotWidth = 1 / count;
  for (let i = 0; i < count; i++) {
    const startFrac = timeOrder[i] * timeSlotWidth + Math.random() * timeSlotWidth * 0.7;
    const stage = [...FLYBY_STAGES].reverse().find(s => startFrac >= s.from) ?? FLYBY_STAGES[0];
    const iconName = stage.icons[Math.floor(Math.random() * stage.icons.length)];
    const big = iconName === "moon" || iconName === "planet";
    particles.push({
      id: i,
      iconName,
      delayMs: LIFTOFF_MS + startFrac * flightMs,
      durMs: big ? 3200 + Math.random() * 900 : 1800 + Math.random() * 1000,
      xPct: 4 + laneOrder[i] * laneWidth + Math.random() * laneWidth * 0.6,
      sizePx: big ? 32 + Math.random() * 10 : 16 + Math.random() * 8,
    });
  }
  return particles;
}

const STARS = Array.from({ length: 40 }, (_, i) => ({
  left: (i * 53) % 100,
  top: (i * 31) % 55,
  size: 1 + (i % 3),
  dur: 2 + (i % 4),
  delay: (i % 10) * 0.3,
}));

const STYLE_TAG = (
  <style>{`
    @keyframes rfTwinkle{0%,100%{opacity:0.2}50%{opacity:1}}
    @keyframes rfCountPulse{0%{transform:scale(0.5);opacity:0}50%{transform:scale(1.25);opacity:1}100%{transform:scale(1);opacity:1}}
    @keyframes rfFlameFlicker{0%,100%{transform:scaleY(1) scaleX(1);opacity:0.9}50%{transform:scaleY(1.3) scaleX(0.8);opacity:0.6}}
    @keyframes rfShake{0%,100%{transform:translateX(0)}25%{transform:translateX(-2px)}75%{transform:translateX(2px)}}
    @keyframes rfIgnitionFlash{0%{opacity:0}30%{opacity:1}100%{opacity:0}}
    @keyframes rfMiniShake{0%,100%{transform:translate(0,0) rotate(0deg)}20%{transform:translate(-4px,-2px) rotate(-7deg)}40%{transform:translate(4px,-5px) rotate(6deg)}60%{transform:translate(-3px,-7px) rotate(-4deg)}80%{transform:translate(2px,-3px) rotate(3deg)}}
    @keyframes rfFuelRise{0%{transform:translate(-50%,0) scale(1);opacity:1}100%{transform:translate(-50%,-64px) scale(0.5);opacity:0}}
    @keyframes rfGhostCutout{0%{opacity:0.7}85%{opacity:0.7}100%{opacity:0}}
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

// Each launch's flying-past field. Every particle's whole trajectory is precomputed (see
// buildFlybyParticles), so this just needs to render one CSS keyframe per particle and let them
// play out on their own delay — no per-frame JS state updates. Every particle travels the same
// vertical line — in above the top edge, out below the bottom edge — only its lane (xPct), size,
// and timing differ, so the motion always reads as "coming toward the fixed camera from above
// and passing beneath it," never as radiating from the rocket itself.
//
// `keyPrefix` must be unique per simultaneously-mounted instance (a multi-team launch renders
// one Flyby per team, all at once) — CSS keyframe names are global, so without a per-instance
// prefix every team's particle #0, #1, etc. would collide and overwrite each other's animation.
function Flyby({ flightMs, count, frameH, keyPrefix }: { flightMs: number; count: number; frameH: number; keyPrefix: string }) {
  const particles = useMemo(() => buildFlybyParticles(flightMs, count), [flightMs, count]);
  const startY = -60;
  const endY = frameH + 60;
  const css = useMemo(() => particles.map(p => `
    @keyframes rfFly_${keyPrefix}_${p.id} {
      0% { transform: translate(-50%, ${startY}px); opacity: 0; }
      10% { opacity: 1; }
      85% { opacity: 1; }
      100% { transform: translate(-50%, ${endY}px); opacity: 0; }
    }
  `).join("\n"), [particles, endY, keyPrefix]);

  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
      <style>{css}</style>
      {particles.map(p => (
        <div key={p.id} style={{
          position: "absolute", left: `${p.xPct}%`, top: 0, color: "white",
          animation: `rfFly_${keyPrefix}_${p.id} ${p.durMs}ms linear ${p.delayMs}ms 1 both`,
        }}>
          <Icon name={p.iconName} size={p.sizePx} />
        </div>
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

// What "Save & Exit" snapshots and "Resume" restores — the round/team turn cursor and each
// team's secret fuel count (fuel lives in a ref, not React state, since it must stay hidden
// until the final reveal — losing it on resume would silently erase real progress, not just
// restart the round counter). Resuming skips straight to a fresh turn for the team who was up,
// rather than replaying the intro screen or the exact prompt that was on screen when it was saved.
type RocketFuelSnapshot = {
  teamIdx: number;
  round: number;
  fuel: Record<string | number, number>;
};

function validateRocketFuelSnapshot(raw: unknown, teamCount: number): RocketFuelSnapshot | undefined {
  const s = raw as Partial<RocketFuelSnapshot> | null | undefined;
  if (!s || typeof s.teamIdx !== "number" || s.teamIdx < 0 || s.teamIdx >= teamCount) return undefined;
  // Bounded by SOLO_MAX_ROUNDS (not TOTAL_ROUNDS) since a Save & Exit mid-bonus-round would
  // otherwise fail validation and silently discard real progress back to the intro screen.
  if (typeof s.round !== "number" || s.round < 1 || s.round > SOLO_MAX_ROUNDS) return undefined;
  return { teamIdx: s.teamIdx, round: s.round, fuel: s.fuel && typeof s.fuel === "object" ? s.fuel : {} };
}

export function RocketFuelGame({ questions, teams, onUpdateScore, onEnd, forceFinalRef, serializeStateRef, initialGameState }: GameProps) {
  const resumed = useRef(validateRocketFuelSnapshot(initialGameState, teams.length)).current;

  const pool = useRef((() => {
    const uvs = questions.filter(q => q.type === "use vocabulary in a sentence");
    const finalPool = uvs.length ? uvs : questions;
    return [...finalPool].sort(() => Math.random() - 0.5);
  })()).current;

  const [phase, setPhase] = useState<"intro" | "team-turn" | "team-end" | "launchpad" | "igniting" | "launching" | "final">(resumed ? "team-turn" : "intro");
  const [showHowTo, setShowHowTo] = useState(false);
  const [teamIdx, setTeamIdx] = useState(() => resumed?.teamIdx ?? 0);
  const [round, setRound] = useState(() => resumed?.round ?? 1);
  const [currentQ, setCurrentQ] = useState<QuestionData | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [turnFuel, setTurnFuel] = useState(0);
  const [countdown, setCountdown] = useState(3);
  const [launched, setLaunched] = useState(false);
  const [bonusAwarded, setBonusAwarded] = useState<Record<string | number, number>>({});

  const cursorRef = useRef(0);
  const fuelRef = useRef<Record<string | number, number>>(resumed?.fuel ?? {});

  useEffect(() => {
    if (!serializeStateRef) return;
    serializeStateRef.current = (): RocketFuelSnapshot => ({ teamIdx, round, fuel: fuelRef.current });
    return () => { if (serializeStateRef) serializeStateRef.current = null; };
  }, [serializeStateRef, teamIdx, round]);
  const turnFuelRef = useRef(0);
  // Guards against double-awarding points if the launch payout fires both from the natural
  // "landing" timeout and a forced early end racing each other.
  const payoutDoneRef = useRef(false);
  // How long solo's flythrough plays for — locked in once fuel is final (entering "launchpad"),
  // so it stays fixed for the rest of the sequence instead of recomputing every render.
  const soloFlightMsRef = useRef(SOLO_FLIGHT_MS_MIN);
  // The team's best fuel *before* this launch, and how long that run's flight would have lasted —
  // both captured fresh every time "launchpad" fires (so the bonus round's second launch compares
  // against launch #1 automatically, no special-casing needed) and read by the ghost rocket + the
  // results-screen comparison. 0 means no record yet this session (first-ever launch).
  const prevBestFuelRef = useRef(0);
  const prevBestFlightMsRef = useRef(0);

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

  // Resuming drops straight into "team-turn" for the team who was up, skipping the intro screen —
  // but unlike startTeamTurn(), it doesn't draw a first prompt, so do that once on mount.
  useEffect(() => {
    if (resumed) drawPrompt();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const endTurn = () => setPhase("team-end");

  // Paused while an answer is being shown — a turn spans several prompts in a row, so revealing
  // one shouldn't burn into the time budget for the rest of the turn while the teacher judges it.
  const { timeLeft } = useTurnTimer(TURN_SECONDS, phase === "team-turn", endTurn, teamIdx, showAnswer);

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
    if (next >= teams.length) {
      if (round >= TOTAL_ROUNDS) { setPhase("launchpad"); return; }
      setRound(r => r + 1);
      startTeamTurn(0);
      return;
    }
    startTeamTurn(next);
  };

  useEffect(() => {
    if (phase !== "launchpad") return;
    setCountdown(3);
    setLaunched(false);
    if (teams.length === 1) {
      const soloFuel = fuelRef.current[teams[0].id] ?? 0;
      const frac = Math.max(MIN_HEIGHT_FRACTION, Math.min(1, soloFuel / SOLO_FUEL_CEILING));
      soloFlightMsRef.current = SOLO_FLIGHT_MS_MIN + frac * (SOLO_FLIGHT_MS_MAX - SOLO_FLIGHT_MS_MIN);
      // Capture the record BEFORE (possibly) overwriting it, so the ghost/results comparison has
      // something to compare against — then update it right away, not gated on watching the
      // animation play out.
      const prevBestFuel = getBestFuel(teams[0].id);
      prevBestFuelRef.current = prevBestFuel;
      const prevBestFrac = Math.max(MIN_HEIGHT_FRACTION, Math.min(1, prevBestFuel / SOLO_FUEL_CEILING));
      prevBestFlightMsRef.current = SOLO_FLIGHT_MS_MIN + prevBestFrac * (SOLO_FLIGHT_MS_MAX - SOLO_FLIGHT_MS_MIN);
      setBestFuelIfHigher(teams[0].id, soloFuel);
    }
  }, [phase, teams]);

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
    // the flight resolves, so the scoreboard stays blank through the whole simulation. Solo
    // additionally spends LIFTOFF_MS actually rising off the pad before the flyby field takes
    // over, so that time needs to be added on top of the flyby's own duration.
    const isSolo = teams.length === 1;
    const flightMs = isSolo ? LIFTOFF_MS + soloFlightMsRef.current : ASCENT_MS;
    const finishT = setTimeout(finalizeLaunch, flightMs + HOLD_MS);
    return () => { clearTimeout(liftoffT); clearTimeout(finishT); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const arenaStyle: React.CSSProperties = {
    margin: "-20px", padding: "20px", borderRadius: "20px", position: "relative", overflow: "hidden",
    background: "radial-gradient(ellipse at 50% 110%,#1E1B4B 0%,#0B0B2E 55%,#030014 100%)",
  };

  // Tutorial mockup: src/data/tutorials/rocket.tsx — update if this intro's rules text changes.
  if (phase === "intro") return (
    <div style={{ ...arenaStyle, textAlign: "center" }}>
      <Starfield />
      {STYLE_TAG}
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ background: "linear-gradient(160deg,#312E81,#0B0B2E)", border: "2px solid #A5B4FC55", borderRadius: "20px", padding: "28px 24px", marginBottom: "10px", color: "white", maxWidth: "560px", margin: "0 auto 10px", boxShadow: "0 0 50px rgba(99,102,241,0.4)" }}>
          <div style={{ marginBottom: "10px" }}><Icon name="rocket" size={36} /></div>
          <div style={{ fontWeight: "900", fontSize: "20px", marginBottom: "10px", color: "#A5B4FC" }}>Rocket Fuel</div>
          <div style={{ fontSize: "15px", lineHeight: 1.7 }}>
            Each team gets <strong style={{ color: "#A5B4FC" }}>{TOTAL_ROUNDS} rounds of 90 seconds</strong> at mission control — use the given word in your own sentence, and every correct one adds fuel. Stuck on a prompt? Skip it for a new one, no penalty.<br />
            Nobody's fuel level is revealed until every team has fuelled up — then all rockets <strong style={{ color: "#A5B4FC" }}>launch together</strong>, and whoever fuelled the most flies the highest!
          </div>
        </div>
        <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap", marginBottom: "24px" }}>
          {teams.map((t, i) => (
            <div key={t.id} style={{ background: `linear-gradient(160deg,${t.color.dark}55,#0B0B2E)`, border: `3px solid ${t.color.bg}`, borderRadius: "14px", padding: "10px 18px", fontWeight: "800", fontSize: "14px", color: "white", display: "flex", alignItems: "center", gap: "6px" }}>
              {i + 1}. <TeamIcon team={t} color="white" /> {t.name}
            </div>
          ))}
        </div>
        <button onClick={() => setShowHowTo(true)} className="rf-btn" style={{ display: "inline-flex", alignItems: "center", gap: "6px", marginBottom: "14px", background: "rgba(255,255,255,0.95)", color: GM.color, border: `2px solid ${GM.color}`, boxShadow: "0 2px 8px rgba(0,0,0,0.18)", borderRadius: "12px", padding: "10px 24px", fontSize: "14px", fontWeight: "800", cursor: "pointer" }}>
          <Icon name="help" size={15} /> How to Play
        </button>
        {showHowTo && (
          <HowToPlayModal
            gameName={GM.name} gameIcon={GAME_ICONS[GM.id]} accentColor={GM.color}
            steps={ROCKET_TUTORIAL_STEPS}
            onClose={() => setShowHowTo(false)}
          />
        )}
        <button onClick={() => startTeamTurn(0)} className="rf-btn" style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "linear-gradient(135deg,#4338CA,#818CF8)", color: "white", border: "none", borderRadius: "16px", padding: "16px 48px", fontSize: "19px", fontWeight: "900", cursor: "pointer", boxShadow: "0 6px 24px rgba(99,102,241,0.5)", transition: "transform 0.15s ease" }}>
          <Icon name="flame" size={20} /> Ignite Engines!
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
          <span style={{ color: "white", fontWeight: "900", fontSize: "16px", textShadow: "0 1px 3px rgba(0,0,0,0.4)", display: "inline-flex", alignItems: "center", gap: "6px" }}><Icon name="rocket" size={15} /> {activeTeam.name}'s turn — {round > TOTAL_ROUNDS ? "Bonus Round" : `Round ${round}/${TOTAL_ROUNDS}`}, Team {teamIdx + 1} of {teams.length}</span>
          {phase === "team-turn" && (
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <TurnTimerBar timeLeft={timeLeft} totalSeconds={TURN_SECONDS} />
              <button onClick={endTurn} className="rf-btn" style={{ display: "inline-flex", alignItems: "center", gap: "5px", background: "rgba(0,0,0,0.25)", color: "white", border: "1.5px solid rgba(255,255,255,0.4)", borderRadius: "10px", padding: "6px 14px", fontSize: "12px", fontWeight: "800", cursor: "pointer", whiteSpace: "nowrap", transition: "transform 0.15s ease" }}><Icon name="stop" size={11} /> End Turn</button>
            </div>
          )}
        </div>

        {phase === "team-turn" && (
          <>
            {/* No number shown here on purpose — a live count would tip off every other team.
                A correct answer just makes the rocket visibly gulp down a bit of fuel. */}
            <div style={{ textAlign: "center", marginBottom: "10px", position: "relative", height: "70px" }}>
              <div key={`shake-${turnFuel}`} style={{ display: "inline-flex", alignItems: "flex-end", gap: "4px", filter: `drop-shadow(0 0 10px ${activeTeam.color.bg})`, animation: turnFuel > 0 ? "rfMiniShake 0.45s ease-in-out" : "none" }}>
                <MascotSprite mascot={activeTeam.mascot} fallback={null} size={26} />
                <Icon name="rocket" size={44} />
              </div>
              {turnFuel > 0 && (
                <div key={`burst-${turnFuel}`} style={{ position: "absolute", left: "50%", bottom: "0", animation: "rfFuelRise 0.6s ease-out forwards" }}><Icon name="fuel" size={20} color="#FDBA74" /></div>
              )}
            </div>

            <div style={{ maxWidth: "520px", margin: "0 auto" }}>
              <QuestionCard question={currentQ} showAnswer={showAnswer} onReveal={() => setShowAnswer(true)} gameId="rocket" />
              <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginTop: "14px" }}>
                {showAnswer ? (
                  <>
                    <button onClick={() => judge(true)} className="rf-btn" style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "linear-gradient(135deg,#15803D,#22C55E)", color: "white", border: "none", borderRadius: "12px", padding: "12px 28px", fontSize: "15px", fontWeight: "800", cursor: "pointer", transition: "transform 0.15s ease" }}><Icon name="check" size={14} /> Fuelled it!</button>
                    <button onClick={() => judge(false)} className="rf-btn" style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "linear-gradient(135deg,#B91C1C,#EF4444)", color: "white", border: "none", borderRadius: "12px", padding: "12px 28px", fontSize: "15px", fontWeight: "800", cursor: "pointer", transition: "transform 0.15s ease" }}><Icon name="close" size={13} /> No fuel</button>
                  </>
                ) : (
                  <button onClick={drawPrompt} className="rf-btn" style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(255,255,255,0.1)", color: "#C7D2FE", border: "2px solid #A5B4FC55", borderRadius: "12px", padding: "10px 22px", fontSize: "14px", fontWeight: "700", cursor: "pointer", transition: "transform 0.15s ease" }}><Icon name="next" size={13} /> Skip — try a different one</button>
                )}
              </div>
            </div>
          </>
        )}

        {phase === "team-end" && (
          <div style={{ textAlign: "center" }}>
            <div style={{ background: "linear-gradient(160deg,#312E81,#0B0B2E)", border: "2px solid #A5B4FC66", borderRadius: "16px", padding: "20px", marginBottom: "16px" }}>
              <div style={{ marginBottom: "6px" }}><Icon name="rocket" size={34} /></div>
              <div style={{ fontWeight: "900", fontSize: "20px", color: "white", marginBottom: "8px" }}>{activeTeam.name}'s tank is sealed!</div>
              <div style={{ fontSize: "14px", color: "#C7D2FE" }}>Nice work! Time for the next team.</div>
            </div>
            <button onClick={nextTeam} className="rf-btn" style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "linear-gradient(135deg,#4338CA,#818CF8)", color: "white", border: "none", borderRadius: "14px", padding: "14px 36px", fontSize: "17px", fontWeight: "900", cursor: "pointer", transition: "transform 0.15s ease" }}>
              {teamIdx + 1 >= teams.length
                ? (round >= TOTAL_ROUNDS ? <><Icon name="rocket" size={18} /> Go to Launchpad</> : <><Icon name="next" size={18} /> Start Round {round + 1}</>)
                : <><Icon name="next" size={18} /> Next Team's Turn</>}
            </button>
          </div>
        )}
      </div>
    </div>
  );

  if (phase === "launchpad" || phase === "igniting" || phase === "launching") {
    const isSolo = teams.length === 1;

    if (isSolo) {
      // Solo's launch is a camera locked on the rocket, not a rocket climbing past a fixed
      // camera — the rocket itself never moves in frame. See buildFlybyParticles/Flyby for the
      // flying-past field, and soloFlightMsRef for how fuel maps to how long it plays.
      const t = teams[0];
      const frameH = MAX_FLIGHT_PX + 90;
      const flightMs = soloFlightMsRef.current;
      return (
        <div style={{ ...arenaStyle, textAlign: "center" }}>
          <Starfield />
          {STYLE_TAG}
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ fontWeight: "900", fontSize: "20px", color: "#A5B4FC", marginBottom: "8px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
              {phase === "launchpad" ? <><Icon name="satellite" size={18} /> All engines fuelled. Prepare for launch!</> : phase === "igniting" ? <><Icon name="flame" size={18} /> IGNITION...</> : <><Icon name="rocket" size={18} /> LAUNCH!</>}
            </div>
            {/* Fuel itself stays secret (the "???" tag below) right up to the reveal — this
                doesn't break that, it only shows the target from a PAST launch, never this run's
                own number. */}
            {prevBestFuelRef.current > 0 && (
              <div style={{ fontSize: "13px", color: "#C4B5FD", fontWeight: "700", marginBottom: "10px" }}>
                <Icon name="trophy" size={12} /> Chasing your best: {prevBestFuelRef.current} fuel
              </div>
            )}
            <div style={{ position: "relative", height: `${frameH}px`, borderRadius: "18px", overflow: "hidden", background: "radial-gradient(ellipse at 50% 40%,#1E1B4B 0%,#030014 75%)" }}>
              {/* Ground drops away below on liftoff, in step with the rocket rising off it —
                  the camera is meant to be attached to the rocket, not watching it from afar. */}
              <div style={{
                position: "absolute", left: 0, right: 0, bottom: 0, height: "60px",
                background: "linear-gradient(180deg,#1E293B,#0B0F17)", borderTop: "3px solid #334155",
                transform: launched ? "translateY(140px)" : "translateY(0)",
                opacity: launched ? 0 : 1,
                transition: `transform ${LIFTOFF_MS}ms ease-in, opacity ${LIFTOFF_MS}ms ease-in`,
              }} />

              {phase === "igniting" && (
                <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 100%,rgba(253,224,71,0.5),transparent 60%)", animation: `rfIgnitionFlash ${IGNITION_MS}ms ease-out` }} />
              )}

              {phase === "launching" && launched && <Flyby flightMs={flightMs} count={SOLO_FLYBY_COUNT} frameH={frameH} keyPrefix="solo" />}

              {/* The "ghost" — a translucent companion that sits beside the real rocket and cuts
                  out (fades) at the exact moment the PREVIOUS best run's flight would have ended.
                  Beat the record and the ghost visibly drops away first, real rocket still going;
                  fall short and the ghost is still flying when this run's flyby ends. Deliberately
                  not part of Flyby/buildFlybyParticles — this doesn't travel the flyby field, it's
                  a fixed companion beside the stationary rocket, since the camera never moves. */}
              {phase === "launching" && launched && prevBestFuelRef.current > 0 && (
                <div style={{
                  position: "absolute", left: "50%", top: "50%",
                  transform: "translate(calc(-50% + 34px), -50%)",
                  animation: `rfGhostCutout ${prevBestFlightMsRef.current}ms ease-in ${LIFTOFF_MS}ms both`,
                }}>
                  <div style={{ filter: "grayscale(1) brightness(1.6)", opacity: 0.85 }}><Icon name="rocket" size={30} /></div>
                </div>
              )}

              {/* Starts sitting on the pad (offset down from center) and rises to its fixed
                  cruise position over LIFTOFF_MS once launched — after that it never moves again;
                  the flyby field above is what carries the rest of the climb. */}
              <div style={{
                position: "absolute", left: "50%", top: "50%",
                transform: `translate(-50%,-50%) translateY(${launched ? 0 : groundOffsetPx(frameH)}px)`,
                transition: `transform ${LIFTOFF_MS}ms ease-out`,
              }}>
                {(phase === "igniting" || (phase === "launching" && launched)) && (
                  <div style={{ position: "absolute", left: "50%", bottom: "-18px", transform: "translateX(-50%)", animation: "rfFlameFlicker 0.15s ease-in-out infinite" }}><Icon name="flame" size={26} color="#F97316" /></div>
                )}
                <div style={{ position: "absolute", left: "-10px", top: "6px", filter: `drop-shadow(0 0 4px ${t.color.bg})` }}>
                  <MascotSprite mascot={t.mascot} fallback={null} size={20} />
                </div>
                <div style={{ filter: `drop-shadow(0 0 10px ${t.color.bg})`, animation: phase === "launchpad" ? "none" : "rfShake 0.1s linear infinite" }}><Icon name="rocket" size={48} /></div>
              </div>

              <div style={{ position: "absolute", bottom: "14px", left: "50%", transform: "translateX(-50%)", maxWidth: "140px", background: `linear-gradient(180deg,${t.color.dark}88,#0B0B2E)`, border: `2px solid ${t.color.bg}`, borderRadius: "10px", padding: "6px 10px", fontSize: "12px", fontWeight: "800", color: "white", textAlign: "center", zIndex: 1 }}>
                <TeamIcon team={t} color="white" /> {t.name}<br />
                <span style={{ color: "#FDBA74", display: "inline-flex", alignItems: "center", gap: "3px" }}><Icon name="fuel" size={11} /> ???</span>
              </div>
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

    // Multi-team: everyone launches side by side in one shared frame — the whole point of the
    // comparison is seeing whoever fuelled the most visibly climb higher and leave the rest
    // behind, which only reads correctly when every rocket shares one frame of reference and
    // one camera. Ties in fuel end at the same height, by design. Same visual language as solo
    // (ground falling away, a single flyby field flying past everyone) — it's just one shared
    // scene instead of an isolated one per rocket, with height doing the comparison instead of
    // flight length.
    // actualMaxFuel (unfloored) decides who's actually in the lead — maxFuel below is only
    // floored at 1 to keep the height-fraction division safe, and using the floored value here
    // too would make everyone "the leader" whenever the whole class scored zero.
    const actualMaxFuel = Math.max(...teams.map(t => fuelRef.current[t.id] ?? 0));
    const maxFuel = Math.max(1, actualMaxFuel);
    const frameH = MAX_FLIGHT_PX + 90;
    // Everyone rises together for the first third of the climb, then the pack peels off one
    // tier at a time — dead last stalls and tumbles away first, then the next tier up, and so
    // on, so the standings reveal themselves in order instead of every loser dropping out at
    // once. Whoever's still in the lead at the end (tied leaders included, so a tie visibly ends
    // together) never falls — it just keeps climbing to its real height.
    const RISE_PCT = 32;
    const FALL_STEP_PCT = 10;
    const COMMON_PX = 0.38 * MAX_FLIGHT_PX;
    const rankById = Object.fromEntries(rankByFuel(teams, fuelRef.current).map(r => [r.team.id, r.rank]));
    const maxRank = Math.max(...Object.values(rankById));
    return (
      <div style={{ ...arenaStyle, textAlign: "center" }}>
        <Starfield />
        {STYLE_TAG}
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ fontWeight: "900", fontSize: "20px", color: "#A5B4FC", marginBottom: "18px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
            {phase === "launchpad" ? <><Icon name="satellite" size={18} /> All engines fuelled. Prepare for launch!</> : phase === "igniting" ? <><Icon name="flame" size={18} /> IGNITION...</> : <><Icon name="rocket" size={18} /> LAUNCH!</>}
          </div>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-end", gap: "28px", height: `${frameH}px`, position: "relative", overflow: "hidden", borderRadius: "18px" }}>
            {/* Ground drops away below on liftoff, the same beat as solo — the camera stays
                with the fleet as it climbs instead of watching from a fixed spot on the pad. */}
            <div style={{
              position: "absolute", left: 0, right: 0, bottom: 0, height: "60px", zIndex: 0,
              background: "linear-gradient(180deg,#1E293B,#0B0F17)", borderTop: "3px solid #334155",
              transform: launched ? "translateY(140px)" : "translateY(0)",
              opacity: launched ? 0 : 1,
              transition: `transform ${LIFTOFF_MS}ms ease-in, opacity ${LIFTOFF_MS}ms ease-in`,
            }} />

            {phase === "igniting" && (
              <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 100%,rgba(253,224,71,0.5),transparent 60%)", animation: `rfIgnitionFlash ${IGNITION_MS}ms ease-out` }} />
            )}

            {/* One shared field flies past the whole fleet at once, rather than each rocket
                getting its own — everyone's climbing through the same sky together. */}
            {phase === "launching" && launched && <Flyby flightMs={Math.max(1000, ASCENT_MS - LIFTOFF_MS)} count={SOLO_FLYBY_COUNT} frameH={frameH} keyPrefix="fleet" />}

            {teams.map(t => {
              const fuel = fuelRef.current[t.id] ?? 0;
              const isLeader = fuel === actualMaxFuel;
              const heightFraction = Math.max(MIN_HEIGHT_FRACTION, fuel / maxFuel);
              const finalPx = heightFraction * MAX_FLIGHT_PX;
              const keyframeName = `rfClimb_${t.id}`;
              // Rank 0 is the lead tier; higher ranks are worse. Steps-from-worst turns that into
              // a fall order — the worst tier has 0 steps (falls the instant the shared rise
              // ends), each better tier gets one more step (one more beat of "still hanging on")
              // before it's their turn to drop.
              const stepsFromWorst = maxRank - (rankById[t.id] ?? 0);
              const fallStartPct = RISE_PCT + stepsFromWorst * FALL_STEP_PCT;
              const keyframeCss = isLeader
                ? `@keyframes ${keyframeName} {
                    0% { transform: translateY(0); }
                    ${RISE_PCT}% { transform: translateY(-${COMMON_PX}px); }
                    100% { transform: translateY(-${finalPx}px); }
                  }`
                : `@keyframes ${keyframeName} {
                    0% { transform: translateY(0) rotate(0deg); opacity: 1; }
                    ${RISE_PCT}% { transform: translateY(-${COMMON_PX}px) rotate(0deg); opacity: 1; }
                    ${fallStartPct}% { transform: translateY(-${COMMON_PX}px) rotate(0deg); opacity: 1; }
                    ${fallStartPct + 6}% { transform: translateY(-${COMMON_PX * 0.85}px) rotate(-10deg); opacity: 1; }
                    100% { transform: translateY(180px) rotate(${340 + (1 - heightFraction) * 260}deg); opacity: 0; }
                  }`;
              return (
                <div key={t.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", width: "70px", height: "100%", position: "relative" }}>
                  <style>{keyframeCss}</style>
                  <div style={{
                    position: "relative",
                    animation: launched ? `${keyframeName} ${ASCENT_MS}ms cubic-bezier(0.4,0,0.2,1) forwards` : "none",
                  }}>
                    {(phase === "igniting" || (phase === "launching" && launched)) && (
                      <div style={{ position: "absolute", left: "50%", bottom: "-18px", transform: "translateX(-50%)", animation: "rfFlameFlicker 0.15s ease-in-out infinite" }}><Icon name="flame" size={22} color="#F97316" /></div>
                    )}
                    <div style={{ position: "absolute", left: "-8px", top: "6px", filter: `drop-shadow(0 0 4px ${t.color.bg})` }}>
                      <MascotSprite mascot={t.mascot} fallback={null} size={18} />
                    </div>
                    <div style={{ filter: `drop-shadow(0 0 8px ${t.color.bg})`, animation: phase === "launchpad" ? "none" : "rfShake 0.1s linear infinite" }}><Icon name="rocket" size={40} /></div>
                  </div>
                  {/* Centered explicitly (not just via the flex parent's static position) and
                      capped with maxWidth so a long custom team name wraps onto another line
                      instead of growing wide enough to overlap the neighbouring rocket's bubble. */}
                  <div style={{ position: "absolute", bottom: "0", left: "50%", transform: "translateX(-50%)", maxWidth: "94px", background: `linear-gradient(180deg,${t.color.dark}88,#0B0B2E)`, border: `2px solid ${t.color.bg}`, borderRadius: "10px", padding: "6px 10px", fontSize: "12px", fontWeight: "800", color: "white", textAlign: "center" }}>
                    <TeamIcon team={t} color="white" /> {t.name}<br />
                    <span style={{ color: "#FDBA74", display: "inline-flex", alignItems: "center", gap: "3px" }}><Icon name="fuel" size={11} /> ???</span>
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
  const isSolo = teams.length === 1;
  // One optional bonus launch, same sitting — see SOLO_MAX_ROUNDS. Never offered again after the
  // bonus round itself (round would already be SOLO_MAX_ROUNDS by then).
  const canLaunchAgain = isSolo && round < SOLO_MAX_ROUNDS;
  const launchAgain = () => {
    fuelRef.current[teams[0].id] = 0;
    payoutDoneRef.current = false;
    setRound(r => r + 1);
    startTeamTurn(0);
  };
  return (
    <div style={{ ...arenaStyle, textAlign: "center" }}>
      <Starfield />
      {STYLE_TAG}
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ marginBottom: "6px" }}><Icon name="trophy" size={48} color="#A5B4FC" /></div>
        <div style={{ fontWeight: "900", fontSize: "24px", color: "#A5B4FC", marginBottom: "16px" }}>{headline}</div>
        <div style={{ display: "grid", gridTemplateColumns: teamsGridCols(teams.length), gap: "10px", margin: "0 auto 20px", maxWidth: "700px" }}>
          {ranked.map(({ team: t, fuel: fuelCount, rank }) => {
            const basePts = fuelCount * POINTS_PER_CORRECT;
            return (
              <div key={t.id} style={{ background: `linear-gradient(160deg,${t.color.dark}55,#0B0B2E)`, border: `2px solid ${t.color.bg}`, borderRadius: "14px", padding: "12px" }}>
                <div><RankBadge rank={rank} size={22} /></div>
                <div style={{ fontWeight: "800", color: "white", fontSize: "14px", marginTop: "4px" }}><TeamIcon team={t} /> {t.name}</div>
                <div style={{ color: "#FDBA74", fontWeight: "800", fontSize: "13px", marginTop: "2px", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}><Icon name="fuel" size={12} /> {fuelCount} fuelled · {basePts} pts</div>
                {bonusAwarded[t.id] > 0 && <div style={{ color: "#86EFAC", fontWeight: "700", fontSize: "12px", marginTop: "2px" }}>+{bonusAwarded[t.id]} launch bonus</div>}
                {isSolo && (
                  prevBestFuelRef.current > 0 ? (
                    fuelCount > prevBestFuelRef.current
                      ? <div style={{ color: "#FCD34D", fontWeight: "800", fontSize: "12px", marginTop: "4px" }}><Icon name="trophy" size={11} /> New personal best!</div>
                      : <div style={{ color: "#94A3B8", fontWeight: "700", fontSize: "12px", marginTop: "4px" }}>{prevBestFuelRef.current - fuelCount} fuel short of your best of {prevBestFuelRef.current}</div>
                  ) : (
                    <div style={{ color: "#94A3B8", fontWeight: "700", fontSize: "12px", marginTop: "4px" }}>First launch this session — that's your best to beat!</div>
                  )
                )}
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
          {canLaunchAgain && (
            <button onClick={launchAgain} className="rf-btn" style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "linear-gradient(135deg,#7C3AED,#C4B5FD)", color: "white", border: "none", borderRadius: "12px", padding: "12px 28px", fontSize: "16px", fontWeight: "800", cursor: "pointer", transition: "transform 0.15s ease" }}><Icon name="rocket" size={16} /> One More Launch!</button>
          )}
          <button onClick={onEnd} className="rf-btn" style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "linear-gradient(135deg,#4338CA,#818CF8)", color: "white", border: "none", borderRadius: "12px", padding: "12px 28px", fontSize: "16px", fontWeight: "800", cursor: "pointer", transition: "transform 0.15s ease" }}><Icon name="checkeredFlag" size={16} /> End Game</button>
        </div>
      </div>
    </div>
  );
}
