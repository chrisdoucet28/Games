import { useState } from "react";
import { submitFlag } from "../../lib/feedback";
import { Icon } from "./Icon";

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
  // For "this whole type of content is too narrow/repetitive," not "this one prompt's wording is
  // wrong" — e.g. a topic's mistake-pool always testing the exact same underlying rule in a few
  // surface variations. Admin side treats this as a signal about the topic as a whole, not the one
  // flagged item (see AdminFeedbackPanel.tsx's "Pattern issue" badge).
  const [isPatternIssue, setIsPatternIssue] = useState(false);

  const cancel = () => {
    setStatus("idle");
    setMessage("");
    setIsPatternIssue(false);
  };

  const submit = async () => {
    setStatus("sending");
    try {
      await submitFlag(gameId, questionData, message.trim(), isPatternIssue);
      setStatus("sent");
      setMessage("");
      setIsPatternIssue(false);
      setTimeout(() => setStatus("idle"), 1400);
    } catch {
      setStatus("error");
    }
  };

  if (status === "sent") {
    return (
      <span style={{ fontSize: "11px", fontWeight: 800, color: "#166534", fontFamily: "'Segoe UI',system-ui,sans-serif", display: "inline-flex", alignItems: "center", gap: "4px" }}>
        <Icon name="flag" size={11} /> Sent
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
          fontFamily: "'Segoe UI',system-ui,sans-serif", lineHeight: 1, display: "inline-flex", alignItems: "center",
        }}
      >
        <Icon name="flag" size={12} />
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
        maxLength={2000}
        placeholder="What's wrong with this prompt? (optional)"
        style={{ width: "100%", boxSizing: "border-box", border: "1px solid #E5E7EB", borderRadius: "6px", padding: "5px 7px", fontSize: "11px", fontFamily: "inherit", resize: "vertical" }}
      />
      <label style={{ display: "flex", alignItems: "flex-start", gap: "5px", marginTop: "6px", cursor: "pointer" }}>
        <input
          type="checkbox"
          checked={isPatternIssue}
          onChange={e => setIsPatternIssue(e.target.checked)}
          style={{ marginTop: "2px", flexShrink: 0 }}
        />
        <span style={{ fontSize: "10px", color: "#4B5563", lineHeight: 1.4 }}>
          This is a bigger pattern, not just this one prompt (e.g. this whole topic's mistakes are all too similar)
        </span>
      </label>
      {status === "error" && (
        <div style={{ color: "#B91C1C", fontSize: "10px", fontWeight: 700, marginTop: "4px" }}>Couldn't send — try again.</div>
      )}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: "6px", marginTop: "5px" }}>
        <button onClick={cancel} style={{ background: "none", border: "none", color: "#9CA3AF", fontWeight: 700, cursor: "pointer", fontSize: "10px" }}>Cancel</button>
        <button
          onClick={submit}
          disabled={status === "sending"}
          style={{ background: "#DC2626", color: "white", border: "none", borderRadius: "6px", padding: "4px 10px", fontWeight: 800, cursor: "pointer", fontSize: "10px", display: "inline-flex", alignItems: "center", gap: "4px" }}
        >
          {status === "sending" ? "..." : <><Icon name="flag" size={10} /> Send</>}
        </button>
      </div>
    </div>
  );
}
