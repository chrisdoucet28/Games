import { hexToRgba, type Theme } from "../../data/themes";
import { renderBold, renderMistake } from "../../data/learnTopicsRender";
import type { Lesson, LessonSection } from "../../data/lessons";

// The on-screen rendering of one Lesson's content (title/intro/rule sections/common mistakes) —
// extracted out of LearnScreen.tsx so both LearnScreen and LessonPlanScreen render a topic's
// content identically and can never drift apart. LessonSectionBlock and CommonMistakesBlock below
// are exported separately so LessonPlanScreen's slideshow can lay out one section per slide (split
// by the same blue headers this component renders inline) instead of one long scrolling card. The
// print-specific rendering (PrintableLesson in LearnScreen.tsx) stays separate — it's deliberately
// plainer/ink-economical, a different design goal from this on-screen card.
export function LessonSectionBlock({ section, theme }: { section: LessonSection; theme: Theme }) {
  return (
    <div>
      <div style={{ fontWeight: "800", color: theme.accentSolid, fontSize: "14px", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.04em" }}>{section.heading}</div>
      <ul style={{ margin: 0, paddingLeft: "20px", color: "#374151" }}>
        {section.body.map((line, j) => (
          <li key={j} style={{ marginBottom: "6px", lineHeight: 1.55, fontSize: "14px" }}>{renderBold(line)}</li>
        ))}
      </ul>

      {section.examples && section.examples.length > 0 && (
        <div style={{ background: hexToRgba(theme.accentSolid, 0.06), borderLeft: `3px solid ${theme.accentSolid}`, borderRadius: "0 8px 8px 0", padding: "10px 14px", marginTop: "10px" }}>
          {section.examples.map((ex, j) => (
            <div key={j} style={{ fontSize: "13.5px", fontStyle: "italic", color: "#374151", lineHeight: 1.6, marginBottom: j < section.examples!.length - 1 ? "5px" : 0 }}>
              {renderBold(ex)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function CommonMistakesBlock({ commonMistakes }: { commonMistakes: string[] }) {
  if (commonMistakes.length === 0) return null;
  return (
    <div style={{ background: "#FFF7ED", border: "2px solid #FDBA74", borderRadius: "12px", padding: "14px 16px" }}>
      <div style={{ fontWeight: "800", color: "#9A3412", fontSize: "13px", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.04em" }}>Common mistakes</div>
      {commonMistakes.map((m, i) => (
        <div key={i} style={{ fontSize: "13px", color: "#7C2D12", marginBottom: i < commonMistakes.length - 1 ? "6px" : 0, lineHeight: 1.5 }}>{renderMistake(m)}</div>
      ))}
    </div>
  );
}

export function LessonContent({ lesson, theme, levelBadge }: { lesson: Lesson; theme: Theme; levelBadge?: React.ReactNode }) {
  return (
    <div style={{ background: "white", border: `2px solid ${hexToRgba(theme.accentSolid, 0.25)}`, borderRadius: "16px", padding: "24px" }}>
      {levelBadge}
      <h2 style={{ fontSize: "26px", fontWeight: "900", color: theme.heroBg[0], margin: "10px 0 8px", fontFamily: theme.headingFont }}>{lesson.title}</h2>
      <p style={{ color: "#4B5563", fontSize: "15px", lineHeight: 1.6, margin: "0 0 20px" }}>{lesson.intro}</p>

      {lesson.sections.map((section, i) => (
        <div key={i} style={{ marginBottom: "18px" }}>
          <LessonSectionBlock section={section} theme={theme} />
        </div>
      ))}

      <CommonMistakesBlock commonMistakes={lesson.commonMistakes} />
    </div>
  );
}
