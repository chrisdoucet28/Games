// Ambient decoration for each theme's hero areas — a slow-drifting icon plus a twinkling one,
// tailored per theme (Sky's clouds, Violet's moon/stars, Sunset's birds, Ocean's bubbles, Forest's
// leaves, Rose's petals). Purely decorative, pointer-events disabled throughout.
import { Icon, type IconName } from "./Icon";

type Direction = "horizontal" | "up" | "down";
type DecorConfig = { drift: IconName; driftColor: string; twinkle: IconName; twinkleColor: string; direction: Direction };

const THEME_DECOR: Record<string, DecorConfig> = {
  sky: { drift: "cloud", driftColor: "#F0F9FF", twinkle: "sparkle", twinkleColor: "#FEF9C3", direction: "horizontal" },
  violet: { drift: "moon", driftColor: "#FEF9C3", twinkle: "star", twinkleColor: "#FDE68A", direction: "horizontal" },
  sunset: { drift: "dove", driftColor: "#FFF7ED", twinkle: "sparkle", twinkleColor: "#FED7AA", direction: "horizontal" },
  ocean: { drift: "bubble", driftColor: "#E0F2FE", twinkle: "sparkle", twinkleColor: "#BAE6FD", direction: "up" },
  forest: { drift: "leaf", driftColor: "#BBF7D0", twinkle: "sparkle", twinkleColor: "#DCFCE7", direction: "down" },
  rose: { drift: "blossom", driftColor: "#FBCFE8", twinkle: "sparkle", twinkleColor: "#FCE7F3", direction: "down" },
};

// `cross` is the position along the axis perpendicular to travel — top% for horizontal movers,
// left% for vertical ones. Same slot geometry reused for every theme; only the emoji/direction
// changes, so adding a 7th theme later is a one-line config addition.
const DRIFT_SLOTS = [
  { cross: 6, size: 46, dur: 52, delay: -4, opacity: 0.5 },
  { cross: 16, size: 30, dur: 40, delay: -22, opacity: 0.35 },
  { cross: 28, size: 54, dur: 62, delay: -38, opacity: 0.4 },
  { cross: 10, size: 34, dur: 46, delay: -12, opacity: 0.3 },
  { cross: 34, size: 26, dur: 36, delay: -28, opacity: 0.45 },
];
const TWINKLE_SLOTS = [
  { left: 12, top: 14, size: 14, delay: 0 },
  { left: 82, top: 22, size: 11, delay: 0.9 },
  { left: 68, top: 8, size: 9, delay: 1.6 },
  { left: 24, top: 40, size: 10, delay: 0.4 },
];

const STYLE_TAG = (
  <style>{`
    @keyframes ambDriftX{0%{transform:translateX(-20%)}100%{transform:translateX(120%)}}
    @keyframes ambDriftUp{0%{top:110%}100%{top:-20%}}
    @keyframes ambDriftDown{0%{top:-20%;transform:rotate(-10deg)}100%{top:110%;transform:rotate(10deg)}}
    @keyframes ambTwinkle{0%,100%{opacity:0.15;transform:scale(0.85)}50%{opacity:0.9;transform:scale(1.15)}}
  `}</style>
);

export function ThemeAmbience({ themeId, variant = "full" }: { themeId: string; variant?: "full" | "compact" }) {
  const config = THEME_DECOR[themeId];
  if (!config) return null;
  const scale = variant === "compact" ? 0.45 : 1;
  const driftSlots = variant === "compact" ? DRIFT_SLOTS.slice(0, 3) : DRIFT_SLOTS;
  const twinkleSlots = variant === "compact" ? TWINKLE_SLOTS.slice(0, 2) : TWINKLE_SLOTS;

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      {STYLE_TAG}
      {driftSlots.map((d, i) => {
        const size = Math.round(d.size * scale);
        if (config.direction === "horizontal") {
          return (
            <div key={i} style={{
              position: "absolute", top: `${d.cross}%`, left: 0, opacity: d.opacity,
              animation: `ambDriftX ${d.dur}s linear infinite`, animationDelay: `${d.delay}s`,
            }}><Icon name={config.drift} size={size} color={config.driftColor} style={{ display: "block" }} /></div>
          );
        }
        const anim = config.direction === "up" ? "ambDriftUp" : "ambDriftDown";
        return (
          <div key={i} style={{
            position: "absolute", left: `${d.cross}%`, opacity: d.opacity,
            animation: `${anim} ${d.dur}s linear infinite`, animationDelay: `${d.delay}s`,
          }}><Icon name={config.drift} size={size} color={config.driftColor} style={{ display: "block" }} /></div>
        );
      })}
      {twinkleSlots.map((s, i) => (
        <div key={i} style={{
          position: "absolute", left: `${s.left}%`, top: `${s.top}%`,
          animation: `ambTwinkle ${2.4 + (i % 3) * 0.5}s ease-in-out infinite`, animationDelay: `${s.delay}s`,
        }}><Icon name={config.twinkle} size={Math.round(s.size * scale)} color={config.twinkleColor} style={{ display: "block" }} /></div>
      ))}
    </div>
  );
}
