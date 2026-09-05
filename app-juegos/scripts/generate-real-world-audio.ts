// One-off batch script: (re)generates every Lesson Plans "Real-World Reading" audio clip via the
// ElevenLabs text-to-speech API, replacing whatever's currently at public/audio/real-world/. Not
// run automatically (no npm lifecycle hook) — costs API quota, so run manually only when adding
// or editing real-world-reading content:
//   npx tsx scripts/generate-real-world-audio.ts
// Needs an ELEVENLABS_API_KEY in app-juegos/.env (git-ignored, never commit it).
import { readFileSync, writeFileSync, existsSync, unlinkSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { REAL_WORLD_READINGS } from "../src/data/realWorldReadings.ts";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const AUDIO_DIR = path.join(ROOT, "public", "audio", "real-world");

// One consistent narrator voice for every reading, except the two topics with an explicit named
// first-person narrator (present_simple = "Hi, I'm Sofia!", what_do_you_do = "Hi, I'm Carlos."),
// which get a gender-matched voice instead so the narrator's voice never contradicts the name in
// the text. Add a topic id here if a future reading gets its own named first-person narrator too.
const FEMALE_VOICE = "XrExE9yKIg1WjnnlVkGX";
const MALE_VOICE = "CwhRBWXzGAHq8TQ4Fs17";
const DEFAULT_VOICE = FEMALE_VOICE;
const VOICE_OVERRIDES: Record<string, string> = {
  present_simple: FEMALE_VOICE,
  what_do_you_do: MALE_VOICE,
};

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
  const apiKey = loadApiKey();
  const entries = Object.entries(REAL_WORLD_READINGS);
  console.log(`Generating ${entries.length} clips...`);
  for (const [id, r] of entries) {
    const voiceId = VOICE_OVERRIDES[id] ?? DEFAULT_VOICE;
    const text = r.passage.join(" ... ");
    await generateOne(id, text, voiceId, apiKey);
    await new Promise(res => setTimeout(res, 250));
  }

  // Clean up any stale file (e.g. an old placeholder, or a topic renamed/removed since the last run).
  const validNames = new Set(Object.keys(REAL_WORLD_READINGS).map(id => `${id}.mp3`));
  for (const file of readdirSync(AUDIO_DIR)) {
    if (!validNames.has(file)) unlinkSync(path.join(AUDIO_DIR, file));
  }

  console.log("Done.");
}

main().catch(err => {
  console.error(err.message ?? err);
  process.exit(1);
});
