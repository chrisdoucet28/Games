import { GAME_MODES } from "./constants";
import type { GameMode } from "../types";
import type { IconName } from "../components/shared/Icon";

// How the game-select page (and the homepage's "pick by what you need" section) groups the games:
// by the JOB a teacher needs done, not by game name. Each block also carries a "help level" — how much
// support students get — shown as a speedometer-style dial. This is the single place that decides
// which games sit in which block, in what order; to slot a new game in, add its id to a block's
// `gameIds` (a game no block lists still shows up, in an automatic "More games" block, with a
// dev-console warning — see getGameBlocks).

export type HelpLevel = 1 | 2 | 3 | 4 | 5;

export type GameCategory = {
  id: string;
  // Finishes the sentence "I need:" on the teacher's checklist.
  need: string;
  blurb: string;
  helpLevel: HelpLevel;
  gameIds: string[];
};

export const HELP_LEVEL_LABELS: Record<HelpLevel, string> = {
  1: "Lots of help",
  2: "A lot of help",
  3: "Some help",
  4: "A little help",
  5: "No help",
};

// Blue → green → yellow → orange → red: the same direction of hues the old tier dots and the A1–C1
// level chips already use, so "hotter = students are more on their own" reads the same everywhere.
const HELP_LEVEL_COLORS: Record<HelpLevel, string> = {
  1: "#0EA5E9",
  2: "#22C55E",
  3: "#EAB308",
  4: "#F97316",
  5: "#EF4444",
};

export function helpLevelColor(level: HelpLevel): string {
  return HELP_LEVEL_COLORS[level];
}

// Blocks always appear from the MOST help (dial 1) to the LEAST (dial 5) — getGameBlocks sorts by
// helpLevel, so changing a block's level moves it automatically everywhere (game-select page,
// checklist, homepage guide, Surprise Me). Blocks at the same level keep the order listed here.
// helpLevel for the two skill-specific blocks (writing, vocabulary) is a judgment call about how
// much the game hands students to work from — change it here if it doesn't match how you run them.
export const GAME_CATEGORIES: GameCategory[] = [
  {
    id: "understand",
    need: "To see if my students understand the topic",
    blurb: "Students pick the right answer — no speaking needed.",
    helpLevel: 1,
    gameIds: ["whack", "auction"],
  },
  {
    id: "grammar",
    need: "To practice the grammar more before making full sentences",
    blurb: "Short, controlled answers that build accuracy first.",
    helpLevel: 2,
    gameIds: ["battleship", "vault", "hill"],
  },
  {
    id: "review",
    need: "To review the topic as a whole",
    blurb: "A mix of question types that revisits everything in the topic.",
    helpLevel: 3,
    gameIds: ["hotpotato", "castle", "racetrack"],
  },
  {
    id: "vocabulary",
    need: "To practice vocabulary specifically",
    blurb: "Word-focused games that get students describing and asking about words.",
    helpLevel: 3,
    gameIds: ["hotseat", "relay"],
  },
  {
    id: "handicap",
    need: "To practice making sentences, but with a handicap",
    blurb: "Students build sentences, but the game gives them something to build from.",
    helpLevel: 4,
    gameIds: ["minefield", "rocket"],
  },
  {
    id: "writing",
    need: "To practice writing specifically",
    blurb: "Students put sentences in writing, so everyone can see and check them.",
    helpLevel: 4,
    gameIds: ["bounty", "orderup"],
  },
  {
    id: "no_help",
    need: "To practice full sentences, no help needed",
    blurb: "Open speaking — students make their own sentences with nothing given.",
    helpLevel: 5,
    gameIds: ["cards", "spy", "zombie"],
  },
];

// What a game actually asks students to DO, so each card shows the right icon next to its tag line
// (every card used to show a microphone — wrong for the no-speech games and the written one).
export type GameModality = "tap" | "speak" | "write" | "speak-or-write";

export const GAME_MODALITY: Record<string, GameModality> = {
  whack: "tap", auction: "tap",
  battleship: "speak", vault: "speak", hill: "speak", hotpotato: "speak", castle: "speak", racetrack: "speak",
  minefield: "speak", rocket: "speak",
  orderup: "write", bounty: "write",
  hotseat: "speak", relay: "speak",
  cards: "speak", spy: "speak", zombie: "speak",
};

export const MODALITY_ICON: Record<GameModality, IconName> = {
  tap: "target",
  speak: "mic",
  write: "pencil",
  "speak-or-write": "chat",
};

export function gameModalityIcon(gameId: string): IconName {
  return MODALITY_ICON[GAME_MODALITY[gameId] ?? "speak"];
}

export type GameBlock = { category: GameCategory; games: GameMode[] };

// The blocks as the page renders them. A game in GAME_MODES that no category lists is not dropped:
// it goes into a final "More games" block (so a brand-new game can never silently vanish from the
// page), and in dev the console says which one to categorize.
let cachedBlocks: GameBlock[] | null = null;

export function getGameBlocks(): GameBlock[] {
  if (cachedBlocks) return cachedBlocks;
  const listed = new Set<string>();
  // Array.prototype.sort is stable, so blocks sharing a help level stay in their listed order.
  const blocks: GameBlock[] = [...GAME_CATEGORIES]
    .sort((a, b) => a.helpLevel - b.helpLevel)
    .map(category => ({
      category,
      games: category.gameIds
        .map(id => GAME_MODES.find(g => g.id === id))
        .filter((g): g is GameMode => {
          if (g) listed.add(g.id);
          return !!g;
        }),
    }));

  const uncategorized = GAME_MODES.filter(g => !listed.has(g.id));
  if (uncategorized.length > 0) {
    if (import.meta.env.DEV) {
      console.warn(`[gameCategories] Not in any category, showing under "More games": ${uncategorized.map(g => g.id).join(", ")}`);
    }
    blocks.push({
      category: { id: "more", need: "More games", blurb: "Games not yet sorted into a group.", helpLevel: 3, gameIds: uncategorized.map(g => g.id) },
      games: uncategorized,
    });
  }
  cachedBlocks = blocks;
  return blocks;
}

// Every game in the order the cards appear on the page — what "Surprise Me!" steps through.
export function orderedGameModes(): GameMode[] {
  return getGameBlocks().flatMap(b => b.games);
}
