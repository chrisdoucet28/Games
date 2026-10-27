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
// TWO-VOICE CONVERSATIONS: a reading with a `dialogue` field (see realWorldReadings.ts) is read by
// two voices — one request per turn (female/male by default), each told what comes before/after it
// so the intonation flows — joined with a short silence into `<id>-2v.mp3`. The new file name is
// deliberate: blobs are cached for a year, so a re-uploaded `<id>.mp3` would keep playing the old
// single-voice file for anyone who'd already heard it. A dialogue counts as DONE only once its
// audioUrl points at a `-2v.mp3`, so they stay pending (and sort in by level) until redone.
// Pass --only=id1,id2 to limit a run to specific readings (e.g. to audition a couple of clips).
//
// Writes clips to public/audio/real-world/ (git-ignored — transient local staging only). After a
// run, upload the new clips with scripts/upload-media-to-blob.ts and paste the printed URLs into
// the matching audioUrl fields in src/data/realWorldReadings.ts by hand — same two-step flow as
// adding a new music track (see the MEDIA_BASE comment in src/lib/music.ts).
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { REAL_WORLD_READINGS, type RealWorldReading } from "../src/data/realWorldReadings.ts";
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

// A conversation's two voices (default: speaker 0 female, speaker 1 male).
const DEFAULT_DIALOGUE_VOICES: ["female", "male"] = ["female", "male"];
const dialogueVoices = (r: RealWorldReading) => r.dialogue?.voices ?? DEFAULT_DIALOGUE_VOICES;
const voiceIdFor = (g: "female" | "male") => (g === "female" ? FEMALE_VOICE : MALE_VOICE);

function voiceCheck(ids: string[], voiceAssignment: Record<string, string>): boolean {
  let blocked = 0;
  console.log("Voice plan (F = female, M = male; * = pinned; A+B = a two-voice conversation, speaker 1 then 2):");
  for (const id of ids) {
    const reading = REAL_WORLD_READINGS[id];
    const text = reading.passage.join("\n");
    // A conversation resolves a named speaker ("I'm Marta") by pinning `dialogue.voices` explicitly.
    const locked = id in LOCKED_VOICE || !!reading.dialogue?.voices;
    const label = reading.dialogue
      ? dialogueVoices(reading).map(g => (g === "female" ? "F" : "M")).join("+")
      : voiceAssignment[id] === FEMALE_VOICE ? "F" : "M";
    const block = BLOCKING_CUES.map(([n, re]) => { const m = text.match(re); return m ? `${n}: "${m[0].trim()}"` : null; }).filter(Boolean);
    const warn = WARN_CUES.map(([n, re]) => { const m = text.match(re); return m ? `${n}: "${m[0].trim()}"` : null; }).filter(Boolean);
    const unresolved = block.length > 0 && !locked;
    if (unresolved) blocked++;
    if (unresolved || warn.length || (block.length && locked)) {
      console.log(`  ${unresolved ? "BLOCK" : "note "} ${id.padEnd(34)} ${label}${locked ? "*" : " "}  ${[...block, ...warn].join(" | ")}`);
    }
  }
  const singles = ids.filter(id => !REAL_WORLD_READINGS[id].dialogue);
  const f = singles.filter(id => voiceAssignment[id] === FEMALE_VOICE).length;
  console.log(`  (${singles.length} single-voice topic(s): ${f} female, ${singles.length - f} male; ${ids.length - singles.length} two-voice conversation(s); only topics with a cue are listed)\n`);
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

// `context` (previous/next turn text) lets the model keep the intonation natural across separate
// requests — without it each short line is read as if it were the whole conversation.
async function tts(label: string, text: string, voiceId: string, apiKey: string, context?: { previous_text?: string; next_text?: string }): Promise<Buffer> {
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`, {
    method: "POST",
    headers: { "xi-api-key": apiKey, "Content-Type": "application/json", "Accept": "audio/mpeg" },
    body: JSON.stringify({ text, model_id: "eleven_multilingual_v2", ...context }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`${label}: HTTP ${res.status} ${res.statusText} — ${body.slice(0, 300)}`);
  }
  return Buffer.from(await res.arrayBuffer());
}

async function generateOne(id: string, text: string, voiceId: string, apiKey: string): Promise<void> {
  const buf = await tts(id, text, voiceId, apiKey);
  writeFileSync(path.join(AUDIO_DIR, `${id}.mp3`), buf);
  console.log(`  wrote ${id}.mp3 (${(buf.length / 1024).toFixed(0)} KB)`);
}

// --- Two-voice conversations ---
const TWO_VOICE_SUFFIX = "-2v";
const TURN_CACHE_DIR = path.join(AUDIO_DIR, ".turns"); // git-ignored with the rest of this folder
type Turn = { speaker: 0 | 1; text: string };
const squash = (s: string) => s.replace(/\s+/g, " ").trim();

const isDone = (r: RealWorldReading) => (r.dialogue ? !!r.audioUrl && r.audioUrl.includes(`${TWO_VOICE_SUFFIX}.mp3`) : !!r.audioUrl);

// The turns for a conversation. Explicit `turns` must spell out the on-screen passage exactly (so the
// audio can never drift from the text); otherwise each passage line is one turn, alternating.
function turnsFor(id: string, r: RealWorldReading): Turn[] {
  if (!r.dialogue?.turns) return r.passage.map((text, i) => ({ speaker: (i % 2) as 0 | 1, text }));
  const spoken = squash(r.dialogue.turns.map(t => t.text).join(" "));
  const shown = squash(r.passage.join(" "));
  if (spoken !== shown) throw new Error(`${id}: dialogue.turns text doesn't match the passage —\n  turns:   ${spoken}\n  passage: ${shown}`);
  return r.dialogue.turns;
}

// MP3 plumbing, no ffmpeg needed: every request returns the same CBR format, so clips can simply be
// joined byte-for-byte. An ID3 tag at the start of a clip is dropped; the pause is a run of
// all-zero frames, which decode as silence, built from a real frame header of the clip itself so it
// always matches its sample rate and mono/stereo mode.
const BITRATES_MPEG1_L3 = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320];
const SAMPLE_RATES_MPEG1 = [44100, 48000, 32000];
// ~26ms each at 44.1kHz. The voice service already leaves ~0.2-0.5s of quiet at the end of each line,
// so this only has to top it up: 8 frames (~0.21s) lands the total change-of-speaker gap near 0.5s.
const PAUSE_FRAMES = 8;

function stripId3(buf: Buffer): Buffer {
  if (buf.length > 10 && buf.toString("latin1", 0, 3) === "ID3") {
    const size = ((buf[6] & 0x7f) << 21) | ((buf[7] & 0x7f) << 14) | ((buf[8] & 0x7f) << 7) | (buf[9] & 0x7f);
    return buf.subarray(10 + size);
  }
  return buf;
}

function silenceLike(sample: Buffer): Buffer {
  let i = 0;
  while (i + 4 < sample.length && !(sample[i] === 0xff && (sample[i + 1] & 0xe0) === 0xe0)) i++;
  const h = sample.subarray(i, i + 4);
  // MPEG-1 Layer III only (what mp3_44100_128 is) — anything else and the frame maths below is wrong.
  if ((h[1] & 0xf8) !== 0xf8 || ((h[1] >> 1) & 3) !== 1) throw new Error("unexpected MP3 header — expected MPEG-1 Layer III");
  const bitrate = BITRATES_MPEG1_L3[(h[2] >> 4) & 0xf] * 1000;
  const sampleRate = SAMPLE_RATES_MPEG1[(h[2] >> 2) & 3];
  if (!bitrate || !sampleRate) throw new Error("unexpected MP3 bitrate/sample rate");
  const frame = Buffer.alloc(Math.floor((144 * bitrate) / sampleRate)); // no padding byte
  h.copy(frame, 0);
  frame[1] |= 1;     // no CRC (so no extra checksum bytes are expected)
  frame[2] &= 0xfd;  // no padding
  return frame;
}

async function generateDialogue(id: string, r: RealWorldReading, apiKey: string): Promise<number> {
  const turns = turnsFor(id, r);
  const [v0, v1] = dialogueVoices(r).map(voiceIdFor);
  const parts: Buffer[] = [];
  let chars = 0;
  for (let i = 0; i < turns.length; i++) {
    const t = turns[i];
    const voiceId = t.speaker === 0 ? v0 : v1;
    const ctxt = {
      ...(i > 0 ? { previous_text: turns[i - 1].text } : {}),
      ...(i < turns.length - 1 ? { next_text: turns[i + 1].text } : {}),
    };
    // Each turn's raw audio is kept on disk, keyed by exactly what produced it, so re-joining with a
    // different pause (or resuming after a quota error mid-conversation) costs no credits.
    const key = createHash("sha1").update(JSON.stringify([t.text, voiceId, ctxt])).digest("hex").slice(0, 16);
    const cacheFile = path.join(TURN_CACHE_DIR, `${key}.mp3`);
    let buf: Buffer;
    if (existsSync(cacheFile)) buf = readFileSync(cacheFile);
    else {
      buf = await tts(`${id} turn ${i + 1}`, t.text, voiceId, apiKey, ctxt);
      mkdirSync(TURN_CACHE_DIR, { recursive: true });
      writeFileSync(cacheFile, buf);
      chars += t.text.length;
      await new Promise(res => setTimeout(res, 150));
    }
    parts.push(stripId3(buf));
  }
  const gap = Buffer.concat(Array.from({ length: PAUSE_FRAMES }, () => silenceLike(parts[0])));
  const joined = Buffer.concat(parts.flatMap((p, i) => (i === 0 ? [p] : [gap, p])));
  writeFileSync(path.join(AUDIO_DIR, `${id}${TWO_VOICE_SUFFIX}.mp3`), joined);
  console.log(`  wrote ${id}${TWO_VOICE_SUFFIX}.mp3 (${(joined.length / 1024).toFixed(0)} KB, ${turns.length} turns, ${chars} new chars billed)`);
  return chars;
}

async function main() {
  const force = process.argv.includes("--force");
  const checkOnly = process.argv.includes("--check");
  const onlyArg = process.argv.find(a => a.startsWith("--only="));
  const only = onlyArg ? new Set(onlyArg.slice("--only=".length).split(",").map(s => s.trim()).filter(Boolean)) : null;
  if (only) for (const id of only) if (!(id in REAL_WORLD_READINGS)) throw new Error(`--only: unknown reading "${id}"`);
  const allEntries = Object.entries(REAL_WORLD_READINGS).filter(([id]) => !only || only.has(id));
  const entries = force ? allEntries : allEntries.filter(([, r]) => !isDone(r));
  // Fail before any credits are spent if a conversation's turns don't match its on-screen text.
  entries.forEach(([id, r]) => { if (r.dialogue) turnsFor(id, r); });
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
      if (r.dialogue) await generateDialogue(id, r, apiKey);
      else await generateOne(id, text, voiceId, apiKey);
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
