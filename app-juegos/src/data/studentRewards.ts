import type { IconName } from "../components/shared/Icon";

// Everything about how a student's progress turns into XP, a level, a streak and badges lives here
// as pure functions over a small stats object — nothing about badges or levels is stored in the
// database (only the raw lessons done and practice rounds are), so tuning any number below, or
// adding a badge, takes effect for every student's existing history immediately, no migration.

export type StudentStats = {
  lessonsDone: number;
  rounds: number;
  correctAnswers: number;
  perfectRounds: number;
  streakDays: number;
};

export const XP_PER_LESSON = 20;
export const XP_PER_CORRECT_ANSWER = 2;
export const XP_PER_PERFECT_ROUND = 10;
// A "perfect round" needs at least this many questions, so a 1-question lucky guess doesn't count.
export const PERFECT_ROUND_MIN_QUESTIONS = 10;

export function isPerfectRound(correct: number, total: number): boolean {
  return total >= PERFECT_ROUND_MIN_QUESTIONS && correct === total;
}

// XP a single practice round is worth on its own — shown right after a round on the summary.
export function xpForRound(correct: number, total: number): number {
  return correct * XP_PER_CORRECT_ANSWER + (isPerfectRound(correct, total) ? XP_PER_PERFECT_ROUND : 0);
}

export function xpFromStats(s: StudentStats): number {
  return s.lessonsDone * XP_PER_LESSON + s.correctAnswers * XP_PER_CORRECT_ANSWER + s.perfectRounds * XP_PER_PERFECT_ROUND;
}

// Level n starts at 50·n·(n−1) XP: level 2 at 100, 3 at 300, 4 at 600, 5 at 1000 — each level asks
// for a little more than the last.
export function levelStartXp(level: number): number {
  return 50 * level * (level - 1);
}

export type LevelInfo = { level: number; xp: number; levelStart: number; nextLevelAt: number; progress: number };

export function levelInfo(xp: number): LevelInfo {
  let level = 1;
  while (levelStartXp(level + 1) <= xp) level += 1;
  const levelStart = levelStartXp(level);
  const nextLevelAt = levelStartXp(level + 1);
  return { level, xp, levelStart, nextLevelAt, progress: (xp - levelStart) / (nextLevelAt - levelStart) };
}

function localDayKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// Consecutive days (in the student's own timezone) with any activity, counting back from today — or
// from yesterday if they haven't done anything yet today, so a streak isn't lost just because it's
// morning.
export function streakFromDates(isoDates: string[], now: Date = new Date()): number {
  const days = new Set(isoDates.map(iso => localDayKey(new Date(iso))));
  const cursor = new Date(now);
  if (!days.has(localDayKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while (days.has(localDayKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export type BadgeDef = { id: string; name: string; description: string; icon: IconName; earned: (s: StudentStats, level: number) => boolean };

export const BADGES: BadgeDef[] = [
  { id: "first_steps", name: "First Steps", description: "Finish your first lesson", icon: "bookOpen", earned: s => s.lessonsDone >= 1 },
  { id: "bookworm", name: "Bookworm", description: "Finish 10 lessons", icon: "books", earned: s => s.lessonsDone >= 10 },
  { id: "scholar", name: "Scholar", description: "Finish 25 lessons", icon: "school", earned: s => s.lessonsDone >= 25 },
  { id: "first_round", name: "Warm-Up", description: "Complete a practice round", icon: "target", earned: s => s.rounds >= 1 },
  { id: "sharpshooter", name: "Sharpshooter", description: "Get every answer right in a round of 10 or more", icon: "bolt", earned: s => s.perfectRounds >= 1 },
  { id: "century", name: "Century", description: "Answer 100 practice questions correctly", icon: "medal", earned: s => s.correctAnswers >= 100 },
  { id: "on_a_roll", name: "On a Roll", description: "Learn or practice 3 days in a row", icon: "flame", earned: s => s.streakDays >= 3 },
  { id: "level_5", name: "Level 5", description: "Reach level 5", icon: "crown", earned: (_s, level) => level >= 5 },
];

export function earnedBadgeIds(s: StudentStats): string[] {
  const level = levelInfo(xpFromStats(s)).level;
  return BADGES.filter(b => b.earned(s, level)).map(b => b.id);
}
