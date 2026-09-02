import { useEffect, useState } from "react";
import { TeamIcon } from "./TeamIcon";
import { Icon } from "./Icon";
import type { LeaderboardEntry } from "../../types";
import { getLeaderboard } from "../../lib/leaderboard";
import { hexToRgba, type Theme } from "../../data/themes";
import { denseRank } from "../../utils/ranking";

type Props = {
  onBack: () => void;
  theme: Theme;
};

const RANK_ICON: Record<number, "crown" | "medal"> = { 0: "crown", 1: "medal", 2: "medal" };
const RANK_COLOR: Record<number, string> = { 0: "#F59E0B", 1: "#94A3B8", 2: "#B45309" };

export function LeaderboardScreen({ onBack, theme }: Props) {
  const [entries, setEntries] = useState<LeaderboardEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getLeaderboard()
      .then(setEntries)
      .catch(err => setError(err instanceof Error ? err.message : "Couldn't load the Leaderboard."));
  }, []);

  const ranked = entries ? denseRank(entries, e => e.score).sort((a, b) => b.value - a.value) : null;

  return (
    <div style={{ minHeight: "100vh", background: "#F0F9FF", padding: "20px", fontFamily: "'Segoe UI',system-ui,sans-serif" }}>
      <div style={{ maxWidth: "560px", margin: "0 auto" }}>
        <button onClick={onBack} style={{ background: "none", border: `2px solid ${theme.accentSolid}`, color: theme.accentSolid, borderRadius: "10px", padding: "8px 16px", cursor: "pointer", fontWeight: "700", marginBottom: "20px", fontFamily: theme.headingFont, display: "inline-flex", alignItems: "center", gap: "6px" }}><Icon name="back" size={13} /> Back</button>

        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <h2 style={{ fontSize: "30px", fontWeight: "900", color: theme.heroBg[0], margin: 0, fontFamily: theme.headingFont, display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}><Icon name="trophy" size={26} /> Leaderboard</h2>
          <p style={{ color: "#6B7280", marginTop: "8px" }}>Every classroom's teams, ranked by score — team names only, no teacher or school shown. Standings reset every semester.</p>
        </div>

        {error && (
          <div style={{ background: "#FEE2E2", color: "#991B1B", padding: "10px 14px", borderRadius: "10px", fontSize: "13px", marginBottom: "16px" }}>{error}</div>
        )}

        {ranked === null ? (
          <div style={{ textAlign: "center", color: "#6B7280", padding: "40px 0" }}>Loading the Leaderboard…</div>
        ) : ranked.length === 0 ? (
          <div style={{ textAlign: "center", color: "#6B7280", padding: "40px 0" }}>No standings yet this semester — be the first team on the board!</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {ranked.map(({ item, rank, value }, i) => (
              <div
                key={`${item.class_id}-${item.team_name}-${i}`}
                style={{
                  display: "flex", alignItems: "center", gap: "12px", background: "white",
                  border: `2px solid ${rank in RANK_COLOR ? RANK_COLOR[rank] : hexToRgba(theme.accentSolid, 0.2)}`,
                  borderRadius: "14px", padding: "10px 16px",
                }}
              >
                <div style={{ width: "28px", textAlign: "center", flexShrink: 0 }}>
                  {rank in RANK_ICON ? <Icon name={RANK_ICON[rank]} size={20} color={RANK_COLOR[rank]} /> : <span style={{ fontWeight: "800", color: "#9CA3AF", fontSize: "14px" }}>{rank + 1}</span>}
                </div>
                <TeamIcon team={{ mascot: item.mascot, color: item.team_color }} size={26} />
                <div style={{ flex: 1, fontWeight: "800", color: "#1E1B4B", fontFamily: theme.headingFont, fontSize: "15px" }}>{item.team_name}</div>
                <div style={{ fontWeight: "900", color: theme.accentSolid, fontSize: "16px", fontFamily: theme.headingFont }}>{value}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
