import { useEffect, useState } from "react";
import { getProfile } from "../../lib/profile";

// Shared-chrome-only, paid-plan perk (welcome/setup/game-select/results/classes/profile/billing/
// learn) — mirrors FeedbackButton's exact placement rule, deliberately never shown during
// screen === "game" (games keep their own fixed visual identity, never themed or branded).
// Fixed to the opposite corner from FeedbackButton so the two never collide.
export function BrandBadge({ isPaid }: { isPaid: boolean }) {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!isPaid) return;
    getProfile().then(p => setLogoUrl(p.org_logo_url)).catch(() => {});
  }, [isPaid]);

  if (!isPaid || !logoUrl) return null;

  return (
    <img
      src={logoUrl} alt="School logo"
      style={{
        position: "fixed", right: "16px", bottom: "16px", zIndex: 1500,
        maxHeight: "88px", maxWidth: "260px", objectFit: "contain",
        borderRadius: "10px", background: "rgba(255,255,255,0.95)", padding: "8px 14px",
        boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
      }}
    />
  );
}
