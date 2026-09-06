import { LESSONS, type Lesson } from "./lessons";
import { TOPIC_OPTIONS } from "./topics";

export type LearnTopic = { id: string; lesson: Lesson; meta: (typeof TOPIC_OPTIONS)[number] };

// Cross-reference LESSONS (the actual content) against TOPIC_OPTIONS (level/focus metadata) so
// adding a new lesson later is a one-line addition to lessons.ts — this list rebuilds itself.
// Shared by the authenticated LearnScreen and the public /learn pages so all three can never drift
// out of sync with each other (see CLAUDE.md's Learn/topics parity rule).
//
// Deliberately plain data (no JSX, no component imports) — the sitemap generator script
// (scripts/generate-sitemap.ts) imports LESSON_TOPICS through a standalone Node/tsx run, not
// through Vite, so anything this file pulls in transitively must be JSX-free. The render-time
// helpers that DO need <Icon>/JSX (renderBold, renderMistake) live in ./learnTopicsRender.tsx
// instead, kept out of this file's import graph on purpose.
export const LESSON_TOPICS: LearnTopic[] = Object.keys(LESSONS)
  .map(id => ({ id, lesson: LESSONS[id], meta: TOPIC_OPTIONS.find(o => o.value === id) }))
  .filter((t): t is LearnTopic => Boolean(t.meta));

export const LEVEL_ORDER = ["A1", "A2", "B1", "B2", "C1"];
export const LEVEL_COLOR: Record<string, string> = {
  A1: "#22C55E", A2: "#84CC16", B1: "#F59E0B", B2: "#F97316", C1: "#EF4444",
};
export const FOCUS_ORDER = ["grammar", "vocabulary", "topic"];
export const FOCUS_LABEL: Record<string, string> = { grammar: "Grammar", vocabulary: "Vocabulary", topic: "Themes" };

// Shared by the game-setup topic picker and the Lesson Plans index — both search a list of
// human-readable labels the same simple way, so this lives here once instead of twice.
export const matchesTopicSearch = (label: string, search: string) => {
  const term = search.trim().toLowerCase();
  return term === "" || label.toLowerCase().includes(term);
};
