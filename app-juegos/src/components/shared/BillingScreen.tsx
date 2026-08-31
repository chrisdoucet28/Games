import { useEffect, useState } from "react";
import type { Subscription } from "../../types";
import { getSubscription, isPaidStatus, startCheckout, openBillingPortal, redeemPromoCode } from "../../lib/subscription";
import { hexToRgba, type Theme } from "../../data/themes";
import { Icon } from "./Icon";

type Props = {
  onBack: () => void;
  theme: Theme;
  subscription: Subscription;
  onSubscriptionChange: (s: Subscription) => void;
  // Set once, right after a Stripe checkout redirect lands here — see App.tsx's checkoutRedirect.
  justReturnedFrom?: "success" | "cancel" | null;
};

export function BillingScreen({ onBack, theme, subscription, onSubscriptionChange, justReturnedFrom }: Props) {
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "annual">("monthly");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [promoCode, setPromoCode] = useState("");
  const [promoBusy, setPromoBusy] = useState(false);
  const [promoSuccess, setPromoSuccess] = useState(false);

  const paid = isPaidStatus(subscription.status);

  useEffect(() => {
    // Refetch on every visit — covers landing here right after a checkout redirect, where the
    // webhook may only just have fired (or still be a beat behind).
    getSubscription().then(onSubscriptionChange).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUpgrade = async () => {
    setBusy(true);
    setError(null);
    try {
      await startCheckout(selectedPlan);
      // Redirects the browser away on success — nothing left to do here.
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't start checkout.");
      setBusy(false);
    }
  };

  const handleManage = async () => {
    setBusy(true);
    setError(null);
    try {
      await openBillingPortal();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't open the billing portal.");
      setBusy(false);
    }
  };

  const handleRedeemPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoCode.trim()) return;
    setPromoBusy(true);
    setError(null);
    setPromoSuccess(false);
    try {
      await redeemPromoCode(promoCode.trim());
      onSubscriptionChange(await getSubscription());
      setPromoSuccess(true);
      setPromoCode("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't redeem that code.");
    } finally {
      setPromoBusy(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F0F9FF", padding: "20px", fontFamily: "'Segoe UI',system-ui,sans-serif" }}>
      <div style={{ maxWidth: "480px", margin: "0 auto" }}>
        <button onClick={onBack} style={{ background: "none", border: `2px solid ${theme.accentSolid}`, color: theme.accentSolid, borderRadius: "10px", padding: "8px 16px", cursor: "pointer", fontWeight: "700", marginBottom: "20px", fontFamily: theme.headingFont, display: "inline-flex", alignItems: "center", gap: "6px" }}><Icon name="back" size={13} /> Back</button>

        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <h2 style={{ fontSize: "30px", fontWeight: "900", color: theme.heroBg[0], margin: 0, fontFamily: theme.headingFont, display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}><Icon name="gem" size={26} /> My Plan</h2>
          <p style={{ color: "#6B7280", marginTop: "8px" }}>
            {paid ? "You have full access — unlimited classes and up to 5 teams." : "Free plan: 1 class, up to 2 teams per game."}
          </p>
        </div>

        {justReturnedFrom === "success" && (
          <div style={{ background: "#DCFCE7", color: "#14532D", padding: "12px 16px", borderRadius: "12px", fontSize: "14px", marginBottom: "16px", fontWeight: "700", textAlign: "center" }}>
            {paid ? <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}><Icon name="party" size={15} /> You're upgraded! Thanks for supporting ClassCade.</span> : "Payment received — confirming your upgrade, this can take a few seconds. Refresh if it doesn't update shortly."}
          </div>
        )}
        {justReturnedFrom === "cancel" && (
          <div style={{ background: "#FEF3C7", color: "#78350F", padding: "12px 16px", borderRadius: "12px", fontSize: "14px", marginBottom: "16px", fontWeight: "700", textAlign: "center" }}>
            Checkout cancelled — no charge was made.
          </div>
        )}

        {error && (
          <div style={{ background: "#FEE2E2", color: "#991B1B", padding: "10px 14px", borderRadius: "10px", fontSize: "13px", marginBottom: "16px" }}>{error}</div>
        )}

        <div style={{ background: "white", border: `2px solid ${hexToRgba(theme.accentSolid, 0.25)}`, borderRadius: "16px", padding: "20px", marginBottom: "16px" }}>
          {paid ? (
            <>
              <div style={{ fontWeight: "800", fontSize: "16px", color: theme.heroBg[0], marginBottom: "6px" }}>
                {subscription.plan === "promo" ? <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}><Icon name="gift" size={15} /> Promo access</span> : subscription.plan === "annual" ? "Annual plan" : "Monthly plan"}
              </div>
              {subscription.currentPeriodEnd && (
                <div style={{ color: "#6B7280", fontSize: "13px", marginBottom: "16px" }}>
                  Renews {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                </div>
              )}
              {subscription.plan !== "promo" && (
                <button
                  onClick={handleManage} disabled={busy}
                  style={{ width: "100%", background: `linear-gradient(135deg,${theme.accent[0]},${theme.accent[1]})`, color: "white", border: "none", borderRadius: "12px", padding: "12px", fontSize: "15px", fontWeight: "800", cursor: busy ? "default" : "pointer", opacity: busy ? 0.7 : 1, fontFamily: theme.headingFont }}
                >
                  {busy ? "Opening…" : "Manage Subscription"}
                </button>
              )}
            </>
          ) : (
            <>
              <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
                <button
                  onClick={() => setSelectedPlan("monthly")}
                  style={{ flex: 1, background: selectedPlan === "monthly" ? theme.accentSolid : "white", color: selectedPlan === "monthly" ? "white" : "#374151", border: `2px solid ${selectedPlan === "monthly" ? theme.accentSolid : "#D1D5DB"}`, borderRadius: "10px", padding: "12px", fontWeight: "800", cursor: "pointer" }}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setSelectedPlan("annual")}
                  style={{ flex: 1, background: selectedPlan === "annual" ? theme.accentSolid : "white", color: selectedPlan === "annual" ? "white" : "#374151", border: `2px solid ${selectedPlan === "annual" ? theme.accentSolid : "#D1D5DB"}`, borderRadius: "10px", padding: "12px", fontWeight: "800", cursor: "pointer" }}
                >
                  Annual <span style={{ fontSize: "11px", fontWeight: "700" }}>(save)</span>
                </button>
              </div>
              <button
                onClick={handleUpgrade} disabled={busy}
                style={{ width: "100%", background: `linear-gradient(135deg,${theme.cta[0]},${theme.cta[1]})`, color: "white", border: "none", borderRadius: "12px", padding: "12px", fontSize: "15px", fontWeight: "800", cursor: busy ? "default" : "pointer", opacity: busy ? 0.7 : 1, fontFamily: theme.headingFont, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
              >
                {busy ? "Redirecting…" : <><Icon name="gem" size={15} /> Upgrade</>}
              </button>
            </>
          )}
        </div>

        {!paid && (
          <div style={{ background: "white", border: `2px solid ${hexToRgba(theme.accentSolid, 0.25)}`, borderRadius: "16px", padding: "20px" }}>
            <div style={{ fontWeight: "800", fontSize: "14px", color: theme.heroBg[0], marginBottom: "10px" }}>Have a promo code?</div>
            <form onSubmit={handleRedeemPromo} style={{ display: "flex", gap: "8px" }}>
              <input
                value={promoCode} onChange={e => setPromoCode(e.target.value)} placeholder="e.g. FRIENDS2026"
                style={{ flex: 1, padding: "10px 12px", borderRadius: "10px", border: `2px solid ${hexToRgba(theme.accentSolid, 0.25)}`, fontSize: "14px" }}
              />
              <button
                type="submit" disabled={promoBusy || !promoCode.trim()}
                style={{ background: theme.accentSolid, color: "white", border: "none", borderRadius: "10px", padding: "10px 16px", fontWeight: "800", cursor: promoBusy ? "default" : "pointer", opacity: promoBusy || !promoCode.trim() ? 0.6 : 1 }}
              >
                {promoBusy ? "…" : "Redeem"}
              </button>
            </form>
            {promoSuccess && <div style={{ color: "#166534", fontSize: "13px", fontWeight: "700", marginTop: "8px", display: "flex", alignItems: "center", gap: "6px" }}><Icon name="check" size={14} /> Code redeemed — you're upgraded!</div>}
          </div>
        )}
      </div>
    </div>
  );
}
