// Background music — separate from lib/sounds.ts (SFX) on purpose: its own mute toggle/volume,
// so a teacher can keep the correct/wrong dings but kill the music bed, or vice versa. Three
// looping tracks crossfade based on where the class currently is:
//  - ambient: menus, setup, results — anywhere that isn't active gameplay or a Lesson Plan.
//    Custom-made for ClassCade (the repo owner's own Suno generation), not stock — swapped in
//    after two rounds of stock-library picks ("Smile", then a 4-way audition) both missed the
//    mark on tone.
//  - gameplay: playing a game, between timed/thinking moments. Mixkit Stock Music Free License
//    (free for commercial use, no attribution required) — "Light It Up Boy".
//  - tension: a timed turn is actively running (see useTurnTimer) — swapped back to gameplay the
//    moment that timer stops, since it only ever runs while a game is already on screen. Mixkit,
//    same license — "Serene View".
// Plus true silence via stopMusic() (not a context) for the moments nothing should play at all —
// a Lesson Plan's own reading/teaching content, and a game's own final screen (cut off the moment
// that screen appears, rather than let gameplay music run under it).
//
// Per-game overrides: the shared gameplay/tension identity above doesn't fit every game (a
// whack-a-mole frenzy needs carnival energy, not the same "someone is quietly thinking" bed used
// by Hot Seat/Order Up/Auction) — see GAME_OVERRIDES. A game with its own tracks calls
// setMusicGame(gameId) on mount and setMusicGame(null) on unmount; every other game never calls
// it at all; the shared defaults below still apply to any context that game doesn't override.
const MUSIC_FILES = {
  ambient: "/music/ambient.mp3",
  gameplay: "/music/gameplay.mp3",
  tension: "/music/tension.mp3",
} as const;

export type MusicContext = keyof typeof MUSIC_FILES;

// Custom Suno tracks for one specific game's own gameplay/tension moments, in place of the shared
// defaults above. A game with no entry here (or missing one of the two contexts) just falls
// through to the shared track for that context — additive, never a replacement for the defaults.
const GAME_OVERRIDES: Partial<Record<string, Partial<Record<MusicContext, string>>>> = {
  whack: {
    gameplay: "/music/whack-gameplay.mp3",
    tension: "/music/whack-tension.mp3",
  },
  // Teacher feedback: the shared tension track read as pure meditation, and the shared gameplay
  // track felt way too hyped/party for the between-round moments — Auction wants official/classy
  // bidding-hall energy for both, not chillout or funk.
  auction: {
    gameplay: "/music/auction-gameplay.mp3",
    tension: "/music/auction-tension.mp3",
  },
  // Reused rather than new tracks — Hot Potato's frantic, comedic-explosion energy is the same
  // "silly carnival frenzy" identity Word Whack's own tracks were made for, and it barely has a
  // calm moment of its own to need a distinct gameplay track.
  hotpotato: {
    gameplay: "/music/whack-gameplay.mp3",
    tension: "/music/whack-tension.mp3",
  },
  // Reused rather than new tracks — Vault Heist's high-stakes, no-partial-credit, suspense-before-
  // a-reveal shape is the same beat Auction's tracks were made for, just heist- instead of
  // auction-themed.
  vault: {
    gameplay: "/music/auction-gameplay.mp3",
    tension: "/music/auction-tension.mp3",
  },
  // Tension-only overrides — these three games spend almost their entire active playtime in the
  // timed/tension moment (a brief resolution/breather window is all "gameplay" ever covers for
  // them), so only that one context got a custom Suno track; the shared gameplay track fills the
  // rest, same tradeoff as Hot Potato before it needed a gameplay override too.
  castle: {
    tension: "/music/castle-tension.mp3",
  },
  cards: {
    tension: "/music/cards-tension.mp3",
  },
};

function resolveSrc(ctx: MusicContext, gameId: string | null): string {
  return (gameId && GAME_OVERRIDES[gameId]?.[ctx]) || MUSIC_FILES[ctx];
}

// Kept low relative to SFX — this plays continuously under everything else, including a
// teacher's own voice, so it should always read as background, never foreground. Applies
// regardless of which actual file plays for a context (shared default or a game's own override).
const MUSIC_VOLUME: Record<MusicContext, number> = {
  ambient: 0.22,
  gameplay: 0.25,
  // Teacher feedback: this was too loud relative to the other two — it's the one context that
  // overlaps with a team actively trying to think/speak/write, so it needs to sit further back,
  // not stand out more.
  tension: 0.14,
};

const FADE_MS = 700;
const STORAGE_KEY = "classcade_music_enabled";

let enabled = readEnabledFromStorage();
let currentContext: MusicContext | null = null;
let currentGameId: string | null = null;
// The actual file path behind currentContext right now — tracked separately from currentContext
// because the same context can resolve to a different file depending on currentGameId (e.g.
// "tension" is whack-tension.mp3 while Word Whack is mounted, tension.mp3 for every other game).
let currentSrc: string | null = null;
const listeners = new Set<(enabled: boolean) => void>();

function readEnabledFromStorage(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw === null ? true : raw === "true";
  } catch {
    return true;
  }
}

export function isMusicEnabled(): boolean {
  return enabled;
}

export function onMusicEnabledChange(fn: (enabled: boolean) => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

// Keyed by resolved file path (not MusicContext): the same context can point at different files
// depending on currentGameId, so a context-keyed cache would mix up two games' tracks.
const players = new Map<string, HTMLAudioElement>();

function getPlayer(src: string): HTMLAudioElement {
  let el = players.get(src);
  if (!el) {
    el = new Audio(src);
    el.loop = true;
    el.volume = 0;
    players.set(src, el);
  }
  return el;
}

// Plain RAF-driven volume ramp — good enough for a ~0.7s crossfade between two loops, no need
// for Web Audio API gain nodes at this scale.
function fadeTo(el: HTMLAudioElement, target: number, ms: number) {
  const start = el.volume;
  const startTime = performance.now();
  function step(now: number) {
    const t = Math.min(1, (now - startTime) / ms);
    el.volume = start + (target - start) * t;
    if (t < 1) {
      requestAnimationFrame(step);
    } else if (target === 0) {
      el.pause();
    }
  }
  requestAnimationFrame(step);
}

// Browsers refuse to start audio before the page has seen a real user gesture (click/key/tap) —
// harmless for every OTHER call to this function, since by then a login click or a game-select tap
// already happened on this same page, but the very first ambient track on a page load that's
// already authenticated (session restored from storage, no click yet) hits this and gets silently
// rejected. Rather than leave that first track dead until the teacher happens to click the mute
// toggle, arm a one-time listener for the next real interaction anywhere on the page and retry
// whatever should currently be playing then.
let autoplayRetryArmed = false;

function armAutoplayRetry() {
  if (autoplayRetryArmed) return;
  autoplayRetryArmed = true;
  const retry = () => {
    autoplayRetryArmed = false;
    document.removeEventListener("pointerdown", retry);
    document.removeEventListener("keydown", retry);
    // Re-read current state rather than closing over the original src/context — the teacher may
    // have already navigated somewhere else by the time this first gesture actually happens.
    if (enabled && currentSrc) {
      const el = players.get(currentSrc);
      console.warn(`[music] gesture retry firing: src=${currentSrc} elExists=${!!el} paused=${el?.paused}`);
      if (el && el.paused) el.play().then(
        () => console.warn(`[music] gesture retry play() resolved`),
        err => console.warn(`[music] gesture retry play() rejected:`, err?.name, err?.message)
      );
    }
  };
  document.addEventListener("pointerdown", retry, { once: true });
  document.addEventListener("keydown", retry, { once: true });
}

function fadeInSrc(src: string, volume: number) {
  const el = getPlayer(src);
  el.play().catch(err => {
    console.warn(`[music] "${src}" failed to play:`, err);
    // DOMException (what play() actually rejects with) does NOT satisfy `instanceof Error` in
    // browsers — it has its own separate WebIDL prototype chain, not the ECMAScript Error one —
    // so check `.name` directly rather than gating on an Error-instance test first.
    if (err?.name === "NotAllowedError") armAutoplayRetry();
  });
  fadeTo(el, volume, FADE_MS);
}

export function setMusicEnabled(next: boolean): void {
  enabled = next;
  try {
    localStorage.setItem(STORAGE_KEY, String(next));
  } catch {
    // Best-effort — a private/incognito window shouldn't crash the toggle, just not persist it.
  }
  if (!enabled) {
    players.forEach(el => {
      if (!el.paused) fadeTo(el, 0, FADE_MS);
    });
  } else if (currentSrc && currentContext) {
    fadeInSrc(currentSrc, MUSIC_VOLUME[currentContext]);
  }
  listeners.forEach(fn => fn(enabled));
}

// Idempotent — safe to call every render/effect run without retriggering the fade. Re-resolves
// against currentGameId every time, so the same ctx can still trigger a real crossfade if the
// active game (and therefore the actual file behind that context) changed since the last call.
export function setMusicContext(ctx: MusicContext): void {
  const nextSrc = resolveSrc(ctx, currentGameId);
  if (currentContext === ctx && currentSrc === nextSrc) {
    // Same context/track by our own bookkeeping — but that bookkeeping updates the moment
    // fadeInSrc is CALLED, regardless of whether the browser actually let it play. A page load
    // that already had a session restored (no click yet) hits exactly this: the very first
    // ambient attempt gets silently blocked, currentContext/currentSrc still record "ambient" as
    // if it worked, and every later screen change (My Classes, Learn, Leaderboard, back to the
    // welcome screen — all "ambient" too) would otherwise no-op here forever, never once
    // rechecking whether the element is actually playing. Every one of those navigations is a
    // real click, so use it to notice and recover instead of trusting the stale bookkeeping.
    const el = players.get(nextSrc);
    console.warn(`[music] no-op recheck: ctx=${ctx} elExists=${!!el} paused=${el?.paused} enabled=${enabled}`);
    if (el && el.paused && enabled) el.play().then(
      () => console.warn(`[music] no-op recheck play() resolved`),
      err => console.warn(`[music] no-op recheck play() rejected:`, err?.name, err?.message)
    );
    return;
  }
  const prevSrc = currentSrc;
  currentContext = ctx;
  currentSrc = nextSrc;
  if (!enabled) return;
  if (prevSrc && prevSrc !== nextSrc) {
    const prevEl = players.get(prevSrc);
    if (prevEl) fadeTo(prevEl, 0, FADE_MS);
  }
  if (prevSrc !== nextSrc) fadeInSrc(nextSrc, MUSIC_VOLUME[ctx]);
}

// Called by a game's own component (mount → its id, unmount → null) only when that game has a
// GAME_OVERRIDES entry — every other game never calls this, since the default (no override) is
// already correct for them. Re-resolves whatever context is currently playing so an override for
// the game just entered (or the shared default for the game just left) takes effect immediately,
// without that game needing to also call setMusicContext itself.
export function setMusicGame(gameId: string | null): void {
  if (currentGameId === gameId) return;
  currentGameId = gameId;
  if (currentContext) setMusicContext(currentContext);
}

// True silence, not another context — for the moments music shouldn't be playing at all (a
// Lesson Plan's own reading/teaching content, a game's own final screen). A later setMusicContext
// call starts fresh from here rather than no-op'ing (currentContext is null, not some old value).
export function stopMusic(): void {
  if (currentContext === null) return;
  const prevSrc = currentSrc;
  currentContext = null;
  currentSrc = null;
  if (prevSrc) {
    const prevEl = players.get(prevSrc);
    if (prevEl) fadeTo(prevEl, 0, FADE_MS);
  }
}
