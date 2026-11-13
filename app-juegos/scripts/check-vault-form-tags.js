#!/usr/bin/env node
// Audits every topic's `rewrite sentences` items (Vault Heist's content type) in
// src/data/topics.ts for a missing/wrong `form` tag on a duplicate-looking fragment: two items
// that share the exact same `question` fragment text but produce answers of a different form
// (affirmative/negative/question) with no `form` tag telling them apart. Without the tag,
// VaultHeistGame.tsx's lock-reveal badge shows nothing to disclose which is expected, and the
// admin topic browser's "rewrite sentences" list shows what looks like a duplicate entry — a
// teacher flagged exactly this in past_continuous (two identical fragments, one secretly
// negative, one secretly a question). A teacher-confirmed, repo-wide audit (2026-11) found and
// fixed every existing instance; this script exists so a future new topic can't reintroduce it
// silently.
//
// Run: node scripts/check-vault-form-tags.js
// Exits non-zero (and lists every offending item) if any duplicate-fragment/missing-form
// conflict is found.
//
// Deliberately narrow: this only flags items that share IDENTICAL question-fragment text with a
// differently-formed sibling. It does NOT flag every negative/question-shaped rewrite item in
// general — most rewrite topics (invitations, suggestions, clarification requests, indefinite
// pronouns, etc.) are inherently phrased as a question/negative by their own function, not
// "transformed from a positive sentence", and tagging those would be noise, not a real bug. See
// the Vault Heist standing rule in CLAUDE.md for the full reasoning.

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TOPICS_PATH = path.join(__dirname, "..", "src", "data", "topics.ts");

// These three bare tags are deliberately reused across many unrelated topics (see
// AMBIGUOUS_TRANSFORMS in VaultHeistGame.tsx), so their pools are scoped per-topic; every other
// transform tag already bakes in its own tense/structure and is scoped globally by name alone,
// matching categoryKeyFor() in VaultHeistGame.tsx.
const AMBIGUOUS_TRANSFORMS = new Set(["negative", "question", "affirmative"]);

function isNegativeAnswer(answer) {
  // No \b before "n't": a contraction's "n" is always glued directly onto the preceding word
  // stem (do-n't, isn't, wasn't...), both \w characters, so \b never fires there -- an anchored
  // /\bn't\b/ silently fails to match EVERY contraction, which is most negative answers in
  // English. Only the trailing \b (after "t") is meaningful here.
  return /n't\b/i.test(answer) || /\b(never|nobody|nothing|no one|neither|nor|not)\b/i.test(answer);
}
function expectedForm(answer) {
  if (/\?\s*$/.test(answer.trim())) return "question";
  if (isNegativeAnswer(answer)) return "negative";
  return "affirmative";
}
function groupKeyFor(topicId, transform) {
  if (transform && AMBIGUOUS_TRANSFORMS.has(transform)) return `${topicId}::${transform}`;
  return transform ?? `${topicId}::(no-transform)`;
}

function main() {
  const src = fs.readFileSync(TOPICS_PATH, "utf8");
  const lines = src.split("\n");

  let currentTopic = null;
  const items = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const headerMatch = line.match(/^ {2}([a-zA-Z0-9_]+): \{$/);
    if (headerMatch) currentTopic = headerMatch[1];
    if (!line.includes('type:"rewrite sentences"')) continue;

    const qMatch = line.match(/question:"((?:[^"\\]|\\.)*)"/);
    const aMatch = line.match(/answer:"((?:[^"\\]|\\.)*)"/);
    // \b matters here: "form:" is a literal substring of "transform:" ("trans" + "form:"), so an
    // unanchored /form:"(...)"/ on a line with no real form field would match the tail end of
    // transform:"negative" (or any other hyphen-free single-word tag) and silently misread the
    // transform's own value as if it were a form field. "transform" has no non-word character
    // before its embedded "form", so \b (a \w/\W transition) never fires inside it, only at a
    // real, separate "form:" key.
    const formMatch = line.match(/\bform:"([a-zA-Z]+)"/);
    const transformMatch = line.match(/transform:"([a-zA-Z0-9_-]+)"/);
    if (!qMatch || !aMatch) continue;

    items.push({
      topic: currentTopic,
      line: i + 1,
      question: qMatch[1],
      answer: aMatch[1],
      form: formMatch ? formMatch[1] : null,
      transform: transformMatch ? transformMatch[1] : null,
      expected: expectedForm(aMatch[1]),
    });
  }

  const groups = new Map();
  for (const it of items) {
    const key = groupKeyFor(it.topic, it.transform);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(it);
  }

  const conflicts = [];
  for (const [groupKey, groupItems] of groups) {
    const byFragment = new Map();
    for (const it of groupItems) {
      if (!byFragment.has(it.question)) byFragment.set(it.question, []);
      byFragment.get(it.question).push(it);
    }
    for (const [fragment, sameFragItems] of byFragment) {
      const forms = new Set(sameFragItems.map(i => i.expected));
      if (forms.size <= 1) continue; // same fragment, same form -- not a conflict
      for (const it of sameFragItems) {
        if (it.expected === "affirmative") continue; // default shape, no tag needed
        if (it.form === it.expected) continue; // already correctly tagged
        conflicts.push({ ...it, groupKey, fragment, siblingCount: sameFragItems.length, shapes: [...forms] });
      }
    }
  }

  if (conflicts.length === 0) {
    console.log("OK — no duplicate-fragment Vault Heist rewrite-sentences items are missing a form tag.");
    process.exit(0);
  }

  console.log(`CRITICAL — ${conflicts.length} Vault Heist rewrite-sentences item(s) share an identical fragment with a differently-formed sibling but have no (or the wrong) form tag:\n`);
  for (const c of conflicts) {
    console.log(`--- ${c.topic} line ${c.line} (group "${c.groupKey}", fragment shared by ${c.siblingCount} items, shapes: ${c.shapes.join("/")}) ---`);
    console.log(`  expected form:"${c.expected}", got form:${c.form ? `"${c.form}"` : "MISSING"}`);
    console.log(`  question: '${c.fragment}'`);
    console.log(`  answer:   '${c.answer}'\n`);
  }
  process.exit(1);
}

main();
