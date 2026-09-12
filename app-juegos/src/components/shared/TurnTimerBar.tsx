interface TurnTimerBarProps {
  timeLeft: number;
  totalSeconds: number;
}

// Same fixed pixel-art language as QuestionCard.tsx/ScoreBoard.tsx — square edges, a thick dark
// casing instead of a soft translucent pill, so it reads as a retro game HUD meter rather than a
// flat SaaS progress bar. This one gets rendered inside every game's own colored turn banner, so
// the dark casing (rather than one of the site's own brand colors) is what keeps it legible
// regardless of which color banner it's sitting in.
const INK = "#1A1A2E";

// Discrete pips, right to left, rather than one bar continuously shrinking across its whole
// length — an actual video-game health bar (Zelda hearts, a Mario power meter) drains pip by pip.
// Each pip still wipes away smoothly while it's the ACTIVE one (own width easing 0-100%, the same
// "glide between each second's tick" motion the original single bar had) rather than blinking out
// instantly — only pips already fully spent sit at a flat 0%. Fewer, chunkier segments (5, not
// something finer) reads clearly at the small size this renders at inside a game's turn banner.
const SEGMENTS = 5;

export function TurnTimerBar({ timeLeft, totalSeconds }: TurnTimerBarProps) {
  const barColor = timeLeft > totalSeconds * 0.5 ? "#22C55E"
    : timeLeft > totalSeconds * 0.25 ? "#F59E0B" : "#EF4444";
  const segmentSeconds = totalSeconds / SEGMENTS;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      <div style={{ display: "flex", gap: "3px", background: INK, border: `2px solid ${INK}`, padding: "2px" }}>
        {Array.from({ length: SEGMENTS }).map((_, i) => {
          // Drains right to left: pip i (0 = leftmost) is the i-th chunk of time to be SPENT, so
          // it only starts emptying once timeLeft drops below (SEGMENTS - i) chunks' worth — the
          // rightmost pip (i = SEGMENTS - 1) has the least time "above" it and so is the first to
          // start draining, while the leftmost pip (i = 0) has the most time above it and stays
          // fully lit until the very end.
          const secondsAboveThisPip = i * segmentSeconds;
          const fraction = Math.max(0, Math.min(1, (timeLeft - secondsAboveThisPip) / segmentSeconds));
          return (
            // A visible "empty slot" background (not just transparent casing showing through) so
            // a spent pip still reads as its own distinct box — otherwise an empty pip and the
            // gaps around it are the same color and blur into one shapeless dark smear instead of
            // a row of clean, evenly-spaced pips.
            <div key={i} style={{ width: "13px", height: "12px", position: "relative", overflow: "hidden", background: "rgba(255,255,255,0.12)" }}>
              <div style={{
                position: "absolute", left: 0, top: 0, bottom: 0,
                width: `${fraction * 100}%`, background: barColor,
                transition: "width 1s linear",
              }} />
            </div>
          );
        })}
      </div>
      <span style={{ color: "white", fontWeight: "900", fontSize: "22px", minWidth: "28px", textAlign: "right", fontVariantNumeric: "tabular-nums", textShadow: `2px 2px 0 ${INK}` }}>
        {timeLeft}
      </span>
    </div>
  );
}
