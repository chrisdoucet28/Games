import { useEffect, useState } from "react";
import { AdminFeedbackPanel } from "./AdminFeedbackPanel";
import { AdminContentPanel } from "./AdminContentPanel";
import { AdminAssetsPanel } from "./AdminAssetsPanel";
import { ADMIN_COLORS } from "./adminColors";
import { listFeedback, markFeedbackReviewed, type FeedbackRow } from "../../lib/adminFeedback";

type View = "feedback" | "growth" | "content" | "assets" | "billing" | "classes";

const NAV_GROUPS: { label: string; items: { key: View; icon: string; label: string }[] }[] = [
  { label: "Overview", items: [
    { key: "growth", icon: "📈", label: "Growth" },
    { key: "billing", icon: "💳", label: "Billing" },
  ] },
  { label: "Manage", items: [
    { key: "feedback", icon: "🚩", label: "Feedback Inbox" },
    { key: "classes", icon: "🏫", label: "Teachers & Classes" },
    { key: "content", icon: "📚", label: "Content & Topics" },
    { key: "assets", icon: "🎨", label: "Assets" },
  ] },
];

const TOPBAR: Record<View, { title: string; sub: string }> = {
  feedback: { title: "Feedback Inbox", sub: "Flagged prompts + general notes teachers send from inside the app" },
  growth: { title: "Growth", sub: "Not sketched yet — next up if this is worth building for real" },
  billing: { title: "Billing", sub: "Not sketched yet — next up if this is worth building for real" },
  classes: { title: "Teachers & Classes", sub: "Not sketched yet — next up if this is worth building for real" },
  content: { title: "Content & Topics", sub: "Every topic in the game/Learn library, with live Learn-parity check" },
  assets: { title: "Assets", sub: "Every mascot and game icon, rendered live — plus marketing artifact links" },
};

type Props = { userEmail: string | null; onExit: () => void };

export function AdminScreen({ userEmail, onExit }: Props) {
  const [view, setView] = useState<View>("feedback");
  const [feedback, setFeedback] = useState<FeedbackRow[] | null>(null);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  const refreshFeedback = () => {
    listFeedback()
      .then(setFeedback)
      .catch(err => setFeedbackError(err instanceof Error ? err.message : "Couldn't load feedback."));
  };
  useEffect(refreshFeedback, []);

  const handleMarkReviewed = async (id: string) => {
    setFeedback(prev => prev?.map(f => (f.id === id ? { ...f, status: "reviewed" as const } : f)) ?? prev);
    try {
      await markFeedbackReviewed(id);
    } catch (err) {
      setFeedbackError(err instanceof Error ? err.message : "Couldn't update that item.");
      refreshFeedback();
    }
  };

  const newCount = feedback?.filter(f => f.status === "new").length ?? 0;
  const topbar = TOPBAR[view];

  return (
    <div style={{ minHeight: "100vh", background: ADMIN_COLORS.bg, color: ADMIN_COLORS.ink, fontFamily: "'Segoe UI',system-ui,-apple-system,sans-serif" }}>
      <div style={{ width: "100%", overflowX: "auto" }}>
        <div style={{ display: "flex", minWidth: 1220, minHeight: "100vh" }}>
          <div style={{ width: 220, flexShrink: 0, background: ADMIN_COLORS.surface, borderRight: `1px solid ${ADMIN_COLORS.border}`, display: "flex", flexDirection: "column", padding: "20px 14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 8px 22px" }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(160deg,#0C1E3D,#0369A1)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 15, color: "#FCD34D", border: `2px solid ${ADMIN_COLORS.border}`, flexShrink: 0 }}>C</div>
              <div>
                <div style={{ fontWeight: 900, fontSize: 16, letterSpacing: "-0.01em" }}>Class<b style={{ color: "#FCD34D" }}>Cade</b></div>
                <div style={{ fontSize: 11, color: ADMIN_COLORS.inkFaint, fontWeight: 700, letterSpacing: "0.03em", marginTop: 1 }}>ADMIN</div>
              </div>
            </div>

            {NAV_GROUPS.map(group => (
              <div key={group.label}>
                <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: ADMIN_COLORS.inkFaint, padding: "16px 10px 6px" }}>{group.label}</div>
                {group.items.map(item => {
                  const active = view === item.key;
                  const badge = item.key === "feedback" ? newCount : 0;
                  return (
                    <button
                      key={item.key}
                      onClick={() => setView(item.key)}
                      style={{
                        display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", borderRadius: 10,
                        fontSize: 13.5, fontWeight: 700, color: active ? "#7DD3FC" : ADMIN_COLORS.inkDim, cursor: "pointer",
                        border: `1px solid ${active ? "rgba(14,165,233,0.35)" : "transparent"}`,
                        background: active ? "linear-gradient(135deg, rgba(14,165,233,0.18), rgba(3,105,161,0.1))" : "none",
                        width: "100%", textAlign: "left", fontFamily: "inherit", marginBottom: 2,
                      }}
                    >
                      <span style={{ width: 18, textAlign: "center", fontSize: 14, flexShrink: 0 }}>{item.icon}</span>
                      {item.label}
                      {badge > 0 && <span style={{ marginLeft: "auto", background: ADMIN_COLORS.danger, color: "white", fontSize: 10.5, fontWeight: 900, borderRadius: 999, padding: "1px 7px" }}>{badge}</span>}
                    </button>
                  );
                })}
              </div>
            ))}

            <div style={{ marginTop: "auto", padding: "12px 10px 4px", borderTop: `1px solid ${ADMIN_COLORS.border}` }}>
              <button
                onClick={onExit}
                style={{ background: "none", border: "none", color: ADMIN_COLORS.inkDim, fontSize: 11.5, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", padding: 0, marginBottom: 8, display: "block" }}
              >
                ← Back to ClassCade
              </button>
              <div style={{ fontSize: 11.5, color: ADMIN_COLORS.inkFaint, fontWeight: 700, wordBreak: "break-all" }}>{userEmail}</div>
            </div>
          </div>

          <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 28px", borderBottom: `1px solid ${ADMIN_COLORS.border}` }}>
              <div>
                <h1 style={{ margin: 0, fontSize: 20, fontWeight: 900, letterSpacing: "-0.01em" }}>{topbar.title}</h1>
                <p style={{ margin: "3px 0 0", fontSize: 12, color: ADMIN_COLORS.inkDim, fontWeight: 600 }}>{topbar.sub}</p>
              </div>
            </div>

            <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "20px 28px", display: "flex", flexDirection: "column", gap: 14 }}>
              {view === "feedback" && (
                <AdminFeedbackPanel rows={feedback} error={feedbackError} onMarkReviewed={handleMarkReviewed} />
              )}
              {view === "content" && <AdminContentPanel />}
              {view === "assets" && <AdminAssetsPanel />}
              {(view === "growth" || view === "billing" || view === "classes") && (
                <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, color: ADMIN_COLORS.inkFaint }}>
                  <div style={{ fontSize: 34, opacity: 0.6 }}>🧭</div>
                  <b style={{ color: ADMIN_COLORS.inkDim, fontSize: 14 }}>Not sketched yet</b>
                  <div>This is just a first look at the pieces that were worth building for real.</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
