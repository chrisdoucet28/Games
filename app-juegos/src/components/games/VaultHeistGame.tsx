import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { TeamIcon, MascotSprite } from "../shared/TeamIcon";
import { Icon } from "../shared/Icon";
import { RankBadge } from "../shared/RankBadge";
import type { GameProps, QuestionData } from "../../types";
import { useTurnTimer } from "../../hooks/useTurnTimer";
import { TurnTimerBar } from "../shared/TurnTimerBar";
import { QuestionCard } from "../shared/QuestionCard";
import { Confetti } from "../shared/Confetti";
import { teamsGridCols, GAME_MODES, GAME_ICONS } from "../../data/constants";
import { TOPIC_OPTIONS } from "../../data/topics";
import { makeSoloCpuTeam } from "../../lib/soloOpponent";
import { HowToPlayModal } from "../shared/HowToPlayModal";
import { VAULT_TUTORIAL_STEPS } from "../../data/tutorials/vault";

const GM = GAME_MODES.find(g => g.id === "vault")!;

// How long the CPU takes to attempt its own lock, and how long its result banner stays up
// before it auto-advances — standing in for the fact it can't actually answer a real question.
// Pace gets tougher on harder difficulty, same as the player's own timer.
const CPU_ANSWER_MS_BY_DIFFICULTY: Record<Difficulty, number> = { easy: 2200, medium: 1600, hard: 1000 };
const CPU_RESULT_MS = 1400;
// Per-lock-index success chance (indexed the same way as DIFFICULTY_BY_LOCK_INDEX below) — locks
// 3-5 need a stacked negative/question form on top of the base grammar, so the CPU gets less
// reliable as it goes, same as a real student would. A flat per-game probability regardless of
// lock difficulty made the CPU crack all 5 in an unbroken streak far too often (a flat 0.9 on
// hard meant a ~59% chance of a flawless run) — these numbers put a flawless run at roughly
// 1-8% depending on difficulty, occasional but not the norm.
const CPU_SUCCESS_PROB_BY_DIFFICULTY: Record<Difficulty, number[]> = {
  easy: [0.55, 0.5, 0.42, 0.36, 0.3],
  medium: [0.65, 0.6, 0.5, 0.44, 0.36],
  hard: [0.78, 0.72, 0.62, 0.54, 0.46],
};

const LOCK_COUNT = 5;
// 25s was the only speed on offer, and felt too tight as a default — kept as the "hard" option,
// with easy/medium giving slower-writing teams more room. Chosen on the intro screen before rolling.
const TURN_SECONDS_BY_DIFFICULTY: Record<Difficulty, number> = { easy: 40, medium: 30, hard: 25 };
const REVEAL_MS = 3000;
const CRACK_SCORE = 10;
// The vault no longer ends the moment one team finishes — every team keeps playing (and
// practicing) until the last team cracks their 5th lock. Finish order still matters: 1st place
// gets the full bonus, 2nd gets half, 3rd a third, etc., so racing to finish first is still
// worthwhile without cutting everyone else's practice short.
const FIRST_FINISH_BONUS = 100;
function finishBonusForRank(rank: number): number {
  return Math.round(FIRST_FINISH_BONUS / rank);
}
function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
// Same "let the banner actually be seen" fix pattern as Castle Defense (3400ms) / Battleship (1700ms).
const GAMEOVER_DELAY_MS = 2400;
const DIFFICULTY_BY_LOCK_INDEX = ["easy", "easy", "medium", "medium", "hard"];
// Which "form" (undefined = plain grammar, or negative/question stacked on top) a lock prefers to
// draw, indexed the same way as DIFFICULTY_BY_LOCK_INDEX. Locks 1-2 are guaranteed plain (no
// stacking at all) so the first couple of locks are a reliably easier on-ramp; stacking only
// starts at lock 3, guaranteed from there through lock 5. Positive/negative/question never combine
// with each other (no negative questions) — that's enforced by content authoring (each item has
// at most one form), not by this preference list.
const FORM_PREFERENCE_BY_LOCK_INDEX: (QuestionData["form"] | undefined)[][] = [
  [undefined],
  [undefined],
  ["negative", "question"],
  ["negative", "question"],
  ["negative", "question"],
];
// Same local pip-mask pattern as Spy Among Us's/King of the Hill's/Castle Defense's DiceFace —
// kept file-local since each game's dice roll is its own independent turn mechanic.
const DICE_PIPS: Record<number, [number, number][]> = {
  1: [[12, 12]],
  2: [[8, 8], [16, 16]],
  3: [[8, 8], [12, 12], [16, 16]],
  4: [[8, 8], [16, 8], [8, 16], [16, 16]],
  5: [[8, 8], [16, 8], [12, 12], [8, 16], [16, 16]],
  6: [[8, 8], [16, 8], [8, 12], [16, 12], [8, 16], [16, 16]],
};
function DiceFace({ value, size = 44, spinning = false }: { value: number | null; size?: number; spinning?: boolean }) {
  if (value === null) return <Icon name="dice" size={size} />;
  const maskId = `vault-dice-${value}`;
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true"
      style={{ display: "inline-block", animation: spinning ? "vaultDiceSpin 0.3s linear infinite" : "none" }}>
      <mask id={maskId}>
        <rect width="24" height="24" fill="white" />
        {DICE_PIPS[value].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="1.6" fill="black" />)}
      </mask>
      <rect x="3" y="3" width="18" height="18" rx="5" fill="currentColor" mask={`url(#${maskId})`} />
    </svg>
  );
}

type Phase = "intro" | "rolling" | "reveal" | "answer" | "result" | "gameover";
type Outcome = { correct: boolean; category: string; locksNow: number; timedOut?: boolean };
type Difficulty = "easy" | "medium" | "hard";
type WinBanner = { teamName: string; color: string; rank: number; bonus: number; key: number };
type OrderEntry = { teamIdx: number; roll: number };

// What "Save & Exit" snapshots and "Resume" restores. Deliberately does NOT include the
// in-flight question/category/timer — resuming just redraws a fresh question for whichever team
// was up next, at the lock they were already on. That's a much smaller, sturdier surface than
// trying to replay the exact reveal/answer/timer moment a save happened to land on.
type VaultHeistSnapshot = {
  vaultLocks: Record<string | number, number>;
  turnOrder: number[];
  orderPos: number;
  difficulty: Difficulty;
  finishOrder: (string | number)[];
};

function validateSnapshot(raw: unknown, teamCount: number): VaultHeistSnapshot | undefined {
  const s = raw as Partial<VaultHeistSnapshot> | null | undefined;
  if (!s || !Array.isArray(s.turnOrder) || s.turnOrder.length !== teamCount) return undefined;
  if (typeof s.orderPos !== "number" || s.orderPos < 0 || s.orderPos >= teamCount) return undefined;
  return {
    vaultLocks: s.vaultLocks ?? {},
    turnOrder: s.turnOrder,
    orderPos: s.orderPos,
    difficulty: s.difficulty ?? "medium",
    finishOrder: s.finishOrder ?? [],
  };
}

function formatCategory(tag: string): string {
  return tag.replace(/-/g, " ").toUpperCase();
}

// "negative", "question", and "affirmative" are the only transform tags reused across dozens of
// unrelated topics spanning many different tenses (past simple, present perfect, modals, "so do
// I"...). Every other transform tag already bakes in its own tense/structure (e.g.
// "tense-past-simple"), so a pool naming it is unambiguous regardless of which topic it came from.
// These three bare tags aren't — pooling every topic's "affirmative" content together would let a
// lock draw a sentence belonging to a completely different topic than the rest of that question.
// Scoping just these three to their source topic (rather than every category) keeps genuinely
// topic-specific pools exactly as they were before this existed. This is purely a pooling/draw
// concern now — the lock card always shows its source topic as its own permanent line (see the
// "reveal" phase JSX below) regardless of transform tag, so unlike before, a new transform tag can
// never silently lose its topic label from the display.
const AMBIGUOUS_TRANSFORMS = new Set(["negative", "question", "affirmative"]);
function categoryKeyFor(q: QuestionData): string {
  if (q.transform && AMBIGUOUS_TRANSFORMS.has(q.transform) && q.sourceTopic) {
    return `${q.sourceTopic}::${q.transform}`;
  }
  return q.transform ?? "";
}
function displayCategory(categoryKey: string): string {
  const sep = categoryKey.indexOf("::");
  const transformTag = sep === -1 ? categoryKey : categoryKey.slice(sep + 2);
  return formatCategory(transformTag);
}

// One question list per category, shared by every team in the game. Deliberately NOT one
// independent copy per team: pickQuestion below tracks "seen" per category across all teams
// together, so once Team A has been shown a sentence, Team B won't draw that same sentence
// until the whole game has exhausted the category — this is what actually prevents cross-team
// repeats. (An earlier version gave each team its own shuffled copy of the same content with
// independent per-team freshness tracking; that only stopped a single team from repeating a
// sentence to *itself*, and did nothing to stop two different teams from independently landing
// on the same sentence, which is exactly what a teacher running a 3-4 team game reported.)
// Mirrors BattleshipGame's buildCoordMap philosophy of deriving pools from the actual question
// data rather than a hardcoded structure.
function buildDrawPools(rewriteQs: QuestionData[], categories: string[]) {
  const pools: Record<string, QuestionData[]> = {};
  categories.forEach(c => { pools[c] = rewriteQs.filter(q => categoryKeyFor(q) === c); });
  return pools;
}

function LockRow({ cracked, total, justChanged }: { cracked: number; total: number; justChanged: boolean }) {
  return (
    <div style={{ display: "flex", gap: "4px", justifyContent: "center" }}>
      {Array.from({ length: total }).map((_, i) => (
        <span key={i} style={{
          color: "#FCD34D",
          opacity: i < cracked ? 1 : 0.32,
          filter: i < cracked ? "drop-shadow(0 0 4px #FCD34D88)" : "none",
          animation: justChanged && i === Math.max(0, cracked - 1) ? "dialSpin 0.6s ease-out" : "none",
        }}>
          <Icon name={i < cracked ? "unlocked" : "lock"} size={22} />
        </span>
      ))}
    </div>
  );
}

export function VaultHeistGame({ questions, teams: propTeams, onUpdateScore, onEnd, forceFinalRef, serializeStateRef, initialGameState }: GameProps) {
  // Solo play makes the CPU a real dice-rolled turn participant — "just another team, but it's
  // a CPU" — cracking its own vault on its own turn in the same rolled order. The one thing it
  // can't do is answer a real question, so its own turn auto-resolves via a difficulty-tuned
  // random roll (see the two new effects below).
  const isSolo = propTeams.length === 1;
  const cpuRef = useRef(isSolo ? makeSoloCpuTeam() : null);
  const [cpuScore, setCpuScore] = useState(0);
  // Memoized so `teams` is referentially stable across renders when nothing has actually
  // changed — effects/callbacks in this file depend on `teams` by reference, and a fresh array
  // literal every render would make them re-fire (and re-setState) forever.
  const teams = useMemo(
    () => (isSolo ? [propTeams[0], { ...cpuRef.current!, score: cpuScore }] : propTeams),
    [isSolo, propTeams, cpuScore]
  );
  const updateScore = (id: string | number, delta: number) => {
    if (isSolo && id === cpuRef.current?.id) { setCpuScore(s => s + delta); }
    else { onUpdateScore(id, delta); }
  };

  const rewriteQs = useRef(questions.filter(q => q.type === "rewrite sentences")).current;
  const categories = useRef([...new Set(rewriteQs.map(categoryKeyFor).filter((c): c is string => !!c))]).current;
  const pools = useRef(buildDrawPools(rewriteQs, categories)).current;
  const resumed = useRef(validateSnapshot(initialGameState, teams.length)).current;

  const [vaultLocks, setVaultLocks] = useState<Record<string | number, number>>(
    () => resumed?.vaultLocks ?? Object.fromEntries(teams.map(t => [t.id, 0]))
  );

  // turnOrder[pos] = index into `teams`, established once by the dice roll before play begins.
  // orderPos is a position WITHIN that order — since a team keeps its turn on every correct
  // answer now (no longer round-robin per question), the dice roll is what keeps whichever team
  // rolls highest from having a permanent structural advantage as the perpetual first-mover.
  const [turnOrder, setTurnOrder] = useState<number[]>(() => resumed?.turnOrder ?? teams.map((_, i) => i));
  const [orderPos, setOrderPos] = useState(() => resumed?.orderPos ?? 0);
  const [diceValues, setDiceValues] = useState<(number | null)[]>(() => teams.map(() => null));
  const [rollDone, setRollDone] = useState(false);
  const [finalOrder, setFinalOrder] = useState<OrderEntry[] | null>(null);

  // A resumed vault skips the intro/roll screens entirely and drops straight into "reveal" for
  // whichever team was up — bootstrapped once below, after finishOrderRef is seeded.
  const [phase, setPhase] = useState<Phase>(() => resumed ? "reveal" : "intro");
  const [showHowTo, setShowHowTo] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>(() => resumed?.difficulty ?? "medium");
  const [currentCategory, setCurrentCategory] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<QuestionData | null>(null);
  const [showAns, setShowAns] = useState(false);
  const [lastOutcome, setLastOutcome] = useState<Outcome | null>(null);
  const [winBanner, setWinBanner] = useState<WinBanner | null>(null);
  const [confettiActive, setConfettiActive] = useState(false);
  const fxId = useRef(0);
  // Order teams finish in — index 0 is 1st place. Drives both the rank-based bonus and the
  // gameover standings; a team's id lands here exactly once, the moment they crack lock 5.
  const finishOrderRef = useRef<(string | number)[]>(resumed?.finishOrder ?? []);

  useEffect(() => {
    if (!forceFinalRef) return;
    forceFinalRef.current = phase === "gameover" ? null : () => {
      // The gameover screen assumes finishOrderRef covers every team — backfill anyone who
      // hasn't cracked all 5 locks yet, ranked below the teams who actually finished, ordered
      // by how many locks they'd cracked so far.
      const finishedIds = new Set(finishOrderRef.current);
      const unfinished = teams.filter(t => !finishedIds.has(t.id))
        .sort((a, b) => (vaultLocks[b.id] ?? 0) - (vaultLocks[a.id] ?? 0));
      finishOrderRef.current = [...finishOrderRef.current, ...unfinished.map(t => t.id)];
      setPhase("gameover");
      return true;
    };
    return () => { if (forceFinalRef) forceFinalRef.current = null; };
  }, [forceFinalRef, phase, teams, vaultLocks]);

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

  // Picks one question at random from a category's pool, preferring the lock's target difficulty
  // and never repeating a sentence ANY team in this game has already seen in that category until
  // every question in the pool has come up at least once — same "deck reshuffles only once
  // exhausted" rule Hot Seat's word list uses, rather than the old "just not the literal last
  // one" check, which let the same handful of difficulty/form-matched items resurface within a
  // few turns even with a large topic selection, since the whole pool was rarely small enough to
  // hit that narrow a repeat window on its own. Freshness is tracked per CATEGORY, shared across
  // every team, not per (team × category) — a teacher running a 3-4 team game reported "all teams
  // got the same sentences," and per-team-only tracking couldn't prevent that: it stops one team
  // from repeating a sentence to itself, but has no way to know what a different team already saw.
  const seenRef = useRef<Record<string, Set<string>>>({});
  // Six-tier fallback: the first two tiers additionally prefer the lock's desired form (per
  // FORM_PREFERENCE_BY_LOCK_INDEX) on top of the existing difficulty preference; tiers 3-6 are
  // exactly the original four tiers, unchanged, so a topic with no form-tagged content anywhere
  // (i.e. every item's form is undefined) falls straight through to tier 3 and plays exactly as it
  // did before this feature existed — content can migrate topic-by-topic with nothing breaking.
  const pickQuestion = useCallback((category: string, desiredDifficulty: string, desiredForms: (QuestionData["form"] | undefined)[]) => {
    const categoryPool = pools[category] ?? [];
    if (!categoryPool.length) return null;
    const seen = seenRef.current[category] ?? (seenRef.current[category] = new Set());
    // A full lap: every question in this category has already been shown once (to any team)
    // since the last reset. Clearing here (rather than never clearing) is what lets a category
    // keep being playable turn after turn instead of running dry and falling back to the
    // whole-pool "ignore freshness" tier for the rest of the game.
    if (seen.size >= categoryPool.length) seen.clear();
    const isFresh = (q: QuestionData) => !seen.has(q.question ?? "");
    const matchesForm = (q: QuestionData) => desiredForms.includes(q.form);
    const byDifficultyFormFresh = categoryPool.filter(q => q.difficulty === desiredDifficulty && matchesForm(q) && isFresh(q));
    const anyDifficultyFormFresh = categoryPool.filter(q => matchesForm(q) && isFresh(q));
    const byDifficultyFresh = categoryPool.filter(q => q.difficulty === desiredDifficulty && isFresh(q));
    const anyFresh = categoryPool.filter(q => isFresh(q));
    const byDifficultyAny = categoryPool.filter(q => q.difficulty === desiredDifficulty);
    const source = byDifficultyFormFresh.length ? byDifficultyFormFresh
      : anyDifficultyFormFresh.length ? anyDifficultyFormFresh
      : byDifficultyFresh.length ? byDifficultyFresh
      : anyFresh.length ? anyFresh
      : byDifficultyAny.length ? byDifficultyAny
      : categoryPool;
    const chosen = source[Math.floor(Math.random() * source.length)];
    seen.add(chosen.question ?? "");
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
    setCurrentQuestion(pickQuestion(category, desiredDifficulty, desiredForms));
    setShowAns(false);
    setLastOutcome(null);
    setPhase("reveal");
    setTimeout(() => setPhase(p => (p === "reveal" ? "answer" : p)), REVEAL_MS);
  }, [pickCategory, pickQuestion, teams, turnOrder, vaultLocks]);

  // Runs exactly once, only for a resumed vault — draws a fresh question for whichever team/lock
  // was active when it was saved, instead of trying to replay the exact card that was on screen.
  const bootstrapped = useRef(false);
  useEffect(() => {
    if (!resumed || bootstrapped.current) return;
    bootstrapped.current = true;
    beginReveal(resumed.orderPos);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!serializeStateRef) return;
    serializeStateRef.current = (): VaultHeistSnapshot => ({
      vaultLocks, turnOrder, orderPos, difficulty, finishOrder: finishOrderRef.current,
    });
    return () => { if (serializeStateRef) serializeStateRef.current = null; };
  }, [serializeStateRef, vaultLocks, turnOrder, orderPos, difficulty]);

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

  const turnSeconds = TURN_SECONDS_BY_DIFFICULTY[difficulty];

  // Time running out used to just call advanceTurn() directly — the team never saw what they were
  // supposed to write, the card just vanished into the next team's reveal. Now it resolves like a
  // (penalty-free) turn: locks stay exactly where they were, but the phase moves to "result" with
  // the answer shown, same as a normal reveal, so there's always a learning moment before moving on.
  const handleTimeout = () => {
    if (!currentCategory) { advanceTurn(); return; }
    setShowAns(true);
    setLastOutcome({ correct: false, timedOut: true, category: currentCategory, locksNow: vaultLocks[activeTeam.id] ?? 0 });
    setPhase("result");
  };

  const { timeLeft, stop } = useTurnTimer(turnSeconds, phase === "answer", handleTimeout, orderPos);

  const showWin = (teamName: string, color: string, rank: number, bonus: number) => {
    const id = fxId.current++;
    setWinBanner({ teamName, color, rank, bonus, key: id });
  };

  const handleReveal = () => { stop(); setShowAns(true); };

  const handleCorrect = () => {
    if (!currentCategory) return;
    const newCount = Math.min(LOCK_COUNT, (vaultLocks[activeTeam.id] ?? 0) + 1);
    setVaultLocks(prev => ({ ...prev, [activeTeam.id]: newCount }));
    updateScore(activeTeam.id, CRACK_SCORE);
    setShowAns(false);
    setLastOutcome({ correct: true, category: currentCategory, locksNow: newCount });
    setPhase("result");

    if (newCount >= LOCK_COUNT && !finishOrderRef.current.includes(activeTeam.id)) {
      finishOrderRef.current.push(activeTeam.id);
      const rank = finishOrderRef.current.length;
      const bonus = finishBonusForRank(rank);
      updateScore(activeTeam.id, bonus);
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

  // CPU can't actually answer a real question — auto-resolve its own lock attempt via a
  // difficulty-tuned random success roll, driving the exact same handleCorrect/handleWrong path
  // a teacher's judgment would. Success chance depends on which lock it's attempting (not just the
  // game's overall difficulty setting), so it gets less reliable on the later, form-stacked locks.
  // Must stay above every early return below (Rules of Hooks).
  useEffect(() => {
    if (!isSolo || phase !== "answer" || activeTeam.id !== cpuRef.current?.id) return;
    const lockIndex = Math.min(vaultLocks[activeTeam.id] ?? 0, LOCK_COUNT - 1);
    const successProb = CPU_SUCCESS_PROB_BY_DIFFICULTY[difficulty][lockIndex];
    const timer = setTimeout(() => {
      if (Math.random() < successProb) handleCorrect(); else handleWrong();
    }, CPU_ANSWER_MS_BY_DIFFICULTY[difficulty]);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSolo, phase, activeTeam.id, difficulty]);

  // Once the CPU's result banner has had a moment to show, auto-advance — reuses the exact same
  // keepGoing/advanceTurn a human clicking "Keep Going!"/"Next Team" would trigger.
  useEffect(() => {
    if (!isSolo || phase !== "result" || activeTeam.id !== cpuRef.current?.id || !lastOutcome) return;
    if (finishOrderRef.current.length >= teams.length) return; // gameover already scheduled elsewhere
    const justFinished = lastOutcome.correct && lastOutcome.locksNow >= LOCK_COUNT;
    const timer = setTimeout(() => {
      if (lastOutcome.correct && !justFinished) keepGoing(); else advanceTurn();
    }, CPU_RESULT_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSolo, phase, activeTeam.id, lastOutcome]);

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
        <div style={{ marginBottom: "10px" }}><Icon name="lock" size={40} /></div>
        <div style={{ fontWeight: "800", fontSize: "18px" }}>No rewrite-sentence content found for this topic selection.</div>
        <button onClick={onEnd} className="vault-next-btn" style={{ marginTop: "16px", background: "#D4AF37", color: "#1F1608", border: "none", borderRadius: "14px", padding: "14px 32px", fontSize: "16px", fontWeight: "900", cursor: "pointer" }}><Icon name="checkeredFlag" size={15} /> End Game</button>
      </div>
    );
  }

  // Tutorial mockup: src/data/tutorials/vault.tsx — update if this intro's rules text changes.
  if (phase === "intro") return (
    <div style={{ ...arenaStyle, textAlign: "center" }}>
      {ambientLayer}
      {styleTag}
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ background: "linear-gradient(135deg,#3A2E12,#7A5C1E)", borderRadius: "20px", padding: "28px 24px", marginBottom: "10px", position: "relative", color: "white", maxWidth: "540px", margin: "0 auto 10px", boxShadow: "0 0 40px #D4AF3755" }}>
          <div style={{ marginBottom: "10px" }}><Icon name="lock" size={36} /></div>
          <div style={{ fontWeight: "900", fontSize: "20px", marginBottom: "10px" }}>Vault Heist</div>
          <div style={{ fontSize: "15px", lineHeight: 1.7, opacity: 0.95 }}>
            Crack open your team's vault, one lock at a time, by rewriting each sentence to match the card.<br />
            <span style={{ display: "inline-flex", alignItems: "center", gap: "3px" }}><Icon name="check" size={13} /> Correct → the lock cracks and you keep going.</span> <span style={{ display: "inline-flex", alignItems: "center", gap: "3px" }}><Icon name="close" size={11} /> Wrong → your last crack re-locks and the turn passes on.</span> No partial credit — accuracy is everything.
          </div>
        </div>
        <div style={{ marginBottom: "20px" }}>
          <div style={{ color: "#D6C9AE", fontWeight: "800", fontSize: "13px", marginBottom: "10px", letterSpacing: "0.04em", textTransform: "uppercase", display: "flex", alignItems: "center", justifyContent: "center", gap: "5px" }}><Icon name="clock" size={13} /> Choose a timer speed</div>
          <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
            {(["easy", "medium", "hard"] as const).map(d => {
              const selected = difficulty === d;
              const dotColor = d === "easy" ? "#22C55E" : d === "medium" ? "#EAB308" : "#EF4444";
              const label = d[0].toUpperCase() + d.slice(1);
              return (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className="vault-next-btn"
                  style={{
                    background: selected ? "linear-gradient(135deg,#7A5C1E,#D4AF37)" : "rgba(255,255,255,0.08)",
                    color: selected ? "#1F1608" : "#E8D8AE",
                    border: `2px solid ${selected ? "#D4AF37" : "#6B5B3A"}`,
                    borderRadius: "12px", padding: "10px 20px", fontWeight: "800", fontSize: "14px",
                    cursor: "pointer", transition: "transform 0.15s ease",
                    display: "inline-flex", alignItems: "center", gap: "6px",
                  }}
                >
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: dotColor, display: "inline-block" }} /> {label} · {TURN_SECONDS_BY_DIFFICULTY[d]}s
                </button>
              );
            })}
          </div>
        </div>
        <button onClick={() => setShowHowTo(true)} className="vault-next-btn" style={{ display: "block", margin: "0 auto 14px", background: "rgba(255,255,255,0.95)", color: GM.color, border: `2px solid ${GM.color}`, boxShadow: "0 2px 8px rgba(0,0,0,0.18)", borderRadius: "12px", padding: "10px 24px", fontSize: "14px", fontWeight: "800", cursor: "pointer" }}>
          <Icon name="help" size={14} /> How to Play
        </button>
        {showHowTo && (
          <HowToPlayModal
            gameName={GM.name} gameIcon={GAME_ICONS[GM.id]} accentColor={GM.color}
            steps={VAULT_TUTORIAL_STEPS}
            onClose={() => setShowHowTo(false)}
          />
        )}
        <button onClick={() => setPhase("rolling")} className="vault-next-btn" style={{ background: "linear-gradient(135deg,#7A5C1E,#D4AF37)", color: "#1F1608", border: "none", borderRadius: "16px", padding: "16px 48px", fontSize: "19px", fontWeight: "900", cursor: "pointer", boxShadow: "0 6px 24px rgba(212,175,55,0.5)", transition: "transform 0.15s ease" }}><Icon name="dice" size={18} /> Roll to Start!</button>
      </div>
    </div>
  );

  if (phase === "rolling") return (
    <div style={{ ...arenaStyle, textAlign: "center" }}>
      {ambientLayer}
      {styleTag}
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ fontWeight: "900", fontSize: "17px", marginBottom: "16px", color: "white", display: "inline-flex", alignItems: "center", gap: "6px" }}><Icon name="dice" size={16} /> Rolling to see who cracks first!</div>
        <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap", marginBottom: "16px" }}>
          {teams.map((t, i) => (
            <div key={t.id} style={{ background: `linear-gradient(160deg,${t.color.dark}55,#0F0B05)`, border: `3px solid ${t.color.bg}`, borderRadius: "16px", padding: "14px 20px", textAlign: "center" }}>
              <div style={{ fontWeight: "800", fontSize: "13px", color: "white" }}>{t.name}</div>
              <div style={{ color: "#FCD34D", lineHeight: 1, marginTop: "4px" }}><DiceFace value={diceValues[i]} size={44} spinning={diceValues[i] != null && !rollDone} /></div>
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
              <button onClick={() => beginReveal(0)} className="vault-next-btn" style={{ background: "linear-gradient(135deg,#7A5C1E,#D4AF37)", color: "#1F1608", border: "none", borderRadius: "12px", padding: "12px 28px", fontSize: "16px", fontWeight: "800", cursor: "pointer", transition: "transform 0.15s ease" }}><Icon name="play" size={15} /> Begin the Heist!</button>
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
          <div style={{ marginBottom: "6px" }}><Icon name="trophy" size={48} /></div>
          <div style={{ fontWeight: "900", fontSize: "24px", color: "#FCD34D", marginBottom: "4px", textShadow: "0 0 24px rgba(212,175,55,0.6)", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
            <Icon name="unlocked" size={22} /> {winnerTeam.name} cracked the vault first!
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
                  <span><RankBadge rank={rank - 1} size={isFirst ? 24 : 20} /></span>
                  <span style={{ flex: 1, textAlign: "left", fontWeight: isFirst ? "900" : "800", color: isFirst ? "white" : "#D6C9AE", fontSize: isFirst ? "16px" : "15px" }}><TeamIcon team={t} /> {t.name}</span>
                  <span style={{ fontWeight: "800", color: isFirst ? "#FCD34D" : "#9C8B6A", fontSize: "13px" }}>{ordinal(rank)} · +{finishBonusForRank(rank)} pts</span>
                </div>
              );
            })}
          </div>
          <button onClick={onEnd} className="vault-next-btn" style={{ background: "linear-gradient(135deg,#7A5C1E,#D4AF37)", color: "#1F1608", border: "none", borderRadius: "14px", padding: "14px 32px", fontSize: "17px", fontWeight: "900", cursor: "pointer", boxShadow: "0 6px 24px rgba(212,175,55,0.5)", transition: "transform 0.15s ease" }}><Icon name="checkeredFlag" size={16} /> End Game</button>
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

  // Looked up once per render so both the big reveal card and the compact answer-phase reminder
  // (which repeats it after the reveal card disappears, in case a team forgot what the lock asked
  // for while they're heads-down writing) always agree on the same label.
  const topicLabel = currentQuestion?.sourceTopic
    ? TOPIC_OPTIONS.find(o => o.value === currentQuestion.sourceTopic)?.label
    : undefined;

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
          <span style={{ color: "white", fontWeight: "900", fontSize: "16px", textShadow: "0 1px 3px rgba(0,0,0,0.5)", display: "inline-flex", alignItems: "center", gap: "6px" }}>
            <RankBadge rank={winBanner.rank - 1} size={18} /> {winBanner.teamName} finished {ordinal(winBanner.rank)}! +{winBanner.bonus} pts
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
                    <div style={{ fontSize: "11px", fontWeight: "800", color: "#FCD34D", display: "flex", alignItems: "center", gap: "4px" }}><RankBadge rank={finishRank} size={16} /> {ordinal(finishRank + 1)}</div>
                  )}
                </div>
                <LockRow cracked={cracked} total={LOCK_COUNT} justChanged={justChanged} />
              </div>
            );
          })}
        </div>

        <div style={{ background: `linear-gradient(90deg, ${activeTeam.color.bg}, ${activeTeam.color.dark})`, borderRadius: "14px", padding: "10px 16px", marginBottom: "12px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px", boxShadow: `0 4px 18px ${activeTeam.color.bg}55` }}>
          <span style={{ color: "white", fontWeight: "900", fontSize: "16px", textShadow: "0 1px 3px rgba(0,0,0,0.4)", display: "inline-flex", alignItems: "center", gap: "6px" }}><Icon name="lock" size={15} /> <TeamIcon team={activeTeam} /> {activeTeam.name} — {phaseHeaderText()}</span>
          {phase === "answer" && <TurnTimerBar timeLeft={timeLeft} totalSeconds={turnSeconds} />}
        </div>

        {phase === "reveal" && currentCategory && (
          <div style={{ textAlign: "center" }}>
            <div style={{
              display: "inline-block", background: "linear-gradient(135deg,#3A2E12,#7A5C1E)", border: "3px solid #D4AF37",
              borderRadius: "16px", padding: "20px 32px", boxShadow: "0 8px 28px rgba(212,175,55,0.4)",
              animation: "toolFlip 0.5s ease-out",
            }}>
              {topicLabel && (
                <div style={{ fontSize: "12px", fontWeight: "800", color: "#B8A98A", marginBottom: "8px", letterSpacing: "0.05em", textTransform: "uppercase", display: "flex", alignItems: "center", justifyContent: "center", gap: "5px" }}><Icon name="books" size={12} /> {topicLabel}</div>
              )}
              <div style={{ fontSize: "30px", marginBottom: "4px" }}><MascotSprite mascot={activeTeam.mascot} fallback="🕵️" size={34} /></div>
              <div style={{ fontSize: "13px", fontWeight: "700", color: "#E8D8AE", marginBottom: "6px", letterSpacing: "0.05em", display: "flex", alignItems: "center", justifyContent: "center", gap: "5px" }}><Icon name="wrench" size={13} /> THIS LOCK NEEDS</div>
              <div style={{ fontSize: "24px", fontWeight: "900", color: "#FCD34D" }}>{displayCategory(currentCategory)}</div>
              {currentQuestion?.form && (
                <div style={{ marginTop: "10px", display: "inline-block", background: "#7F1D1D", border: "2px solid #FCA5A5", borderRadius: "10px", padding: "5px 14px" }}>
                  <span style={{ fontSize: "13px", fontWeight: "800", color: "#FCA5A5", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                    {currentQuestion.form === "question" ? <><Icon name="help" size={13} /> ALSO NEEDS: A QUESTION</> : <><Icon name="forbidden" size={13} /> ALSO NEEDS: NEGATIVE</>}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {phase === "answer" && (
          <>
            {currentCategory && (
              // The big gold reveal card is gone by this phase — this compact strip keeps the
              // same info on screen the whole time a team is writing, so nobody has to remember
              // (or ask again) what the lock needed once they're heads-down on the answer.
              <div style={{ textAlign: "center", marginBottom: "10px" }}>
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: "8px", flexWrap: "wrap", justifyContent: "center",
                  background: "rgba(212,175,55,0.12)", border: "1px solid rgba(212,175,55,0.4)",
                  borderRadius: "10px", padding: "6px 14px",
                }}>
                  {topicLabel && (
                    <span style={{ fontSize: "11px", fontWeight: "800", color: "#B8A98A", letterSpacing: "0.04em", textTransform: "uppercase", display: "inline-flex", alignItems: "center", gap: "4px" }}><Icon name="books" size={11} /> {topicLabel}</span>
                  )}
                  {topicLabel && <span style={{ fontSize: "11px", color: "#6B5B3A" }}>•</span>}
                  <span style={{ fontSize: "12px", fontWeight: "900", color: "#FCD34D", display: "inline-flex", alignItems: "center", gap: "4px" }}><Icon name="wrench" size={11} /> {displayCategory(currentCategory)}</span>
                  {currentQuestion?.form && (
                    <span style={{ fontSize: "11px", fontWeight: "800", color: "#FCA5A5", display: "inline-flex", alignItems: "center", gap: "3px" }}>
                      {currentQuestion.form === "question" ? <><Icon name="help" size={11} /> + QUESTION</> : <><Icon name="forbidden" size={11} /> + NEGATIVE</>}
                    </span>
                  )}
                </div>
              </div>
            )}
            <QuestionCard question={currentQuestion} showAnswer={showAns} onReveal={handleReveal} gameId="vault" />
            {currentQuestion && (showAns || currentQuestion?.type === "speaking task") && (
              <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginTop: "12px" }}>
                <button onClick={handleCorrect} className="vault-next-btn" style={{ background: "#22C55E", color: "white", border: "none", borderRadius: "12px", padding: "12px 24px", fontSize: "16px", fontWeight: "700", cursor: "pointer", transition: "transform 0.15s ease" }}><Icon name="check" size={15} /> Correct — Crack it!</button>
                <button onClick={handleWrong} className="vault-next-btn" style={{ background: "#EF4444", color: "white", border: "none", borderRadius: "12px", padding: "12px 24px", fontSize: "16px", fontWeight: "700", cursor: "pointer", transition: "transform 0.15s ease" }}><Icon name="close" size={13} /> Wrong</button>
              </div>
            )}
          </>
        )}

        {phase === "result" && lastOutcome && (() => {
          const justFinished = lastOutcome.correct && lastOutcome.locksNow >= LOCK_COUNT;
          const allFinished = finishOrderRef.current.length >= teams.length;
          return (
            <div style={{ marginTop: "4px", textAlign: "center" }}>
              {lastOutcome.timedOut ? (
                <div style={{ background: "rgba(120,53,15,0.35)", border: "2px solid #F59E0B", borderRadius: "14px", padding: "14px", marginBottom: "10px", backdropFilter: "blur(4px)" }}>
                  <div style={{ fontWeight: "900", fontSize: "17px", color: "#FCD34D", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}><Icon name="hourglass" size={16} /> Time's up for {activeTeam.name}!</div>
                  <div style={{ color: "#E8D8AE", fontWeight: "700", fontSize: "13px", marginTop: "4px" }}>
                    Still at {lastOutcome.locksNow}/{LOCK_COUNT} locks — no penalty, but here's what they were going for:
                  </div>
                  {currentQuestion && (
                    <div style={{ background: "rgba(0,0,0,0.25)", borderRadius: "10px", padding: "10px 12px", marginTop: "10px", textAlign: "left" }}>
                      <div style={{ fontWeight: "900", fontSize: "16px", color: "#86EFAC", display: "flex", alignItems: "center", gap: "5px" }}><Icon name="check" size={14} /> {currentQuestion.answer}</div>
                      {currentQuestion.hint && <div style={{ color: "#FDE68A", fontSize: "12px", marginTop: "6px", display: "flex", alignItems: "center", gap: "4px" }}><Icon name="idea" size={11} /> {currentQuestion.hint}</div>}
                    </div>
                  )}
                </div>
              ) : lastOutcome.correct ? (
                <div style={{ background: "rgba(120,53,15,0.35)", border: "2px solid #D4AF37", borderRadius: "14px", padding: "14px", marginBottom: "10px", backdropFilter: "blur(4px)" }}>
                  <div style={{ fontWeight: "900", fontSize: "17px", color: "#FCD34D", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}><Icon name="unlocked" size={16} /> {activeTeam.name} cracked lock {lastOutcome.locksNow}/{LOCK_COUNT}!</div>
                  <div style={{ color: "#E8D8AE", fontWeight: "700", fontSize: "13px", marginTop: "4px" }}>
                    {justFinished ? "Vault fully cracked!" : `+${CRACK_SCORE} pts — same team, next lock!`}
                  </div>
                </div>
              ) : (
                <div style={{ background: "rgba(127,29,29,0.35)", border: "2px solid #EF4444", borderRadius: "14px", padding: "14px", marginBottom: "10px", backdropFilter: "blur(4px)", animation: "alarmFlash 0.9s ease-in-out" }}>
                  <div style={{ fontWeight: "900", fontSize: "17px", color: "#FCA5A5", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}><Icon name="warning" size={16} /> Alarm! {activeTeam.name}'s last crack re-locked.</div>
                  <div style={{ color: "#FCA5A5", fontWeight: "700", fontSize: "13px", marginTop: "4px" }}>Now at {lastOutcome.locksNow}/{LOCK_COUNT} locks — turn passes.</div>
                </div>
              )}
              {!allFinished && (
                lastOutcome.correct && !justFinished ? (
                  <button onClick={keepGoing} className="vault-next-btn" style={{ background: "#D4AF37", color: "#1F1608", border: "none", borderRadius: "12px", padding: "12px 28px", fontSize: "16px", fontWeight: "800", cursor: "pointer", boxShadow: "0 4px 16px rgba(212,175,55,0.5)", transition: "transform 0.15s ease" }}><Icon name="unlocked" size={15} /> Keep Going!</button>
                ) : (
                  <button onClick={advanceTurn} className="vault-next-btn" style={{ background: "#6366F1", color: "white", border: "none", borderRadius: "12px", padding: "12px 28px", fontSize: "16px", fontWeight: "800", cursor: "pointer", boxShadow: "0 4px 16px rgba(99,102,241,0.5)", transition: "transform 0.15s ease" }}><Icon name="next" size={15} /> Next Team</button>
                )
              )}
            </div>
          );
        })()}
      </div>
    </div>
  );
}
