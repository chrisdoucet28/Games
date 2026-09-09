import { useState, useEffect, useRef, useCallback } from "react";
import { playSound } from "../lib/sounds";

// Last few seconds of any timed turn get an audible tick — 3 seconds gives players enough warning
// without turning every short turn (some are only 15-20s total) into mostly-tick.
const TICK_STARTS_AT = 3;

// `paused` freezes the countdown in place (no tick, no reset) without tearing down the interval —
// for turns that span several questions in a row (e.g. Rocket Fuel's "prompt after prompt" turn,
// Race Track's solo per-task countdown) where revealing one answer shouldn't burn into the time
// budget for the rest of the turn, but shouldn't hand back a full fresh `seconds` either. Toggling
// `active` instead would do the latter, since the setup effect below always restarts at `seconds`.
export function useTurnTimer(seconds: number, active: boolean, onExpire: () => void, resetKey: any = 0, paused: boolean = false) {
  const [timeLeft, setTimeLeft] = useState(seconds);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onExpireRef = useRef(onExpire);
  const pausedRef = useRef(paused);

  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

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
    let remaining = seconds;
    timerRef.current = setInterval(() => {
      if (pausedRef.current) return;
      remaining -= 1;
      if (remaining <= 0) {
        if (timerRef.current) clearInterval(timerRef.current);
        playSound("timesUp");
        // Call onExpire as a plain statement here, not from inside the setTimeLeft updater above —
        // React can invoke updater functions during its own render pass, and onExpire often triggers
        // state updates on ancestor components (e.g. onUpdateScore), which then throws "Cannot update
        // a component while rendering a different component."
        setTimeLeft(seconds);
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

  return { timeLeft, reset, stop };
}