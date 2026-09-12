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
// of which accent theme the teacher picked for the surrounding chrome. Sky blue + bright orange is
// ClassCade's own signature combo (the Sky/default theme's exact hero and CTA colors, see
// data/themes.ts) — teacher feedback specifically asked for these over an unrelated palette.
const INK = "#1A1A2E";
const SKY = "#0EA5E9";
const ORANGE = "#F59E0B";
const ORANGE_DEEP = "#B45309";
const GREEN = "#22C55E";
const GREEN_DEEP = "#15803D";

// A pixel-cut notch on every corner instead of a plain rectangle — a flat rect with a solid-color
// bar across the top (the first pass at this) reads as an old Windows dialog box, not a game. Real
// sprite-art panels are never a clean 90° rectangle; chamfering each corner by a few pixels is the
// actual detail that reads as "pixel art" (Super Paper Mario's own text boxes do the same thing).
const NOTCH = 10;
const NOTCH_CLIP = `polygon(${NOTCH}px 0, calc(100% - ${NOTCH}px) 0, 100% ${NOTCH}px, 100% calc(100% - ${NOTCH}px), calc(100% - ${NOTCH}px) 100%, ${NOTCH}px 100%, 0 calc(100% - ${NOTCH}px), 0 ${NOTCH}px)`;

export function QuestionCard({ question, showAnswer, onReveal, gameId }: QuestionCardProps) {
  if (!question) return null;
  const isSpeaking = question.type === "speaking task";
  const accent = isSpeaking ? ORANGE : SKY;

  return (
    <div style={{
      background: "white",
      border: `4px solid ${INK}`,
      clipPath: NOTCH_CLIP,
      // clip-path also clips a box-shadow painted on the same box, so the hard offset shadow
      // uses drop-shadow (a filter) instead — it follows the notched silhouette rather than
      // getting chopped off at the corners.
      filter: `drop-shadow(6px 6px 0 ${INK})`,
      textAlign: "center",
      padding: "20px 26px 28px",
    }}>
      {/* A small tag instead of a full-width title bar — a bar spanning edge to edge is exactly
          what reads as an OS dialog box; a corner-style tag (like a game card's own rarity/type
          label) doesn't. Kept fully inside the card's own padding rather than pinned to poke over
          the border — every one of the 7 games that render this card puts its own content
          directly above it (a turn banner, a coordinate badge...), and a tag overlapping the top
          edge collided with whatever that happened to be. White with colored text/border rather
          than a solid fill for the same reason one layer down: several games' own badges right
          next to this card are already brightly colored, and a solid block here read as sitting
          on top of them rather than beside them. */}
      <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: "14px" }}>
        <span style={{
          background: "white", border: `3px solid ${INK}`, padding: "4px 12px",
          color: accent, fontWeight: 900, fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.08em",
          display: "inline-flex", alignItems: "center", gap: "6px",
        }}>
          {isSpeaking ? <><Icon name="mic" size={12} color={accent} /> Speaking Prompt</> : question.type}
        </span>
      </div>

      <p style={{ fontSize: "22px", fontWeight: "800", color: INK, margin: "0 0 18px", lineHeight: 1.4 }}>
        {question.question}
      </p>

      {isSpeaking ? (
        <div style={{ background: "white", border: `3px solid ${ORANGE}`, padding: "14px 16px", fontSize: "14px", color: ORANGE_DEEP, fontWeight: "700", position: "relative" }}>
          {/* No separate reveal step for open-response prompts — the prompt itself is the whole
              card, so the flag belongs here immediately rather than gated behind a Reveal Answer
              click that doesn't exist for this question type. */}
          <div style={{ position: "absolute", top: "8px", right: "8px" }}>
            <FlagPromptButton gameId={gameId} questionData={question} />
          </div>
          <div style={{ paddingRight: "26px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
            <Icon name="mic" size={16} color={ORANGE_DEEP} /> Open response — teacher listens and judges
          </div>
        </div>
      ) : showAnswer ? (
        <div style={{ background: "white", border: `3px solid ${GREEN}`, padding: "16px", position: "relative" }}>
          <div style={{ position: "absolute", top: "8px", right: "8px" }}>
            <FlagPromptButton gameId={gameId} questionData={question} />
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "9px" }}>
            <span style={{ background: GREEN, width: "24px", height: "24px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: `2px solid ${INK}` }}>
              <Icon name="check" size={13} color="white" />
            </span>
            <span style={{ fontWeight: "900", fontSize: "20px", color: GREEN_DEEP }}>{question.answer}</span>
          </div>
          {question.hint && (
            <div style={{ color: GREEN_DEEP, fontSize: "13px", marginTop: "9px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
              <Icon name="idea" size={13} color={GREEN_DEEP} /> {question.hint}
            </div>
          )}
        </div>
      ) : (
        <>
          {/* A chunky "buzzer" block — a hard, unblurred offset shadow doubling as the button's
              own physical base, so it actually sinks flush into the card on click (the shadow
              collapses to nothing as the button shifts down-right by its exact offset) instead
              of just changing color. The stepped transition (no smooth easing) keeps the motion
              feeling like a discrete pixel-grid snap rather than a soft, rounded-UI glide. */}
          <style>{`
            .qc-reveal-btn { background: ${ORANGE}; box-shadow: 6px 6px 0 ${INK}; transition: transform 0.08s steps(2), box-shadow 0.08s steps(2); }
            .qc-reveal-btn:hover { filter: brightness(1.08); }
            .qc-reveal-btn:active { transform: translate(6px, 6px); box-shadow: 0 0 0 ${INK}; }
          `}</style>
          <button onClick={onReveal} className="qc-reveal-btn" style={{
            color: "white", border: `3px solid ${INK}`, padding: "13px 34px",
            fontSize: "16px", fontWeight: "900", cursor: "pointer", letterSpacing: "0.05em",
            textTransform: "uppercase", display: "inline-flex", alignItems: "center", gap: "9px",
            textShadow: `2px 2px 0 ${ORANGE_DEEP}`,
          }}>
            <Icon name="eye" size={18} color="white" /> Reveal Answer
          </button>
        </>
      )}
    </div>
  );
}
