import { useEffect, useMemo, useState } from "react";
import { ADMIN_COLORS as C } from "./adminColors";
import { listTeachers, listMarketingOptIns, type AdminTeacher, type MarketingOptIn } from "../../lib/adminDashboard";
import { FREE_LAUNCH_ALL_PREMIUM } from "../../data/constants";

// The opted-in email list, as a CSV any email tool (Mailchimp, Brevo, etc.) can import. Quotes
// every field so a display name with a comma can't shift columns.
function downloadOptInCsv(rows: MarketingOptIn[]) {
  const q = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const lines = ["email,name,opted_in_at", ...rows.map(r => [q(r.email), q(r.display_name ?? ""), q(r.opted_in_at ?? "")].join(","))];
  const url = URL.createObjectURL(new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `classcade-email-list-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

// Its own small card, loaded separately from the teacher table so a database without the
// opt-in migration just hides this card instead of breaking the whole panel.
function EmailListCard() {
  const [rows, setRows] = useState<MarketingOptIn[] | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    listMarketingOptIns().then(setRows).catch(() => setRows(null));
  }, []);

  if (!rows) return null;

  const copyEmails = async () => {
    try {
      await navigator.clipboard.writeText(rows.map(r => r.email).join(", "));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* clipboard blocked */ }
  };

  const btn: React.CSSProperties = { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "6px 12px", fontSize: 12, fontWeight: 800, color: C.ink, cursor: rows.length ? "pointer" : "default", opacity: rows.length ? 1 : 0.5, fontFamily: "inherit" };

  return (
    <div style={{ display: "flex", gap: 10, alignItems: "center", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 13, padding: "12px 16px" }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: C.ink }}>📧 Email list: {rows.length} opted in</div>
        <div style={{ fontSize: 11.5, fontWeight: 700, color: C.inkFaint, marginTop: 2 }}>Only these teachers agreed to marketing email. Nobody else gets one.</div>
      </div>
      <button type="button" disabled={!rows.length} onClick={copyEmails} style={btn}>{copied ? "Copied!" : "Copy emails"}</button>
      <button type="button" disabled={!rows.length} onClick={() => downloadOptInCsv(rows)} style={btn}>Download CSV</button>
    </div>
  );
}

// Browse + look-up only for now — no write actions (change a subscription, etc.) yet. The owner
// wants that eventually, but scoped it out of this first pass; adding it later just means a new
// action column here calling a new admin-gated RPC, same shape as every other admin function.
export function AdminTeachersPanel() {
  const [teachers, setTeachers] = useState<AdminTeacher[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    listTeachers().then(setTeachers).catch(err => setError(err instanceof Error ? err.message : "Couldn't load teachers."));
  }, []);

  const filtered = useMemo(() => {
    if (!teachers) return [];
    const term = search.trim().toLowerCase();
    if (!term) return teachers;
    return teachers.filter(t => (t.display_name ?? "").toLowerCase().includes(term) || t.email.toLowerCase().includes(term));
  }, [teachers, search]);

  if (error) return <div style={{ color: C.danger, fontSize: 13, fontWeight: 700 }}>{error}</div>;
  if (!teachers) return <div style={{ color: C.inkDim, fontSize: 13, fontWeight: 700 }}>Loading…</div>;

  return (
    <>
      <EmailListCard />
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <span style={{ fontSize: 11.5, fontWeight: 800, padding: "6px 11px", borderRadius: 999, border: `1px solid ${C.border}`, color: C.inkDim }}>
          {teachers.length} teachers
        </span>
        <div style={{ flex: 1 }} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="🔍 Search name or email…"
          style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "7px 12px", fontSize: 12, color: C.ink, width: 240, fontFamily: "inherit" }}
        />
      </div>

      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 13, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1.6fr 110px 90px 90px", padding: "10px 16px", fontSize: 10.5, fontWeight: 800, color: C.inkFaint, textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: `1px solid ${C.border}` }}>
          <div>Name</div><div>Email</div><div>Joined</div><div>Plan</div><div>Classes</div>
        </div>
        {filtered.map(t => (
          <div key={t.id} style={{ display: "grid", gridTemplateColumns: "2fr 1.6fr 110px 90px 90px", padding: "10px 16px", fontSize: 12.5, fontWeight: 700, borderBottom: `1px solid ${C.border}`, alignItems: "center" }}>
            <div style={{ color: C.ink }}>{t.display_name || "—"}</div>
            <div style={{ color: C.inkDim, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.email}</div>
            <div style={{ color: C.inkFaint, fontSize: 11.5 }}>{new Date(t.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</div>
            <div>
              {t.is_paid ? (
                <span style={{ fontSize: 10.5, fontWeight: 800, color: "#FCD34D", border: "1px solid rgba(252,211,77,0.4)", borderRadius: 6, padding: "2px 7px" }}>Paid</span>
              ) : (
                <span style={{ fontSize: 10.5, fontWeight: 800, color: C.inkFaint, border: `1px solid ${C.border}`, borderRadius: 6, padding: "2px 7px" }}>
                  Free{FREE_LAUNCH_ALL_PREMIUM ? "*" : ""}
                </span>
              )}
            </div>
            <div style={{ color: C.inkDim }}>{t.class_count}</div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div style={{ color: C.inkFaint, fontSize: 13, fontWeight: 700, textAlign: "center", padding: "30px 0" }}>No teachers match.</div>
        )}
      </div>
      {FREE_LAUNCH_ALL_PREMIUM && (
        <div style={{ fontSize: 11, color: C.inkFaint, fontWeight: 700 }}>* "Free" here just means no Stripe subscription row — the launch-phase override still gives them full access.</div>
      )}
    </>
  );
}
