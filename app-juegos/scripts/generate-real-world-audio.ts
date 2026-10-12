// One-off batch script: generates any Lesson Plans "Real-World Reading" audio clip that doesn't
// already have an audioUrl in REAL_WORLD_READINGS, via the ElevenLabs text-to-speech API. Not run
// automatically (no npm lifecycle hook) — costs API quota, so run manually only when adding new
// real-world-reading content:
//   npx tsx scripts/generate-real-world-audio.ts
// Pass --force to regenerate every clip instead (e.g. after changing a voice), even ones that
// already have an audioUrl — otherwise existing clips are left untouched, so it's safe to re-run
// repeatedly as more topics get authored, or after switching to a different ELEVENLABS_API_KEY
// (e.g. a second account) partway through a big batch, without re-spending quota on what's
// already done. Processes earlier levels before later ones, and within a level, grammar-focus
// topics before vocabulary/theme ones (see priorityKey) — so a partial run driven by limited
// quota always covers the most-used content first, not just whatever happens to sit earliest in
// the file. Needs an ELEVENLABS_API_KEY in app-juegos/.env (git-ignored, never commit it).
//
// Every run starts with a voice check (see voiceCheck): it stops BEFORE spending any credits if a
// passage has a named/gendered narrator whose topic isn't pinned in LOCKED_VOICE. Pass --check to
// run only that check (no API call, no key needed) — do this first whenever new topics are added.
//
// Writes clips to public/audio/real-world/ (git-ignored — transient local staging only). After a
// run, upload the new clips with scripts/upload-media-to-blob.ts and paste the printed URLs into
// the matching audioUrl fields in src/data/realWorldReadings.ts by hand — same two-step flow as
// adding a new music track (see the MEDIA_BASE comment in src/lib/music.ts).
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { REAL_WORLD_READINGS } from "../src/data/realWorldReadings.ts";
import { TOPIC_OPTIONS } from "../src/data/topicOptions.ts";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const AUDIO_DIR = path.join(ROOT, "public", "audio", "real-world");

// Generation priority: earlier levels first, and — per teacher feedback that grammar topics are
// used far more than vocabulary/theme ones — grammar-focus topics before other focuses within the
// same level. A stable sort (guaranteed since ES2019) keeps everything else in its original
// REAL_WORLD_READINGS order, so this only reorders across level/focus boundaries, never within a
// group. Update LEVEL_RANK if a level ever gets added beyond C1.
const LEVEL_RANK: Record<string, number> = { A1: 0, A2: 1, B1: 2, B2: 3, C1: 4 };
const TOPIC_META: Record<string, { level: string | null; focus: string | null }> =
  Object.fromEntries(TOPIC_OPTIONS.map(t => [t.value, { level: t.level, focus: t.focus }]));

function priorityKey(id: string): [number, number] {
  const meta = TOPIC_META[id];
  const levelRank = meta?.level ? LEVEL_RANK[meta.level] ?? 99 : 99;
  const focusRank = meta?.focus === "grammar" ? 0 : 1;
  return [levelRank, focusRank];
}

const FEMALE_VOICE = "XrExE9yKIg1WjnnlVkGX";
const MALE_VOICE = "CwhRBWXzGAHq8TQ4Fs17";

// Topics with an explicit named first-person narrator whose gender the voice must match — kept as
// an explicit override (not left to whatever the alternation below would produce), so this stays
// correct even if topics get reordered or new ones inserted before these. Add a topic id here if a
// future reading gets its own named first-person narrator too.
const LOCKED_VOICE: Record<string, string> = {
  present_simple: FEMALE_VOICE, // "Hi, I'm Sofia!"
  what_do_you_do: MALE_VOICE,   // "Hi, I'm Carlos."
  to_be: FEMALE_VOICE,          // "I am Sara"
};

// Every other topic alternates female/male by position in REAL_WORLD_READINGS — deterministic (a
// re-run never flips anyone's existing voice), and gives real variety across the whole feature
// instead of one voice narrating almost everything (the bug this replaced: a single DEFAULT_VOICE
// meant only the 1 locked-male topic out of 56 was ever male).
function buildVoiceAssignment(ids: string[]): Record<string, string> {
  const assignment: Record<string, string> = {};
  ids.forEach((id, i) => {
    assignment[id] = LOCKED_VOICE[id] ?? (i % 2 === 0 ? FEMALE_VOICE : MALE_VOICE);
  });
  return assignment;
}

// Pre-flight voice check — runs before any API call, so a gendered narrator mismatch (the "I am
// Sara" read by the male voice bug) is caught before credits are spent, not after. BLOCKING cues
// are ones where the passage itself names/gender-marks its narrator: the topic must then have a
// LOCKED_VOICE entry (that is the human decision "yes, this voice matches"). Resolve a block by
// adding the topic to LOCKED_VOICE with the right voice. WARN cues are only printed for a human to
// skim (e.g. "my sister" — a relative, which doesn't gender the narrator).
const BLOCKING_CUES: [string, RegExp][] = [
  ["named narrator", /\b(?:I'm|I am|My name is|My name's)\s+[A-Z][a-z]+/],
  ["self-described gender/role", /\bI(?:'m| am) (?:a|an) (?:man|woman|guy|girl|lady|gentleman|boy|waiter|waitress|actor|actress|mother|father|husband|wife)\b/i],
  ["signed with a name", /(?:^|\n)\s*(?:Best|Best wishes|Regards|Kind regards|Thanks|Cheers|Love|Sincerely|Yours),?\s+[A-Z][a-z]+\s*$/m],
];
const WARN_CUES: [string, RegExp][] = [
  ["mentions a relative", /\bmy (?:husband|wife|boyfriend|girlfriend|mother|father|mom|mum|dad|son|daughter|brother|sister)\b/i],
  ["as a <gendered role>", /\bas a (?:man|woman|mother|father|mum|dad|husband|wife)\b/i],
];

function voiceCheck(ids: string[], voiceAssignment: Record<string, string>): boolean {
  let blocked = 0;
  console.log("Voice plan (F = female, M = male; * = pinned in LOCKED_VOICE):");
  for (const id of ids) {
    const text = REAL_WORLD_READINGS[id].passage.join("\n");
    const locked = id in LOCKED_VOICE;
    const label = voiceAssignment[id] === FEMALE_VOICE ? "F" : "M";
    const block = BLOCKING_CUES.map(([n, re]) => { const m = text.match(re); return m ? `${n}: "${m[0].trim()}"` : null; }).filter(Boolean);
    const warn = WARN_CUES.map(([n, re]) => { const m = text.match(re); return m ? `${n}: "${m[0].trim()}"` : null; }).filter(Boolean);
    const unresolved = block.length > 0 && !locked;
    if (unresolved) blocked++;
    if (unresolved || warn.length || (block.length && locked)) {
      console.log(`  ${unresolved ? "BLOCK" : "note "} ${id.padEnd(34)} ${label}${locked ? "*" : " "}  ${[...block, ...warn].join(" | ")}`);
    }
  }
  const f = ids.filter(id => voiceAssignment[id] === FEMALE_VOICE).length;
  console.log(`  (${ids.length} topic(s): ${f} female, ${ids.length - f} male; only topics with a cue are listed)\n`);
  if (blocked) {
    console.error(`${blocked} topic(s) have a gendered/named narrator with no LOCKED_VOICE entry. Add each to LOCKED_VOICE with the voice that matches the narrator, then re-run. Nothing was generated.`);
    return false;
  }
  return true;
}

function loadApiKey(): string {
  const envPath = path.join(ROOT, ".env");
  if (!existsSync(envPath)) throw new Error(".env not found at app-juegos/.env — see the Real-World Reading feature's setup notes");
  const line = readFileSync(envPath, "utf8").split("\n").find(l => l.startsWith("ELEVENLABS_API_KEY="));
  if (!line) throw new Error("ELEVENLABS_API_KEY not found in .env");
  const key = line.slice("ELEVENLABS_API_KEY=".length).trim();
  if (!key) throw new Error("ELEVENLABS_API_KEY is empty in .env");
  return key;
}

async function generateOne(id: string, text: string, voiceId: string, apiKey: string): Promise<void> {
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`, {
    method: "POST",
    headers: { "xi-api-key": apiKey, "Content-Type": "application/json", "Accept": "audio/mpeg" },
    body: JSON.stringify({ text, model_id: "eleven_multilingual_v2" }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`${id}: HTTP ${res.status} ${res.statusText} — ${body.slice(0, 300)}`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  writeFileSync(path.join(AUDIO_DIR, `${id}.mp3`), buf);
  console.log(`  wrote ${id}.mp3 (${(buf.length / 1024).toFixed(0)} KB)`);
}

async function main() {
  const force = process.argv.includes("--force");
  const checkOnly = process.argv.includes("--check");
  const allEntries = Object.entries(REAL_WORLD_READINGS);
  const entries = force ? allEntries : allEntries.filter(([, r]) => !r.audioUrl);
  entries.sort((a, b) => {
    const [al, af] = priorityKey(a[0]);
    const [bl, bf] = priorityKey(b[0]);
    return al !== bl ? al - bl : af - bf;
  });
  const skipped = allEntries.length - entries.length;
  console.log(`Generating ${entries.length} clip(s)${skipped ? ` (skipping ${skipped} already present)` : ""}...`);

  const voiceAssignment = buildVoiceAssignment(Object.keys(REAL_WORLD_READINGS));
  if (!voiceCheck(entries.map(([id]) => id), voiceAssignment)) process.exit(1);
  if (checkOnly) { console.log("--check: voice plan OK, nothing generated."); return; }
  const apiKey = loadApiKey();
  const remaining = entries.map(([id]) => id);
  for (const [id, r] of entries) {
    const voiceId = voiceAssignment[id];
    const text = r.passage.join(" ... ");
    try {
      await generateOne(id, text, voiceId, apiKey);
      remaining.shift();
    } catch (err) {
      console.error((err as Error).message ?? err);
      console.error(`\nStopped after a failure. Not yet generated: ${remaining.join(", ")}`);
      console.error(`Re-run this script later (e.g. with a different account's ELEVENLABS_API_KEY in .env) — it will pick up exactly where it left off.`);
      process.exit(1);
    }
    await new Promise(res => setTimeout(res, 250));
  }

  console.log(`Done. Now run: npx tsx scripts/upload-media-to-blob.ts`);
}

main().catch(err => {
  console.error(err.message ?? err);
  process.exit(1);
});
