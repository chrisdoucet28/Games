import { useEffect } from "react";
import { updateProfile } from "../../lib/profile";
import { hexToRgba, type Theme } from "../../data/themes";
import { Icon, type IconName } from "./Icon";

// Shown once, the very first time an account clears the login gate — the one app-level "here's
// how this works" moment that exists (every other explanation is scoped to a single game's own
// How to Play modal). Sits in the same has_completed_plan_intro slot PlanIntroScreen normally
// occupies; App.tsx shows this one instead while FREE_LAUNCH_ALL_PREMIUM is on, since there's no
// real plan choice to make right now — see that flag's comment in data/constants.ts. When billing
// is turned back on, App.tsx reverts to showing PlanIntroScreen here without any change needed in
// this file.
type Props = {
  theme: Theme;
  onDismiss: (goTo?: "learn") => void;
};

const STEPS: { icon: IconName; title: string; body: string }[] = [
  { icon: "chart", title: "Pick a level & topic", body: "Filter by A1-C1 and grammar, vocabulary, or themes, then choose one or more topics to play with." },
  { icon: "trophy", title: "Set up teams", body: "Name your teams, or just use the ready-made defaults — no setup required to jump straight in." },
  { icon: "controller", title: "Play a game", body: "15 competitive game modes, from silent judgment calls to full spoken sentences — every one built around your chosen topics." },
];

export function WelcomeIntroScreen({ theme, onDismiss }: Props) {
  useEffect(() => {
    document.title = "Welcome - ClassCade";
  }, []);

  // Best-effort, same as PlanIntroScreen's markSeen — a failed write shouldn't trap anyone here.
  const markSeen = () => updateProfile({ hasCompletedPlanIntro: true }).catch(() => {});

  const finish = (goTo?: "learn") => {
    markSeen();
    onDismiss(goTo);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F0F9FF", padding: "32px 20px", fontFamily: "'Segoe UI',system-ui,sans-serif" }}>
      <div style={{ maxWidth: "720px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <Icon name="joystick" size={44} color={theme.accentSolid} style={{ marginBottom: "8px" }} />
          <h2 style={{ fontSize: "32px", fontWeight: "900", color: theme.heroBg[0], margin: 0, fontFamily: theme.headingFont, display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}><Icon name="party" size={26} /> Welcome to ClassCade!</h2>
          <p style={{ color: "#6B7280", marginTop: "10px", fontSize: "15px" }}>Here's the whole flow, in three steps.</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
          {STEPS.map((s, i) => (
            <div key={s.title} style={{ display: "flex", gap: "16px", alignItems: "flex-start", background: "white", border: `2px solid ${hexToRgba(theme.accentSolid, 0.15)}`, borderRadius: "16px", padding: "18px 20px" }}>
              <div style={{ flexShrink: 0, width: "40px", height: "40px", borderRadius: "50%", background: theme.accentSolid, color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "900", fontSize: "17px" }}>{i + 1}</div>
              <div>
                <div style={{ fontWeight: "800", fontSize: "16px", color: "#1F2937", marginBottom: "3px", display: "flex", alignItems: "center", gap: "6px" }}><Icon name={s.icon} size={16} color={theme.accentSolid} /> {s.title}</div>
                <div style={{ fontSize: "14px", color: "#6B7280", lineHeight: 1.5 }}>{s.body}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ background: `linear-gradient(135deg,${hexToRgba(theme.accentSolid, 0.1)},${hexToRgba(theme.accentSolid, 0.04)})`, border: `2px solid ${theme.accentSolid}`, borderRadius: "16px", padding: "22px", marginBottom: "24px" }}>
          <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
            <Icon name="learn" size={30} color={theme.accentSolid} style={{ flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: "900", fontSize: "17px", color: theme.heroBg[0], marginBottom: "4px", fontFamily: theme.headingFont }}>Don't miss the Learn section</div>
              <div style={{ fontSize: "14px", color: "#374151", lineHeight: 1.6, marginBottom: "14px" }}>
                Every topic in the games has a matching Learn lesson — the exact same grammar and vocabulary, explained clearly with examples and common mistakes. Use it to pre-teach a topic before playing, review afterward, or print a handout straight from the page.
              </div>
              <button
                onClick={() => finish("learn")}
                style={{ background: theme.accentSolid, color: "white", border: "none", borderRadius: "12px", padding: "10px 20px", fontWeight: "800", fontSize: "14px", cursor: "pointer", fontFamily: theme.headingFont, display: "inline-flex", alignItems: "center", gap: "6px" }}
              >
                <Icon name="learn" size={14} /> Explore Learn
              </button>
            </div>
          </div>
        </div>

        <div style={{ textAlign: "center" }}>
          <button
            onClick={() => finish()}
            style={{ background: `linear-gradient(135deg,${theme.cta[0]},${theme.cta[1]})`, color: "white", border: "none", borderRadius: "14px", padding: "14px 40px", fontSize: "16px", fontWeight: "900", cursor: "pointer", fontFamily: theme.headingFont, boxShadow: `0 6px 20px ${hexToRgba(theme.cta[1], 0.35)}`, display: "inline-flex", alignItems: "center", gap: "8px" }}
          >
            Let's go! <Icon name="rocket" size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
