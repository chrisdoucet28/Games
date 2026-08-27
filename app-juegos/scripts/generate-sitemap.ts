// Regenerates public/sitemap.xml from the app's own topic data so it can never drift from the
// real set of public /learn/<id> pages — run automatically as a `prebuild` npm lifecycle hook
// (see package.json), not a manual step, since the site's owner is a non-developer teacher.
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { LESSON_TOPICS } from "../src/data/learnTopics.ts";

const SITE = "https://playclasscade.com";

const STATIC_URLS: { loc: string; changefreq: string; priority: string }[] = [
  { loc: "/", changefreq: "weekly", priority: "1.0" },
  { loc: "/learn", changefreq: "weekly", priority: "0.8" },
  { loc: "/privacy", changefreq: "yearly", priority: "0.3" },
  { loc: "/terms", changefreq: "yearly", priority: "0.3" },
];

const lessonUrls = LESSON_TOPICS.map(t => ({ loc: `/learn/${t.id}`, changefreq: "monthly", priority: "0.6" }));

const urls = [...STATIC_URLS, ...lessonUrls];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>\n    <loc>${SITE}${u.loc}</loc>\n    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`).join("\n")}
</urlset>
`;

const outPath = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "public", "sitemap.xml");
writeFileSync(outPath, xml);
console.log(`Wrote ${urls.length} URLs to ${outPath}`);
