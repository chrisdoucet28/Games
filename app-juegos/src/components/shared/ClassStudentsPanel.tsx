import { useCallback, useEffect, useState } from "react";
import {
  ensureClassJoinCode, regenerateClassJoinCode, listClassMembers, decideClassMember, removeClassMember,
  type ClassMemberRow,
} from "../../lib/classMembership";
import { hexToRgba, type Theme } from "../../data/themes";
import { Icon } from "./Icon";

// The "Students" section of a class card on My Classes: the class's join code, requests waiting for
// approval, and the approved list. A teacher only ever sees the name a student typed (and pending vs
// approved) — the database never hands over an email or any check-in information. Student accounts
// are optional extras: a class runs identically with none of this in use.
type Props = { classId: string; theme: Theme };

export function ClassStudentsPanel({ classId, theme }: Props) {
  const [open, setOpen] = useState(false);
  const [members, setMembers] = useState<ClassMemberRow[] | null>(null);
  const [code, setCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  // false = the database doesn't have the class-membership feature (yet) — hide the whole section
  // instead of showing a broken button.
  const [available, setAvailable] = useState(true);
  const [copied, setCopied] = useState<"code" | "link" | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const loadMembers = useCallback(async () => {
    try {
      setMembers(await listClassMembers(classId));
      setAvailable(true);
    } catch {
      // A silent failure here just means no badge; opening the panel shows a real message.
      setAvailable(false);
    }
  }, [classId]);

  // Loaded up front (not only when opened) so a waiting request shows as a badge on the closed panel.
  useEffect(() => { loadMembers(); }, [loadMembers]);

  const handleOpen = async () => {
    const next = !open;
    setOpen(next);
    if (!next || code) return;
    setError(null);
    try {
      setCode(await ensureClassJoinCode(classId));
      await loadMembers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't load the class code.");
    }
  };

  const copy = async (what: "code" | "link") => {
    if (!code) return;
    const text = what === "code" ? code : `${window.location.origin}/?joinClass=${code}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(what);
      window.setTimeout(() => setCopied(null), 1600);
    } catch {
      setError("Couldn't copy automatically — select the code and copy it by hand.");
    }
  };

  const handleRegenerate = async () => {
    if (!window.confirm("Make a new code? The old code stops working for new requests. Students already in the class stay in.")) return;
    setError(null);
    try {
      setCode(await regenerateClassJoinCode(classId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't make a new code.");
    }
  };

  const decide = async (m: ClassMemberRow, approve: boolean) => {
    setBusyId(m.id);
    setError(null);
    try {
      await decideClassMember(m.id, approve);
      await loadMembers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't update that request.");
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (m: ClassMemberRow) => {
    if (!window.confirm(`Remove ${m.student_name} from this class?`)) return;
    setBusyId(m.id);
    setError(null);
    try {
      await removeClassMember(m.id);
      await loadMembers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't remove that student.");
    } finally {
      setBusyId(null);
    }
  };

  if (!available && !open) return null;

  const pending = (members ?? []).filter(m => m.status === "pending");
  const approved = (members ?? []).filter(m => m.status === "approved");
  const border = hexToRgba(theme.accentSolid, 0.25);
  const smallBtn: React.CSSProperties = {
    border: `2px solid ${border}`, background: "white", color: theme.accentSolid, borderRadius: "8px",
    padding: "5px 10px", fontSize: "12px", fontWeight: 800, cursor: "pointer", fontFamily: "inherit",
  };

  return (
    <div style={{ marginTop: "12px", borderTop: `1px solid ${hexToRgba(theme.accentSolid, 0.15)}`, paddingTop: "10px" }}>
      <button
        type="button" onClick={handleOpen} aria-expanded={open}
        style={{ background: "none", border: "none", padding: 0, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "8px", color: theme.accentSolid, fontWeight: 800, fontSize: "13px", fontFamily: theme.headingFont }}
      >
        <Icon name="learn" size={14} /> Students
        {approved.length > 0 && <span style={{ color: "#6B7280", fontWeight: 700 }}>· {approved.length}</span>}
        {pending.length > 0 && (
          <span style={{ background: "#EF4444", color: "white", borderRadius: "10px", padding: "1px 8px", fontSize: "11px", fontWeight: 900 }}>
            {pending.length} waiting
          </span>
        )}
        <span style={{ color: "#9CA3AF", fontSize: "11px" }}>{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div style={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ fontSize: "12px", color: "#6B7280", lineHeight: 1.5 }}>
            Students with a ClassCade student account can use this code to ask to join. It's optional — your class works exactly the same without it.
          </div>

          {error && <div role="alert" style={{ background: "#FEE2E2", color: "#991B1B", borderRadius: "8px", padding: "8px 10px", fontSize: "12.5px" }}>{error}</div>}

          {code && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              <span style={{ fontFamily: "'Consolas','Courier New',monospace", fontWeight: 900, fontSize: "22px", letterSpacing: "0.18em", color: "#1E1B4B", background: hexToRgba(theme.accentSolid, 0.08), border: `2px dashed ${border}`, borderRadius: "10px", padding: "4px 12px" }}>
                {code}
              </span>
              <button type="button" onClick={() => copy("code")} style={smallBtn}>{copied === "code" ? "Copied!" : "Copy code"}</button>
              <button type="button" onClick={() => copy("link")} style={smallBtn}>{copied === "link" ? "Copied!" : "Copy link"}</button>
              <button type="button" onClick={handleRegenerate} style={{ ...smallBtn, color: "#6B7280" }}>New code</button>
            </div>
          )}

          {members === null && !error ? (
            <div style={{ fontSize: "12.5px", color: "#9CA3AF" }}>Loading…</div>
          ) : (
            <>
              {pending.length > 0 && (
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 900, color: "#B91C1C", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" }}>Waiting for approval</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    {pending.map(m => (
                      <div key={m.id} style={{ display: "flex", alignItems: "center", gap: "8px", background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "10px", padding: "8px 10px" }}>
                        <span style={{ flex: 1, fontWeight: 800, fontSize: "14px", color: "#1F2937", minWidth: 0, overflowWrap: "anywhere" }}>{m.student_name}</span>
                        <button type="button" disabled={busyId === m.id} onClick={() => decide(m, true)} style={{ ...smallBtn, background: "#16A34A", borderColor: "#16A34A", color: "white" }}>Approve</button>
                        <button type="button" disabled={busyId === m.id} onClick={() => decide(m, false)} style={smallBtn}>Decline</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {approved.length > 0 && (
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 900, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" }}>In this class</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {approved.map(m => (
                      <span key={m.id} style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#F0FDF4", border: "1px solid #BBF7D0", color: "#166534", borderRadius: "999px", padding: "3px 6px 3px 12px", fontSize: "13px", fontWeight: 700 }}>
                        {m.student_name}
                        <button
                          type="button" disabled={busyId === m.id} onClick={() => remove(m)} aria-label={`Remove ${m.student_name}`} title="Remove from class"
                          style={{ background: "none", border: "none", color: "#86EFAC", cursor: "pointer", padding: "0 4px", fontSize: "15px", lineHeight: 1 }}
                        >×</button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {members !== null && pending.length === 0 && approved.length === 0 && (
                <div style={{ fontSize: "12.5px", color: "#9CA3AF" }}>No students yet. Share the code or link above.</div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
