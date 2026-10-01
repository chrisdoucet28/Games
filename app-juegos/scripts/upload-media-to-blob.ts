// Uploads public/music/*.mp3 and public/audio/real-world/*.mp3 to Vercel Blob storage and prints
// a pathname -> public URL mapping. Run this once whenever a new music/narration file is added,
// then update the corresponding source (src/lib/music.ts or src/data/realWorldReadings.ts) with
// the printed URL instead of committing the file under public/ -- every deployment used to ship a
// full copy of these files (~100MB combined), which is what was driving Vercel's per-project
// deployment storage quota up on every single push. Reads BLOB_READ_WRITE_TOKEN from the
// environment (populate via `vercel env pull` after `vercel link`, same as any other Vercel-CLI-
// managed project secret).
import { readdirSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { put } from "@vercel/blob";

const PUBLIC_DIR = path.resolve(import.meta.dirname, "../public");

const TARGETS = [
  { dir: "music", blobPrefix: "music" },
  { dir: "audio/real-world", blobPrefix: "audio/real-world" },
];

async function main() {
  const mapping: Record<string, string> = {};

  for (const { dir, blobPrefix } of TARGETS) {
    const fullDir = path.join(PUBLIC_DIR, dir);
    const files = readdirSync(fullDir).filter(f => f.endsWith(".mp3"));
    for (const file of files) {
      const filePath = path.join(fullDir, file);
      const body = await readFile(filePath);
      const pathname = `${blobPrefix}/${file}`;
      const { url } = await put(pathname, body, {
        access: "public",
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: "audio/mpeg",
        cacheControlMaxAge: 31536000,
      });
      mapping[`/${dir}/${file}`] = url;
      console.log(`${pathname} -> ${url}`);
    }
  }

  console.log("\n=== JSON mapping (old local path -> blob URL) ===");
  console.log(JSON.stringify(mapping, null, 2));
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
