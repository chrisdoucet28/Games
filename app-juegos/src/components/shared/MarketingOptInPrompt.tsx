import { useState } from "react";
import { setMarketingOptIn } from "../../lib/profile";
import type { Theme } from "../../data/themes";
import { Icon } from "./Icon";

// The one-time "want monthly updates?" question for accounts that never saw the sign-up checkbox
// (everyone who signed up before it existed, plus Google sign-ups whose parked answer got lost).
// A plain strip in normal document flow under the status bar — same reasoning as App.tsx's
// StatusBadge: never position:fixed, so it can't cover a game's own controls. Either answer is
// final; the My Profile toggle is where someone changes their mind later.
export function MarketingOptInPrompt({ theme, onDone }: { theme: Theme; onDone: () => void }) {
  const [busy, setBusy] = useState(false);
  const [thanks, setThanks] = useState(false);

  const answer = async (optIn: boolean) => {
    setBusy(true);
    try {
      await setMarketingOptIn(optIn);
    } catch {
      // A failed save just means they get asked again next time — not worth an error message.
    }
    if (optIn) {
      setThanks(true);
      setTimeout(onDone, 1800);
    } else {
      onDone();
    }
  };

  const btn: React.CSSProperties = {
    border: "none", borderRadius: "10px", padding: "7px 14px", fontSize: "12.5px", fontWeight: 800,
    cursor: busy ? "default" : "pointer", opacity: busy ? 0.7 : 1, fontFamily: theme.headingFont,
  };

  return (
    <div
      className="learn-no-print"
      role="region"
      aria-label="Email updates"
      style={{
        display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", flexWrap: "wrap",
        background: theme.heroBg[1], color: "white", padding: "10px 16px",
        fontFamily: "'Segoe UI',system-ui,sans-serif", fontSize: "13px", borderTop: "1px solid rgba(255,255,255,0.12)",
      }}
    >
      {thanks ? (
        <span style={{ fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "6px" }}>
          <Icon name="check" size={14} /> Thanks! You can change this anytime in My Profile.
        </span>
      ) : (
        <>
          <span style={{ fontWeight: 700 }}>
            Want occasional ClassCade updates? New games, topics and free resources, about once a month.
          </span>
          <button type="button" disabled={busy} onClick={() => answer(true)} style={{ ...btn, background: "#FCD34D", color: "#1F2937" }}>
            Yes, send me updates
          </button>
          <button type="button" disabled={busy} onClick={() => answer(false)} style={{ ...btn, background: "rgba(255,255,255,0.15)", color: "white" }}>
            No thanks
          </button>
        </>
      )}
    </div>
  );
}
