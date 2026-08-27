import { Icon, type IconName } from "./Icon";

// A team's saved mascot is a raw emoji string (or null), persisted directly in Supabase's
// classes.teams / classes.team_roster jsonb columns — this maps each of the 22 MASCOT_OPTIONS
// values to a custom icon at render time, without touching a single stored row. Anything not
// in this map (there shouldn't be any, but a teacher's already-saved data is never something to
// trust blindly) falls through to the plain color-dot fallback below, exactly like a team that
// never picked a mascot at all — never a blank/broken render.
export const MASCOT_ICON_BY_EMOJI: Record<string, IconName> = {
  "🐉": "dragon", "🦄": "unicorn", "🤖": "robot", "🦊": "fox", "🐸": "frog",
  "🦁": "lion", "🐧": "penguin", "🦖": "dino", "🐝": "bee", "🦋": "butterfly",
  "🐙": "octopus", "🦅": "eagle", "🐢": "turtle", "🐺": "wolf", "🦉": "owl",
  "🐯": "tiger", "🍕": "pizza", "⚡": "bolt", "🌟": "star", "🎃": "pumpkin",
  "👻": "ghost", "🥷": "ninja",
};

type TeamLike = { mascot?: string | null; color: { bg: string } };

// A team with no mascot picked falls back to a plain colored dot (matching its own team color)
// rather than an arbitrary icon — same "simple colored circle renders identically everywhere,
// not worth a custom glyph" call already made for the 🔴/🟢/🔵 status dots in Phase 1.
type Props = { team: TeamLike | null | undefined; size?: number; color?: string };

// `color` overrides the default (the team's own color) — needed on the rare card/header whose
// background is already that same team color, where an icon/dot in that color would be invisible.
export function TeamIcon({ team, size = 16, color }: Props) {
  // Several call sites resolve `team` from a roster lookup that can miss (a disconnected phone,
  // a stale id) — the pre-existing `team?.mascot ?? team?.color.emoji` pattern this replaces
  // rendered nothing in that case, so this preserves the exact same graceful no-op.
  if (!team) return null;
  const resolvedColor = color ?? team.color.bg;
  const iconName = team.mascot ? MASCOT_ICON_BY_EMOJI[team.mascot] : undefined;
  if (iconName) return <Icon name={iconName} size={size} color={resolvedColor} />;
  return (
    <span
      style={{
        display: "inline-block", width: Math.round(size * 0.62), height: Math.round(size * 0.62),
        borderRadius: "50%", background: resolvedColor, verticalAlign: "middle", flexShrink: 0,
      }}
    />
  );
}

// The in-game-sprite sibling of TeamIcon — some games render a team's mascot as an actual game
// piece (Word Whack's mole, Battleship's missile, Vault Heist's active-turn portrait, a Zombie
// Siege defender, a Race Track car, ...), each with its own genre-appropriate placeholder
// (a beaver, a rocket, a generic person) for a team that hasn't picked a mascot — that
// placeholder is intentionally NOT the team-color dot TeamIcon falls back to, so it stays a
// distinct component rather than a variant of TeamIcon.
export function MascotSprite({ mascot, fallback, size = 24, color }: { mascot?: string | null; fallback: React.ReactNode; size?: number; color?: string }) {
  const iconName = mascot ? MASCOT_ICON_BY_EMOJI[mascot] : undefined;
  if (iconName) return <Icon name={iconName} size={size} color={color} />;
  return <>{fallback}</>;
}
