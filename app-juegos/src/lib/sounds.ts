// Tier-1 game sound effects — all sourced from kenney.nl's CC0 "Interface Sounds" and "Digital
// Audio" packs (public domain, no attribution required). Every sound routes through the single
// shared chokepoints that already exist for these events (updateScore, useTurnTimer, the
// confetti trigger) rather than being called from each of the 15 games individually — see the
// comments at each call site.

const SOUND_FILES = {
  correct: "/sounds/correct.ogg",
  wrong: "/sounds/wrong.ogg",
  tick: "/sounds/tick.ogg",
  timesUp: "/sounds/times-up.ogg",
  win: "/sounds/win.ogg",
} as const;

export type SoundName = keyof typeof SOUND_FILES;

// Ticks fire once a second near the end of every timed turn across ~11 games — quieter so it
// reads as a subtle cue, not a metronome competing with the teacher's voice.
const SOUND_VOLUME: Record<SoundName, number> = {
  correct: 0.8,
  wrong: 0.8,
  tick: 0.35,
  timesUp: 0.8,
  win: 0.8,
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
  // Playback can be blocked (no user gesture yet, tab backgrounded) — never let that throw into
  // the caller's own game logic.
  instance.play().catch(() => {});
}
