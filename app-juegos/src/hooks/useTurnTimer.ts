import { useState, useEffect, useRef, useCallback } from "react";

export function useTurnTimer(seconds: number, active: boolean, onExpire: () => void, resetKey: any = 0) {
  const [timeLeft, setTimeLeft] = useState(seconds);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onExpireRef = useRef(onExpire);

  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

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
      remaining -= 1;
      if (remaining <= 0) {
        if (timerRef.current) clearInterval(timerRef.current);
        // Call onExpire as a plain statement here, not from inside the setTimeLeft updater above —
        // React can invoke updater functions during its own render pass, and onExpire often triggers
        // state updates on ancestor components (e.g. onUpdateScore), which then throws "Cannot update
        // a component while rendering a different component."
        setTimeLeft(seconds);
        onExpireRef.current?.();
      } else {
        setTimeLeft(remaining);
      }
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [active, seconds, resetKey]);

  return { timeLeft, reset, stop };
}