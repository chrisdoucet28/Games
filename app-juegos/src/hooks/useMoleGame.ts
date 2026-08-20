import { useState, useRef, useEffect } from "react";
import type { QuestionData } from "../types";

// Extracted out of WordWhackGame.tsx so the exact same mole-spawn/duck/hit loop can run
// standalone on a phone during a phone-controlled turn (see PhoneWordWhackView.tsx) as well as
// on the teacher's screen — no gameplay-feel difference between the two, since it's the same code
// either way, just running on whichever device is actually driving that turn.

export const TOTAL_HOLES = 6;
export const BASE_HIT_PTS = 20;
export const COMBO_STEP = 5;
export const MAX_COMBO_BONUS = 40;

export type Difficulty = "easy" | "medium" | "hard";
export const DIFFICULTY_OPTIONS: Difficulty[] = ["easy", "medium", "hard"];
// Difficulty only changes how long each mole stays up before ducking — the 90s turn length never
// changes. Each mode still ramps faster as the clock runs down (t>60/t>30/t>10/else).
export const DUCK_MS: Record<Difficulty, [number, number, number, number]> = {
  easy: [5300, 4500, 3900, 3300],
  medium: [4400, 3700, 3100, 2500],
  hard: [4000, 3300, 2600, 2100],
};

export type ParsedMCQ = { prompt: string; choices: string[]; correctIdx: number };

// "choose correct grammar" content already embeds its options in the question text itself,
// e.g. "'___ you ever tried sushi?' (Have/Did/Do)" — parsing that out means the entire existing
// pool becomes mole content for free, no new authoring needed.
export function parseChoices(q: QuestionData): ParsedMCQ | null {
  const text = q.question || "";
  const m = /\(([^)]+)\)\s*$/.exec(text);
  if (!m) return null;
  const raw = m[1];
  if (/\bor\b/i.test(raw)) return null; // skip compound multi-blank "X/Y or A/B" patterns — too messy for moles
  const parts = raw.split("/").map(s => s.trim()).filter(Boolean);
  if (parts.length < 2 || parts.length > 4) return null;
  const ans = (q.answer || "").trim().toLowerCase();
  const correctIdx = parts.findIndex(p => p.toLowerCase() === ans);
  if (correctIdx === -1) return null;
  const prompt = text.slice(0, m.index).trim();
  if (!prompt) return null;
  return { prompt, choices: parts, correctIdx };
}

// The pool is almost always smaller than what 2 rounds × several teams × 90 seconds each draws
// through, so spawnRound's modulo wrap (by design — see there) means the same question genuinely
// gets drawn more than once over a full game. That's fine for gameplay, but the post-game review
// list should show each distinct question once, not once per time it happened to come up —
// filters out duplicates both against what's already accumulated and within the same batch being
// merged in (a single turn can itself wrap the pool on a thin topic).
export function mergeUniqueRounds(prev: ParsedMCQ[], additions: ParsedMCQ[]): ParsedMCQ[] {
  const key = (r: ParsedMCQ) => `${r.prompt}|${r.choices.join(",")}`;
  const seen = new Set(prev.map(key));
  const result = [...prev];
  for (const r of additions) {
    const k = key(r);
    if (!seen.has(k)) {
      seen.add(k);
      result.push(r);
    }
  }
  return result;
}

export type Mole = { holeIdx: number; text: string; isCorrect: boolean; key: number };
export type Fx = { holeIdx: number; kind: "hit" | "miss"; key: number };

type UseMoleGameParams = {
  pool: ParsedMCQ[];
  difficulty: Difficulty;
  // Where in `pool` this turn starts drawing from — the global "never repeats a question this
  // playthrough" cursor is owned by whoever calls this hook (WordWhackGame.tsx on screen-mode
  // turns, or reported back over the wire on phone-mode turns), not by the hook itself.
  startRoundIdx: number;
  // True only while this turn should actually be spawning/ducking moles (screen-mode: phase ===
  // "playing"; phone-mode: the local turn timer is running) — mirrors the original component's
  // own `phase === "playing"` gate on spawnRound.
  active: boolean;
  // Changes once per turn (a simple incrementing counter works) — resets score/combo/playedRounds
  // the instant a new turn begins, independent of `active`, matching the original code's
  // startTeamTurn() resetting state before the countdown even starts (not just when moles start
  // popping up).
  resetKey: unknown;
  // Duck speed ramps as the 90s clock runs down — read fresh on every spawn rather than passed as
  // a plain number, so it doesn't need to be a hook dependency that would tear down/rebuild the
  // spawn loop every single second.
  turnTimeLeftRef: React.MutableRefObject<number>;
};

export function useMoleGame({ pool, difficulty, startRoundIdx, active, resetKey, turnTimeLeftRef }: UseMoleGameParams) {
  const [moles, setMoles] = useState<Mole[]>([]);
  const [prompt, setPrompt] = useState("");
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [turnScore, setTurnScore] = useState(0);
  const [fx, setFx] = useState<Fx | null>(null);
  const [playedRounds, setPlayedRounds] = useState<ParsedMCQ[]>([]);

  const fxIdRef = useRef(0);
  const roundTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const roundIdxRef = useRef(startRoundIdx);
  const comboRef = useRef(0);
  const bestComboRef = useRef(0);
  const turnScoreRef = useRef(0);

  const spawnFx = (holeIdx: number, kind: "hit" | "miss") => {
    const key = fxIdRef.current++;
    setFx({ holeIdx, kind, key });
    setTimeout(() => setFx(prev => (prev?.key === key ? null : prev)), 500);
  };

  const spawnRound = () => {
    if (roundTimerRef.current) clearTimeout(roundTimerRef.current);
    if (!pool.length) return;
    const idx = roundIdxRef.current % pool.length;
    roundIdxRef.current += 1;
    const item = pool[idx];
    const holeIndices = Array.from({ length: TOTAL_HOLES }, (_, i) => i).sort(() => Math.random() - 0.5).slice(0, item.choices.length);
    const newMoles: Mole[] = holeIndices.map((holeIdx, i) => ({ holeIdx, text: item.choices[i], isCorrect: i === item.correctIdx, key: fxIdRef.current++ }));
    setMoles(newMoles);
    setPrompt(item.prompt);
    setPlayedRounds(prev => [...prev, item]);

    const t = turnTimeLeftRef.current;
    const [calm, warm, brisk, frantic] = DUCK_MS[difficulty];
    const duckMs = t > 60 ? calm : t > 30 ? warm : t > 10 ? brisk : frantic;
    roundTimerRef.current = setTimeout(() => {
      comboRef.current = 0;
      setCombo(0);
      setMoles([]);
      spawnRound();
    }, duckMs);
  };

  // Resets everything for a fresh turn — fires the instant a new turn begins (matching the
  // original startTeamTurn()'s timing), independent of when moles actually start spawning.
  useEffect(() => {
    roundIdxRef.current = startRoundIdx;
    comboRef.current = 0;
    bestComboRef.current = 0;
    turnScoreRef.current = 0;
    setMoles([]);
    setPrompt("");
    setCombo(0);
    setBestCombo(0);
    setTurnScore(0);
    setPlayedRounds([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey]);

  useEffect(() => {
    if (!active) { if (roundTimerRef.current) clearTimeout(roundTimerRef.current); return; }
    spawnRound();
    return () => { if (roundTimerRef.current) clearTimeout(roundTimerRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, resetKey]);

  const hitMole = (mole: Mole) => {
    if (!active) return;
    if (mole.isCorrect) {
      if (roundTimerRef.current) clearTimeout(roundTimerRef.current);
      const bonus = Math.min(MAX_COMBO_BONUS, comboRef.current * COMBO_STEP);
      turnScoreRef.current += BASE_HIT_PTS + bonus;
      setTurnScore(turnScoreRef.current);
      comboRef.current += 1;
      setCombo(comboRef.current);
      if (comboRef.current > bestComboRef.current) { bestComboRef.current = comboRef.current; setBestCombo(bestComboRef.current); }
      spawnFx(mole.holeIdx, "hit");
      setMoles([]);
      // A brief pause before the next mole pops up — long enough to see the +hit land and to stop
      // a reflexive next click from landing mid pop-up on the new mole.
      roundTimerRef.current = setTimeout(() => spawnRound(), 260);
    } else {
      comboRef.current = 0;
      setCombo(0);
      spawnFx(mole.holeIdx, "miss");
      setMoles(prev => prev.filter(m => m.holeIdx !== mole.holeIdx));
    }
  };

  return { moles, prompt, combo, bestCombo, turnScore, fx, hitMole, playedRounds, roundIdxRef };
}
