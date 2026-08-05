import { useState, useRef, useCallback, useEffect } from "react";
import type { GameProps, QuestionData, Team } from "../../types";
import { ScoreBoard } from "../shared/ScoreBoard";
import { teamsGridCols, GAME_MODES } from "../../data/constants";
import { HowToPlayModal } from "../shared/HowToPlayModal";
import { FlagPromptButton } from "../shared/FlagPromptButton";
import { ZOMBIE_TUTORIAL_STEPS } from "../../data/tutorials/zombie";

const GM = GAME_MODES.find(g => g.id === "zombie")!;

const TICK_MS = 1000; // 1 tick == 1 elapsed second — every timing constant below is scaled against this.
const APPROACH_TICKS = 14; // ticks a zombie spends visibly walking in before it reaches an entry point — long enough to see it coming and react
const BARRICADE_ITEM_HP = 4; // hits a single barricade item survives before breaking
const ZOMBIE_DAMAGE_PER_TICK = 1;
const CORRECT_ANSWER_SCORE = 20; // matches Rocket Fuel's per-sentence rate — the closest sibling game (open sentence production, prompt after prompt); 10 felt thin next to other games' totals
// Two independent, deliberately decoupled-from-English-tasks defense resources:
// - Bullets slowly recharge on a flat timer (not tied to rounds or answering). Any team with a
//   charged bullet auto-shoots an attacking zombie down, one bullet per zombie — freshly-arrived
//   zombies are shot before they ever touch a barricade, and any bullet still available after that
//   is spent on zombies already mid-attack, so a bullet that recharges (or is gifted) while the
//   house is under siege doesn't sit idle waiting for a new arrival. If nobody has a charge, the
//   zombie attacks barricades instead. Every team starts capped at BULLET_CAP_START and recharges
//   on BULLET_RECHARGE_SECONDS — slow enough that this is a supplement to answering questions, not
//   a replacement for it. A team's personal cap can be raised (via power-up, see below) up to
//   BULLET_CAP_CEILING.
// - Axes are fixed at MAX_AXES and never regenerate — the true last resort, spent only when a
//   zombie actually breaches an empty barricade stack. Two breaches survived, the third eliminates.
const BULLET_CAP_START = 3;
const BULLET_CAP_CEILING = 5;
const BULLET_RECHARGE_SECONDS = 90; // every team's bullet reserve gains +1 (up to its own cap) on this cadence, pure elapsed time
const MAX_AXES = 2;

// A correct answer normally drops a barricade item; POWERUP_CHANCE of the time it's a power-up
// crate instead — one of a small set of random bonuses, same "reward for answering" loop, just a
// different prize.
const POWERUP_CHANCE = 0.25;
// ammoAllTeamsPlus1/2 are the only power-ups that help every team at once (the other three are
// scoped to whichever team happened to answer) — a deliberate room-wide "gift" alongside the
// personal ones, per the user's own suggestion.
type PowerUpKind = "maxAmmo" | "bulletCapUp" | "allDoorsChair" | "ammoAllTeamsPlus1" | "ammoAllTeamsPlus2" | "nuke";
const POWERUP_KINDS: PowerUpKind[] = ["maxAmmo", "bulletCapUp", "allDoorsChair", "ammoAllTeamsPlus1", "ammoAllTeamsPlus2", "nuke"];

// Rounds are closed waves, not a clock — think Call of Duty Zombies. Each round has a fixed zombie
// quota; they trickle in (not all at once) after a brief read pause, and the round doesn't end
// until every zombie in the wave has been resolved (shot or breached — either way it's gone). Clear
// a fast wave and the next, bigger one starts sooner; a slow class just holds at the same pressure
// for longer. First-pass numbers, meant to be tuned live rather than calculated to a "correct" answer.
const ROUND_READ_PAUSE_SECONDS = 3; // empty beat at the start of every round — time to read the new prompt before anything spawns
const ROUND_QUOTA_BASE = 4; // zombies in round 1's wave
const ROUND_QUOTA_GROWTH = 2; // extra zombies added to the wave each subsequent round
const SPAWN_CHANCE_BASE = 0.12; // per-tick chance the next queued zombie in this round's wave actually spawns
const SPAWN_CHANCE_PER_ROUND = 0.02; // spawns arrive a little more relentlessly each round
const SPAWN_CHANCE_CAP = 0.6;

// One prompt per round, not per answer — everyone gets a beat to read it before the room opens up
// into free-for-all sentence-throwing. ROUND_BREAK_MS is that reading pause; matches
// ROUND_READ_PAUSE_SECONDS above so the credit buttons and the first zombie spawn unlock together.
const ROUND_BREAK_MS = ROUND_READ_PAUSE_SECONDS * 1000;

function roundZombieQuota(round: number): number {
  return ROUND_QUOTA_BASE + (round - 1) * ROUND_QUOTA_GROWTH;
}
function spawnChanceForRound(round: number): number {
  return Math.min(SPAWN_CHANCE_CAP, SPAWN_CHANCE_BASE + (round - 1) * SPAWN_CHANCE_PER_ROUND);
}

type EntryPointId = "frontDoor" | "backDoor" | "window1" | "window2";
const ENTRY_POINTS: { id: EntryPointId; label: string; icon: string }[] = [
  { id: "frontDoor", label: "Front Door", icon: "🚪" },
  { id: "backDoor", label: "Back Door", icon: "🚪" },
  { id: "window1", label: "Window", icon: "🪟" },
  { id: "window2", label: "Window", icon: "🪟" },
];

// A new barricade always goes to whichever entry point currently has the fewest items (ties broken
// randomly) — not a uniformly random door. Pure randomness meant bad luck could leave one side
// permanently open while correct answers kept stacking up somewhere else; this guarantees the
// weakest point is always the one that gets reinforced next.
function weakestEntryPoint(barricades: Record<EntryPointId, BarricadeItem[]>): EntryPointId {
  const minCount = Math.min(...ENTRY_POINTS.map(ep => barricades[ep.id].length));
  const weakest = ENTRY_POINTS.filter(ep => barricades[ep.id].length === minCount);
  return weakest[Math.floor(Math.random() * weakest.length)].id;
}

type BarricadeItem = { id: number; hp: number };
type ZombieStatus = "approaching" | "attacking";
type ZombieKind = "normal" | "runner" | "brute";
// `lane` is a fixed random offset (-1..1) assigned at spawn, used only for rendering — it spreads
// simultaneous zombies at the same entry point across the approach path instead of stacking them
// on one exact line. `attackCooldown` counts down while attacking — a zombie only lands a hit on
// the barricade when it reaches 0, not every tick (see ZOMBIE_ATTACK_INTERVAL_TICKS below).
type Zombie = { id: number; entryPointId: EntryPointId; status: ZombieStatus; progress: number; lane: number; kind: ZombieKind; attackCooldown: number };
type PersonState = { bullets: number; bulletCap: number; axes: number; alive: boolean };

const ZOMBIE_ATTACK_INTERVAL_TICKS = 2; // a zombie now damages the barricade once every 2 ticks, not every tick — directly softens the "swarm insta-breaks the door" case, since N simultaneous attackers now deal roughly N/2 damage per tick instead of N

// From round 3 on, two variants start appearing alongside the normal zombie — kept to just two so
// a teacher can explain them at a glance: runner = faster, brute = hits harder.
const APPROACH_TICKS_BY_KIND: Record<ZombieKind, number> = { normal: APPROACH_TICKS, runner: 8, brute: APPROACH_TICKS };
const DAMAGE_BY_KIND: Record<ZombieKind, number> = { normal: ZOMBIE_DAMAGE_PER_TICK, runner: ZOMBIE_DAMAGE_PER_TICK, brute: 2 };
const ZOMBIE_KIND_ICON: Record<ZombieKind, string> = { normal: "🧟", runner: "🏃", brute: "🧌" };
// Size/glow treatment so a variant reads as different at a glance mid-game, not just on close
// inspection of the icon — cyan glow + smaller reads "fast", red glow + bigger reads "dangerous".
const ZOMBIE_KIND_STYLE: Record<ZombieKind, { fontSize: string; filter: string }> = {
  normal: { fontSize: "17px", filter: "none" },
  runner: { fontSize: "16px", filter: "drop-shadow(0 0 4px #22D3EE) hue-rotate(-15deg)" },
  brute: { fontSize: "22px", filter: "drop-shadow(0 0 5px #DC2626) saturate(1.6)" },
};

// First-pass split, meant to be tuned live rather than calculated to a "correct" answer — matches
// this file's own convention for other difficulty constants.
function pickZombieKind(round: number): ZombieKind {
  if (round < 3) return "normal";
  const roll = Math.random();
  if (roll < 0.2) return "brute";
  if (roll < 0.45) return "runner";
  return "normal";
}

type SiegeState = {
  barricades: Record<EntryPointId, BarricadeItem[]>; // index 0 = frontmost, attacked first, never repaired
  zombies: Zombie[];
  persons: Record<string | number, PersonState>;
  elapsedSeconds: number; // pure survived-time display, decoupled from rounds
  round: number;
  roundElapsedSeconds: number; // ticks since this round started — drives the read-pause before spawning begins
  zombiesSpawnedThisRound: number; // counts toward roundZombieQuota(round); round clears once this hits quota AND zombies is empty
};

type TickEventKind = "barricadeDestroyed" | "zombieShot" | "axeUsed" | "personEliminated";
type TickEvent = { kind: TickEventKind; entryPointId?: EntryPointId; teamId?: string | number };

// Fun-stats-only tallies for the gameover screen — none of these feed scoring or difficulty, they
// just answer "who did what" once the house falls. Axes deliberately excluded — every eliminated
// team burns both on the way down, so it's a near-constant, not an interesting stat.
type TeamStats = { kills: number; chairsPlaced: number };

type Phase = "intro" | "playing" | "gameover";
type RoundPhase = "reveal" | "active";
type FxKind = "barricadePlaced" | "barricadeDestroyed" | "zombieShot" | "axeUsed";
type SiegeFx = { id: number; kind: FxKind; key: number; teamId?: string | number };

// "zombieShot" names the shooting team ("🔫 🔴 Team Red sniped a zombie!"), noticeably longer
// than the other FX messages — 600ms was tuned for a 3-word flash and left the longer text
// barely readable, so this one alone gets more time on screen.
function fxDurationMs(kind: FxKind): number {
  return kind === "zombieShot" ? 1700 : 600;
}
type ElimBanner = { teamName: string; color: string; key: number };
type RoundBanner = { round: number; key: number };
type PowerUpBanner = { text: string; key: number };

const POWERUP_LABEL: Record<PowerUpKind, string> = {
  maxAmmo: "🔫 Max Ammo!",
  bulletCapUp: "🔫 Ammo Cap +1!",
  allDoorsChair: "🪑 Chair on Every Door!",
  ammoAllTeamsPlus1: "🔫 +1 Ammo for Everyone!",
  ammoAllTeamsPlus2: "🔫🔫 +2 Ammo for Everyone!",
  nuke: "☢️ NUKE! All zombies destroyed!",
};

function emptyBarricades(): Record<EntryPointId, BarricadeItem[]> {
  const result = {} as Record<EntryPointId, BarricadeItem[]>;
  ENTRY_POINTS.forEach(ep => { result[ep.id] = []; });
  return result;
}

// The one genuinely new pattern in this codebase: an open-ended real-time tick, rather than the
// bounded countdowns/dice-flickers every other game uses. Kept as a pure function — no React, no
// side effects — so the state transition for one second of siege time is easy to reason about in
// isolation: spawn, walk, attack, breach, advance the clock.
function advanceTick(
  state: SiegeState,
  aliveTeamIds: (string | number)[],
  nextZombieId: () => number
): { next: SiegeState; events: TickEvent[] } {
  const events: TickEvent[] = [];
  const barricades = {} as Record<EntryPointId, BarricadeItem[]>;
  ENTRY_POINTS.forEach(ep => { barricades[ep.id] = state.barricades[ep.id].map(b => ({ ...b })); });

  let zombies = state.zombies.map(z => ({ ...z }));
  let persons = { ...state.persons };
  const elapsedSeconds = state.elapsedSeconds + 1;
  const roundElapsedSeconds = state.roundElapsedSeconds + 1;
  const round = state.round;
  let zombiesSpawnedThisRound = state.zombiesSpawnedThisRound;

  // 0. Recharge — a flat timer, completely independent of rounds or how the English tasks are
  // going. Axes never regenerate; only bullets do.
  if (elapsedSeconds % BULLET_RECHARGE_SECONDS === 0) {
    aliveTeamIds.forEach(id => {
      const person = persons[id];
      if (person?.alive && person.bullets < person.bulletCap) {
        persons = { ...persons, [id]: { ...person, bullets: person.bullets + 1 } };
      }
    });
  }

  // 1. Spawn — gated by the read pause (nothing spawns while the class is still reading the new
  // prompt) and capped by this round's wave quota. A random entry point, pure chance, no targeting.
  const quota = roundZombieQuota(round);
  const spawningAllowed = roundElapsedSeconds > ROUND_READ_PAUSE_SECONDS && zombiesSpawnedThisRound < quota;
  if (spawningAllowed && Math.random() < spawnChanceForRound(round)) {
    const ep = ENTRY_POINTS[Math.floor(Math.random() * ENTRY_POINTS.length)];
    zombies.push({ id: nextZombieId(), entryPointId: ep.id, status: "approaching", progress: 0, lane: Math.random() * 2 - 1, kind: pickZombieKind(round), attackCooldown: 0 });
    zombiesSpawnedThisRound += 1;
  }

  // 2. Approach — walk speed is constant regardless of difficulty. Track which zombies arrive
  // (transition to "attacking") this exact tick — that's the moment they're eligible to be
  // auto-shot, before they ever get a chance to touch a barricade.
  const justArrived = new Set<number>();
  zombies = zombies.map(z => {
    if (z.status !== "approaching") return z;
    const progress = z.progress + 1;
    if (progress >= APPROACH_TICKS_BY_KIND[z.kind]) {
      justArrived.add(z.id);
      return { ...z, status: "attacking" as const, progress, attackCooldown: 0 };
    }
    return { ...z, progress };
  });

  // 2.5. Auto-shoot — any team with a charged bullet takes down an attacking zombie, one bullet per
  // zombie. Covers freshly-arrived zombies first (shot before they ever touch the barricade, same
  // as the original framing), then falls through to zombies that were ALREADY attacking — a bullet
  // that recharges (or arrives via a power-up gift) while zombies are already mid-siege gets spent
  // on the current threat immediately instead of sitting idle until some future new arrival. Without
  // this second pass, a team that finally got its first bullet back while barricades were already
  // under attack would visibly hold a charge and never use it. Resolved sequentially against a
  // threaded working copy of `persons` (mirroring the breach step below) so several simultaneous
  // shots in one tick can't over-spend the same charge.
  const shooterIds = aliveTeamIds.filter(id => persons[id]?.alive);
  const attackingNow = zombies.filter(z => z.status === "attacking");
  const shootOrder = [...attackingNow.filter(z => justArrived.has(z.id)), ...attackingNow.filter(z => !justArrived.has(z.id))];
  const shotIds = new Set<number>();
  shootOrder.forEach(z => {
    const armed = shooterIds.filter(id => persons[id].bullets > 0);
    if (!armed.length) return; // nobody has a charge left — it proceeds to attack the barricade
    const shooterId = armed[Math.floor(Math.random() * armed.length)];
    const shooter = persons[shooterId];
    persons = { ...persons, [shooterId]: { ...shooter, bullets: shooter.bullets - 1 } };
    events.push({ kind: "zombieShot", teamId: shooterId, entryPointId: z.entryPointId });
    shotIds.add(z.id);
  });
  zombies = zombies.filter(z => !shotIds.has(z.id));

  // 3. Attack — every attacking zombie that survived the auto-shoot damages whichever barricade
  // item is currently frontmost at its entry point. Barricades are never repaired, so this only
  // ever counts down.
  zombies = zombies.map(z => {
    if (z.status !== "attacking") return z;
    const stack = barricades[z.entryPointId];
    if (!stack.length) return z; // stack already empty — this zombie is breach-eligible, handled next
    if (z.attackCooldown > 0) return { ...z, attackCooldown: z.attackCooldown - 1 };
    const front = stack[0];
    front.hp -= DAMAGE_BY_KIND[z.kind];
    if (front.hp <= 0) {
      stack.shift();
      events.push({ kind: "barricadeDestroyed", entryPointId: z.entryPointId });
    }
    return { ...z, attackCooldown: ZOMBIE_ATTACK_INTERVAL_TICKS - 1 };
  });

  // 4. Breach — resolved sequentially against a threaded working copy of `persons`, not the
  // pre-tick snapshot. Two zombies breaching different entry points in the same tick must see
  // each other's axe-consumption/elimination in order, otherwise a team could be killed by two
  // *simultaneous* breaches instead of two breaches over time, which breaks the "only dies from
  // bad luck twice" guarantee the game is built around.
  let workingAlive = aliveTeamIds.filter(id => persons[id]?.alive);
  const survivors: Zombie[] = [];
  zombies.forEach(z => {
    const breached = z.status === "attacking" && barricades[z.entryPointId].length === 0;
    if (!breached) { survivors.push(z); return; }
    if (!workingAlive.length) { survivors.push(z); return; } // no one left to target — game is already over
    const targetId = workingAlive[Math.floor(Math.random() * workingAlive.length)];
    const person = persons[targetId];
    if (person.axes > 0) {
      persons = { ...persons, [targetId]: { ...person, axes: person.axes - 1 } };
      events.push({ kind: "axeUsed", teamId: targetId });
    } else {
      persons = { ...persons, [targetId]: { ...person, alive: false } };
      workingAlive = workingAlive.filter(id => id !== targetId);
      events.push({ kind: "personEliminated", teamId: targetId });
    }
    // Zombie is resolved either way — it does not linger inside the house.
  });

  // 5. Round clear — a closed wave, not a clock: the round only advances once every zombie
  // promised for it has both spawned and been resolved (shot or breached). A fast class clears
  // waves quickly and races into harder rounds sooner; a struggling class just holds at the same
  // pressure for longer instead of the horde escalating out from under them regardless.
  let nextRound = round;
  let nextRoundElapsedSeconds = roundElapsedSeconds;
  let nextZombiesSpawnedThisRound = zombiesSpawnedThisRound;
  if (zombiesSpawnedThisRound >= quota && survivors.length === 0) {
    nextRound = round + 1;
    nextRoundElapsedSeconds = 0;
    nextZombiesSpawnedThisRound = 0;
  }

  return {
    next: {
      barricades, zombies: survivors, persons, elapsedSeconds,
      round: nextRound, roundElapsedSeconds: nextRoundElapsedSeconds, zombiesSpawnedThisRound: nextZombiesSpawnedThisRound,
    },
    events,
  };
}

function formatClock(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

const STYLE_TAG = (
  <style>{`
    @keyframes zsBob{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}
    @keyframes zsShake{0%,100%{transform:translateX(0)}25%{transform:translateX(-3px)}75%{transform:translateX(3px)}}
    @keyframes zsBannerIn{0%{opacity:0;transform:translate(-50%,-16px) scale(0.9)}15%{opacity:1;transform:translate(-50%,0) scale(1.03)}25%{transform:translate(-50%,0) scale(1)}85%{opacity:1;transform:translate(-50%,0) scale(1)}100%{opacity:0;transform:translate(-50%,-10px) scale(0.96)}}
    @keyframes zsFog{0%,100%{opacity:0.08}50%{opacity:0.22}}
    @keyframes zsPulse{0%,100%{opacity:1}50%{opacity:0.55}}
    @keyframes zsFxIn{0%{opacity:0;transform:translateX(12px)}15%{opacity:1;transform:translateX(0)}80%{opacity:1}100%{opacity:0}}
    .zs-btn:hover:not(:disabled){transform:translateY(-2px) scale(1.02);filter:brightness(1.08)}
    .zs-btn:active:not(:disabled){transform:translateY(0) scale(0.97)}
    .zs-btn:disabled{opacity:0.4;cursor:not-allowed}
  `}</style>
);

// Overhead-scene geometry, expressed as percentages of a square scene container. `door` sits on
// the house wall, `target` is where an attacking zombie comes to rest just outside it, `barricade`
// sits between the two. `spawn(lane)` picks a point along the matching screen edge — `lane` spreads
// simultaneous zombies at the same entry point along that edge instead of stacking them on one spot.
type Geometry = {
  doorX: number; doorY: number;
  targetX: number; targetY: number;
  barricadeX: number; barricadeY: number;
  spawn: (lane: number) => { x: number; y: number };
};

function clampPct(n: number): number {
  return Math.max(2, Math.min(98, n));
}

const GEOMETRY: Record<EntryPointId, Geometry> = {
  frontDoor: { doorX: 50, doorY: 73, targetX: 50, targetY: 85, barricadeX: 50, barricadeY: 77, spawn: lane => ({ x: clampPct(50 + lane * 46), y: 98 }) },
  backDoor: { doorX: 50, doorY: 27, targetX: 50, targetY: 15, barricadeX: 50, barricadeY: 23, spawn: lane => ({ x: clampPct(50 + lane * 46), y: 2 }) },
  window1: { doorX: 27, doorY: 50, targetX: 15, targetY: 50, barricadeX: 23, barricadeY: 50, spawn: lane => ({ x: 2, y: clampPct(50 + lane * 46) }) },
  window2: { doorX: 73, doorY: 50, targetX: 85, targetY: 50, barricadeX: 77, barricadeY: 50, spawn: lane => ({ x: 98, y: clampPct(50 + lane * 46) }) },
};

function zombiePosition(z: Zombie): { x: number; y: number } {
  const g = GEOMETRY[z.entryPointId];
  const spawn = g.spawn(z.lane);
  const t = Math.min(1, z.progress / APPROACH_TICKS_BY_KIND[z.kind]);
  return { x: spawn.x + (g.targetX - spawn.x) * t, y: spawn.y + (g.targetY - spawn.y) * t };
}

function personScenePos(index: number, total: number): { x: number; y: number } {
  if (total <= 1) return { x: 50, y: 50 };
  const angle = (index / total) * Math.PI * 2 - Math.PI / 2;
  return { x: 50 + Math.cos(angle) * 11, y: 50 + Math.sin(angle) * 11 };
}

// Static forest decoration — scattered once at module load in a ring outside the house footprint
// (house spans 27%-73%, so radius 42-54 stays clear of it), not regenerated on every render.
const FOREST: { x: number; y: number; size: number }[] = Array.from({ length: 22 }, (_, i) => {
  const angle = (i / 22) * Math.PI * 2;
  const radius = 42 + (i % 3) * 6;
  return { x: clampPct(50 + Math.cos(angle) * radius), y: clampPct(50 + Math.sin(angle) * radius), size: 14 + (i % 4) * 3 };
});

function HouseScene({ siege, teams }: { siege: SiegeState; teams: Team[] }) {
  return (
    <div style={{
      position: "relative", width: "100%", maxWidth: "340px", aspectRatio: "4 / 3", margin: "0 auto 5px",
      borderRadius: "14px", overflow: "hidden", border: "2px solid #365314",
      background: "radial-gradient(circle at 50% 50%, #16240F 0%, #0A1408 70%, #050A05 100%)",
    }}>
      {FOREST.map((t, i) => (
        <span key={i} style={{ position: "absolute", left: `${t.x}%`, top: `${t.y}%`, fontSize: `${t.size}px`, opacity: 0.55, transform: "translate(-50%,-50%)" }}>🌲</span>
      ))}
      <div style={{ position: "absolute", left: "18%", top: "18%", width: "64%", height: "64%", borderRadius: "12%", background: "radial-gradient(circle,#1A2E10CC,transparent 70%)" }} />
      <div style={{ position: "absolute", left: "27%", top: "27%", width: "46%", height: "46%", background: "linear-gradient(160deg,#5C4429,#3B2A18)", border: "2px solid #2A1D10", borderRadius: "6px", boxShadow: "0 0 24px rgba(0,0,0,0.6)" }}>
        <div style={{ position: "absolute", inset: "10%", border: "1px dashed #7C5A3277", borderRadius: "4px" }} />
      </div>
      {ENTRY_POINTS.map(ep => {
        const g = GEOMETRY[ep.id];
        const stack = siege.barricades[ep.id];
        return (
          <div key={ep.id}>
            <div title={ep.label} style={{ position: "absolute", left: `${g.doorX}%`, top: `${g.doorY}%`, transform: "translate(-50%,-50%)", fontSize: "15px", zIndex: 2 }}>{ep.icon}</div>
            <div style={{ position: "absolute", left: `${g.barricadeX}%`, top: `${g.barricadeY}%`, transform: "translate(-50%,-50%)", display: "flex", gap: "1px", zIndex: 2 }}>
              {stack.slice(0, 4).map((b, i) => (
                <span key={b.id} title={`${b.hp}/${BARRICADE_ITEM_HP} hp`} style={{
                  fontSize: "13px", opacity: 0.4 + 0.6 * (b.hp / BARRICADE_ITEM_HP),
                  filter: i === 0 ? "drop-shadow(0 0 3px #BEF26499)" : "none",
                }}>🪑</span>
              ))}
            </div>
          </div>
        );
      })}
      {teams.map((t, i) => {
        const pos = personScenePos(i, teams.length);
        const person = siege.persons[t.id];
        return (
          <div key={t.id} title={t.name} style={{
            position: "absolute", left: `${pos.x}%`, top: `${pos.y}%`, transform: "translate(-50%,-50%)",
            fontSize: "15px", zIndex: 3, opacity: person.alive ? 1 : 0.45, filter: person.alive ? "none" : "grayscale(1)",
          }}>{person.alive ? (t.mascot ?? "🧑") : "💀"}</div>
        );
      })}
      {siege.zombies.map(z => {
        const pos = zombiePosition(z);
        return (
          <div key={z.id} style={{
            position: "absolute", left: `${pos.x}%`, top: `${pos.y}%`, transform: "translate(-50%,-50%)",
            transition: `left ${TICK_MS}ms linear, top ${TICK_MS}ms linear`, zIndex: 4,
            fontSize: ZOMBIE_KIND_STYLE[z.kind].fontSize, filter: ZOMBIE_KIND_STYLE[z.kind].filter,
            animation: z.status === "attacking" ? "zsShake 0.3s ease-in-out infinite" : "zsBob 0.9s ease-in-out infinite",
          }}>{ZOMBIE_KIND_ICON[z.kind]}</div>
        );
      })}
    </div>
  );
}

function PersonChip({ team, person, rechargeProgress }: { team: Team; person: PersonState; rechargeProgress: number }) {
  return (
    <div style={{
      background: person.alive ? `linear-gradient(160deg,${team.color.dark}55,#050805)` : "#1A1A1A88",
      border: `2px solid ${person.alive ? team.color.bg : "#4B5563"}`,
      borderRadius: "12px", padding: "5px 9px", textAlign: "center", opacity: person.alive ? 1 : 0.55, minWidth: "78px",
    }}>
      <div style={{ fontSize: "16px", lineHeight: 1.1 }}>{person.alive ? (team.mascot ?? "🧑") : "💀"}</div>
      <div style={{ fontWeight: "800", fontSize: "11px", color: person.alive ? "white" : "#9CA3AF" }}>{team.name}</div>
      {person.alive ? (
        <div style={{ fontSize: "11px", lineHeight: 1.3, display: "flex", gap: "1px", justifyContent: "center", alignItems: "center", flexWrap: "wrap" }}>
          {/* Always shows bulletCap slots (not just current bullets) — a team with 1/3 bullets sees
              three guns, two of them greyed out, so the empty capacity is always visible, not just
              inferred from a bare count. The next slot due to recharge (i === person.bullets, while
              still under cap) gets a small conic-gradient ring so the wait isn't a silent pop-in. */}
          {Array.from({ length: person.bulletCap }, (_, i) => {
            const gun = <span style={{ opacity: i < person.bullets ? 1 : 0.28, filter: i < person.bullets ? "none" : "grayscale(1)" }}>🔫</span>;
            if (i !== person.bullets || person.bullets >= person.bulletCap) return <span key={i}>{gun}</span>;
            const secsLeft = Math.round((1 - rechargeProgress) * BULLET_RECHARGE_SECONDS);
            return (
              <span key={i} title={`Recharges in ~${secsLeft}s`} style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center", width: "16px", height: "16px",
                borderRadius: "50%", background: `conic-gradient(#4ADE80 ${rechargeProgress * 360}deg, #1F293766 0deg)`, padding: "1px",
              }}>
                <span style={{ display: "inline-flex", width: "100%", height: "100%", borderRadius: "50%", background: "#050805", alignItems: "center", justifyContent: "center" }}>{gun}</span>
              </span>
            );
          })}
          {person.axes > 0 && <span style={{ marginLeft: "3px" }}>{"🪓".repeat(person.axes)}</span>}
        </div>
      ) : (
        <div style={{ fontSize: "9px", color: "#9CA3AF", fontWeight: "700" }}>📣 cheering</div>
      )}
    </div>
  );
}

// A deliberately compact stand-in for the shared QuestionCard — this game wants the house scene to
// be the dominant visual element, and QuestionCard's own fixed padding/font sizes (shared by every
// other game) aren't ours to shrink. There's no answer to reveal here: the word persists for the
// whole round and any team can throw a sentence at it, judged on the fly, same as an open response.
function SiegeQuestionCard({ question }: { question: QuestionData | null }) {
  if (!question) return null;
  return (
    <div style={{
      position: "relative", background: "white", border: "3px solid #6366F1", borderRadius: "16px",
      padding: "16px 20px", textAlign: "center", boxShadow: "0 6px 20px #6366F144",
    }}>
      <div style={{ position: "absolute", top: "10px", right: "10px" }}>
        <FlagPromptButton gameId="zombie" questionData={question} />
      </div>
      <div style={{
        display: "inline-block", background: "#EEF2FF", color: "#4F46E5",
        padding: "3px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "700", marginBottom: "8px",
        textTransform: "uppercase", letterSpacing: "0.04em",
      }}>
        📖 add to the prompt
      </div>
      {question.crewmateTopic && (
        <div style={{ fontSize: "22px", fontWeight: "900", color: "#1E1B4B", margin: "0 0 6px" }}>
          {question.crewmateTopic}
        </div>
      )}
      <p style={{
        fontSize: "17px", fontWeight: "600", color: "#374151", margin: 0, lineHeight: 1.4,
      }}>
        {question.crewmatePrompt}
      </p>
    </div>
  );
}

export function ZombieSiegeGame({ questions, teams, onUpdateScore, onEnd, forceFinalRef, paused, onTogglePause }: GameProps) {
  const [phase, setPhase] = useState<Phase>("intro");
  const [showHowTo, setShowHowTo] = useState(false);
  // A ref (not just the `paused` prop) so the tick interval's closure always reads the latest
  // value without needing to tear down and rebuild the interval every time pause is toggled.
  const pausedRef = useRef(false);
  useEffect(() => { pausedRef.current = !!paused; }, [paused]);

  useEffect(() => {
    if (!forceFinalRef) return;
    forceFinalRef.current = phase === "gameover" ? null : () => { setPhase("gameover"); return true; };
    return () => { if (forceFinalRef) forceFinalRef.current = null; };
  }, [forceFinalRef, phase]);
  const [siege, setSiege] = useState<SiegeState>(() => ({
    barricades: emptyBarricades(),
    zombies: [],
    persons: Object.fromEntries(teams.map(t => [t.id, { bullets: BULLET_CAP_START, bulletCap: BULLET_CAP_START, axes: MAX_AXES, alive: true }])),
    elapsedSeconds: 0,
    round: 1,
    roundElapsedSeconds: 0,
    zombiesSpawnedThisRound: 0,
  }));
  const [currentQuestion, setCurrentQuestion] = useState<QuestionData | null>(null);
  const [roundPhase, setRoundPhase] = useState<RoundPhase>("reveal");
  const [fx, setFx] = useState<SiegeFx[]>([]);
  const [elimBanner, setElimBanner] = useState<ElimBanner | null>(null);
  const [roundBanner, setRoundBanner] = useState<RoundBanner | null>(null);
  const [powerUpBanner, setPowerUpBanner] = useState<PowerUpBanner | null>(null);
  const [statsByTeam, setStatsByTeam] = useState<Record<string | number, TeamStats>>(() =>
    Object.fromEntries(teams.map(t => [t.id, { kills: 0, chairsPlaced: 0 }]))
  );
  const breakTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const bumpStat = useCallback((teamId: string | number, key: keyof TeamStats, amount = 1) => {
    setStatsByTeam(prev => ({
      ...prev,
      [teamId]: { ...(prev[teamId] ?? { kills: 0, chairsPlaced: 0 }), [key]: (prev[teamId]?.[key] ?? 0) + amount },
    }));
  }, []);

  const siegeRef = useRef(siege);
  useEffect(() => { siegeRef.current = siege; });

  const zombieIdRef = useRef(0);
  const barricadeIdRef = useRef(0);
  const fxIdRef = useRef(0);

  const pushFx = useCallback((kind: FxKind, teamId?: string | number) => {
    const id = fxIdRef.current++;
    setFx(prev => [...prev, { id, kind, key: id, teamId }]);
    setTimeout(() => setFx(prev => prev.filter(f => f.id !== id)), fxDurationMs(kind));
  }, []);

  const showElimination = useCallback((teamName: string, color: string) => {
    const key = fxIdRef.current++;
    setElimBanner({ teamName, color, key });
    setTimeout(() => setElimBanner(prev => (prev?.key === key ? null : prev)), 3200);
  }, []);

  const showRoundBanner = useCallback((round: number) => {
    const key = fxIdRef.current++;
    setRoundBanner({ round, key });
    setTimeout(() => setRoundBanner(prev => (prev?.key === key ? null : prev)), 2600);
  }, []);

  const showPowerUpBanner = useCallback((text: string) => {
    const key = fxIdRef.current++;
    setPowerUpBanner({ text, key });
    setTimeout(() => setPowerUpBanner(prev => (prev?.key === key ? null : prev)), 2600);
  }, []);

  // Question pool: sourced from spyRounds (LessonGamesGenerator wires "zombie" alongside "spy"),
  // so `questions` here is already crewmateTopic/crewmatePrompt content, not the fixed-answer
  // grammar-drill pool the other mixed-pool games use. Shuffled once, one shared stream (no
  // per-team/per-category split).
  const pool = useRef([...questions].sort(() => Math.random() - 0.5)).current;
  const lastTopicRef = useRef<string | undefined>(undefined);
  const pickNextQuestion = useCallback((): QuestionData | null => {
    if (!pool.length) return null;
    const fresh = pool.filter(q => q.crewmateTopic !== lastTopicRef.current);
    const source = fresh.length ? fresh : pool;
    const chosen = source[Math.floor(Math.random() * source.length)];
    lastTopicRef.current = chosen.crewmateTopic;
    return chosen;
  }, [pool]);

  // A new prompt is drawn once per round, not once per answer — everyone gets ROUND_BREAK_MS to
  // read it before the credit buttons unlock and the room opens up into free-for-all
  // sentence-throwing. Any team can be credited any number of times against the same prompt —
  // there's no per-team cap, since the horde only gets harder and the class needs to be able to
  // keep pumping out barricades/power-ups at whatever pace it can manage.
  const startRound = useCallback((question: QuestionData | null) => {
    setCurrentQuestion(question);
    setRoundPhase("reveal");
    if (breakTimeoutRef.current) clearTimeout(breakTimeoutRef.current);
    breakTimeoutRef.current = setTimeout(() => setRoundPhase("active"), ROUND_BREAK_MS);
  }, []);

  useEffect(() => () => { if (breakTimeoutRef.current) clearTimeout(breakTimeoutRef.current); }, []);

  useEffect(() => {
    if (phase !== "playing") return;
    const id = setInterval(() => {
      if (pausedRef.current) return;
      const aliveTeamIds = teams.map(t => t.id);
      const prevRound = siegeRef.current.round;
      const { next, events } = advanceTick(siegeRef.current, aliveTeamIds, () => zombieIdRef.current++);
      setSiege(next);
      if (next.round > prevRound) {
        showRoundBanner(next.round);
        startRound(pickNextQuestion());
      }
      events.forEach(ev => {
        if (ev.kind === "barricadeDestroyed") pushFx("barricadeDestroyed");
        if (ev.kind === "zombieShot") {
          pushFx("zombieShot", ev.teamId);
          if (ev.teamId !== undefined) bumpStat(ev.teamId, "kills");
        }
        if (ev.kind === "axeUsed") pushFx("axeUsed");
        if (ev.kind === "personEliminated" && ev.teamId !== undefined) {
          const team = teams.find(t => t.id === ev.teamId);
          if (team) showElimination(team.name, team.color.bg);
        }
      });
      const stillAlive = teams.some(t => next.persons[t.id]?.alive);
      if (!stillAlive) setPhase("gameover");
    }, TICK_MS);
    return () => clearInterval(id);
  }, [phase, teams, pushFx, showElimination, showRoundBanner, startRound, pickNextQuestion, bumpStat]);

  useEffect(() => {
    if (phase === "playing" && !currentQuestion) startRound(pickNextQuestion());
  }, [phase, currentQuestion, pickNextQuestion, startRound]);

  const applyPowerUp = useCallback((kind: PowerUpKind, teamId: string | number) => {
    setSiege(prev => {
      let persons = prev.persons;
      let barricades = prev.barricades;
      let zombies = prev.zombies;
      if (kind === "maxAmmo") {
        const person = persons[teamId];
        persons = { ...persons, [teamId]: { ...person, bullets: person.bulletCap } };
      } else if (kind === "bulletCapUp") {
        const person = persons[teamId];
        const bulletCap = Math.min(BULLET_CAP_CEILING, person.bulletCap + 1);
        persons = { ...persons, [teamId]: { ...person, bulletCap, bullets: Math.min(bulletCap, person.bullets + 1) } };
      } else if (kind === "allDoorsChair") {
        const next = {} as Record<EntryPointId, BarricadeItem[]>;
        ENTRY_POINTS.forEach(ep => {
          const newItem: BarricadeItem = { id: barricadeIdRef.current++, hp: BARRICADE_ITEM_HP };
          next[ep.id] = [newItem, ...prev.barricades[ep.id]];
        });
        barricades = next;
      } else if (kind === "ammoAllTeamsPlus1" || kind === "ammoAllTeamsPlus2") {
        // Room-wide gift — every still-alive team gets bullets, each capped at their OWN bulletCap
        // (a team that already raised its cap via bulletCapUp can bank more from this than one that
        // hasn't), never past it.
        const amount = kind === "ammoAllTeamsPlus1" ? 1 : 2;
        const next = { ...persons };
        Object.entries(persons).forEach(([id, person]) => {
          if (person.alive) next[id] = { ...person, bullets: Math.min(person.bulletCap, person.bullets + amount) };
        });
        persons = next;
      } else if (kind === "nuke") {
        zombies = [];
      }
      return { ...prev, persons, barricades, zombies };
    });
    const team = teams.find(t => t.id === teamId);
    showPowerUpBanner(`${team?.color.emoji ?? ""} ${team?.name ?? ""}: ${POWERUP_LABEL[kind]}`);
  }, [teams, showPowerUpBanner]);

  // The prompt persists for the whole round — any team can throw a sentence at it as many times
  // as they like, each one its own reward roll. No per-team cap: the horde only gets harder, so
  // the class needs to be able to keep answering at whatever pace keeps them alive.
  const handleCorrectAnswer = (teamId: string | number) => {
    onUpdateScore(teamId, CORRECT_ANSWER_SCORE);
    if (Math.random() < POWERUP_CHANCE) {
      const kind = POWERUP_KINDS[Math.floor(Math.random() * POWERUP_KINDS.length)];
      if (kind === "nuke") bumpStat(teamId, "kills", siege.zombies.length);
      applyPowerUp(kind, teamId);
      if (kind === "allDoorsChair") bumpStat(teamId, "chairsPlaced", ENTRY_POINTS.length);
    } else {
      const newItem: BarricadeItem = { id: barricadeIdRef.current++, hp: BARRICADE_ITEM_HP };
      setSiege(prev => {
        const ep = weakestEntryPoint(prev.barricades);
        return { ...prev, barricades: { ...prev.barricades, [ep]: [newItem, ...prev.barricades[ep]] } };
      });
      bumpStat(teamId, "chairsPlaced");
      pushFx("barricadePlaced");
    }
  };

  const arenaStyle: React.CSSProperties = {
    margin: "-20px", padding: "10px", borderRadius: "20px", position: "relative", overflow: "hidden",
    background: "radial-gradient(circle at 50% 0%, #1A2E1A 0%, #0D1A0D 55%, #050805 100%)",
  };

  const fogLayer = (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} style={{
          position: "absolute", left: `${(i * 23) % 100}%`, top: `${(i * 31) % 100}%`,
          width: "120px", height: "40px", borderRadius: "50%", background: "#4D7C0F",
          filter: "blur(18px)", animation: `zsFog ${4 + (i % 4)}s ease-in-out infinite ${(i % 5) * 0.6}s`,
        }} />
      ))}
    </div>
  );

  // Tutorial mockup: src/data/tutorials/zombie.tsx — update if this intro's rules text changes.
  if (phase === "intro") return (
    <div style={{ ...arenaStyle, textAlign: "center" }}>
      {fogLayer}
      {STYLE_TAG}
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ background: "linear-gradient(135deg,#14210F,#365314)", border: "2px solid #65A30D55", borderRadius: "20px", padding: "28px 24px", marginBottom: "10px", color: "white", maxWidth: "560px", margin: "0 auto 10px", boxShadow: "0 0 40px #65A30D33" }}>
          <div style={{ fontSize: "36px", marginBottom: "10px" }}>🧟</div>
          <div style={{ fontWeight: "900", fontSize: "20px", marginBottom: "10px", color: "#BEF264" }}>Zombie Siege</div>
          <div style={{ fontSize: "15px", lineHeight: 1.6, opacity: 0.95 }}>
            One shared house, everyone's score. Add a sentence any time to earn a barricade or a <strong style={{ color: "#BEF264" }}>power-up</strong> — <strong style={{ color: "#BEF264" }}>bullets recharge</strong> and auto-shoot zombies at the door, and <strong style={{ color: "#BEF264" }}>2 axes</strong> per team are the last resort if one breaks through.<br />
            Clear the wave, and a bigger one begins!
          </div>
        </div>
        <button onClick={() => setShowHowTo(true)} className="zs-btn" style={{ display: "block", margin: "0 auto 14px", background: "rgba(255,255,255,0.95)", color: GM.color, border: `2px solid ${GM.color}`, boxShadow: "0 2px 8px rgba(0,0,0,0.18)", borderRadius: "12px", padding: "10px 24px", fontSize: "14px", fontWeight: "800", cursor: "pointer" }}>
          ❓ How to Play
        </button>
        {showHowTo && (
          <HowToPlayModal
            gameName={GM.name} gameIcon={GM.icon} accentColor={GM.color}
            steps={ZOMBIE_TUTORIAL_STEPS}
            onClose={() => setShowHowTo(false)}
          />
        )}
        <button onClick={() => setPhase("playing")} className="zs-btn" style={{ background: "linear-gradient(135deg,#365314,#65A30D)", color: "#0D1A0D", border: "none", borderRadius: "16px", padding: "16px 48px", fontSize: "19px", fontWeight: "900", cursor: "pointer", boxShadow: "0 6px 24px rgba(101,163,13,0.5)", transition: "transform 0.15s ease" }}>🏠 Board Up the House!</button>
      </div>
    </div>
  );

  if (phase === "gameover") {
    return (
      <div style={{ ...arenaStyle, textAlign: "center" }}>
        {fogLayer}
        {STYLE_TAG}
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: "48px", marginBottom: "6px" }}>💀</div>
          <div style={{ fontWeight: "900", fontSize: "24px", color: "#BEF264", marginBottom: "4px" }}>The house has fallen</div>
          <div style={{ color: "#A3B899", fontSize: "14px", marginBottom: "20px" }}>You held out for {formatClock(siege.elapsedSeconds)}. Final scores:</div>
          <div style={{ marginBottom: "20px" }}>
            <ScoreBoard teams={teams} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: teamsGridCols(teams.length), gap: "10px", margin: "0 auto 24px", maxWidth: "760px" }}>
            {teams.map(t => {
              const stats = statsByTeam[t.id] ?? { kills: 0, chairsPlaced: 0 };
              return (
                <div key={t.id} style={{ background: "linear-gradient(160deg,#14210F,#0D1A0D)", border: `2px solid ${t.color.bg}`, borderRadius: "14px", padding: "10px" }}>
                  <div style={{ fontWeight: "800", color: "#BEF264", fontSize: "13px", marginBottom: "6px" }}>{t.mascot ?? t.color.emoji} {t.name}</div>
                  <div style={{ fontSize: "12px", color: "#DCFCE7", lineHeight: 1.7 }}>
                    <div>🧟 {stats.kills} zombie{stats.kills === 1 ? "" : "s"} shot</div>
                    <div>🪑 {stats.chairsPlaced} chair{stats.chairsPlaced === 1 ? "" : "s"} placed</div>
                  </div>
                </div>
              );
            })}
          </div>
          <button onClick={onEnd} className="zs-btn" style={{ background: "linear-gradient(135deg,#365314,#65A30D)", color: "#0D1A0D", border: "none", borderRadius: "14px", padding: "14px 32px", fontSize: "17px", fontWeight: "900", cursor: "pointer", boxShadow: "0 6px 24px rgba(101,163,13,0.5)", transition: "transform 0.15s ease" }}>🏁 End Game</button>
        </div>
      </div>
    );
  }

  const aliveTeams = teams.filter(t => siege.persons[t.id]?.alive);
  const round = siege.round;
  const roundQuota = roundZombieQuota(round);
  const roundDefeated = siege.zombiesSpawnedThisRound - siege.zombies.length;
  // Bullets recharge on one shared global cadence for every team in lockstep (see step 0 of
  // advanceTick), so a single derived fraction covers everyone's "next" slot ring.
  const rechargeProgress = (siege.elapsedSeconds % BULLET_RECHARGE_SECONDS) / BULLET_RECHARGE_SECONDS;

  return (
    <div style={arenaStyle}>
      {fogLayer}
      {STYLE_TAG}
      {paused && (
        <div onClick={onTogglePause} style={{
          position: "absolute", inset: 0, zIndex: 30, cursor: "pointer", borderRadius: "20px",
          background: "rgba(5,10,5,0.82)", display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <div style={{ textAlign: "center", color: "white" }}>
            <div style={{ fontSize: "44px", marginBottom: "8px" }}>⏸️</div>
            <div style={{ fontWeight: "900", fontSize: "22px", color: "#BEF264" }}>Paused</div>
            <div style={{ fontSize: "14px", color: "#D9F99D", marginTop: "6px", fontWeight: "700" }}>Tap to resume</div>
          </div>
        </div>
      )}
      <div style={{ position: "absolute", top: "8px", right: "8px", zIndex: 15, display: "flex", flexDirection: "column", gap: "4px", alignItems: "flex-end", pointerEvents: "none" }}>
        {fx.map(f => {
          const shooter = f.teamId !== undefined ? teams.find(t => t.id === f.teamId) : undefined;
          return (
            <div key={f.id} style={{
              background: "#0A140AE0", border: "1px solid #65A30D", borderRadius: "8px", padding: "4px 10px",
              fontSize: "12px", color: "#BEF264", fontWeight: 700, animation: `zsFxIn ${fxDurationMs(f.kind)}ms ease-out`,
            }}>
              {f.kind === "barricadePlaced" && "🪑 barricade placed"}
              {f.kind === "barricadeDestroyed" && "💥 barricade destroyed"}
              {f.kind === "zombieShot" && `🔫 ${shooter ? `${shooter.color.emoji} ${shooter.name} sniped` : "sniped"} a zombie!`}
              {f.kind === "axeUsed" && "🪓 axe used!"}
            </div>
          );
        })}
      </div>
      {elimBanner && (
        <div key={elimBanner.key} style={{
          position: "absolute", top: "14px", left: "50%", zIndex: 20, whiteSpace: "nowrap",
          background: `linear-gradient(135deg,${elimBanner.color},#365314)`, border: "2px solid #BEF264",
          borderRadius: "14px", padding: "12px 24px", boxShadow: "0 8px 28px rgba(0,0,0,0.5)",
          animation: "zsBannerIn 3.2s ease-in-out forwards",
        }}>
          <span style={{ color: "white", fontWeight: "900", fontSize: "16px", textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}>
            💀 {elimBanner.teamName} has been overrun!
          </span>
        </div>
      )}
      {roundBanner && (
        <div key={roundBanner.key} style={{
          position: "absolute", top: "60px", left: "50%", zIndex: 19, whiteSpace: "nowrap",
          background: "linear-gradient(135deg,#365314,#65A30D)", border: "2px solid #BEF264",
          borderRadius: "14px", padding: "10px 22px", boxShadow: "0 8px 28px rgba(0,0,0,0.5)",
          animation: "zsBannerIn 2.6s ease-in-out forwards",
        }}>
          <span style={{ color: "white", fontWeight: "900", fontSize: "15px", textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}>
            🌊 Round {roundBanner.round} — it's getting worse!
          </span>
        </div>
      )}
      {powerUpBanner && (
        <div key={powerUpBanner.key} style={{
          position: "absolute", top: "106px", left: "50%", zIndex: 18, whiteSpace: "nowrap",
          background: "linear-gradient(135deg,#B45309,#F59E0B)", border: "2px solid #FDE68A",
          borderRadius: "14px", padding: "10px 22px", boxShadow: "0 8px 28px rgba(0,0,0,0.5)",
          animation: "zsBannerIn 2.6s ease-in-out forwards",
        }}>
          <span style={{ color: "white", fontWeight: "900", fontSize: "15px", textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}>
            🎁 {powerUpBanner.text}
          </span>
        </div>
      )}
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "6px", marginBottom: "4px" }}>
          <div style={{ fontWeight: "800", fontSize: "12px", color: "#BEF264" }}>⏱️ {formatClock(siege.elapsedSeconds)}</div>
          <div style={{ fontWeight: "900", fontSize: "13px", color: "#F87171", animation: round >= 6 ? "zsPulse 1s ease-in-out infinite" : "none" }}>🌊 Round {round} · {roundDefeated}/{roundQuota}</div>
        </div>

        <HouseScene siege={siege} teams={teams} />

        <div style={{ display: "flex", gap: "5px", justifyContent: "center", flexWrap: "wrap", marginBottom: "4px" }}>
          {teams.map(t => <PersonChip key={t.id} team={t} person={siege.persons[t.id]} rechargeProgress={rechargeProgress} />)}
        </div>

        <div style={{ maxWidth: "480px", width: "100%", margin: "0 auto" }}>
          <SiegeQuestionCard question={currentQuestion} />

          {roundPhase === "reveal" ? (
            <div style={{ textAlign: "center", fontSize: "12px", color: "#A3B899", fontWeight: "700", marginTop: "8px" }}>
              📖 Read the prompt... get ready!
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "5px", marginTop: "6px" }}>
              {aliveTeams.map(t => (
                <button key={t.id} onClick={() => handleCorrectAnswer(t.id)} className="zs-btn" style={{
                  background: t.color.bg, color: "white", border: "none", borderRadius: "10px",
                  padding: "6px 8px", fontSize: "11px", fontWeight: "800", cursor: "pointer", transition: "transform 0.15s ease",
                }}>➕ {t.color.emoji} {t.name} added to it!</button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
