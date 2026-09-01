import { useState } from "react";
import { submitFlag } from "../../lib/feedback";
import type { Theme } from "../../data/themes";
import { Icon } from "./Icon";

// Same submit path as FlagPromptButton (gameId "learn" is just a marker for filtering during
// review, not a real game) but sized and worded for a full lesson page rather than a compact
// in-game HUD control. Feeds the same "collect, don't act" review flow as every other feedback
// surface (see lib/feedback.ts) — comments here are meant to inform a future edit to the lesson
// itself ("this should also cover X", "this shouldn't be taught this way"), not just flag one
// wrong line. Placement is the caller's responsibility — LearnScreen drops it inside its existing
// "learn-no-print" action row, so it's excluded from printed handouts for free, same as the
// Back/Print buttons already in that row.
interface FlagLessonButtonProps {
  topicId: string;
  topicTitle: string;
  theme: Theme;
}

type Status = "idle" | "expanded" | "sending" | "sent" | "error";

export function FlagLessonButton({ topicId, topicTitle, theme }: FlagLessonButtonProps) {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  const cancel = () => {
    setStatus("idle");
    setMessage("");
  };

  const submit = async () => {
    if (!message.trim()) return;
    setStatus("sending");
    try {
      await submitFlag("learn", { topicId, title: topicTitle }, message.trim());
      setStatus("sent");
      setMessage("");
      setTimeout(() => setStatus("idle"), 1400);
    } catch {
      setStatus("error");
    }
  };

  if (status === "sent") {
    return (
      <span style={{ fontWeight: "800", color: "#166534", fontFamily: "'Segoe UI',system-ui,sans-serif", fontSize: "14px", alignSelf: "center", display: "inline-flex", alignItems: "center", gap: "6px" }}>
        <Icon name="flag" size={14} /> Sent — thanks!
      </span>
    );
  }

  if (status === "idle") {
    return (
      <button
        onClick={() => setStatus("expanded")}
        title="Suggest a change to this lesson"
        style={{
          background: "none", border: `2px solid ${theme.accentSolid}`, color: theme.accentSolid,
          borderRadius: "10px", padding: "8px 16px", cursor: "pointer", fontWeight: "700",
          fontFamily: theme.headingFont, display: "inline-flex", alignItems: "center", gap: "6px",
        }}
      >
        <Icon name="flag" size={14} /> Flag / Suggest a Change
      </button>
    );
  }

  return (
    <div style={{
      background: "white", border: "2px solid #E5E7EB", borderRadius: "12px", padding: "12px",
      maxWidth: "420px", width: "100%", fontFamily: "'Segoe UI',system-ui,sans-serif", textAlign: "left",
      boxShadow: "0 4px 14px rgba(0,0,0,0.1)",
    }}>
      <div style={{ fontSize: "12px", color: "#6B7280", marginBottom: "6px" }}>
        What should change about this lesson? E.g. "this should also cover…", "this shouldn't be taught this way"…
      </div>
      <textarea
        autoFocus
        value={message}
        onChange={e => setMessage(e.target.value)}
        rows={3}
        maxLength={2000}
        placeholder="Your note..."
        style={{ width: "100%", boxSizing: "border-box", border: "1px solid #E5E7EB", borderRadius: "8px", padding: "8px 10px", fontSize: "13px", fontFamily: "inherit", resize: "vertical" }}
      />
      {status === "error" && (
        <div style={{ color: "#B91C1C", fontSize: "12px", fontWeight: 700, marginTop: "6px" }}>Couldn't send — try again.</div>
      )}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "8px" }}>
        <button onClick={cancel} style={{ background: "none", border: "none", color: "#9CA3AF", fontWeight: 700, cursor: "pointer", fontSize: "12px" }}>Cancel</button>
        <button
          onClick={submit}
          disabled={!message.trim() || status === "sending"}
          style={{
            background: message.trim() ? theme.accentSolid : "#D1D5DB", color: "white", border: "none",
            borderRadius: "8px", padding: "6px 14px", fontWeight: 800, cursor: message.trim() ? "pointer" : "not-allowed", fontSize: "12px",
            display: "inline-flex", alignItems: "center", gap: "5px",
          }}
        >
          {status === "sending" ? "..." : <><Icon name="flag" size={12} /> Send</>}
        </button>
      </div>
    </div>
  );
}
