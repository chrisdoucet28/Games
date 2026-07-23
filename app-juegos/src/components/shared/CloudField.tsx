// Decorative sky backdrop for the Sky theme's hero areas — slow-drifting clouds with a couple of
// sparkle accents for a bit of game-show glitz. Purely ambient, pointer-events disabled throughout.
const CLOUDS = [
  { top: 6, size: 46, dur: 52, delay: -4, opacity: 0.5 },
  { top: 16, size: 30, dur: 40, delay: -22, opacity: 0.35 },
  { top: 28, size: 54, dur: 62, delay: -38, opacity: 0.4 },
  { top: 10, size: 34, dur: 46, delay: -12, opacity: 0.3 },
  { top: 34, size: 26, dur: 36, delay: -28, opacity: 0.45 },
];
const SPARKLES = [
  { left: 12, top: 14, size: 14, delay: 0 },
  { left: 82, top: 22, size: 11, delay: 0.9 },
  { left: 68, top: 8, size: 9, delay: 1.6 },
  { left: 24, top: 40, size: 10, delay: 0.4 },
];

export function CloudField() {
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      <style>{`
        @keyframes cloudDrift{0%{transform:translateX(-20%)}100%{transform:translateX(120%)}}
        @keyframes cloudTwinkle{0%,100%{opacity:0.15;transform:scale(0.85)}50%{opacity:0.9;transform:scale(1.15)}}
      `}</style>
      {CLOUDS.map((c, i) => (
        <div key={i} style={{
          position: "absolute", top: `${c.top}%`, left: 0, fontSize: `${c.size}px`, opacity: c.opacity,
          filter: "blur(0.3px)", animation: `cloudDrift ${c.dur}s linear infinite`, animationDelay: `${c.delay}s`,
        }}>☁️</div>
      ))}
      {SPARKLES.map((s, i) => (
        <div key={i} style={{
          position: "absolute", left: `${s.left}%`, top: `${s.top}%`, fontSize: `${s.size}px`,
          animation: `cloudTwinkle ${2.4 + (i % 3) * 0.5}s ease-in-out infinite`, animationDelay: `${s.delay}s`,
        }}>✨</div>
      ))}
    </div>
  );
}
