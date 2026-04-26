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

export function teamsGridCols(n: number): string {
  if (n <= 3) return `repeat(${n},1fr)`;
  if (n === 4) return "repeat(2,1fr)";
  return "repeat(3,1fr)"; // 5 → 3+2, natural CSS grid centering
}

export const GAME_MODES: GameMode[] = [
  { id: "auction",   name: "Sentence Auction",  icon: "🏛️", desc: "Bet points on correct or incorrect sentences", color: "#8B5CF6", tag: "Read & analyse sentences" },
  { id: "battleship",name: "Battleship", icon: "⚓",  desc: "Attack coordinates by answering correctly", color: "#3B82F6", tag: "Short answers & recall" },
  { id: "hotpotato", name: "Hot Potato", icon: "🥔",  desc: "Answer fast or keep the potato — the timer ends randomly", color: "#F97316", tag: "Quick completions under pressure" },
  { id: "castle",    name: "Castle Defense", icon: "🏰",  desc: "Correct answers let you attack enemies", color: "#10B981", tag: "Short answers & recall" },
  { id: "hill",      name: "King of the Hill", icon: "👑",  desc: "Capture zones by answering questions", color: "#EC4899", tag: "Short answers & recall" },
  { id: "bridge",    name: "Bridge Builder", icon: "🌉",  desc: "Race to build your bridge across four different task types", color: "#0EA5E9", tag: "Mixed — from recall to speaking" },
  { id: "minefield", name: "Minefield", icon: "💣",  desc: "Combine sentence fragments to speak — and dodge the mines", color: "#EF4444", tag: "Construct full sentences aloud" },
  { id: "cards",     name: "Card Shuffle", icon: "🃏",  desc: "Pick a card and complete an open speaking or writing task", color: "#F59E0B", tag: "Open speaking tasks" },
  { id: "hotseat",   name: "Hot Seat", icon: "🔥",  desc: "Describe words to your teammate — no spelling allowed", color: "#EF4444", tag: "Free description & paraphrase" },
  { id: "spy",       name: "Spy Among Us", icon: "🕵️",  desc: "Speak freely, listen carefully, find who has a different topic", color: "#374151", tag: "Free discussion & deduction" },
];

export const TASK_TYPES: string[] = ["finish the sentence", "correct grammar mistakes", "use vocabulary in a sentence", "choose correct grammar", "rewrite sentences", "speaking task"];