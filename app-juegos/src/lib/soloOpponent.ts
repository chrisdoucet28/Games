import type { Team, TeamColor } from "../types";

// Deliberately NOT drawn from TEAM_COLORS (src/data/constants.ts) — that palette is reserved
// for teams a human actually picked; the CPU needs to look unmistakably non-pickable.
export const SOLO_CPU_COLOR: TeamColor = {
  name: "CPU", bg: "#6B7280", light: "#F3F4F6", dark: "#1F2937", emoji: "🤖",
};

export const SOLO_CPU_ID = "cpu" as const;

// Builds a fresh synthetic opponent for solo (1-team) play. It's a real alternating-turn
// participant in whichever game uses it — never a passive prop. Callers must never pass this
// team's id to the onUpdateScore prop from the parent — use a local updateScore wrapper instead.
export function makeSoloCpuTeam(): Team {
  return { id: SOLO_CPU_ID, name: "CPU", color: SOLO_CPU_COLOR, mascot: "🤖", score: 0 };
}

export function isSoloCpu(teamId: string | number): boolean {
  return teamId === SOLO_CPU_ID;
}

// Live-human counterpart used only by Spy Among Us, where the second participant needs to
// actually peek/speak/guess through the UI — a bot can't do that in a live spoken game.
export const TEACHER_COLOR: TeamColor = {
  name: "Teacher", bg: "#0EA5E9", light: "#E0F2FE", dark: "#0C4A6E", emoji: "🧑‍🏫",
};

export const TEACHER_ID = "teacher" as const;

export function makeTeacherTeam(): Team {
  return { id: TEACHER_ID, name: "Teacher", color: TEACHER_COLOR, mascot: "🧑‍🏫", score: 0 };
}
