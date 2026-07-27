import { useState } from "react";
import type { Subscription } from "../../types";
import { getSubscription, startCheckout, redeemPromoCode } from "../../lib/subscription";
import { updateProfile } from "../../lib/profile";
import { FREE_PLAN_LIMITS } from "../../data/constants";
import { hexToRgba, type Theme } from "../../data/themes";

type Props = {
  theme: Theme;
  onSubscriptionChange: (s: Subscription) => void;
  // Called once the choice is settled locally (Free or promo) — NOT called for Upgrade, since
  // that redirects the browser away to Stripe instead.
  onDismiss: () => void;
};

const FREE_FEATURES = [
  `${FREE_PLAN_LIMITS.maxClasses} class`,
  `Up to ${FREE_PLAN_LIMITS.maxTeams} teams per game`,
  "All 15 game modes",
  "All 105 Learn lessons + printable handouts",
];

const PRO_FEATURES = [
  "Unlimited classes",
  "Up to 5 teams per game",
  "Everything in Free",
];

export function PlanIntroScreen({ theme, onSubscriptionChange, onDismiss }: Props) {
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "annual">("monthly");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [promoCode, setPromoCode] = useState("");
  const [promoBusy, setPromoBusy] = useState(false);

  // Marks the intro as seen regardless of which path the teacher takes, so it never shows again —
  // best-effort: a failure here shouldn't trap anyone on this screen forever.
  const markSeen = () => updateProfile({ hasCompletedPlanIntro: true }).catch(() => {});

  const handleContinueFree = async () => {
    setBusy(true);
    await markSeen();
    onDismiss();
  };

  const handleUpgrade = async () => {
    setBusy(true);
    setError(null);
    try {
      await markSeen();
      await startCheckout(selectedPlan);
      // Redirects the browser away on success — nothing left to do here.
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't start checkout.");
      setBusy(false);
    }
  };

  const handleRedeemPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoCode.trim()) return;
    setPromoBusy(true);
    setError(null);
    try {
      await redeemPromoCode(promoCode.trim());
      await markSeen();
      onSubscriptionChange(await getSubscription());
      onDismiss();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't redeem that code.");
    } finally {
      setPromoBusy(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F0F9FF", padding: "32px 20px", fontFamily: "'Segoe UI',system-ui,sans-serif" }}>
      <div style={{ maxWidth: "720px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <h2 style={{ fontSize: "32px", fontWeight: "900", color: theme.heroBg[0], margin: 0, fontFamily: theme.headingFont }}>🎉 Welcome to ClassCade!</h2>
          <p style={{ color: "#6B7280", marginTop: "10px", fontSize: "15px" }}>Choose how you'd like to get started — you can always change this later.</p>
        </div>

        {error && (
          <div style={{ background: "#FEE2E2", color: "#991B1B", padding: "10px 14px", borderRadius: "10px", fontSize: "13px", marginBottom: "16px", textAlign: "center" }}>{error}</div>
        )}

        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginBottom: "20px" }}>
          <div style={{ flex: "1 1 280px", background: "white", border: `2px solid ${hexToRgba(theme.accentSolid, 0.2)}`, borderRadius: "16px", padding: "24px" }}>
            <div style={{ fontWeight: "900", fontSize: "20px", color: theme.heroBg[0], marginBottom: "4px", fontFamily: theme.headingFont }}>Free</div>
            <div style={{ color: "#9CA3AF", fontSize: "13px", marginBottom: "18px" }}>Get started right away</div>
            <ul style={{ margin: "0 0 22px", padding: 0, listStyle: "none" }}>
              {FREE_FEATURES.map(f => (
                <li key={f} style={{ display: "flex", gap: "8px", fontSize: "14px", color: "#374151", marginBottom: "10px" }}>
                  <span>✅</span> {f}
                </li>
              ))}
            </ul>
            <button
              onClick={handleContinueFree} disabled={busy}
              style={{ width: "100%", background: "white", color: theme.accentSolid, border: `2px solid ${theme.accentSolid}`, borderRadius: "12px", padding: "12px", fontSize: "15px", fontWeight: "800", cursor: busy ? "default" : "pointer", opacity: busy ? 0.7 : 1, fontFamily: theme.headingFont }}
            >
              Continue with Free
            </button>
          </div>

          <div style={{ flex: "1 1 280px", background: "white", border: `2px solid ${theme.accentSolid}`, borderRadius: "16px", padding: "24px", position: "relative" }}>
            <span style={{ position: "absolute", top: "-12px", left: "24px", background: theme.accentSolid, color: "white", borderRadius: "999px", padding: "3px 12px", fontSize: "11px", fontWeight: "800", letterSpacing: "0.03em" }}>RECOMMENDED</span>
            <div style={{ fontWeight: "900", fontSize: "20px", color: theme.heroBg[0], marginBottom: "4px", fontFamily: theme.headingFont, marginTop: "4px" }}>Pro</div>
            <div style={{ color: "#9CA3AF", fontSize: "13px", marginBottom: "18px" }}>For teachers running multiple classes</div>
            <ul style={{ margin: "0 0 18px", padding: 0, listStyle: "none" }}>
              {PRO_FEATURES.map(f => (
                <li key={f} style={{ display: "flex", gap: "8px", fontSize: "14px", color: "#374151", marginBottom: "10px" }}>
                  <span>💎</span> {f}
                </li>
              ))}
            </ul>
            <div style={{ display: "flex", gap: "8px", marginBottom: "14px" }}>
              <button
                onClick={() => setSelectedPlan("monthly")}
                style={{ flex: 1, background: selectedPlan === "monthly" ? theme.accentSolid : "white", color: selectedPlan === "monthly" ? "white" : "#374151", border: `2px solid ${selectedPlan === "monthly" ? theme.accentSolid : "#D1D5DB"}`, borderRadius: "10px", padding: "10px", fontWeight: "800", fontSize: "13px", cursor: "pointer" }}
              >
                Monthly
              </button>
              <button
                onClick={() => setSelectedPlan("annual")}
                style={{ flex: 1, background: selectedPlan === "annual" ? theme.accentSolid : "white", color: selectedPlan === "annual" ? "white" : "#374151", border: `2px solid ${selectedPlan === "annual" ? theme.accentSolid : "#D1D5DB"}`, borderRadius: "10px", padding: "10px", fontWeight: "800", fontSize: "13px", cursor: "pointer" }}
              >
                Annual <span style={{ fontSize: "10px", fontWeight: "700" }}>(save)</span>
              </button>
            </div>
            <button
              onClick={handleUpgrade} disabled={busy}
              style={{ width: "100%", background: `linear-gradient(135deg,${theme.cta[0]},${theme.cta[1]})`, color: "white", border: "none", borderRadius: "12px", padding: "12px", fontSize: "15px", fontWeight: "800", cursor: busy ? "default" : "pointer", opacity: busy ? 0.7 : 1, fontFamily: theme.headingFont, boxShadow: `0 6px 20px ${hexToRgba(theme.cta[1], 0.35)}` }}
            >
              {busy ? "Redirecting…" : "💎 Upgrade"}
            </button>
          </div>
        </div>

        <div style={{ textAlign: "center" }}>
          <form onSubmit={handleRedeemPromo} style={{ display: "inline-flex", gap: "8px" }}>
            <input
              value={promoCode} onChange={e => setPromoCode(e.target.value)} placeholder="Have a promo code?"
              style={{ padding: "10px 12px", borderRadius: "10px", border: `2px solid ${hexToRgba(theme.accentSolid, 0.25)}`, fontSize: "13px", width: "180px" }}
            />
            <button
              type="submit" disabled={promoBusy || !promoCode.trim()}
              style={{ background: theme.accentSolid, color: "white", border: "none", borderRadius: "10px", padding: "10px 16px", fontWeight: "800", fontSize: "13px", cursor: promoBusy ? "default" : "pointer", opacity: promoBusy || !promoCode.trim() ? 0.6 : 1 }}
            >
              {promoBusy ? "…" : "Redeem"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
