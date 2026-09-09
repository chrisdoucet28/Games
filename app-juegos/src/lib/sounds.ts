// Game sound effects. Two tiers:
//  - Tier 1 (correct/wrong/tick/timesUp/win): shared feedback routed through the chokepoints
//    that already exist for these events (updateScore, useTurnTimer, the confetti trigger)
//    rather than being called from each of the 15 games individually.
//  - Tier 2 (one entry per game id, matching GAME_MODES, plus hillClash): a signature sound per
//    game, layered on top of the Tier 1 ones at that game's own defining moment — see the comment
//    at each game's call site for exactly which moment and why.
//
// correct/wrong/timesUp/win/hill/hillClash/hotpotato are sourced from mixkit.co's "Game Show" SFX
// category (Mixkit Sound Effects Free License — free for commercial use, no attribution required)
// — a deliberate move away from the original kenney.nl arcade/sci-fi set after teacher feedback
// that those read as "arcadey" rather than the Kahoot-style quiz-show tone this app wants. The
// remaining Tier 2 entries (auction/battleship/cards/castle/hotseat/minefield/orderup/racetrack/
// rocket/spy/vault/whack/zombie/tick) are still the original kenney.nl CC0 picks — not yet
// revisited, since only correct/wrong/win/hill/hotpotato were flagged.
const SOUND_FILES = {
  correct: "/sounds/correct.mp3",
  wrong: "/sounds/wrong.mp3",
  tick: "/sounds/tick.ogg",
  timesUp: "/sounds/times-up.mp3",
  win: "/sounds/win.mp3",
  // A shorter, distinct sting for each GAME's own final screen — deliberately not "win" a second
  // time. Both used to play the trumpet fanfare (that screen, then the shared results screen
  // moments later), and if a teacher clicked through quickly the two fanfares audibly overlapped.
  roundComplete: "/sounds/roundcomplete.mp3",
  // A physical dice-roll clatter (kenney.nl Casino Audio, CC0) — plays once at the start of the
  // roll animation in every game that has one (Vault Heist and Spy Among Us's turn-order rolls,
  // King of the Hill's turn-order roll, Castle/Race Track's attack rolls).
  dice: "/sounds/dice.ogg",
  // Tier 2 — one per game, keyed by GAME_MODES id.
  auction: "/sounds/auction.ogg",
  battleship: "/sounds/battleship.ogg",
  cards: "/sounds/cardshuffle.ogg",
  castle: "/sounds/castle.ogg",
  hotpotato: "/sounds/hotpotato.mp3",
  hotseat: "/sounds/hotseat.ogg",
  hill: "/sounds/hill.mp3",
  // A contested zone (attacking a team that already owns it) — the clash of a duel actually
  // starting, distinct from the hill's own capture/victory cue above.
  hillClash: "/sounds/hillclash.mp3",
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
  roundComplete: 0.6,
  dice: 0.75,
  auction: DEFAULT_TIER2_VOLUME,
  battleship: DEFAULT_TIER2_VOLUME,
  cards: DEFAULT_TIER2_VOLUME,
  castle: DEFAULT_TIER2_VOLUME,
  hotpotato: DEFAULT_TIER2_VOLUME,
  hotseat: DEFAULT_TIER2_VOLUME,
  hill: DEFAULT_TIER2_VOLUME,
  hillClash: DEFAULT_TIER2_VOLUME,
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
