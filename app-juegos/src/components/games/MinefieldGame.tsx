import { useState, useRef } from "react";
import type { GameProps } from "../../types";

export function MinefieldGame({ gridData, teams, onUpdateScore, onEnd }: GameProps) {
  const ROWS = 5;
  const COLS = 5;
  const TOTAL = ROWS * COLS;
  const MINE_COUNT = 7;

  const mines = useRef(
    new Set([...Array(TOTAL)].map((_, i) => i).sort(() => Math.random() - 0.5).slice(0, MINE_COUNT))
  ).current;

  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const [activeTeam, setActiveTeam] = useState(0);
  const [phase, setPhase] = useState<"intro" | "pick" | "speaking" | "judging">("intro");
  const [selectedTile, setSelectedTile] = useState<number | null>(null);
  const [boom, setBoom] = useState<boolean | null>(null);
  const [lastResult, setLastResult] = useState<{ correct: boolean, isMine: boolean, col: string, row: string } | null>(null);

  const t = teams[activeTeam];
  const safeRevealed = [...revealed].filter(i => !mines.has(i)).length;
  const totalSafe = TOTAL - MINE_COUNT;

  if (!gridData) return (
    <div style={{ textAlign: "center", padding: "40px", color: "#6B7280" }}>
      <div style={{ fontSize: "40px", marginBottom: "12px" }}>⏳</div>
      <div style={{ fontWeight: "700" }}>Loading grid…</div>
    </div>
  );

  const { colLabels, rowLabels, topic, instructions } = gridData;

  const getSentence = (idx: number) => {
    const ri = Math.floor(idx / COLS);
    const ci = idx % COLS;
    return { col: colLabels[ci], row: rowLabels[ri] };
  };

  const pickTile = (idx: number) => {
    if (revealed.has(idx) || phase !== "pick") return;
    setSelectedTile(idx);
    setLastResult(null);
    setPhase("speaking");
  };

  const afterJudge = (correct: boolean) => {
    if (selectedTile === null) return;
    const isMine = mines.has(selectedTile);
    const { col, row } = getSentence(selectedTile);
    setRevealed(r => new Set([...r, selectedTile]));
    setLastResult({ correct, isMine, col, row });

    if (isMine) {
      setBoom(true);
      onUpdateScore(teams[activeTeam].id, -75);
      setTimeout(() => setBoom(false), 2200);
    } else if (correct) {
      onUpdateScore(teams[activeTeam].id, 50);
    }

    setPhase("pick");
    setSelectedTile(null);
    setActiveTeam(at => (at + 1) % teams.length);

    if (safeRevealed + (isMine ? 0 : 1) >= totalSafe) onEnd();
  };

  const TILE_H = 58;
  const GAP = 5;
  const selData = selectedTile !== null ? getSentence(selectedTile) : null;

  if (phase === "intro") return (
    <div style={{ textAlign: "center" }}>
      <div style={{ background: "linear-gradient(135deg,#4C1D95,#6D28D9)", borderRadius: "20px", padding: "28px 24px", marginBottom: "10px", position: "relative", color: "white", maxWidth: "520px", margin: "0 auto 10px" }}>
        <div style={{ fontSize: "36px", marginBottom: "10px" }}>💣</div>
        <div style={{ fontWeight: "900", fontSize: "20px", marginBottom: "10px" }}>Minefield</div>
        <div style={{ fontSize: "15px", lineHeight: 1.7, opacity: 0.95 }}>
          A grid of tiles hides <strong>7 mines</strong>. Teams take turns picking a square.<br />
          Each square shows a <strong>sentence starter</strong> — combine the column and row,<br />
          then <strong>speak a full sentence</strong> using the target language.<br />
          The teacher judges: correct = <strong>+50 pts</strong>. Hit a mine = <strong>−75 pts</strong>!
        </div>
        <div style={{ position: "absolute", bottom: "-14px", left: "50%", transform: "translateX(-50%)", width: 0, height: 0, borderLeft: "14px solid transparent", borderRight: "14px solid transparent", borderTop: "14px solid #6D28D9" }} />
      </div>
      <div style={{ marginTop: "24px", marginBottom: "20px", fontSize: "14px", color: "#6B7280", fontWeight: "600" }}>
        Take turns picking squares — the team with the most points when all safe tiles are cleared wins!
      </div>
      <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap", marginBottom: "24px" }}>
        {teams.map(team => (<div key={team.id} style={{ background: team.color.light, border: `3px solid ${team.color.bg}`, borderRadius: "14px", padding: "10px 18px", fontWeight: "800", fontSize: "14px", color: team.color.dark }}>{team.color.emoji} {team.name}</div>))}
      </div>
      <button onClick={() => setPhase("pick")} style={{ background: "linear-gradient(135deg,#4C1D95,#6D28D9)", color: "white", border: "none", borderRadius: "16px", padding: "16px 48px", fontSize: "19px", fontWeight: "900", cursor: "pointer", boxShadow: "0 6px 24px rgba(109,40,217,0.4)" }}>
        💣 Enter the Minefield!
      </button>
    </div>
  );

  return (
    <div>
      <div style={{ background: "linear-gradient(135deg,#4C1D95,#6D28D9)", borderRadius: "14px", padding: "12px 18px", marginBottom: "14px", textAlign: "center" }}>
        <div style={{ color: "#DDD6FE", fontWeight: "900", fontSize: "15px", marginBottom: "4px" }}>💣 {topic}</div>
        <div style={{ color: "#C4B5FD", fontSize: "13px", lineHeight: 1.5 }}>{instructions}</div>
      </div>

      <div style={{ background: t.color.bg, borderRadius: "14px", padding: "10px 18px", marginBottom: "14px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
        <span style={{ color: "white", fontWeight: "900", fontSize: "17px" }}>
          {phase === "pick" && `🎯 ${t.name} — Pick a square!`}
          {phase === "speaking" && `🗣️ ${t.name} — Say the sentence!`}
          {phase === "judging" && `👂 Teacher — Judge the sentence`}
        </span>
        <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: "20px", padding: "4px 12px", color: "white", fontWeight: "700", fontSize: "13px" }}>
          {safeRevealed}/{totalSafe} safe ✅ &nbsp;|&nbsp; {MINE_COUNT} 💣
        </div>
      </div>

      <div style={{ height: "8px", background: "#E5E7EB", borderRadius: "4px", overflow: "hidden", marginBottom: "14px" }}>
        <div style={{ height: "100%", width: `${(safeRevealed / totalSafe) * 100}%`, background: "#22C55E", borderRadius: "4px", transition: "width 0.4s ease" }} />
      </div>

      {boom && (
        <div style={{ textAlign: "center", background: "#7F1D1D", border: "3px solid #EF4444", borderRadius: "14px", padding: "14px", marginBottom: "14px", animation: "boomPulse 0.3s ease-out" }}>
          <div style={{ fontSize: "40px", marginBottom: "4px" }}>💥</div>
          <div style={{ fontWeight: "900", fontSize: "20px", color: "#FCA5A5" }}>BOOM! Mine hit!</div>
          <div style={{ color: "#FCA5A5", fontWeight: "700", fontSize: "14px", marginTop: "2px" }}>
            {lastResult && `"${lastResult.col} + ${lastResult.row}…" — ${teams[activeTeam < teams.length ? (activeTeam - 1 + teams.length) % teams.length : 0]?.name ?? t.name} loses 75 pts`}
          </div>
        </div>
      )}

      {!boom && lastResult && phase === "pick" && (
        <div style={{
          background: lastResult.correct && !lastResult.isMine ? "#ECFDF5" : lastResult.isMine ? "#FEF2F2" : "#FFF7ED",
          border: `2px solid ${lastResult.correct && !lastResult.isMine ? "#22C55E" : lastResult.isMine ? "#EF4444" : "#F97316"}`,
          borderRadius: "12px", padding: "10px 16px", marginBottom: "12px", textAlign: "center", fontSize: "13px", fontWeight: "700",
          color: lastResult.correct && !lastResult.isMine ? "#14532D" : lastResult.isMine ? "#991B1B" : "#7C2D12"
        }}>
          {lastResult.isMine ? "💥 Mine! −75 pts" : lastResult.correct ? "✅ Great sentence! +50 pts" : "❌ Incorrect — no points"}
        </div>
      )}

      {phase === "speaking" && selData && (
        <div style={{ background: "linear-gradient(135deg,#FEF3C7,#FDE68A)", border: "3px solid #F59E0B", borderRadius: "16px", padding: "20px", marginBottom: "14px", textAlign: "center" }}>
          <div style={{ fontSize: "13px", fontWeight: "700", color: "#92400E", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            🗣️ {t.name} — Combine these and complete the sentence:
          </div>
          <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap", marginBottom: "14px" }}>
            <div style={{ background: "#7C3AED", color: "white", borderRadius: "12px", padding: "10px 16px", fontWeight: "800", fontSize: "16px", maxWidth: "260px", lineHeight: 1.4 }}>{selData.col}</div>
            <div style={{ display: "flex", alignItems: "center", fontSize: "24px", fontWeight: "900", color: "#92400E" }}>+</div>
            <div style={{ background: "#0891B2", color: "white", borderRadius: "12px", padding: "10px 16px", fontWeight: "800", fontSize: "16px", maxWidth: "260px", lineHeight: 1.4 }}>{selData.row}</div>
            <div style={{ display: "flex", alignItems: "center", fontSize: "20px", color: "#92400E", fontWeight: "800" }}>+ …your idea</div>
          </div>
          <div style={{ color: "#78350F", fontSize: "13px", fontWeight: "600", marginBottom: "14px" }}>Say the full sentence out loud — then your teacher will judge it!</div>
          <button onClick={() => setPhase("judging")} style={{ background: "linear-gradient(135deg,#7C3AED,#6D28D9)", color: "white", border: "none", borderRadius: "12px", padding: "12px 32px", fontSize: "16px", fontWeight: "800", cursor: "pointer", boxShadow: "0 4px 16px rgba(124,58,237,0.35)" }}>👂 I've spoken — Teacher judges</button>
        </div>
      )}

      {phase === "judging" && selData && (
        <div style={{ background: "#F8F7FF", border: "3px solid #6366F1", borderRadius: "16px", padding: "20px", marginBottom: "14px", textAlign: "center" }}>
          <div style={{ fontSize: "13px", fontWeight: "700", color: "#4338CA", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>👩‍🏫 Teacher — Did the student use the target language correctly?</div>
          <div style={{ background: "#EEF2FF", borderRadius: "10px", padding: "10px 16px", marginBottom: "16px", fontStyle: "italic", color: "#3730A3", fontWeight: "700", fontSize: "15px" }}>"{selData.col} {selData.row} …"</div>
          <div style={{ display: "flex", gap: "14px", justifyContent: "center" }}>
            <button onClick={() => afterJudge(true)} style={{ background: "linear-gradient(135deg,#22C55E,#15803D)", color: "white", border: "none", borderRadius: "14px", padding: "14px 36px", fontSize: "18px", fontWeight: "900", cursor: "pointer", boxShadow: "0 4px 16px rgba(34,197,94,0.4)" }}>✅ Correct! +50</button>
            <button onClick={() => afterJudge(false)} style={{ background: "linear-gradient(135deg,#EF4444,#B91C1C)", color: "white", border: "none", borderRadius: "14px", padding: "14px 36px", fontSize: "18px", fontWeight: "900", cursor: "pointer", boxShadow: "0 4px 16px rgba(239,68,68,0.4)" }}>❌ Wrong — 0 pts</button>
          </div>
          <div style={{ fontSize: "12px", color: "#6B7280", marginTop: "10px", fontWeight: "600" }}>(Mine risk still applies regardless of answer)</div>
        </div>
      )}

      <div style={{ overflowX: "auto", marginBottom: "8px" }}>
        <table style={{ borderCollapse: "separate", borderSpacing: `${GAP}px`, margin: "0 auto" }}>
          <thead>
            <tr>
              <th style={{ width: "110px" }}></th>
              {colLabels.map((label: string, ci: number) => (
                <th key={ci} style={{ background: "linear-gradient(135deg,#4C1D95,#7C3AED)", color: "white", fontWeight: "800", fontSize: "11px", padding: "8px 6px", borderRadius: "10px", textAlign: "center", lineHeight: 1.35, width: "90px", maxWidth: "90px", wordBreak: "break-word", whiteSpace: "normal" }}>{label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rowLabels.map((rowLabel: string, ri: number) => (
              <tr key={ri}>
                <td style={{ background: "linear-gradient(135deg,#0E7490,#0891B2)", color: "white", fontWeight: "800", fontSize: "11px", padding: "8px 10px", borderRadius: "10px", textAlign: "center", lineHeight: 1.35, wordBreak: "break-word", whiteSpace: "normal" }}>{rowLabel}</td>
                {colLabels.map((_: string, ci: number) => {
                  const idx = ri * COLS + ci;
                  const isRev = revealed.has(idx);
                  const isMine = isRev && mines.has(idx);
                  const isSel = selectedTile === idx;
                  const disabled = isRev || phase !== "pick";

                  let bg, emoji, cursor;
                  if (isRev) {
                    bg = isMine ? "linear-gradient(135deg,#EF4444,#B91C1C)" : "linear-gradient(135deg,#22C55E,#15803D)";
                    emoji = isMine ? "💥" : "✅";
                    cursor = "default";
                  } else if (isSel) {
                    bg = "linear-gradient(135deg,#FCD34D,#F59E0B)";
                    emoji = "🎯";
                    cursor = "default";
                  } else {
                    bg = phase !== "pick" ? "linear-gradient(135deg,#818CF8,#6366F1)" : "linear-gradient(135deg,#6366F1,#4338CA)";
                    emoji = null;
                    cursor = disabled ? "default" : "pointer";
                  }

                  return (
                    <td key={ci} style={{ padding: 0 }}>
                      <button onClick={() => pickTile(idx)} disabled={disabled} style={{ width: "90px", height: `${TILE_H}px`, border: "none", borderRadius: "12px", fontSize: isRev ? 22 : 11, fontWeight: "900", cursor, transition: "all 0.15s", transform: isSel ? "scale(1.1)" : (phase !== "pick" && !isRev) ? "scale(0.95)" : "scale(1)", background: bg, color: "white", boxShadow: isSel ? "0 0 18px #FCD34D90" : isRev ? (isMine ? "0 2px 8px #EF444460" : "0 2px 8px #22C55E60") : "0 2px 6px rgba(99,102,241,0.35)", opacity: (phase !== "pick" && !isRev && !isSel) ? 0.6 : 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {isRev ? emoji : isSel ? emoji : "💣?"}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ textAlign: "center", fontSize: "12px", color: "#9CA3AF", fontWeight: "600", marginTop: "6px" }}>{MINE_COUNT} mines hidden · Click a square → say the sentence → teacher judges</div>
      <style>{`@keyframes boomPulse { 0% { transform: scale(0.92); opacity: 0.6; } 60% { transform: scale(1.04); } 100% { transform: scale(1); opacity: 1; } }`}</style>
    </div>
  );
}