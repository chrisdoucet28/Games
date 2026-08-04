import { useState } from "react";
import { submitFlag } from "../../lib/feedback";

// Tiny, low-weight control dropped next to a game's answer/result reveal — lets a teacher flag
// that specific prompt as weird/wrong without ever leaving the game or opening a full modal.
// gameId matches GAME_MODES ids in data/constants.ts. questionData is whatever raw object (or
// { raw: "..." } wrapper for plain-string prompts) identifies the flagged content — stored as-is
// in Supabase jsonb for later review, never read back by the app itself.
interface FlagPromptButtonProps {
  gameId: string;
  questionData: unknown;
}

type Status = "idle" | "expanded" | "sending" | "sent" | "error";

export function FlagPromptButton({ gameId, questionData }: FlagPromptButtonProps) {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  const cancel = () => {
    setStatus("idle");
    setMessage("");
  };

  const submit = async () => {
    setStatus("sending");
    try {
      await submitFlag(gameId, questionData, message.trim());
      setStatus("sent");
      setMessage("");
      setTimeout(() => setStatus("idle"), 1400);
    } catch {
      setStatus("error");
    }
  };

  if (status === "sent") {
    return (
      <span style={{ fontSize: "11px", fontWeight: 800, color: "#166534", fontFamily: "'Segoe UI',system-ui,sans-serif" }}>
        🚩 Sent
      </span>
    );
  }

  if (status === "idle") {
    return (
      <button
        onClick={() => setStatus("expanded")}
        title="Flag this prompt"
        style={{
          background: "rgba(120,120,130,0.12)", color: "#6B7280", border: "1px solid rgba(120,120,130,0.25)",
          borderRadius: "8px", padding: "3px 7px", fontSize: "11px", cursor: "pointer",
          fontFamily: "'Segoe UI',system-ui,sans-serif", lineHeight: 1,
        }}
      >
        🚩
      </button>
    );
  }

  return (
    <div style={{
      display: "inline-block", background: "white", border: "2px solid #E5E7EB", borderRadius: "10px",
      padding: "8px", maxWidth: "220px", fontFamily: "'Segoe UI',system-ui,sans-serif", textAlign: "left",
      boxShadow: "0 4px 14px rgba(0,0,0,0.15)",
    }}>
      <textarea
        autoFocus
        value={message}
        onChange={e => setMessage(e.target.value)}
        rows={2}
        placeholder="What's wrong with this prompt? (optional)"
        style={{ width: "100%", boxSizing: "border-box", border: "1px solid #E5E7EB", borderRadius: "6px", padding: "5px 7px", fontSize: "11px", fontFamily: "inherit", resize: "vertical" }}
      />
      {status === "error" && (
        <div style={{ color: "#B91C1C", fontSize: "10px", fontWeight: 700, marginTop: "4px" }}>Couldn't send — try again.</div>
      )}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: "6px", marginTop: "5px" }}>
        <button onClick={cancel} style={{ background: "none", border: "none", color: "#9CA3AF", fontWeight: 700, cursor: "pointer", fontSize: "10px" }}>Cancel</button>
        <button
          onClick={submit}
          disabled={status === "sending"}
          style={{ background: "#DC2626", color: "white", border: "none", borderRadius: "6px", padding: "4px 10px", fontWeight: 800, cursor: "pointer", fontSize: "10px" }}
        >
          {status === "sending" ? "..." : "🚩 Send"}
        </button>
      </div>
    </div>
  );
}
