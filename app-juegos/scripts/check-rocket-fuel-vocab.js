#!/usr/bin/env node
// Audits every "use vocabulary in a sentence" item in src/data/topics.ts (the content type
// RocketFuelGame.tsx prefers — see its own questions.filter() comment) for the one unambiguous
// failure mode a teacher flagged live: an `answer` written as a pre-built two-line dialogue
// exchange (two separate quoted utterances) instead of the single sentence Rocket Fuel's actual
// mechanic calls for — give the student ONE word/phrase, have them build ONE sentence with it.
//
// Run: node scripts/check-rocket-fuel-vocab.js
// Exits non-zero (and lists every offending item) if any dialogue-exchange answer is found.
//
// Deliberately narrow, like check-vault-form-tags.js: this does NOT flag every two-part answer.
// Reply-tag phrases whose entire grammatical point is responding to a preceding statement (e.g.
// so_neither's "So do I." / "Neither have I.") are a legitimate exception — Rocket Fuel is
// teacher-judged, not auto-graded, so a worked dialogue there is a model answer for the teacher's
// reference, not something boxing the student in, and the word/phrase itself is still real and
// singular. This script would need a human judgment call to extend past the literal multi-quote
// pattern; see the what_time_is_it / clauses_of_reason / quantifiers fixes (2026-11) for the
// actual bug this exists to catch.

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TOPICS_PATH = path.join(__dirname, "..", "src", "data", "topics.ts");

// Topics whose reply-tag/response-phrase vocabulary genuinely requires a two-line setup+reply to
// demonstrate meaningfully (see the comment above) — reviewed by hand, not auto-detected.
const ALLOWED_DIALOGUE_TOPICS = new Set(["so_neither"]);

function main() {
  const src = fs.readFileSync(TOPICS_PATH, "utf8");
  const lines = src.split("\n");

  let currentTopic = null;
  const flagged = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const headerMatch = line.match(/^ {2}([a-zA-Z0-9_]+): \{$/);
    if (headerMatch) currentTopic = headerMatch[1];
    if (!line.includes('type:"use vocabulary in a sentence"')) continue;
    if (ALLOWED_DIALOGUE_TOPICS.has(currentTopic)) continue;

    const qMatch = line.match(/question:"((?:[^"\\]|\\.)*)"/);
    const aMatch = line.match(/answer:"((?:[^"\\]|\\.)*)"/);
    if (!qMatch || !aMatch) continue;
    const answer = aMatch[1];

    const quotedSegments = answer.match(/\\"[^\\]*\\"/g) || [];
    if (quotedSegments.length >= 2) {
      flagged.push({ topic: currentTopic, line: i + 1, question: qMatch[1], answer });
    }
  }

  if (flagged.length === 0) {
    console.log("OK — no Rocket Fuel vocabulary items are a dialogue exchange instead of one sentence.");
    process.exit(0);
  }

  console.log(`CRITICAL — ${flagged.length} "use vocabulary in a sentence" item(s) are a pre-built dialogue exchange, not a single sentence for the student to build:\n`);
  for (const f of flagged) {
    console.log(`--- ${f.topic} line ${f.line} ---`);
    console.log(`  question: '${f.question}'`);
    console.log(`  answer:   ${f.answer}\n`);
  }
  process.exit(1);
}

main();
