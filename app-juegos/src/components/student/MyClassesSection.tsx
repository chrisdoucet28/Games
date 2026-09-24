import { useEffect, useState } from "react";
import { getMyClasses, requestJoinClass, leaveClass, type MyClass } from "../../lib/classMembership";
import { peekPendingJoinCode, clearPendingJoinCode } from "../../lib/pendingJoin";
import { TeamIcon } from "../shared/TeamIcon";
import { Icon } from "../shared/Icon";

// "My classes" on the student home — join a teacher's class with its code, and see each class with
// the team you picked in Class Check-In and your check-ins. Entirely optional: a student who never
// uses it (or a class that never uses accounts) loses nothing. The section hides itself if the
// database doesn't have the class-membership feature yet.
const INK = "#0C1E3D";
const SKY = "#0369A1";

function formatDay(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(`${iso}T00:00:00`);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function MyClassesSection({ cardStyle }: { cardStyle: React.CSSProperties }) {
  const [classes, setClasses] = useState<MyClass[] | null>(null);
  const [available, setAvailable] = useState(true);
  const [code, setCode] = useState(() => peekPendingJoinCode() ?? "");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  const refresh = () => getMyClasses().then(setClasses).catch(() => setAvailable(false));
  useEffect(() => { refresh(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      const res = await requestJoinClass(code, name);
      if (!res.ok) {
        setMessage({ kind: "error", text: res.error });
      } else {
        setMessage({
          kind: "ok",
          text: res.status === "approved"
            ? `You're already in ${res.class_name}.`
            : res.already
              ? `You've already asked to join ${res.class_name} — your teacher just needs to approve it.`
              : `Request sent for ${res.class_name}. It'll show as Joined here once your teacher approves it.`,
        });
        setCode("");
        clearPendingJoinCode();
        await refresh();
      }
    } catch (err) {
      setMessage({ kind: "error", text: err instanceof Error ? err.message : "Something went wrong. Please try again." });
    } finally {
      setBusy(false);
    }
  };

  const leave = async (c: MyClass) => {
    if (!window.confirm(`Leave ${c.class_name}?`)) return;
    try {
      await leaveClass(c.class_id);
      await refresh();
    } catch (err) {
      setMessage({ kind: "error", text: err instanceof Error ? err.message : "Couldn't leave the class." });
    }
  };

  if (!available) return null;

  const input: React.CSSProperties = { width: "100%", boxSizing: "border-box", border: "2px solid #BAE6FD", borderRadius: "10px", padding: "10px 12px", fontSize: "15px", fontFamily: "inherit", color: INK };
  const readyToSubmit = code.trim().length > 0 && name.trim().length > 0 && !busy;

  return (
    <div style={cardStyle}>
      <div style={{ fontWeight: 900, fontSize: "16px", color: INK, marginBottom: "4px" }}>My classes</div>
      <div style={{ fontSize: "12.5px", color: "#6B7280", lineHeight: 1.5, marginBottom: "12px" }}>
        Optional. Join your teacher's class to save your team and earn XP for checking in. Your teacher only sees the name you type here.
      </div>

      {classes && classes.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "14px" }}>
          {classes.map(c => (
            <div key={c.class_id} style={{ border: "2px solid #E0F2FE", borderRadius: "14px", padding: "12px 14px", background: c.status === "approved" ? "white" : "#FFFBEB" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px" }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 900, fontSize: "15px", color: INK, overflowWrap: "anywhere" }}>{c.class_name}</div>
                  {(c.teacher_name || c.school) && (
                    <div style={{ fontSize: "12px", color: "#6B7280", marginTop: "1px" }}>
                      {[c.teacher_name, c.school].filter(Boolean).join(" · ")}
                    </div>
                  )}
                </div>
                <span style={{ flexShrink: 0, fontSize: "11px", fontWeight: 900, borderRadius: "999px", padding: "2px 10px", background: c.status === "approved" ? "#DCFCE7" : "#FEF3C7", color: c.status === "approved" ? "#166534" : "#92400E" }}>
                  {c.status === "approved" ? "Joined" : "Waiting for your teacher"}
                </span>
              </div>

              {c.status === "approved" && (
                <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "8px", marginTop: "10px", fontSize: "13px", color: "#374151" }}>
                  {c.team ? (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: c.team.color?.light ?? "#F3F4F6", color: c.team.color?.dark ?? "#374151", borderRadius: "8px", padding: "3px 10px", fontWeight: 800 }}>
                      <TeamIcon team={c.team} size={14} /> {c.team.name}
                    </span>
                  ) : (
                    <span style={{ color: "#9CA3AF" }}>No team yet — it's saved the first time you check in.</span>
                  )}
                  <span style={{ color: "#6B7280" }}>
                    {c.checkins > 0 ? `${c.checkins} check-in${c.checkins === 1 ? "" : "s"} · last ${formatDay(c.last_checkin_on)}` : "No check-ins yet"}
                  </span>
                </div>
              )}

              <div style={{ marginTop: "8px" }}>
                <button type="button" onClick={() => leave(c)} style={{ background: "none", border: "none", padding: 0, color: "#9CA3AF", fontSize: "12px", fontWeight: 700, cursor: "pointer", textDecoration: "underline" }}>
                  {c.status === "approved" ? "Leave class" : "Cancel request"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <div>
          <label htmlFor="join-class-code" style={{ display: "block", fontSize: "12px", fontWeight: 800, color: "#374151", marginBottom: "4px" }}>Class code</label>
          <input
            id="join-class-code" value={code} onChange={e => setCode(e.target.value.toUpperCase())} maxLength={12}
            placeholder="e.g. K7M2QX" autoCapitalize="characters" autoComplete="off" spellCheck={false}
            style={{ ...input, fontFamily: "'Consolas','Courier New',monospace", letterSpacing: "0.12em", fontWeight: 800 }}
          />
        </div>
        <div>
          <label htmlFor="join-class-name" style={{ display: "block", fontSize: "12px", fontWeight: 800, color: "#374151", marginBottom: "4px" }}>Your name (as your teacher knows you)</label>
          <input id="join-class-name" value={name} onChange={e => setName(e.target.value)} maxLength={40} placeholder="e.g. Maria G." autoComplete="name" style={input} />
        </div>
        {message && (
          <div role={message.kind === "error" ? "alert" : "status"} style={{ borderRadius: "10px", padding: "9px 12px", fontSize: "13px", lineHeight: 1.45, background: message.kind === "error" ? "#FEE2E2" : "#DCFCE7", color: message.kind === "error" ? "#991B1B" : "#166534" }}>
            {message.text}
          </div>
        )}
        <button
          type="submit" disabled={!readyToSubmit}
          style={{ background: readyToSubmit ? `linear-gradient(135deg,${SKY},#0EA5E9)` : "#D1D5DB", color: "white", border: `3px solid ${INK}`, borderRadius: "12px", padding: "12px", fontSize: "15px", fontWeight: 900, cursor: readyToSubmit ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
        >
          <Icon name="school" size={16} color="white" /> {busy ? "Sending…" : "Ask to join"}
        </button>
      </form>

      <div style={{ fontSize: "12px", color: "#6B7280", lineHeight: 1.5, marginTop: "12px" }}>
        In class: log in on your phone, then open your teacher's Class Check-In link. Pick your team once and it's remembered. Each day you check in earns 10 XP.
      </div>
    </div>
  );
}
