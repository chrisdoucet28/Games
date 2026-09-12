
interface TurnTimerBarProps {
  timeLeft: number;
  totalSeconds: number;
}

// Same fixed pixel-art language as QuestionCard.tsx/ScoreBoard.tsx — square edges, a thick dark
// casing instead of a soft translucent pill, so it reads as a retro game HUD meter (a Zelda/Mario
// style health bar) rather than a flat SaaS progress bar. This one gets rendered inside every
// game's own colored turn banner, so the dark casing (rather than one of the site's own brand
// colors) is what keeps it legible regardless of which color banner it's sitting in.
const INK = "#1A1A2E";

export function TurnTimerBar({ timeLeft, totalSeconds }: TurnTimerBarProps) {
  const pct = (timeLeft / totalSeconds) * 100;
  const barColor = timeLeft > totalSeconds * 0.5 ? "#22C55E"
    : timeLeft > totalSeconds * 0.25 ? "#F59E0B" : "#EF4444";

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      <div style={{ width: "84px", height: "14px", background: INK, border: `2px solid ${INK}`, padding: "2px", boxSizing: "border-box" }}>
        <div style={{ position: "relative", height: "100%", width: `${pct}%`, background: barColor, transition: "width 1s linear" }}>
          {/* Segment ticks — a few hard dividers over the fill instead of one smooth gradient, so
              it reads as a notched meter (5 discrete blocks) rather than a continuous bar. */}
          <div style={{
            position: "absolute", inset: 0,
            backgroundImage: `repeating-linear-gradient(90deg, transparent 0, transparent calc(20% - 2px), ${INK} calc(20% - 2px), ${INK} 20%)`,
          }} />
        </div>
      </div>
      <span style={{ color: "white", fontWeight: "900", fontSize: "22px", minWidth: "28px", textAlign: "right", fontVariantNumeric: "tabular-nums", textShadow: `2px 2px 0 ${INK}` }}>
        {timeLeft}
      </span>
    </div>
  );
}