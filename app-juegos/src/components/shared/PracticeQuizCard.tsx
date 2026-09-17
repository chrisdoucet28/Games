import { useState } from "react";
import type { PracticeItem } from "../../lib/practiceContent";
import { QuestionCard } from "./QuestionCard";
import { Icon } from "./Icon";

// Same fixed arcade palette as QuestionCard (ink/sky/orange/green), plus red for wrong answers —
// this card renders inside a public, un-themed page, so like QuestionCard it never reads the
// per-teacher Theme system.
const INK = "#0C1E3D";
const SKY = "#0369A1";
const GREEN = "#22C55E";
const GREEN_DEEP = "#15803D";
const RED = "#EF4444";
const RED_DEEP = "#B91C1C";

const cardShell: React.CSSProperties = {
  background: "white",
  border: `3px solid ${INK}`,
  borderRadius: "18px",
  boxShadow: `5px 5px 0 ${INK}`,
  padding: "20px 22px 24px",
};
const tagStyle: React.CSSProperties = {
  display: "inline-block",
  color: SKY,
  fontWeight: 900,
  fontSize: "12px",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  marginBottom: "12px",
};
const promptStyle: React.CSSProperties = {
  fontSize: "19px",
  fontWeight: 800,
  color: INK,
  margin: "0 0 16px",
  lineHeight: 1.4,
};
const optionButtonBase: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "10px",
  textAlign: "left",
  padding: "14px 16px",
  borderRadius: "12px",
  border: "2px solid #E5E7EB",
  fontSize: "15px",
  fontWeight: 700,
  color: INK,
  cursor: "pointer",
  minHeight: "48px",
};

interface PracticeQuizCardProps {
  item: PracticeItem;
  topicLabel: string;
  onAnswered: (correct: boolean) => void;
  onNext: () => void;
}

export function PracticeQuizCard({ item, topicLabel, onAnswered, onNext }: PracticeQuizCardProps) {
  const [answered, setAnswered] = useState(false);

  const resolve = (correct: boolean) => {
    if (answered) return;
    setAnswered(true);
    onAnswered(correct);
  };

  return (
    <div>
      <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "white", border: `2px solid ${SKY}`, borderRadius: "999px", padding: "4px 12px", fontSize: "12px", fontWeight: 800, color: SKY, marginBottom: "10px" }}>
        {topicLabel}
      </div>

      {item.kind === "mcq" && <McqCard item={item} answered={answered} onResolve={resolve} />}
      {item.kind === "auction" && <AuctionCard item={item} answered={answered} onResolve={resolve} />}
      {item.kind === "reveal" && <RevealCard item={item} answered={answered} onResolve={resolve} />}

      {answered && (
        <button
          onClick={onNext}
          style={{
            marginTop: "16px", width: "100%", background: "linear-gradient(135deg,#F59E0B,#D97706)", color: "white",
            border: `3px solid ${INK}`, borderRadius: "14px", padding: "14px", fontSize: "16px", fontWeight: 900,
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", minHeight: "52px",
          }}
        >
          Next <Icon name="next" size={18} color="white" />
        </button>
      )}
    </div>
  );
}

function McqCard({ item, answered, onResolve }: { item: Extract<PracticeItem, { kind: "mcq" }>; answered: boolean; onResolve: (correct: boolean) => void }) {
  const [selected, setSelected] = useState<number | null>(null);

  const pick = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    onResolve(idx === item.correctIdx);
  };

  return (
    <div style={cardShell}>
      <div style={tagStyle}>Choose the correct answer</div>
      <p style={promptStyle}>{item.prompt}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {item.choices.map((choice, idx) => {
          const isPicked = selected === idx;
          const isRight = idx === item.correctIdx;
          const revealed = selected !== null;
          const bg = !revealed ? "white" : isRight ? "#DCFCE7" : isPicked ? "#FEE2E2" : "white";
          const border = !revealed ? "#E5E7EB" : isRight ? GREEN : isPicked ? RED : "#E5E7EB";
          return (
            <button key={idx} disabled={revealed} onClick={() => pick(idx)} style={{ ...optionButtonBase, background: bg, borderColor: border, opacity: revealed && !isRight && !isPicked ? 0.6 : 1 }}>
              <span>{choice}</span>
              {revealed && isRight && <Icon name="check" size={16} color={GREEN_DEEP} />}
              {revealed && isPicked && !isRight && <Icon name="close" size={16} color={RED_DEEP} />}
            </button>
          );
        })}
      </div>
      {item.hint && answered && (
        <div style={{ color: GREEN_DEEP, fontSize: "13px", marginTop: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
          <Icon name="idea" size={13} color={GREEN_DEEP} /> {item.hint}
        </div>
      )}
    </div>
  );
}

function AuctionCard({ item, onResolve }: { item: Extract<PracticeItem, { kind: "auction" }>; answered: boolean; onResolve: (correct: boolean) => void }) {
  const [picked, setPicked] = useState<boolean | null>(null);

  const pick = (guess: boolean) => {
    if (picked !== null) return;
    setPicked(guess);
    onResolve(guess === item.isCorrect);
  };

  return (
    <div style={cardShell}>
      <div style={tagStyle}>True or false?</div>
      <p style={promptStyle}>"{item.sentence}"</p>
      {picked === null ? (
        <div style={{ display: "flex", gap: "12px" }}>
          <button onClick={() => pick(true)} style={{ ...optionButtonBase, flex: 1, justifyContent: "center", border: `2px solid ${GREEN}`, color: GREEN_DEEP }}>Correct</button>
          <button onClick={() => pick(false)} style={{ ...optionButtonBase, flex: 1, justifyContent: "center", border: `2px solid ${RED}`, color: RED_DEEP }}>Incorrect</button>
        </div>
      ) : (
        <div style={{ background: item.isCorrect ? "#DCFCE7" : "#FEE2E2", border: `3px solid ${item.isCorrect ? GREEN : RED}`, borderRadius: "14px", padding: "16px", textAlign: "center" }}>
          <div style={{ fontWeight: 900, fontSize: "16px", color: item.isCorrect ? GREEN_DEEP : RED_DEEP, marginBottom: item.explanation ? "8px" : 0 }}>
            This sentence is {item.isCorrect ? "CORRECT" : "INCORRECT"}
          </div>
          {item.explanation && <p style={{ margin: 0, fontSize: "13px", color: INK, lineHeight: 1.5 }}>{item.explanation}</p>}
          <div style={{ marginTop: "10px", fontSize: "13px", fontWeight: 800, color: picked === item.isCorrect ? GREEN_DEEP : RED_DEEP }}>
            {picked === item.isCorrect ? "You got it right!" : "Not quite this time"}
          </div>
        </div>
      )}
    </div>
  );
}

function RevealCard({ item, answered, onResolve }: { item: Extract<PracticeItem, { kind: "reveal" }>; answered: boolean; onResolve: (correct: boolean) => void }) {
  const [revealed, setRevealed] = useState(false);

  return (
    <div>
      <QuestionCard question={item.question} showAnswer={revealed} onReveal={() => setRevealed(true)} gameId="practice" />
      {revealed && !answered && (
        <div style={{ display: "flex", gap: "10px", marginTop: "14px" }}>
          <button onClick={() => onResolve(true)} style={{ flex: 1, background: "#DCFCE7", border: `3px solid ${GREEN}`, color: GREEN_DEEP, borderRadius: "14px", padding: "14px 10px", fontSize: "14px", fontWeight: 900, cursor: "pointer", minHeight: "52px" }}>
            I got it right
          </button>
          <button onClick={() => onResolve(false)} style={{ flex: 1, background: "#FEE2E2", border: `3px solid ${RED}`, color: RED_DEEP, borderRadius: "14px", padding: "14px 10px", fontSize: "14px", fontWeight: 900, cursor: "pointer", minHeight: "52px" }}>
            I need practice
          </button>
        </div>
      )}
    </div>
  );
}
