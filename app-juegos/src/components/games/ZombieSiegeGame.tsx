import { useState, useRef, useCallback, useEffect } from "react";
import { TeamIcon, MascotSprite } from "../shared/TeamIcon";
import { Icon, type IconName } from "../shared/Icon";
import type { GameProps, QuestionData, Team } from "../../types";
import { ScoreBoard } from "../shared/ScoreBoard";
import { teamsGridCols, GAME_MODES, GAME_ICONS } from "../../data/constants";
import { HowToPlayModal } from "../shared/HowToPlayModal";
import { FlagPromptButton } from "../shared/FlagPromptButton";
import { TurnTimerBar } from "../shared/TurnTimerBar";
import { ZOMBIE_TUTORIAL_STEPS } from "../../data/tutorials/zombie";

const GM = GAME_MODES.find(g => g.id === "zombie")!;

const TICK_MS = 1000; // 1 tick == 1 elapsed second — every timing constant below is scaled against this.
const APPROACH_TICKS = 14; // ticks a zombie spends visibly walking in before it reaches an entry point — long enough to see it coming and react
const BARRICADE_ITEM_HP = 4; // hits a single barricade item survives before breaking
// A broken chair has a coin-flip chance of taking its zombie down too, instead of the zombie just
// carrying on to the next barricade item — gives the barricade itself a real chance to finish a
// kill, not just delay one. The other half of the time it's a plain break with no extra effect,
// same as before this existed.
const CHAIR_EXPLODE_CHANCE = 0.5;
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
const BULLET_RECHARGE_SECONDS = 90; // every team starts on this cadence — a team's own PersonState.rechargeSeconds can be lowered from here via the fasterReload power-up, so this is a starting value, not a shared global constant anymore
const BULLET_RECHARGE_STEP_SECONDS = 10; // fasterReload shaves this much off a team's own cadence, every time it's picked up
const BULLET_RECHARGE_FLOOR_SECONDS = 30; // fasterReload can't push a team's cadence below this
const MAX_AXES = 2;

// A correct answer normally drops a barricade item; POWERUP_CHANCE of the time it's a power-up
// crate instead — one of a small set of random bonuses, same "reward for answering" loop, just a
// different prize.
const POWERUP_CHANCE = 0.25;
// ammoAllTeamsPlus1/2 are the only power-ups that help every team at once (the other three are
// scoped to whichever team happened to answer) — a deliberate room-wide "gift" alongside the
// personal ones, per the user's own suggestion.
type PowerUpKind = "maxAmmo" | "bulletCapUp" | "allDoorsChair" | "ammoAllTeamsPlus1" | "ammoAllTeamsPlus2" | "nuke" | "fasterReload";
const POWERUP_KINDS: PowerUpKind[] = ["maxAmmo", "bulletCapUp", "allDoorsChair", "ammoAllTeamsPlus1", "ammoAllTeamsPlus2", "nuke", "fasterReload"];
// Nuke clears the whole screen for free, so it's weighted well below the rest (which share weight
// 5 each) rather than landing at an equal 1-in-7 of the power-up roll — of all correct answers
// this puts nuke at ~1% (POWERUP_CHANCE * 1/31) vs ~4% for every other power-up kind.
const POWERUP_WEIGHT: Record<PowerUpKind, number> = {
  maxAmmo: 5, bulletCapUp: 5, allDoorsChair: 5, ammoAllTeamsPlus1: 5, ammoAllTeamsPlus2: 5, nuke: 1, fasterReload: 5,
};
const POWERUP_TOTAL_WEIGHT = POWERUP_KINDS.reduce((sum, k) => sum + POWERUP_WEIGHT[k], 0);
function pickPowerUpKind(): PowerUpKind {
  let roll = Math.random() * POWERUP_TOTAL_WEIGHT;
  for (const kind of POWERUP_KINDS) {
    roll -= POWERUP_WEIGHT[kind];
    if (roll < 0) return kind;
  }
  return POWERUP_KINDS[POWERUP_KINDS.length - 1];
}

// Rounds are closed waves, not a clock — think Call of Duty Zombies. Each round has a fixed zombie
// quota; they trickle in (not all at once) after a brief read pause, and the round doesn't end
// until every zombie in the wave has been resolved (shot or breached — either way it's gone). Clear
// a fast wave and the next, bigger one starts sooner; a slow class just holds at the same pressure
// for longer. First-pass numbers, meant to be tuned live rather than calculated to a "correct" answer.
// The read-pause before zombies start spawning is longest on round 1 (time to learn the ropes)
// and eases down round by round to a steady-state floor — per teacher feedback that new classes
// found the game overwhelming from the very first wave, with no on-ramp. Numbers per that feedback:
// round 1 ~60s, round 2 ~50s, round 3 ~40s, ... down to the 8s floor (the old flat value) by round 6.
const ROUND_READ_PAUSE_FLOOR_SECONDS = 8;
const ROUND_READ_PAUSE_START_SECONDS = 60;
const ROUND_READ_PAUSE_DECAY_SECONDS = 10;
function roundReadPauseSeconds(round: number): number {
  return Math.max(ROUND_READ_PAUSE_FLOOR_SECONDS, ROUND_READ_PAUSE_START_SECONDS - (round - 1) * ROUND_READ_PAUSE_DECAY_SECONDS);
}

// Bumped from 4/2 — per teacher feedback that a wave could clear before a prompt change really
// registered with the class; more zombies per wave means each prompt sticks around longer.
const ROUND_QUOTA_BASE = 6; // zombies in round 1's wave, at the 3-team baseline
const ROUND_QUOTA_GROWTH = 3; // extra zombies added to the wave each subsequent round, at the 3-team baseline
const SPAWN_CHANCE_BASE = 0.12; // per-tick chance the next queued zombie in this round's wave actually spawns, at the 3-team baseline
const SPAWN_CHANCE_PER_ROUND = 0.02; // spawns arrive a little more relentlessly each round
const SPAWN_CHANCE_CAP = 0.6;

// Wave size and spawn pressure both scale with team count, not just round number — the same
// absolute zombie count hits a solo team far harder than three teams splitting the labor of
// answering, building, and shooting, since each team defends with the same fixed bullets/axes
// regardless of how many teams are in the room. Per teacher feedback that solo/duo games felt
// punishingly hard next to 3+ team games. 3 teams is the original tuning baseline (1.0x); every
// team below or above that shifts the wave by 20%.
const TEAM_COUNT_DIFFICULTY_BASELINE = 3;
const TEAM_COUNT_DIFFICULTY_STEP = 0.2;
function teamCountDifficultyScale(teamCount: number): number {
  return Math.max(0.5, 1 + (teamCount - TEAM_COUNT_DIFFICULTY_BASELINE) * TEAM_COUNT_DIFFICULTY_STEP);
}

function roundZombieQuota(round: number, teamCount: number): number {
  const base = ROUND_QUOTA_BASE + (round - 1) * ROUND_QUOTA_GROWTH;
  return Math.max(2, Math.round(base * teamCountDifficultyScale(teamCount)));
}
function spawnChanceForRound(round: number, teamCount: number): number {
  const base = SPAWN_CHANCE_BASE + (round - 1) * SPAWN_CHANCE_PER_ROUND;
  return Math.min(SPAWN_CHANCE_CAP, base * teamCountDifficultyScale(teamCount));
}

// A three-tier on-ramp, per teacher request: rounds 1-3 prefer halfSentences content (a
// sentence-starter a team completes aloud — the easiest tier, currently authored for conditional
// topics only), rounds 4-6 prefer speaking-task content (each topic's own cardTasks pool, mapped
// onto the same crewmateTopic/crewmatePrompt shape — a single open task, no crewmate/spy roleplay
// framing, universally available since every topic already has 20 cardTasks), and round 7+ uses
// the normal spyRounds-shaped open prompt exactly as before any of this existed. A tier is only
// used where the selected topic(s) actually have that content; otherwise pickNextQuestion falls
// through to the next tier down, all the way to the normal pool.
const HALF_SENTENCE_ROUND_CUTOFF = 3;
const SPEAKING_TASK_ROUND_CUTOFF = 6;

type EntryPointId = "frontDoor" | "backDoor" | "window1" | "window2";
const ENTRY_POINTS: { id: EntryPointId; label: string; icon: IconName }[] = [
  { id: "frontDoor", label: "Front Door", icon: "door" },
  { id: "backDoor", label: "Back Door", icon: "door" },
  { id: "window1", label: "Window", icon: "window" },
  { id: "window2", label: "Window", icon: "window" },
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
type PersonState = {
  bullets: number; bulletCap: number; axes: number; alive: boolean;
  rechargeSeconds: number; // this team's own bullet-recharge cadence — starts at BULLET_RECHARGE_SECONDS, lowered by fasterReload
  secondsSinceRecharge: number; // ticks toward rechargeSeconds; hits it -> +1 bullet (up to cap) and resets to 0
};

const ZOMBIE_ATTACK_INTERVAL_TICKS = 2; // a zombie now damages the barricade once every 2 ticks, not every tick — directly softens the "swarm insta-breaks the door" case, since N simultaneous attackers now deal roughly N/2 damage per tick instead of N

// From round 3 on, two variants start appearing alongside the normal zombie — kept to just two so
// a teacher can explain them at a glance: runner = faster, brute = hits harder.
const APPROACH_TICKS_BY_KIND: Record<ZombieKind, number> = { normal: APPROACH_TICKS, runner: 8, brute: APPROACH_TICKS };
const DAMAGE_BY_KIND: Record<ZombieKind, number> = { normal: ZOMBIE_DAMAGE_PER_TICK, runner: ZOMBIE_DAMAGE_PER_TICK, brute: 2 };
// All three kinds share the one "zombie" glyph — the size/glow treatment below (not the icon
// shape itself) is what already carries "reads different at a glance," so a distinct icon per
// kind would be redundant with that existing signal, not additive.
const ZOMBIE_KIND_ICON: Record<ZombieKind, IconName> = { normal: "zombie", runner: "zombie", brute: "zombie" };
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
  // True once the current wave's quota is fully spawned and resolved — advanceTick freezes
  // spawning (and everything downstream of it) while this is true, and `round` etc. stay pointed
  // at the just-cleared wave, until the teacher explicitly confirms via the "Wave Complete!"
  // screen (see confirmNextWave). Per teacher feedback that the old auto-advance-on-clear
  // behavior was confusing for students with no clear "that wave is over" moment.
  awaitingNextWave: boolean;
};

type TickEventKind = "barricadeDestroyed" | "chairExploded" | "zombieShot" | "axeUsed" | "personEliminated" | "waveCleared";
type TickEvent = { kind: TickEventKind; entryPointId?: EntryPointId; teamId?: string | number };

// Fun-stats-only tallies for the gameover screen — none of these feed scoring or difficulty, they
// just answer "who did what" once the house falls. Axes deliberately excluded — every eliminated
// team burns both on the way down, so it's a near-constant, not an interesting stat.
type TeamStats = { kills: number; chairsPlaced: number };

type Phase = "intro" | "playing" | "gameover";
type RoundPhase = "reveal" | "active";
type FxKind = "barricadePlaced" | "barricadeDestroyed" | "chairExploded" | "zombieShot" | "axeUsed";
type SiegeFx = { id: number; kind: FxKind; key: number; teamId?: string | number };

// "zombieShot" names the shooting team ("🔫 🔴 Team Red sniped a zombie!") and "chairExploded" is
// a longer, higher-excitement message — both noticeably longer than the other FX messages, which
// were tuned for a quick 3-word flash and leave longer text barely readable at 600ms.
function fxDurationMs(kind: FxKind): number {
  return kind === "zombieShot" || kind === "chairExploded" ? 1700 : 600;
}
type ElimBanner = { teamName: string; color: string; key: number };
type PowerUpBanner = { text: React.ReactNode; key: number };

const POWERUP_LABEL: Record<PowerUpKind, React.ReactNode> = {
  maxAmmo: <><Icon name="gun" size={13} /> Max Ammo!</>,
  bulletCapUp: <><Icon name="gun" size={13} /> Ammo Cap +1!</>,
  allDoorsChair: <><Icon name="chair" size={13} /> Chair on Every Door!</>,
  ammoAllTeamsPlus1: <><Icon name="gun" size={13} /> +1 Ammo for Everyone!</>,
  ammoAllTeamsPlus2: <><Icon name="gun" size={13} /><Icon name="gun" size={13} /> +2 Ammo for Everyone!</>,
  nuke: <><Icon name="explosion" size={13} /> NUKE! All zombies destroyed!</>,
  fasterReload: <><Icon name="bolt" size={13} /> Faster Reload! (-10s cooldown)</>,
};

function emptyBarricades(): Record<EntryPointId, BarricadeItem[]> {
  const result = {} as Record<EntryPointId, BarricadeItem[]>;
  ENTRY_POINTS.forEach(ep => { result[ep.id] = []; });
  return result;
}

// Ticks every alive team's own bullet-recharge cadence forward by one second. Each team can now
// have a different rechargeSeconds (see fasterReload), so this can no longer be a single shared
// elapsedSeconds modulo check — every person tracks their own secondsSinceRecharge instead, and
// this same helper is shared by the awaitingNextWave-frozen branch and the normal tick below so
// the two can't drift out of sync with each other.
function tickBulletRecharge(persons: Record<string | number, PersonState>, aliveTeamIds: (string | number)[]): Record<string | number, PersonState> {
  let next = persons;
  aliveTeamIds.forEach(id => {
    const person = next[id];
    if (!person?.alive) return;
    const secondsSinceRecharge = person.secondsSinceRecharge + 1;
    if (secondsSinceRecharge >= person.rechargeSeconds) {
      next = { ...next, [id]: { ...person, bullets: Math.min(person.bulletCap, person.bullets + 1), secondsSinceRecharge: 0 } };
    } else {
      next = { ...next, [id]: { ...person, secondsSinceRecharge } };
    }
  });
  return next;
}

// The one genuinely new pattern in this codebase: an open-ended real-time tick, rather than the
// bounded countdowns/dice-flickers every other game uses. Kept as a pure function — no React, no
// side effects — so the state transition for one second of siege time is easy to reason about in
// isolation: spawn, walk, attack, breach, advance the clock.
function advanceTick(
  state: SiegeState,
  aliveTeamIds: (string | number)[],
  teamCount: number,
  nextZombieId: () => number
): { next: SiegeState; events: TickEvent[] } {
  const events: TickEvent[] = [];
  const barricades = {} as Record<EntryPointId, BarricadeItem[]>;
  ENTRY_POINTS.forEach(ep => { barricades[ep.id] = state.barricades[ep.id].map(b => ({ ...b })); });

  let zombies = state.zombies.map(z => ({ ...z }));
  let persons = { ...state.persons };
  const elapsedSeconds = state.elapsedSeconds + 1;
  const round = state.round;

  // Frozen between waves — the current wave already cleared and is waiting on the teacher to
  // confirm via the "Wave Complete!" screen. Nothing zombie-related happens (no spawns, no round
  // clock) until that happens; bullets still recharge so nobody's punished for how long the
  // teacher takes to move on. barricades/zombies/round/roundElapsedSeconds/zombiesSpawnedThisRound
  // all stay exactly as they were — still reflecting the just-cleared wave.
  if (state.awaitingNextWave) {
    persons = tickBulletRecharge(persons, aliveTeamIds);
    return { next: { ...state, persons, elapsedSeconds }, events: [] };
  }

  const roundElapsedSeconds = state.roundElapsedSeconds + 1;
  let zombiesSpawnedThisRound = state.zombiesSpawnedThisRound;

  // 0. Recharge — a flat timer, completely independent of rounds or how the English tasks are
  // going. Axes never regenerate; only bullets do. Each team ticks its own rechargeSeconds cadence.
  persons = tickBulletRecharge(persons, aliveTeamIds);

  // 1. Spawn — gated by the read pause (nothing spawns while the class is still reading the new
  // prompt) and capped by this round's wave quota. A random entry point, pure chance, no targeting.
  const quota = roundZombieQuota(round, teamCount);
  const spawningAllowed = roundElapsedSeconds > roundReadPauseSeconds(round) && zombiesSpawnedThisRound < quota;
  if (spawningAllowed && Math.random() < spawnChanceForRound(round, teamCount)) {
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
  // ever counts down. A chair that breaks has a CHAIR_EXPLODE_CHANCE shot at taking its zombie
  // down too — tracked here and filtered out below (a .map() callback can't itself remove an
  // entry) so the breach step never sees an exploded zombie as still attacking.
  const explodedZombieIds = new Set<number>();
  zombies = zombies.map(z => {
    if (z.status !== "attacking") return z;
    const stack = barricades[z.entryPointId];
    if (!stack.length) return z; // stack already empty — this zombie is breach-eligible, handled next
    if (z.attackCooldown > 0) return { ...z, attackCooldown: z.attackCooldown - 1 };
    const front = stack[0];
    front.hp -= DAMAGE_BY_KIND[z.kind];
    if (front.hp <= 0) {
      stack.shift();
      if (Math.random() < CHAIR_EXPLODE_CHANCE) {
        explodedZombieIds.add(z.id);
        events.push({ kind: "chairExploded", entryPointId: z.entryPointId });
      } else {
        events.push({ kind: "barricadeDestroyed", entryPointId: z.entryPointId });
      }
    }
    return { ...z, attackCooldown: ZOMBIE_ATTACK_INTERVAL_TICKS - 1 };
  });
  zombies = zombies.filter(z => !explodedZombieIds.has(z.id));

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

  // 5. Wave clear — a closed wave, not a clock: it's only cleared once every zombie promised for
  // it has both spawned and been resolved (shot or breached). A fast class clears waves quickly
  // and gets to the "Wave Complete!" screen sooner; a struggling class just holds at the same
  // pressure for longer instead of the horde escalating out from under them regardless. Doesn't
  // auto-advance round/roundElapsedSeconds/zombiesSpawnedThisRound itself anymore — it only sets
  // awaitingNextWave (freezing the wave-related tick logic above, see the top of this function)
  // and fires one waveCleared event; the teacher's click on "Wave Complete!" (confirmNextWave in
  // the component) is what actually resets those counters and moves to the next round.
  const waveJustCleared = zombiesSpawnedThisRound >= quota && survivors.length === 0;
  if (waveJustCleared) events.push({ kind: "waveCleared" });

  return {
    next: {
      barricades, zombies: survivors, persons, elapsedSeconds,
      round, roundElapsedSeconds, zombiesSpawnedThisRound,
      awaitingNextWave: waveJustCleared,
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
        <span key={i} style={{ position: "absolute", left: `${t.x}%`, top: `${t.y}%`, opacity: 0.55, color: "#4D7C0F", transform: "translate(-50%,-50%)" }}><Icon name="tree" size={t.size} /></span>
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
            <div title={ep.label} style={{ position: "absolute", left: `${g.doorX}%`, top: `${g.doorY}%`, transform: "translate(-50%,-50%)", color: "#D2B48C", zIndex: 2 }}><Icon name={ep.icon} size={15} /></div>
            <div style={{ position: "absolute", left: `${g.barricadeX}%`, top: `${g.barricadeY}%`, transform: "translate(-50%,-50%)", display: "flex", gap: "1px", zIndex: 2 }}>
              {stack.slice(0, 4).map((b, i) => (
                <span key={b.id} title={`${b.hp}/${BARRICADE_ITEM_HP} hp`} style={{
                  opacity: 0.4 + 0.6 * (b.hp / BARRICADE_ITEM_HP), color: "#A16207",
                  filter: i === 0 ? "drop-shadow(0 0 3px #BEF26499)" : "none",
                }}><Icon name="chair" size={13} /></span>
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
          }}>{person.alive ? <MascotSprite mascot={t.mascot} fallback="🧑" size={17} /> : <Icon name="skull" size={16} />}</div>
        );
      })}
      {siege.zombies.map(z => {
        const pos = zombiePosition(z);
        return (
          <div key={z.id} style={{
            position: "absolute", left: `${pos.x}%`, top: `${pos.y}%`, transform: "translate(-50%,-50%)",
            transition: `left ${TICK_MS}ms linear, top ${TICK_MS}ms linear`, zIndex: 4,
            color: "#4ADE80", filter: ZOMBIE_KIND_STYLE[z.kind].filter,
            animation: z.status === "attacking" ? "zsShake 0.3s ease-in-out infinite" : "zsBob 0.9s ease-in-out infinite",
          }}><Icon name={ZOMBIE_KIND_ICON[z.kind]} size={Number(ZOMBIE_KIND_STYLE[z.kind].fontSize.replace("px", ""))} /></div>
        );
      })}
    </div>
  );
}

function PersonChip({ team, person }: { team: Team; person: PersonState }) {
  // Recharge cadence is per-team now (see fasterReload), so progress is derived from this
  // person's own counters rather than a single shared fraction passed in from outside.
  const rechargeProgress = person.secondsSinceRecharge / person.rechargeSeconds;
  return (
    <div style={{
      background: person.alive ? `linear-gradient(160deg,${team.color.dark}55,#050805)` : "#1A1A1A88",
      border: `2px solid ${person.alive ? team.color.bg : "#4B5563"}`,
      borderRadius: "12px", padding: "5px 9px", textAlign: "center", opacity: person.alive ? 1 : 0.55, minWidth: "78px",
    }}>
      <div style={{ fontSize: "16px", lineHeight: 1.1 }}>{person.alive ? <MascotSprite mascot={team.mascot} fallback="🧑" size={18} /> : <Icon name="skull" size={17} />}</div>
      <div style={{ fontWeight: "800", fontSize: "11px", color: person.alive ? "white" : "#9CA3AF" }}>{team.name}</div>
      {person.alive ? (
        <div style={{ fontSize: "11px", lineHeight: 1.3, display: "flex", gap: "1px", justifyContent: "center", alignItems: "center", flexWrap: "wrap", color: "#E5E7EB" }}>
          {/* Always shows bulletCap slots (not just current bullets) — a team with 1/3 bullets sees
              three guns, two of them greyed out, so the empty capacity is always visible, not just
              inferred from a bare count. The next slot due to recharge (i === person.bullets, while
              still under cap) gets a small conic-gradient ring so the wait isn't a silent pop-in. */}
          {Array.from({ length: person.bulletCap }, (_, i) => {
            const gun = <span style={{ opacity: i < person.bullets ? 1 : 0.28, filter: i < person.bullets ? "none" : "grayscale(1)" }}><Icon name="gun" size={12} /></span>;
            if (i !== person.bullets || person.bullets >= person.bulletCap) return <span key={i}>{gun}</span>;
            const secsLeft = Math.round((1 - rechargeProgress) * person.rechargeSeconds);
            return (
              <span key={i} title={`Recharges in ~${secsLeft}s`} style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center", width: "16px", height: "16px",
                borderRadius: "50%", background: `conic-gradient(#4ADE80 ${rechargeProgress * 360}deg, #1F293766 0deg)`, padding: "1px",
              }}>
                <span style={{ display: "inline-flex", width: "100%", height: "100%", borderRadius: "50%", background: "#050805", alignItems: "center", justifyContent: "center" }}>{gun}</span>
              </span>
            );
          })}
          {person.axes > 0 && (
            <span style={{ marginLeft: "3px", display: "inline-flex", gap: "1px" }}>
              {Array.from({ length: person.axes }, (_, i) => <Icon key={i} name="axe" size={12} />)}
            </span>
          )}
        </div>
      ) : (
        <div style={{ fontSize: "9px", color: "#9CA3AF", fontWeight: "700", display: "flex", alignItems: "center", justifyContent: "center", gap: "3px" }}><Icon name="megaphone" size={10} /> cheering</div>
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
  // halfSentences/cardTasks items (see LessonGamesGenerator's "zombie" branch): crewmateTopic is
  // only a dedup key for these, not real display content, so it's deliberately not rendered as a
  // heading the way it is for normal spyRounds-shaped rounds.
  const isHalfSentence = question.type === "finish the sentence";
  const isSpeakingTask = question.type === "speaking task";
  const showCrewmateHeading = !isHalfSentence && !isSpeakingTask && !!question.crewmateTopic;
  const badgeText = isHalfSentence ? <><Icon name="pencil" size={11} /> finish the sentence</> : isSpeakingTask ? <><Icon name="mic" size={11} /> speaking task</> : <><Icon name="bookOpen" size={11} /> add to the prompt</>;
  return (
    <div style={{
      position: "relative", background: "white", border: "3px solid #6366F1", borderRadius: "16px",
      padding: "16px 20px", textAlign: "center", boxShadow: "0 6px 20px #6366F144",
    }}>
      <div style={{ position: "absolute", top: "10px", right: "10px" }}>
        <FlagPromptButton gameId="zombie" questionData={question} />
      </div>
      <div style={{
        display: "inline-flex", alignItems: "center", gap: "5px", background: "#EEF2FF", color: "#4F46E5",
        padding: "3px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "700", marginBottom: "8px",
        textTransform: "uppercase", letterSpacing: "0.04em",
      }}>
        {badgeText}
      </div>
      {showCrewmateHeading && (
        <div style={{ fontSize: "22px", fontWeight: "900", color: "#1E1B4B", margin: "0 0 6px" }}>
          {question.crewmateTopic}
        </div>
      )}
      <p style={{
        fontSize: "17px", fontWeight: "600", color: "#374151", margin: 0, lineHeight: 1.4,
      }}>
        {question.crewmatePrompt}
      </p>
      {isHalfSentence && question.hint && (
        <p style={{ fontSize: "12px", color: "#9CA3AF", fontStyle: "italic", margin: "8px 0 0" }}>
          {question.hint}
        </p>
      )}
    </div>
  );
}

// What "Save & Exit" snapshots and "Resume" restores — the entire siege state (barricades,
// zombies, per-team bullets/axes, round counters) plus the fun-stats tally, all of which is
// plain data with no live refs/timers, so it round-trips exactly. Resuming skips straight to
// "playing" with siege picking up mid-round; the next tick's existing "no current prompt yet"
// effect naturally draws a fresh round prompt, so there's no need to also snapshot the
// transient currentQuestion/roundPhase/fx/banner UI state.
type ZombieSiegeSnapshot = {
  siege: SiegeState;
  statsByTeam: Record<string | number, TeamStats>;
};

function validateZombieSiegeSnapshot(raw: unknown, teams: { id: string | number }[]): ZombieSiegeSnapshot | undefined {
  const s = raw as Partial<ZombieSiegeSnapshot> | null | undefined;
  const siege = s?.siege as Partial<SiegeState> | undefined;
  if (!siege || typeof siege.round !== "number" || siege.round < 1) return undefined;
  if (!Array.isArray(siege.zombies) || !siege.barricades || !siege.persons) return undefined;

  // Backfills every existing person too (not just missing teams) so an older save from before
  // fasterReload existed still resumes safely instead of leaving rechargeSeconds/secondsSinceRecharge
  // undefined and corrupting the recharge tick's arithmetic.
  const persons: Record<string | number, PersonState> = {};
  Object.entries(siege.persons).forEach(([id, p]) => {
    const person = p as Partial<PersonState>;
    persons[id] = {
      bullets: person.bullets ?? BULLET_CAP_START,
      bulletCap: person.bulletCap ?? BULLET_CAP_START,
      axes: person.axes ?? MAX_AXES,
      alive: person.alive ?? true,
      rechargeSeconds: person.rechargeSeconds ?? BULLET_RECHARGE_SECONDS,
      secondsSinceRecharge: person.secondsSinceRecharge ?? 0,
    };
  });
  teams.forEach(t => {
    if (!persons[t.id]) persons[t.id] = { bullets: BULLET_CAP_START, bulletCap: BULLET_CAP_START, axes: MAX_AXES, alive: true, rechargeSeconds: BULLET_RECHARGE_SECONDS, secondsSinceRecharge: 0 };
  });
  const barricades = { ...emptyBarricades(), ...siege.barricades };

  const statsByTeam = { ...(s?.statsByTeam ?? {}) };
  teams.forEach(t => {
    if (!statsByTeam[t.id]) statsByTeam[t.id] = { kills: 0, chairsPlaced: 0 };
  });

  return {
    siege: {
      barricades,
      zombies: siege.zombies,
      persons,
      elapsedSeconds: siege.elapsedSeconds ?? 0,
      round: siege.round,
      roundElapsedSeconds: siege.roundElapsedSeconds ?? 0,
      zombiesSpawnedThisRound: siege.zombiesSpawnedThisRound ?? 0,
      awaitingNextWave: siege.awaitingNextWave ?? false,
    },
    statsByTeam,
  };
}

export function ZombieSiegeGame({ questions, teams, onUpdateScore, onEnd, forceFinalRef, paused, onTogglePause, serializeStateRef, initialGameState }: GameProps) {
  const resumed = useRef(validateZombieSiegeSnapshot(initialGameState, teams)).current;

  const [phase, setPhase] = useState<Phase>(resumed ? "playing" : "intro");
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
  const [siege, setSiege] = useState<SiegeState>(() => resumed?.siege ?? ({
    barricades: emptyBarricades(),
    zombies: [],
    persons: Object.fromEntries(teams.map(t => [t.id, { bullets: BULLET_CAP_START, bulletCap: BULLET_CAP_START, axes: MAX_AXES, alive: true, rechargeSeconds: BULLET_RECHARGE_SECONDS, secondsSinceRecharge: 0 }])),
    elapsedSeconds: 0,
    round: 1,
    roundElapsedSeconds: 0,
    zombiesSpawnedThisRound: 0,
    awaitingNextWave: false,
  }));
  const [currentQuestion, setCurrentQuestion] = useState<QuestionData | null>(null);
  const [roundPhase, setRoundPhase] = useState<RoundPhase>("reveal");
  const [fx, setFx] = useState<SiegeFx[]>([]);
  const [elimBanner, setElimBanner] = useState<ElimBanner | null>(null);
  const [powerUpBanner, setPowerUpBanner] = useState<PowerUpBanner | null>(null);
  const [statsByTeam, setStatsByTeam] = useState<Record<string | number, TeamStats>>(() =>
    resumed?.statsByTeam ?? Object.fromEntries(teams.map(t => [t.id, { kills: 0, chairsPlaced: 0 }]))
  );
  const breakTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!serializeStateRef) return;
    serializeStateRef.current = (): ZombieSiegeSnapshot => ({ siege, statsByTeam });
    return () => { if (serializeStateRef) serializeStateRef.current = null; };
  }, [serializeStateRef, siege, statsByTeam]);

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

  const showPowerUpBanner = useCallback((text: React.ReactNode) => {
    const key = fxIdRef.current++;
    setPowerUpBanner({ text, key });
    setTimeout(() => setPowerUpBanner(prev => (prev?.key === key ? null : prev)), 2600);
  }, []);

  // Question pool: sourced from spyRounds (LessonGamesGenerator wires "zombie" alongside "spy"),
  // so `questions` here is already crewmateTopic/crewmatePrompt content, not the fixed-answer
  // grammar-drill pool the other mixed-pool games use. Shuffled once, one shared stream (no
  // per-team/per-category split). Where a selected topic has halfSentences and/or cardTasks
  // content, those are mixed in too (same crewmateTopic/crewmatePrompt shape, tagged
  // type:"finish the sentence" / type:"speaking task") — picked preferentially for early rounds per the
  // three-tier on-ramp (see HALF_SENTENCE_ROUND_CUTOFF/SPEAKING_TASK_ROUND_CUTOFF above). Never
  // picked past their cutoff, so the difficulty curve from round 7 on is unchanged from before any
  // of this existed.
  const pool = useRef([...questions].sort(() => Math.random() - 0.5)).current;
  const lastTopicRef = useRef<string | undefined>(undefined);
  const pickNextQuestion = useCallback((roundNumber: number): QuestionData | null => {
    if (!pool.length) return null;
    const halfSentenceItems = pool.filter(q => q.type === "finish the sentence");
    const speakingTaskItems = pool.filter(q => q.type === "speaking task");
    const normalItems = pool.filter(q => q.type !== "finish the sentence" && q.type !== "speaking task");
    let candidates: QuestionData[];
    if (roundNumber <= HALF_SENTENCE_ROUND_CUTOFF && halfSentenceItems.length > 0) {
      candidates = halfSentenceItems;
    } else if (roundNumber <= SPEAKING_TASK_ROUND_CUTOFF && speakingTaskItems.length > 0) {
      candidates = speakingTaskItems;
    } else {
      candidates = normalItems.length > 0 ? normalItems : pool;
    }
    const fresh = candidates.filter(q => q.crewmateTopic !== lastTopicRef.current);
    const source = fresh.length ? fresh : candidates;
    const chosen = source[Math.floor(Math.random() * source.length)];
    lastTopicRef.current = chosen.crewmateTopic;
    return chosen;
  }, [pool]);

  // A new prompt is drawn once per round, not once per answer — everyone gets
  // roundReadPauseSeconds(roundNumber) to read it before the credit buttons unlock and the room
  // opens up into free-for-all sentence-throwing. Any team can be credited any number of times
  // against the same prompt — there's no per-team cap, since the horde only gets harder and the
  // class needs to be able to keep pumping out barricades/power-ups at whatever pace it can manage.
  const startRound = useCallback((question: QuestionData | null, roundNumber: number) => {
    setCurrentQuestion(question);
    setRoundPhase("reveal");
    if (breakTimeoutRef.current) clearTimeout(breakTimeoutRef.current);
    breakTimeoutRef.current = setTimeout(() => setRoundPhase("active"), roundReadPauseSeconds(roundNumber) * 1000);
  }, []);

  useEffect(() => () => { if (breakTimeoutRef.current) clearTimeout(breakTimeoutRef.current); }, []);

  // Lets the teacher skip the read-pause early once the class has actually read the prompt —
  // rarely needed (the countdown is there on purpose, to give slower readers time), but no reason
  // to force the room to sit through it if everyone's already ready. Fast-forwards
  // roundElapsedSeconds past the read-pause threshold too, not just the UI phase, so zombies start
  // spawning right away instead of the horde still waiting out the skipped countdown in the
  // background.
  const skipReadPause = useCallback(() => {
    if (breakTimeoutRef.current) clearTimeout(breakTimeoutRef.current);
    setRoundPhase("active");
    setSiege(prev => ({ ...prev, roundElapsedSeconds: roundReadPauseSeconds(prev.round) + 1 }));
  }, []);

  // Advancing to the next wave is now a teacher-confirmed action (the "Wave Complete!" screen),
  // not something this tick loop does automatically — it only reacts to "waveCleared" by leaving
  // siege.awaitingNextWave true (already set by advanceTick), which the render below turns into
  // that screen. See confirmNextWave for what actually happens when the teacher clicks through it.
  useEffect(() => {
    if (phase !== "playing") return;
    const id = setInterval(() => {
      if (pausedRef.current) return;
      const aliveTeamIds = teams.map(t => t.id);
      const { next, events } = advanceTick(siegeRef.current, aliveTeamIds, teams.length, () => zombieIdRef.current++);
      setSiege(next);
      events.forEach(ev => {
        if (ev.kind === "barricadeDestroyed") pushFx("barricadeDestroyed");
        if (ev.kind === "chairExploded") pushFx("chairExploded");
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
  }, [phase, teams, pushFx, showElimination, bumpStat]);

  useEffect(() => {
    if (phase === "playing" && !currentQuestion) startRound(pickNextQuestion(siegeRef.current.round), siegeRef.current.round);
  }, [phase, currentQuestion, pickNextQuestion, startRound]);

  // Fires when the teacher clicks through the "Wave Complete!" screen — this is the only place
  // round/roundElapsedSeconds/zombiesSpawnedThisRound actually reset and awaitingNextWave clears,
  // so nothing about the next wave (spawning, its prompt) starts until the teacher says so.
  const confirmNextWave = useCallback(() => {
    const newRound = siegeRef.current.round + 1;
    setSiege(prev => ({ ...prev, round: newRound, roundElapsedSeconds: 0, zombiesSpawnedThisRound: 0, awaitingNextWave: false }));
    startRound(pickNextQuestion(newRound), newRound);
  }, [pickNextQuestion, startRound]);

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
      } else if (kind === "fasterReload") {
        const person = persons[teamId];
        const rechargeSeconds = Math.max(BULLET_RECHARGE_FLOOR_SECONDS, person.rechargeSeconds - BULLET_RECHARGE_STEP_SECONDS);
        persons = { ...persons, [teamId]: { ...person, rechargeSeconds } };
      }
      return { ...prev, persons, barricades, zombies };
    });
    const team = teams.find(t => t.id === teamId);
    showPowerUpBanner(<><TeamIcon team={team} color="white" /> {team?.name ?? ""}: {POWERUP_LABEL[kind]}</>);
  }, [teams, showPowerUpBanner]);

  // The prompt persists for the whole round — any team can throw a sentence at it as many times
  // as they like, each one its own reward roll. No per-team cap: the horde only gets harder, so
  // the class needs to be able to keep answering at whatever pace keeps them alive.
  const handleCorrectAnswer = (teamId: string | number) => {
    onUpdateScore(teamId, CORRECT_ANSWER_SCORE);
    if (Math.random() < POWERUP_CHANCE) {
      const kind = pickPowerUpKind();
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
          <div style={{ marginBottom: "10px" }}><Icon name="zombie" size={36} /></div>
          <div style={{ fontWeight: "900", fontSize: "20px", marginBottom: "10px", color: "#BEF264" }}>Zombie Siege</div>
          <div style={{ fontSize: "15px", lineHeight: 1.6, opacity: 0.95 }}>
            One shared house, everyone's score. Add a sentence any time to earn a barricade or a <strong style={{ color: "#BEF264" }}>power-up</strong> — <strong style={{ color: "#BEF264" }}>bullets recharge</strong> and auto-shoot zombies at the door, and <strong style={{ color: "#BEF264" }}>2 axes</strong> per team are the last resort if one breaks through.<br />
            Clear the wave, and a bigger one begins!
          </div>
        </div>
        <button onClick={() => setShowHowTo(true)} className="zs-btn" style={{ display: "block", margin: "0 auto 14px", background: "rgba(255,255,255,0.95)", color: GM.color, border: `2px solid ${GM.color}`, boxShadow: "0 2px 8px rgba(0,0,0,0.18)", borderRadius: "12px", padding: "10px 24px", fontSize: "14px", fontWeight: "800", cursor: "pointer" }}>
          <Icon name="help" size={14} /> How to Play
        </button>
        {showHowTo && (
          <HowToPlayModal
            gameName={GM.name} gameIcon={GAME_ICONS[GM.id]} accentColor={GM.color}
            steps={ZOMBIE_TUTORIAL_STEPS}
            onClose={() => setShowHowTo(false)}
          />
        )}
        <button onClick={() => setPhase("playing")} className="zs-btn" style={{ background: "linear-gradient(135deg,#365314,#65A30D)", color: "#0D1A0D", border: "none", borderRadius: "16px", padding: "16px 48px", fontSize: "19px", fontWeight: "900", cursor: "pointer", boxShadow: "0 6px 24px rgba(101,163,13,0.5)", transition: "transform 0.15s ease" }}><Icon name="house" size={17} /> Board Up the House!</button>
      </div>
    </div>
  );

  if (phase === "gameover") {
    return (
      <div style={{ ...arenaStyle, textAlign: "center" }}>
        {fogLayer}
        {STYLE_TAG}
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ marginBottom: "6px" }}><Icon name="skull" size={48} /></div>
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
                  <div style={{ fontWeight: "800", color: "#BEF264", fontSize: "13px", marginBottom: "6px" }}><TeamIcon team={t} /> {t.name}</div>
                  <div style={{ fontSize: "12px", color: "#DCFCE7", lineHeight: 1.7 }}>
                    <div><Icon name="zombie" size={12} /> {stats.kills} zombie{stats.kills === 1 ? "" : "s"} shot</div>
                    <div><Icon name="chair" size={12} /> {stats.chairsPlaced} chair{stats.chairsPlaced === 1 ? "" : "s"} placed</div>
                  </div>
                </div>
              );
            })}
          </div>
          <button onClick={onEnd} className="zs-btn" style={{ background: "linear-gradient(135deg,#365314,#65A30D)", color: "#0D1A0D", border: "none", borderRadius: "14px", padding: "14px 32px", fontSize: "17px", fontWeight: "900", cursor: "pointer", boxShadow: "0 6px 24px rgba(101,163,13,0.5)", transition: "transform 0.15s ease" }}><Icon name="checkeredFlag" size={17} /> End Game</button>
        </div>
      </div>
    );
  }

  const aliveTeams = teams.filter(t => siege.persons[t.id]?.alive);
  const round = siege.round;
  const roundQuota = roundZombieQuota(round, teams.length);
  const roundDefeated = siege.zombiesSpawnedThisRound - siege.zombies.length;
  // How long students still have to read/prepare before the round opens up — reuses the same
  // tick-driven roundElapsedSeconds clock advanceTick already gates zombie spawning against
  // (see spawningAllowed), so this bar and the actual "round truly starts" moment can't drift
  // out of sync with each other.
  const prepSecondsTotal = roundReadPauseSeconds(round);
  const prepSecondsLeft = Math.max(0, prepSecondsTotal - siege.roundElapsedSeconds);

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
            <div style={{ marginBottom: "8px" }}><Icon name="pause" size={44} /></div>
            <div style={{ fontWeight: "900", fontSize: "22px", color: "#BEF264" }}>Paused</div>
            <div style={{ fontSize: "14px", color: "#D9F99D", marginTop: "6px", fontWeight: "700" }}>Tap to resume</div>
          </div>
        </div>
      )}
      {/* Blocking gate, not a fleeting toast — per teacher feedback that auto-advancing straight
          into the next wave left students unsure whether the last one had actually ended. Spawning
          is already frozen (see advanceTick's awaitingNextWave branch); nothing about the next wave
          starts until this button is clicked. Deliberately hidden behind the pause overlay if both
          are somehow true at once, so "Paused" always wins visually. */}
      {siege.awaitingNextWave && !paused && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 25, borderRadius: "20px",
          background: "rgba(5,10,5,0.88)", display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <div style={{ textAlign: "center", color: "white", padding: "20px" }}>
            <div style={{ marginBottom: "8px" }}><Icon name="wave" size={44} /></div>
            <div style={{ fontWeight: "900", fontSize: "24px", color: "#BEF264" }}>Wave {round} Complete!</div>
            <div style={{ fontSize: "14px", color: "#D9F99D", marginTop: "6px", fontWeight: "700", marginBottom: "18px" }}>
              The house held! Get ready for wave {round + 1}.
            </div>
            <button onClick={confirmNextWave} className="zs-btn" style={{
              background: "linear-gradient(135deg,#365314,#65A30D)", color: "#0D1A0D", border: "none",
              borderRadius: "14px", padding: "14px 32px", fontSize: "17px", fontWeight: "900", cursor: "pointer",
              boxShadow: "0 6px 24px rgba(101,163,13,0.5)", transition: "transform 0.15s ease",
            }}><Icon name="next" size={15} /> Start Wave {round + 1}</button>
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
              display: "inline-flex", alignItems: "center", gap: "5px",
            }}>
              {f.kind === "barricadePlaced" && <><Icon name="chair" size={12} /> barricade placed</>}
              {f.kind === "barricadeDestroyed" && <><Icon name="explosion" size={12} /> barricade destroyed</>}
              {f.kind === "chairExploded" && <><Icon name="explosion" size={12} /><Icon name="zombie" size={12} /> chair exploded — zombie destroyed!</>}
              {f.kind === "zombieShot" && <><Icon name="gun" size={12} /> {shooter ? <><TeamIcon team={shooter} /> {shooter.name} sniped</> : "sniped"} a zombie!</>}
              {f.kind === "axeUsed" && <><Icon name="axe" size={12} /> axe used!</>}
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
          <span style={{ color: "white", fontWeight: "900", fontSize: "16px", textShadow: "0 1px 3px rgba(0,0,0,0.5)", display: "inline-flex", alignItems: "center", gap: "6px" }}>
            <Icon name="skull" size={16} /> {elimBanner.teamName} has been overrun!
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
          <span style={{ color: "white", fontWeight: "900", fontSize: "15px", textShadow: "0 1px 3px rgba(0,0,0,0.5)", display: "inline-flex", alignItems: "center", gap: "6px" }}>
            <Icon name="gift" size={15} /> {powerUpBanner.text}
          </span>
        </div>
      )}
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "6px", marginBottom: "4px" }}>
          <div style={{ fontWeight: "800", fontSize: "12px", color: "#BEF264", display: "inline-flex", alignItems: "center", gap: "4px" }}><Icon name="clock" size={12} /> {formatClock(siege.elapsedSeconds)}</div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ fontWeight: "900", fontSize: "13px", color: "#F87171", animation: round >= 6 ? "zsPulse 1s ease-in-out infinite" : "none", display: "inline-flex", alignItems: "center", gap: "4px" }}><Icon name="wave" size={13} /> Round {round} · {roundDefeated}/{roundQuota}</div>
            {/* Right next to the round indicator — the thing a teacher's eyes are already on mid-siege —
                not just up in the generic top bar, so it's actually noticed and used, not just present. */}
            {onTogglePause && (
              <button onClick={onTogglePause} className="zs-btn" title="Freeze the clock so you can explain something to the class" style={{
                background: paused ? "#F59E0B" : "#D97706", color: "white",
                border: paused ? "2px solid #FDE68A" : "2px solid rgba(255,255,255,0.6)",
                borderRadius: "8px", padding: "3px 9px", fontSize: "11px", fontWeight: "800", cursor: "pointer",
                boxShadow: paused ? "0 0 0 3px rgba(245,158,11,0.35)" : "0 2px 6px rgba(217,119,6,0.45)",
                display: "inline-flex", alignItems: "center", gap: "4px",
              }}>
                {paused ? <><Icon name="play" size={11} /> Resume</> : <><Icon name="pause" size={11} /> Pause</>}
              </button>
            )}
          </div>
        </div>

        <HouseScene siege={siege} teams={teams} />

        <div style={{ display: "flex", gap: "5px", justifyContent: "center", flexWrap: "wrap", marginBottom: "4px" }}>
          {teams.map(t => <PersonChip key={t.id} team={t} person={siege.persons[t.id]} />)}
        </div>

        <div style={{ maxWidth: "480px", width: "100%", margin: "0 auto" }}>
          <SiegeQuestionCard question={currentQuestion} />

          {roundPhase === "reveal" ? (
            <div style={{ textAlign: "center", marginTop: "8px" }}>
              <div style={{ fontSize: "12px", color: "#A3B899", fontWeight: "700", marginBottom: "6px", display: "inline-flex", alignItems: "center", gap: "5px" }}>
                <Icon name="bookOpen" size={12} /> Read the prompt... get ready!
              </div>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <TurnTimerBar timeLeft={prepSecondsLeft} totalSeconds={prepSecondsTotal} />
              </div>
              <button onClick={skipReadPause} className="zs-btn" style={{
                marginTop: "8px", background: "none", border: "1px solid #4D7C0F", color: "#BEF264",
                borderRadius: "8px", padding: "4px 14px", fontSize: "11px", fontWeight: "700", cursor: "pointer", transition: "transform 0.15s ease",
              }}><Icon name="check" size={11} /> Ready — skip countdown</button>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "5px", marginTop: "6px" }}>
              {aliveTeams.map(t => (
                <button key={t.id} onClick={() => handleCorrectAnswer(t.id)} className="zs-btn" style={{
                  background: t.color.bg, color: "white", border: "none", borderRadius: "10px",
                  padding: "6px 8px", fontSize: "11px", fontWeight: "800", cursor: "pointer", transition: "transform 0.15s ease",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "4px",
                }}><Icon name="plus" size={11} /> <TeamIcon team={t} color="white" /> {t.name} added to it!</button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
