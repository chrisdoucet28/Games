import { useEffect, useState } from "react";
import { ADMIN_COLORS as C } from "./adminColors";
import { getGrowthStats, getSignupsByWeek, getMostFlaggedGames, type GrowthStats, type WeeklySignups, type FlaggedGame } from "../../lib/adminDashboard";
import { GAME_MODES, FREE_LAUNCH_ALL_PREMIUM } from "../../data/constants";

const gameLabel = (gameId: string) => {
  if (gameId === "lessonplan") return "Lesson Plan";
  if (gameId === "learn") return "Learn";
  return GAME_MODES.find(g => g.id === gameId)?.name ?? gameId;
};

const tileStyle: React.CSSProperties = { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 13, padding: "14px 16px" };

function Tile({ label, value, sub }: { label: string; value: number; sub?: string }) {
  return (
    <div style={tileStyle}>
      <div style={{ fontSize: 10.5, fontWeight: 800, color: C.inkFaint, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
      <div style={{ fontSize: 25, fontWeight: 900, marginTop: 5, fontVariantNumeric: "tabular-nums" }}>{value}</div>
      {sub && <div style={{ fontSize: 11, fontWeight: 700, marginTop: 4, color: C.inkFaint }}>{sub}</div>}
    </div>
  );
}

function SignupsChart({ weeks }: { weeks: WeeklySignups[] }) {
  const width = 900, height = 150, padding = 20;
  const max = Math.max(1, ...weeks.map(w => w.signups));
  const barWidth = weeks.length > 0 ? (width - padding * 2) / weeks.length : 0;
  return (
    <svg viewBox={`0 0 ${width} ${height + 20}`} width="100%" height={height + 20}>
      <line x1={padding} y1={height} x2={width - padding} y2={height} stroke={C.border} strokeWidth={1} />
      {weeks.map((w, i) => {
        const barHeight = (w.signups / max) * (height - 20);
        const x = padding + i * barWidth;
        const isPeak = w.signups === max && max > 0;
        return (
          <g key={w.week_start}>
            <rect x={x + 4} y={height - barHeight} width={Math.max(barWidth - 8, 2)} height={barHeight} rx={4} fill={isPeak ? "#38BDF8" : "#24365A"} />
            <text x={x + barWidth / 2} y={height - barHeight - 6} textAnchor="middle" fontSize={10.5} fontWeight={900} fill={isPeak ? "#7DD3FC" : C.inkDim}>{w.signups}</text>
            <text x={x + barWidth / 2} y={height + 14} textAnchor="middle" fontSize={9.5} fontWeight={700} fill={C.inkFaint}>
              {new Date(w.week_start).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function AdminGrowthPanel() {
  const [stats, setStats] = useState<GrowthStats | null>(null);
  const [weeks, setWeeks] = useState<WeeklySignups[] | null>(null);
  const [games, setGames] = useState<FlaggedGame[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getGrowthStats(), getSignupsByWeek(), getMostFlaggedGames()])
      .then(([s, w, g]) => { setStats(s); setWeeks(w); setGames(g); })
      .catch(err => setError(err instanceof Error ? err.message : "Couldn't load growth stats."));
  }, []);

  if (error) return <div style={{ color: C.danger, fontSize: 13, fontWeight: 700 }}>{error}</div>;
  if (!stats || !weeks || !games) return <div style={{ color: C.inkDim, fontSize: 13, fontWeight: 700 }}>Loading…</div>;

  const freeTierCount = stats.total_teachers - stats.real_paid_subs;

  return (
    <>
      {FREE_LAUNCH_ALL_PREMIUM && (
        <div style={{ background: "rgba(14,165,233,0.1)", border: "1px solid rgba(14,165,233,0.35)", borderRadius: 12, padding: "12px 14px", fontSize: 12.5, fontWeight: 700, color: "#7DD3FC", lineHeight: 1.5 }}>
          Launch-phase override is ON (<code>FREE_LAUNCH_ALL_PREMIUM</code>) — every teacher currently has full paid-tier access (5 teams, unlimited classes up to the 20-class launch cap, no upgrade prompts) regardless of the numbers below. {stats.real_paid_subs} {stats.real_paid_subs === 1 ? "has" : "have"} a real Stripe subscription; the other {freeTierCount} simply never checked out — none of the {stats.total_teachers} teachers are actually restricted right now.
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 11 }}>
        <Tile label="Teachers" value={stats.total_teachers} />
        <Tile label="Students" value={stats.total_students} />
        <Tile label="Classes Saved" value={stats.total_classes} />
        <Tile label="Real Paid Subs" value={stats.real_paid_subs} sub={`of ${stats.total_teachers} teachers`} />
        <Tile label="Promo Redemptions" value={stats.promo_redeemed_total} />
      </div>

      <div style={{ ...tileStyle, padding: "16px 18px" }}>
        <h2 style={{ margin: "0 0 2px", fontSize: 13.5, fontWeight: 900 }}>Teacher signups, last 9 weeks</h2>
        <p style={{ margin: "0 0 10px", fontSize: 11.5, color: C.inkDim, fontWeight: 600 }}>Weekly, from profiles.created_at</p>
        {weeks.length === 0 ? <div style={{ color: C.inkFaint, fontSize: 12.5, fontWeight: 700 }}>No signups in the last 9 weeks.</div> : <SignupsChart weeks={weeks} />}
      </div>

      <div style={{ ...tileStyle, padding: "16px 18px" }}>
        <h2 style={{ margin: "0 0 2px", fontSize: 13.5, fontWeight: 900 }}>Most-flagged games</h2>
        <p style={{ margin: "0 0 10px", fontSize: 11.5, color: C.inkDim, fontWeight: 600 }}>Where feedback is actually coming from</p>
        {games.length === 0 ? (
          <div style={{ color: C.inkFaint, fontSize: 12.5, fontWeight: 700 }}>No flagged content yet.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {games.map(g => (
              <div key={g.game_id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 11px", background: C.surface2, borderRadius: 9 }}>
                <div style={{ fontSize: 12.5, fontWeight: 800 }}>{gameLabel(g.game_id)}</div>
                <div style={{ fontSize: 12.5, fontWeight: 900, color: g.unreviewed > 0 ? "#FCA5A5" : "#86EFAC" }}>
                  {g.unreviewed > 0 ? `${g.unreviewed} new` : "reviewed"} <span style={{ color: C.inkFaint, fontWeight: 700 }}>({g.total} total)</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
