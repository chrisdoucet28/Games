import type { ReactNode } from "react";
import { SITE, lessonPath } from "../../lib/seo";
import { Icon } from "./Icon";

// Small "back to ClassCade" footer for a printed Learn handout: the same joystick + Class/Cade
// wordmark as the app's own header, inked dark enough to read on a black-and-white printer (the
// on-screen gold #FCD34D all but vanishes on white paper). The URL is the same canonical lesson URL
// the SEO prerender bakes into that lesson's page (see lib/seo.ts).
function Footer({ topicId }: { topicId: string }) {
  const url = `${SITE}${lessonPath(topicId)}`;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px", borderTop: "1px solid #9CA3AF", paddingTop: "6px", marginTop: "8px", color: "#374151", fontSize: "9.5px", lineHeight: 1.35 }}>
      <div style={{ display: "inline-flex", alignItems: "center", gap: "5px", flexShrink: 0 }}>
        <Icon name="joystick" size={17} color="#B45309" />
        <span style={{ fontSize: "14px", fontWeight: "900", color: "#111827", letterSpacing: "-0.01em" }}>
          Class<span style={{ color: "#B45309" }}>Cade</span>
        </span>
      </div>
      <div style={{ borderLeft: "1px solid #D1D5DB", paddingLeft: "10px" }}>
        <div style={{ fontWeight: "700", color: "#111827" }}>Play free classroom games for this topic at playclasscade.com</div>
        <div>{url.replace(/^https:\/\//, "")}</div>
      </div>
    </div>
  );
}

// Wraps one printed handout in a single-cell table whose <tfoot> holds the footer: browsers repeat
// a table footer at the bottom of every printed page the table spans, so a lesson that spills onto
// a second sheet gets the footer there too — and each handout in a multi-lesson print keeps its
// own topic's URL (a position:fixed footer would print one URL on every page).
export function WithHandoutFooter({ topicId, children }: { topicId: string; children: ReactNode }) {
  return (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <tbody>
        <tr><td style={{ padding: 0 }}>{children}</td></tr>
      </tbody>
      <tfoot>
        <tr><td style={{ padding: 0 }}><Footer topicId={topicId} /></td></tr>
      </tfoot>
    </table>
  );
}
