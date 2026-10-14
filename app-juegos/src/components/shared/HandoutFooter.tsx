import type { ReactNode } from "react";
// Already in the main bundle via PhoneJoinPanel, so the QR adds no real weight here.
import { QRCodeSVG } from "qrcode.react";
import { SITE, lessonPath } from "../../lib/seo";

// Small black-and-white "back to ClassCade" footer for a printed Learn handout. The URL is the
// same canonical lesson URL the SEO prerender bakes into that lesson's page (see lib/seo.ts).
function Footer({ topicId }: { topicId: string }) {
  const url = `${SITE}${lessonPath(topicId)}`;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px", borderTop: "1px solid #9CA3AF", paddingTop: "5px", marginTop: "8px", color: "#374151", fontSize: "9.5px", lineHeight: 1.35 }}>
      <QRCodeSVG value={url} size={40} level="L" marginSize={0} fgColor="#000000" bgColor="#FFFFFF" style={{ flexShrink: 0 }} />
      <div>
        <div style={{ fontWeight: "800", color: "#111827" }}>Play free classroom games for this topic at playclasscade.com</div>
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
