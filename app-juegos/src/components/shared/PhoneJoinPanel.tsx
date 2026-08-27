import type { ReactNode } from "react";
import { QRCodeSVG } from "qrcode.react";
import type { Team } from "../../types";

// The QR + code + roster block every phone-mode game shows so students can join — pulled out of
// what used to be 4 near-identical copies (one per game, each just re-skinned with that game's own
// colors) once a second call site (PhoneReconnectBadge) needed the exact same block again mid-game.
// Purely presentational: which teams are "eligible" to show here (e.g. Spy Among Us excluding its
// teacher stand-in) is the caller's job, not this component's.
interface PhoneJoinPanelProps {
  sessionCode: string;
  joinUrl: string;
  teams: Team[];
  connectedTeamIds: Set<string | number>;
  accent: string;
  panelBg: string;
  borderColor: string;
  // Extra content between the code and the roster — only Hot Seat's groups/solo toggle uses this.
  children?: ReactNode;
  // e.g. the "Switch back to Play on Screen" link — only the pre-game call site needs one.
  footer?: ReactNode;
}

export function PhoneJoinPanel({ sessionCode, joinUrl, teams, connectedTeamIds, accent, panelBg, borderColor, children, footer }: PhoneJoinPanelProps) {
  return (
    <div style={{ background: panelBg, border: `2px solid ${borderColor}`, borderRadius: "20px", padding: "20px", maxWidth: "360px", marginLeft: "auto", marginRight: "auto" }}>
      <div style={{ fontWeight: "800", fontSize: "14px", color: accent, marginBottom: "12px" }}>📱 Scan to join, or go to the site and enter this code:</div>
      <div style={{ background: "white", borderRadius: "12px", padding: "12px", display: "inline-block" }}>
        <QRCodeSVG value={joinUrl} size={160} />
      </div>
      <div style={{ fontSize: "28px", fontWeight: "900", letterSpacing: "0.1em", color: "white", margin: "12px 0" }}>{sessionCode}</div>
      {children}
      <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "10px" }}>
        {teams.map(t => (
          <div key={t.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(255,255,255,0.06)", borderRadius: "8px", padding: "6px 10px", fontSize: "13px" }}>
            <span>{t.mascot ?? t.color.emoji} {t.name}</span>
            <span style={{ color: connectedTeamIds.has(t.id) ? "#4ADE80" : "#6B7280", fontWeight: "700" }}>
              {connectedTeamIds.has(t.id) ? "✅ Connected" : "⏳ Waiting…"}
            </span>
          </div>
        ))}
      </div>
      {footer}
    </div>
  );
}
