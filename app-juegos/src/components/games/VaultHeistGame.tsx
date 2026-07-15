import { useState, useRef, useCallback, useEffect } from "react";
import type { GameProps, QuestionData } from "../../types";
import { useTurnTimer } from "../../hooks/useTurnTimer";
import { TurnTimerBar } from "../shared/TurnTimerBar";
import { QuestionCard } from "../shared/QuestionCard";
import { Confetti } from "../shared/Confetti";
import { teamsGridCols } from "../../data/constants";

const LOCK_COUNT = 5;
const TURN_SECONDS = 25;
const REVEAL_MS = 3000;
const CRACK_SCORE = 10;
// The vault no longer ends the moment one team finishes — every team keeps playing (and
// practicing) until the last team cracks their 5th lock. Finish order still matters: 1st place
// gets the full bonus, 2nd gets half, 3rd a third, etc., so racing to finish first is still
// worthwhile without cutting everyone else's practice short.
const FIRST_FINISH_BONUS = 50;
function finishBonusForRank(rank: number): number {
  return Math.round(FIRST_FINISH_BONUS / rank);
}
function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
function medalFor(rank: number): string {
  return rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : "🏅";
}
// Same "let the banner actually be seen" fix pattern as Castle Defense (3400ms) / Battleship (1700ms).
const GAMEOVER_DELAY_MS = 2400;
const DIFFICULTY_BY_LOCK_INDEX = ["easy", "easy", "medium", "medium", "hard"];
// Which "form" (undefined = plain grammar, or negative/question stacked on top) a lock prefers to
// draw, indexed the same way as DIFFICULTY_BY_LOCK_INDEX. Early locks stay plain; stacking phases
// in from lock 3 onward, so the vault gets harder toward lock 5 the same way difficulty already
// does. Positive/negative/question never combine with each other (no negative questions) — that's
// enforced by content authoring (each item has at most one form), not by this preference list.
const FORM_PREFERENCE_BY_LOCK_INDEX: (QuestionData["form"] | undefined)[][] = [
  [undefined],
  [undefined, "question"],
  ["negative", "question"],
  ["negative", "question"],
  ["negative", "question"],
];
const DICE_FACES = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

type Phase = "intro" | "rolling" | "reveal" | "answer" | "result" | "gameover";
type Outcome = { correct: boolean; category: string; locksNow: number };
type WinBanner = { teamName: string; color: string; rank: number; bonus: number; key: number };
type OrderEntry = { teamIdx: number; roll: number };

function formatCategory(tag: string): string {
  return tag.replace(/-/g, " ").toUpperCase();
}

// One independent shuffled question list per (team × category), so two teams never draw
// identical questions in lockstep and a thin category still serves the whole game — the draw
// index just wraps back to the start once a team has seen everything in that category. Mirrors
// BattleshipGame's buildCoordMap philosophy of deriving pools from the actual question data
// rather than a hardcoded structure.
function buildDrawPools(rewriteQs: QuestionData[], categories: string[], teamIds: (string | number)[]) {
  const byCategory: Record<string, QuestionData[]> = {};
  categories.forEach(c => { byCategory[c] = rewriteQs.filter(q => q.transform === c); });
  const pools: Record<string | number, Record<string, QuestionData[]>> = {};
  teamIds.forEach(teamId => {
    pools[teamId] = {};
    categories.forEach(c => { pools[teamId][c] = [...byCategory[c]].sort(() => Math.random() - 0.5); });
  });
  return pools;
}

function LockRow({ cracked, total, justChanged }: { cracked: number; total: number; justChanged: boolean }) {
  return (
    <div style={{ display: "flex", gap: "4px", justifyContent: "center" }}>
      {Array.from({ length: total }).map((_, i) => (
        <span key={i} style={{
          fontSize: "22px",
          opacity: i < cracked ? 1 : 0.32,
          filter: i < cracked ? "drop-shadow(0 0 4px #FCD34D88)" : "none",
          animation: justChanged && i === Math.max(0, cracked - 1) ? "dialSpin 0.6s ease-out" : "none",
        }}>
          {i < cracked ? "🔓" : "🔒"}
        </span>
      ))}
    </div>
  );
}

export function VaultHeistGame({ questions, teams, onUpdateScore, onEnd }: GameProps) {
  const rewriteQs = useRef(questions.filter(q => q.type === "rewrite sentences")).current;
  const categories = useRef([...new Set(rewriteQs.map(q => q.transform).filter((c): c is string => !!c))]).current;
  const pools = useRef(buildDrawPools(rewriteQs, categories, teams.map(t => t.id))).current;

  const [vaultLocks, setVaultLocks] = useState<Record<string | number, number>>(
    () => Object.fromEntries(teams.map(t => [t.id, 0]))
  );

  // turnOrder[pos] = index into `teams`, established once by the dice roll before play begins.
  // orderPos is a position WITHIN that order — since a team keeps its turn on every correct
  // answer now (no longer round-robin per question), the dice roll is what keeps whichever team
  // rolls highest from having a permanent structural advantage as the perpetual first-mover.
  const [turnOrder, setTurnOrder] = useState<number[]>(() => teams.map((_, i) => i));
  const [orderPos, setOrderPos] = useState(0);
  const [diceValues, setDiceValues] = useState<(number | null)[]>(() => teams.map(() => null));
  const [rollDone, setRollDone] = useState(false);
  const [finalOrder, setFinalOrder] = useState<OrderEntry[] | null>(null);

  const [phase, setPhase] = useState<Phase>("intro");
  const [currentCategory, setCurrentCategory] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<QuestionData | null>(null);
  const [showAns, setShowAns] = useState(false);
  const [lastOutcome, setLastOutcome] = useState<Outcome | null>(null);
  const [winBanner, setWinBanner] = useState<WinBanner | null>(null);
  const [confettiActive, setConfettiActive] = useState(false);
  const fxId = useRef(0);
  // Order teams finish in — index 0 is 1st place. Drives both the rank-based bonus and the
  // gameover standings; a team's id lands here exactly once, the moment they crack lock 5.
  const finishOrderRef = useRef<(string | number)[]>([]);

  const activeTeam = teams[turnOrder[orderPos]];

  // Many topics end up with an uneven mix of category pool sizes (some grammar points only
  // support one or two distinct transform tags). Picking uniformly at random over categories
  // — ignoring pool size — let a single-entry category get picked several turns running, which
  // shows the exact same sentence back-to-back. Excluding the immediately-previous category
  // (whenever an alternative exists) guarantees no two consecutive reveals repeat.
  const lastCategoryRef = useRef<string | null>(null);
  const pickCategory = useCallback(() => {
    const choices = categories.length > 1 ? categories.filter(c => c !== lastCategoryRef.current) : categories;
    const pool = choices.length ? choices : categories;
    const picked = pool[Math.floor(Math.random() * pool.length)];
    lastCategoryRef.current = picked;
    return picked;
  }, [categories]);

  // Picks one question at random from a (team × category) pool, preferring the lock's target
  // difficulty but never repeating the exact sentence this team last saw in that category when
  // any alternative exists. A plain `idx % pool.length` cursor broke down whenever the
  // difficulty-filtered slice was down to a single item (very common with these small per-topic
  // pools) — the modulo is always 0 against a length-1 array, so that one sentence kept coming
  // back on every visit to that difficulty tier regardless of how many other questions existed
  // in the category overall.
  const lastQuestionRef = useRef<Record<string, string | undefined>>({});
  // Six-tier fallback: the first two tiers additionally prefer the lock's desired form (per
  // FORM_PREFERENCE_BY_LOCK_INDEX) on top of the existing difficulty preference; tiers 3-6 are
  // exactly the original four tiers, unchanged, so a topic with no form-tagged content anywhere
  // (i.e. every item's form is undefined) falls straight through to tier 3 and plays exactly as it
  // did before this feature existed — content can migrate topic-by-topic with nothing breaking.
  const pickQuestion = useCallback((teamId: string | number, category: string, desiredDifficulty: string, desiredForms: (QuestionData["form"] | undefined)[]) => {
    const teamPool = pools[teamId]?.[category] ?? [];
    if (!teamPool.length) return null;
    const key = `${teamId}:${category}`;
    const last = lastQuestionRef.current[key];
    const matchesForm = (q: QuestionData) => desiredForms.includes(q.form);
    const byDifficultyFormFresh = teamPool.filter(q => q.difficulty === desiredDifficulty && matchesForm(q) && q.question !== last);
    const anyDifficultyFormFresh = teamPool.filter(q => matchesForm(q) && q.question !== last);
    const byDifficultyFresh = teamPool.filter(q => q.difficulty === desiredDifficulty && q.question !== last);
    const anyFresh = teamPool.filter(q => q.question !== last);
    const byDifficultyAny = teamPool.filter(q => q.difficulty === desiredDifficulty);
    const source = byDifficultyFormFresh.length ? byDifficultyFormFresh
      : anyDifficultyFormFresh.length ? anyDifficultyFormFresh
      : byDifficultyFresh.length ? byDifficultyFresh
      : anyFresh.length ? anyFresh
      : byDifficultyAny.length ? byDifficultyAny
      : teamPool;
    const chosen = source[Math.floor(Math.random() * source.length)];
    lastQuestionRef.current[key] = chosen.question;
    return chosen;
  }, [pools]);

  const beginReveal = useCallback((pos: number) => {
    const teamId = teams[turnOrder[pos]].id;
    const category = pickCategory();
    const lockIndexAttempting = vaultLocks[teamId] ?? 0;
    const clampedLockIndex = Math.min(lockIndexAttempting, DIFFICULTY_BY_LOCK_INDEX.length - 1);
    const desiredDifficulty = DIFFICULTY_BY_LOCK_INDEX[clampedLockIndex];
    const desiredForms = FORM_PREFERENCE_BY_LOCK_INDEX[clampedLockIndex];
    setOrderPos(pos);
    setCurrentCategory(category);
    setCurrentQuestion(pickQuestion(teamId, category, desiredDifficulty, desiredForms));
    setShowAns(false);
    setLastOutcome(null);
    setPhase("reveal");
    setTimeout(() => setPhase(p => (p === "reveal" ? "answer" : p)), REVEAL_MS);
  }, [pickCategory, pickQuestion, teams, turnOrder, vaultLocks]);

  // Hands the turn to the next team in the rolled order — on a wrong answer, or when the active
  // team just finished and has nothing left to crack. Skips any team that's already finished
  // (bounded by teams.length tries so this can never spin forever even if called right as the
  // last team finishes, though the UI hides the button that would trigger that in practice).
  const advanceTurn = useCallback(() => {
    let next = (orderPos + 1) % teams.length;
    let tries = 0;
    while (finishOrderRef.current.includes(teams[turnOrder[next]].id) && tries < teams.length) {
      next = (next + 1) % teams.length;
      tries++;
    }
    beginReveal(next);
  }, [orderPos, teams, turnOrder, beginReveal]);

  // Correct answer, vault not yet finished: same team immediately faces their next lock.
  const keepGoing = useCallback(() => {
    beginReveal(orderPos);
  }, [orderPos, beginReveal]);

  const runOrderRoll = useCallback((teamIndicesToRoll: number[], existingRolls: Record<number, number>) => {
    const rolls = { ...existingRolls };
    setDiceValues(prev => {
      const next = [...prev];
      teamIndicesToRoll.forEach(i => { next[i] = null; });
      return next;
    });
    setRollDone(false);

    const TICKS = 8;
    const intervals = teamIndicesToRoll.map(teamIdx => setInterval(() => {
      setDiceValues(prev => {
        const next = [...prev];
        next[teamIdx] = Math.floor(Math.random() * 6) + 1;
        return next;
      });
    }, 80));

    setTimeout(() => {
      intervals.forEach(iv => clearInterval(iv));
      const finalVals: Record<number, number> = {};
      teamIndicesToRoll.forEach(i => {
        finalVals[i] = Math.floor(Math.random() * 6) + 1;
        rolls[i] = finalVals[i];
      });
      setDiceValues(prev => {
        const next = [...prev];
        Object.entries(finalVals).forEach(([i, v]) => { next[Number(i)] = v; });
        return next;
      });

      const valueGroups: Record<number, number[]> = {};
      teamIndicesToRoll.forEach(i => {
        const v = rolls[i];
        if (!valueGroups[v]) valueGroups[v] = [];
        valueGroups[v].push(i);
      });
      const tiedGroups = Object.values(valueGroups).filter(g => g.length > 1);

      if (tiedGroups.length > 0) {
        setTimeout(() => { tiedGroups.forEach(group => runOrderRoll(group, rolls)); }, 900);
      } else {
        const allTeamIndices = teams.map((_, i) => i);
        const allRolls = { ...existingRolls, ...rolls };
        const ordered = [...allTeamIndices].sort((a, b) => (allRolls[b] || 0) - (allRolls[a] || 0));
        setTurnOrder(ordered);
        setFinalOrder(ordered.map(i => ({ teamIdx: i, roll: allRolls[i] })));
        setRollDone(true);
      }
    }, TICKS * 80 + 100);
  }, [teams]);

  useEffect(() => {
    if (phase === "rolling") {
      const allIdx = teams.map((_, i) => i);
      setDiceValues(teams.map(() => null));
      setRollDone(false);
      setFinalOrder(null);
      setTimeout(() => runOrderRoll(allIdx, {}), 300);
    }
  }, [phase, runOrderRoll, teams]);

  const { timeLeft } = useTurnTimer(TURN_SECONDS, phase === "answer", () => advanceTurn(), orderPos);

  const showWin = (teamName: string, color: string, rank: number, bonus: number) => {
    const id = fxId.current++;
    setWinBanner({ teamName, color, rank, bonus, key: id });
  };

  const handleReveal = () => setShowAns(true);

  const handleCorrect = () => {
    if (!currentCategory) return;
    const newCount = Math.min(LOCK_COUNT, (vaultLocks[activeTeam.id] ?? 0) + 1);
    setVaultLocks(prev => ({ ...prev, [activeTeam.id]: newCount }));
    onUpdateScore(activeTeam.id, CRACK_SCORE);
    setShowAns(false);
    setLastOutcome({ correct: true, category: currentCategory, locksNow: newCount });
    setPhase("result");

    if (newCount >= LOCK_COUNT && !finishOrderRef.current.includes(activeTeam.id)) {
      finishOrderRef.current.push(activeTeam.id);
      const rank = finishOrderRef.current.length;
      const bonus = finishBonusForRank(rank);
      onUpdateScore(activeTeam.id, bonus);
      if (rank === 1) setConfettiActive(true);
      showWin(activeTeam.name, activeTeam.color.bg, rank, bonus);
      if (finishOrderRef.current.length >= teams.length) {
        setTimeout(() => setPhase("gameover"), GAMEOVER_DELAY_MS);
      }
    }
  };

  const handleWrong = () => {
    if (!currentCategory) return;
    const current = vaultLocks[activeTeam.id] ?? 0;
    const regressed = Math.max(0, current - 1);
    setVaultLocks(prev => ({ ...prev, [activeTeam.id]: regressed }));
    setShowAns(false);
    setLastOutcome({ correct: false, category: currentCategory, locksNow: regressed });
    setPhase("result");
  };

  const arenaStyle: React.CSSProperties = {
    margin: "-20px", padding: "20px", borderRadius: "20px", position: "relative", overflow: "hidden",
    background: "radial-gradient(circle at 30% 0%, #292116 0%, #0F0B05 55%, #050302 100%)",
  };

  const styleTag = (
    <style>{`
      @keyframes toolFlip{0%{transform:rotateY(90deg);opacity:0}60%{transform:rotateY(-10deg);opacity:1}100%{transform:rotateY(0deg);opacity:1}}
      @keyframes dialSpin{0%{transform:rotate(0deg)}80%{transform:rotate(720deg)}100%{transform:rotate(760deg)}}
      @keyframes alarmFlash{0%,100%{box-shadow:0 0 0 0 rgba(239,68,68,0)}50%{box-shadow:0 0 30px 8px rgba(239,68,68,0.75)}}
      @keyframes vaultBannerIn{0%{opacity:0;transform:translate(-50%,-16px) scale(0.9)}15%{opacity:1;transform:translate(-50%,0) scale(1.03)}25%{transform:translate(-50%,0) scale(1)}85%{opacity:1;transform:translate(-50%,0) scale(1)}100%{opacity:0;transform:translate(-50%,-10px) scale(0.96)}}
      @keyframes twinkle{0%,100%{opacity:0.12;transform:scale(0.8)}50%{opacity:0.7;transform:scale(1.3)}}
      @keyframes vaultDiceSpin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}
      .vault-next-btn:hover{transform:scale(1.04);filter:brightness(1.1)}
      .vault-next-btn:active{transform:scale(0.97)}
    `}</style>
  );

  const AMBIENT = useRef(Array.from({ length: 14 }, (_, i) => ({
    left: (i * 37) % 100, top: (i * 53) % 100, size: 2 + (i % 3), delay: (i % 7) * 0.4, dur: 2.4 + (i % 5) * 0.5,
  }))).current;
  const ambientLayer = (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      {AMBIENT.map((p, i) => (
        <div key={i} style={{
          position: "absolute", left: `${p.left}%`, top: `${p.top}%`, width: `${p.size}px`, height: `${p.size}px`,
          borderRadius: "50%", background: "#FCD34D", opacity: 0.5, animation: `twinkle ${p.dur}s ease-in-out infinite ${p.delay}s`,
        }} />
      ))}
    </div>
  );

  if (categories.length === 0) {
    return (
      <div style={{ ...arenaStyle, textAlign: "center", color: "white" }}>
        {styleTag}
        <div style={{ fontSize: "40px", marginBottom: "10px" }}>🔐</div>
        <div style={{ fontWeight: "800", fontSize: "18px" }}>No rewrite-sentence content found for this topic selection.</div>
        <button onClick={onEnd} className="vault-next-btn" style={{ marginTop: "16px", background: "#D4AF37", color: "#1F1608", border: "none", borderRadius: "14px", padding: "14px 32px", fontSize: "16px", fontWeight: "900", cursor: "pointer" }}>🏁 End Game</button>
      </div>
    );
  }

  if (phase === "intro") return (
    <div style={{ ...arenaStyle, textAlign: "center" }}>
      {ambientLayer}
      {styleTag}
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ background: "linear-gradient(135deg,#3A2E12,#7A5C1E)", borderRadius: "20px", padding: "28px 24px", marginBottom: "10px", position: "relative", color: "white", maxWidth: "540px", margin: "0 auto 10px", boxShadow: "0 0 40px #D4AF3755" }}>
          <div style={{ fontSize: "36px", marginBottom: "10px" }}>🔐</div>
          <div style={{ fontWeight: "900", fontSize: "20px", marginBottom: "10px" }}>Vault Heist</div>
          <div style={{ fontSize: "15px", lineHeight: 1.7, opacity: 0.95 }}>
            Each team has their own vault with {LOCK_COUNT} locks. Before every question, a card reveals
            which transformation the lock needs — then you rewrite the sentence to match it.<br />
            ✅ Correct → the lock cracks open and you keep going — same team, next lock.<br />
            ❌ Wrong → your most recently cracked lock re-locks and the turn passes to the next team. No partial credit — accuracy is everything.<br />
            Roll the dice to see who cracks first — finishing all {LOCK_COUNT} locks earns a bonus (1st place gets the most, 2nd gets half that, 3rd a third, and so on), but the vault stays open until every team finishes!
          </div>
        </div>
        <button onClick={() => setPhase("rolling")} className="vault-next-btn" style={{ background: "linear-gradient(135deg,#7A5C1E,#D4AF37)", color: "#1F1608", border: "none", borderRadius: "16px", padding: "16px 48px", fontSize: "19px", fontWeight: "900", cursor: "pointer", boxShadow: "0 6px 24px rgba(212,175,55,0.5)", transition: "transform 0.15s ease" }}>🎲 Roll to Start!</button>
      </div>
    </div>
  );

  if (phase === "rolling") return (
    <div style={{ ...arenaStyle, textAlign: "center" }}>
      {ambientLayer}
      {styleTag}
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ fontWeight: "900", fontSize: "17px", marginBottom: "16px", color: "white" }}>🎲 Rolling to see who cracks first!</div>
        <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap", marginBottom: "16px" }}>
          {teams.map((t, i) => (
            <div key={t.id} style={{ background: `linear-gradient(160deg,${t.color.dark}55,#0F0B05)`, border: `3px solid ${t.color.bg}`, borderRadius: "16px", padding: "14px 20px", textAlign: "center" }}>
              <div style={{ fontWeight: "800", fontSize: "13px", color: "white" }}>{t.name}</div>
              <div style={{ fontSize: "44px", lineHeight: 1, animation: diceValues[i] != null && !rollDone ? "vaultDiceSpin 0.3s linear infinite" : "none" }}>{diceValues[i] != null ? DICE_FACES[diceValues[i]! - 1] : "🎲"}</div>
              {rollDone && diceValues[i] != null && (
                <div style={{ fontWeight: "900", fontSize: "13px", color: "#FCD34D", marginTop: "4px" }}>{diceValues[i]}</div>
              )}
            </div>
          ))}
        </div>
        {rollDone && finalOrder && (
          <div>
            <div style={{ background: "rgba(255,255,255,0.08)", border: "2px solid #D4AF37", borderRadius: "12px", padding: "12px 20px", marginBottom: "14px", display: "inline-block" }}>
              <div style={{ fontWeight: "700", fontSize: "13px", color: "#FCD34D", marginBottom: "6px" }}>Crack order:</div>
              <div style={{ display: "flex", gap: "8px", justifyContent: "center", alignItems: "center", flexWrap: "wrap" }}>
                {finalOrder.map((entry, pos) => {
                  const team = teams[entry.teamIdx];
                  return (
                    <span key={entry.teamIdx} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <span style={{ fontWeight: "900", fontSize: "13px", color: "#FCD34D88" }}>{pos + 1}.</span>
                      <span style={{ background: team.color.bg, color: "white", borderRadius: "8px", padding: "3px 10px", fontWeight: "800", fontSize: "13px" }}>{team.name}</span>
                      {pos < finalOrder.length - 1 && <span style={{ color: "#FCD34D88" }}>{"->"}</span>}
                    </span>
                  );
                })}
              </div>
            </div>
            <div>
              <button onClick={() => beginReveal(0)} className="vault-next-btn" style={{ background: "linear-gradient(135deg,#7A5C1E,#D4AF37)", color: "#1F1608", border: "none", borderRadius: "12px", padding: "12px 28px", fontSize: "16px", fontWeight: "800", cursor: "pointer", transition: "transform 0.15s ease" }}>▶️ Begin the Heist!</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  if (phase === "gameover") {
    // Everyone has finished by the time this phase fires, so standings come straight from actual
    // finish order — no need to fall back to lock-count, that would just show LOCK_COUNT for all.
    const ranked = finishOrderRef.current.map(id => teams.find(t => t.id === id)!);
    const winnerTeam = ranked[0];
    return (
      <div style={{ ...arenaStyle, textAlign: "center" }}>
        {ambientLayer}
        {styleTag}
        <Confetti active={confettiActive} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: "48px", marginBottom: "6px" }}>🏆</div>
          <div style={{ fontWeight: "900", fontSize: "24px", color: "#FCD34D", marginBottom: "4px", textShadow: "0 0 24px rgba(212,175,55,0.6)" }}>
            🔓 {winnerTeam.name} cracked the vault first!
          </div>
          <div style={{ color: "#B8A98A", fontSize: "14px", marginBottom: "20px" }}>Every team cracked all {LOCK_COUNT} locks — heist complete. Final standings:</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxWidth: "420px", margin: "0 auto 24px" }}>
            {ranked.map((t, i) => {
              const rank = i + 1;
              const isFirst = rank === 1;
              return (
                <div key={t.id} style={{
                  display: "flex", alignItems: "center", gap: "12px",
                  background: isFirst ? `linear-gradient(160deg,${t.color.dark}66,#0F0B05)` : "linear-gradient(160deg,#2A2317,#0F0B05)",
                  border: `2px solid ${isFirst ? t.color.bg : "#6B5B3A"}`, borderRadius: "14px", padding: isFirst ? "12px 16px" : "10px 16px",
                  opacity: isFirst ? 1 : 0.9,
                }}>
                  <span style={{ fontSize: isFirst ? "24px" : "20px" }}>{medalFor(rank)}</span>
                  <span style={{ flex: 1, textAlign: "left", fontWeight: isFirst ? "900" : "800", color: isFirst ? "white" : "#D6C9AE", fontSize: isFirst ? "16px" : "15px" }}>{t.name}</span>
                  <span style={{ fontWeight: "800", color: isFirst ? "#FCD34D" : "#9C8B6A", fontSize: "13px" }}>{ordinal(rank)} · +{finishBonusForRank(rank)} pts</span>
                </div>
              );
            })}
          </div>
          <button onClick={onEnd} className="vault-next-btn" style={{ background: "linear-gradient(135deg,#7A5C1E,#D4AF37)", color: "#1F1608", border: "none", borderRadius: "14px", padding: "14px 32px", fontSize: "17px", fontWeight: "900", cursor: "pointer", boxShadow: "0 6px 24px rgba(212,175,55,0.5)", transition: "transform 0.15s ease" }}>🏁 End Game</button>
        </div>
      </div>
    );
  }

  const phaseHeaderText = () => {
    if (phase === "reveal") return "Revealing the lock...";
    if (phase === "answer") return "Crack the lock!";
    if (phase === "result") return "Turn resolved!";
    return "";
  };

  return (
    <div style={arenaStyle}>
      {ambientLayer}
      {styleTag}
      <Confetti active={confettiActive} />
      {winBanner && (
        <div key={winBanner.key} style={{
          position: "absolute", top: "14px", left: "50%", zIndex: 20, whiteSpace: "nowrap",
          background: `linear-gradient(135deg,${winBanner.color},#7A5C1E)`, border: "2px solid #FCD34D",
          borderRadius: "14px", padding: "12px 24px", boxShadow: "0 8px 28px rgba(0,0,0,0.5)",
          animation: "vaultBannerIn 3.2s ease-in-out forwards",
        }}>
          <span style={{ color: "white", fontWeight: "900", fontSize: "16px", textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}>
            {medalFor(winBanner.rank)} {winBanner.teamName} finished {ordinal(winBanner.rank)}! +{winBanner.bonus} pts
          </span>
        </div>
      )}
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ display: "grid", gridTemplateColumns: teamsGridCols(teams.length), gap: "10px", marginBottom: "16px" }}>
          {teams.map(tm => {
            const cracked = vaultLocks[tm.id] ?? 0;
            const isActive = activeTeam.id === tm.id;
            const justChanged = isActive && phase === "result" && !!lastOutcome;
            const finishRank = finishOrderRef.current.indexOf(tm.id);
            const finished = finishRank !== -1;
            return (
              <div key={tm.id} style={{
                position: "relative", overflow: "hidden",
                background: `linear-gradient(160deg, ${tm.color.dark}33, #0F0B05)`,
                border: `2px solid ${tm.color.bg}`, borderRadius: "18px", padding: "12px",
                boxShadow: isActive ? `0 0 20px ${tm.color.bg}88, inset 0 0 20px ${tm.color.bg}22` : `0 0 10px ${tm.color.bg}44`,
                transition: "box-shadow 0.3s ease", opacity: finished && !isActive ? 0.75 : 1,
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                  <div style={{ fontWeight: "900", fontSize: "13px", color: "#F3F4F6", textShadow: "0 1px 3px rgba(0,0,0,0.6)" }}>{tm.name}</div>
                  {finished && (
                    <div style={{ fontSize: "11px", fontWeight: "800", color: "#FCD34D" }}>{medalFor(finishRank + 1)} {ordinal(finishRank + 1)}</div>
                  )}
                </div>
                <LockRow cracked={cracked} total={LOCK_COUNT} justChanged={justChanged} />
              </div>
            );
          })}
        </div>

        <div style={{ background: `linear-gradient(90deg, ${activeTeam.color.bg}, ${activeTeam.color.dark})`, borderRadius: "14px", padding: "10px 16px", marginBottom: "12px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px", boxShadow: `0 4px 18px ${activeTeam.color.bg}55` }}>
          <span style={{ color: "white", fontWeight: "900", fontSize: "16px", textShadow: "0 1px 3px rgba(0,0,0,0.4)" }}>🔐 {activeTeam.name} — {phaseHeaderText()}</span>
          {phase === "answer" && <TurnTimerBar timeLeft={timeLeft} totalSeconds={TURN_SECONDS} />}
        </div>

        {phase === "reveal" && currentCategory && (
          <div style={{ textAlign: "center" }}>
            <div style={{
              display: "inline-block", background: "linear-gradient(135deg,#3A2E12,#7A5C1E)", border: "3px solid #D4AF37",
              borderRadius: "16px", padding: "20px 32px", boxShadow: "0 8px 28px rgba(212,175,55,0.4)",
              animation: "toolFlip 0.5s ease-out",
            }}>
              <div style={{ fontSize: "13px", fontWeight: "700", color: "#E8D8AE", marginBottom: "6px", letterSpacing: "0.05em" }}>🔧 THIS LOCK NEEDS</div>
              <div style={{ fontSize: "24px", fontWeight: "900", color: "#FCD34D" }}>{formatCategory(currentCategory)}</div>
              {currentQuestion?.form && (
                <div style={{ marginTop: "10px", display: "inline-block", background: "#7F1D1D", border: "2px solid #FCA5A5", borderRadius: "10px", padding: "5px 14px" }}>
                  <span style={{ fontSize: "13px", fontWeight: "800", color: "#FCA5A5" }}>
                    {currentQuestion.form === "question" ? "❓ ALSO NEEDS: A QUESTION" : "🚫 ALSO NEEDS: NEGATIVE"}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {phase === "answer" && (
          <>
            <QuestionCard question={currentQuestion} showAnswer={showAns} onReveal={handleReveal} />
            {currentQuestion && (showAns || currentQuestion?.type === "speaking task") && (
              <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginTop: "12px" }}>
                <button onClick={handleCorrect} className="vault-next-btn" style={{ background: "#22C55E", color: "white", border: "none", borderRadius: "12px", padding: "12px 24px", fontSize: "16px", fontWeight: "700", cursor: "pointer", transition: "transform 0.15s ease" }}>✅ Correct — Crack it!</button>
                <button onClick={handleWrong} className="vault-next-btn" style={{ background: "#EF4444", color: "white", border: "none", borderRadius: "12px", padding: "12px 24px", fontSize: "16px", fontWeight: "700", cursor: "pointer", transition: "transform 0.15s ease" }}>❌ Wrong</button>
              </div>
            )}
          </>
        )}

        {phase === "result" && lastOutcome && (() => {
          const justFinished = lastOutcome.correct && lastOutcome.locksNow >= LOCK_COUNT;
          const allFinished = finishOrderRef.current.length >= teams.length;
          return (
            <div style={{ marginTop: "4px", textAlign: "center" }}>
              {lastOutcome.correct ? (
                <div style={{ background: "rgba(120,53,15,0.35)", border: "2px solid #D4AF37", borderRadius: "14px", padding: "14px", marginBottom: "10px", backdropFilter: "blur(4px)" }}>
                  <div style={{ fontWeight: "900", fontSize: "17px", color: "#FCD34D" }}>🔓 {activeTeam.name} cracked lock {lastOutcome.locksNow}/{LOCK_COUNT}!</div>
                  <div style={{ color: "#E8D8AE", fontWeight: "700", fontSize: "13px", marginTop: "4px" }}>
                    {justFinished ? "Vault fully cracked!" : `+${CRACK_SCORE} pts — same team, next lock!`}
                  </div>
                </div>
              ) : (
                <div style={{ background: "rgba(127,29,29,0.35)", border: "2px solid #EF4444", borderRadius: "14px", padding: "14px", marginBottom: "10px", backdropFilter: "blur(4px)", animation: "alarmFlash 0.9s ease-in-out" }}>
                  <div style={{ fontWeight: "900", fontSize: "17px", color: "#FCA5A5" }}>🚨 Alarm! {activeTeam.name}'s last crack re-locked.</div>
                  <div style={{ color: "#FCA5A5", fontWeight: "700", fontSize: "13px", marginTop: "4px" }}>Now at {lastOutcome.locksNow}/{LOCK_COUNT} locks — turn passes.</div>
                </div>
              )}
              {!allFinished && (
                lastOutcome.correct && !justFinished ? (
                  <button onClick={keepGoing} className="vault-next-btn" style={{ background: "#D4AF37", color: "#1F1608", border: "none", borderRadius: "12px", padding: "12px 28px", fontSize: "16px", fontWeight: "800", cursor: "pointer", boxShadow: "0 4px 16px rgba(212,175,55,0.5)", transition: "transform 0.15s ease" }}>🔓 Keep Going!</button>
                ) : (
                  <button onClick={advanceTurn} className="vault-next-btn" style={{ background: "#6366F1", color: "white", border: "none", borderRadius: "12px", padding: "12px 28px", fontSize: "16px", fontWeight: "800", cursor: "pointer", boxShadow: "0 4px 16px rgba(99,102,241,0.5)", transition: "transform 0.15s ease" }}>➡️ Next Team</button>
                )
              )}
            </div>
          );
        })()}
      </div>
    </div>
  );
}
