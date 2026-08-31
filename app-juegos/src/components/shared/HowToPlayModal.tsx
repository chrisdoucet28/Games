import { useState } from "react";
import type { TutorialStep } from "../../types";
import { Icon, type IconName } from "./Icon";

interface HowToPlayModalProps {
  gameName: string;
  gameIcon: IconName;
  accentColor: string;
  steps: TutorialStep[];
  onClose: () => void;
}

// Fixed regardless of game — one consistent "host" identity across every tutorial, distinct from
// every TEAM_COLORS/GAME_MODES/SOLO_CPU_COLOR/TEACHER_COLOR value already in use elsewhere, so it
// never reads as a team, the CPU opponent, or the solo-mode Teacher stand-in.
const GUIDE_COLOR = "#7C3AED";

export function HowToPlayModal({ gameName, gameIcon, accentColor, steps, onClose }: HowToPlayModalProps) {
  const [stepIdx, setStepIdx] = useState(0);
  const step = steps[stepIdx];
  if (!step) return null;
  const isLast = stepIdx === steps.length - 1;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000, padding: "20px" }}>
      <div style={{ background: "white", borderRadius: "20px", padding: "24px", maxWidth: "520px", width: "100%", maxHeight: "86vh", overflowY: "auto", fontFamily: "'Segoe UI',system-ui,sans-serif" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
          <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 900, color: "#1F2937", display: "flex", alignItems: "center", gap: "8px" }}><Icon name={gameIcon} size={18} color={accentColor} /> {gameName} — How to Play</h3>
          <button onClick={onClose} aria-label="Close" style={{ background: "none", border: "none", color: "#9CA3AF", cursor: "pointer", lineHeight: 1, padding: "4px" }}><Icon name="close" size={16} /></button>
        </div>

        <div style={{ display: "flex", gap: "12px", alignItems: "flex-start", marginBottom: "16px" }}>
          <div style={{ flexShrink: 0, width: "48px", height: "48px", borderRadius: "50%", background: GUIDE_COLOR, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 4px 12px ${GUIDE_COLOR}55` }}>
            <Icon name="learn" size={24} color="white" />
          </div>
          <div style={{ position: "relative", background: `${accentColor}18`, border: `2px solid ${accentColor}`, borderRadius: "14px", borderTopLeftRadius: "4px", padding: "12px 16px", fontSize: "14px", fontWeight: "600", color: "#1F2937", lineHeight: 1.5 }}>
            <div style={{ position: "absolute", left: "-7px", top: "10px", width: 0, height: 0, borderTop: "7px solid transparent", borderBottom: "7px solid transparent", borderRight: `7px solid ${accentColor}` }} />
            {step.narration}
          </div>
        </div>

        <div style={{ background: "white", border: "2px solid #E5E7EB", borderRadius: "16px", padding: "16px", marginBottom: "18px" }}>
          {step.visual}
        </div>

        <div style={{ display: "flex", justifyContent: "center", gap: "6px", marginBottom: "14px" }}>
          {steps.map((_, i) => (
            <button key={i} onClick={() => setStepIdx(i)} aria-label={`Go to step ${i + 1}`} style={{
              width: "9px", height: "9px", borderRadius: "50%", border: "none", padding: 0, cursor: "pointer",
              background: i === stepIdx ? accentColor : "#E5E7EB",
            }} />
          ))}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#9CA3AF", fontWeight: 700, cursor: "pointer", fontSize: "13px" }}>Skip</button>
          <div style={{ display: "flex", gap: "8px" }}>
            {stepIdx > 0 && (
              <button onClick={() => setStepIdx(i => i - 1)} style={{ background: "white", color: "#4B5563", border: "2px solid #E5E7EB", borderRadius: "10px", padding: "10px 18px", fontWeight: 800, cursor: "pointer", fontSize: "14px", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                <Icon name="back" size={13} /> Back
              </button>
            )}
            <button
              onClick={() => (isLast ? onClose() : setStepIdx(i => i + 1))}
              style={{ background: accentColor, color: "white", border: "none", borderRadius: "10px", padding: "10px 22px", fontWeight: 800, cursor: "pointer", fontSize: "14px", display: "inline-flex", alignItems: "center", gap: "6px" }}
            >
              {isLast ? <>Got it! <Icon name="check" size={14} /></> : <>Next <Icon name="next" size={12} /></>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
