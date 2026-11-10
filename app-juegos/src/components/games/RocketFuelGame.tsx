import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { TeamIcon, MascotSprite } from "../shared/TeamIcon";
import { Icon, type IconName } from "../shared/Icon";
import { RankBadge } from "../shared/RankBadge";
import type { RealtimeChannel } from "@supabase/supabase-js";
import type { GameProps, QuestionData, Team } from "../../types";
import { useTurnTimer } from "../../hooks/useTurnTimer";
import { TurnTimerBar } from "../shared/TurnTimerBar";
import { QuestionCard } from "../shared/QuestionCard";
import { teamsGridCols, GAME_MODES, GAME_ICONS } from "../../data/constants";
import { HowToPlayModal } from "../shared/HowToPlayModal";
import { PhoneJoinPanel } from "../shared/PhoneJoinPanel";
import { PhoneReconnectBadge } from "../shared/PhoneReconnectBadge";
import { ROCKET_TUTORIAL_STEPS } from "../../data/tutorials/rocket";
import { playSound } from "../../lib/sounds";
import { setMusicGame, stopMusic } from "../../lib/music";
import {
  generateSessionCode, openRocketChannel, closeChannel,
  type RocketFuelPhase, type RocketFuelStatePayload, type RocketFuelActionPayload,
} from "../../lib/liveSession";

const GM = GAME_MODES.find(g => g.id === "rocket")!;

// Bumped from 90s per the teacher's own in-class call — 90 ran out before slower-working students
// could even get one prompt out, let alone several.
const TURN_SECONDS = 120;
// Every team gets this many turns (each building more secret fuel) before launch — a single
// turn per team felt too short on its own, per teacher feedback; 2 gives the full experience
// without dragging the game out.
const TOTAL_ROUNDS = 2;
// Solo only: after the first launch, one optional bonus round for "one more launch, try to beat
// it" — see the "One More Launch!" button on the final screen. Multi-team never reaches this;
// TOTAL_ROUNDS stays exactly 2 for everyone as before.
const SOLO_MAX_ROUNDS = 3;
const POINTS_PER_CORRECT = 20;
// Every new prompt — first draw, after a skip, or the next one right after an answer — opens with
// this many guaranteed seconds where the main turn clock is paused, just for reading it. Teacher
// feedback: without this, a student could lose several seconds of their turn just processing the
// prompt before they'd even started trying to answer it.
const READING_SECONDS = 10;
// A correct answer hands back a random one of these to the turn clock — never points, since fuel
// is a secret until launch and shouldn't gain a luck element; time is the reward instead, with the
// exact amount (including sometimes nothing, so it's not a bonus every single time) a fun surprise
// rather than always the max. Was a flat 25% each for 0/5/10/15 — teacher feedback playing live:
// a good team almost never actually ran out the clock, since the max bonus landed often enough to
// keep extending a turn indefinitely. Weighted by repetition instead of a flat pick so 15s (the one
// that was keeping turns going) is now the rarest outcome, and getting nothing is the most common:
// 0=35%, 5=25%, 10=25%, 15=15%.
const TIME_BONUS_OPTIONS = [0, 0, 0, 0, 0, 0, 0, 5, 5, 5, 5, 5, 10, 10, 10, 10, 10, 15, 15, 15];
const LAUNCH_BONUS_BY_RANK = [50, 30, 15, 5];
const MAX_FLIGHT_PX = 460;
const MIN_HEIGHT_FRACTION = 0.12; // even a 0-fuel rocket still visibly lifts off
const ASCENT_MS = 14000;
const IGNITION_MS = 550;
const HOLD_MS = 1600;
const LIFTOFF_MS = 1800;
const FLYBY_COUNT = 26;

// Solo tracks fuel per ROUND, not just per team — each round is raced as its own separate
// rocket (see roundFuelRef below), so "how much fuel team X has" isn't a single number, it's one
// number per round played. Every round but the most recent one just played renders as a muted
// "shadow" rocket — a target from an earlier attempt this game, not a real competitor — using
// this shared grey palette and a synthetic id so it never collides with a real team.id.
const SHADOW_COLOR = { name: "Shadow", bg: "#94A3B8", light: "#E2E8F0", dark: "#334155", emoji: "👻" };
const shadowRoundId = (roundNum: number) => `rocket-fuel-shadow-round-${roundNum}`;
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
    @keyframes rfTimeBonusBanner{
      0%{transform:translateX(-50%) translateY(-20px) scale(0.6);opacity:0}
      10%{transform:translateX(-50%) translateY(0) scale(1.35);opacity:1}
      16%{transform:translateX(-50%) translateY(0) scale(1);opacity:1}
      /* A gentle pulse through the whole hold, not a static sit — easy to tune out a big banner
         that stops moving the instant it lands; still catches the eye on a second glance. */
      30%{transform:translateX(-50%) translateY(0) scale(1.1);opacity:1}
      42%{transform:translateX(-50%) translateY(0) scale(1);opacity:1}
      54%{transform:translateX(-50%) translateY(0) scale(1.1);opacity:1}
      66%{transform:translateX(-50%) translateY(0) scale(1);opacity:1}
      90%{transform:translateX(-50%) translateY(0) scale(1);opacity:1}
      100%{transform:translateX(-50%) translateY(-10px) scale(0.95);opacity:0}
    }
    .rf-btn:hover:not(:disabled){filter:brightness(1.1)}
    .rf-btn:active:not(:disabled){transform:translate(4px,4px) !important;box-shadow:0 0 0 #1A1A2E !important}
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

// What "Save & Exit" snapshots and "Resume" restores — the round/team turn cursor, each team's
// secret fuel count, and (solo only) each individual round's own fuel tally (fuel lives in refs,
// not React state, since it must stay hidden until the final reveal — losing it on resume would
// silently erase real progress, not just restart the round counter). roundFuel is what lets a
// resumed game still show the correct shadow rockets for rounds finished before the save.
// Resuming skips straight to a fresh turn for the team who was up, rather than replaying the
// intro screen or the exact prompt that was on screen when it was saved.
type RocketFuelSnapshot = {
  teamIdx: number;
  round: number;
  fuel: Record<string | number, number>;
  roundFuel: Record<number, number>;
};

function validateRocketFuelSnapshot(raw: unknown, teamCount: number): RocketFuelSnapshot | undefined {
  const s = raw as Partial<RocketFuelSnapshot> | null | undefined;
  if (!s || typeof s.teamIdx !== "number" || s.teamIdx < 0 || s.teamIdx >= teamCount) return undefined;
  // Bounded by SOLO_MAX_ROUNDS (not TOTAL_ROUNDS) since a Save & Exit mid-bonus-round would
  // otherwise fail validation and silently discard real progress back to the intro screen.
  if (typeof s.round !== "number" || s.round < 1 || s.round > SOLO_MAX_ROUNDS) return undefined;
  return {
    teamIdx: s.teamIdx,
    round: s.round,
    fuel: s.fuel && typeof s.fuel === "object" ? s.fuel : {},
    roundFuel: s.roundFuel && typeof s.roundFuel === "object" ? s.roundFuel : {},
  };
}

export function RocketFuelGame({ questions, teams, onUpdateScore, onEnd, forceFinalRef, serializeStateRef, initialGameState, presetPhoneSession, onRequestPhoneSession }: GameProps) {
  const resumed = useRef(validateRocketFuelSnapshot(initialGameState, teams.length)).current;

  const pool = useRef((() => {
    const uvs = questions.filter(q => q.type === "use vocabulary in a sentence");
    const finalPool = uvs.length ? uvs : questions;
    return [...finalPool].sort(() => Math.random() - 0.5);
  })()).current;

  const [phase, setPhase] = useState<"intro" | "team-turn" | "team-end" | "launchpad" | "igniting" | "launching" | "final">(resumed ? "team-turn" : "intro");
  // Custom Suno tension track — see GAME_OVERRIDES in lib/music.ts.
  useEffect(() => {
    setMusicGame("rocket");
    return () => setMusicGame(null);
  }, []);
  const [showHowTo, setShowHowTo] = useState(false);
  const [teamIdx, setTeamIdx] = useState(() => resumed?.teamIdx ?? 0);
  const [round, setRound] = useState(() => resumed?.round ?? 1);
  const [currentQ, setCurrentQ] = useState<QuestionData | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [turnFuel, setTurnFuel] = useState(0);
  const [countdown, setCountdown] = useState(3);
  const [launched, setLaunched] = useState(false);
  const [bonusAwarded, setBonusAwarded] = useState<Record<string | number, number>>({});
  // True for READING_SECONDS right after every new prompt — see drawPrompt and READING_SECONDS.
  const [reading, setReading] = useState(false);
  // The latest correct-answer time bonus, just to animate it — see judge(). Only ever grows (a new
  // key each time), so the popup retriggers its CSS animation on every correct answer in a row.
  const [timeBonusPopup, setTimeBonusPopup] = useState<{ amount: number; key: number } | null>(null);

  // --- Phone mode — every phone on the active team gets its own prompt, see liveSession.ts's
  // Rocket Fuel section for the full design and RocketFuelGame's channel effect below.
  const [inputMode, setInputMode] = useState<"screen" | "phone">(presetPhoneSession ? "phone" : "screen");
  const [introStep, setIntroStep] = useState<"setup" | "qr">("setup");
  const [sessionCode, setSessionCode] = useState<string | null>(presetPhoneSession?.code ?? null);
  const [sessionIsClassLevel, setSessionIsClassLevel] = useState(!!presetPhoneSession);
  const [connectedTeamIds, setConnectedTeamIds] = useState<Set<string | number>>(new Set());
  // Mirrors connectedByTeamRef for render reads (the floating phone count, the "N phones
  // connected" readout on the mission-control placeholder) — the ref alone is enough for the
  // channel effect's own long-lived callbacks, but a render needs reactive state to read from.
  const [connectedByTeam, setConnectedByTeam] = useState<Record<string, string[]>>({});
  // This device's own currently-assigned prompt, per connected phone on the active team — see
  // dealPromptTo below. Cleared for a team's devices the moment its turn ends (endTurn), so a
  // phone's view naturally falls back to "being reviewed" instead of a stale prompt.
  const [promptsByDevice, setPromptsByDevice] = useState<Record<string, QuestionData>>({});
  // One turn's worth of phone submissions, judged on the team-end screen — see reviewQueue.
  // Cleared at the start of every team's turn (startTeamTurn), same lifetime as turnFuel.
  const [submissions, setSubmissions] = useState<{ id: number; deviceId: string; text: string; word?: string }[]>([]);
  // Phone mode only — each connected device's own remaining seconds, NOT a shared team pool (see
  // liveSession.ts's Rocket Fuel section for why that changed). Starts at TURN_SECONDS the moment
  // a device is first dealt a prompt (dealPromptTo), ticks down once a second while it's that
  // team's live turn (the effect below), and is cleared along with that team's prompts whenever
  // its turn ends (clearPromptsForTeam) so its NEXT turn starts with a fresh clock, not 0.
  const [deviceTimeLeft, setDeviceTimeLeft] = useState<Record<string, number>>({});

  const cursorRef = useRef(0);
  const readingKeyRef = useRef(0);
  const timeBonusKeyRef = useRef(0);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const connectedTeamIdsRef = useRef<Set<string | number>>(new Set());
  const connectedByTeamRef = useRef<Record<string, string[]>>({});
  const promptsByDeviceRef = useRef<Record<string, QuestionData>>({});
  const deviceTimeLeftRef = useRef<Record<string, number>>({});
  // The most recent time bonus each device has earned, broadcast so that device's own phone can
  // show it on the "Sent!" screen — see liveSession.ts's lastBonusByDevice. key only ever
  // increases (bonusKeyCounterRef), so a phone can tell a fresh bonus from one it already showed.
  const lastBonusByDeviceRef = useRef<Record<string, { amount: number; key: number }>>({});
  const bonusKeyCounterRef = useRef(0);
  const submissionIdRef = useRef(0);
  const sendStateRef = useRef<(() => void) | null>(null);
  const fuelRef = useRef<Record<string | number, number>>(resumed?.fuel ?? {});
  // Solo only: each individual round's own fuel tally, kept separate from fuelRef (which stays a
  // per-launch-cycle cumulative total used for scoring). Never reset between rounds or launches —
  // round 1's entry survives all the way to the bonus round's launch, so it can still render as a
  // shadow rocket there. See judge() (where it's filled in) and the launchpad render branch below
  // (where it's read).
  const roundFuelRef = useRef<Record<number, number>>(resumed?.roundFuel ?? {});

  useEffect(() => {
    if (!serializeStateRef) return;
    serializeStateRef.current = (): RocketFuelSnapshot => ({ teamIdx, round, fuel: fuelRef.current, roundFuel: roundFuelRef.current });
    return () => { if (serializeStateRef) serializeStateRef.current = null; };
  }, [serializeStateRef, teamIdx, round]);
  const turnFuelRef = useRef(0);
  // Guards against double-awarding points if the launch payout fires both from the natural
  // "landing" timeout and a forced early end racing each other.
  const payoutDoneRef = useRef(false);

  const finalizeLaunch = useCallback(() => {
    if (payoutDoneRef.current) return;
    payoutDoneRef.current = true;
    // No separate playSound("win") on entering "final" here (unlike every other game) — the
    // ignition below already fires at this exact same moment, and would just double up with it.
    // Still cuts the background music like every other game's final screen does, though.
    playSound("rocket");
    stopMusic();
    const ranked = rankByFuel(teams, fuelRef.current);
    const bonuses: Record<string | number, number> = {};
    ranked.forEach(({ team, fuel, rank }) => {
      const basePts = fuel * POINTS_PER_CORRECT;
      const bonus = LAUNCH_BONUS_BY_RANK[rank] ?? 0;
      bonuses[team.id] = bonus;
      // Silent: this is the secret-fuel reveal, the one moment this game is actually built
      // around — the ignition sound above is what should carry it, not a "correct" chime
      // stacked once per team on top.
      onUpdateScore(team.id, basePts + bonus, { silent: true });
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

  // Shared by screen-mode's drawPrompt and phone mode's per-device dealPromptTo — one cursor, so
  // a lap through the pool never repeats regardless of which of the two is pulling from it.
  const nextPoolPrompt = (): QuestionData | null => {
    if (!pool.length) return null;
    const idx = cursorRef.current % pool.length;
    cursorRef.current += 1;
    return pool[idx];
  };

  const drawPrompt = () => {
    setCurrentQ(nextPoolPrompt());
    setShowAnswer(false);
    // Every new prompt gets its own fresh READING_SECONDS grace — a new resetKey restarts the
    // sub-timer below rather than just leaving whatever was left on the previous prompt's window.
    readingKeyRef.current += 1;
    setReading(true);
  };

  // Deals ONE connected phone its next prompt — called for every one of the active team's
  // connected devices at turn start, for a late-joiner who connects mid-turn, and again for a
  // device the instant it submits (so it can keep going without waiting). Mutates the ref
  // synchronously so the channel effect's own sendState (and a same-tick caller) always reads the
  // latest assignment rather than a stale closure value.
  const dealPromptTo = (deviceId: string) => {
    const next = nextPoolPrompt();
    const updated = { ...promptsByDeviceRef.current };
    if (next) updated[deviceId] = next; else delete updated[deviceId];
    promptsByDeviceRef.current = updated;
    setPromptsByDevice(updated);
    // Starts this device's own clock the first time it's ever dealt a prompt this turn — a late
    // joiner gets a full TURN_SECONDS of their own, not whatever's left of anyone else's.
    if (deviceTimeLeftRef.current[deviceId] === undefined) {
      const updatedClocks = { ...deviceTimeLeftRef.current, [deviceId]: TURN_SECONDS };
      deviceTimeLeftRef.current = updatedClocks;
      setDeviceTimeLeft(updatedClocks);
    }
  };

  // Clears every one of a team's connected phones' assigned prompts AND their own clocks — called
  // when that team's turn ends, so a phone naturally falls back to "being reviewed" instead of
  // holding onto a prompt that no longer counts for anything, and so that team's NEXT turn deals
  // fresh TURN_SECONDS clocks instead of leftover zeroes (see dealPromptTo's undefined check).
  const clearPromptsForTeam = (teamId: string | number) => {
    const deviceIds = connectedByTeamRef.current[String(teamId)] ?? [];
    if (deviceIds.length === 0) return;
    const updated = { ...promptsByDeviceRef.current };
    deviceIds.forEach(id => delete updated[id]);
    promptsByDeviceRef.current = updated;
    setPromptsByDevice(updated);
    const updatedClocks = { ...deviceTimeLeftRef.current };
    deviceIds.forEach(id => delete updatedClocks[id]);
    deviceTimeLeftRef.current = updatedClocks;
    setDeviceTimeLeft(updatedClocks);
    const updatedBonuses = { ...lastBonusByDeviceRef.current };
    deviceIds.forEach(id => delete updatedBonuses[id]);
    lastBonusByDeviceRef.current = updatedBonuses;
  };

  // Resuming drops straight into "team-turn" for the team who was up, skipping the intro screen —
  // but unlike startTeamTurn(), it doesn't draw a first prompt, so do that once on mount.
  useEffect(() => {
    if (resumed && inputMode !== "phone") drawPrompt();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const endTurn = () => {
    if (activeTeam) clearPromptsForTeam(activeTeam.id);
    setPhase("team-end");
  };

  // A short sub-timer, not the main clock: counts down READING_SECONDS on its own every time
  // drawPrompt bumps readingKeyRef, then flips `reading` off on expiry so the main timer below
  // (paused while this is running) picks back up. expireSound is "dice" here, not the default
  // "timesUp" buzzer — hitting 0 just means "reading time's over, clock's live now," not a missed
  // answer, and "timesUp"'s buzzer read as a wrong-answer cue for that (teacher feedback).
  const { timeLeft: readingTimeLeft } = useTurnTimer(
    READING_SECONDS, phase === "team-turn" && reading, () => setReading(false), readingKeyRef.current,
    false, false, "dice",
  );

  // Screen mode's own shared clock — paused while an answer is being shown (a turn spans several
  // prompts in a row, so revealing one shouldn't burn into the time budget for the rest of the
  // turn while the teacher judges it) or during the reading grace above. Only active in screen
  // mode: phone mode replaces this with per-device clocks (see deviceTimeLeft/the ticking effect
  // below) so one student's bonus can't extend everyone else's time.
  const { timeLeft, addTime } = useTurnTimer(TURN_SECONDS, phase === "team-turn" && inputMode === "screen", endTurn, teamIdx, showAnswer || reading);

  // Phone mode's per-device clock — ticks every device with a running clock down once a second; a
  // device that reaches 0 loses its current prompt (its own phone shows "time's up for you," not
  // the rest of the team), and the whole team's turn ends once every device that's been dealt a
  // clock has run out (or the teacher ends it early via the same End Turn button screen mode has).
  useEffect(() => {
    if (phase !== "team-turn" || inputMode !== "phone") return;
    const interval = setInterval(() => {
      const clocks = deviceTimeLeftRef.current;
      const ids = Object.keys(clocks);
      if (ids.length === 0) return;
      const updatedClocks: Record<string, number> = {};
      const justExpired: string[] = [];
      ids.forEach(id => {
        const next = clocks[id] > 0 ? clocks[id] - 1 : clocks[id];
        updatedClocks[id] = next;
        if (clocks[id] > 0 && next === 0) justExpired.push(id);
      });
      deviceTimeLeftRef.current = updatedClocks;
      setDeviceTimeLeft(updatedClocks);
      if (justExpired.length > 0) {
        const updatedPrompts = { ...promptsByDeviceRef.current };
        justExpired.forEach(id => delete updatedPrompts[id]);
        promptsByDeviceRef.current = updatedPrompts;
        setPromptsByDevice(updatedPrompts);
      }
      if (ids.every(id => updatedClocks[id] <= 0)) endTurn();
      else sendStateRef.current?.();
    }, 1000);
    return () => clearInterval(interval);
    // endTurn/activeTeam are stable for this effect's whole lifetime (teamIdx only changes once
    // phase has already left "team-turn", tearing this effect down first) — see endTurn's own
    // comment history for why omitting them here is intentional, not an oversight.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, inputMode]);

  const startTeamTurn = (idx: number) => {
    setTeamIdx(idx);
    turnFuelRef.current = 0;
    setTurnFuel(0);
    fuelRef.current[teams[idx].id] = fuelRef.current[teams[idx].id] ?? 0;
    setSubmissions([]);
    if (inputMode === "phone") {
      // Every phone already connected to this team gets its own first prompt right away — a
      // phone that connects mid-turn is dealt one the instant it shows up instead (see the
      // channel effect's presence-sync handler below). The screen itself never draws its own
      // currentQ here — there's nothing for it to show that would mean anything (each phone is
      // working a different prompt), so phase === "team-turn"'s render branches on inputMode
      // instead of ever touching currentQ in this mode.
      (connectedByTeamRef.current[String(teams[idx].id)] ?? []).forEach(dealPromptTo);
    } else {
      drawPrompt();
    }
    setPhase("team-turn");
  };

  // Points are NOT awarded live — every team's fuel count is a secret until the final
  // reveal during the launch sequence, so nobody knows who's ahead until the very end.
  const judge = (correct: boolean) => {
    // Same neutral "tick" regardless of correct/incorrect — this is the one place in the app where
    // a distinct correct/wrong chime would actively break the game (fuel is a secret until launch;
    // two different sounds here would let the room hear who's fuelling up just by ear).
    playSound("tick");
    if (correct) {
      fuelRef.current[activeTeam.id] = (fuelRef.current[activeTeam.id] ?? 0) + 1;
      turnFuelRef.current += 1;
      setTurnFuel(turnFuelRef.current);
      // Solo only — see roundFuelRef's declaration for why this is tracked separately from the
      // cumulative fuelRef above.
      if (teams.length === 1) roundFuelRef.current[round] = (roundFuelRef.current[round] ?? 0) + 1;
      // See TIME_BONUS_OPTIONS — the reward is time, never points, so this never touches scoring.
      const bonus = TIME_BONUS_OPTIONS[Math.floor(Math.random() * TIME_BONUS_OPTIONS.length)];
      addTime(bonus);
      // Only pop the banner for an actual bonus — TIME_BONUS_OPTIONS now includes 0, and a "+0s
      // bonus!" banner would read as a glitch rather than "you just didn't get one this time."
      if (bonus > 0) {
        timeBonusKeyRef.current += 1;
        setTimeBonusPopup({ amount: bonus, key: timeBonusKeyRef.current });
      }
    }
    drawPrompt();
  };

  // Phone mode's judging — the submission was already sent and its time bonus already applied the
  // instant it arrived (see the channel effect's action handler), so this only ever awards fuel
  // and clears the item off the review queue; nothing else to replay.
  const judgeSubmission = (id: number, correct: boolean) => {
    if (correct) {
      fuelRef.current[activeTeam.id] = (fuelRef.current[activeTeam.id] ?? 0) + 1;
      turnFuelRef.current += 1;
      setTurnFuel(turnFuelRef.current);
      if (teams.length === 1) roundFuelRef.current[round] = (roundFuelRef.current[round] ?? 0) + 1;
    }
    setSubmissions(prev => prev.filter(s => s.id !== id));
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
    // All points — base fuel points AND the launch-rank bonus — land together right as the
    // flight resolves, so the scoreboard stays blank through the whole simulation. Solo now uses
    // the same shared-frame comparative climb as multi-team (see the render branch below), so it
    // shares the same fixed ASCENT_MS timing too — no more fuel-scaled flight length.
    const finishT = setTimeout(finalizeLaunch, ASCENT_MS + HOLD_MS);
    return () => { clearTimeout(liftoffT); clearTimeout(finishT); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Refs the channel effect's own long-lived callbacks read instead of closing over phase/teamIdx
  // directly — those callbacks are only recreated when [inputMode, sessionCode, teams] changes,
  // so without this they'd keep seeing whatever phase/team was current the moment the channel was
  // opened, not whatever it actually is by the time a presence sync or action broadcast arrives.
  const phaseRef = useRef(phase);
  const teamIdxRef = useRef(teamIdx);
  useEffect(() => {
    phaseRef.current = phase;
    teamIdxRef.current = teamIdx;
  });

  // Opens/closes the realtime channel only when phone mode itself is toggled on/off — screen-
  // authoritative like every other phone-mode game, startTeamTurn/judgeSubmission/endTurn stay
  // exactly as they are, just also reachable from an incoming phone "submit".
  useEffect(() => {
    if (inputMode !== "phone" || !sessionCode) return;
    const channel = openRocketChannel(sessionCode);
    channelRef.current = channel;

    const sendState = () => {
      const rawPhase = phaseRef.current;
      const mappedPhase: RocketFuelPhase = rawPhase === "intro" ? "lobby"
        : rawPhase === "team-turn" || rawPhase === "team-end" ? "turn"
        : "final";
      const inTurn = rawPhase === "team-turn" || rawPhase === "team-end";
      const liveActiveTeam = teams[teamIdxRef.current];
      const promptByDevice: Record<string, { word?: string; question: string }> = {};
      Object.entries(promptsByDeviceRef.current).forEach(([deviceId, q]) => {
        promptByDevice[deviceId] = { word: q.word, question: q.question ?? "" };
      });
      const payload: RocketFuelStatePayload = {
        phase: mappedPhase,
        roster: teams.map(t => ({ id: t.id, name: t.name, color: t.color, mascot: t.mascot })),
        activeTeamId: inTurn ? (liveActiveTeam?.id ?? null) : null,
        promptByDevice,
        timeLeftByDevice: { ...deviceTimeLeftRef.current },
        lastBonusByDevice: { ...lastBonusByDeviceRef.current },
        connectedTeamIds: Array.from(connectedTeamIdsRef.current),
        ts: Date.now(),
      };
      channel.send({ type: "broadcast", event: "state", payload });
    };
    sendStateRef.current = sendState;

    channel.on("presence", { event: "sync" }, () => {
      const presenceState = channel.presenceState<{ teamId: string | number; deviceId?: string }>();
      const ids = new Set<string | number>();
      const byTeam: Record<string, string[]> = {};
      Object.values(presenceState).forEach(entries => entries.forEach(entry => {
        ids.add(entry.teamId);
        if (entry.deviceId) {
          const key = String(entry.teamId);
          (byTeam[key] ??= []).push(entry.deviceId);
        }
      }));
      connectedTeamIdsRef.current = ids;
      const previouslyKnown = new Set(Object.values(connectedByTeamRef.current).flat());
      connectedByTeamRef.current = byTeam;
      setConnectedTeamIds(ids);
      setConnectedByTeam(byTeam);
      // A late-joiner on the CURRENTLY ACTIVE team, mid-turn, with no prompt yet — deal it one
      // right away rather than leaving it stuck on the "waiting" view for the rest of the turn.
      const liveActiveTeam = teams[teamIdxRef.current];
      if (phaseRef.current === "team-turn" && liveActiveTeam) {
        (byTeam[String(liveActiveTeam.id)] ?? []).forEach(deviceId => {
          if (!previouslyKnown.has(deviceId) && !promptsByDeviceRef.current[deviceId]) dealPromptTo(deviceId);
        });
      }
      sendState(); // roster/connected list changed — push a fresh state right away, don't wait for the interval
    });

    // The only place phone input touches game logic — there's no live judging to validate against
    // (see liveSession.ts), just "accept this submission if it's really this device's turn to
    // answer," then deal it a fresh prompt and hand back its time bonus immediately.
    channel.on("broadcast", { event: "action" }, ({ payload }) => {
      const action = payload as RocketFuelActionPayload;
      const liveActiveTeam = teams[teamIdxRef.current];
      if (phaseRef.current !== "team-turn" || !liveActiveTeam || action.teamId !== liveActiveTeam.id) return;
      if (!promptsByDeviceRef.current[action.deviceId]) return;
      const text = action.text.trim();
      if (!text) return;
      const prompt = promptsByDeviceRef.current[action.deviceId];
      submissionIdRef.current += 1;
      setSubmissions(prev => [...prev, { id: submissionIdRef.current, deviceId: action.deviceId, text, word: prompt.word }]);
      dealPromptTo(action.deviceId);
      // See TIME_BONUS_OPTIONS — the reward is time, never points. Goes to THIS device's own
      // clock only, never a shared pool (see liveSession.ts's Rocket Fuel section for why) — a
      // teammate's bonus should never buy anyone else extra time.
      const bonus = TIME_BONUS_OPTIONS[Math.floor(Math.random() * TIME_BONUS_OPTIONS.length)];
      const updatedClocks = { ...deviceTimeLeftRef.current, [action.deviceId]: (deviceTimeLeftRef.current[action.deviceId] ?? 0) + bonus };
      deviceTimeLeftRef.current = updatedClocks;
      setDeviceTimeLeft(updatedClocks);
      // Lets THIS device's own phone show "+Ns!" on its "Sent!" screen — see liveSession.ts's
      // lastBonusByDevice. Written even when bonus is 0, so the phone's own "bonus now known"
      // effect still fires promptly instead of falling through to its no-bonus-arrived fallback.
      bonusKeyCounterRef.current += 1;
      lastBonusByDeviceRef.current = { ...lastBonusByDeviceRef.current, [action.deviceId]: { amount: bonus, key: bonusKeyCounterRef.current } };
      // Only pop the screen's own banner for an actual bonus — see the matching comment in judge()
      // above.
      if (bonus > 0) {
        timeBonusKeyRef.current += 1;
        setTimeBonusPopup({ amount: bonus, key: timeBonusKeyRef.current });
      }
      sendStateRef.current?.();
    });

    channel.subscribe(status => {
      if (status === "SUBSCRIBED") sendState();
    });

    const interval = setInterval(sendState, 4000);

    return () => {
      clearInterval(interval);
      closeChannel(channel);
      channelRef.current = null;
      sendStateRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputMode, sessionCode, teams]);

  // Pushes an immediate state update on turn/phase transitions rather than waiting for the
  // interval — a phone's roster/prompt view should flip the moment a turn actually changes.
  useEffect(() => {
    sendStateRef.current?.();
  }, [phase, teamIdx, round, promptsByDevice]);

  // Tells every connected phone the game is over the moment it actually ends, same reasoning as
  // every other phone-mode game's identical effect — without this, a closed channel looks
  // identical to a dropped connection from the phone's side.
  useEffect(() => {
    if (phase === "final" && channelRef.current) {
      channelRef.current.send({ type: "broadcast", event: "ended", payload: {} });
    }
  }, [phase]);

  const handlePickPhoneMode = () => {
    setInputMode("phone");
    if (onRequestPhoneSession) {
      setSessionCode(onRequestPhoneSession());
      setSessionIsClassLevel(true);
    } else {
      setSessionCode(generateSessionCode());
      setSessionIsClassLevel(false);
    }
    setIntroStep("qr");
  };

  const buildJoinUrl = (code: string) =>
    sessionIsClassLevel
      ? `${window.location.origin}${window.location.pathname}?classJoin=${code}`
      : `${window.location.origin}${window.location.pathname}?join=${code}&game=rocket`;

  const handlePickScreenMode = () => {
    setInputMode("screen");
    setIntroStep("setup");
    setSessionCode(null);
    setConnectedTeamIds(new Set());
    setConnectedByTeam({});
  };

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
        <div style={{ background: "#312E81", border: "4px solid #1A1A2E", boxShadow: "6px 6px 0 #1A1A2E", borderRadius: "20px", padding: "28px 24px", marginBottom: "10px", color: "white", maxWidth: "560px", margin: "0 auto 10px" }}>
          <div style={{ marginBottom: "10px" }}><Icon name="rocket" size={36} /></div>
          <div style={{ fontWeight: "900", fontSize: "20px", marginBottom: "10px", color: "#A5B4FC" }}>Rocket Fuel</div>
          <div style={{ fontSize: "15px", lineHeight: 1.7 }}>
            Each team gets <strong style={{ color: "#A5B4FC" }}>{TOTAL_ROUNDS} rounds of {TURN_SECONDS} seconds</strong> at mission control — use the given word in your own sentence, and every correct one adds fuel. Every prompt opens with {READING_SECONDS} free seconds just to read it before the clock starts, and a correct answer hands back a random bonus of extra time. Stuck on a prompt? Skip it for a new one, no penalty.<br />
            Nobody's fuel level is revealed until every team has fuelled up — then all rockets <strong style={{ color: "#A5B4FC" }}>launch together</strong>, and whoever fuelled the most flies the highest!
          </div>
        </div>
        <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap", marginBottom: "24px" }}>
          {teams.map((t, i) => (
            <div key={t.id} style={{ background: t.color.dark, border: "2px solid #1A1A2E", boxShadow: "3px 3px 0 #1A1A2E", borderRadius: "14px", padding: "10px 18px", fontWeight: "800", fontSize: "14px", color: "white", display: "flex", alignItems: "center", gap: "6px" }}>
              {i + 1}. <TeamIcon team={t} color="white" /> {t.name}
            </div>
          ))}
        </div>
        {/* Always shown, even when a class-level session already exists (Class Check-In, or an
            earlier game's "Play on Phones") — a teacher choosing THIS game still needs the choice
            of Screen vs Phones for it specifically; picking Phones reuses the existing class-level
            code (see handlePickPhoneMode) rather than starting a new one. */}
        <>
          {introStep === "setup" && (
            <div style={{ marginBottom: "20px" }}>
              <div style={{ fontSize: "13px", color: "#C7D2FE", fontWeight: "700", marginBottom: "10px" }}>How will teams answer prompts?</div>
              <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                <button onClick={handlePickScreenMode} className="rf-btn" style={{
                  padding: "10px 20px", borderRadius: "12px", fontWeight: "800", fontSize: "14px", cursor: "pointer",
                  border: `2px solid ${inputMode === "screen" ? "#A5B4FC" : "rgba(255,255,255,0.2)"}`,
                  background: inputMode === "screen" ? "rgba(165,180,252,0.15)" : "rgba(255,255,255,0.05)",
                  color: inputMode === "screen" ? "#A5B4FC" : "#94A3B8",
                  display: "inline-flex", alignItems: "center", gap: "6px",
                }}><Icon name="screen" size={14} /> Play on Screen</button>
                <button onClick={handlePickPhoneMode} className="rf-btn" style={{
                  padding: "10px 20px", borderRadius: "12px", fontWeight: "800", fontSize: "14px", cursor: "pointer",
                  border: `2px solid ${inputMode === "phone" ? "#A5B4FC" : "rgba(255,255,255,0.2)"}`,
                  background: inputMode === "phone" ? "rgba(165,180,252,0.15)" : "rgba(255,255,255,0.05)",
                  color: inputMode === "phone" ? "#A5B4FC" : "#94A3B8",
                  display: "inline-flex", alignItems: "center", gap: "6px",
                }}><Icon name="phone" size={14} /> Play on Phones</button>
              </div>
              <div style={{ fontSize: "11px", color: "#C7D2FE99", marginTop: "8px", maxWidth: "420px", margin: "8px auto 0" }}>
                On Phones, every connected phone on the team up at mission control works its own prompt privately on its own clock — a bonus only ever extends that one phone's own time, never the whole team's. You review and judge everyone's sentences once their turn ends.
              </div>
            </div>
          )}

          {introStep === "qr" && sessionCode && (
            <PhoneJoinPanel
              sessionCode={sessionCode} joinUrl={buildJoinUrl(sessionCode)} teams={teams} connectedTeamIds={connectedTeamIds}
              phoneCountByTeam={Object.fromEntries(teams.map(t => [String(t.id), (connectedByTeam[String(t.id)] ?? []).length]))}
              accent="#A5B4FC" panelBg="linear-gradient(160deg,#312E81,#1E1B4B)" borderColor="#4338CA66"
              footer={
                <button onClick={handlePickScreenMode} style={{ background: "none", border: "none", color: "#C7D2FE99", fontSize: "12px", fontWeight: "700", cursor: "pointer", textDecoration: "underline" }}>
                  Switch back to Play on Screen
                </button>
              }
            />
          )}
        </>

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
        <button onClick={() => startTeamTurn(0)} className="rf-btn" style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "#4338CA", color: "white", border: "3px solid #1A1A2E", borderRadius: "16px", padding: "16px 48px", fontSize: "19px", fontWeight: "900", cursor: "pointer", boxShadow: "6px 6px 0 #1A1A2E" }}>
          <Icon name="flame" size={20} /> Ignite Engines!
        </button>
      </div>
    </div>
  );

  if (phase === "team-turn" || phase === "team-end") return (
    <div style={arenaStyle}>
      <Starfield />
      {STYLE_TAG}
      {/* Suppressed for a Class Check-In sitting — the class-level badge is the only floating
          reconnect button shown then, and it's the only one pointing at the right (class, not
          per-game) join URL. */}
      {inputMode === "phone" && sessionCode && !presetPhoneSession && (
        <PhoneReconnectBadge
          sessionCode={sessionCode} joinUrl={buildJoinUrl(sessionCode)}
          teams={teams} connectedTeamIds={connectedTeamIds}
          phoneCountByTeam={Object.fromEntries(teams.map(t => [String(t.id), (connectedByTeam[String(t.id)] ?? []).length]))}
          accent="#A5B4FC" panelBg="linear-gradient(160deg,#312E81,#1E1B4B)" borderColor="#4338CA66"
        />
      )}
      {/* A big, impossible-to-miss banner, not a small corner annotation — fixed-position so it
          reads the same regardless of what's rendering underneath (screen mode's word card, phone
          mode's placeholder), and fires for BOTH a live screen judge and a phone submission.
          Teacher feedback playing live: even knowing to look for it, the original version (26px,
          2s, pop-and-hold-still) was easy to miss entirely. Much bigger, a stronger overshoot on
          entry, a slow pulse through the whole 3.4s hold instead of sitting static, and a glowing
          ring behind it — reads as a genuine event, not a small corner annotation. */}
      {timeBonusPopup && (
        <div key={timeBonusPopup.key} style={{
          position: "fixed", top: "80px", left: "50%", zIndex: 30, animation: "rfTimeBonusBanner 3.4s ease-out forwards",
          background: "linear-gradient(135deg,#0D9488,#14B8A6)", color: "white", fontWeight: "900", fontSize: "44px",
          padding: "26px 48px", borderRadius: "22px", border: "5px solid #1A1A2E",
          boxShadow: "8px 8px 0 #1A1A2E, 0 0 60px 12px rgba(20,184,166,0.65)", whiteSpace: "nowrap",
        }}>
          ⏱️ +{timeBonusPopup.amount}s bonus!
        </div>
      )}
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ background: activeTeam.color.bg, border: "3px solid #1A1A2E", borderRadius: "14px", padding: "10px 16px", marginBottom: "14px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px", boxShadow: "4px 4px 0 #1A1A2E" }}>
          <span style={{ color: "white", fontWeight: "900", fontSize: "16px", textShadow: "0 1px 3px rgba(0,0,0,0.4)", display: "inline-flex", alignItems: "center", gap: "6px" }}><Icon name="rocket" size={15} /> {activeTeam.name}'s turn — {round > TOTAL_ROUNDS ? "Bonus Round" : `Round ${round}/${TOTAL_ROUNDS}`}, Team {teamIdx + 1} of {teams.length}</span>
          {phase === "team-turn" && (
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              {/* Screen mode only — there's no single clock left to show in phone mode, every
                  device runs its own (see the mission-control placeholder below for those). */}
              {inputMode === "screen" && (
                /* Swapped in for READING_SECONDS on every new prompt — see the `reading` sub-timer
                   above — so the room sees why the race clock hasn't started moving yet, instead
                   of it just looking frozen/broken. */
                reading ? (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(0,0,0,0.3)", border: "1.5px solid rgba(255,255,255,0.4)", borderRadius: "10px", padding: "6px 12px", fontSize: "12px", fontWeight: "800", color: "white", whiteSpace: "nowrap" }}>
                    <Icon name="bookOpen" size={13} /> Read it — {readingTimeLeft}s
                  </span>
                ) : (
                  <TurnTimerBar timeLeft={timeLeft} totalSeconds={TURN_SECONDS} />
                )
              )}
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

            {inputMode === "phone" ? (
              // Nothing for the screen to show that would mean anything — each connected phone is
              // working a DIFFERENT prompt in parallel, there's no single "the current word" the
              // way screen mode has one. Just confirms things are moving, and fills the space.
              <div style={{ maxWidth: "460px", margin: "0 auto", background: "#1E1B4B", border: "3px dashed #4338CA", borderRadius: "22px", padding: "28px 18px", textAlign: "center" }}>
                <div style={{ fontWeight: "900", fontSize: "17px", color: "#A5B4FC", marginBottom: "6px" }}>
                  {activeTeam.name}'s phones are at mission control!
                </div>
                <div style={{ color: "#C7D2FE99", fontSize: "13px", fontWeight: "600", marginBottom: "16px" }}>
                  Everyone's answering their own prompt privately on their own phone — you'll review every sentence once this turn ends.
                </div>
                <div style={{ display: "flex", justifyContent: "center", gap: "36px" }}>
                  <div>
                    <div style={{ fontSize: "26px", fontWeight: "900", color: "#FDE047" }}>{(connectedByTeam[String(activeTeam.id)] ?? []).length}</div>
                    <div style={{ fontSize: "11px", fontWeight: "800", color: "#A5B4FC99", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                      phone{(connectedByTeam[String(activeTeam.id)] ?? []).length === 1 ? "" : "s"} connected
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: "26px", fontWeight: "900", color: "#5EEAD4" }}>{submissions.length}</div>
                    <div style={{ fontSize: "11px", fontWeight: "800", color: "#A5B4FC99", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                      sentence{submissions.length === 1 ? "" : "s"} sent in
                    </div>
                  </div>
                </div>
                {/* Each phone runs its own clock now (see liveSession.ts's Rocket Fuel section) —
                    no student names to label these with, so just numbered in connection order;
                    good enough for a quick "who's running low" glance. */}
                {(connectedByTeam[String(activeTeam.id)] ?? []).length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", justifyContent: "center", marginTop: "18px" }}>
                    {(connectedByTeam[String(activeTeam.id)] ?? []).map((deviceId, i) => {
                      const t = deviceTimeLeft[deviceId];
                      const color = t === undefined ? "#94A3B8" : t <= 0 ? "#6B7280" : t > TURN_SECONDS * 0.5 ? "#4ADE80" : t > TURN_SECONDS * 0.25 ? "#FBBF24" : "#F87171";
                      return (
                        <span key={deviceId} style={{ background: "rgba(0,0,0,0.3)", border: `1.5px solid ${color}`, color, borderRadius: "8px", padding: "4px 10px", fontSize: "12px", fontWeight: "800" }}>
                          Phone {i + 1}: {t === undefined ? "—" : `${t}s`}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ maxWidth: "520px", margin: "0 auto" }}>
                <QuestionCard question={currentQ} showAnswer={showAnswer} onReveal={() => setShowAnswer(true)} gameId="rocket" />
                <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginTop: "14px" }}>
                  {showAnswer ? (
                    <>
                      <button onClick={() => judge(true)} className="rf-btn" style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#22C55E", color: "white", border: "3px solid #1A1A2E", borderRadius: "12px", padding: "12px 28px", fontSize: "15px", fontWeight: "800", cursor: "pointer", boxShadow: "4px 4px 0 #1A1A2E" }}><Icon name="check" size={14} /> Fuelled it!</button>
                      <button onClick={() => judge(false)} className="rf-btn" style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#EF4444", color: "white", border: "3px solid #1A1A2E", borderRadius: "12px", padding: "12px 28px", fontSize: "15px", fontWeight: "800", cursor: "pointer", boxShadow: "4px 4px 0 #1A1A2E" }}><Icon name="close" size={13} /> No fuel</button>
                    </>
                  ) : (
                    <button onClick={drawPrompt} className="rf-btn" style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(255,255,255,0.1)", color: "#C7D2FE", border: "2px solid #A5B4FC55", borderRadius: "12px", padding: "10px 22px", fontSize: "14px", fontWeight: "700", cursor: "pointer", transition: "transform 0.15s ease" }}><Icon name="next" size={13} /> Skip — try a different one</button>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {phase === "team-end" && (
          <div style={{ textAlign: "center" }}>
            <div style={{ background: "#312E81", border: "3px solid #1A1A2E", boxShadow: "4px 4px 0 #1A1A2E", borderRadius: "16px", padding: "20px", marginBottom: "16px" }}>
              <div style={{ marginBottom: "6px" }}><Icon name="rocket" size={34} /></div>
              <div style={{ fontWeight: "900", fontSize: "20px", color: "white", marginBottom: "8px" }}>{activeTeam.name}'s tank is sealed!</div>
              <div style={{ fontSize: "14px", color: "#C7D2FE" }}>
                {submissions.length > 0 ? "Review what they sent in from their phones:" : "Nice work! Time for the next team."}
              </div>
            </div>

            {/* Phone mode only — every sentence that team's phones sent in this turn, judged here
                since there's no live "correct" moment on a phone to react to (see
                liveSession.ts's Rocket Fuel section). Next Team stays disabled until every item's
                resolved, so a forgotten submission can never silently cost a team fuel it earned. */}
            {submissions.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", justifyContent: "center", marginBottom: "18px", maxWidth: "700px", margin: "0 auto 18px" }}>
                {submissions.map(s => (
                  <div key={s.id} style={{ width: "230px", background: "linear-gradient(160deg,#1E1B4B,#0B0B2E)", border: "2px solid #4338CA", borderRadius: "14px", padding: "12px", textAlign: "left" }}>
                    {s.word && (
                      <div style={{ fontSize: "10px", fontWeight: "800", color: "#A5B4FC99", textTransform: "uppercase", marginBottom: "6px" }}>“{s.word}”</div>
                    )}
                    <div style={{ background: "rgba(0,0,0,0.3)", borderRadius: "8px", padding: "8px 10px", fontSize: "14px", fontWeight: "700", color: "#E0E7FF", marginBottom: "10px", lineHeight: 1.35 }}>
                      {s.text}
                    </div>
                    <div style={{ display: "flex", gap: "6px", justifyContent: "center" }}>
                      <button onClick={() => judgeSubmission(s.id, true)} className="rf-btn" style={{ display: "inline-flex", alignItems: "center", gap: "5px", background: "#22C55E", color: "white", border: "2px solid #1A1A2E", borderRadius: "10px", padding: "8px 12px", fontSize: "13px", fontWeight: "700", cursor: "pointer" }}><Icon name="check" size={13} /> Correct</button>
                      <button onClick={() => judgeSubmission(s.id, false)} className="rf-btn" style={{ display: "inline-flex", alignItems: "center", gap: "5px", background: "#EF4444", color: "white", border: "2px solid #1A1A2E", borderRadius: "10px", padding: "8px 12px", fontSize: "13px", fontWeight: "700", cursor: "pointer" }}><Icon name="close" size={12} /> Wrong</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={nextTeam} disabled={submissions.length > 0} className="rf-btn"
              style={{
                display: "inline-flex", alignItems: "center", gap: "8px", border: "3px solid #1A1A2E", borderRadius: "14px", padding: "14px 36px", fontSize: "17px", fontWeight: "900",
                background: submissions.length > 0 ? "#4B5563" : "#4338CA", color: "white",
                cursor: submissions.length > 0 ? "not-allowed" : "pointer", boxShadow: "5px 5px 0 #1A1A2E",
              }}
            >
              {teamIdx + 1 >= teams.length
                ? (round >= TOTAL_ROUNDS ? <><Icon name="rocket" size={18} /> Go to Launchpad</> : <><Icon name="next" size={18} /> Start Round {round + 1}</>)
                : <><Icon name="next" size={18} /> Next Team's Turn</>}
            </button>
            {submissions.length > 0 && (
              <div style={{ fontSize: "11px", color: "#C7D2FE99", marginTop: "8px" }}>Review every answer above before moving on.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  if (phase === "launchpad" || phase === "igniting" || phase === "launching") {
    // Everyone launches side by side in one shared frame — the whole point of the comparison is
    // seeing whoever fuelled the most visibly climb higher and leave the rest behind, which only
    // reads correctly when every rocket shares one frame of reference and one camera. Ties in
    // fuel end at the same height, by design.
    //
    // Multi-team: one rocket per real team, exactly as always.
    //
    // Solo: one rocket per ROUND played so far this game, not per team — round 1 becomes its own
    // rocket, round 2 its own separate rocket, etc. (fuel is never combined across rounds; see
    // roundFuelRef). Every round except the one just played renders as a muted "shadow" — a
    // target from an earlier round this same game — while the round just played renders as the
    // real, full-color team rocket. TOTAL_ROUNDS is always >= 2, so solo always has at least one
    // shadow to race by its very first launch.
    const isSolo = teams.length === 1;
    const roundsThisLaunch = isSolo ? Array.from({ length: round }, (_, i) => i + 1) : [];
    const compareTeams: Team[] = isSolo
      ? roundsThisLaunch.map(r => r === round ? teams[0] : {
          id: shadowRoundId(r), name: `Round ${r}`, color: SHADOW_COLOR, mascot: null, score: 0,
        })
      : teams;
    // Solo reads each rocket's fuel from its own round's tally (roundFuelRef), never the
    // cumulative fuelRef total (fuelRef stays a per-launch-cycle sum, used only for scoring).
    // Multi-team is unaffected — it still reads the real per-team cumulative total.
    const compareFuelById: Record<string | number, number> = isSolo
      ? Object.fromEntries(roundsThisLaunch.map(r => [r === round ? teams[0].id : shadowRoundId(r), roundFuelRef.current[r] ?? 0]))
      : fuelRef.current;
    // actualMaxFuel (unfloored) decides who's actually in the lead — maxFuel below is only
    // floored at 1 to keep the height-fraction division safe, and using the floored value here
    // too would make everyone "the leader" whenever the whole class scored zero.
    const actualMaxFuel = Math.max(...compareTeams.map(t => compareFuelById[t.id] ?? 0));
    const maxFuel = Math.max(1, actualMaxFuel);
    const frameH = MAX_FLIGHT_PX + 90;
    // Everyone rises together for the first third of the climb, then the pack peels off one
    // tier at a time — dead last stalls and tumbles away first, then the next tier up, and so
    // on, so the standings reveal themselves in order instead of every loser dropping out at
    // once. Whoever's still in the lead at the end (tied leaders included, so a tie visibly ends
    // together) never falls — it just keeps climbing to its real height. A shadow with more fuel
    // than the round just played climbs higher and stays the leader, exactly like a real rival —
    // beating your own past rounds is not guaranteed.
    const RISE_PCT = 32;
    const FALL_STEP_PCT = 10;
    const COMMON_PX = 0.38 * MAX_FLIGHT_PX;
    const rankById = Object.fromEntries(rankByFuel(compareTeams, compareFuelById).map(r => [r.team.id, r.rank]));
    const maxRank = Math.max(...Object.values(rankById));
    return (
      <div style={{ ...arenaStyle, textAlign: "center" }}>
        <Starfield />
        {STYLE_TAG}
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ fontWeight: "900", fontSize: "20px", color: "#A5B4FC", marginBottom: isSolo ? "4px" : "18px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
            {phase === "launchpad" ? <><Icon name="satellite" size={18} /> All engines fuelled. Prepare for launch!</> : phase === "igniting" ? <><Icon name="flame" size={18} /> IGNITION...</> : <><Icon name="rocket" size={18} /> LAUNCH!</>}
          </div>
          {isSolo && (
            <div style={{ fontSize: "13px", color: "#C4B5FD", fontWeight: "700", marginBottom: "14px" }}>
              <Icon name="trophy" size={12} /> Round {round} vs. your earlier rounds
            </div>
          )}
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
            {phase === "launching" && launched && <Flyby flightMs={Math.max(1000, ASCENT_MS - LIFTOFF_MS)} count={FLYBY_COUNT} frameH={frameH} keyPrefix="fleet" />}

            {compareTeams.map(t => {
              const fuel = compareFuelById[t.id] ?? 0;
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
                    {/* The round just played (and every real multi-team rocket) stays secret
                        until the reveal — but a shadow's number is already-known history from
                        earlier this game, not something this run could leak, so it shows
                        straight away as the actual target to beat. */}
                    <span style={{ color: "#FDBA74", display: "inline-flex", alignItems: "center", gap: "3px" }}><Icon name="fuel" size={11} /> {isSolo && t.id !== teams[0].id ? fuel : "???"}</span>
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
  // The round just played vs. the best of every earlier round this game — mirrors the shadow
  // rockets shown during the launch itself. TOTAL_ROUNDS is always >= 2, so there's always at
  // least one earlier round (round 1) to compare against by the time this screen can show.
  const thisRoundFuel = roundFuelRef.current[round] ?? 0;
  const pastRoundsMaxFuel = isSolo
    ? Math.max(0, ...Array.from({ length: round - 1 }, (_, i) => roundFuelRef.current[i + 1] ?? 0))
    : 0;
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
              <div key={t.id} style={{ background: t.color.dark, border: "2px solid #1A1A2E", boxShadow: "3px 3px 0 #1A1A2E", borderRadius: "14px", padding: "12px" }}>
                <div><RankBadge rank={rank} size={22} /></div>
                <div style={{ fontWeight: "800", color: "white", fontSize: "14px", marginTop: "4px" }}><TeamIcon team={t} /> {t.name}</div>
                <div style={{ color: "#FDBA74", fontWeight: "800", fontSize: "13px", marginTop: "2px", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}><Icon name="fuel" size={12} /> {fuelCount} fuelled · {basePts} pts</div>
                {bonusAwarded[t.id] > 0 && <div style={{ color: "#86EFAC", fontWeight: "700", fontSize: "12px", marginTop: "2px" }}>+{bonusAwarded[t.id]} launch bonus</div>}
                {isSolo && (
                  thisRoundFuel > pastRoundsMaxFuel
                    ? <div style={{ color: "#FCD34D", fontWeight: "800", fontSize: "12px", marginTop: "4px" }}><Icon name="trophy" size={11} /> You beat your past round records!</div>
                    : <div style={{ color: "#94A3B8", fontWeight: "700", fontSize: "12px", marginTop: "4px" }}>You didn't beat your past round records — best was {pastRoundsMaxFuel} fuel.</div>
                )}
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
          {canLaunchAgain && (
            <button onClick={launchAgain} className="rf-btn" style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "#7C3AED", color: "white", border: "3px solid #1A1A2E", borderRadius: "12px", padding: "12px 28px", fontSize: "16px", fontWeight: "800", cursor: "pointer", boxShadow: "4px 4px 0 #1A1A2E" }}><Icon name="rocket" size={16} /> One More Launch!</button>
          )}
          <button onClick={onEnd} className="rf-btn" style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "#4338CA", color: "white", border: "3px solid #1A1A2E", borderRadius: "12px", padding: "12px 28px", fontSize: "16px", fontWeight: "800", cursor: "pointer", boxShadow: "4px 4px 0 #1A1A2E" }}><Icon name="checkeredFlag" size={16} /> End Game</button>
        </div>
      </div>
    </div>
  );
}
