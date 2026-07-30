#!/usr/bin/env node
// Audits every topic's `auctionSentences` array in src/data/topics.ts for the "rotating pairs"
// anti-pattern: a correct sentence immediately followed by the same sentence with one word
// swapped to make it wrong. Students pattern-match that shape almost instantly ("the second of
// each near-identical pair is the broken one") and stop reading the actual content — a teacher
// flagged this directly after playing Sentence Auction with a student. See the comment on
// `auctionSentences` in src/LessonGamesGenerator.tsx for the content rule this enforces.
//
// Run: node scripts/check-auction-sentences.js
// Exits non-zero (and lists every offending topic) if any topic fails either check:
//   1. Adjacent-sentence word overlap > 60% (near-duplicate wording back to back)
//   2. isCorrect strictly alternates true/false for the whole array (>= 6 items)
//
// This is a heuristic, not a formal grammar checker — a flagged topic needs a human/Claude to
// look at the actual sentences and judge whether it's a real instance of the pattern before
// rewriting anything.

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TOPICS_PATH = path.join(__dirname, "..", "src", "data", "topics.ts");
const OVERLAP_THRESHOLD = 0.6;
const MIN_LENGTH_FOR_ALTERNATION_CHECK = 6;

function wordOverlap(a, b) {
  const wordsA = a.toLowerCase().replace(/[^a-z ]/g, "").split(" ").filter(Boolean);
  const wordsB = b.toLowerCase().replace(/[^a-z ]/g, "").split(" ").filter(Boolean);
  if (wordsA.length === 0 || wordsB.length === 0) return 0;
  const setA = new Set(wordsA);
  const shared = wordsB.filter(w => setA.has(w)).length;
  return shared / Math.max(wordsA.length, wordsB.length);
}

function isStrictAlternation(bools) {
  if (bools.length < MIN_LENGTH_FOR_ALTERNATION_CHECK) return false;
  return bools.every((v, i) => i === 0 || v !== bools[i - 1]);
}

function main() {
  const src = fs.readFileSync(TOPICS_PATH, "utf8");
  // Every top-level TOPIC_LIBRARY entry looks like `  some_topic_id: {` at column 0 (2-space
  // indent). Walk those to know which topic each auctionSentences block belongs to.
  const topicStarts = [...src.matchAll(/^ {2}([a-zA-Z0-9_]+): \{$/gm)];
  const flagged = [];

  for (let i = 0; i < topicStarts.length; i++) {
    const topicId = topicStarts[i][1];
    const blockStart = topicStarts[i].index;
    const blockEnd = i + 1 < topicStarts.length ? topicStarts[i + 1].index : src.length;
    const topicSrc = src.slice(blockStart, blockEnd);

    const auctionStart = topicSrc.indexOf("auctionSentences:");
    if (auctionStart === -1) continue;
    const arrStart = topicSrc.indexOf("[", auctionStart);
    const arrEnd = topicSrc.indexOf("\n    ],", arrStart);
    const block = topicSrc.slice(arrStart, arrEnd === -1 ? undefined : arrEnd);

    const sentences = [...block.matchAll(/sentence:\s*"((?:[^"\\]|\\.)*)"/g)].map(m => m[1]);
    const corrects = [...block.matchAll(/isCorrect:\s*(true|false)/g)].map(m => m[1] === "true");
    if (sentences.length === 0) continue;

    const overlapPairs = [];
    for (let j = 1; j < sentences.length; j++) {
      const overlap = wordOverlap(sentences[j - 1], sentences[j]);
      if (overlap > OVERLAP_THRESHOLD) {
        overlapPairs.push({ a: sentences[j - 1], b: sentences[j], overlap });
      }
    }
    const alternating = isStrictAlternation(corrects);

    if (overlapPairs.length > 0 || alternating) {
      flagged.push({ topicId, overlapPairs, alternating, count: sentences.length });
    }
  }

  if (flagged.length === 0) {
    console.log(`OK — checked all topics with auctionSentences, no rotating-pattern issues found.`);
    process.exit(0);
  }

  // Two different severities: near-duplicate wording is the exact bug this script was written
  // for (a student can spot it after one round); pure true/false alternation with otherwise
  // independent sentences is a milder, secondary predictability risk — flag both, but don't
  // conflate them in the output.
  const critical = flagged.filter(f => f.overlapPairs.length > 0);
  const warnings = flagged.filter(f => f.overlapPairs.length === 0 && f.alternating);

  if (critical.length > 0) {
    console.log(`CRITICAL — ${critical.length} topic(s) have near-duplicate adjacent sentences (the exact "rotating pairs" bug):\n`);
    for (const f of critical) {
      console.log(`--- ${f.topicId} (${f.count} sentences) ---`);
      if (f.alternating) console.log(`  (isCorrect also strictly alternates true/false across the whole array)`);
      for (const p of f.overlapPairs) {
        console.log(`  near-duplicate adjacent pair (${(p.overlap * 100).toFixed(0)}% word overlap):`);
        console.log(`    "${p.a}"`);
        console.log(`    "${p.b}"`);
      }
      console.log("");
    }
  }

  if (warnings.length > 0) {
    console.log(`WARNING — ${warnings.length} topic(s) have independently-written sentences, but isCorrect strictly alternates true/false/true/false... for the whole array (a milder, position-based predictability risk, not the near-duplicate bug):`);
    console.log(`  ${warnings.map(f => f.topicId).join(", ")}\n`);
  }

  process.exit(critical.length > 0 ? 1 : 0);
}

main();
