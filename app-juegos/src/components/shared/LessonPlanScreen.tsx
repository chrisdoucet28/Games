import { useMemo, useState } from "react";
import { hexToRgba, type Theme } from "../../data/themes";
import { LESSON_TOPICS, LEVEL_ORDER, LEVEL_COLOR, FOCUS_ORDER, FOCUS_LABEL, type LearnTopic } from "../../data/learnTopics";
import { LESSON_PLANS, buildUnscrambleItems, type RoundOut, type UnscrambleItem } from "../../data/lessonPlans";
import { REAL_WORLD_READINGS, type RealWorldReading } from "../../data/realWorldReadings";
import { TOPIC_LIBRARY } from "../../data/topics";
import { LessonSectionBlock, CommonMistakesBlock } from "./LessonContent";
import { QuestionCard } from "./QuestionCard";
import { Icon, type IconName } from "./Icon";
import type { QuestionData } from "../../types";

type Props = {
  onBack: () => void;
  theme: Theme;
  // Set when arriving directly from a specific Learn lesson's "Start Lesson Plan" button — skips
  // the index and drops straight into that topic's slideshow.
  initialTopicId?: string | null;
  // Switches to the Learn screen (the "Learn" pill in the mode toggle below, shown on the index).
  onOpenLearn: () => void;
};

const PRINT_CSS = `
  @page { margin: 12mm 15mm; }
  @media print {
    .lp-no-print { display: none !important; }
    .lp-print-only { display: block !important; }
    .lp-print-bg { background: white !important; padding: 0 !important; }
  }
  .lp-print-only { display: none; }
`;

function sampleByType(questions: QuestionData[], type: string, count: number): QuestionData[] {
  const pool = questions.filter(q => q.type === type);
  return [...pool].sort(() => Math.random() - 0.5).slice(0, count);
}

export function LessonPlanScreen({ onBack, theme, initialTopicId, onOpenLearn }: Props) {
  const availableTopics = useMemo(() => LESSON_TOPICS.filter(t => LESSON_PLANS[t.id]), []);
  const [selectedId, setSelectedId] = useState<string | null>(initialTopicId ?? null);
  const selected = selectedId ? availableTopics.find(t => t.id === selectedId) : null;

  if (selected) {
    // Keyed on the topic id so picking a different topic from the index (rather than unmounting
    // the whole screen) still gets a fresh sampling of practice items and a reset slide position.
    return <LessonPlanSlideshow key={selected.id} topic={selected} theme={theme} onBack={() => setSelectedId(null)} />;
  }

  const byLevel = LEVEL_ORDER
    .map(level => ({ level, topics: availableTopics.filter(t => t.meta.level === level) }))
    .filter(g => g.topics.length > 0);

  return (
    <div style={{ minHeight: "100vh", background: "#F0F9FF", padding: "20px", fontFamily: "'Segoe UI',system-ui,sans-serif" }}>
      <div style={{ maxWidth: "720px", margin: "0 auto" }}>
        <button onClick={onBack} style={{ background: "none", border: `2px solid ${theme.accentSolid}`, color: theme.accentSolid, borderRadius: "10px", padding: "8px 16px", cursor: "pointer", fontWeight: "700", marginBottom: "20px", fontFamily: theme.headingFont, display: "inline-flex", alignItems: "center", gap: "6px" }}><Icon name="back" size={13} /> Back</button>

        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <h2 style={{ fontSize: "30px", fontWeight: "900", color: theme.heroBg[0], margin: 0, fontFamily: theme.headingFont, display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
            <Icon name="school" size={26} /> Lesson Plans
          </h2>
          <p style={{ color: "#6B7280", marginTop: "8px" }}>
            Traditional, ~30-minute class activities for one topic — presentation, practice, and production, no game pressure. Covers every level, A1 to C1.
          </p>
          <div style={{ display: "inline-flex", background: "white", border: `2px solid ${hexToRgba(theme.accentSolid, 0.25)}`, borderRadius: "999px", padding: "4px", marginTop: "14px" }}>
            <button
              onClick={onOpenLearn}
              style={{ background: "none", border: "none", color: theme.accentSolid, borderRadius: "999px", padding: "8px 18px", fontWeight: "800", fontSize: "13px", fontFamily: theme.headingFont, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px" }}
            >
              <Icon name="learn" size={14} /> Learn
            </button>
            <div style={{ background: theme.accentSolid, color: "white", borderRadius: "999px", padding: "8px 18px", fontWeight: "800", fontSize: "13px", fontFamily: theme.headingFont, display: "inline-flex", alignItems: "center", gap: "6px" }}>
              <Icon name="school" size={14} /> Lesson Plans
            </div>
          </div>
        </div>

        {availableTopics.length === 0 ? (
          <div style={{ textAlign: "center", color: "#6B7280", padding: "40px 0" }}>No lesson plans yet — check back soon.</div>
        ) : (
          byLevel.map(group => (
            <div key={group.level} style={{ marginBottom: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
                <span style={{ background: LEVEL_COLOR[group.level], color: "white", borderRadius: "999px", padding: "3px 12px", fontSize: "13px", fontWeight: "800" }}>{group.level}</span>
                <span style={{ color: "#9CA3AF", fontSize: "12px", fontWeight: "700" }}>{group.topics.length} lesson plan{group.topics.length === 1 ? "" : "s"}</span>
              </div>
              {FOCUS_ORDER.filter(focus => group.topics.some(t => (t.meta.focus ?? "grammar") === focus)).map(focus => (
                <div key={focus} style={{ marginBottom: "16px" }}>
                  <div style={{ color: "#6B7280", fontSize: "12px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "8px" }}>{FOCUS_LABEL[focus]}</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: "10px" }}>
                    {group.topics.filter(t => (t.meta.focus ?? "grammar") === focus).map(t => (
                      <button
                        key={t.id} onClick={() => setSelectedId(t.id)}
                        style={{ textAlign: "left", background: "white", border: `2px solid ${hexToRgba(theme.accentSolid, 0.25)}`, borderRadius: "12px", padding: "14px 16px", cursor: "pointer", fontFamily: "inherit" }}
                      >
                        <div style={{ fontWeight: "800", color: theme.heroBg[0], fontSize: "14px", fontFamily: theme.headingFont }}>{t.lesson.title}</div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// One flat slide per screen the class sees — built once from whatever's already in scope for this
// topic (existing lesson content + sampled question-bank items), plus the one authored round-out
// exercise. "question" slides reuse QuestionCard exactly as every game already does. "presentation"
// is split one slide per Lesson section — the same blue-header divisions the Learn page shows all
// at once on one scrolling card — so the explanation reads like the rest of the slideshow instead
// of a wall of text; "commonMistakes" is its own trailing slide, shown only when the lesson has
// any. "realWorld" is likewise shown only when REAL_WORLD_READINGS has an entry for this topic
// (currently the A1 pilot only) — its own comprehension-check questions ride the "question" kind
// exactly like Practice A/B/Production, tagged with sectionLabel "Real-World Check".
type Slide =
  | { kind: "intro" }
  | { kind: "presentation"; sectionIndex: number }
  | { kind: "commonMistakes" }
  | { kind: "question"; sectionLabel: string; sectionIcon: IconName; question: QuestionData; progress: string }
  | { kind: "roundOut" }
  | { kind: "realWorld"; reading: RealWorldReading }
  | { kind: "speaking"; tasks: string[] }
  | { kind: "done" };

function LessonPlanSlideshow({ topic, theme, onBack }: { topic: LearnTopic; theme: Theme; onBack: () => void }) {
  const topicData = TOPIC_LIBRARY[topic.id as keyof typeof TOPIC_LIBRARY] as { questions: QuestionData[]; cardTasks?: { task: string }[] };
  const roundOut = LESSON_PLANS[topic.id];

  const slides = useMemo<Slide[]>(() => {
    // Prefers "choose correct grammar" for the warm-up; falls back to "fill in the blank" for any
    // topic whose pool is thin on that type. Practice B then picks whichever of the two remaining
    // controlled-practice types actually has enough content, so the two steps never draw from the
    // same pool.
    const mcq = sampleByType(topicData.questions, "choose correct grammar", 6);
    const practiceA = mcq.length >= 4 ? { type: "choose correct grammar", icon: "options" as IconName, items: mcq }
      : { type: "fill in the blank", icon: "options" as IconName, items: sampleByType(topicData.questions, "fill in the blank", 6) };

    const practiceBCandidates = ["fill in the blank", "correct grammar mistakes"].filter(t => t !== practiceA.type);
    let practiceB = { type: practiceBCandidates[0], icon: "pencil" as IconName, items: sampleByType(topicData.questions, practiceBCandidates[0], 6) };
    if (practiceB.items.length < 4 && practiceBCandidates[1]) {
      const alt = sampleByType(topicData.questions, practiceBCandidates[1], 6);
      if (alt.length > practiceB.items.length) practiceB = { type: practiceBCandidates[1], icon: "pencil" as IconName, items: alt };
    }

    const production = sampleByType(topicData.questions, "use vocabulary in a sentence", 4);
    const speakingTasks = topicData.cardTasks?.length
      ? topicData.cardTasks.slice(0, 3).map(t => t.task)
      : sampleByType(topicData.questions, "speaking task", 3).map(q => q.question ?? "").filter(Boolean);

    const list: Slide[] = [{ kind: "intro" }];
    topic.lesson.sections.forEach((_, i) => list.push({ kind: "presentation", sectionIndex: i }));
    if (topic.lesson.commonMistakes.length > 0) list.push({ kind: "commonMistakes" });
    practiceA.items.forEach((q, i) => list.push({ kind: "question", sectionLabel: "Warm-Up Practice", sectionIcon: practiceA.icon, question: q, progress: `${i + 1}/${practiceA.items.length}` }));
    practiceB.items.forEach((q, i) => list.push({ kind: "question", sectionLabel: "More Practice", sectionIcon: practiceB.icon, question: q, progress: `${i + 1}/${practiceB.items.length}` }));
    list.push({ kind: "roundOut" });
    production.forEach((q, i) => list.push({ kind: "question", sectionLabel: "Your Turn", sectionIcon: "star", question: q, progress: `${i + 1}/${production.length}` }));
    const realWorld = REAL_WORLD_READINGS[topic.id];
    if (realWorld) {
      list.push({ kind: "realWorld", reading: realWorld });
      realWorld.questions.forEach((q, i) => list.push({ kind: "question", sectionLabel: "Real-World Check", sectionIcon: "books", question: q, progress: `${i + 1}/${realWorld.questions.length}` }));
    }
    if (speakingTasks.length) list.push({ kind: "speaking", tasks: speakingTasks });
    list.push({ kind: "done" });
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [slideIndex, setSlideIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const slide = slides[slideIndex];

  const goNext = () => { setSlideIndex(i => Math.min(i + 1, slides.length - 1)); setShowAnswer(false); };
  const goPrev = () => { if (slideIndex === 0) onBack(); else { setSlideIndex(i => i - 1); setShowAnswer(false); } };

  const cardStyle: React.CSSProperties = { background: "white", border: `2px solid ${hexToRgba(theme.accentSolid, 0.25)}`, borderRadius: "16px", padding: "24px", minHeight: "320px" };
  const nextBtnStyle: React.CSSProperties = { background: `linear-gradient(135deg,${theme.cta[0]},${theme.cta[1]})`, color: "white", border: "none", borderRadius: "12px", padding: "12px 28px", fontSize: "16px", fontWeight: "800", cursor: "pointer", fontFamily: theme.headingFont, display: "inline-flex", alignItems: "center", gap: "6px" };

  return (
    <div className="lp-print-bg" style={{ minHeight: "100vh", background: "#F0F9FF", padding: "20px", fontFamily: "'Segoe UI',system-ui,sans-serif" }}>
      <style>{PRINT_CSS}</style>
      <div style={{ maxWidth: "640px", margin: "0 auto" }}>
        <div className="lp-no-print" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
          <button onClick={goPrev} style={{ background: "none", border: `2px solid ${theme.accentSolid}`, color: theme.accentSolid, borderRadius: "10px", padding: "8px 14px", cursor: "pointer", fontWeight: "700", fontFamily: theme.headingFont, display: "inline-flex", alignItems: "center", gap: "6px" }}>
            <Icon name="back" size={13} /> {slideIndex === 0 ? "Back" : "Previous"}
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <span style={{ color: "#9CA3AF", fontSize: "12px", fontWeight: "700" }}>Step {slideIndex + 1} of {slides.length}</span>
            {/* Previous only steps back one slide at a time — with up to 20+ steps, leaving the
                lesson mid-way otherwise means clicking it that many times. Skips straight to the
                index regardless of progress; nothing here is saved, so there's nothing to lose. */}
            {slideIndex > 0 && (
              <button onClick={onBack} style={{ background: "none", border: "none", color: "#9CA3AF", cursor: "pointer", fontWeight: "700", fontFamily: theme.headingFont, fontSize: "12px", display: "inline-flex", alignItems: "center", gap: "4px", padding: 0 }}>
                <Icon name="close" size={11} /> Exit
              </button>
            )}
          </div>
        </div>

        <div className="lp-no-print" style={cardStyle}>
          {slide.kind === "intro" && (
            <div style={{ textAlign: "center" }}>
              <span style={{ background: LEVEL_COLOR[topic.meta.level ?? "A1"], color: "white", borderRadius: "999px", padding: "3px 12px", fontSize: "12px", fontWeight: "800" }}>{topic.meta.level}</span>
              <h2 style={{ fontSize: "26px", fontWeight: "900", color: theme.heroBg[0], margin: "12px 0 10px", fontFamily: theme.headingFont }}>{topic.lesson.title}</h2>
              <p style={{ color: "#6B7280", fontSize: "14px", marginBottom: "6px" }}><Icon name="hourglass" size={13} /> About 30 minutes</p>
              <p style={{ color: "#4B5563", fontSize: "15px", lineHeight: 1.6, maxWidth: "440px", margin: "0 auto" }}>
                A full presentation-practice-production lesson: the rule explained, controlled practice, one focused exercise, open production, and a speaking task to finish.
              </p>
            </div>
          )}

          {slide.kind === "presentation" && (() => {
            const sectionCount = topic.lesson.sections.length;
            return (
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", marginBottom: "14px", color: theme.accentSolid, fontWeight: "800", fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  <Icon name="bookOpen" size={14} /> Explanation {sectionCount > 1 && <span style={{ color: "#9CA3AF", fontWeight: "700" }}>· {slide.sectionIndex + 1}/{sectionCount}</span>}
                </div>
                {slide.sectionIndex === 0 && (
                  <>
                    <h2 style={{ fontSize: "22px", fontWeight: "900", color: theme.heroBg[0], margin: "0 0 8px", fontFamily: theme.headingFont }}>{topic.lesson.title}</h2>
                    <p style={{ color: "#4B5563", fontSize: "14px", lineHeight: 1.6, margin: "0 0 18px" }}>{topic.lesson.intro}</p>
                  </>
                )}
                <LessonSectionBlock section={topic.lesson.sections[slide.sectionIndex]} theme={theme} />
              </div>
            );
          })()}

          {slide.kind === "commonMistakes" && (
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", marginBottom: "14px", color: theme.accentSolid, fontWeight: "800", fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                <Icon name="warning" size={14} /> Explanation <span style={{ color: "#9CA3AF", fontWeight: "700" }}>· Common Mistakes</span>
              </div>
              <CommonMistakesBlock commonMistakes={topic.lesson.commonMistakes} />
            </div>
          )}

          {slide.kind === "question" && (
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", marginBottom: "14px", color: theme.accentSolid, fontWeight: "800", fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                <Icon name={slide.sectionIcon} size={14} /> {slide.sectionLabel} <span style={{ color: "#9CA3AF", fontWeight: "700" }}>· {slide.progress}</span>
              </div>
              <QuestionCard question={slide.question} showAnswer={showAnswer} onReveal={() => setShowAnswer(true)} gameId="lessonplan" />
            </div>
          )}

          {slide.kind === "roundOut" && <RoundOutStep roundOut={roundOut} topicId={topic.id} theme={theme} onDone={goNext} />}

          {slide.kind === "realWorld" && (
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", marginBottom: "14px", color: theme.accentSolid, fontWeight: "800", fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                <Icon name="books" size={14} /> Real-World Reading
              </div>
              <div style={{ background: "#FFFBEB", border: "2px solid #FDE68A", borderRadius: "12px", padding: "16px 18px" }}>
                <h3 style={{ margin: "0 0 10px", fontSize: "16px", fontWeight: "800", color: "#92400E", fontFamily: theme.headingFont }}>{slide.reading.title}</h3>
                {slide.reading.audioUrl && (
                  <audio controls src={slide.reading.audioUrl} style={{ width: "100%", marginBottom: "12px" }} />
                )}
                {slide.reading.passage.map((p, i) => (
                  <p key={i} style={{ margin: "0 0 8px", fontSize: "14.5px", lineHeight: 1.6, color: "#78350F" }}>{p}</p>
                ))}
              </div>
            </div>
          )}

          {slide.kind === "speaking" && (
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", marginBottom: "14px", color: theme.accentSolid, fontWeight: "800", fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                <Icon name="mic" size={14} /> Speaking
              </div>
              <p style={{ textAlign: "center", color: "#6B7280", fontSize: "13px", marginBottom: "14px" }}>Open response — the student speaks, the teacher listens and judges.</p>
              {slide.tasks.map((t, i) => (
                <div key={i} style={{ background: "#FFFBEB", border: "2px solid #F59E0B", borderRadius: "12px", padding: "12px 16px", marginBottom: "10px", fontSize: "14px", color: "#92400E", fontWeight: "600" }}>{t}</div>
              ))}
            </div>
          )}

          {slide.kind === "done" && (
            <div style={{ textAlign: "center" }}>
              <div style={{ marginBottom: "10px" }}><Icon name="checkeredFlag" size={40} color={theme.accentSolid} /></div>
              <h2 style={{ fontSize: "22px", fontWeight: "900", color: theme.heroBg[0], marginBottom: "10px", fontFamily: theme.headingFont }}>Lesson complete!</h2>
              <p style={{ color: "#6B7280", fontSize: "14px", marginBottom: "20px" }}>Print this as a worksheet, or head back to try another topic.</p>
              <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
                <button onClick={() => window.print()} style={nextBtnStyle}><Icon name="printer" size={15} /> Print this lesson</button>
                <button onClick={onBack} style={{ background: "none", border: `2px solid ${theme.accentSolid}`, color: theme.accentSolid, borderRadius: "12px", padding: "12px 28px", fontSize: "16px", fontWeight: "800", cursor: "pointer", fontFamily: theme.headingFont }}>Back to Lesson Plans</button>
              </div>
            </div>
          )}
        </div>

        {slide.kind !== "done" && slide.kind !== "roundOut" && (
          <div className="lp-no-print" style={{ textAlign: "center", marginTop: "16px" }}>
            <button onClick={goNext} style={nextBtnStyle}><Icon name="next" size={15} /> {slideIndex === slides.length - 2 ? "Finish" : "Next"}</button>
          </div>
        )}

        <div className="lp-print-only">
          <PrintableLessonPlan topic={topic} slides={slides} roundOut={roundOut} />
        </div>
      </div>
    </div>
  );
}

// Shared style objects for every round-out sub-component below — a plain function, not a hook,
// since it's called from several different components that each need their own copy.
function roundOutStyles(theme: Theme) {
  const headerStyle: React.CSSProperties = { display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", marginBottom: "14px", color: theme.accentSolid, fontWeight: "800", fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.04em" };
  const nextBtnStyle: React.CSSProperties = { background: `linear-gradient(135deg,${theme.cta[0]},${theme.cta[1]})`, color: "white", border: "none", borderRadius: "12px", padding: "12px 28px", fontSize: "16px", fontWeight: "800", cursor: "pointer", fontFamily: theme.headingFont, display: "inline-flex", alignItems: "center", gap: "6px", marginTop: "16px" };
  const revealBtnStyle: React.CSSProperties = { background: theme.accentSolid, color: "white", border: "none", borderRadius: "12px", padding: "10px 22px", fontSize: "14px", fontWeight: "700", cursor: "pointer", marginTop: "8px" };
  return { headerStyle, nextBtnStyle, revealBtnStyle };
}

// The one step with its own internal interaction (multiple prompts/pairs/blanks), rendered per
// `roundOut.kind` — calls onDone() once the student's worked through it, advancing the outer slide.
// Dispatches to one fully separate component per kind (rather than branching with early returns in
// one function body) so each kind's hooks are called unconditionally — mixing different hook calls
// across branches of a single component body would break React's rules of hooks.
function RoundOutStep({ roundOut, topicId, theme, onDone }: { roundOut: RoundOut; topicId: string; theme: Theme; onDone: () => void }) {
  if (roundOut.kind === "paragraphCloze") return <ParagraphClozeRoundOut roundOut={roundOut} theme={theme} onDone={onDone} />;
  if (roundOut.kind === "matching") return <MatchingRoundOut roundOut={roundOut} theme={theme} onDone={onDone} />;
  if (roundOut.kind === "errorPassage") return <ErrorPassageRoundOut roundOut={roundOut} theme={theme} onDone={onDone} />;
  if (roundOut.kind === "scenario") return <ScenarioRoundOut roundOut={roundOut} theme={theme} onDone={onDone} />;
  return <UnscrambleRoundOut topicId={topicId} theme={theme} onDone={onDone} />;
}

function ParagraphClozeRoundOut({ roundOut, theme, onDone }: { roundOut: Extract<RoundOut, { kind: "paragraphCloze" }>; theme: Theme; onDone: () => void }) {
  const { headerStyle, nextBtnStyle } = roundOutStyles(theme);
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  let blankIdx = 0;
  return (
    <div>
      <div style={headerStyle}><Icon name="clipboard" size={14} /> Fill in the Story</div>
      <p style={{ textAlign: "center", color: "#6B7280", fontSize: "13px", marginBottom: "14px" }}>Click each gap to check your answer.</p>
      <p style={{ fontSize: "16px", lineHeight: 2, color: "#1F2937" }}>
        {roundOut.segments.map((seg, i) => {
          if (typeof seg === "string") return <span key={i}>{seg}</span>;
          const idx = blankIdx++;
          const isRevealed = revealed.has(idx);
          return (
            <button
              key={i}
              onClick={() => setRevealed(prev => new Set(prev).add(idx))}
              style={{
                display: "inline-block", margin: "0 2px", padding: "2px 10px", borderRadius: "8px", border: `2px solid ${theme.accentSolid}`, cursor: isRevealed ? "default" : "pointer",
                background: isRevealed ? "#ECFDF5" : "white", color: isRevealed ? "#14532D" : "#9CA3AF", fontWeight: "800", fontSize: "15px",
              }}
            >
              {isRevealed ? seg.blank : `___ (${seg.base})`}
            </button>
          );
        })}
      </p>
      <div style={{ textAlign: "center" }}><button onClick={onDone} style={nextBtnStyle}><Icon name="next" size={15} /> Continue</button></div>
    </div>
  );
}

function MatchingRoundOut({ roundOut, theme, onDone }: { roundOut: Extract<RoundOut, { kind: "matching" }>; theme: Theme; onDone: () => void }) {
  const { headerStyle, nextBtnStyle } = roundOutStyles(theme);
  const terms = useMemo(() => [...roundOut.pairs.map(p => p.term)].sort(() => Math.random() - 0.5), [roundOut]);
  const defs = useMemo(() => [...roundOut.pairs.map(p => p.definition)].sort(() => Math.random() - 0.5), [roundOut]);
  const [selectedTerm, setSelectedTerm] = useState<string | null>(null);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [wrong, setWrong] = useState<string | null>(null);
  const defFor = (term: string) => roundOut.pairs.find(p => p.term === term)?.definition;

  const tryMatch = (def: string) => {
    if (!selectedTerm) return;
    if (defFor(selectedTerm) === def) {
      setMatched(prev => new Set(prev).add(selectedTerm));
      setSelectedTerm(null);
    } else {
      setWrong(def);
      setTimeout(() => setWrong(null), 500);
      setSelectedTerm(null);
    }
  };

  const allMatched = matched.size === roundOut.pairs.length;
  return (
    <div>
      <div style={headerStyle}><Icon name="handshake" size={14} /> Match the Word to Its Meaning</div>
      <p style={{ textAlign: "center", color: "#6B7280", fontSize: "13px", marginBottom: "14px" }}>Tap a word, then tap its meaning.</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {terms.map(term => {
            const done = matched.has(term);
            return (
              <button key={term} disabled={done} onClick={() => setSelectedTerm(term)} style={{
                padding: "10px 12px", borderRadius: "10px", border: `2px solid ${done ? "#22C55E" : selectedTerm === term ? theme.accentSolid : "#E5E7EB"}`,
                background: done ? "#ECFDF5" : selectedTerm === term ? hexToRgba(theme.accentSolid, 0.1) : "white",
                color: done ? "#14532D" : "#1F2937", fontWeight: "700", fontSize: "13px", cursor: done ? "default" : "pointer", textAlign: "left",
              }}>{term}</button>
            );
          })}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {defs.map(def => {
            const isMatchedDef = [...matched].some(t => defFor(t) === def);
            return (
              <button key={def} disabled={isMatchedDef} onClick={() => tryMatch(def)} style={{
                padding: "10px 12px", borderRadius: "10px", border: `2px solid ${isMatchedDef ? "#22C55E" : wrong === def ? "#EF4444" : "#E5E7EB"}`,
                background: isMatchedDef ? "#ECFDF5" : wrong === def ? "#FEF2F2" : "white",
                color: isMatchedDef ? "#14532D" : "#1F2937", fontSize: "12.5px", cursor: isMatchedDef ? "default" : "pointer", textAlign: "left",
              }}>{def}</button>
            );
          })}
        </div>
      </div>
      {allMatched && <div style={{ textAlign: "center" }}><button onClick={onDone} style={nextBtnStyle}><Icon name="next" size={15} /> Continue</button></div>}
    </div>
  );
}

function ErrorPassageRoundOut({ roundOut, theme, onDone }: { roundOut: Extract<RoundOut, { kind: "errorPassage" }>; theme: Theme; onDone: () => void }) {
  const { headerStyle, nextBtnStyle, revealBtnStyle } = roundOutStyles(theme);
  const [showFixed, setShowFixed] = useState(false);
  return (
    <div>
      <div style={headerStyle}><Icon name="warning" size={14} /> Find the Mistakes</div>
      <div style={{ background: "#FEF2F2", border: "2px solid #FCA5A5", borderRadius: "12px", padding: "14px 16px", whiteSpace: "pre-line", fontSize: "14px", lineHeight: 1.7, color: "#7F1D1D" }}>{roundOut.text}</div>
      {!showFixed ? (
        <div style={{ textAlign: "center" }}><button onClick={() => setShowFixed(true)} style={revealBtnStyle}><Icon name="eye" size={13} /> Show corrected version</button></div>
      ) : (
        <>
          <div style={{ background: "#ECFDF5", border: "2px solid #86EFAC", borderRadius: "12px", padding: "14px 16px", whiteSpace: "pre-line", fontSize: "14px", lineHeight: 1.7, color: "#14532D", marginTop: "12px" }}>{roundOut.corrected}</div>
          <ul style={{ marginTop: "10px", paddingLeft: "20px", color: "#374151", fontSize: "13px" }}>
            {roundOut.fixes.map((f, i) => <li key={i} style={{ marginBottom: "4px" }}>{f}</li>)}
          </ul>
          <div style={{ textAlign: "center" }}><button onClick={onDone} style={nextBtnStyle}><Icon name="next" size={15} /> Continue</button></div>
        </>
      )}
    </div>
  );
}

function ScenarioRoundOut({ roundOut, theme, onDone }: { roundOut: Extract<RoundOut, { kind: "scenario" }>; theme: Theme; onDone: () => void }) {
  const { headerStyle, nextBtnStyle, revealBtnStyle } = roundOutStyles(theme);
  const [i, setI] = useState(0);
  const [show, setShow] = useState(false);
  const p = roundOut.prompts[i];
  const isLast = i === roundOut.prompts.length - 1;
  return (
    <div>
      <div style={headerStyle}><Icon name="chat" size={14} /> What Would You Say? <span style={{ color: "#9CA3AF", fontWeight: "700" }}>· {i + 1}/{roundOut.prompts.length}</span></div>
      <div style={{ background: "#EEF2FF", border: "2px solid #C7D2FE", borderRadius: "12px", padding: "14px 16px", marginBottom: "10px" }}>
        <p style={{ margin: "0 0 6px", fontSize: "15px", color: "#312E81", fontWeight: "600" }}>{p.situation}</p>
        <p style={{ margin: 0, fontSize: "13px", color: "#4338CA", fontWeight: "700" }}>{p.instruction}</p>
      </div>
      {show ? (
        <div style={{ background: "#ECFDF5", border: "2px solid #86EFAC", borderRadius: "12px", padding: "12px 16px", fontSize: "14px", color: "#14532D" }}>{p.sample}</div>
      ) : (
        <div style={{ textAlign: "center" }}><button onClick={() => setShow(true)} style={revealBtnStyle}><Icon name="eye" size={13} /> Show a sample answer</button></div>
      )}
      {show && (
        <div style={{ textAlign: "center" }}>
          <button onClick={() => { if (isLast) onDone(); else { setI(i + 1); setShow(false); } }} style={nextBtnStyle}><Icon name="next" size={15} /> {isLast ? "Continue" : "Next"}</button>
        </div>
      )}
    </div>
  );
}

function UnscrambleRoundOut({ topicId, theme, onDone }: { topicId: string; theme: Theme; onDone: () => void }) {
  const { headerStyle, nextBtnStyle, revealBtnStyle } = roundOutStyles(theme);
  const items = useMemo(() => buildUnscrambleItems(topicId, 4), [topicId]);
  const [i, setI] = useState(0);
  const [show, setShow] = useState(false);
  if (!items.length) return <div style={{ textAlign: "center" }}><button onClick={onDone} style={nextBtnStyle}>Continue</button></div>;
  const current: UnscrambleItem = items[i];
  const isLast = i === items.length - 1;
  return (
    <div>
      <div style={headerStyle}><Icon name="shuffle" size={14} /> Put the Words in Order <span style={{ color: "#9CA3AF", fontWeight: "700" }}>· {i + 1}/{items.length}</span></div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "center", marginBottom: "14px" }}>
        {current.words.map((w, wi) => (
          <span key={wi} style={{ background: "white", border: `2px solid ${theme.accentSolid}`, borderRadius: "8px", padding: "6px 12px", fontWeight: "700", fontSize: "15px", color: "#1F2937" }}>{w}</span>
        ))}
      </div>
      {show ? (
        <div style={{ background: "#ECFDF5", border: "2px solid #86EFAC", borderRadius: "12px", padding: "12px 16px", fontSize: "15px", color: "#14532D", textAlign: "center", fontWeight: "700" }}>{current.answer}</div>
      ) : (
        <div style={{ textAlign: "center" }}><button onClick={() => setShow(true)} style={revealBtnStyle}><Icon name="eye" size={13} /> Show the correct order</button></div>
      )}
      {show && (
        <div style={{ textAlign: "center" }}>
          <button onClick={() => { if (isLast) onDone(); else { setI(i + 1); setShow(false); } }} style={nextBtnStyle}><Icon name="next" size={15} /> {isLast ? "Continue" : "Next"}</button>
        </div>
      )}
    </div>
  );
}

// Ink-economical, single flowing worksheet — mirrors LearnScreen's PrintableLesson pattern.
// Practice/production questions get blank space instead of the on-screen reveal interaction;
// the round-out exercise and speaking tasks print as plain instructions.
function PrintableLessonPlan({ topic, slides, roundOut }: { topic: LearnTopic; slides: Slide[]; roundOut: RoundOut }) {
  const questionSlides = slides.filter((s): s is Extract<Slide, { kind: "question" }> => s.kind === "question");
  const realWorldSlide = slides.find((s): s is Extract<Slide, { kind: "realWorld" }> => s.kind === "realWorld");
  const speakingSlide = slides.find((s): s is Extract<Slide, { kind: "speaking" }> => s.kind === "speaking");
  let currentSection = "";
  return (
    <div>
      <span style={{ background: LEVEL_COLOR[topic.meta.level ?? "A1"], color: "white", borderRadius: "999px", padding: "2px 10px", fontSize: "10.5px", fontWeight: "800" }}>{topic.meta.level}</span>
      <h2 style={{ fontSize: "19px", fontWeight: "900", color: "#111827", margin: "6px 0 5px" }}>{topic.lesson.title} — Lesson Plan</h2>
      <p style={{ color: "#374151", fontSize: "12px", lineHeight: 1.4, margin: "0 0 10px" }}>{topic.lesson.intro}</p>

      {topic.lesson.sections.map((section, i) => (
        <div key={i} style={{ marginBottom: "9px" }}>
          <div style={{ fontWeight: "800", color: "#374151", fontSize: "11px", marginBottom: "3px", textTransform: "uppercase" }}>{section.heading}</div>
          <ul style={{ margin: 0, paddingLeft: "16px", color: "#1F2937" }}>
            {section.body.map((line, j) => <li key={j} style={{ marginBottom: "2px", lineHeight: 1.3, fontSize: "11.5px" }}>{line.replace(/\*\*/g, "")}</li>)}
          </ul>
        </div>
      ))}

      {questionSlides.map((s, i) => {
        const showHeading = s.sectionLabel !== currentSection;
        currentSection = s.sectionLabel;
        return (
          <div key={i} style={{ marginTop: showHeading ? "10px" : "4px" }}>
            {showHeading && <div style={{ fontWeight: "800", fontSize: "11px", textTransform: "uppercase", color: "#374151", marginTop: "6px" }}>{s.sectionLabel}</div>}
            <div style={{ fontSize: "11.5px", margin: "3px 0" }}>{s.question.question}</div>
            <div style={{ borderBottom: "1px solid #9CA3AF", height: "14px" }} />
          </div>
        );
      })}

      <div style={{ fontWeight: "800", fontSize: "11px", textTransform: "uppercase", color: "#374151", marginTop: "10px" }}>Exercise</div>
      <div style={{ fontSize: "11px", color: "#4B5563" }}>{roundOutPrintSummary(roundOut)}</div>

      {realWorldSlide && (
        <div style={{ marginTop: "10px" }}>
          <div style={{ fontWeight: "800", fontSize: "11px", textTransform: "uppercase", color: "#374151" }}>Real-World Reading — {realWorldSlide.reading.title}</div>
          {realWorldSlide.reading.passage.map((p, i) => <div key={i} style={{ fontSize: "11.5px", color: "#1F2937", margin: "3px 0" }}>{p}</div>)}
        </div>
      )}

      {speakingSlide && (
        <div style={{ marginTop: "10px" }}>
          <div style={{ fontWeight: "800", fontSize: "11px", textTransform: "uppercase", color: "#374151" }}>Speaking</div>
          <ul style={{ margin: "3px 0 0", paddingLeft: "16px" }}>
            {speakingSlide.tasks.map((t, i) => <li key={i} style={{ fontSize: "11px", marginBottom: "2px" }}>{t}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}

function roundOutPrintSummary(roundOut: RoundOut): string {
  if (roundOut.kind === "paragraphCloze") return "Fill in the gaps in the story (see screen version, or ask your teacher to read it aloud).";
  if (roundOut.kind === "matching") return `Match each word to its meaning: ${roundOut.pairs.map(p => p.term).join(", ")}.`;
  if (roundOut.kind === "errorPassage") return "Find and correct the mistakes in the passage (see screen version).";
  if (roundOut.kind === "scenario") return "Respond to each situation your teacher reads aloud.";
  return "Put the scrambled words back into the correct order (ask your teacher for the sentences).";
}
