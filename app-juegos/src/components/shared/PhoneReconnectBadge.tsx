import { useState } from "react";
import type { Team } from "../../types";
import { PhoneJoinPanel } from "./PhoneJoinPanel";

// Small persistent control shown throughout a phone-mode game (not just the pre-game "scan to
// join" screen, which disappears the moment the teacher starts playing) so a student who got
// bumped off their phone has a way back in without the teacher needing to interrupt or restart
// anything — tapping it just re-shows the exact same QR/code the intro screen already displayed.
// Mirrors FeedbackButton.tsx's fixed bottom-left pill, placed bottom-right instead so the two never
// collide (FeedbackButton is hidden during screen === "game" anyway, but this keeps the corners
// free for either one).
interface PhoneReconnectBadgeProps {
  sessionCode: string;
  joinUrl: string;
  teams: Team[];
  connectedTeamIds: Set<string | number>;
  accent: string;
  panelBg: string;
  borderColor: string;
}

export function PhoneReconnectBadge({ sessionCode, joinUrl, teams, connectedTeamIds, accent, panelBg, borderColor }: PhoneReconnectBadgeProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          position: "fixed", right: "16px", bottom: "16px", zIndex: 1500,
          background: "rgba(30,30,40,0.72)", color: "#E5E7EB", border: "1px solid rgba(255,255,255,0.15)",
          borderRadius: "999px", padding: "8px 16px", fontSize: "13px", fontWeight: "700",
          cursor: "pointer", fontFamily: "'Segoe UI',system-ui,sans-serif", backdropFilter: "blur(4px)",
        }}
      >
        📱 Reconnect a phone
      </button>

      {open && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000, padding: "20px" }} onClick={() => setOpen(false)}>
          <div onClick={e => e.stopPropagation()} style={{ position: "relative" }}>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close"
              style={{ position: "absolute", top: "-14px", right: "-14px", background: "white", border: "none", borderRadius: "50%", width: "32px", height: "32px", fontSize: "16px", color: "#1F2937", cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.3)" }}
            >
              ✕
            </button>
            <PhoneJoinPanel
              sessionCode={sessionCode} joinUrl={joinUrl} teams={teams} connectedTeamIds={connectedTeamIds}
              accent={accent} panelBg={panelBg} borderColor={borderColor}
            />
          </div>
        </div>
      )}
    </>
  );
}
