import { TOPIC_LIBRARY } from "./topics";
import { LESSONS } from "./lessons";

// Split out of lessonPlans.ts on purpose: this is the only piece of that file that needs
// TOPIC_LIBRARY (topics.ts's ~5MB question bank). lessonPlans.ts's own LESSON_PLANS export is
// needed eagerly by the always-loaded main app shell (LessonGamesGenerator.tsx), and its own
// static import of TOPIC_LIBRARY was dragging the whole content bank into that same eager bundle
// even though buildUnscrambleItems below is only ever called from the already-lazy-loaded
// LessonPlanScreen/LessonPlanSlideshow — keeping it here instead means TOPIC_LIBRARY only loads
// when that lazy chunk does.
//
// A short, real sentence pool used only by "unscramble" topics — pulled live from data that
// already exists (a topic's own question answers, filtered to clean single sentences), never
// hand-authored. Deliberately conservative filtering: no embedded quotes/dialogue (rules out
// question-and-reply answers like "'What's your name?' 'I'm Ana.'"), no bracket placeholders
// (rules out free-answer items like "(free - e.g. ...)"), no "..." template fragments (rules out
// a fill-in-the-blank answer field like "The richer...the more" — half a sentence, not a whole
// one), a plain 3-9 word sentence.
function isCleanSentence(s: string): boolean {
  if (!s || s.includes("'") || s.includes("’") || s.includes('"') || s.includes("(") || s.includes("/") || s.includes("...")) return false;
  const wordCount = s.trim().split(/\s+/).length;
  return wordCount >= 3 && wordCount <= 9;
}

export type UnscrambleItem = { words: string[]; answer: string };

// Builds `count` unscramble items for a topic by shuffling the words of real sentences already in
// that topic's own data (its question-bank answers, falling back to its Lesson's own example
// sentences) — nothing here is hand-written. Re-shuffles fresh on every call, so replaying the
// same lesson plan doesn't always show the same word order.
export function buildUnscrambleItems(topicId: string, count: number): UnscrambleItem[] {
  const topic = (TOPIC_LIBRARY as Record<string, { questions: { answer?: string }[] }>)[topicId];
  const fromQuestions = (topic?.questions ?? [])
    .map(q => q.answer)
    .filter((a): a is string => !!a && isCleanSentence(a));
  const fromLesson = (LESSONS[topicId]?.sections ?? [])
    .flatMap(s => s.examples ?? [])
    .map(ex => ex.replace(/\*\*/g, ""))
    .filter(isCleanSentence);

  const pool = [...new Set([...fromQuestions, ...fromLesson])];
  const chosen = [...pool].sort(() => Math.random() - 0.5).slice(0, count);

  return chosen.map(answer => {
    const words = answer.replace(/[.!?]$/, "").split(/\s+/);
    let shuffled = words;
    // Reshuffle if it happens to land back in the original order (only matters for very short
    // sentences) so the exercise never accidentally hands the student the answer already solved.
    do {
      shuffled = [...words].sort(() => Math.random() - 0.5);
    } while (words.length > 1 && shuffled.join(" ") === words.join(" "));
    return { words: shuffled, answer };
  });
}
