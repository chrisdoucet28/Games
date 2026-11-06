import { useState, useEffect, useRef, useCallback } from "react";
import { playSound } from "../lib/sounds";
import { setMusicContext } from "../lib/music";

// Last few seconds of any timed turn get an audible tick — 5 seconds gives players enough warning
// without turning every short turn (some are only 15-20s total) into mostly-tick.
const TICK_STARTS_AT = 5;

// `paused` freezes the countdown in place (no tick, no reset) without tearing down the interval —
// for turns that span several questions in a row (e.g. Rocket Fuel's "prompt after prompt" turn,
// Race Track's solo per-task countdown) where revealing one answer shouldn't burn into the time
// budget for the rest of the turn, but shouldn't hand back a full fresh `seconds` either. Toggling
// `active` instead would do the latter, since the setup effect below always restarts at `seconds`.
//
// `manageMusic` defaults to true for every existing caller — set it false on a SECOND instance of
// this hook running alongside a first one in the same screen (e.g. Rocket Fuel's short "reading
// grace" sub-timer next to its main turn clock), since each instance's own tension/gameplay effect
// below would otherwise fight the other's every time either one's `active` flips.
export function useTurnTimer(
  seconds: number, active: boolean, onExpire: () => void, resetKey: any = 0, paused: boolean = false,
  manageMusic: boolean = true,
) {
  const [timeLeft, setTimeLeft] = useState(seconds);
  // The interval callback's own running total — timeLeft (React state) just mirrors it for
  // render. addTime below has to bump THIS, not just timeLeft, or the next tick overwrites
  // whatever addTime set with this stale closure value.
  const remainingRef = useRef(seconds);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onExpireRef = useRef(onExpire);
  const pausedRef = useRef(paused);

  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  // The tension music bed while this timer is actually counting down — reverts to "gameplay"
  // (never "ambient") on stop/cleanup, safe because this hook only ever runs while a game screen
  // is already showing. Skipped entirely when manageMusic is false — see its own comment above.
  useEffect(() => {
    if (!manageMusic) return;
    if (active) setMusicContext("tension");
    return () => setMusicContext("gameplay");
  }, [active, manageMusic]);

  const stop = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const reset = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeLeft(seconds);
  }, [seconds]);

  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (!active) {
      return;
    }
    setTimeLeft(seconds);
    remainingRef.current = seconds;
    timerRef.current = setInterval(() => {
      if (pausedRef.current) return;
      remainingRef.current -= 1;
      const remaining = remainingRef.current;
      if (remaining <= 0) {
        if (timerRef.current) clearInterval(timerRef.current);
        playSound("timesUp");
        // Call onExpire as a plain statement here, not from inside the setTimeLeft updater above —
        // React can invoke updater functions during its own render pass, and onExpire often triggers
        // state updates on ancestor components (e.g. onUpdateScore), which then throws "Cannot update
        // a component while rendering a different component."
        setTimeLeft(seconds);
        remainingRef.current = seconds;
        onExpireRef.current?.();
      } else {
        if (remaining <= TICK_STARTS_AT) playSound("tick");
        setTimeLeft(remaining);
      }
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [active, seconds, resetKey]);

  // Bumps the clock mid-countdown (e.g. a "time bonus" reward) without resetting or pausing it —
  // just adds delta seconds onto whatever's left right now. Negative deltas work the same way.
  const addTime = useCallback((delta: number) => {
    remainingRef.current += delta;
    setTimeLeft(remainingRef.current);
  }, []);

  return { timeLeft, reset, stop, addTime };
}