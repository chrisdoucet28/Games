import type { QuestionData } from "../types";
import { parseChoices } from "../hooks/useMoleGame";

// Practice Mode's content-building utility — reads straight from topics.ts's per-topic `questions`
// and `auctionSentences` arrays, independent of which of the 17 classroom games normally displays
// them. Only 6 content types have a real, checkable answer (confirmed by reading every game's own
// source, not any marketing blurb): 4 are shown reveal-then-self-report (no single correct answer
// to check against beyond a model answer), and 2 — "choose correct grammar" and auctionSentences —
// already carry real ground truth, so those get true tap-to-answer auto-grading instead, reusing
// the exact same MCQ parsing Word Whack already relies on (`parseChoices`) rather than duplicating
// that regex here.
const REVEAL_TYPES = new Set([
  "correct grammar mistakes",
  "rewrite sentences",
  "fill in the blank",
  "use vocabulary in a sentence",
]);
const MCQ_TYPE = "choose correct grammar";

export type PracticeItem =
  | { kind: "reveal"; sourceTopic: string; question: QuestionData }
  | { kind: "mcq"; sourceTopic: string; prompt: string; choices: string[]; correctIdx: number; hint?: string }
  | { kind: "auction"; sourceTopic: string; sentence: string; isCorrect: boolean; explanation?: string };

// Duplicated from LessonGamesGenerator.tsx's own `shuffle`/`buildBalancedMixedPool` (pure, stable,
// ~30 lines) rather than exporting them from that file — it's a large, central orchestrator, and
// this is an unrelated, isolated feature; a small duplication here is lower-risk than adding a new
// export surface to it.
function shuffle<T>(items: T[]): T[] {
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function buildBalancedMixedPool<T>(topicBuckets: T[][]): T[] {
  const activeBuckets = topicBuckets.map(bucket => shuffle(bucket)).filter(bucket => bucket.length > 0);
  const mixed: T[] = [];

  while (activeBuckets.length > 0) {
    const bucketOrder = shuffle(activeBuckets.map((_, index) => index));
    const emptiedBuckets: number[] = [];

    bucketOrder.forEach(bucketIndex => {
      const nextItem = activeBuckets[bucketIndex].shift();
      if (nextItem) mixed.push(nextItem);
      if (activeBuckets[bucketIndex].length === 0) emptiedBuckets.push(bucketIndex);
    });

    [...new Set(emptiedBuckets)].sort((a, b) => b - a).forEach(bucketIndex => {
      activeBuckets.splice(bucketIndex, 1);
    });
  }

  return mixed;
}

type LibraryEntry = { questions?: QuestionData[]; auctionSentences?: QuestionData[] };

// TOPIC_LIBRARY (the ~5MB content bank) is loaded via dynamic import only once a practice session
// actually starts — same reasoning as startGame() in LessonGamesGenerator.tsx, keeps it out of the
// public /practice page's initial bundle.
export async function getPracticeQuestions(topicIds: string[]): Promise<PracticeItem[]> {
  const { TOPIC_LIBRARY } = await import("../data/topics");
  const library = TOPIC_LIBRARY as unknown as Record<string, LibraryEntry>;

  const buckets: PracticeItem[][] = topicIds.map(topicId => {
    const entry = library[topicId];
    if (!entry) return [];
    const items: PracticeItem[] = [];

    for (const q of entry.questions ?? []) {
      if (q.type === MCQ_TYPE) {
        const parsed = parseChoices(q);
        if (parsed) {
          items.push({ kind: "mcq", sourceTopic: topicId, prompt: parsed.prompt, choices: parsed.choices, correctIdx: parsed.correctIdx, hint: q.hint });
        }
        continue;
      }
      if (q.type && REVEAL_TYPES.has(q.type) && q.answer) {
        items.push({ kind: "reveal", sourceTopic: topicId, question: q });
      }
    }

    for (const s of entry.auctionSentences ?? []) {
      if (s.sentence && typeof s.isCorrect === "boolean") {
        items.push({ kind: "auction", sourceTopic: topicId, sentence: s.sentence, isCorrect: s.isCorrect, explanation: s.explanation });
      }
    }

    return items;
  });

  return topicIds.length > 1 ? buildBalancedMixedPool(buckets) : shuffle(buckets.flat());
}
