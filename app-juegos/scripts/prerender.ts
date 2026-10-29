// Runs automatically after `vite build` (see package.json's "build" script). ClassCade is a
// client-rendered React app, so without this every URL — all 145 public ones — answered Google's
// first fetch with the SAME empty shell: homepage title, `canonical` pointing at the homepage, no
// heading, an empty <div id="root">. Google treated them as duplicates of the homepage and never
// got around to indexing them ("Discovered - currently not indexed" in Search Console).
//
// This writes a real static HTML file for each public route into dist/, built from the app's own
// lesson data: its own <title>, description, canonical, share-card tags, JSON-LD, an <h1>, the
// lesson's actual text, and plain <a href> links to related lessons — all readable without running
// any JavaScript. The React app still boots on top and replaces the static content exactly as before
// (main.tsx uses createRoot, which clears #root), so nothing a visitor sees changes.
//
// Vercel serves a real file before it applies its catch-all rewrite to "/", so these win over the
// SPA fallback automatically. Not run for the GitHub Pages build (VITE_BASE_PATH set): that build
// uses relative asset URLs, which would break one level down inside nested pages like /learn/<id>/.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { LESSON_TOPICS, LEVEL_ORDER, FOCUS_ORDER, FOCUS_LABEL, type LearnTopic } from "../src/data/learnTopics.ts";
import { GAME_MODES } from "../src/data/constants.ts";
import {
  SITE, HOME_TITLE, HOME_H1, homeDescription, homeJsonLd,
  LEARN_TITLE, LEARN_H1, LEARN_DESCRIPTION, learnIndexJsonLd,
  PRACTICE_TITLE, PRACTICE_DESCRIPTION, ABOUT_TITLE, ABOUT_DESCRIPTION,
  lessonTitle, lessonDescription, lessonJsonLd, lessonPath, kindForFocus,
} from "../src/lib/seo.ts";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIST = path.join(ROOT, "dist");

const base = process.env.VITE_BASE_PATH;
if (base && base !== "/") {
  console.log(`prerender: skipped (VITE_BASE_PATH=${base} — relative-asset build, nested static pages would break)`);
  process.exit(0);
}
if (!existsSync(path.join(DIST, "index.html"))) throw new Error("prerender: dist/index.html not found — run after `vite build`");

const template = readFileSync(path.join(DIST, "index.html"), "utf8");

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
// Lesson text marks bold as **word**; turn that into <strong> after escaping everything else.
const withBold = (s: string) => esc(s).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");

// Replaces exactly one occurrence, and fails the build loudly if the tag isn't there — so a future
// edit to index.html can never silently ship pages that kept the homepage's tags.
// `replacement` is inserted literally (a function, so "$1"-style tokens in lesson text can never be
// misread as capture groups); pass a function of the match when the original's text must be kept.
function swap(html: string, re: RegExp, replacement: string | ((match: string, ...groups: string[]) => string), what: string): string {
  if (!re.test(html)) throw new Error(`prerender: could not find ${what} in dist/index.html`);
  return html.replace(re, typeof replacement === "function" ? replacement : () => replacement);
}

type Page = { route: string; title: string; description: string; h1?: string; body: string; jsonLd: object[] };

function buildHtml(p: Page): string {
  const url = `${SITE}${p.route === "/" ? "/" : p.route}`;
  let html = template;
  // [^<]* (not a lazy match): index.html has the text "<title>" inside an HTML comment, and a lazy
  // match would start there and swallow every tag up to the real </title>.
  html = swap(html, /<title>[^<]*<\/title>/, `<title>${esc(p.title)}</title>`, "<title>");
  html = swap(html, /<meta name="description" content="[^"]*"\s*\/?>/, `<meta name="description" content="${esc(p.description)}" />`, "meta description");
  html = swap(html, /<link rel="canonical" href="[^"]*"\s*\/?>/, `<link rel="canonical" href="${url}" />`, "canonical");
  html = swap(html, /<meta property="og:title" content="[^"]*"\s*\/?>/, `<meta property="og:title" content="${esc(p.title)}" />`, "og:title");
  html = swap(html, /<meta property="og:description" content="[^"]*"\s*\/?>/, `<meta property="og:description" content="${esc(p.description)}" />`, "og:description");
  html = swap(html, /<meta property="og:url" content="[^"]*"\s*\/?>/, `<meta property="og:url" content="${url}" />`, "og:url");
  html = swap(html, /<meta name="twitter:title" content="[^"]*"\s*\/?>/, `<meta name="twitter:title" content="${esc(p.title)}" />`, "twitter:title");
  html = swap(html, /<meta name="twitter:description" content="[^"]*"\s*\/?>/, `<meta name="twitter:description" content="${esc(p.description)}" />`, "twitter:description");
  const ld = p.jsonLd.map(o => `    <script type="application/ld+json">${JSON.stringify(o).replace(/</g, "\\u003c")}</script>`).join("\n");
  html = swap(html, /<\/head>/, `${HIDE_FOR_JS}\n${ld}\n  </head>`, "</head>");
  // Keep the root's own attributes (translate="no" class="notranslate" — the Chrome-translate crash fix).
  html = swap(html, /<div id="root"([^>]*)><\/div>/, (_m, attrs) => `<div id="root"${attrs}>${p.body}</div>`, '<div id="root">');
  return html;
}

// Visitors never see the static copy: this runs in <head>, before #root is parsed, so any browser
// running JavaScript hides it and shows the plain page background until React replaces it (without
// this it flashed for a split second — "17 competitive team games" + a bullet list — on every full
// page load). It stays in the HTML source for crawlers, and still shows if JavaScript is off.
const HIDE_FOR_JS = `    <script>document.documentElement.classList.add("cc-js")</script>
    <style>.cc-js [data-prerender]{display:none}</style>`;

// Plain, readable styling — only visible with JavaScript off (see HIDE_FOR_JS).
const WRAP = `font-family:'Segoe UI',system-ui,sans-serif;max-width:780px;margin:0 auto;padding:24px 16px;line-height:1.65;color:#0C1E3D;background:#F0F9FF;min-height:100vh`;
const wrap = (inner: string) => `<main data-prerender style="${WRAP}">${inner}</main>`;
const crumbs = (items: { name: string; href?: string }[]) =>
  `<nav aria-label="Breadcrumb" style="font-size:14px;margin-bottom:12px">${items.map(i => (i.href ? `<a href="${i.href}">${esc(i.name)}</a>` : esc(i.name))).join(" › ")}</nav>`;

const byLevelFocus = (level: string | null, focus: string | null) =>
  LESSON_TOPICS.filter(t => t.meta.level === level && (t.meta.focus ?? "grammar") === (focus ?? "grammar"));

function lessonBody(t: LearnTopic): string {
  const l = t.lesson;
  const related = byLevelFocus(t.meta.level, t.meta.focus).filter(x => x.id !== t.id).slice(0, 8);
  const sections = l.sections.map(s => `
    <h2>${esc(s.heading)}</h2>
    <ul>${s.body.map(b => `<li>${withBold(b)}</li>`).join("")}</ul>
    ${s.examples?.length ? `<p><strong>Examples:</strong></p><ul>${s.examples.map(e => `<li>${withBold(e)}</li>`).join("")}</ul>` : ""}`).join("");
  return wrap(`
    ${crumbs([{ name: "ClassCade", href: "/" }, { name: "Learn", href: "/learn" }, { name: l.title }])}
    <h1>${esc(l.title)}</h1>
    <p><strong>${esc(t.meta.level ?? "")}</strong> · ESL ${esc(kindForFocus(t.meta.focus))} lesson</p>
    <p>${esc(l.intro)}</p>
    ${sections}
    ${l.commonMistakes.length ? `<h2>Common mistakes</h2><ul>${l.commonMistakes.map(m => `<li>${esc(m)}</li>`).join("")}</ul>` : ""}
    <p><strong>Practice this with a classroom game.</strong> ClassCade turns this exact lesson into a competitive team game. Free to start. <a href="/">Sign up free</a></p>
    ${related.length ? `<h2>More ${esc(t.meta.level ?? "")} ${esc(kindForFocus(t.meta.focus).toLowerCase())} lessons</h2><ul>${related.map(r => `<li><a href="${lessonPath(r.id)}">${esc(r.lesson.title)}</a></li>`).join("")}</ul>` : ""}
    <p><a href="/learn">Browse all free ESL lessons</a></p>`);
}

function learnIndexBody(): string {
  const groups = LEVEL_ORDER.map(level => {
    const focuses = FOCUS_ORDER.map(focus => {
      const items = byLevelFocus(level, focus);
      return items.length
        ? `<h3>${esc(FOCUS_LABEL[focus])}</h3><ul>${items.map(t => `<li><a href="${lessonPath(t.id)}">${esc(t.lesson.title)}</a></li>`).join("")}</ul>`
        : "";
    }).join("");
    return focuses ? `<h2>${esc(level)} lessons</h2>${focuses}` : "";
  }).join("");
  return wrap(`
    ${crumbs([{ name: "ClassCade", href: "/" }, { name: "Learn" }])}
    <h1>${esc(LEARN_H1)}</h1>
    <p>${esc(LEARN_DESCRIPTION)} ${LESSON_TOPICS.length} free lessons, from A1 beginner to C1 advanced.</p>
    ${groups}`);
}

function homeBody(): string {
  return wrap(`
    <p style="font-weight:900;font-size:22px">ClassCade</p>
    <h1>${esc(HOME_H1)}</h1>
    <p>${esc(homeDescription())}</p>
    <h2>${GAME_MODES.length} competitive team games</h2>
    <ul>${GAME_MODES.map(g => `<li><strong>${esc(g.name)}</strong> — ${esc(g.desc)}</li>`).join("")}</ul>
    <h2>Free lessons and practice</h2>
    <p><a href="/learn">Browse ${LESSON_TOPICS.length} free ESL lessons (A1–C1)</a> · <a href="/practice">Try the free practice quiz</a> · <a href="/about">Our story</a></p>`);
}

const simple = (description: string, h1: string) =>
  wrap(`${crumbs([{ name: "ClassCade", href: "/" }, { name: h1 }])}<h1>${esc(h1)}</h1><p>${esc(description)}</p><p><a href="/">Go to ClassCade</a></p>`);

const pages: Page[] = [
  { route: "/", title: HOME_TITLE, description: homeDescription(), body: homeBody(), jsonLd: homeJsonLd() },
  { route: "/learn", title: LEARN_TITLE, description: LEARN_DESCRIPTION, body: learnIndexBody(), jsonLd: learnIndexJsonLd() },
  { route: "/practice", title: PRACTICE_TITLE, description: PRACTICE_DESCRIPTION, body: simple(PRACTICE_DESCRIPTION, "Free English Practice Quiz"), jsonLd: [] },
  { route: "/about", title: ABOUT_TITLE, description: ABOUT_DESCRIPTION, body: simple(ABOUT_DESCRIPTION, "Our Story"), jsonLd: [] },
  { route: "/privacy", title: "Privacy Policy - ClassCade", description: "The privacy policy for ClassCade, the free classroom game website for English teachers: what data is collected and how it is used.", body: simple("The privacy policy for ClassCade, the free classroom game website for English teachers.", "Privacy Policy"), jsonLd: [] },
  { route: "/terms", title: "Terms of Service - ClassCade", description: "The terms of service for using ClassCade, the free classroom game website for English teachers.", body: simple("The terms of service for using ClassCade, the free classroom game website for English teachers.", "Terms of Service"), jsonLd: [] },
  ...LESSON_TOPICS.map<Page>(t => ({
    route: lessonPath(t.id), title: lessonTitle(t), description: lessonDescription(t), body: lessonBody(t), jsonLd: lessonJsonLd(t),
  })),
];

// Guard against the exact failure this script exists to prevent: two pages sharing a title/description.
const seenTitles = new Map<string, string>();
const seenDescs = new Map<string, string>();
for (const p of pages) {
  for (const [map, value, label] of [[seenTitles, p.title, "title"], [seenDescs, p.description, "description"]] as const) {
    const prev = map.get(value);
    if (prev) throw new Error(`prerender: duplicate ${label} on ${p.route} and ${prev}: "${value}"`);
    map.set(value, p.route);
  }
}

for (const p of pages) {
  const file = p.route === "/" ? path.join(DIST, "index.html") : path.join(DIST, p.route.replace(/^\//, ""), "index.html");
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, buildHtml(p));
}
console.log(`prerender: wrote ${pages.length} static pages (${LESSON_TOPICS.length} lessons) into dist/`);
