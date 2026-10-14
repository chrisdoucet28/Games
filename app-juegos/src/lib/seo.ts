// One source of truth for every public page's search-facing text (title, description, H1, JSON-LD).
// Pure functions with no DOM access on purpose: scripts/prerender.ts imports this at build time to
// bake each page's real <head> into static HTML, and the React screens import the SAME functions
// at runtime — so the HTML Google fetches and the page a visitor sees can never drift apart.
import { GAME_MODES } from "../data/constants";
import type { LearnTopic } from "../data/learnTopics";

export const SITE = "https://www.playclasscade.com";

// A focus-specific label that reads the way a teacher would actually search for it.
const KIND_BY_FOCUS: Record<string, string> = {
  grammar: "Grammar",
  vocabulary: "Vocabulary",
  theme: "Discussion",
};
export const kindForFocus = (focus: string | null | undefined): string => KIND_BY_FOCUS[focus ?? "grammar"] ?? "Grammar";

// Cuts on a word boundary and adds an ellipsis only when something was actually removed.
export function trimTo(text: string, max: number): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[\s,;:.\-—]+$/, "")}…`;
}

export const HOME_TITLE = "ClassCade — Free ESL Classroom Games & Grammar Lessons (A1-C1)";
export const HOME_H1 = "Free Classroom ESL Games for English Teachers";
export const homeDescription = () =>
  `Free classroom ESL games for English teachers: ${GAME_MODES.length} competitive team games for grammar, vocabulary and themes (A1-C1), with a free lesson for every topic. No prep.`;

export const LEARN_TITLE = "Free ESL Lessons: Grammar, Vocabulary & Themes (A1-C1) | ClassCade";
export const LEARN_H1 = "Free ESL Lessons: Grammar, Vocabulary & Themes";
export const LEARN_DESCRIPTION =
  "Free ESL lessons covering grammar, vocabulary, and themes from A1 to C1 — clear explanations, examples and common mistakes, the same topics used in ClassCade's classroom games.";

export const PRACTICE_TITLE = "Free English Practice Quiz — Grammar & Vocabulary Self-Check | ClassCade";
export const PRACTICE_DESCRIPTION =
  "Practice English grammar and vocabulary on your own with an instant self-check quiz — no account needed, works great on your phone.";

export const ABOUT_TITLE = "Our Story — Why a Teacher Built ClassCade";
export const ABOUT_DESCRIPTION =
  "Why a teacher built ClassCade: the story behind the games, from classrooms in Korea to ESL classrooms everywhere.";

// The brand suffix is the first thing Google cuts, so on a long lesson name it's dropped outright
// rather than leaving a title that ends mid-word.
export function lessonTitle(t: LearnTopic): string {
  const core = `${t.lesson.title} — ${t.meta.level} ESL ${kindForFocus(t.meta.focus)} Lesson`;
  return core.length + 12 > 70 ? core : `${core} | ClassCade`;
}

// "Free A2 ESL grammar lesson: <intro>" — the intro fills whatever room is left under ~155 chars,
// so every lesson page gets a genuinely different description rather than a shared template.
export function lessonDescription(t: LearnTopic): string {
  const prefix = `Free ${t.meta.level} ESL ${kindForFocus(t.meta.focus).toLowerCase()} lesson: `;
  return `${prefix}${trimTo(t.lesson.intro, 155 - prefix.length)}`;
}

export const lessonPath = (id: string) => `/learn/${id}`;

type JsonLd = Record<string, unknown>;

const org = { "@type": "Organization", name: "ClassCade", url: SITE };

const breadcrumbs = (items: { name: string; path: string }[]): JsonLd => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: `${SITE}${it.path}` })),
});

// Free today and always (a free tier stays after any paid plan launches), so price "0" stays true.
export function homeJsonLd(): JsonLd[] {
  return [
    { "@context": "https://schema.org", "@type": "WebSite", name: "ClassCade", url: SITE },
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "ClassCade",
      url: SITE,
      description: homeDescription(),
      applicationCategory: "EducationalApplication",
      operatingSystem: "Web",
      inLanguage: "en",
      audience: { "@type": "EducationalAudience", educationalRole: "teacher" },
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    },
  ];
}

export function learnIndexJsonLd(): JsonLd[] {
  return [
    breadcrumbs([{ name: "Home", path: "/" }, { name: "Learn", path: "/learn" }]),
    { "@context": "https://schema.org", "@type": "CollectionPage", name: LEARN_H1, description: LEARN_DESCRIPTION, url: `${SITE}/learn`, isPartOf: { "@type": "WebSite", name: "ClassCade", url: SITE } },
  ];
}

export function lessonJsonLd(t: LearnTopic): JsonLd[] {
  const url = `${SITE}${lessonPath(t.id)}`;
  return [
    breadcrumbs([{ name: "Home", path: "/" }, { name: "Learn", path: "/learn" }, { name: t.lesson.title, path: lessonPath(t.id) }]),
    {
      "@context": "https://schema.org",
      "@type": "LearningResource",
      name: t.lesson.title,
      description: lessonDescription(t),
      url,
      inLanguage: "en",
      learningResourceType: "Lesson",
      educationalLevel: t.meta.level,
      teaches: t.lesson.title,
      isAccessibleForFree: true,
      provider: org,
      audience: { "@type": "EducationalAudience", educationalRole: "student" },
    },
  ];
}
