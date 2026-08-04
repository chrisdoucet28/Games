import { useState } from "react";
import { submitGeneralFeedback } from "../../lib/feedback";

// Shared-chrome-only utility control (welcome/setup/game-select/results/classes/profile/billing/
// learn) — deliberately never shown during screen === "game"; the FlagPromptButton covers
// in-game feedback instead. Kept visually neutral/fixed rather than theme-matched since it's a
// meta control layered on top of themed screens, not part of any one screen's own chrome.
type Status = "idle" | "sending" | "sent" | "error";

export function FeedbackButton() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  const close = () => {
    setOpen(false);
    setStatus("idle");
    setMessage("");
  };

  const submit = async () => {
    if (!message.trim()) return;
    setStatus("sending");
    try {
      await submitGeneralFeedback(message.trim());
      setStatus("sent");
      setTimeout(close, 1100);
    } catch {
      setStatus("error");
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          position: "fixed", left: "16px", bottom: "16px", zIndex: 1500,
          background: "rgba(30,30,40,0.72)", color: "#E5E7EB", border: "1px solid rgba(255,255,255,0.15)",
          borderRadius: "999px", padding: "8px 16px", fontSize: "13px", fontWeight: "700",
          cursor: "pointer", fontFamily: "'Segoe UI',system-ui,sans-serif", backdropFilter: "blur(4px)",
        }}
      >
        💬 Feedback
      </button>

      {open && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000, padding: "20px" }}>
          <div style={{ background: "white", borderRadius: "20px", padding: "24px", maxWidth: "440px", width: "100%", fontFamily: "'Segoe UI',system-ui,sans-serif" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
              <h3 style={{ margin: 0, fontSize: "17px", fontWeight: 900, color: "#1F2937" }}>💬 Send Feedback</h3>
              <button onClick={close} aria-label="Close" style={{ background: "none", border: "none", fontSize: "20px", color: "#9CA3AF", cursor: "pointer", lineHeight: 1, padding: "4px" }}>✕</button>
            </div>

            {status === "sent" ? (
              <div style={{ textAlign: "center", padding: "20px 0", fontWeight: 800, color: "#166534", fontSize: "15px" }}>
                Thanks — sent! ✅
              </div>
            ) : (
              <>
                <p style={{ margin: "0 0 10px", fontSize: "13px", color: "#6B7280" }}>
                  Found a bug, a confusing screen, or have an idea? Let us know.
                </p>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  rows={5}
                  placeholder="Type your feedback here..."
                  style={{ width: "100%", boxSizing: "border-box", border: "2px solid #E5E7EB", borderRadius: "12px", padding: "10px 12px", fontSize: "14px", fontFamily: "inherit", resize: "vertical" }}
                />
                {status === "error" && (
                  <div style={{ color: "#B91C1C", fontSize: "13px", fontWeight: 700, marginTop: "8px" }}>
                    Couldn't send that — please try again.
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "14px" }}>
                  <button onClick={close} style={{ background: "none", border: "none", color: "#9CA3AF", fontWeight: 700, cursor: "pointer", fontSize: "13px" }}>Cancel</button>
                  <button
                    onClick={submit}
                    disabled={!message.trim() || status === "sending"}
                    style={{
                      background: message.trim() ? "#4F46E5" : "#C7D2FE", color: "white", border: "none",
                      borderRadius: "10px", padding: "10px 22px", fontWeight: 800, cursor: message.trim() ? "pointer" : "not-allowed", fontSize: "14px",
                    }}
                  >
                    {status === "sending" ? "Sending..." : "Submit"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
