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
// remaining Tier 2 entries (auction/cards/castle/rocket/vault/whack/tick) are still the original
// kenney.nl CC0 picks. A full Web Audio API loudness pass (RMS/peak per file) later found
// battleship/hotseat/minefield mixed considerably hotter than the rest of the set too — see the
// volume comments below. orderup/zombie/spy/racetrack were also replaced with fresh mixkit.co
// picks after teacher feedback flagged the originals as clipped/distorted (orderup.ogg), too short
// to register (spy.ogg/zombie.ogg), or an outright broken sustained-drone loop (racetrack.ogg) —
// see the per-sound comments below and each game's own call-site comments for how they're now
// sequenced.
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
  orderup: "/sounds/orderup.mp3",
  rocket: "/sounds/rocket.ogg",
  // A quick, low-key engine rev — not a full "vroom" — for Race Track's "Start Race!" and
  // finish-line (triggerWin) moments. Deliberately left off "Next Task →" since that fires on
  // every single task, far too often for even a short cue not to get grating. Kept modest (see
  // SOUND_VOLUME below) per teacher feedback: it should read as a nice touch, not a jump scare,
  // after the original racetrack.ogg (a broken sustained drone) was pulled entirely.
  racetrack: "/sounds/racetrack.mp3",
  spy: "/sounds/spy.mp3",
  vault: "/sounds/vault.ogg",
  whack: "/sounds/whack.ogg",
  zombie: "/sounds/zombie.mp3",
} as const;

export type SoundName = keyof typeof SOUND_FILES;

// Ticks fire once a second near the end of every timed turn across ~11 games — quieter so it
// reads as a subtle cue, not a metronome competing with the teacher's voice. Tier 2 sounds default
// to 0.7 (a touch under Tier 1's 0.8) since they layer on top of a Tier 1 sound at the same
// moment more often than not, and shouldn't fight it for attention.
const DEFAULT_TIER2_VOLUME = 0.7;
const SOUND_VOLUME: Record<SoundName, number> = {
  correct: 0.55,
  // Was 0.8 — the exact level teacher feedback flagged as "too loud/harsh" for timesUp below,
  // and wrong fires far more often (every incorrect answer, nearly every game) than timesUp
  // (once per turn, at expiry only). Same fix applied here for consistency, pending confirmation.
  wrong: 0.6,
  tick: 0.35,
  // Was 0.8, then 0.45 — teacher feedback flagged the buzzer as too loud a second time (this time
  // specifically via Word Whack), so dropped again to match tick's already-settled level.
  timesUp: 0.35,
  win: 0.55,
  roundComplete: 0.6,
  // Was 0.75 — louder than every Tier 2 signature sound (0.7) despite being a minor, frequent
  // transitional effect (turn-order/attack rolls), not a "big moment." Matched to the Tier 2
  // default instead.
  dice: 0.7,
  auction: DEFAULT_TIER2_VOLUME,
  // Web Audio API loudness pass: measured RMS well above the rest of the Tier 2 roster (close to
  // "wrong"'s own hot mix). Brought down to land near the same effective loudness as a normally-
  // mixed signature sound like "whack" or "hillClash".
  battleship: 0.5,
  cards: DEFAULT_TIER2_VOLUME,
  castle: DEFAULT_TIER2_VOLUME,
  hotpotato: DEFAULT_TIER2_VOLUME,
  // Web Audio API loudness pass: by far the hottest file in the entire roster — nearly double
  // "wrong"'s own RMS, and "wrong" was already the loudest Tier 1 sound. Cut hard to land in the
  // same range as everything else instead of dominating over it.
  hotseat: 0.3,
  // Teacher feedback: King of the Hill's capture fanfare read as way louder than every other
  // moment in the game and dragged on for far too long for a routine, frequent event — measured
  // RMS on this source file is on par with "wrong" (the hottest Tier 1 sound), so the default
  // Tier 2 volume hits it much harder than a normally-mixed signature sound. Paired with the
  // playback cap in SOUND_MAX_MS below.
  hill: 0.4,
  hillClash: DEFAULT_TIER2_VOLUME,
  // Web Audio API loudness pass: measured RMS well above the rest of the roster, on the same
  // order as "wrong". Brought down to match.
  minefield: 0.4,
  // Replaced the clipped/distorted source file with a clean mixkit "positive notification" — no
  // distortion to compensate for anymore. Web Audio API pass shows this file is mixed noticeably
  // quieter overall than the rest of the roster (RMS ~0.07 vs. ~0.14 for a typical Tier 2 sound
  // like whack/hillClash), so it's pushed above the Tier 2 default rather than below it to actually
  // register.
  orderup: 0.85,
  rocket: DEFAULT_TIER2_VOLUME,
  // Kept deliberately quiet — teacher feedback explicitly warned against this landing like a jump
  // scare (see RaceTrackGame.tsx's "Start Race!" button and triggerWin).
  racetrack: 0.45,
  // Replaced the near-inaudible 27ms original with a full "ominous drums" sting, meant to land
  // over the quiet reveal bed (see SpyAmongUsGame.tsx's music-context effect). Web Audio API pass
  // shows this file mixed quieter than a typical Tier 2 sound, so nudged above the Tier 2 default
  // — it still doesn't need to fight a louder gameplay track since the bed underneath is quiet.
  spy: 0.75,
  vault: DEFAULT_TIER2_VOLUME,
  whack: DEFAULT_TIER2_VOLUME,
  // Replaced the near-inaudible 114ms original with a real "warfare horn" — it now plays into
  // silence (see ZombieSiegeGame.tsx's music-context effect), so it doesn't need to compete with a
  // bed underneath. Web Audio API pass shows it's mixed in line with a typical Tier 2 sound, so
  // left at the default.
  zombie: DEFAULT_TIER2_VOLUME,
};

// Most one-shot SFX are short enough that letting the file simply finish is fine. A couple of the
// Tier 2 source files run much longer than the single "moment" they're meant to mark (hill.mp3 is
// a genuine 10 seconds for what should be a quick capture sting) — capped here rather than needing
// a re-exported/re-trimmed audio file. Only add an entry when a sound is specifically flagged as
// dragging on too long; most sounds should finish naturally.
const SOUND_MAX_MS: Partial<Record<SoundName, number>> = {
  hill: 3000,
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

// Short fade-out (rather than an abrupt cut) when a capped sound hits its max duration — an
// instant pause mid-note reads as a glitch, same reasoning as lib/music.ts's own fadeTo.
const CUTOFF_FADE_MS = 200;

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

  const maxMs = SOUND_MAX_MS[name];
  if (maxMs === undefined) return;
  setTimeout(() => {
    if (instance.paused) return; // already finished naturally before the cap kicked in
    const startVol = instance.volume;
    const startTime = performance.now();
    function step(now: number) {
      const t = Math.min(1, Math.max(0, (now - startTime) / CUTOFF_FADE_MS));
      instance.volume = Math.max(0, startVol * (1 - t));
      if (t < 1) requestAnimationFrame(step);
      else instance.pause();
    }
    requestAnimationFrame(step);
  }, maxMs);
}
