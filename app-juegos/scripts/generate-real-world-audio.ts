// One-off batch script: generates any Lesson Plans "Real-World Reading" audio clip that doesn't
// already exist at public/audio/real-world/, via the ElevenLabs text-to-speech API. Not run
// automatically (no npm lifecycle hook) — costs API quota, so run manually only when adding new
// real-world-reading content:
//   npx tsx scripts/generate-real-world-audio.ts
// Pass --force to regenerate every clip instead (e.g. after changing a voice), even ones that
// already exist — otherwise existing clips are left untouched, so it's safe to re-run repeatedly
// as more topics get authored, or after switching to a different ELEVENLABS_API_KEY (e.g. a
// second account) partway through a big batch, without re-spending quota on what's already done.
// Needs an ELEVENLABS_API_KEY in app-juegos/.env (git-ignored, never commit it).
import { readFileSync, writeFileSync, existsSync, unlinkSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { REAL_WORLD_READINGS } from "../src/data/realWorldReadings.ts";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const AUDIO_DIR = path.join(ROOT, "public", "audio", "real-world");

const FEMALE_VOICE = "XrExE9yKIg1WjnnlVkGX";
const MALE_VOICE = "CwhRBWXzGAHq8TQ4Fs17";

// Topics with an explicit named first-person narrator whose gender the voice must match — kept as
// an explicit override (not left to whatever the alternation below would produce), so this stays
// correct even if topics get reordered or new ones inserted before these. Add a topic id here if a
// future reading gets its own named first-person narrator too.
const LOCKED_VOICE: Record<string, string> = {
  present_simple: FEMALE_VOICE, // "Hi, I'm Sofia!"
  what_do_you_do: MALE_VOICE,   // "Hi, I'm Carlos."
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
  const apiKey = loadApiKey();
  const allEntries = Object.entries(REAL_WORLD_READINGS);
  const entries = force ? allEntries : allEntries.filter(([id]) => !existsSync(path.join(AUDIO_DIR, `${id}.mp3`)));
  const skipped = allEntries.length - entries.length;
  console.log(`Generating ${entries.length} clip(s)${skipped ? ` (skipping ${skipped} already present)` : ""}...`);

  const voiceAssignment = buildVoiceAssignment(Object.keys(REAL_WORLD_READINGS));
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

  // Clean up any stale file (e.g. a topic renamed/removed since the last run) — only on a full run.
  if (force || skipped === 0) {
    const validNames = new Set(Object.keys(REAL_WORLD_READINGS).map(id => `${id}.mp3`));
    for (const file of readdirSync(AUDIO_DIR)) {
      if (!validNames.has(file)) unlinkSync(path.join(AUDIO_DIR, file));
    }
  }

  console.log("Done.");
}

main().catch(err => {
  console.error(err.message ?? err);
  process.exit(1);
});
