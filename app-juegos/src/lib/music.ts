// Background music — separate from lib/sounds.ts (SFX) on purpose: its own mute toggle/volume,
// so a teacher can keep the correct/wrong dings but kill the music bed, or vice versa. Three
// looping tracks crossfade based on where the class currently is:
//  - ambient: menus, setup, results — anywhere that isn't active gameplay or a Lesson Plan.
//    Custom-made for ClassCade (the repo owner's own Suno generation), not stock — swapped in
//    after two rounds of stock-library picks ("Smile", then a 4-way audition) both missed the
//    mark on tone.
//  - gameplay: playing a game, between timed/thinking moments. Mixkit Stock Music Free License
//    (free for commercial use, no attribution required) — "Light It Up Boy".
//  - tension: Mixkit, same license — "Serene View".
//  - tension: a timed turn is actively running (see useTurnTimer) — swapped back to gameplay the
//    moment that timer stops, since it only ever runs while a game is already on screen.
// Plus true silence via stopMusic() (not a context) for the moments nothing should play at all —
// a Lesson Plan's own reading/teaching content, and a game's own final screen (cut off the moment
// that screen appears, rather than let gameplay music run under it).
const MUSIC_FILES = {
  ambient: "/music/ambient.mp3",
  gameplay: "/music/gameplay.mp3",
  tension: "/music/tension.mp3",
} as const;

export type MusicContext = keyof typeof MUSIC_FILES;

// Kept low relative to SFX — this plays continuously under everything else, including a
// teacher's own voice, so it should always read as background, never foreground.
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

const players: Partial<Record<MusicContext, HTMLAudioElement>> = {};

function getPlayer(ctx: MusicContext): HTMLAudioElement {
  let el = players[ctx];
  if (!el) {
    el = new Audio(MUSIC_FILES[ctx]);
    el.loop = true;
    el.volume = 0;
    players[ctx] = el;
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

function fadeIn(ctx: MusicContext) {
  const el = getPlayer(ctx);
  el.play().catch(err => console.warn(`[music] "${ctx}" failed to play:`, err));
  fadeTo(el, MUSIC_VOLUME[ctx], FADE_MS);
}

export function setMusicEnabled(next: boolean): void {
  enabled = next;
  try {
    localStorage.setItem(STORAGE_KEY, String(next));
  } catch {
    // Best-effort — a private/incognito window shouldn't crash the toggle, just not persist it.
  }
  if (!enabled) {
    (Object.keys(players) as MusicContext[]).forEach(ctx => {
      const el = players[ctx];
      if (el && !el.paused) fadeTo(el, 0, FADE_MS);
    });
  } else if (currentContext) {
    fadeIn(currentContext);
  }
  listeners.forEach(fn => fn(enabled));
}

// Idempotent — safe to call every render/effect run without retriggering the fade.
export function setMusicContext(ctx: MusicContext): void {
  if (currentContext === ctx) return;
  const prev = currentContext;
  currentContext = ctx;
  if (!enabled) return;
  if (prev) {
    const prevEl = players[prev];
    if (prevEl) fadeTo(prevEl, 0, FADE_MS);
  }
  fadeIn(ctx);
}

// True silence, not another context — for the moments music shouldn't be playing at all (a
// Lesson Plan's own reading/teaching content, a game's own final screen). A later setMusicContext
// call starts fresh from here rather than no-op'ing (currentContext is null, not some old value).
export function stopMusic(): void {
  if (currentContext === null) return;
  const prev = currentContext;
  currentContext = null;
  const prevEl = players[prev];
  if (prevEl) fadeTo(prevEl, 0, FADE_MS);
}
