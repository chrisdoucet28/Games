import { useCallback, useMemo, useRef, useState } from "react";
import type { QuestionData } from "../types";

// The shared "deck of words" behind every word-list game (Hot Seat, Word Relay, and any vocabulary
// game added later). It replaces the identical deck code those two games each carried, and adds the
// teacher's-own-words mode: `applyCustomWords(list)` swaps the whole pool, and `resetToTopicWords()`
// goes back to the selected topics' words.
//
// With no custom list this behaves exactly like the code it replaced: the pool is the topic
// questions' `word` values de-duplicated case-insensitively, dealt from a shuffled deck that
// reshuffles when it runs out (a small pool just cycles), with a one-item swap so a new lap never
// opens with the previous lap's last word.

const shuffle = <T,>(items: T[]) => {
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export function topicWordsFrom(questions: QuestionData[]): string[] {
  const uniqueWords = new Map<string, string>();
  questions.forEach(q => {
    const word = q.word?.trim();
    if (word) uniqueWords.set(word.toLowerCase(), word);
  });
  return Array.from(uniqueWords.values());
}

export type WordDeck = {
  // The pool currently in force (custom list if set, otherwise the topic words).
  words: string[];
  // The teacher's own list, or null while the game plays the topic words. Saved in the game's
  // Save & Exit snapshot so a resumed game keeps it.
  customWords: string[] | null;
  drawWord: () => string;
  // Replaces the pool and starts a fresh shuffled deck right away (synchronously), so a drawWord()
  // called straight after already comes from the new list. An empty list means "topic words".
  applyCustomWords: (list: string[]) => void;
  resetToTopicWords: () => void;
};

export function useWordDeck(questions: QuestionData[], resumedCustomWords?: string[] | null): WordDeck {
  const [customWords, setCustomWords] = useState<string[] | null>(
    () => (resumedCustomWords && resumedCustomWords.length > 0 ? resumedCustomWords : null)
  );
  const topicWords = useMemo(() => topicWordsFrom(questions), [questions]);
  const words = customWords ?? topicWords;

  // The pool and deck live in refs so applyCustomWords can reset them and the very next drawWord()
  // sees the new list, without waiting for a re-render. poolRef follows `words` every render, so a
  // later change of `questions` reaches the next reshuffle exactly as before.
  const topicWordsRef = useRef(topicWords);
  topicWordsRef.current = topicWords;
  const poolRef = useRef(words);
  poolRef.current = words;
  // Shuffled once, on the first render (a plain `useRef(shuffle(words))` would re-shuffle the whole
  // list on every render and throw the result away).
  const deckRef = useRef<string[] | null>(null);
  if (deckRef.current === null) deckRef.current = shuffle(words);
  const deckPosRef = useRef(0);
  const lastWordRef = useRef<string | undefined>(undefined);

  const drawWord = useCallback(() => {
    let deck = deckRef.current ?? [];
    if (deckPosRef.current >= deck.length) {
      const next = shuffle(poolRef.current);
      if (next.length > 1 && next[0] === lastWordRef.current) {
        [next[0], next[1]] = [next[1], next[0]];
      }
      deck = next;
      deckRef.current = next;
      deckPosRef.current = 0;
    }
    const word = deck[deckPosRef.current];
    deckPosRef.current += 1;
    lastWordRef.current = word;
    return word;
  }, []);

  const applyCustomWords = useCallback((list: string[]) => {
    const next = list.length > 0 ? list : null;
    setCustomWords(next);
    const pool = next ?? topicWordsRef.current;
    poolRef.current = pool;
    deckRef.current = shuffle(pool);
    deckPosRef.current = 0;
    lastWordRef.current = undefined;
  }, []);

  const resetToTopicWords = useCallback(() => applyCustomWords([]), [applyCustomWords]);

  return { words, customWords, drawWord, applyCustomWords, resetToTopicWords };
}
