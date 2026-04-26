
interface TurnTimerBarProps {
  timeLeft: number;
  totalSeconds: number;
}

export function TurnTimerBar({ timeLeft, totalSeconds }: TurnTimerBarProps) {
  const pct = (timeLeft / totalSeconds) * 100;
  const barColor = timeLeft > totalSeconds * 0.5 ? "#22C55E"
    : timeLeft > totalSeconds * 0.25 ? "#F59E0B" : "#EF4444";

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      <div style={{ width: "80px", height: "8px", background: "rgba(255,255,255,0.25)", borderRadius: "4px", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: barColor, borderRadius: "4px", transition: "width 1s linear" }} />
      </div>
      <span style={{ color: "white", fontWeight: "900", fontSize: "22px", minWidth: "28px", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
        {timeLeft}
      </span>
    </div>
  );
}