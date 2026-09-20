import { useState } from "react";
import { chooseRole } from "../../lib/profile";
import { Icon, type IconName } from "./Icon";

// Shown once per account, right after login, until the account has said whether it's a teacher or a
// student (both email and Google logins land here the same way, since it keys off the profile's
// role_chosen flag rather than anything in the signup form). The choice is made through the
// set_my_role RPC — a database trigger blocks changing it any other way.
const INK = "#0C1E3D";
const SKY = "#0369A1";

type Choice = "teacher" | "student";

const OPTIONS: { role: Choice; icon: IconName; title: string; body: string }[] = [
  { role: "teacher", icon: "school", title: "I'm a teacher", body: "Run classroom games, set up teams and classes, and use the lesson plans." },
  { role: "student", icon: "learn", title: "I'm a student", body: "Practice on your own, finish lessons, and earn badges and levels." },
];

export function RoleChooserScreen({ onChosen }: { onChosen: (role: Choice) => void }) {
  const [selected, setSelected] = useState<Choice | null>(null);
  const [isAdult, setIsAdult] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const confirm = async () => {
    if (!selected || !isAdult) return;
    setSaving(true);
    setError("");
    try {
      await chooseRole(selected);
      onChosen(selected);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong — please try again.");
      setSaving(false);
    }
  };

  const ready = selected !== null && isAdult && !saving;

  return (
    <div style={{ minHeight: "100vh", background: "#F0F9FF", fontFamily: "'Segoe UI',system-ui,sans-serif" }}>
      <div style={{ background: "linear-gradient(160deg,#0C1E3D 0%,#0369A1 45%,#0EA5E9 100%)", padding: "40px 20px 32px", textAlign: "center" }}>
        <h1 style={{ color: "white", fontSize: "26px", fontWeight: 900, margin: 0 }}>Welcome to ClassCade!</h1>
        <p style={{ color: "#BAE6FD", fontSize: "14px", margin: "10px auto 0", maxWidth: "440px", lineHeight: 1.6 }}>
          One quick question so we can set things up for you.
        </p>
      </div>

      <div style={{ maxWidth: "480px", margin: "0 auto", padding: "24px 20px 60px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "18px" }}>
          {OPTIONS.map(o => {
            const active = selected === o.role;
            return (
              <button
                key={o.role}
                onClick={() => setSelected(o.role)}
                style={{
                  display: "flex", alignItems: "center", gap: "14px", textAlign: "left", padding: "18px",
                  borderRadius: "16px", cursor: "pointer", background: active ? "#E0F2FE" : "white",
                  border: `3px solid ${active ? SKY : "#E5E7EB"}`, minHeight: "72px",
                }}
              >
                <span style={{ width: "44px", height: "44px", borderRadius: "50%", background: active ? SKY : "#E0F2FE", color: active ? "white" : SKY, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon name={o.icon} size={22} />
                </span>
                <span>
                  <span style={{ display: "block", fontWeight: 900, fontSize: "17px", color: INK }}>{o.title}</span>
                  <span style={{ display: "block", fontSize: "13px", color: "#4B5563", marginTop: "2px", lineHeight: 1.4 }}>{o.body}</span>
                </span>
              </button>
            );
          })}
        </div>

        <label style={{ display: "flex", alignItems: "flex-start", gap: "10px", fontSize: "13px", color: "#374151", lineHeight: 1.5, marginBottom: "18px", cursor: "pointer" }}>
          <input id="role-adult-confirm" type="checkbox" checked={isAdult} onChange={e => setIsAdult(e.target.checked)} style={{ marginTop: "3px", width: "18px", height: "18px" }} />
          <span>I confirm I'm 18 or older. ClassCade accounts are for adults.</span>
        </label>

        {error && <div role="alert" style={{ background: "#FEE2E2", color: "#991B1B", borderRadius: "10px", padding: "10px 12px", fontSize: "13px", marginBottom: "14px" }}>{error}</div>}

        <button
          onClick={confirm}
          disabled={!ready}
          style={{
            width: "100%", background: ready ? "linear-gradient(135deg,#F59E0B,#D97706)" : "#D1D5DB", color: "white",
            border: `3px solid ${INK}`, borderRadius: "14px", padding: "14px", fontSize: "16px", fontWeight: 900,
            cursor: ready ? "pointer" : "not-allowed", minHeight: "52px",
          }}
        >
          {saving ? "Saving…" : "Continue"}
        </button>
        <p style={{ textAlign: "center", color: "#6B7280", fontSize: "12px", marginTop: "12px" }}>You can switch this later from your profile.</p>
      </div>
    </div>
  );
}
