import { useEffect, useState } from "react";
import { ADMIN_COLORS as C } from "./adminColors";
import { getGrowthStats, type GrowthStats } from "../../lib/adminDashboard";
import { FREE_LAUNCH_ALL_PREMIUM } from "../../data/constants";

const panelStyle: React.CSSProperties = { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: "16px 18px" };
const rowStyle: React.CSSProperties = { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 11px", background: C.surface2, borderRadius: 9 };

export function AdminBillingPanel() {
  const [stats, setStats] = useState<GrowthStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getGrowthStats().then(setStats).catch(err => setError(err instanceof Error ? err.message : "Couldn't load billing stats."));
  }, []);

  if (error) return <div style={{ color: C.danger, fontSize: 13, fontWeight: 700 }}>{error}</div>;
  if (!stats) return <div style={{ color: C.inkDim, fontSize: 13, fontWeight: 700 }}>Loading…</div>;

  const freeTierCount = stats.total_teachers - stats.real_paid_subs;
  const paidPct = stats.total_teachers > 0 ? (stats.real_paid_subs / stats.total_teachers) * 100 : 0;

  return (
    <>
      {FREE_LAUNCH_ALL_PREMIUM && (
        <div style={{ background: "rgba(14,165,233,0.1)", border: "1px solid rgba(14,165,233,0.35)", borderRadius: 12, padding: "12px 14px", fontSize: 12.5, fontWeight: 700, color: "#7DD3FC", lineHeight: 1.5 }}>
          These numbers reflect real Stripe subscription rows only — they don't reflect actual access. Every teacher currently gets full paid-tier features via the launch-phase override, whether or not they've ever checked out.
        </div>
      )}

      <div style={panelStyle}>
        <h2 style={{ margin: "0 0 2px", fontSize: 13.5, fontWeight: 900 }}>Billing snapshot</h2>
        <p style={{ margin: "0 0 14px", fontSize: 11.5, color: C.inkDim, fontWeight: 600 }}>From public.subscriptions and public.promo_codes</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={rowStyle}>
            <div><div style={{ fontSize: 12, fontWeight: 800 }}>Active paid</div><div style={{ fontSize: 10.5, color: C.inkFaint, fontWeight: 700 }}>status = active or trialing</div></div>
            <div style={{ fontSize: 12.5, fontWeight: 900, color: "#FCD34D" }}>{stats.real_paid_subs}</div>
          </div>
          <div style={rowStyle}>
            <div><div style={{ fontSize: 12, fontWeight: 800 }}>No Stripe subscription</div><div style={{ fontSize: 10.5, color: C.inkFaint, fontWeight: 700 }}>never checked out (not "restricted")</div></div>
            <div style={{ fontSize: 12.5, fontWeight: 900, color: "#FCD34D" }}>{freeTierCount}</div>
          </div>
          <div style={rowStyle}>
            <div><div style={{ fontSize: 12, fontWeight: 800 }}>Promo codes redeemed</div><div style={{ fontSize: 10.5, color: C.inkFaint, fontWeight: 700 }}>sum of times_redeemed</div></div>
            <div style={{ fontSize: 12.5, fontWeight: 900, color: "#FCD34D" }}>{stats.promo_redeemed_total}</div>
          </div>
        </div>
      </div>

      <div style={panelStyle}>
        <h2 style={{ margin: "0 0 2px", fontSize: 13.5, fontWeight: 900 }}>Real paid vs. everyone else</h2>
        <p style={{ margin: "0 0 14px", fontSize: 11.5, color: C.inkDim, fontWeight: 600 }}>{stats.total_teachers} teacher accounts total</p>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <div style={{ width: 9, height: 9, borderRadius: 3, background: "#0EA5E9", flexShrink: 0 }} />
          <div style={{ flex: 1, fontSize: 12.5, fontWeight: 700, color: C.inkDim }}>Real paid subscription</div>
          <div style={{ fontSize: 13, fontWeight: 900, fontVariantNumeric: "tabular-nums" }}>{stats.real_paid_subs}</div>
        </div>
        <div style={{ height: 6, borderRadius: 99, background: C.surface3, overflow: "hidden", marginBottom: 12 }}>
          <div style={{ height: "100%", borderRadius: 99, width: `${paidPct}%`, background: "linear-gradient(90deg,#38BDF8,#0369A1)" }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <div style={{ width: 9, height: 9, borderRadius: 3, background: "#F59E0B", flexShrink: 0 }} />
          <div style={{ flex: 1, fontSize: 12.5, fontWeight: 700, color: C.inkDim }}>No subscription (launch-phase full access)</div>
          <div style={{ fontSize: 13, fontWeight: 900, fontVariantNumeric: "tabular-nums" }}>{freeTierCount}</div>
        </div>
        <div style={{ height: 6, borderRadius: 99, background: C.surface3, overflow: "hidden" }}>
          <div style={{ height: "100%", borderRadius: 99, width: `${100 - paidPct}%`, background: "linear-gradient(90deg,#FBBF24,#D97706)" }} />
        </div>
      </div>
    </>
  );
}
