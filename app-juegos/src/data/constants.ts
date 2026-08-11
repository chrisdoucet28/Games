// Antes: import { TeamColor, GameMode } from "../types";
import type { TeamColor, GameMode } from "../types";

export const TEAM_COLORS: TeamColor[] = [
  { name: "Red",    bg: "#EF4444", light: "#FEE2E2", dark: "#991B1B", emoji: "🔴" },
  { name: "Blue",   bg: "#3B82F6", light: "#DBEAFE", dark: "#1E3A8A", emoji: "🔵" },
  { name: "Green",  bg: "#22C55E", light: "#DCFCE7", dark: "#14532D", emoji: "🟢" },
  { name: "Yellow", bg: "#EAB308", light: "#FEF9C3", dark: "#713F12", emoji: "🟡" },
  { name: "Purple", bg: "#8B5CF6", light: "#EDE9FE", dark: "#4C1D95", emoji: "🟣" },
  { name: "Orange", bg: "#F97316", light: "#FFEDD5", dark: "#7C2D12", emoji: "🟠" },
  { name: "Pink",   bg: "#EC4899", light: "#FCE7F3", dark: "#831843", emoji: "🩷" },
  { name: "Teal",   bg: "#14B8A6", light: "#CCFBF1", dark: "#134E4A", emoji: "🩵" },
];

// Optional per-team mascot, independent of color — lets two teams share a color but not an
// identity, and gives teams a bit of personality beyond a plain colored circle.
export const MASCOT_OPTIONS: string[] = [
  "🐉", "🦄", "🤖", "🦊", "🐸", "🦁", "🐧", "🦖",
  "🐝", "🦋", "🐙", "🦅", "🐢", "🐺", "🦉", "🐯",
  "🍕", "⚡", "🌟", "🎃", "👻", "🥷",
];

// Shared between the setup screen's level filter and anywhere a class's default level is picked
// (My Classes' "+ New Class" form, the inline Save & Exit picker) — one source of truth so the
// id/label/color set can't drift between the two pickers.
export const LEVELS_META = [
  { id: "all", desc: "All levels", color: "#6366F1" },
  { id: "A1", desc: "Beginner", color: "#22C55E" },
  { id: "A2", desc: "Elementary", color: "#84CC16" },
  { id: "B1", desc: "Intermediate", color: "#F59E0B" },
  { id: "B2", desc: "Upper-Int.", color: "#F97316" },
  { id: "C1", desc: "Advanced", color: "#EF4444" },
];

// Free-tier caps — a paid subscription (or promo redemption) lifts both. The class limit is
// enforced server-side too (a trigger on public.classes), since it's the real paywall; the team
// limit is UI-only (see the plan notes on why teams have no clean server-side enforcement point).
export const FREE_PLAN_LIMITS = { maxClasses: 1, maxTeams: 2 };

// 🚧 TEMPORARY TESTING OVERRIDE — while ClassCade is still being tested (pre-launch), every
// account gets full premium access and skips the onboarding plan-choice screen, so testers/
// colleagues don't hit paywall friction while trying things out. This does NOT remove or replace
// the real billing system (Stripe checkout, promo codes, the subscriptions table, the DB-level
// class-limit trigger all still work exactly as built) — it's a single switch read by
// `isPaidStatus()` (src/lib/subscription.ts) and App.tsx's onboarding gate.
//
// The class-limit trigger (`enforce_free_class_limit` in Postgres) has its own matching bypass
// flag set directly in the function body — flip both back to false (or delete this constant and
// its two call sites, and the trigger's early-return block) together when ready to actually
// enforce the free tier for real users.
export const TESTING_BYPASS_PAYWALL = true;

export function teamsGridCols(n: number): string {
  if (n <= 3) return `repeat(${n},1fr)`;
  if (n === 4) return "repeat(2,1fr)";
  return "repeat(3,1fr)"; // 5 → 3+2, natural CSS grid centering
}

// Ordered from least speaking asked of students to most — use this order for game-selection UI.
export const GAME_MODES: GameMode[] = [
  { id: "whack",     name: "Word Whack", icon: "🔨",  desc: "Solo 90-second time trial — whack the correct answer before it ducks", color: "#84CC16", tag: "No speech · pure reflexes · warm-up" },
  { id: "auction",   name: "Sentence Auction",  icon: "🏛️", desc: "Bet points on correct or incorrect sentences", color: "#8B5CF6", tag: "No speech · silent judgment · icebreaker" },
  { id: "battleship",name: "Battleship", icon: "⚓",  desc: "Attack coordinates by answering correctly", color: "#3B82F6", tag: "Short spoken corrections · low-pressure" },
  { id: "vault",     name: "Vault Heist", icon: "🔐",  desc: "Crack your team's vault by rewriting sentences correctly — one wrong answer re-locks your last crack", color: "#D4AF37", tag: "Short answers · high-stakes accuracy · no partial credit" },
  { id: "hill",      name: "King of the Hill", icon: "👑",  desc: "Capture zones by answering questions", color: "#EC4899", tag: "Quick spoken completions · head-to-head" },
  { id: "hotpotato", name: "Hot Potato", icon: "🥔",  desc: "Answer fast or keep the potato — the timer ends randomly", color: "#F97316", tag: "Short answers · timed bursts" },
  { id: "castle",    name: "Castle Defense", icon: "🏰",  desc: "Correct answers let you attack enemies", color: "#10B981", tag: "Short answers + occasional full speech" },
  { id: "racetrack", name: "Race Track", icon: "🏁",  desc: "Answer correctly to roll dice and race around the track", color: "#F7C948", tag: "Ramps from short answers to speaking" },
  { id: "minefield", name: "Minefield", icon: "💣",  desc: "Combine sentence fragments to speak — and dodge the mines", color: "#EF4444", tag: "Full sentences, spoken aloud" },
  { id: "rocket",    name: "Rocket Fuel", icon: "🚀",  desc: "Use the given word in a sentence to fuel your team's rocket", color: "#6366F1", tag: "Original sentences, prompt after prompt" },
  { id: "orderup",   name: "Order Up", icon: "🍽️",  desc: "Customers order food tied to grammar or vocabulary targets — write one sentence that satisfies every item on the ticket before their patience runs out", color: "#F43F5E", tag: "Full sentences, written — not spoken · shared floor" },
  { id: "cards",     name: "Card Shuffle", icon: "🃏",  desc: "Pick a card and complete an open speaking or writing task", color: "#F59E0B", tag: "One open speaking prompt" },
  { id: "hotseat",   name: "Hot Seat", icon: "🔥",  desc: "Describe words to your teammate — no spelling allowed", color: "#EF4444", tag: "Nonstop improvised talking" },
  { id: "spy",       name: "Spy Among Us", icon: "🕵️",  desc: "Speak freely, listen carefully, find who has a different topic", color: "#374151", tag: "Sustained free conversation" },
  { id: "zombie",    name: "Zombie Siege", icon: "🧟",  desc: "Add sentences to a shared prompt to barricade the house — clear each wave of zombies before the next, bigger one arrives", color: "#65A30D", tag: "Free-for-all sentence-throwing · wave-based pressure" },
];

export const TASK_TYPES: string[] = ["fill in the blank", "correct grammar mistakes", "use vocabulary in a sentence", "choose correct grammar", "rewrite sentences", "speaking task"];