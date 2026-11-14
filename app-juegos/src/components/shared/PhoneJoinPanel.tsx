import type { ReactNode } from "react";
import { TeamIcon } from "./TeamIcon";
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
  // Only Word Relay passes this (several phones can share a team there) — every other game has at
  // most one phone per team, so "Connected" says everything needed.
  phoneCountByTeam?: Record<string, number>;
}

// Most games pass a dark panelBg, but a few (Bounty Board, Order Up) pass a light cream/pink one —
// white text on those is practically invisible. Judge the panel by the first hex color in panelBg
// (the gradient's starting color, or the plain color) and flip text to dark when it's light.
function isLightBackground(bg: string): boolean {
  const m = bg.match(/#([0-9a-f]{6}|[0-9a-f]{3})\b/i);
  if (!m) return false;
  let hex = m[1];
  if (hex.length === 3) hex = hex.split("").map(c => c + c).join("");
  const r = parseInt(hex.slice(0, 2), 16), g = parseInt(hex.slice(2, 4), 16), b = parseInt(hex.slice(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) > 160;
}

export function PhoneJoinPanel({ sessionCode, joinUrl, teams, connectedTeamIds, accent, panelBg, borderColor, children, footer, phoneCountByTeam }: PhoneJoinPanelProps) {
  const light = isLightBackground(panelBg);
  return (
    <div style={{ background: panelBg, border: `2px solid ${borderColor}`, borderRadius: "20px", padding: "20px", maxWidth: "360px", marginLeft: "auto", marginRight: "auto", ...(light ? { color: "#1F2937" } : {}) }}>
      <div style={{ fontWeight: "800", fontSize: "14px", color: accent, marginBottom: "12px" }}>📱 Scan to join, or go to the site and enter this code:</div>
      <div style={{ background: "white", borderRadius: "12px", padding: "12px", display: "inline-block", ...(light ? { boxShadow: "0 1px 4px rgba(0,0,0,0.12)" } : {}) }}>
        <QRCodeSVG value={joinUrl} size={160} />
      </div>
      <div style={{ fontSize: "28px", fontWeight: "900", letterSpacing: "0.1em", color: light ? accent : "white", margin: "12px 0" }}>{sessionCode}</div>
      {children}
      <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "10px" }}>
        {teams.map(t => (
          <div key={t.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: light ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.06)", borderRadius: "8px", padding: "6px 10px", fontSize: "13px" }}>
            <span><TeamIcon team={t} /> {t.name}</span>
            <span style={{ color: connectedTeamIds.has(t.id) ? (light ? "#15803D" : "#4ADE80") : "#6B7280", fontWeight: "700" }}>
              {connectedTeamIds.has(t.id)
                ? (phoneCountByTeam && (phoneCountByTeam[String(t.id)] ?? 0) > 0
                    ? `✅ ${phoneCountByTeam[String(t.id)]} phone${phoneCountByTeam[String(t.id)] === 1 ? "" : "s"}`
                    : "✅ Connected")
                : "⏳ Waiting…"}
            </span>
          </div>
        ))}
      </div>
      {footer}
    </div>
  );
}
