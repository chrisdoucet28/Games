import { useEffect } from "react";
import { updateProfile } from "../../lib/profile";
import { hexToRgba, type Theme } from "../../data/themes";
import { Icon, type IconName } from "./Icon";
import { setMusicContext } from "../../lib/music";

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

// Two genuinely different entry points, not sequential steps — a teacher picks whichever fits
// today's lesson, so this is framed as a fork (mirroring the welcome screen's own two-tier CTA)
// rather than a numbered flow. Each carries the same short time-expectation hint the welcome
// screen's buttons show, since this is the very first thing a new teacher sees and shouldn't have
// to guess how much class time either path actually takes before trying it.
const PATHS: { icon: IconName; title: string; hint: string; body: string }[] = [
  { icon: "rocket", title: "Start a Game", hint: "Perfect for the last 30 minutes of class!", body: "Pick a level and topic, set up teams (or use the ready-made defaults), and play — 15 competitive game modes, zero prep." },
  { icon: "school", title: "Lesson Plans", hint: "~30 min lesson + ~30 min playing", body: "A full presentation-practice-production lesson on one topic, then a button at the end drops your class straight into a game on that same topic — no re-picking anything." },
];

export function WelcomeIntroScreen({ theme, onDismiss }: Props) {
  useEffect(() => {
    document.title = "Welcome - ClassCade";
    // Shown before LessonGamesGenerator ever mounts, so its own screen-based music effect can't
    // reach this one moment — set the same "ambient" default here so there's no silent gap.
    setMusicContext("ambient");
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
          <p style={{ color: "#6B7280", marginTop: "10px", fontSize: "15px" }}>There are two ways to start a class — pick whichever fits today's lesson.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: "14px", marginBottom: "24px" }}>
          {PATHS.map(p => (
            <div key={p.title} style={{ background: "white", border: `2px solid ${hexToRgba(theme.accentSolid, 0.15)}`, borderRadius: "16px", padding: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                <div style={{ flexShrink: 0, width: "40px", height: "40px", borderRadius: "50%", background: theme.accentSolid, color: "white", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name={p.icon} size={18} /></div>
                <div style={{ fontWeight: "900", fontSize: "17px", color: "#1F2937", fontFamily: theme.headingFont }}>{p.title}</div>
              </div>
              <div style={{ color: theme.accentSolid, fontWeight: "800", fontSize: "13px", marginBottom: "8px" }}>{p.hint}</div>
              <div style={{ fontSize: "14px", color: "#6B7280", lineHeight: 1.5 }}>{p.body}</div>
            </div>
          ))}
        </div>

        {/* Demoted from a big highlighted callout to one quiet line, deliberately — with the
            two-path fork right above it, giving Learn the same visual weight risked reading as a
            competing third option ("wait, is this a third way to start a class?") instead of what
            it actually is: a quick-reference/printable resource either path can use, not a
            separate path of its own. Still gets a real, clickable mention on the one screen every
            new teacher is guaranteed to see, just without competing with the fork above. */}
        <div style={{ textAlign: "center", color: "#6B7280", fontSize: "13px", marginBottom: "24px" }}>
          Every topic also has a matching{" "}
          <button
            onClick={() => finish("learn")}
            style={{ background: "none", border: "none", color: theme.accentSolid, fontWeight: "800", cursor: "pointer", padding: 0, fontSize: "13px", textDecoration: "underline", fontFamily: "inherit" }}
          >
            Learn lesson
          </button>{" "}
          for quick reference or a printable handout.
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
