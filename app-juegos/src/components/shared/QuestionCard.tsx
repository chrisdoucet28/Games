import type { QuestionData } from "../../types";

interface QuestionCardProps {
  question: QuestionData | null;
  showAnswer: boolean;
  onReveal: () => void;
}

export function QuestionCard({ question, showAnswer, onReveal }: QuestionCardProps) {
  if (!question) return null;
  const isSpeaking = question.type === "speaking task";

  return (
    <div style={{
      background: "white", 
      border: `3px solid ${isSpeaking ? "#F59E0B" : "#6366F1"}`, 
      borderRadius: "20px", 
      padding: "28px", 
      textAlign: "center", 
      boxShadow: `0 8px 32px ${isSpeaking ? "#F59E0B" : "#6366F1"}40`
    }}>
      <div style={{
        display: "inline-block", 
        background: isSpeaking ? "#FEF3C7" : "#EEF2FF", 
        color: isSpeaking ? "#92400E" : "#4F46E5", 
        padding: "4px 14px", 
        borderRadius: "20px", 
        fontSize: "13px", 
        fontWeight: "700", 
        marginBottom: "12px", 
        textTransform: "uppercase", 
        letterSpacing: "0.05em"
      }}>
        {isSpeaking ? "💬 speaking prompt" : question.type}
      </div>
      
      <p style={{ fontSize: "22px", fontWeight: "700", color: "#1E1B4B", margin: "0 0 16px", lineHeight: 1.4 }}>
        {question.question}
      </p>

      {isSpeaking ? (
        <div style={{ background: "#FFFBEB", border: "2px solid #F59E0B", borderRadius: "12px", padding: "12px 16px", fontSize: "14px", color: "#92400E", fontWeight: "600" }}>
          🎙️ Open response — teacher listens and judges
        </div>
      ) : showAnswer ? (
        <div style={{ background: "#ECFDF5", border: "2px solid #22C55E", borderRadius: "12px", padding: "14px", marginTop: "12px" }}>
          <div style={{ fontWeight: "900", fontSize: "20px", color: "#14532D" }}>✅ {question.answer}</div>
          {question.hint && <div style={{ color: "#166534", fontSize: "14px", marginTop: "6px" }}>💡 {question.hint}</div>}
        </div>
      ) : (
        <button onClick={onReveal} style={{ background: "#6366F1", color: "white", border: "none", borderRadius: "12px", padding: "12px 28px", fontSize: "16px", fontWeight: "700", cursor: "pointer", marginTop: "8px" }}>
          👁 Reveal Answer
        </button>
      )}
    </div>
  );
}