import { useEffect, useState } from "react";
import { ADMIN_COLORS as C } from "./adminColors";
import { listAutoFixRuns, type AutoFixRun } from "../../lib/adminDashboard";

// Nothing shown here until the routine's prompt is updated to actually write a row at the end of
// each run (see feedback_autofix_routine memory) — this component itself only reads.
export function AdminAutoFixActivity() {
  const [runs, setRuns] = useState<AutoFixRun[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listAutoFixRuns().then(setRuns).catch(err => setError(err instanceof Error ? err.message : "Couldn't load auto-fix activity."));
  }, []);

  if (error || (runs && runs.length === 0)) return null;
  if (!runs) return null;

  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 13, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ fontSize: 12.5, fontWeight: 800, color: C.ink }}>🤖 Feedback auto-fixer — recent runs</div>
      {runs.map(r => (
        <div key={r.id} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "8px 10px", background: C.surface2, borderRadius: 9 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: C.inkFaint, whiteSpace: "nowrap", paddingTop: 1 }}>
            {new Date(r.ran_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.ink }}>{r.summary}</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.inkFaint, marginTop: 2 }}>
              {r.rows_found} found · <span style={{ color: "#86EFAC" }}>{r.rows_fixed} fixed</span> · {r.rows_skipped} left for you
              {r.had_errors && <span style={{ color: "#FCA5A5" }}> · had errors</span>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
