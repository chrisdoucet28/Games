import { useState, useRef } from "react";
import type { GameProps } from "../../types";
import { teamsGridCols } from "../../data/constants";
import { QuestionCard } from "../shared/QuestionCard";

type SegmentDef = { type: string; label: string; emoji: string; color: string; prompt_prefix?: string };

const BRIDGE_SEGMENT_TYPES: SegmentDef[] = [
  { type: "correct grammar mistakes", label: "Correct the mistake", emoji: "✏️", color: "#7C3AED" },
  { type: "correct grammar mistakes", label: "Correct the mistake", emoji: "✏️", color: "#7C3AED" },
  { type: "choose correct grammar", label: "Choose correct", emoji: "🔤", color: "#0891B2" },
  { type: "choose correct grammar", label: "Choose correct", emoji: "🔤", color: "#0891B2" },
  { type: "finish the sentence", label: "Finish the sentence", emoji: "✍️", color: "#D97706" },
  { type: "finish the sentence", label: "Finish the sentence", emoji: "✍️", color: "#D97706" },
  { type: "speaking task", label: "Speaking task", emoji: "🗣️", color: "#059669" },
  { type: "speaking task", label: "Speaking task", emoji: "🗣️", color: "#059669" },
];

const BRIDGE_TOPIC_SEGMENT_TYPES: SegmentDef[] = [
  { type: "speaking task", label: "One word answer", emoji: "💬", color: "#0891B2", prompt_prefix: "Give one word that relates to: " },
  { type: "speaking task", label: "One word answer", emoji: "💬", color: "#0891B2", prompt_prefix: "Give one word that relates to: " },
  { type: "speaking task", label: "One sentence", emoji: "🗣️", color: "#059669", prompt_prefix: "Answer in one sentence: " },
  { type: "speaking task", label: "One sentence", emoji: "🗣️", color: "#059669", prompt_prefix: "Answer in one sentence: " },
  { type: "speaking task", label: "Give your opinion", emoji: "💭", color: "#D97706", prompt_prefix: "Give your opinion: " },
  { type: "speaking task", label: "Give your opinion", emoji: "💭", color: "#D97706", prompt_prefix: "Give your opinion: " },
  { type: "speaking task", label: "Extended answer", emoji: "🎤", color: "#7C3AED", prompt_prefix: "Speak for 30 seconds about: " },
  { type: "speaking task", label: "Extended answer", emoji: "🎤", color: "#7C3AED", prompt_prefix: "Speak for 30 seconds about: " },
];

export function BridgeBuilderGame({ questions, teams, onUpdateScore, onEnd, isTopic }: GameProps) {
  const SEGMENTS = 8;
  const isTopicMode = questions.length > 0 && questions.every(q => q.type === "speaking task") || isTopic;
  const ACTIVE_SEGMENTS = isTopicMode ? BRIDGE_TOPIC_SEGMENT_TYPES : BRIDGE_SEGMENT_TYPES;

  const shuffledQs = useRef([...questions].sort(() => Math.random() - 0.5)).current;

  const [progress, setProgress] = useState<Record<string | number, number>>(() => Object.fromEntries(teams.map(t => [t.id, 0])));
  const [phase, setPhase] = useState<"intro" | "question">("intro");
  const [showAns, setShowAns] = useState(false);
  const [lastResult, setLastResult] = useState<{ teamId: string | number, correct: boolean, segIdx: number } | null>(null);
  const [finished, setFinished] = useState<string | number | null>(null);
  const [qIdx, setQIdx] = useState(0);

  const qByType = useRef<Record<string, any[]> | null>(null);
  if (!qByType.current && !isTopicMode) {
    const map: Record<string, any[]> = {};
    BRIDGE_SEGMENT_TYPES.forEach(s => { if (!map[s.type]) map[s.type] = []; });
    questions.forEach(q => {
      const t = q.type || "unknown";
      if (map[t] !== undefined) map[t].push(q);
      if (t === "speaking task" || q.task) {
        if (map["speaking task"]) map["speaking task"].push({
          ...q, type: "speaking task", question: q.task || q.question, answer: "Open — teacher judges", hint: "Speak a full sentence using the target language"
        });
      }
    });
    Object.keys(map).forEach(t => {
      if (map[t].length === 0) { map[t] = questions.map(q => ({ ...q, type: t })); }
      map[t] = [...map[t]].sort(() => Math.random() - 0.5);
    });
    qByType.current = map;
  }

  const [typeIdx, setTypeIdx] = useState<Record<string, number>>(() => Object.fromEntries([...new Set(BRIDGE_SEGMENT_TYPES.map(s => s.type))].map(t => [t, 0])));

  const maxProgress = Math.max(...teams.map(t => (progress[t.id] ?? 0)));
  const currentSegIdx = Math.min(maxProgress, SEGMENTS - 1);
  const currentSegDef = ACTIVE_SEGMENTS[currentSegIdx];
  const currentType = currentSegDef.type;

  let currentQ: any;
  if (isTopicMode) {
    const raw = shuffledQs[qIdx % Math.max(shuffledQs.length, 1)];
    currentQ = { ...raw, type: "speaking task", question: (currentSegDef.prompt_prefix || "") + raw.question };
  } else {
    const typePool = qByType.current?.[currentType] || questions;
    currentQ = typePool[(typeIdx[currentType] ?? 0) % Math.max(typePool.length, 1)];
  }

  const awardTeam = (teamId: string | number, correct: boolean) => {
    const teamProgress = progress[teamId] ?? 0;
    setLastResult({ teamId, correct, segIdx: teamProgress });

    if (correct) {
      const newProg = Math.min(SEGMENTS, teamProgress + 1);
      setProgress(prev => ({ ...prev, [teamId]: newProg }));
      onUpdateScore(teamId, 30);
      if (isTopicMode) { setQIdx(i => i + 1); } else { setTypeIdx(prev => ({ ...prev, [currentType]: (prev[currentType] ?? 0) + 1 })); }
      if (newProg >= SEGMENTS) {
        setFinished(teamId);
        onUpdateScore(teamId, 70);
        return;
      }
    }
    setShowAns(false);
    setLastResult(null);
  };

  const skip = () => {
    setShowAns(false);
    setLastResult(null);
    if (isTopicMode) setQIdx(i => i + 1);
    else setTypeIdx(prev => ({ ...prev, [currentType]: (prev[currentType] ?? 0) + 1 }));
  };

  const BridgeViz = ({ teamId }: { teamId: string | number }) => {
    const segs = progress[teamId] ?? 0;
    const t = teams.find(tm => tm.id === teamId);
    if (!t) return null;
    const W = 200, H = 60;
    const segW = (W - 20) / SEGMENTS;
    return (
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: "200px", display: "block", margin: "0 auto" }}>
        <rect x={10} y={40} width={W - 20} height={18} fill="#E5E7EB" rx="2" />
        <rect x={10} y={40} width={W - 20} height={3} fill="#9CA3AF" />
        {Array.from({ length: segs }).map((_, i) => (
          <rect key={i} x={10 + i * segW} y={32} width={segW - 1} height={10} fill={ACTIVE_SEGMENTS[i]?.color || t.color.bg} rx="2" />
        ))}
        {Array.from({ length: SEGMENTS - segs }).map((_, i) => (
          <rect key={i} x={10 + (segs + i) * segW} y={35} width={segW - 1} height={4} fill="#D1D5DB" rx="1" />
        ))}
        <rect x={4} y={24} width={8} height={34} fill="#6B7280" rx="2" />
        <rect x={W - 12} y={24} width={8} height={34} fill="#6B7280" rx="2" />
        {segs > 0 && segs < SEGMENTS && (
          <>
            <line x1={10 + segs * segW} y1={10} x2={10 + segs * segW} y2={32} stroke={t.color.bg} strokeWidth="2" />
            <polygon points={`${10 + segs * segW},10 ${10 + segs * segW + 10},16 ${10 + segs * segW},22`} fill={t.color.bg} />
          </>
        )}
        {segs >= SEGMENTS && <text x={W / 2} y={20} textAnchor="middle" fontSize="14" fill={t.color.bg}>🏆</text>}
      </svg>
    );
  };

  if (finished !== null) {
    const winner = teams.find(t => t.id === finished);
    return (
      <div style={{ textAlign: "center", padding: "20px" }}>
        <div style={{ fontSize: "48px", marginBottom: "12px" }}>🌉</div>
        <div style={{ fontWeight: "900", fontSize: "24px", color: "#1E1B4B", marginBottom: "6px" }}>{winner?.name} built the bridge!</div>
        <div style={{ marginBottom: "20px", display: "grid", gridTemplateColumns: teamsGridCols(teams.length), gap: "10px" }}>
          {teams.map(t => (
            <div key={t.id} style={{ background: t.color.light, border: `3px solid ${t.color.bg}`, borderRadius: "14px", padding: "10px" }}>
              <div style={{ fontWeight: "800", color: t.color.dark, fontSize: "13px", marginBottom: "6px" }}>{t.name}</div>
              <BridgeViz teamId={t.id} />
              <div style={{ fontWeight: "700", fontSize: "12px", color: t.color.dark, marginTop: "4px" }}>{progress[t.id] ?? 0}/{SEGMENTS} segments</div>
            </div>
          ))}
        </div>
        <button onClick={onEnd} style={{ background: "#0EA5E9", color: "white", border: "none", borderRadius: "12px", padding: "12px 28px", fontSize: "16px", fontWeight: "800", cursor: "pointer" }}>🏁 End Game</button>
      </div>
    );
  }

  if (phase === "intro") return (
    <div style={{ textAlign: "center" }}>
      <div style={{ background: "linear-gradient(135deg,#0C4A6E,#0EA5E9)", borderRadius: "20px", padding: "28px 24px", marginBottom: "10px", color: "white", maxWidth: "520px", margin: "0 auto 10px" }}>
        <div style={{ fontSize: "36px", marginBottom: "10px" }}>🌉</div>
        <div style={{ fontWeight: "900", fontSize: "20px", marginBottom: "10px" }}>Bridge Builder</div>
        <div style={{ fontSize: "15px", lineHeight: 1.7, opacity: 0.95 }}>
          Every team builds a bridge — <strong>first to 8 segments wins!</strong><br />
          Each segment has a <strong>fixed task type</strong>.<br />
          Any team can answer — buzz in and complete the task to add a segment.
        </div>
      </div>
      <div style={{ display: "flex", gap: "6px", justifyContent: "center", flexWrap: "wrap", margin: "24px 0 16px" }}>
        {[...new Map(BRIDGE_SEGMENT_TYPES.map(s => [s.type, s])).values()].map((s, i) => (
          <div key={i} style={{ background: s.color, color: "white", borderRadius: "8px", padding: "5px 12px", fontSize: "12px", fontWeight: "800" }}>
            {s.emoji} {s.label} (×2)
          </div>
        ))}
      </div>
      <button onClick={() => setPhase("question")} style={{ background: "linear-gradient(135deg,#0C4A6E,#0EA5E9)", color: "white", border: "none", borderRadius: "16px", padding: "16px 48px", fontSize: "19px", fontWeight: "900", cursor: "pointer" }}>🌉 Start Building!</button>
    </div>
  );

  return (
    <div>
      <div style={{ background: currentSegDef.color, borderRadius: "14px", padding: "12px 16px", marginBottom: "14px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
        <div style={{ color: "white", fontWeight: "900", fontSize: "16px" }}>
          {currentSegDef.emoji} {currentSegDef.label}
          <span style={{ opacity: 0.75, fontWeight: "600", fontSize: "13px", marginLeft: "8px" }}>— Segment {currentSegIdx + 1} of {SEGMENTS}</span>
        </div>
        <div style={{ background: "rgba(255,255,255,0.2)", color: "white", borderRadius: "8px", padding: "3px 10px", fontSize: "12px", fontWeight: "700" }}>Raise your hand to answer! 🙋</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: teamsGridCols(teams.length), gap: "10px", marginBottom: "16px" }}>
        {teams.map(t => {
          const segs = progress[t.id] || 0;
          const nextSeg = ACTIVE_SEGMENTS[segs];
          return (
            <div key={t.id} style={{ background: t.color.light, border: `3px solid ${t.color.bg}`, borderRadius: "14px", padding: "10px", textAlign: "center", transform: lastResult?.teamId === t.id && lastResult?.correct ? "scale(1.05)" : "scale(1)", transition: "transform 0.3s" }}>
              <div style={{ fontWeight: "800", fontSize: "13px", color: t.color.dark, marginBottom: "4px" }}>{t.name} — {segs}/{SEGMENTS}</div>
              {nextSeg && segs < SEGMENTS && (
                <div style={{ fontSize: "10px", fontWeight: "700", color: nextSeg.color, marginBottom: "4px" }}>Next: {nextSeg.emoji} {nextSeg.label}</div>
              )}
              <BridgeViz teamId={t.id} />
              {lastResult?.teamId === t.id && (
                <div style={{ marginTop: "4px", fontWeight: "700", fontSize: "12px", color: lastResult.correct ? "#16A34A" : "#DC2626" }}>{lastResult.correct ? "✅ +1 segment!" : "❌ No progress"}</div>
              )}
            </div>
          );
        })}
      </div>

      <QuestionCard question={currentQ} showAnswer={showAns} onReveal={() => setShowAns(true)} />

      {(showAns || currentQ?.type === "speaking task") && (
        <div style={{ marginTop: "14px" }}>
          <p style={{ textAlign: "center", fontWeight: "700", color: "#374151", marginBottom: "10px", fontSize: "14px" }}>Which team answered first?</p>
          <div style={{ display: "grid", gridTemplateColumns: teamsGridCols(teams.length), gap: "8px", marginBottom: "10px" }}>
            {teams.map(t => (
              <button key={t.id} onClick={() => awardTeam(t.id, true)} style={{ background: t.color.bg, color: "white", border: "none", borderRadius: "10px", padding: "10px 8px", fontWeight: "800", fontSize: "14px", cursor: "pointer" }}>✅ {t.name}</button>
            ))}
          </div>
          <div style={{ textAlign: "center" }}>
            <button onClick={skip} style={{ background: "#9CA3AF", color: "white", border: "none", borderRadius: "10px", padding: "8px 20px", fontWeight: "700", fontSize: "13px", cursor: "pointer" }}>⏭️ Skip / No answer</button>
          </div>
        </div>
      )}
    </div>
  );
}