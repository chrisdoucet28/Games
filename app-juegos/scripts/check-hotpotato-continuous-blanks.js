#!/usr/bin/env node
// Audits every Hot Potato `prompt` fill-in-blank item in src/data/topics.ts's continuous-tense
// topics for a blank that only tests the auxiliary (was/were, am/is/are, ...) while the fixed
// sentence text is missing the actual -ing verb the continuous tense needs — so filling in the
// "correct" choice still produces a broken sentence. Caught live: past_continuous had
// "'I ___ TV when you called.' (was/were)" — answer "was" gives "I was TV when you called.",
// missing "watching" entirely. Every sibling item in the same topic correctly keeps the -ing verb
// in the fixed text (e.g. "'She ___ cooking when I arrived.'").
//
// Run: node scripts/check-hotpotato-continuous-blanks.js
// Exits non-zero (and lists every offending item) if any such blank is found.
//
// Scoped to continuous-tense topics on purpose: the same (was/were)/(am/is/are) auxiliary-choice
// convention is also used for plain "to be" conjugation (to_be) and second-conditional subjunctive
// "were" (second_conditional) items, neither of which involves an -ing verb at all — flagging
// those would be noise, not a real bug.

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TOPICS_PATH = path.join(__dirname, "..", "src", "data", "topics.ts");

const CONTINUOUS_TOPICS = new Set([
  "present_simple_vs_continuous", "present_continuous_a1", "present_continuous_a2",
  "past_continuous", "present_perfect_continuous", "future_continuous",
]);
const AUX_CHOICE_RE = /\((am\/is\/are|am\/are\/is|is\/are|was\/were|will be)\)/;

function main() {
  const src = fs.readFileSync(TOPICS_PATH, "utf8");
  const lines = src.split("\n");

  let currentTopic = null;
  const flagged = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const headerMatch = line.match(/^ {2}([a-zA-Z0-9_]+): \{$/);
    if (headerMatch) currentTopic = headerMatch[1];
    if (!CONTINUOUS_TOPICS.has(currentTopic)) continue;
    if (!line.includes("prompt:")) continue;

    const promptMatch = line.match(/prompt:"((?:[^"\\]|\\.)*)"/);
    if (!promptMatch) continue;
    const sentence = promptMatch[1];
    if (!sentence.includes("___")) continue;
    if (!AUX_CHOICE_RE.test(line)) continue;

    const hasIngWord = /\b[a-zA-Z]+ing\b/.test(sentence.replace("___", ""));
    if (!hasIngWord) flagged.push({ topic: currentTopic, line: i + 1, sentence });
  }

  if (flagged.length === 0) {
    console.log("OK — every continuous-tense Hot Potato auxiliary-choice blank keeps its -ing verb.");
    process.exit(0);
  }

  console.log(`CRITICAL — ${flagged.length} Hot Potato item(s) in a continuous-tense topic are missing their -ing verb:\n`);
  for (const f of flagged) {
    console.log(`--- ${f.topic} line ${f.line} ---`);
    console.log(`  prompt: '${f.sentence}'\n`);
  }
  process.exit(1);
}

main();
