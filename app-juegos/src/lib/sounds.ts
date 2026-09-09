// Game sound effects — all sourced from kenney.nl CC0 packs (Interface Sounds, Digital Audio,
// Sci-Fi Sounds, Impact Sounds, RPG Audio, Casino Audio — all public domain, no attribution
// required). Two tiers:
//  - Tier 1 (correct/wrong/tick/timesUp/win): shared feedback routed through the chokepoints
//    that already exist for these events (updateScore, useTurnTimer, the confetti trigger)
//    rather than being called from each of the 15 games individually.
//  - Tier 2 (one entry per game id, matching GAME_MODES): a single signature sound per game,
//    layered on top of the Tier 1 ones at that game's own defining moment — see the comment at
//    each game's call site for exactly which moment and why.

const SOUND_FILES = {
  correct: "/sounds/correct.ogg",
  wrong: "/sounds/wrong.ogg",
  tick: "/sounds/tick.ogg",
  timesUp: "/sounds/times-up.ogg",
  win: "/sounds/win.ogg",
  // Tier 2 — one per game, keyed by GAME_MODES id.
  auction: "/sounds/auction.ogg",
  battleship: "/sounds/battleship.ogg",
  cards: "/sounds/cardshuffle.ogg",
  castle: "/sounds/castle.ogg",
  hotpotato: "/sounds/hotpotato.ogg",
  hotseat: "/sounds/hotseat.ogg",
  hill: "/sounds/hill.ogg",
  minefield: "/sounds/minefield.ogg",
  orderup: "/sounds/orderup.ogg",
  racetrack: "/sounds/racetrack.ogg",
  rocket: "/sounds/rocket.ogg",
  spy: "/sounds/spy.ogg",
  vault: "/sounds/vault.ogg",
  whack: "/sounds/whack.ogg",
  zombie: "/sounds/zombie.ogg",
} as const;

export type SoundName = keyof typeof SOUND_FILES;

// Ticks fire once a second near the end of every timed turn across ~11 games — quieter so it
// reads as a subtle cue, not a metronome competing with the teacher's voice. Tier 2 sounds default
// to 0.7 (a touch under Tier 1's 0.8) since they layer on top of a Tier 1 sound at the same
// moment more often than not, and shouldn't fight it for attention.
const DEFAULT_TIER2_VOLUME = 0.7;
const SOUND_VOLUME: Record<SoundName, number> = {
  correct: 0.55,
  wrong: 0.8,
  tick: 0.35,
  timesUp: 0.8,
  win: 0.55,
  auction: DEFAULT_TIER2_VOLUME,
  battleship: DEFAULT_TIER2_VOLUME,
  cards: DEFAULT_TIER2_VOLUME,
  castle: DEFAULT_TIER2_VOLUME,
  hotpotato: DEFAULT_TIER2_VOLUME,
  hotseat: DEFAULT_TIER2_VOLUME,
  hill: DEFAULT_TIER2_VOLUME,
  minefield: DEFAULT_TIER2_VOLUME,
  orderup: DEFAULT_TIER2_VOLUME,
  racetrack: DEFAULT_TIER2_VOLUME,
  rocket: DEFAULT_TIER2_VOLUME,
  spy: DEFAULT_TIER2_VOLUME,
  vault: DEFAULT_TIER2_VOLUME,
  whack: DEFAULT_TIER2_VOLUME,
  zombie: DEFAULT_TIER2_VOLUME,
};

const STORAGE_KEY = "classcade_sound_enabled";

let enabled = readEnabledFromStorage();
const listeners = new Set<(enabled: boolean) => void>();

function readEnabledFromStorage(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw === null ? true : raw === "true";
  } catch {
    return true;
  }
}

export function isSoundEnabled(): boolean {
  return enabled;
}

export function setSoundEnabled(next: boolean): void {
  enabled = next;
  try {
    localStorage.setItem(STORAGE_KEY, String(next));
  } catch {
    // Best-effort — a private/incognito window shouldn't crash the toggle, just not persist it.
  }
  listeners.forEach(fn => fn(enabled));
}

// Lets a UI toggle button re-render if sound gets disabled from another tab/component instance.
export function onSoundEnabledChange(fn: (enabled: boolean) => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

// One preloaded <audio> per sound so the browser only fetches each file once; playback clones it
// so overlapping plays (e.g. two quick correct answers) don't cut each other off.
const preloaded: Partial<Record<SoundName, HTMLAudioElement>> = {};

function getPreloaded(name: SoundName): HTMLAudioElement {
  let el = preloaded[name];
  if (!el) {
    el = new Audio(SOUND_FILES[name]);
    el.preload = "auto";
    preloaded[name] = el;
  }
  return el;
}

export function playSound(name: SoundName): void {
  if (!enabled) return;
  const base = getPreloaded(name);
  const instance = base.cloneNode(true) as HTMLAudioElement;
  instance.volume = SOUND_VOLUME[name];
  // Playback can be blocked (no user gesture yet, tab backgrounded) or the file itself can fail
  // to decode (a bad source file — caught tick.ogg this way once already) — never let that throw
  // into the caller's own game logic, but do warn so a silently-broken sound is discoverable
  // instead of just "nobody heard it and nobody knew why".
  instance.play().catch(err => console.warn(`[sounds] "${name}" failed to play:`, err));
}
