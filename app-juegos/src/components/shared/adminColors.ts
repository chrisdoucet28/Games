// Dark admin-dashboard palette shared by AdminScreen.tsx and its panels — deliberately its own
// module (not exported from AdminScreen.tsx) so the panels importing it don't create a circular
// import with AdminScreen.tsx (which imports the panels to render them); a cycle there caused a
// real "Cannot access 'C' before initialization" crash when this lived in AdminScreen.tsx.
// Separate from data/themes.ts, which only skins the teacher-facing shared chrome (see CLAUDE.md)
// — this screen is hidden behind is_admin and never seen by a teacher, so it keeps its own fixed
// visual identity instead of following the app theme.
export const ADMIN_COLORS = {
  bg: "#0B1425", surface: "#132039", surface2: "#1B2D4D", surface3: "#22375E",
  border: "#24365A", ink: "#E7EEFC", inkDim: "#93A5C9", inkFaint: "#5E739E",
  accent: "#0EA5E9", accentDeep: "#0369A1",
  warn: "#F59E0B", warnDeep: "#D97706",
  danger: "#EF4444", dangerBg: "#2A1620",
  success: "#22C55E", successDeep: "#15803D",
};
