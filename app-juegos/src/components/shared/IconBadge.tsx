import { Icon, type IconName } from "./Icon";

// The "hero-sized" companion to Icon.tsx's flat inline glyphs — a rounded arcade badge (thick navy
// outline, drop-shadow "button" edge, a corner pixel-dot signature) wrapping the same glyph paths
// Phase 1 already built. Reserved for large showcase contexts (game-select cards, the homepage's
// game grid, How-to-Play headers) where the badge chrome actually reads at scale; small inline
// contexts (PPP diagram chips, the welcome-screen teaser grid) still use a plain <Icon/>.
type Props = { icon: IconName; color: string; size?: number };

export function IconBadge({ icon, color, size = 64 }: Props) {
  const border = Math.max(2, Math.round(size * 0.06));
  const radius = Math.round(size * 0.24);
  const dot = Math.max(4, Math.round(size * 0.09));
  return (
    <div
      style={{
        position: "relative", width: size, height: size, background: color,
        borderRadius: radius, border: `${border}px solid #0C1E3D`,
        boxShadow: `0 ${border}px 0 #0C1E3D`,
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}
    >
      <Icon name={icon} size={Math.round(size * 0.55)} color="white" />
      <div style={{ position: "absolute", bottom: Math.round(size * 0.08), right: Math.round(size * 0.08), width: dot, height: dot, background: "#FCD34D", borderRadius: "2px" }} />
    </div>
  );
}
