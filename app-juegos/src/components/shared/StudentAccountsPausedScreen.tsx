import { supabase } from "../../lib/supabaseClient";
import { Icon } from "./Icon";

// Shown in place of the real app whenever STUDENT_ACCOUNTS_PAUSED is on and either the visitor is
// on a phone-width screen (regardless of login state or role) or the logged-in account's role is
// 'student' (regardless of device) — see that flag's own comment in data/constants.ts for the full
// rule. A plain, honest explanation plus a real way forward (the public practice quiz, no login
// needed) rather than a dead end — and a way to log out for anyone who landed here already signed in.
export function StudentAccountsPausedScreen() {
  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg,#0C1E3D 0%,#0369A1 45%,#0EA5E9 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 20px", fontFamily: "'Segoe UI',system-ui,sans-serif" }}>
      <div style={{ maxWidth: "440px", width: "100%", background: "white", borderRadius: "20px", padding: "32px 28px", textAlign: "center", boxShadow: "0 20px 50px rgba(0,0,0,0.3)" }}>
        <div style={{ marginBottom: "14px" }}><Icon name="screen" size={36} color="#0369A1" /></div>
        <h1 style={{ margin: "0 0 12px", fontSize: "20px", fontWeight: 900, color: "#0C1E3D" }}>ClassCade is best on a computer</h1>
        <p style={{ margin: "0 0 24px", fontSize: "14px", lineHeight: 1.6, color: "#374151" }}>
          ClassCade is meant to be accessed by teachers on a computer. On your phone, you'll just experience a demo version you can use to practice.
        </p>
        <a
          href="/practice"
          style={{
            display: "inline-block", background: "linear-gradient(135deg,#F59E0B,#D97706)", color: "white",
            border: "3px solid #0C1E3D", borderRadius: "14px", padding: "13px 28px", fontSize: "15px", fontWeight: 900,
            textDecoration: "none", boxShadow: "4px 4px 0 #0C1E3D",
          }}
        >
          Try the practice demo
        </a>
        <div style={{ marginTop: "20px" }}>
          <button
            onClick={() => supabase.auth.signOut()}
            style={{ background: "none", border: "none", color: "#6B7280", fontSize: "12px", fontWeight: 700, cursor: "pointer", textDecoration: "underline" }}
          >
            Log out
          </button>
        </div>
      </div>
    </div>
  );
}
