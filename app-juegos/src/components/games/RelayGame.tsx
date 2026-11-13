import { useEffect, useMemo, useRef, useState } from "react";
import { TeamIcon } from "../shared/TeamIcon";
import { Icon } from "../shared/Icon";
import type { RealtimeChannel } from "@supabase/supabase-js";
import type { GameProps } from "../../types";
import { teamsGridCols, GAME_MODES, GAME_ICONS, RELAY_QUESTION_STARTERS } from "../../data/constants";
import { denseRank } from "../../utils/ranking";
import { RankBadge } from "../shared/RankBadge";
import { HowToPlayModal } from "../shared/HowToPlayModal";
import { FlagPromptButton } from "../shared/FlagPromptButton";
import { PhoneJoinPanel } from "../shared/PhoneJoinPanel";
import { PhoneReconnectBadge } from "../shared/PhoneReconnectBadge";
import { CustomWordsPanel } from "../shared/CustomWordsPanel";
import { useWordDeck } from "../../hooks/useWordDeck";
import { playSound } from "../../lib/sounds";
import { setMusicGame, setMusicContext, stopMusic } from "../../lib/music";
import { makeSoloCpuTeam } from "../../lib/soloOpponent";
import {
  generateSessionCode, openRelayChannel, closeChannel,
  type RelayPhase, type RelayStatePayload, type RelayActionPayload, type RelayTeamState,
} from "../../lib/liveSession";

const GM = GAME_MODES.find(g => g.id === "relay")!;

// Every person gets this many questions of their own before their team has to swap them out. The
// owner's call after a real class: a flat 5 per student (15 per person was far too many — a team of
// 3 was spending 45). A team's total is therefore 5 x however many people the teacher says are on
// it. Using up the 5 without guessing forces a swap to the next teammate, so one stuck word can't
// stall the team.
const QUESTIONS_PER_PERSON = 5;
// A guessed word is worth MAX_POINTS on the very first question, falling in a straight line to
// MIN_POINTS on the last, rounded to the nearest 10 (5 questions: 300 / 230 / 160 / 80 / 10). Rewards
// the team that guesses first, and sits on the same scale as the other games' point totals.
const MAX_POINTS = 300;
const MIN_POINTS = 10;

// `questionNumber` is the 1-based question the guess happened on, `budget` that person's own total.
function guessPoints(questionNumber: number, budget: number): number {
  if (budget <= 1) return MAX_POINTS;
  const q = Math.min(Math.max(questionNumber, 1), budget);
  const raw = MIN_POINTS + (MAX_POINTS - MIN_POINTS) * (budget - q) / (budget - 1);
  return Math.round(raw / 10) * 10;
}

// Solo only — how long the CPU "thinks" before its own turn resolves, and how long its result sits
// on screen before auto-continuing. Matches Vault Heist's CPU_ANSWER_MS_BY_DIFFICULTY /
// CPU_RESULT_MS naming.
type Difficulty = "easy" | "medium" | "hard";
const CPU_THINK_MS_BY_DIFFICULTY: Record<Difficulty, number> = { easy: 2200, medium: 1600, hard: 1000 };
const CPU_RESULT_MS = 1400;
// The CPU never actually asks anything (see the comment on cpuTurnEffect below) — this is the
// hidden per-question roll that decides whether its silent "question" resolves as a guess.
const CPU_GUESS_CHANCE_BY_DIFFICULTY: Record<Difficulty, number> = { easy: 0.35, medium: 0.22, hard: 0.12 };

type Phase = "welcome" | "ready" | "asking" | "reveal" | "final";
// Phone mode only. "turns": the original — one team asks one question, then the next team.
// "together": every team plays its own word at the same time in its own huddle (teacher request:
// groups talk amongst themselves instead of waiting for each other). Needs 2+ phones on every team
// (one asks, the rest know the word), since the other teams are too busy to answer for a one-phone
// team the way they can in "turns".
type PlayStyle = "turns" | "together";
// One team's reveal card in "together" mode — the same fields "turns" keeps in revealWord/revealInfo,
// but per team, since several teams can be mid-reveal at once.
type TeamReveal = { word: string; kind: "guessed" | "outOfQuestions"; points: number; teamFinished: boolean; startsNewRound: boolean };

const STYLE_TAG = (
  <style>{`
    @keyframes rlWordPop{0%{transform:scale(0.85);opacity:0}100%{transform:scale(1);opacity:1}}
    .rl-btn:hover:not(:disabled){filter:brightness(1.1)}
    .rl-btn:active:not(:disabled){transform:translate(4px,4px) !important;box-shadow:0 0 0 #1A1A2E !important}
  `}</style>
);

// What "Save & Exit" snapshots and "Resume" restores — the turn cursor, each team's per-slot
// progress, and each team's running word total. Resuming always lands on the "ready" screen for
// whoever's turn it was next (needsReadyByTeam resets to true for everyone, questionsUsedByTeam to
// 0) rather than trying to restore exact mid-word progress — same philosophy the original snapshot
// already used for not restoring the exact hidden words that were live when saved.
type RelaySnapshot = {
  teamIndex: number;
  slotIndexByTeam: Record<string, number>;
  wordsByTeam: Record<string | number, number>;
  // Optional: a game saved before speed-bonus scoring only has wordsByTeam (every word was a flat 10).
  pointsByTeam?: Record<string | number, number>;
  // The teacher's manual fallback (used for screen mode, and before phone mode has locked in real
  // per-team counts from QR joins).
  peoplePerTeam: number;
  // Each team's ACTUAL locked-in people count, keyed by team id — set once at kickoff (see
  // lockedPeoplePerTeamByTeam below). Optional: a game saved before per-team counts existed, or one
  // resumed before the "Let's Play!" lock-in ever happened, just falls back to peoplePerTeam
  // uniformly for every team (the old behavior).
  peoplePerTeamByTeam?: Record<string, number>;
  // How many full laps through the roster to play. Optional: a game saved before this existed only
  // ever played a single lap (see validateRelaySnapshot's own default below).
  roundsCount?: number;
  // Solo only.
  difficulty?: Difficulty;
  // The teacher's own word list, if they used one — a resumed game keeps playing it.
  customWords?: string[] | null;
  // Phone mode's "Take turns" vs "All at once" — optional, a game saved before it existed was "turns".
  playStyle?: PlayStyle;
};

function validateRelaySnapshot(raw: unknown, teamCount: number): RelaySnapshot | undefined {
  const s = raw as Partial<RelaySnapshot> | null | undefined;
  if (!s) return undefined;
  if (typeof s.teamIndex !== "number" || s.teamIndex < 0 || s.teamIndex >= teamCount) return undefined;
  const peoplePerTeam = typeof s.peoplePerTeam === "number" && s.peoplePerTeam >= 1 ? Math.min(s.peoplePerTeam, 6) : 1;
  // A game saved before rounds existed only ever played one lap through the roster — default to 1
  // (not the fresh-game default of 3) so a resumed older game keeps behaving exactly as it did when
  // it was saved, instead of suddenly gaining extra rounds nobody asked for.
  const roundsCount = typeof s.roundsCount === "number" && s.roundsCount >= 1 ? Math.min(s.roundsCount, 8) : 1;
  const peoplePerTeamByTeam: Record<string, number> | undefined = (() => {
    if (!s.peoplePerTeamByTeam || typeof s.peoplePerTeamByTeam !== "object") return undefined;
    const out: Record<string, number> = {};
    // Capped much higher than the manual picker's 1-6: a phone-derived count has no UI ceiling at
    // all while the game is live (it's just "however many phones joined this team"), so a real
    // locked-in value could legitimately exceed 6 — this only guards against corrupted data, not
    // against a real class size.
    Object.entries(s.peoplePerTeamByTeam).forEach(([k, v]) => {
      if (typeof v === "number" && v >= 1) out[k] = Math.min(v, 40);
    });
    return Object.keys(out).length > 0 ? out : undefined;
  })();
  const slotIndexByTeam: Record<string, number> = {};
  if (s.slotIndexByTeam && typeof s.slotIndexByTeam === "object") {
    Object.entries(s.slotIndexByTeam).forEach(([k, v]) => {
      if (typeof v !== "number" || v < 0) return;
      const teamPpt = peoplePerTeamByTeam?.[k] ?? peoplePerTeam;
      slotIndexByTeam[k] = Math.min(v, teamPpt * roundsCount);
    });
  }
  const difficulty = s.difficulty === "easy" || s.difficulty === "hard" ? s.difficulty : "medium";
  const customWords = Array.isArray(s.customWords)
    ? s.customWords.filter((w): w is string => typeof w === "string" && w.trim() !== "").slice(0, 200)
    : null;
  const wordsByTeam = s.wordsByTeam ?? {};
  // A game saved before speed-bonus scoring scored every word a flat 10.
  const pointsByTeam = s.pointsByTeam ?? Object.fromEntries(Object.entries(wordsByTeam).map(([k, w]) => [k, (w as number) * 10]));
  const playStyle: PlayStyle = s.playStyle === "together" ? "together" : "turns";
  return { teamIndex: s.teamIndex, slotIndexByTeam, wordsByTeam, pointsByTeam, peoplePerTeam, peoplePerTeamByTeam, roundsCount, difficulty, customWords, playStyle };
}

export function RelayGame({ questions, teams: propTeams, onUpdateScore, onEnd, forceFinalRef, serializeStateRef, initialGameState, presetPhoneSession, onRequestPhoneSession }: GameProps) {
  const isSolo = propTeams.length === 1;
  // Constructed unconditionally so its identity never changes across renders (a useRef initializer
  // only runs once at mount) — same idiom as Bounty Board's own cpuRef.
  const cpuRef = useRef(isSolo ? makeSoloCpuTeam() : null);
  // Every render/turn-rotation/ranking codepath below reads `teams`, not `propTeams` — this is the
  // one change that puts the CPU into the same round-robin as any real team.
  const teams = useMemo(() => (isSolo ? [propTeams[0], cpuRef.current!] : propTeams), [isSolo, propTeams]);
  const resumed = useRef(validateRelaySnapshot(initialGameState, teams.length)).current;
  // CPU never has a real backing team to report a score to — its own tally lives entirely in
  // wordsByTeam (below), which the final ranking already reads straight off `teams`.
  const updateScore = (teamId: string | number, delta: number) => {
    if (isSolo && teamId === cpuRef.current?.id) return;
    onUpdateScore(teamId, delta);
  };

  const [phase, setPhase] = useState<Phase>(resumed ? "ready" : "welcome");
  const [showHowTo, setShowHowTo] = useState(false);
  // Screen mode only — a teacher-controlled toggle for the live-word card (screenShowsWord): swaps
  // it for the word pool instead, so the teacher can safely leave the screen up between questions
  // without the live word sitting there if anyone glances over, then swap back to actually answer
  // the next question. Reset to false (showing the live word) below whenever the word itself
  // changes, so it's never left hidden by accident into a NEW turn where someone needs to read it.
  const [wordBankShown, setWordBankShown] = useState(false);

  // "Play on Phones" — available whenever there's more than one team. Each phone is one PERSON:
  // several phones can join the same team, and the screen rotates which one is the asker.
  const [inputMode, setInputMode] = useState<"screen" | "phone">(presetPhoneSession ? "phone" : "screen");
  const [introStep, setIntroStep] = useState<"setup" | "qr">("setup");
  const [sessionCode, setSessionCode] = useState<string | null>(presetPhoneSession?.code ?? null);
  const [connectedTeamIds, setConnectedTeamIds] = useState<Set<string | number>>(new Set());
  // Connected phone (device) ids per team, in the order each was first seen — stable, so the asker
  // rotation doesn't reshuffle when someone reconnects. Only phones that report a deviceId appear.
  const [connectedByTeam, setConnectedByTeam] = useState<Record<string, string[]>>({});
  // Every phone ever seen per team this session, same order as deviceRosterRef (connected or not) —
  // the "together" asker rotation runs through this (see rotationList).
  const [knownByTeam, setKnownByTeam] = useState<Record<string, string[]>>({});
  const deviceRosterRef = useRef<Record<string, string[]>>({});
  // Each team's current asker (a device id). Falls back to the first connected phone whenever the
  // stored one isn't connected any more.
  const [askerByTeam, setAskerByTeam] = useState<Record<string, string>>({});
  // See PlayStyle. Defaults to "together" (the teacher's preferred phone mode); only ever takes
  // effect in phone mode with 2+ real teams — `together` below is the one flag everything reads.
  const [playStyle, setPlayStyle] = useState<PlayStyle>(() => resumed?.playStyle ?? "together");
  const together = inputMode === "phone" && playStyle === "together" && !isSolo;
  // "together" only: each team's own phase ("asking" until it guesses or runs out, then "reveal"
  // until one of its phones taps Next) and the reveal card it's showing. A team with no entry is
  // asking; a finished team out of its reveal is "done" (see teamPhaseOf).
  const [teamPhaseByTeam, setTeamPhaseByTeam] = useState<Record<string, "asking" | "reveal">>({});
  const [revealByTeam, setRevealByTeam] = useState<Record<string, TeamReveal>>({});
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (phase === "final") { playSound("roundComplete"); stopMusic(); }
  }, [phase]);
  useEffect(() => {
    setMusicGame("relay");
    return () => setMusicGame(null);
  }, []);
  // Welcome screen rides the shared gameplay track; play switches to "tension" so a different
  // track starts when the game actually begins (same idiom as Hot Seat / Bounty Board).
  useEffect(() => {
    if (phase !== "welcome" && phase !== "final") setMusicContext("tension");
    return () => setMusicContext("gameplay");
  }, [phase === "welcome" || phase === "final"]);

  useEffect(() => {
    if (!forceFinalRef) return;
    forceFinalRef.current = phase === "final" ? null : () => { setPhase("final"); return true; };
    return () => { if (forceFinalRef) forceFinalRef.current = null; };
  }, [forceFinalRef, phase]);

  // The teacher's manual fallback — used directly for screen mode (there's no device count to read
  // instead), and as a placeholder for phone mode before kickoff locks in the real per-team counts.
  const [peoplePerTeam, setPeoplePerTeam] = useState(() => resumed?.peoplePerTeam ?? 1);
  // Each team's ACTUAL people count for this game, keyed by team id — null until kickoff ("Let's
  // Play!"), which fills it in: for phone mode, each team's count is how many distinct phones
  // actually joined it (so an uneven class — 1 phone on Red, 3 on Blue — just works, nobody has to
  // type a number that doesn't match reality); for screen mode, every team gets the manual
  // peoplePerTeam value, same as before. Locked once at kickoff and never recalculated afterward, so
  // a phone disconnecting/reconnecting mid-game can't quietly change a team's turn budget.
  const [lockedPeoplePerTeamByTeam, setLockedPeoplePerTeamByTeam] = useState<Record<string, number> | null>(
    () => resumed?.peoplePerTeamByTeam ?? null
  );
  const peoplePerTeamFor = (teamKey: string): number => lockedPeoplePerTeamByTeam?.[teamKey] ?? peoplePerTeam;
  // How many full laps through that roster to play before the game ends — same picker idiom as
  // peoplePerTeam. Without this a team was permanently done the moment its own roster had each had
  // one turn (one word per person, ever, then sit out the rest of the game) — far too short,
  // especially a solo team's default "1 person per team", which used to mean a one-word game.
  // Defaults to 3, matching Hot Seat's own fixed TOTAL_ROUNDS.
  const [roundsCount, setRoundsCount] = useState(() => resumed?.roundsCount ?? 3);
  // A team's lifetime turn budget: every person on ITS OWN roster, repeated for roundsCount laps —
  // replaces the old flat peoplePerTeam cap everywhere a team's "am I finished" check used it. Per
  // team now, not a single shared number, since peoplePerTeamFor can differ by team.
  const totalTurnsForTeam = (teamKey: string): number => peoplePerTeamFor(teamKey) * roundsCount;
  // How many questions the person in `slot` gets — 0 once the slot is past that team's lifetime budget.
  const questionsForSlot = (teamKey: string, slot: number): number => (slot >= totalTurnsForTeam(teamKey) ? 0 : QUESTIONS_PER_PERSON);
  const [difficulty, setDifficulty] = useState<Difficulty>(() => resumed?.difficulty ?? "medium");
  const [teamIndex, setTeamIndex] = useState(() => resumed?.teamIndex ?? 0);
  // Bumped once per resolveTurn call — see the CPU turn effect's own comment for why this exists
  // (phase alone isn't always enough to detect a genuinely new CPU turn).
  const [turnSeq, setTurnSeq] = useState(0);
  // Cumulative turns a team has used across its whole game (NOT reset at a round boundary) — a
  // team is finished once this reaches totalTurnsForTeam(key). The current person within the
  // current round is slot % peoplePerTeamFor(key); the current round is
  // Math.floor(slot / peoplePerTeamFor(key)). Replaces the old single global roundIndex, which
  // tracked one shared budget for the whole team regardless of how many people were on it.
  const [slotIndexByTeam, setSlotIndexByTeam] = useState<Record<string, number>>(() => resumed?.slotIndexByTeam ?? {});
  // How many of the CURRENT slot's own questions (see questionsForSlot) have been used — always starts fresh on
  // resume (same "don't try to restore exact mid-word progress" philosophy as the original
  // snapshot not restoring the exact hidden words that were live when saved).
  const [questionsUsedByTeam, setQuestionsUsedByTeam] = useState<Record<string, number>>({});
  // True for a team whose current slot hasn't had its "someone new, get ready" beat shown yet —
  // set whenever a slot advances (a guess, or running out of questions), cleared the moment that
  // team's next turn actually starts. Every team starts true (their very first person still needs
  // to physically come up) — except the resumed team itself: resume lands `phase` on "ready"
  // directly (below), bypassing goToNextTeam (the normal place this flag gets consumed), so it's
  // cleared here instead — otherwise this same team's NEXT turn would show "get ready" again for
  // no reason once the rotation cycles back to it.
  const [needsReadyByTeam, setNeedsReadyByTeam] = useState<Record<string, boolean>>(() => {
    const initial = Object.fromEntries(teams.map(t => [String(t.id), true]));
    if (resumed) initial[String(teams[resumed.teamIndex]?.id)] = false;
    return initial;
  });
  const [wordsByTeam, setWordsByTeam] = useState<Record<string | number, number>>(() => resumed?.wordsByTeam ?? {});
  // Points per team (the ranking), separate from words guessed now that a word's value depends on
  // how fast it was guessed.
  const [pointsByTeam, setPointsByTeam] = useState<Record<string | number, number>>(() => resumed?.pointsByTeam ?? {});
  const [showWordList, setShowWordList] = useState(false);
  // The word a team just finished with, shown on the reveal card — teamWords already holds their NEXT word.
  const [revealWord, setRevealWord] = useState("");
  // What the reveal card is announcing: a guess (with the points it earned) or a person running out
  // of questions, and whether that was the team's LAST person — in which case the team is done and
  // everyone on it sits down instead of "someone new takes over".
  const [revealInfo, setRevealInfo] = useState<{ kind: "guessed" | "outOfQuestions"; points: number; teamFinished: boolean }>({ kind: "guessed", points: 0, teamFinished: false });

  // The word pool and its shuffled deck (every word once per lap, reshuffled when exhausted, no repeat
  // across a lap boundary) live in the shared hook, along with the teacher's own-words mode — see
  // hooks/useWordDeck.ts.
  const { words, customWords, drawWord, applyCustomWords, resetToTopicWords } = useWordDeck(questions, resumed?.customWords);

  useEffect(() => {
    if (!serializeStateRef) return;
    serializeStateRef.current = (): RelaySnapshot => ({
      teamIndex, slotIndexByTeam, wordsByTeam, pointsByTeam, peoplePerTeam,
      peoplePerTeamByTeam: lockedPeoplePerTeamByTeam ?? undefined, roundsCount, difficulty, customWords, playStyle,
    });
    return () => { if (serializeStateRef) serializeStateRef.current = null; };
  }, [serializeStateRef, teamIndex, slotIndexByTeam, wordsByTeam, pointsByTeam, peoplePerTeam, lockedPeoplePerTeamByTeam, roundsCount, difficulty, customWords, playStyle]);

  // Every real team has its own hidden word at all times — the CPU never does (see cpuTurnEffect
  // below), so it's drawn from propTeams, not the CPU-augmented `teams`, to avoid burning a real
  // deck word on a word nobody will ever see.
  const [teamWords, setTeamWords] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    if (words.length > 0) propTeams.forEach(t => { initial[String(t.id)] = drawWord(); });
    return initial;
  });

  // Applied from the welcome screen (nothing has been played yet): swap the pool, then re-deal every
  // real team a hidden word from the new list (never the CPU — see teamWords' own init above).
  const redealTeamWords = () => {
    const fresh: Record<string, string> = {};
    propTeams.forEach(t => { fresh[String(t.id)] = drawWord(); });
    setTeamWords(fresh);
  };
  const handleApplyCustomWords = (list: string[]) => {
    applyCustomWords(list);
    redealTeamWords();
  };
  const handleResetWords = () => {
    resetToTopicWords();
    redealTeamWords();
  };

  const currentTeam = teams[teamIndex];
  const currentKey = String(currentTeam?.id);
  // See wordBankShown's own declaration — never leave the live-word card toggled to the pool view
  // across a word change, so the next question always opens with the actual word visible by default.
  useEffect(() => {
    setWordBankShown(false);
  }, [teamWords[currentKey]]);
  const isCpuTurn = isSolo && currentTeam?.id === cpuRef.current?.id;
  const isTeamFinished = (teamKey: string) => (slotIndexByTeam[teamKey] ?? 0) >= totalTurnsForTeam(teamKey);
  const allTeamsFinished = teams.every(t => isTeamFinished(String(t.id)));
  // Whether the CURRENT reveal is a team completing a full lap (finishing this round and looping
  // back to person 1 with a fresh word) rather than an ordinary "next person" swap — with that
  // team's own peoplePerTeamFor === 1 this is every non-finishing reveal, since there's only ever
  // one person to loop back to. Drives both the screen's own reveal message and the phones' (never
  // say "someone new" when it's actually the same person starting their next round).
  const currentPeoplePerTeam = peoplePerTeamFor(currentKey);
  const revealStartsNewRound = !revealInfo.teamFinished && currentPeoplePerTeam > 0 && (slotIndexByTeam[currentKey] ?? 0) % currentPeoplePerTeam === 0;

  // --- Who is asking, and who answers (phone mode) ---
  // Who the asker rotation runs through. "turns": only currently-connected phones (unchanged).
  // "together": every phone EVER seen on that team, connected or not — so a phone whose screen
  // locks mid-word doesn't hand the asker role to a teammate who has already seen the word (and on
  // a 2-phone team, leave nobody holding the buttons). The asker doesn't need their phone at all to
  // ask out loud, so a sleeping asker phone is harmless; the team's other phones keep the controls.
  const rotationList = (teamKey: string): string[] =>
    together ? (knownByTeam[teamKey] ?? []) : (connectedByTeam[teamKey] ?? []);
  const rotatedDevices = (teamKey: string): string[] => {
    const list = rotationList(teamKey);
    const stored = askerByTeam[teamKey];
    const at = stored ? list.indexOf(stored) : 0;
    return at <= 0 ? list : [...list.slice(at), ...list.slice(0, at)];
  };
  const teamDevices = connectedByTeam[currentKey] ?? [];
  const askerDeviceId = inputMode === "phone" ? (rotatedDevices(currentKey)[0] ?? null) : null;
  const allDevices = Object.values(connectedByTeam).flat();
  const otherDevices = allDevices.filter(d => !teamDevices.includes(d));
  // Every connected phone except the asker's can WATCH the word — other teams get to follow along
  // while they wait their own turn (teacher feedback), not just stare at a placeholder.
  const wordVisibleDeviceIds = inputMode === "phone" ? allDevices.filter(d => d !== askerDeviceId) : [];
  // Answerers are the narrower subset that also holds the controls: the asking team's other
  // phones, or — if there are none (a one-phone team, or every team is a single student) —
  // everyone else's phones. During the reveal the whole guessing team can move things along. A
  // rival team can watch (wordVisibleDeviceIds) without being the one who decides whether THIS
  // team's guess counts, which is why answerers stay team-scoped even though word visibility
  // doesn't. With no answerer phone connected at all, the teacher's screen shows the word and
  // holds the controls instead.
  let answererDeviceIds: string[] = [];
  if (inputMode === "phone") {
    const own = phase === "reveal" ? teamDevices : teamDevices.filter(d => d !== askerDeviceId);
    answererDeviceIds = own.length > 0 ? own : otherDevices;
  }
  const screenShowsWord = inputMode !== "phone" || answererDeviceIds.length === 0;
  const phoneFlow = inputMode === "phone" && allDevices.length > 0;

  // How many of the CURRENT slot's own questions a team has left — 0 once that team is finished.
  const questionsLeftFor = (teamI: number) => {
    const key = String(teams[teamI]?.id);
    if (isTeamFinished(key)) return 0;
    return Math.max(0, questionsForSlot(key, slotIndexByTeam[key] ?? 0) - (questionsUsedByTeam[key] ?? 0));
  };

  // --- Turn actions ---
  const advanceAskerFor = (teamKey: string) => {
    const list = rotationList(teamKey);
    if (list.length === 0) return;
    const current = rotatedDevices(teamKey)[0];
    const next = list[(list.indexOf(current) + 1) % list.length];
    setAskerByTeam(prev => ({ ...prev, [teamKey]: next }));
  };

  // Finds the next team still short of totalTurnsPerTeam, cycling from just after `fromIndex` —
  // skips any team that's already used up its full lifetime turn budget. Returns -1 once every team
  // is done.
  const findNextActiveTeamIndex = (fromIndex: number, slotIndexSnapshot: Record<string, number>): number => {
    for (let step = 1; step <= teams.length; step++) {
      const idx = (fromIndex + step) % teams.length;
      const key = String(teams[idx].id);
      if ((slotIndexSnapshot[key] ?? 0) < totalTurnsForTeam(key)) return idx;
    }
    return -1;
  };

  // Picks who goes next and whether they need the "someone new, get ready" beat — called with the
  // JUST-UPDATED slot/ready snapshots (not the outer state, which may not have committed yet within
  // the same call — see markMissed) so it never reads stale data about the team it's about to hand
  // off to.
  const goToNextTeam = (slotIndexSnapshot: Record<string, number>, needsReadySnapshot: Record<string, boolean>) => {
    const nextIdx = findNextActiveTeamIndex(teamIndex, slotIndexSnapshot);
    if (nextIdx === -1) { setPhase("final"); return; }
    setTeamIndex(nextIdx);
    const nextKey = String(teams[nextIdx].id);
    const nextNeedsReady = needsReadySnapshot[nextKey] ?? true;
    // One-shot: consume the flag the moment we act on it, so the SAME person's later turns (no
    // further swap in between) never show "get ready" again.
    if (nextNeedsReady) setNeedsReadyByTeam(prev => ({ ...prev, [nextKey]: false }));
    // CPU never gets the human "send someone up" beat — it has no one to send.
    const skipToAsking = phoneFlow || (isSolo && teams[nextIdx].id === cpuRef.current?.id) || !nextNeedsReady;
    setPhase(skipToAsking ? "asking" : "ready");
  };

  // The shared resolution for both a guess and a miss — reused as-is for the CPU's own silent turn
  // (see cpuTurnEffect below), so a CPU "question" goes through exactly the same slot/budget
  // bookkeeping a human one does.
  const resolveTurn = (guessed: boolean) => {
    if (!currentTeam) return;
    // Every resolution bumps this, unconditionally — the CPU turn effect below depends on it
    // instead of (only) `phase`, because when the CPU is the only team left active, `phase` cycles
    // straight back to the same "asking" string every time (no human turn in between to visit a
    // different value), which React's dependency comparison would otherwise see as "unchanged" and
    // never re-fire the effect for the CPU's next turn.
    setTurnSeq(s => s + 1);
    const key = currentKey;
    const prevSlot = slotIndexByTeam[key] ?? 0;
    let newSlot = prevSlot;
    let newUsed = questionsUsedByTeam[key] ?? 0;
    let swapped = false;
    let exhausted = false;
    const budget = questionsForSlot(key, prevSlot);

    if (guessed) {
      // The guess happens during question (questions used so far + 1) — earlier = more points.
      const points = guessPoints(newUsed + 1, budget);
      updateScore(currentTeam.id, points);
      setWordsByTeam(prev => ({ ...prev, [currentTeam.id]: (prev[currentTeam.id] ?? 0) + 1 }));
      setPointsByTeam(prev => ({ ...prev, [currentTeam.id]: (prev[currentTeam.id] ?? 0) + points }));
      playSound("relay");
      setRevealWord(teamWords[key] ?? "");
      setRevealInfo({ kind: "guessed", points, teamFinished: prevSlot + 1 >= totalTurnsForTeam(key) });
      newSlot = prevSlot + 1;
      newUsed = 0;
      swapped = true;
    } else {
      newUsed += 1;
      // Ran out of this person's own share without guessing — a safety valve so one stuck word can't
      // stall this team's slot forever; the next teammate takes over instead.
      if (newUsed >= budget) { newSlot = prevSlot + 1; newUsed = 0; swapped = true; exhausted = true; }
    }

    const nextSlotIndexByTeam = { ...slotIndexByTeam, [key]: newSlot };
    const nextNeedsReadyByTeam = swapped ? { ...needsReadyByTeam, [key]: true } : needsReadyByTeam;

    setSlotIndexByTeam(nextSlotIndexByTeam);
    setQuestionsUsedByTeam(prev => ({ ...prev, [key]: newUsed }));
    if (swapped) {
      setNeedsReadyByTeam(nextNeedsReadyByTeam);
      if (newSlot < totalTurnsForTeam(key) && key !== String(cpuRef.current?.id)) {
        const fresh = drawWord();
        setTeamWords(prev => ({ ...prev, [key]: fresh }));
      }
      advanceAskerFor(key);
    }

    if (guessed) { setPhase("reveal"); return; }
    // A person running out of questions gets the same reveal beat a guess does (the word, plus
    // "swap" or — for a team's last person — "everyone sit down"). Without it a team's final person
    // just kept standing at the front while the game silently moved on without them. Skipped for the
    // CPU, which has no one standing at the front and no real word to show.
    if (exhausted && !isCpuTurn) {
      setRevealWord(teamWords[key] ?? "");
      setRevealInfo({ kind: "outOfQuestions", points: 0, teamFinished: newSlot >= totalTurnsForTeam(key) });
      setPhase("reveal");
      return;
    }
    // An ordinary question hands off to the next team immediately, same round-robin as always.
    goToNextTeam(nextSlotIndexByTeam, nextNeedsReadyByTeam);
  };

  const markGuessed = () => resolveTurn(true);
  const markMissed = () => resolveTurn(false);
  const changeWord = () => {
    const fresh = drawWord();
    setTeamWords(prev => ({ ...prev, [currentKey]: fresh }));
  };
  // Runs on a later render (after markGuessed's own updates have fully committed), so reading the
  // outer slotIndexByTeam/needsReadyByTeam state directly here is safe.
  const continueFromReveal = () => goToNextTeam(slotIndexByTeam, needsReadyByTeam);

  // --- "together" mode (see PlayStyle): every team runs its own word at once ---
  // Same slot/budget/points bookkeeping as resolveTurn, but for ONE team, with no turn hand-off:
  // a question just uses one up, and a guess (or running out) puts only that team into its own
  // reveal while every other team keeps going. Every write is a functional per-team merge, because
  // two different teams' phones can tap within the same render — a whole-object write built from
  // this render's state would silently undo the other team's update.
  const teamPhaseOf = (key: string): "asking" | "reveal" | "done" => {
    if (teamPhaseByTeam[key] === "reveal") return "reveal";
    return isTeamFinished(key) ? "done" : "asking";
  };
  const resolveTogether = (key: string, guessed: boolean) => {
    const team = teams.find(t => String(t.id) === key);
    if (!team || teamPhaseOf(key) !== "asking") return;
    const prevSlot = slotIndexByTeam[key] ?? 0;
    const used = questionsUsedByTeam[key] ?? 0;
    const budget = questionsForSlot(key, prevSlot);
    let points = 0;
    if (guessed) {
      points = guessPoints(used + 1, budget);
      updateScore(team.id, points);
      setWordsByTeam(prev => ({ ...prev, [team.id]: (prev[team.id] ?? 0) + 1 }));
      setPointsByTeam(prev => ({ ...prev, [team.id]: (prev[team.id] ?? 0) + points }));
      playSound("relay");
    }
    const newUsed = guessed ? 0 : used + 1;
    if (!guessed && newUsed < budget) {
      setQuestionsUsedByTeam(prev => ({ ...prev, [key]: newUsed }));
      return;
    }
    const newSlot = prevSlot + 1;
    const teamFinished = newSlot >= totalTurnsForTeam(key);
    const ppt = peoplePerTeamFor(key);
    setRevealByTeam(prev => ({ ...prev, [key]: {
      word: teamWords[key] ?? "", kind: guessed ? "guessed" : "outOfQuestions", points, teamFinished,
      startsNewRound: !teamFinished && ppt > 0 && newSlot % ppt === 0,
    } }));
    setSlotIndexByTeam(prev => ({ ...prev, [key]: newSlot }));
    setQuestionsUsedByTeam(prev => ({ ...prev, [key]: 0 }));
    if (!teamFinished) {
      const fresh = drawWord();
      setTeamWords(prev => ({ ...prev, [key]: fresh }));
    }
    advanceAskerFor(key);
    setTeamPhaseByTeam(prev => ({ ...prev, [key]: "reveal" }));
  };
  const continueTogether = (key: string) => {
    if (teamPhaseOf(key) !== "reveal") return;
    setTeamPhaseByTeam(prev => ({ ...prev, [key]: "asking" }));
  };
  // What a phone on this team is showing right now — matched against each tap's own stamp.
  const stampOf = (key: string): { word: string; questionNumber?: number } => {
    if (teamPhaseOf(key) === "reveal") return { word: revealByTeam[key]?.word ?? "" };
    const budget = questionsForSlot(key, slotIndexByTeam[key] ?? 0);
    return { word: teamWords[key] ?? "", questionNumber: Math.min((questionsUsedByTeam[key] ?? 0) + 1, Math.max(budget, 1)) };
  };
  const changeWordFor = (key: string) => {
    if (teamPhaseOf(key) !== "asking") return;
    const fresh = drawWord();
    setTeamWords(prev => ({ ...prev, [key]: fresh }));
  };
  // The game ends once every team is finished AND has tapped through its own last reveal (so the
  // last team still gets to see its final word before the results take over the screen).
  const everyTeamDone = together && teams.every(t => teamPhaseOf(String(t.id)) === "done");
  useEffect(() => {
    if (everyTeamDone && (phase === "asking" || phase === "ready")) setPhase("final");
  }, [everyTeamDone, phase]);

  // The CPU never actually asks anything — same house rule as every other CPU integration in this
  // codebase (there's no legitimate question for it to ask, so it doesn't pretend to). Its "turn"
  // is a hidden roll behind a short think delay, run through the exact same resolveTurn a human's
  // Guessed/Not yet click would use, so all the slot/budget bookkeeping stays identical either way.
  useEffect(() => {
    if (phase !== "asking" || !isCpuTurn) return;
    const timer = setTimeout(() => {
      resolveTurn(Math.random() < CPU_GUESS_CHANCE_BY_DIFFICULTY[difficulty]);
    }, CPU_THINK_MS_BY_DIFFICULTY[difficulty]);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, isCpuTurn, difficulty, turnSeq]);

  // A CPU guess still routes through the shared "reveal" phase for consistent bookkeeping, but
  // there's no word to show and no human to click "Next team" — it auto-continues instead.
  useEffect(() => {
    if (phase !== "reveal" || !isCpuTurn) return;
    const timer = setTimeout(() => continueFromReveal(), CPU_RESULT_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, isCpuTurn]);

  const wordForPayload = phase === "asking" ? (teamWords[currentKey] ?? "") : phase === "reveal" ? revealWord : "";

  const buildPayload = (): RelayStatePayload => {
    const mapped: RelayPhase = phase === "welcome" ? "lobby" : phase;
    const wordsOut: Record<string, number> = {};
    const leftOut: Record<string, number> = {};
    const countOut: Record<string, number> = {};
    const queueOut: Record<string, string[]> = {};
    const pointsOut: Record<string, number> = {};
    teams.forEach((t, i) => {
      const k = String(t.id);
      wordsOut[k] = wordsByTeam[t.id] ?? 0;
      pointsOut[k] = pointsByTeam[t.id] ?? 0;
      leftOut[k] = phase === "final" ? 0 : questionsLeftFor(i);
      countOut[k] = (connectedByTeam[k] ?? []).length;
      queueOut[k] = rotatedDevices(k);
    });
    const inPlay = phase === "ready" || phase === "asking" || phase === "reveal";
    return {
      phase: mapped,
      roster: teams.map(t => ({ id: t.id, name: t.name, color: t.color, mascot: t.mascot })),
      activeTeamId: inPlay && !together ? (currentTeam?.id ?? null) : null,
      askerDeviceId: inPlay && !together ? askerDeviceId : null,
      askerQueueByTeam: queueOut,
      wordVisibleDeviceIds: inPlay && !together ? wordVisibleDeviceIds : [],
      answererDeviceIds: inPlay && !together ? answererDeviceIds : [],
      // Always sent, not phase-gated — safe for anyone including the asker (see liveSession.ts),
      // and the pool itself doesn't change mid-game.
      wordPool: words,
      currentWord: together ? "" : wordForPayload,
      screenShowsWord: together ? false : screenShowsWord,
      phoneCountByTeam: countOut,
      questionsLeftByTeam: leftOut,
      questionsPerTeam: QUESTIONS_PER_PERSON * totalTurnsForTeam(currentKey),
      wordsByTeam: wordsOut,
      pointsByTeam: pointsOut,
      revealKind: phase === "reveal" ? revealInfo.kind : undefined,
      revealPoints: phase === "reveal" ? revealInfo.points : undefined,
      revealTeamFinished: phase === "reveal" ? revealInfo.teamFinished : undefined,
      revealStartsNewRound: phase === "reveal" ? revealStartsNewRound : undefined,
      isSolo,
      allTeamsFinished,
      connectedTeamIds: Array.from(connectedTeamIds),
      playStyle: together ? "together" : "turns",
      byTeam: together ? buildByTeam() : undefined,
      ts: Date.now(),
    };
  };
  function buildByTeam(): Record<string, RelayTeamState> {
    const out: Record<string, RelayTeamState> = {};
    const inPlay = phase === "ready" || phase === "asking";
    propTeams.forEach(t => {
      const key = String(t.id);
      const tPhase = teamPhaseOf(key);
      const reveal = revealByTeam[key];
      const slot = slotIndexByTeam[key] ?? 0;
      const budget = questionsForSlot(key, slot);
      const qNum = Math.min((questionsUsedByTeam[key] ?? 0) + 1, Math.max(budget, 1));
      out[key] = {
        phase: tPhase,
        askerDeviceId: inPlay ? (rotatedDevices(key)[0] ?? null) : null,
        word: !inPlay ? "" : tPhase === "asking" ? (teamWords[key] ?? "") : tPhase === "reveal" ? (reveal?.word ?? "") : "",
        questionNumber: qNum,
        questionBudget: budget,
        pointsIfGuessedNow: budget > 0 ? guessPoints(qNum, budget) : MIN_POINTS,
        revealKind: tPhase === "reveal" ? reveal?.kind : undefined,
        revealPoints: tPhase === "reveal" ? reveal?.points : undefined,
        revealTeamFinished: tPhase === "reveal" ? reveal?.teamFinished : undefined,
        revealStartsNewRound: tPhase === "reveal" ? reveal?.startsNewRound : undefined,
      };
    });
    return out;
  }

  // Refs the phone-mode channel reads synchronously, so opening/closing the realtime channel only
  // happens when phone mode itself toggles on/off, not on every state change — same pattern as every
  // other phone-mode game. Refreshed every render (no dependency array) so an incoming phone action
  // always calls the latest closure.
  const buildPayloadRef = useRef(buildPayload);
  const sendStateRef = useRef<(() => void) | null>(null);
  const liveRef = useRef({ phase, answererDeviceIds, markGuessed, markMissed, changeWord, continueFromReveal, together, knownByTeam, teamPhaseOf, rotatedDevices, resolveTogether, continueTogether, changeWordFor, stampOf });
  const lastActionAtRef = useRef(0);
  // "together" throttles per TEAM, not globally — several teams tapping within the same half-second
  // is the normal case there, not a double-tap.
  const lastActionAtByTeamRef = useRef<Record<string, number>>({});
  useEffect(() => {
    buildPayloadRef.current = buildPayload;
    liveRef.current = { phase, answererDeviceIds, markGuessed, markMissed, changeWord, continueFromReveal, together, knownByTeam, teamPhaseOf, rotatedDevices, resolveTogether, continueTogether, changeWordFor, stampOf };
  });

  useEffect(() => {
    if (inputMode !== "phone" || !sessionCode) return;
    const channel = openRelayChannel(sessionCode);
    channelRef.current = channel;

    const sendState = () => {
      channel.send({ type: "broadcast", event: "state", payload: buildPayloadRef.current() });
    };
    sendStateRef.current = sendState;

    channel.on("presence", { event: "sync" }, () => {
      const presenceState = channel.presenceState<{ teamId: string | number; deviceId?: string }>();
      const teamIds = new Set<string | number>();
      const live: Record<string, Set<string>> = {};
      Object.values(presenceState).forEach(entries => entries.forEach(entry => {
        teamIds.add(entry.teamId);
        if (!entry.deviceId) return;
        const key = String(entry.teamId);
        if (!live[key]) live[key] = new Set();
        live[key].add(entry.deviceId);
        if (!deviceRosterRef.current[key]) deviceRosterRef.current[key] = [];
        if (!deviceRosterRef.current[key].includes(entry.deviceId)) deviceRosterRef.current[key].push(entry.deviceId);
      }));
      const byTeam: Record<string, string[]> = {};
      Object.keys(deviceRosterRef.current).forEach(key => {
        byTeam[key] = deviceRosterRef.current[key].filter(id => live[key]?.has(id));
      });
      setConnectedTeamIds(teamIds);
      setConnectedByTeam(byTeam);
      setKnownByTeam(Object.fromEntries(Object.entries(deviceRosterRef.current).map(([k, v]) => [k, [...v]])));
    });

    // The only place phone input touches game logic — only a current answerer's phone is allowed
    // to act, then the exact same functions a screen click would call.
    channel.on("broadcast", { event: "action" }, ({ payload }) => {
      const action = payload as RelayActionPayload;
      const live = liveRef.current;
      if (live.together) {
        // Only a phone actually on the team it claims to act for; the asker (who can't see the
        // word) never judges their own guess, but anyone on the team can move past the reveal.
        const key = String(action.teamId);
        if (live.phase !== "asking" || !(live.knownByTeam[key] ?? []).includes(action.deviceId)) return;
        const now = Date.now();
        if (now - (lastActionAtByTeamRef.current[key] ?? 0) < 500) return;
        const tPhase = live.teamPhaseOf(key);
        const isAsker = live.rotatedDevices(key)[0] === action.deviceId;
        // Drop a tap made on a screen that is already out of date (see RelayActionPayload.word).
        // A phone still on an older build sends no stamp, and is let through as before.
        const stamp = live.stampOf(key);
        if (action.word !== undefined && action.word !== stamp.word) return;
        if (action.questionNumber !== undefined && action.questionNumber !== stamp.questionNumber) return;
        if (action.action === "guessed" && tPhase === "asking" && !isAsker) live.resolveTogether(key, true);
        else if (action.action === "missed" && tPhase === "asking" && !isAsker) live.resolveTogether(key, false);
        else if (action.action === "changeWord" && tPhase === "asking" && !isAsker) live.changeWordFor(key);
        else if (action.action === "next" && tPhase === "reveal") live.continueTogether(key);
        else return;
        lastActionAtByTeamRef.current[key] = now;
        return;
      }
      if (!live.answererDeviceIds.includes(action.deviceId)) return;
      const now = Date.now();
      if (now - lastActionAtRef.current < 500) return;
      if (action.action === "guessed" && live.phase === "asking") live.markGuessed();
      else if (action.action === "missed" && live.phase === "asking") live.markMissed();
      else if (action.action === "changeWord" && live.phase === "asking") live.changeWord();
      else if (action.action === "next" && live.phase === "reveal") live.continueFromReveal();
      else return;
      lastActionAtRef.current = now;
    });

    channel.subscribe(status => {
      if (status === "SUBSCRIBED") sendState();
    });

    const interval = setInterval(sendState, 4000);

    return () => {
      clearInterval(interval);
      closeChannel(channel);
      channelRef.current = null;
      sendStateRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputMode, sessionCode, teams]);

  useEffect(() => {
    sendStateRef.current?.();
  }, [phase, teamIndex, slotIndexByTeam, questionsUsedByTeam, teamWords, revealWord, revealInfo, connectedByTeam, askerByTeam, wordsByTeam, pointsByTeam, teamPhaseByTeam, revealByTeam, together]);

  useEffect(() => {
    if (phase === "final" && channelRef.current) {
      channelRef.current.send({ type: "broadcast", event: "ended", payload: {} });
    }
  }, [phase]);

  const [sessionIsClassLevel, setSessionIsClassLevel] = useState(!!presetPhoneSession);

  const handlePickPhoneMode = () => {
    setInputMode("phone");
    if (onRequestPhoneSession) {
      setSessionCode(onRequestPhoneSession());
      setSessionIsClassLevel(true);
    } else {
      setSessionCode(generateSessionCode());
      setSessionIsClassLevel(false);
    }
    setIntroStep("qr");
  };

  const buildJoinUrl = (code: string) =>
    sessionIsClassLevel
      ? `${window.location.origin}${window.location.pathname}?classJoin=${code}`
      : `${window.location.origin}${window.location.pathname}?join=${code}&game=relay`;

  const handlePickScreenMode = () => {
    setInputMode("screen");
    setIntroStep("setup");
    setSessionCode(null);
    setConnectedTeamIds(new Set());
    setConnectedByTeam({});
    setKnownByTeam({});
    deviceRosterRef.current = {};
  };

  const arenaStyle: React.CSSProperties = {
    margin: "-20px", padding: "20px", borderRadius: "20px", position: "relative", overflow: "hidden",
    background: "radial-gradient(ellipse at 50% -10%,#0F766E 0%,#134E4A 55%,#042F2E 100%)",
  };

  if (!currentTeam || words.length === 0) {
    return (
      <div style={{ ...arenaStyle, textAlign: "center", padding: "24px" }}>
        {STYLE_TAG}
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ fontWeight: "900", fontSize: "20px", color: "white", marginBottom: "10px" }}>Word Relay needs words to play.</div>
          <button onClick={onEnd} className="rl-btn" style={{ background: "#0D9488", color: "white", border: "3px solid #1A1A2E", borderRadius: "14px", padding: "12px 28px", fontWeight: "900", cursor: "pointer", boxShadow: "4px 4px 0 #1A1A2E" }}>End Game</button>
        </div>
      </div>
    );
  }

  const wordListToggle = (
    <div style={{ marginBottom: "18px" }}>
      <button onClick={() => setShowWordList(v => !v)} className="rl-btn" style={{ background: showWordList ? "#0F766E" : "rgba(255,255,255,0.08)", color: showWordList ? "white" : "#99F6E4", border: "2px solid #14B8A688", borderRadius: "10px", padding: "8px 20px", fontWeight: "800", cursor: "pointer", transition: "transform 0.15s ease" }}>
        {showWordList ? "Hide word list" : "Show all words"}
      </button>
      {showWordList && (
        <div style={{ background: "rgba(0,0,0,0.3)", border: "2px solid #14B8A655", borderRadius: "14px", padding: "16px", marginTop: "12px", textAlign: "left", display: "flex", flexWrap: "wrap", gap: "6px" }}>
          {[...words].sort().map((word, index) => (
            <span key={`${word}-${index}`} style={{ background: "rgba(20,184,166,0.18)", color: "#99F6E4", border: "1px solid #14B8A655", borderRadius: "6px", padding: "4px 10px", fontSize: "13px", fontWeight: "700" }}>{word}</span>
          ))}
        </div>
      )}
    </div>
  );

  // Which real teams (never the CPU — it can't hold a phone) still have zero phones connected while
  // phone mode is selected — the "Let's Play!" gate right below the welcome screen's word list.
  const teamsWithoutAPhone = inputMode === "phone"
    ? propTeams.filter(t => (connectedByTeam[String(t.id)] ?? []).length === 0).map(t => t.name)
    : [];
  // "together" also needs a SECOND phone on every team — someone has to see the word and answer,
  // and the other teams are busy with their own words (see PlayStyle).
  const teamsNeedingSecondPhone = together
    ? propTeams.filter(t => (connectedByTeam[String(t.id)] ?? []).length === 1).map(t => t.name)
    : [];
  const startBlocked = teamsWithoutAPhone.length > 0 || teamsNeedingSecondPhone.length > 0;

  // How to Play video: shared/HowToPlayModal.tsx — if this welcome screen's rules change, the video (Desktop\classcade-videos) needs a re-make.
  if (phase === "welcome") {
    return (
      <div style={{ ...arenaStyle, textAlign: "center" }}>
        {STYLE_TAG}
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ background: "linear-gradient(160deg,#0F766E,#022C22)", border: "2px solid #2DD4BF55", borderRadius: "20px", padding: "28px 24px", marginBottom: "10px", color: "white", maxWidth: "540px", margin: "0 auto 10px", boxShadow: "0 0 50px rgba(13,148,136,0.45)" }}>
            <div style={{ marginBottom: "10px" }}><Icon name="megaphone" size={36} /></div>
            <div style={{ fontWeight: "900", fontSize: "20px", marginBottom: "10px", color: "#5EEAD4" }}>Word Relay</div>
            <div style={{ fontSize: "15px", lineHeight: 1.7, opacity: 0.95 }}>
              {isSolo ? "You have a hidden word each round. " : "Every team has its own hidden word. "}
              {together
                ? <><strong style={{ color: "#5EEAD4" }}>Every team plays at the same time</strong>, in its own huddle: one person asks yes/no questions to work it out, and teammates who can see the word on their phones answer.</>
                : <><strong style={{ color: "#5EEAD4" }}>One person from each team comes to the front</strong> and asks yes/no questions to work it out — one question at a time, team by team.</>}
              <br />
              Guess it in as few questions as you can: up to <strong style={{ color: "#5EEAD4" }}>{MAX_POINTS} points</strong> for your 1st question, down to {MIN_POINTS} by your {QUESTIONS_PER_PERSON}th. Then {isSolo ? "you go again with a new word" : "the next teammate swaps in"}!
            </div>
          </div>
          <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap", marginBottom: "18px" }}>
            {teams.map((t, i) => (
              <div key={t.id} style={{ background: t.color.dark, border: "2px solid #1A1A2E", boxShadow: "3px 3px 0 #1A1A2E", borderRadius: "14px", padding: "10px 18px", fontWeight: "800", fontSize: "14px", color: "white", display: "flex", alignItems: "center", gap: "6px" }}>
                {i + 1}. <TeamIcon team={t} color="white" /> {t.name}
              </div>
            ))}
          </div>

          {/* Screen mode has no device data to count, so it stays a manual, uniform-across-teams
              picker — the teacher's own explicit call, applied to every team the same way. Phone
              mode skips this entirely (see the explainer below it): each team's real count comes
              from how many phones actually join it, so an uneven class never has to be forced into
              one shared number. */}
          {inputMode === "screen" ? (
            <div style={{ marginBottom: "20px" }}>
              <div style={{ fontSize: "13px", color: "#99F6E4", fontWeight: "700", marginBottom: "10px" }}>How many people per team?</div>
              <div style={{ display: "flex", gap: "8px", justifyContent: "center", flexWrap: "wrap" }}>
                {[1, 2, 3, 4, 5, 6].map(n => {
                  const selected = peoplePerTeam === n;
                  return (
                    <button key={n} onClick={() => setPeoplePerTeam(n)} className="rl-btn" style={{
                      width: "40px", height: "40px", borderRadius: "10px", fontWeight: "900", fontSize: "15px", cursor: "pointer",
                      border: `2px solid ${selected ? "#2DD4BF" : "rgba(255,255,255,0.2)"}`,
                      background: selected ? "rgba(45,212,191,0.2)" : "rgba(255,255,255,0.05)",
                      color: selected ? "#5EEAD4" : "#94A3B8",
                    }}>{n}</button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div style={{ marginBottom: "20px", fontSize: "12px", color: "#99F6E499", fontWeight: "600", maxWidth: "440px", margin: "0 auto 20px" }}>
              No need to set people per team on phones — each team's count is however many phones
              actually join it before you hit "Let's Play!", so uneven teams just work.
            </div>
          )}

          {/* How many full laps through that roster to play — without this a team was done for good
              the moment its own roster had each had one turn (one word per person, ever). Same
              picker idiom as peoplePerTeam, applied uniformly for the same reason. */}
          <div style={{ marginBottom: "20px" }}>
            <div style={{ fontSize: "13px", color: "#99F6E4", fontWeight: "700", marginBottom: "10px" }}>How many rounds?</div>
            <div style={{ display: "flex", gap: "8px", justifyContent: "center", flexWrap: "wrap" }}>
              {[1, 2, 3, 4, 5, 6].map(n => {
                const selected = roundsCount === n;
                return (
                  <button key={n} onClick={() => setRoundsCount(n)} className="rl-btn" style={{
                    width: "40px", height: "40px", borderRadius: "10px", fontWeight: "900", fontSize: "15px", cursor: "pointer",
                    border: `2px solid ${selected ? "#2DD4BF" : "rgba(255,255,255,0.2)"}`,
                    background: selected ? "rgba(45,212,191,0.2)" : "rgba(255,255,255,0.05)",
                    color: selected ? "#5EEAD4" : "#94A3B8",
                  }}>{n}</button>
                );
              })}
            </div>
            <div style={{ fontSize: "12px", color: "#99F6E499", fontWeight: "600", marginTop: "8px" }}>
              {inputMode === "phone"
                ? "Every team's whole roster goes again each round — each team's roster size is set automatically by how many phones join it."
                : `Every team's whole roster goes again each round — ${peoplePerTeam} × ${roundsCount} = ${peoplePerTeam * roundsCount} word${peoplePerTeam * roundsCount === 1 ? "" : "s"} per team this game.`}
            </div>
          </div>

          {/* The teacher's own words instead of the topic's — e.g. "which celebrity am I?" (see
              hooks/useWordDeck.ts). Only here on the one-time welcome screen, before anything has
              been played. Each real team gets its own word from the list — the CPU never does. */}
          <div style={{ maxWidth: "540px", margin: "0 auto" }}>
            <CustomWordsPanel
              theme={{ accent: "#5EEAD4", accentSolid: "#0D9488" }}
              teamCount={propTeams.length} tipBelow={Math.max(10, propTeams.length * 4)}
              active={customWords} onApply={handleApplyCustomWords} onReset={handleResetWords}
            />
          </div>

          {/* Solo only — how aggressively the CPU racer guesses. Same picker idiom as Race Track's
              own solo difficulty row / Bounty Board's steal-speed row. */}
          {isSolo && (
            <div style={{ marginTop: "20px", marginBottom: "4px" }}>
              <div style={{ fontSize: "13px", color: "#99F6E4", fontWeight: "700", marginBottom: "10px" }}><Icon name="robot" size={13} /> How sharp is the CPU racer?</div>
              <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
                {(["easy", "medium", "hard"] as const).map(d => {
                  const selected = difficulty === d;
                  const dotColor = d === "easy" ? "#22C55E" : d === "medium" ? "#EAB308" : "#EF4444";
                  const label = d[0].toUpperCase() + d.slice(1);
                  return (
                    <button key={d} onClick={() => setDifficulty(d)} className="rl-btn" style={{
                      padding: "10px 20px", borderRadius: "12px", fontWeight: "800", fontSize: "14px", cursor: "pointer",
                      border: `2px solid ${selected ? "#2DD4BF" : "rgba(255,255,255,0.2)"}`,
                      background: selected ? "rgba(45,212,191,0.15)" : "rgba(255,255,255,0.05)",
                      color: selected ? "#5EEAD4" : "#94A3B8",
                      display: "inline-flex", alignItems: "center", gap: "6px",
                    }}>
                      <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: dotColor, display: "inline-block" }} /> {label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Always shown, even when a class-level session already exists (Class Check-In, or an
              earlier game's "Play on Phones") — a teacher choosing THIS game still needs the choice
              of Screen vs Phones for it specifically; picking Phones reuses the existing class-level
              code (see handlePickPhoneMode/ensurePhoneSession) rather than starting a new one.
              Available at any real team count, including true solo (one student, playing
              online/remotely) — the asker/answerer split below already handles a one-phone team
              (its own lone phone becomes the asker, and the teacher's screen falls back to holding
              the word and the controls since there's no second phone to be the answerer), the same
              fallback a one-phone team already needed for in-person play. */}
          <>
            {introStep === "setup" && (
              <div style={{ marginBottom: "20px" }}>
                <div style={{ fontSize: "13px", color: "#99F6E4", fontWeight: "700", marginBottom: "10px" }}>How will you play?</div>
                  <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                    <button onClick={handlePickScreenMode} className="rl-btn" style={{
                      padding: "10px 20px", borderRadius: "12px", fontWeight: "800", fontSize: "14px", cursor: "pointer",
                      border: `2px solid ${inputMode === "screen" ? "#2DD4BF" : "rgba(255,255,255,0.2)"}`,
                      background: inputMode === "screen" ? "rgba(45,212,191,0.15)" : "rgba(255,255,255,0.05)",
                      color: inputMode === "screen" ? "#5EEAD4" : "#94A3B8",
                      display: "inline-flex", alignItems: "center", gap: "6px",
                    }}><Icon name="screen" size={14} /> Play on Screen</button>
                    <button onClick={handlePickPhoneMode} className="rl-btn" style={{
                      padding: "10px 20px", borderRadius: "12px", fontWeight: "800", fontSize: "14px", cursor: "pointer",
                      border: `2px solid ${inputMode === "phone" ? "#2DD4BF" : "rgba(255,255,255,0.2)"}`,
                      background: inputMode === "phone" ? "rgba(45,212,191,0.15)" : "rgba(255,255,255,0.05)",
                      color: inputMode === "phone" ? "#5EEAD4" : "#94A3B8",
                      display: "inline-flex", alignItems: "center", gap: "6px",
                    }}><Icon name="phone" size={14} /> Play on Phones</button>
                  </div>
                </div>
              )}

              {introStep === "qr" && sessionCode && (() => {
                const joinUrl = buildJoinUrl(sessionCode);
                const phoneCountByTeam: Record<string, number> = {};
                // propTeams, not teams — the CPU can never hold a phone, so it must never show up
                // as something a real device could tap to "join as" (same pattern Bounty Board's
                // own PhoneJoinPanel call already uses).
                propTeams.forEach(t => { phoneCountByTeam[String(t.id)] = (connectedByTeam[String(t.id)] ?? []).length; });
                return (
                  <>
                  {/* "Take turns" vs "All at once" — see PlayStyle. Hidden for solo (one team vs
                      the CPU has nobody to play alongside). */}
                  {!isSolo && (
                    <div style={{ marginBottom: "20px" }}>
                      <div style={{ fontSize: "13px", color: "#99F6E4", fontWeight: "700", marginBottom: "10px" }}>How should teams play?</div>
                      <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
                        {([
                          { id: "together" as const, label: "⚡ All at once", desc: "Every team asks in its own huddle at the same time" },
                          { id: "turns" as const, label: "🔁 Take turns", desc: "One question per team, then the next team" },
                        ]).map(opt => {
                          const selected = playStyle === opt.id;
                          return (
                            <button key={opt.id} onClick={() => setPlayStyle(opt.id)} className="rl-btn" style={{
                              padding: "10px 16px", borderRadius: "12px", cursor: "pointer", maxWidth: "220px",
                              border: `2px solid ${selected ? "#2DD4BF" : "rgba(255,255,255,0.2)"}`,
                              background: selected ? "rgba(45,212,191,0.15)" : "rgba(255,255,255,0.05)",
                              color: selected ? "#5EEAD4" : "#94A3B8",
                            }}>
                              <div style={{ fontWeight: "900", fontSize: "14px" }}>{opt.label}</div>
                              <div style={{ fontWeight: "600", fontSize: "11px", marginTop: "3px", opacity: 0.9 }}>{opt.desc}</div>
                            </button>
                          );
                        })}
                      </div>
                      {playStyle === "together" && (
                        <div style={{ fontSize: "12px", color: "#FDE68A", fontWeight: "700", marginTop: "10px", maxWidth: "440px", marginLeft: "auto", marginRight: "auto", lineHeight: 1.5 }}>
                          📱📱 Every team needs at least 2 phones — one person asks, the others see the word and answer.
                          A team with only one phone? Choose "Take turns" (the other teams answer for them).
                        </div>
                      )}
                    </div>
                  )}
                  <PhoneJoinPanel
                    sessionCode={sessionCode} joinUrl={joinUrl} teams={propTeams} connectedTeamIds={connectedTeamIds}
                    phoneCountByTeam={phoneCountByTeam}
                    accent="#5EEAD4" panelBg="linear-gradient(160deg,#0F766E,#022C22)" borderColor="#2DD4BF66"
                    footer={
                      <>
                        <div style={{ fontSize: "12px", color: "#99F6E4", marginBottom: "8px", lineHeight: 1.5 }}>
                          Every student can join on their own phone — pick the same team to share it.
                          However many phones are on a team when you hit "Let's Play!" is that team's
                          people count for the whole game, so uneven teams are fine.
                        </div>
                        <button onClick={handlePickScreenMode} style={{ background: "none", border: "none", color: "#99F6E499", fontSize: "12px", fontWeight: "700", cursor: "pointer", textDecoration: "underline" }}>
                          Switch back to Play on Screen
                        </button>
                      </>
                    }
                  />
                  </>
                );
              })()}
          </>

          {wordListToggle}
          <button onClick={() => setShowHowTo(true)} className="rl-btn" style={{ display: "inline-flex", alignItems: "center", gap: "6px", marginBottom: "14px", background: "rgba(255,255,255,0.95)", color: GM.color, border: `2px solid ${GM.color}`, boxShadow: "0 2px 8px rgba(0,0,0,0.18)", borderRadius: "12px", padding: "10px 24px", fontSize: "14px", fontWeight: "800", cursor: "pointer" }}>
            <Icon name="help" size={15} /> How to Play
          </button>
          {showHowTo && (
            <HowToPlayModal
              gameName={GM.name} gameIcon={GAME_ICONS[GM.id]} accentColor={GM.color}
              gameId={GM.id}
              onClose={() => setShowHowTo(false)}
            />
          )}
          {/* Every real team needs at least one phone connected before phone mode can start — a team
              that never joined would otherwise silently lock in at 1 "phantom" person nobody is
              actually playing. Screen mode has no device data to check, so it's never gated. */}
          {teamsWithoutAPhone.length > 0 && (
            <div style={{ fontSize: "13px", color: "#FCA5A5", fontWeight: "700", marginBottom: "10px" }}>
              Waiting for a phone to join: {teamsWithoutAPhone.join(", ")}
            </div>
          )}
          {teamsNeedingSecondPhone.length > 0 && (
            <div style={{ fontSize: "13px", color: "#FDE68A", fontWeight: "700", marginBottom: "10px", maxWidth: "460px", marginLeft: "auto", marginRight: "auto", lineHeight: 1.5 }}>
              "All at once" needs a 2nd phone on: {teamsNeedingSecondPhone.join(", ")} — or switch to "Take turns" above.
            </div>
          )}
          <button
            disabled={startBlocked}
            onClick={() => {
              if (startBlocked) return;
              // Consumes team 0's own needsReady flag right here, same as goToNextTeam does for
              // every later hand-off — otherwise this first team's SECOND turn (no swap in between)
              // would spuriously show "send someone up" again for the same person still standing.
              setNeedsReadyByTeam(prev => ({ ...prev, [currentKey]: false }));
              // Locks in each team's real people count for the whole game, right as it starts —
              // phone mode reads however many phones actually joined each team (every real team is
              // guaranteed at least 1 by the gate above); screen mode just uses the manual picker for
              // every team, same as before. Frozen here and never recalculated — late joiners aren't
              // what this (or any) game here is built for, so a disconnect/reconnect afterward never
              // changes a team's turn budget mid-game.
              const locked: Record<string, number> = {};
              propTeams.forEach(t => {
                const key = String(t.id);
                locked[key] = inputMode === "phone" ? Math.max(1, (connectedByTeam[key] ?? []).length) : peoplePerTeam;
              });
              if (isSolo && cpuRef.current) {
                // CPU mirrors the one real team's own locked count, so both sides play the same
                // number of turns per round instead of the CPU racing through a mismatched budget.
                locked[String(cpuRef.current.id)] = locked[String(propTeams[0].id)] ?? peoplePerTeam;
              }
              setLockedPeoplePerTeamByTeam(locked);
              setTeamPhaseByTeam({});
              setRevealByTeam({});
              setPhase(phoneFlow ? "asking" : "ready");
            }}
            className="rl-btn"
            style={{
              display: "inline-flex", alignItems: "center", gap: "8px", color: "white", border: "3px solid #1A1A2E",
              borderRadius: "16px", padding: "16px 48px", fontSize: "19px", fontWeight: "900",
              background: startBlocked ? "#134E4A" : "#0D9488",
              cursor: startBlocked ? "not-allowed" : "pointer",
              opacity: startBlocked ? 0.6 : 1,
              boxShadow: "6px 6px 0 #1A1A2E",
            }}
          >
            <Icon name="megaphone" size={20} /> Let's Play!
          </button>
        </div>
      </div>
    );
  }

  if (phase === "final") {
    const ranking = denseRank(teams, t => pointsByTeam[t.id] ?? 0).sort((a, b) => b.value - a.value);
    const winners = ranking.filter(r => r.rank === 0);
    const isTie = winners.length > 1;
    const headline = isTie
      ? `${winners.map(w => w.item.name).join(" & ")} tied for the most points!`
      : `${winners[0]?.item.name} scored the most points!`;
    return (
      <div style={{ ...arenaStyle, textAlign: "center" }}>
        {STYLE_TAG}
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ marginBottom: "6px" }}><Icon name="megaphone" size={44} color="#5EEAD4" /></div>
          <div style={{ fontWeight: "900", fontSize: "22px", color: "#5EEAD4", marginBottom: "16px" }}>{headline}</div>
          <div style={{ display: "grid", gridTemplateColumns: teamsGridCols(teams.length), gap: "10px", margin: "0 auto 20px", maxWidth: "760px" }}>
            {ranking.map(({ item: t, rank, value }) => (
              <div key={t.id} style={{ background: t.color.dark, border: "2px solid #1A1A2E", boxShadow: "4px 4px 0 #1A1A2E", borderRadius: "14px", padding: "12px" }}>
                <div><RankBadge rank={rank} size={22} /></div>
                <div style={{ fontWeight: "800", color: "white", fontSize: "14px", marginTop: "4px" }}><TeamIcon team={t} /> {t.name}</div>
                <div style={{ color: "#5EEAD4", fontWeight: "900", fontSize: "16px", marginTop: "4px" }}>{value} pts</div>
                <div style={{ fontSize: "11px", color: "#99F6E4", fontWeight: "700", marginTop: "4px" }}>{wordsByTeam[t.id] ?? 0} words guessed</div>
              </div>
            ))}
          </div>
          <button onClick={onEnd} className="rl-btn" style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "#0D9488", color: "white", border: "3px solid #1A1A2E", borderRadius: "14px", padding: "13px 34px", fontSize: "17px", fontWeight: "900", cursor: "pointer", boxShadow: "5px 5px 0 #1A1A2E" }}><Icon name="checkeredFlag" size={18} /> End Game</button>
        </div>
      </div>
    );
  }

  // "together" mode's screen: a live race board, one card per team, never showing a live word
  // (every asker in the room can see the screen). Each team's own state comes from its phones.
  if (together) {
    return (
      <div style={arenaStyle}>
        {STYLE_TAG}
        <style>{`@keyframes rlCardPop{0%{transform:scale(1)}40%{transform:scale(1.06)}100%{transform:scale(1)}}`}</style>
        {sessionCode && !presetPhoneSession && (
          <PhoneReconnectBadge
            sessionCode={sessionCode} joinUrl={buildJoinUrl(sessionCode)}
            teams={teams} connectedTeamIds={connectedTeamIds}
            phoneCountByTeam={Object.fromEntries(teams.map(t => [String(t.id), (connectedByTeam[String(t.id)] ?? []).length]))}
            accent="#5EEAD4" panelBg="linear-gradient(160deg,#0F766E,#022C22)" borderColor="#2DD4BF66"
          />
        )}
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ background: "#134E4A", border: "3px solid #1A1A2E", borderRadius: "14px", padding: "14px 16px", marginBottom: "16px", textAlign: "center", color: "white", boxShadow: "4px 4px 0 #1A1A2E" }}>
            <div style={{ fontWeight: "900", fontSize: "20px" }}>⚡ Every team at once!</div>
            <div style={{ fontWeight: "700", fontSize: "13px", opacity: 0.9, marginTop: "4px" }}>
              Huddle with your team — the words are on your phones, never on this screen.
            </div>
            {phase === "ready" && (
              <button onClick={() => setPhase("asking")} className="rl-btn" style={{ marginTop: "12px", background: "#0D9488", color: "white", border: "3px solid #1A1A2E", borderRadius: "14px", padding: "12px 30px", fontSize: "17px", fontWeight: "900", cursor: "pointer", boxShadow: "4px 4px 0 #1A1A2E" }}>Start!</button>
            )}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: teamsGridCols(teams.length), gap: "12px", marginBottom: "16px" }}>
            {teams.map(t => {
              const key = String(t.id);
              const tPhase = teamPhaseOf(key);
              const reveal = revealByTeam[key];
              const ppt = peoplePerTeamFor(key);
              const slot = slotIndexByTeam[key] ?? 0;
              const budget = questionsForSlot(key, slot);
              const qNum = Math.min((questionsUsedByTeam[key] ?? 0) + 1, Math.max(budget, 1));
              // Connected phones that can see the word (everyone but the asker) — 0 means nobody on the
              // team can answer or tap until a teammate wakes their phone or rejoins.
              const answerPhones = (connectedByTeam[key] ?? []).filter(d => d !== rotatedDevices(key)[0]).length;
              const guessedNow = tPhase === "reveal" && reveal?.kind === "guessed";
              const accent = tPhase === "done" ? "#64748B" : tPhase === "reveal" ? (guessedNow ? "#22C55E" : "#F59E0B") : "#1A1A2E";
              return (
                <div key={t.id} style={{
                  background: t.color.dark, border: `3px solid ${accent}`, borderRadius: "16px", padding: "14px 12px",
                  color: "white", textAlign: "center", boxShadow: "4px 4px 0 #1A1A2E", opacity: tPhase === "done" ? 0.65 : 1,
                  animation: guessedNow ? "rlCardPop 0.5s ease-out" : undefined,
                }}>
                  <div style={{ fontWeight: "900", fontSize: "16px" }}><TeamIcon team={t} color="white" /> {t.name}</div>
                  <div style={{ color: "#5EEAD4", fontWeight: "900", fontSize: "30px", lineHeight: 1.1, marginTop: "6px" }}>{pointsByTeam[t.id] ?? 0}</div>
                  <div style={{ fontSize: "11px", fontWeight: "800", opacity: 0.85 }}>points · {wordsByTeam[t.id] ?? 0} words</div>
                  <div style={{ background: "rgba(0,0,0,0.3)", borderRadius: "10px", padding: "8px", marginTop: "10px", fontSize: "13px", fontWeight: "800", minHeight: "40px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                    {tPhase === "done" && <>✅ Finished — sit down</>}
                    {tPhase === "reveal" && reveal && (guessedNow
                      ? <>🎉 Guessed “{reveal.word}”! <span style={{ color: "#86EFAC" }}>+{reveal.points}</span></>
                      : <>⏱️ Out of questions — it was “{reveal.word}”</>)}
                    {tPhase === "asking" && (
                      <>
                        <div>🙋 Asking… question {qNum} of {budget}</div>
                        {(roundsCount > 1 || ppt > 1) && (
                          <div style={{ fontSize: "11px", opacity: 0.8, marginTop: "2px" }}>
                            {[roundsCount > 1 ? `Round ${Math.floor(slot / ppt) + 1} of ${roundsCount}` : "", ppt > 1 ? `Person ${(slot % ppt) + 1} of ${ppt}` : ""].filter(Boolean).join(" · ")}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  {tPhase !== "done" && answerPhones === 0 && (
                    <div style={{ fontSize: "11px", color: "#FDE68A", fontWeight: "800", marginTop: "8px" }}>⚠️ No teammate phone connected — wake a phone up or rejoin</div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Same filler the turn-based screen shows while phones hold the word: the full pool
              (never narrows down any team's live word) and the question starters. */}
          <div style={{ background: "#022C22", border: "3px dashed #0D9488", borderRadius: "22px", padding: "18px", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: "18px" }}>
            <div>
              <div style={{ fontSize: "11px", fontWeight: "800", color: "#5EEAD499", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "8px", textAlign: "center" }}>Possible words</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", justifyContent: "center", maxHeight: "220px", overflowY: "auto" }}>
                {[...words].sort().map((word, i) => (
                  <span key={`${word}-${i}`} style={{ background: "rgba(20,184,166,0.18)", color: "#99F6E4", border: "1px solid #14B8A655", borderRadius: "6px", padding: "4px 10px", fontSize: "13px", fontWeight: "700" }}>{word}</span>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize: "11px", fontWeight: "800", color: "#5EEAD499", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "8px", textAlign: "center" }}>Question starters</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxHeight: "220px", overflowY: "auto" }}>
                {RELAY_QUESTION_STARTERS.map(q => (
                  <div key={q} style={{ background: "rgba(20,184,166,0.1)", color: "#CCFBF1", border: "1px solid #14B8A640", borderRadius: "8px", padding: "6px 10px", fontSize: "13px", fontWeight: "700", textAlign: "center" }}>{q}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const bigBtn = (bg: string, color = "white"): React.CSSProperties => ({
    background: bg, color, border: "3px solid #1A1A2E", borderRadius: "14px", padding: "16px", fontSize: "18px",
    fontWeight: "900", cursor: "pointer", boxShadow: "4px 4px 0 #1A1A2E",
  });

  const scoreStrip = (
    <div style={{ display: "flex", gap: "8px", justifyContent: "center", flexWrap: "wrap", marginTop: "16px" }}>
      {teams.map((t, i) => {
        const key = String(t.id);
        const finished = isTeamFinished(key);
        return (
          <div key={t.id} style={{ background: t.color.dark, border: `2px solid ${t.id === currentTeam.id ? "#5EEAD4" : "#1A1A2E"}`, borderRadius: "12px", padding: "8px 14px", color: "white", fontSize: "12px", fontWeight: "800", textAlign: "center", opacity: finished ? 0.6 : 1 }}>
            <div><TeamIcon team={t} color="white" /> {t.name}</div>
            <div style={{ color: "#5EEAD4", fontSize: "14px" }}>{pointsByTeam[t.id] ?? 0} pts</div>
            <div style={{ opacity: 0.85, fontWeight: "700" }}>{wordsByTeam[t.id] ?? 0} words</div>
            {!finished && (roundsCount > 1 || peoplePerTeamFor(key) > 1) && (() => {
              const ppt = peoplePerTeamFor(key);
              const raw = slotIndexByTeam[key] ?? 0;
              const parts: string[] = [];
              if (roundsCount > 1) parts.push(`Round ${Math.floor(raw / ppt) + 1} of ${roundsCount}`);
              if (ppt > 1) parts.push(`Person ${(raw % ppt) + 1} of ${ppt}`);
              return <div style={{ opacity: 0.85, fontWeight: "700" }}>{parts.join(" · ")}</div>;
            })()}
            <div style={{ opacity: 0.8, fontWeight: "700" }}>{finished ? "Finished — sitting down" : `${questionsLeftFor(i)} questions left`}</div>
          </div>
        );
      })}
    </div>
  );

  const askerLabel = inputMode === "phone" && askerDeviceId
    ? `Asker: phone ${teamDevices.indexOf(askerDeviceId) + 1} of ${teamDevices.length}`
    : null;
  const currentSlotRaw = slotIndexByTeam[currentKey] ?? 0;
  const currentPersonNumber = Math.min((currentSlotRaw % currentPeoplePerTeam) + 1, currentPeoplePerTeam);
  const currentRoundNumber = Math.min(Math.floor(currentSlotRaw / currentPeoplePerTeam) + 1, roundsCount);
  const currentBudget = questionsForSlot(currentKey, currentSlotRaw);
  const currentQuestionNumber = Math.min((questionsUsedByTeam[currentKey] ?? 0) + 1, Math.max(currentBudget, 1));
  // What a correct guess would earn right now — shown live on the button so the stakes are visible.
  const pointsIfGuessedNow = currentBudget > 0 ? guessPoints(currentQuestionNumber, currentBudget) : MIN_POINTS;

  return (
    <div style={arenaStyle}>
      {STYLE_TAG}
      {/* Suppressed for a Class Check-In sitting — the class-level badge (LessonGamesGenerator.tsx's
          renderClassCheckInBadge) is the only floating reconnect button shown then, and it's the
          only one pointing at the right (class, not per-game) join URL. */}
      {inputMode === "phone" && sessionCode && !presetPhoneSession && (
        <PhoneReconnectBadge
          sessionCode={sessionCode} joinUrl={buildJoinUrl(sessionCode)}
          teams={teams} connectedTeamIds={connectedTeamIds}
          phoneCountByTeam={Object.fromEntries(teams.map(t => [String(t.id), (connectedByTeam[String(t.id)] ?? []).length]))}
          accent="#5EEAD4" panelBg="linear-gradient(160deg,#0F766E,#022C22)" borderColor="#2DD4BF66"
        />
      )}
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ background: "#134E4A", border: "3px solid #1A1A2E", borderRadius: "14px", padding: "14px 16px", marginBottom: "16px", textAlign: "center", color: "white", boxShadow: "4px 4px 0 #1A1A2E" }}>
          <div style={{ fontWeight: "900", fontSize: "18px" }}><TeamIcon team={currentTeam} /> {currentTeam.name}'s turn</div>
          <div style={{ fontWeight: "800", fontSize: "13px", opacity: 0.9, marginTop: "4px" }}>
            {isTeamFinished(currentKey)
              ? "Finished — everyone sits down"
              : <>{roundsCount > 1 ? `Round ${currentRoundNumber} of ${roundsCount} · ` : ""}{currentPeoplePerTeam > 1 ? `Person ${currentPersonNumber} of ${currentPeoplePerTeam} · ` : ""}Question {currentQuestionNumber} of {currentBudget}{askerLabel ? ` · ${askerLabel}` : ""}</>}
          </div>
        </div>

        {phase === "ready" && (
          <div style={{ background: "#022C22", border: "4px solid #1A1A2E", borderRadius: "22px", padding: "32px 18px", textAlign: "center", boxShadow: "6px 6px 0 #1A1A2E" }}>
            <div style={{ fontSize: "40px", marginBottom: "8px" }}>🙋</div>
            <div style={{ fontWeight: "900", fontSize: "22px", color: "#5EEAD4", marginBottom: "8px" }}>{isSolo ? "Get ready to ask!" : `${currentTeam.name}: send someone up!`}</div>
            <div style={{ color: "#CCFBF1", fontSize: "15px", fontWeight: "600", lineHeight: 1.6, maxWidth: "460px", margin: "0 auto 20px" }}>
              {isSolo
                ? <>Don't peek at the word — <strong>look away from the screen</strong> (or just don't look) while you get ready to ask. When you're ready, reveal it.</>
                : <>Whoever is asking steps to the front and <strong>faces away from the screen</strong>. When they're ready, show the word to the teacher and the class.</>}
            </div>
            <button onClick={() => setPhase("asking")} className="rl-btn" style={bigBtn("#0D9488")}>Show the word</button>
          </div>
        )}

        {/* The CPU never actually asks anything (see cpuTurnEffect) — a short "thinking" card
            instead of a real word, no buttons, the effect resolves it on its own. */}
        {phase === "asking" && isCpuTurn && (
          <div style={{ background: "#022C22", border: "4px dashed #6B7280", borderRadius: "22px", padding: "34px 18px", textAlign: "center" }}>
            <div style={{ marginBottom: "10px" }}><Icon name="robot" size={34} /></div>
            <div style={{ fontWeight: "900", fontSize: "18px", color: "#5EEAD4", marginBottom: "6px" }}>CPU is asking questions…</div>
            <div style={{ color: "#99F6E4", fontSize: "14px", fontWeight: "600" }}>Racing to guess its own word.</div>
          </div>
        )}

        {phase === "asking" && !isCpuTurn && (screenShowsWord ? (
          <>
            <div style={{ position: "relative", background: "#022C22", border: "4px solid #1A1A2E", borderRadius: "22px", padding: "26px 18px", textAlign: "center", marginBottom: "16px", boxShadow: "6px 6px 0 #1A1A2E" }}>
              <div style={{ position: "absolute", top: "10px", right: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
                {/* Teacher-only toggle — see wordBankShown's own declaration. Swaps this card for
                    the word pool so the live word isn't sitting on screen between questions;
                    resets back to the live word automatically the moment it actually changes. */}
                <button
                  onClick={() => setWordBankShown(s => !s)}
                  style={{
                    background: wordBankShown ? "#14B8A6" : "rgba(255,255,255,0.08)", color: wordBankShown ? "#022C22" : "#5EEAD4",
                    border: "1.5px solid #14B8A666", borderRadius: "8px", padding: "5px 9px", fontSize: "11px", fontWeight: "800", cursor: "pointer", whiteSpace: "nowrap",
                  }}
                >
                  {wordBankShown ? "👁️ Show word" : "📋 Word bank"}
                </button>
                <FlagPromptButton gameId="relay" questionData={{ raw: teamWords[currentKey] }} />
              </div>
              {wordBankShown ? (
                <>
                  <div style={{ color: "#5EEAD4", fontWeight: "800", fontSize: "13px", textTransform: "uppercase", marginBottom: "10px" }}>Possible words — the live word is hidden</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "7px", justifyContent: "center", alignContent: "center", minHeight: "120px", padding: "8px 36px" }}>
                    {[...words].sort().map((word, i) => (
                      <span key={`${word}-${i}`} style={{ background: "rgba(20,184,166,0.18)", color: "#99F6E4", border: "1px solid #14B8A655", borderRadius: "6px", padding: "5px 12px", fontSize: "14px", fontWeight: "700" }}>{word}</span>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <div style={{ color: "#5EEAD4", fontWeight: "800", fontSize: "13px", textTransform: "uppercase", marginBottom: "10px" }}>The hidden word — asker faces away!</div>
                  <div key={teamWords[currentKey]} style={{ background: "rgba(0,0,0,0.35)", borderRadius: "18px", border: "3px solid #14B8A655", padding: "24px 12px", color: "#F0FDFA", fontWeight: "900", fontSize: "clamp(36px,9vw,72px)", lineHeight: 1.05, minHeight: "120px", display: "flex", alignItems: "center", justifyContent: "center", overflowWrap: "anywhere", textShadow: "0 0 18px rgba(45,212,191,0.6)", animation: "rlWordPop 0.25s ease-out" }}>
                    {teamWords[currentKey]}
                  </div>
                </>
              )}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: "12px" }}>
              <button onClick={markGuessed} className="rl-btn" style={bigBtn("#22C55E")}>Guessed it! +{pointsIfGuessedNow}</button>
              <button onClick={markMissed} className="rl-btn" style={bigBtn("rgba(0,0,0,0.3)", "#5EEAD4")}>Question asked → next team</button>
            </div>
            <div style={{ textAlign: "center", marginTop: "10px", color: "#99F6E4", fontSize: "12px", fontWeight: "700", lineHeight: 1.5 }}>
              Not guessed yet? Tap "Question asked" — it uses up one of their questions and passes the turn. The sooner they guess, the more points.
            </div>
            <div style={{ textAlign: "center", marginTop: "10px" }}>
              <button onClick={changeWord} style={{ background: "none", border: "none", color: "#99F6E499", fontSize: "12px", fontWeight: "700", cursor: "pointer", textDecoration: "underline" }}>Change this word</button>
            </div>
          </>
        ) : (
          <div style={{ background: "#022C22", border: "3px dashed #0D9488", borderRadius: "22px", padding: "24px 18px", textAlign: "center" }}>
            <div style={{ fontWeight: "900", fontSize: "16px", color: "#5EEAD4", marginBottom: "2px" }}>Asking time!</div>
            <div style={{ color: "#99F6E499", fontSize: "11px", fontWeight: "600", marginBottom: "14px" }}>The exact word stays off this screen so the asker can't see it.</div>
            {/* Fills the space the word card would otherwise leave empty — the full pool, not the
                one live word, so this is never a spoiler even if the asker glances up — plus
                generic question-starter frames (see RELAY_QUESTION_STARTERS) so the asker has something
                to lean on while building their yes/no question. */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: "18px", textAlign: "left" }}>
              <div>
                <div style={{ fontSize: "11px", fontWeight: "800", color: "#5EEAD499", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "8px", textAlign: "center" }}>Possible words this round</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", justifyContent: "center", maxHeight: "260px", overflowY: "auto" }}>
                  {[...words].sort().map((word, i) => (
                    <span key={`${word}-${i}`} style={{ background: "rgba(20,184,166,0.18)", color: "#99F6E4", border: "1px solid #14B8A655", borderRadius: "6px", padding: "4px 10px", fontSize: "13px", fontWeight: "700" }}>{word}</span>
                  ))}
                </div>
              </div>
              <div>
                <div style={{ fontSize: "11px", fontWeight: "800", color: "#5EEAD499", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "8px", textAlign: "center" }}>Question starters</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxHeight: "260px", overflowY: "auto" }}>
                  {RELAY_QUESTION_STARTERS.map(q => (
                    <div key={q} style={{ background: "rgba(20,184,166,0.1)", color: "#CCFBF1", border: "1px solid #14B8A640", borderRadius: "8px", padding: "6px 10px", fontSize: "13px", fontWeight: "700", textAlign: "center" }}>{q}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}

        {phase === "reveal" && isCpuTurn && (
          <div style={{ background: "#022C22", border: "4px solid #6B7280", borderRadius: "22px", padding: "28px 18px", textAlign: "center", boxShadow: "6px 6px 0 #1A1A2E" }}>
            <div style={{ fontSize: "40px", marginBottom: "6px" }}>🤖</div>
            <div style={{ color: "#5EEAD4", fontWeight: "800", fontSize: "13px", textTransform: "uppercase" }}>CPU guessed it! +{revealInfo.points}</div>
          </div>
        )}

        {phase === "reveal" && !isCpuTurn && (() => {
          const guessedIt = revealInfo.kind === "guessed";
          return (
          <div style={{ background: "#022C22", border: `4px solid ${guessedIt ? "#22C55E" : "#F59E0B"}`, borderRadius: "22px", padding: "28px 18px", textAlign: "center", boxShadow: "6px 6px 0 #1A1A2E" }}>
            <div style={{ fontSize: "40px", marginBottom: "6px" }}>{guessedIt ? "🎉" : "⏱️"}</div>
            <div style={{ color: "#5EEAD4", fontWeight: "800", fontSize: "13px", textTransform: "uppercase", marginBottom: "8px" }}>
              {guessedIt ? `${currentTeam.name} guessed it! +${revealInfo.points}` : `${currentTeam.name} ran out of questions — the word was:`}
            </div>
            {screenShowsWord && (
              <div style={{ fontWeight: "900", fontSize: "clamp(32px,8vw,60px)", color: "#F0FDFA", lineHeight: 1.1, marginBottom: "10px", overflowWrap: "anywhere" }}>{revealWord}</div>
            )}
            {/* A team's last person just finished: nobody is left to swap in, so the team is DONE —
                tell them to sit down instead of promising "someone new takes over". */}
            <div style={{ color: "#CCFBF1", fontSize: "16px", fontWeight: "800", marginBottom: "18px" }}>
              {revealInfo.teamFinished
                ? (allTeamsFinished
                    ? "That was the last turn — every team is finished!"
                    : `${currentTeam.name} is finished! Everyone on ${currentTeam.name}: sit down and wait while the other teams finish.`)
                : revealStartsNewRound
                  ? `Round ${currentRoundNumber - 1} complete! ${currentTeam.name} goes again with a new word — round ${currentRoundNumber} of ${roundsCount}.`
                  : inputMode === "phone" && askerDeviceId
                    ? "Time to swap — the next phone in line takes over next turn!"
                    : `Time to swap — someone new from ${currentTeam.name} takes over next turn!`}
            </div>
            {screenShowsWord ? (
              <button onClick={continueFromReveal} className="rl-btn" style={bigBtn("#0D9488")}>{allTeamsFinished ? "See final results" : "Next team →"}</button>
            ) : (
              <div style={{ color: "#99F6E4", fontSize: "13px", fontWeight: "600" }}>A teammate taps "Next team" on their phone to keep going.</div>
            )}
          </div>
          );
        })()}

        {scoreStrip}
      </div>
    </div>
  );
}
