import { Icon } from "./Icon";
import type { Theme } from "../../data/themes";

type Props = { onBack: () => void; theme: Theme };

// Defense-in-depth only -- today ClassesScreen/ProfileScreen/BillingScreen are already unreachable
// by a student account (App.tsx's role gate never mounts LessonGamesGenerator for one), so this
// fallback exists purely to fail safely if that ever regresses (a new deep link, a dev harness, a
// future admin-impersonation feature) rather than silently showing teacher-only billing/branding/
// org content to the wrong account type.
export function RoleRestricted({ onBack, theme }: Props) {
  return (
    <div style={{ minHeight: "100vh", background: "#F0F9FF", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", fontFamily: "'Segoe UI',system-ui,sans-serif" }}>
      <div style={{ maxWidth: "360px", textAlign: "center" }}>
        <p style={{ color: "#6B7280", marginBottom: "16px", fontSize: "14px" }}>This page isn't available for student accounts.</p>
        <button
          onClick={onBack}
          style={{ background: "none", border: `2px solid ${theme.accentSolid}`, color: theme.accentSolid, borderRadius: "10px", padding: "8px 16px", cursor: "pointer", fontWeight: "700", fontFamily: theme.headingFont, display: "inline-flex", alignItems: "center", gap: "6px" }}
        >
          <Icon name="back" size={13} /> Back
        </button>
      </div>
    </div>
  );
}
