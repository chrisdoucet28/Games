import type { QuestionData } from "../../types";
import { FlagPromptButton } from "./FlagPromptButton";
import { Icon } from "./Icon";

interface QuestionCardProps {
  question: QuestionData | null;
  showAnswer: boolean;
  onReveal: () => void;
  gameId: string;
}

// Fixed arcade palette, not theme-driven — QuestionCard renders inside every game's own gameplay
// moment (the CLAUDE.md rule "individual games keep their own fixed visual identity and are never
// themed" applies here exactly like it does to a game board), so these colors stay put regardless
// of which accent theme the teacher picked for the surrounding chrome.
const NAVY = "#1E1B4B";
const NAVY_LIGHT = "#332F7A";
const VIOLET = "#818CF8";
const AMBER = "#F59E0B";
const AMBER_DARK = "#B45309";
const GOLD = "#FBBF24";
const GOLD_DARK = "#D97706";
const GREEN = "#22C55E";
const GREEN_DARK = "#15803D";

export function QuestionCard({ question, showAnswer, onReveal, gameId }: QuestionCardProps) {
  if (!question) return null;
  const isSpeaking = question.type === "speaking task";
  const accent = isSpeaking ? AMBER : VIOLET;

  return (
    <div style={{
      background: "white",
      borderRadius: "20px",
      border: `3px solid ${NAVY}`,
      boxShadow: `0 8px 0 ${NAVY}, 0 18px 32px rgba(15,10,46,0.35)`,
      overflow: "hidden",
      textAlign: "center",
    }}>
      {/* The card's own "marquee nameplate" — carries the type tag between two glowing bulb dots
          instead of a soft pastel pill floating loose in the body, so the card reads like a
          labeled cabinet panel rather than a generic form card. */}
      <div style={{
        background: `linear-gradient(180deg, ${NAVY_LIGHT}, ${NAVY})`,
        padding: "10px 16px",
        display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
      }}>
        <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: accent, boxShadow: `0 0 7px ${accent}` }} />
        <span style={{
          color: accent, fontWeight: 900, fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.12em",
          display: "inline-flex", alignItems: "center", gap: "6px",
        }}>
          {isSpeaking ? <><Icon name="mic" size={13} color={accent} /> Speaking Prompt</> : question.type}
        </span>
        <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: accent, boxShadow: `0 0 7px ${accent}` }} />
      </div>

      <div style={{ padding: "26px 26px 28px" }}>
        <p style={{ fontSize: "22px", fontWeight: "800", color: NAVY, margin: "0 0 18px", lineHeight: 1.4 }}>
          {question.question}
        </p>

        {isSpeaking ? (
          <div style={{ background: `${AMBER}14`, border: `2px dashed ${AMBER}`, borderRadius: "14px", padding: "14px 16px", fontSize: "14px", color: AMBER_DARK, fontWeight: "700", position: "relative" }}>
            {/* No separate reveal step for open-response prompts — the prompt itself is the whole
                card, so the flag belongs here immediately rather than gated behind a Reveal Answer
                click that doesn't exist for this question type. */}
            <div style={{ position: "absolute", top: "8px", right: "8px" }}>
              <FlagPromptButton gameId={gameId} questionData={question} />
            </div>
            <div style={{ paddingRight: "26px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
              <Icon name="mic" size={16} color={AMBER_DARK} /> Open response — teacher listens and judges
            </div>
          </div>
        ) : showAnswer ? (
          <div style={{ background: `${GREEN}14`, border: `2px solid ${GREEN}`, borderRadius: "14px", padding: "16px", position: "relative" }}>
            <div style={{ position: "absolute", top: "8px", right: "8px" }}>
              <FlagPromptButton gameId={gameId} questionData={question} />
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "9px" }}>
              <span style={{ background: GREEN, borderRadius: "50%", width: "24px", height: "24px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon name="check" size={13} color="white" />
              </span>
              <span style={{ fontWeight: "900", fontSize: "20px", color: GREEN_DARK }}>{question.answer}</span>
            </div>
            {question.hint && (
              <div style={{ color: GREEN_DARK, fontSize: "13px", marginTop: "9px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                <Icon name="idea" size={13} color={GREEN_DARK} /> {question.hint}
              </div>
            )}
          </div>
        ) : (
          <>
            {/* A chunky, physical-feeling "buzzer" rather than a flat form button — a solid drop
                shadow doubling as the button's own "skirt" gives it a pressable, 3D look, and it
                actually depresses on click instead of just changing color. */}
            <style>{`
              .qc-reveal-btn { background: linear-gradient(180deg, ${GOLD}, ${GOLD_DARK}); box-shadow: 0 5px 0 ${AMBER_DARK}, 0 9px 18px rgba(0,0,0,0.25); }
              .qc-reveal-btn:hover { filter: brightness(1.06); transform: translateY(-1px); box-shadow: 0 6px 0 ${AMBER_DARK}, 0 11px 20px rgba(0,0,0,0.3); }
              .qc-reveal-btn:active { transform: translateY(4px); box-shadow: 0 1px 0 ${AMBER_DARK}, 0 3px 8px rgba(0,0,0,0.25); }
            `}</style>
            <button onClick={onReveal} className="qc-reveal-btn" style={{
              color: NAVY, border: "none", borderRadius: "999px", padding: "13px 34px",
              fontSize: "16px", fontWeight: "900", cursor: "pointer", letterSpacing: "0.04em",
              textTransform: "uppercase", display: "inline-flex", alignItems: "center", gap: "9px",
              transition: "transform 0.12s ease, box-shadow 0.12s ease",
            }}>
              <Icon name="eye" size={18} color={NAVY} /> Reveal Answer
            </button>
          </>
        )}
      </div>
    </div>
  );
}
