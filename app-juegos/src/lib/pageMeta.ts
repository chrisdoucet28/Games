// index.html ships one static <meta name="description"> for "/" only — every other public route
// needs its own per-page description at runtime, since this is a pure client-rendered SPA with no
// server-side templating. Same spirit as the document.title-per-screen pattern already used
// throughout (e.g. AuthScreen.tsx, TermsOfServiceScreen.tsx), just for the other <head> tag that
// matters for SEO.
export function setMetaDescription(content: string) {
  let tag = document.querySelector('meta[name="description"]');
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute("name", "description");
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
}
