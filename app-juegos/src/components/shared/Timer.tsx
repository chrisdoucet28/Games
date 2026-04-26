import { useState, useEffect } from "react";

interface TimerProps {
  seconds: number;
  onEnd?: () => void;
  running: boolean;
}

export function Timer({ seconds, onEnd, running }: TimerProps) {
  const [left, setLeft] = useState(seconds);

  useEffect(() => { 
    setLeft(seconds); 
  }, [seconds]);

  useEffect(() => {
    if (!running) return;
    if (left <= 0) {
      onEnd?.();
      return;
    }
    const t = setTimeout(() => setLeft(l => l - 1), 1000);
    return () => clearTimeout(t);
  }, [left, running, onEnd]);

  const pct = (left / seconds) * 100;
  const color = left > 10 ? "#22C55E" : left > 5 ? "#EAB308" : "#EF4444";

  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: "48px", fontWeight: "900", color, fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>
        {left}
      </div>
      <div style={{ height: "8px", background: "#E5E7EB", borderRadius: "4px", margin: "8px 0", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: color, transition: "width 1s linear", borderRadius: "4px" }} />
      </div>
    </div>
  );
}