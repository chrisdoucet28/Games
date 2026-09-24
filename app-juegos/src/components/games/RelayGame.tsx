import { useEffect, useMemo, useRef, useState } from "react";
import { TeamIcon } from "../shared/TeamIcon";
import { Icon } from "../shared/Icon";
import type { RealtimeChannel } from "@supabase/supabase-js";
import type { GameProps } from "../../types";
import { teamsGridCols, GAME_MODES, GAME_ICONS } from "../../data/constants";
import { denseRank } from "../../utils/ranking";
import { RankBadge } from "../shared/RankBadge";
import { HowToPlayModal } from "../shared/HowToPlayModal";
import { FlagPromptButton } from "../shared/FlagPromptButton";
import { PhoneJoinPanel } from "../shared/PhoneJoinPanel";
import { PhoneReconnectBadge } from "../shared/PhoneReconnectBadge";
import { CustomWordsPanel } from "../shared/CustomWordsPanel";
import { useWordDeck } from "../../hooks/useWordDeck";
import { RELAY_TUTORIAL_STEPS } from "../../data/tutorials/relay";
import { playSound } from "../../lib/sounds";
import { setMusicGame, setMusicContext, stopMusic } from "../../lib/music";
import { makeSoloCpuTeam } from "../../lib/soloOpponent";
import {
  generateSessionCode, openRelayChannel, closeChannel,
  type RelayPhase, type RelayStatePayload, type RelayActionPayload,
} from "../../lib/liveSession";

const GM = GAME_MODES.find(g => g.id === "relay")!;

// Each person gets this many question turns of their own before their team has to swap them out
// (15, not the original 10 — see the comment on QUESTIONS_PER_PERSON's old name in git history:
// 10 was proving too stingy once the budget moved from "shared across the whole team" to
// "per student" — most players were only getting through ~2 words). Guessing a word early is what
// earns more words — wasting all 15 without guessing forces a swap to the next teammate anyway.
const QUESTIONS_PER_PERSON = 15;
const POINTS_PER_WORD = 10;

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
  peoplePerTeam: number;
  // Solo only.
  difficulty?: Difficulty;
  // The teacher's own word list, if they used one — a resumed game keeps playing it.
  customWords?: string[] | null;
};

function validateRelaySnapshot(raw: unknown, teamCount: number): RelaySnapshot | undefined {
  const s = raw as Partial<RelaySnapshot> | null | undefined;
  if (!s) return undefined;
  if (typeof s.teamIndex !== "number" || s.teamIndex < 0 || s.teamIndex >= teamCount) return undefined;
  const peoplePerTeam = typeof s.peoplePerTeam === "number" && s.peoplePerTeam >= 1 ? Math.min(s.peoplePerTeam, 6) : 1;
  const slotIndexByTeam: Record<string, number> = {};
  if (s.slotIndexByTeam && typeof s.slotIndexByTeam === "object") {
    Object.entries(s.slotIndexByTeam).forEach(([k, v]) => {
      if (typeof v === "number" && v >= 0) slotIndexByTeam[k] = Math.min(v, peoplePerTeam);
    });
  }
  const difficulty = s.difficulty === "easy" || s.difficulty === "hard" ? s.difficulty : "medium";
  const customWords = Array.isArray(s.customWords)
    ? s.customWords.filter((w): w is string => typeof w === "string" && w.trim() !== "").slice(0, 200)
    : null;
  return { teamIndex: s.teamIndex, slotIndexByTeam, wordsByTeam: s.wordsByTeam ?? {}, peoplePerTeam, difficulty, customWords };
}

export function RelayGame({ questions, teams: propTeams, onUpdateScore, onEnd, forceFinalRef, serializeStateRef, initialGameState, presetPhoneSession }: GameProps) {
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

  // "Play on Phones" — available whenever there's more than one team. Each phone is one PERSON:
  // several phones can join the same team, and the screen rotates which one is the asker.
  const [inputMode, setInputMode] = useState<"screen" | "phone">(presetPhoneSession ? "phone" : "screen");
  const [introStep, setIntroStep] = useState<"setup" | "qr">("setup");
  const [sessionCode, setSessionCode] = useState<string | null>(presetPhoneSession?.code ?? null);
  const [connectedTeamIds, setConnectedTeamIds] = useState<Set<string | number>>(new Set());
  // Connected phone (device) ids per team, in the order each was first seen — stable, so the asker
  // rotation doesn't reshuffle when someone reconnects. Only phones that report a deviceId appear.
  const [connectedByTeam, setConnectedByTeam] = useState<Record<string, string[]>>({});
  const deviceRosterRef = useRef<Record<string, string[]>>({});
  // Each team's current asker (a device id). Falls back to the first connected phone whenever the
  // stored one isn't connected any more.
  const [askerByTeam, setAskerByTeam] = useState<Record<string, string>>({});
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

  // How many people the teacher said are on each team (uniform across every team, not a per-team
  // roster — the teacher's own explicit call, so a small team doesn't finish before a big one).
  const [peoplePerTeam, setPeoplePerTeam] = useState(() => resumed?.peoplePerTeam ?? 1);
  const [difficulty, setDifficulty] = useState<Difficulty>(() => resumed?.difficulty ?? "medium");
  const [teamIndex, setTeamIndex] = useState(() => resumed?.teamIndex ?? 0);
  // Bumped once per resolveTurn call — see the CPU turn effect's own comment for why this exists
  // (phase alone isn't always enough to detect a genuinely new CPU turn).
  const [turnSeq, setTurnSeq] = useState(0);
  // Which numbered person (0-based, up to peoplePerTeam - 1) is currently up for each team — a team
  // is finished once its own slot index reaches peoplePerTeam. Replaces the old single global
  // roundIndex, which tracked one shared budget for the whole team regardless of how many people
  // were on it.
  const [slotIndexByTeam, setSlotIndexByTeam] = useState<Record<string, number>>(() => resumed?.slotIndexByTeam ?? {});
  // How many of the CURRENT slot's own QUESTIONS_PER_PERSON have been used — always starts fresh on
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
  const [showWordList, setShowWordList] = useState(false);
  // The word a team just guessed, shown on the reveal card — teamWords already holds their NEXT word.
  const [revealWord, setRevealWord] = useState("");

  // The word pool and its shuffled deck (every word once per lap, reshuffled when exhausted, no repeat
  // across a lap boundary) live in the shared hook, along with the teacher's own-words mode — see
  // hooks/useWordDeck.ts.
  const { words, customWords, drawWord, applyCustomWords, resetToTopicWords } = useWordDeck(questions, resumed?.customWords);

  useEffect(() => {
    if (!serializeStateRef) return;
    serializeStateRef.current = (): RelaySnapshot => ({ teamIndex, slotIndexByTeam, wordsByTeam, peoplePerTeam, difficulty, customWords });
    return () => { if (serializeStateRef) serializeStateRef.current = null; };
  }, [serializeStateRef, teamIndex, slotIndexByTeam, wordsByTeam, peoplePerTeam, difficulty, customWords]);

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
  const isCpuTurn = isSolo && currentTeam?.id === cpuRef.current?.id;
  const isTeamFinished = (teamKey: string) => (slotIndexByTeam[teamKey] ?? 0) >= peoplePerTeam;
  const allTeamsFinished = teams.every(t => isTeamFinished(String(t.id)));

  // --- Who is asking, and who answers (phone mode) ---
  const rotatedDevices = (teamKey: string): string[] => {
    const list = connectedByTeam[teamKey] ?? [];
    const stored = askerByTeam[teamKey];
    const at = stored ? list.indexOf(stored) : 0;
    return at <= 0 ? list : [...list.slice(at), ...list.slice(0, at)];
  };
  const teamDevices = connectedByTeam[currentKey] ?? [];
  const askerDeviceId = inputMode === "phone" ? (rotatedDevices(currentKey)[0] ?? null) : null;
  const allDevices = Object.values(connectedByTeam).flat();
  const otherDevices = allDevices.filter(d => !teamDevices.includes(d));
  // Answerers hold the word and the controls: the asking team's other phones, or — if there are
  // none (a one-phone team, or every team is a single student) — everyone else's phones. During the
  // reveal the whole guessing team can move things along. With no answerer phone connected at all,
  // the teacher's screen shows the word and holds the controls instead.
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
    return Math.max(0, QUESTIONS_PER_PERSON - (questionsUsedByTeam[key] ?? 0));
  };

  // --- Turn actions ---
  const advanceAskerFor = (teamKey: string) => {
    const list = connectedByTeam[teamKey] ?? [];
    if (list.length === 0) return;
    const current = rotatedDevices(teamKey)[0];
    const next = list[(list.indexOf(current) + 1) % list.length];
    setAskerByTeam(prev => ({ ...prev, [teamKey]: next }));
  };

  // Finds the next team still short of peoplePerTeam, cycling from just after `fromIndex` — skips
  // any team that's already used up every one of its slots. Returns -1 once every team is done.
  const findNextActiveTeamIndex = (fromIndex: number, slotIndexSnapshot: Record<string, number>): number => {
    for (let step = 1; step <= teams.length; step++) {
      const idx = (fromIndex + step) % teams.length;
      const key = String(teams[idx].id);
      if ((slotIndexSnapshot[key] ?? 0) < peoplePerTeam) return idx;
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

    if (guessed) {
      updateScore(currentTeam.id, POINTS_PER_WORD);
      setWordsByTeam(prev => ({ ...prev, [currentTeam.id]: (prev[currentTeam.id] ?? 0) + 1 }));
      playSound("relay");
      setRevealWord(teamWords[key] ?? "");
      newSlot = prevSlot + 1;
      newUsed = 0;
      swapped = true;
    } else {
      newUsed += 1;
      // Ran out of this person's own 15 without guessing — a safety valve so one stuck word can't
      // stall this team's slot forever; the next teammate takes over instead.
      if (newUsed >= QUESTIONS_PER_PERSON) { newSlot = prevSlot + 1; newUsed = 0; swapped = true; }
    }

    const nextSlotIndexByTeam = { ...slotIndexByTeam, [key]: newSlot };
    const nextNeedsReadyByTeam = swapped ? { ...needsReadyByTeam, [key]: true } : needsReadyByTeam;

    setSlotIndexByTeam(nextSlotIndexByTeam);
    setQuestionsUsedByTeam(prev => ({ ...prev, [key]: newUsed }));
    if (swapped) {
      setNeedsReadyByTeam(nextNeedsReadyByTeam);
      if (newSlot < peoplePerTeam && key !== String(cpuRef.current?.id)) {
        const fresh = drawWord();
        setTeamWords(prev => ({ ...prev, [key]: fresh }));
      }
      advanceAskerFor(key);
    }

    if (guessed) { setPhase("reveal"); return; }
    // A miss always hands off to the next team immediately, same round-robin as any other question
    // — whether or not it also happened to exhaust this team's slot.
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
    teams.forEach((t, i) => {
      const k = String(t.id);
      wordsOut[k] = wordsByTeam[t.id] ?? 0;
      leftOut[k] = phase === "final" ? 0 : questionsLeftFor(i);
      countOut[k] = (connectedByTeam[k] ?? []).length;
      queueOut[k] = rotatedDevices(k);
    });
    const inPlay = phase === "ready" || phase === "asking" || phase === "reveal";
    return {
      phase: mapped,
      roster: teams.map(t => ({ id: t.id, name: t.name, color: t.color, mascot: t.mascot })),
      activeTeamId: inPlay ? (currentTeam?.id ?? null) : null,
      askerDeviceId: inPlay ? askerDeviceId : null,
      askerQueueByTeam: queueOut,
      answererDeviceIds: inPlay ? answererDeviceIds : [],
      currentWord: wordForPayload,
      screenShowsWord,
      phoneCountByTeam: countOut,
      questionsLeftByTeam: leftOut,
      questionsPerTeam: QUESTIONS_PER_PERSON,
      wordsByTeam: wordsOut,
      connectedTeamIds: Array.from(connectedTeamIds),
      ts: Date.now(),
    };
  };

  // Refs the phone-mode channel reads synchronously, so opening/closing the realtime channel only
  // happens when phone mode itself toggles on/off, not on every state change — same pattern as every
  // other phone-mode game. Refreshed every render (no dependency array) so an incoming phone action
  // always calls the latest closure.
  const buildPayloadRef = useRef(buildPayload);
  const sendStateRef = useRef<(() => void) | null>(null);
  const liveRef = useRef({ phase, answererDeviceIds, markGuessed, markMissed, changeWord, continueFromReveal });
  const lastActionAtRef = useRef(0);
  useEffect(() => {
    buildPayloadRef.current = buildPayload;
    liveRef.current = { phase, answererDeviceIds, markGuessed, markMissed, changeWord, continueFromReveal };
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
    });

    // The only place phone input touches game logic — only a current answerer's phone is allowed
    // to act, then the exact same functions a screen click would call.
    channel.on("broadcast", { event: "action" }, ({ payload }) => {
      const action = payload as RelayActionPayload;
      const live = liveRef.current;
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
  }, [phase, teamIndex, slotIndexByTeam, questionsUsedByTeam, teamWords, revealWord, connectedByTeam, askerByTeam, wordsByTeam]);

  useEffect(() => {
    if (phase === "final" && channelRef.current) {
      channelRef.current.send({ type: "broadcast", event: "ended", payload: {} });
    }
  }, [phase]);

  const handlePickPhoneMode = () => {
    setInputMode("phone");
    setSessionCode(generateSessionCode());
    setIntroStep("qr");
  };

  const handlePickScreenMode = () => {
    setInputMode("screen");
    setIntroStep("setup");
    setSessionCode(null);
    setConnectedTeamIds(new Set());
    setConnectedByTeam({});
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

  // Tutorial mockup: src/data/tutorials/relay.tsx — update if this welcome screen's rules text changes.
  if (phase === "welcome") {
    return (
      <div style={{ ...arenaStyle, textAlign: "center" }}>
        {STYLE_TAG}
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ background: "linear-gradient(160deg,#0F766E,#022C22)", border: "2px solid #2DD4BF55", borderRadius: "20px", padding: "28px 24px", marginBottom: "10px", color: "white", maxWidth: "540px", margin: "0 auto 10px", boxShadow: "0 0 50px rgba(13,148,136,0.45)" }}>
            <div style={{ marginBottom: "10px" }}><Icon name="megaphone" size={36} /></div>
            <div style={{ fontWeight: "900", fontSize: "20px", marginBottom: "10px", color: "#5EEAD4" }}>Word Relay</div>
            <div style={{ fontSize: "15px", lineHeight: 1.7, opacity: 0.95 }}>
              {propTeams.length === 1 && peoplePerTeam === 1 ? "Your team has a hidden word. " : "Every team has its own hidden word. "}
              <strong style={{ color: "#5EEAD4" }}>One person from each team comes to the front</strong> and asks yes/no questions to work out what it is — no peeking! Teams take turns asking <strong style={{ color: "#5EEAD4" }}>one question at a time</strong>, round-robin, so nobody's just standing around waiting.
              <br />
              {inputMode === "phone"
                ? "Everyone joins on their own phone. Teammates' phones show the word and answer; the asker's phone never does."
                : "The teacher sees the word and answers each question, then taps whether they guessed it."}
              <br />
              Guess it — or use up your own <strong style={{ color: "#5EEAD4" }}>{QUESTIONS_PER_PERSON} questions</strong> without guessing — and <strong style={{ color: "#5EEAD4" }}>the next teammate swaps in</strong> with a brand new word, so every person on a team gets their own turn at the front. Each word is worth <strong style={{ color: "#5EEAD4" }}>{POINTS_PER_WORD} points</strong> — most words wins.
            </div>
          </div>
          <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap", marginBottom: "18px" }}>
            {teams.map((t, i) => (
              <div key={t.id} style={{ background: t.color.dark, border: "2px solid #1A1A2E", boxShadow: "3px 3px 0 #1A1A2E", borderRadius: "14px", padding: "10px 18px", fontWeight: "800", fontSize: "14px", color: "white", display: "flex", alignItems: "center", gap: "6px" }}>
                {i + 1}. <TeamIcon team={t} color="white" /> {t.name}
              </div>
            ))}
          </div>

          {/* Applies uniformly to every team (the teacher's own explicit call, not a per-team
              roster) — a small team finishing before a big one is the deliberate tradeoff of
              keeping this a single setting instead of one per team. */}
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

          {/* Skipped entirely for a Class Check-In sitting — presetPhoneSession already picked
              phone mode and its code, and the class-level QR already covered joining. Gated by the
              REAL team count, not the CPU-augmented one — the CPU can never hold a phone. */}
          {propTeams.length > 1 && !presetPhoneSession && (
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
                const joinUrl = `${window.location.origin}${window.location.pathname}?join=${sessionCode}&game=relay`;
                const phoneCountByTeam: Record<string, number> = {};
                teams.forEach(t => { phoneCountByTeam[String(t.id)] = (connectedByTeam[String(t.id)] ?? []).length; });
                return (
                  <PhoneJoinPanel
                    sessionCode={sessionCode} joinUrl={joinUrl} teams={teams} connectedTeamIds={connectedTeamIds}
                    phoneCountByTeam={phoneCountByTeam}
                    accent="#5EEAD4" panelBg="linear-gradient(160deg,#0F766E,#022C22)" borderColor="#2DD4BF66"
                    footer={
                      <>
                        <div style={{ fontSize: "12px", color: "#99F6E4", marginBottom: "8px", lineHeight: 1.5 }}>
                          Every student can join on their own phone — pick the same team to share it.
                        </div>
                        <button onClick={handlePickScreenMode} style={{ background: "none", border: "none", color: "#99F6E499", fontSize: "12px", fontWeight: "700", cursor: "pointer", textDecoration: "underline" }}>
                          Switch back to Play on Screen
                        </button>
                      </>
                    }
                  />
                );
              })()}
            </>
          )}

          {wordListToggle}
          <button onClick={() => setShowHowTo(true)} className="rl-btn" style={{ display: "inline-flex", alignItems: "center", gap: "6px", marginBottom: "14px", background: "rgba(255,255,255,0.95)", color: GM.color, border: `2px solid ${GM.color}`, boxShadow: "0 2px 8px rgba(0,0,0,0.18)", borderRadius: "12px", padding: "10px 24px", fontSize: "14px", fontWeight: "800", cursor: "pointer" }}>
            <Icon name="help" size={15} /> How to Play
          </button>
          {showHowTo && (
            <HowToPlayModal
              gameName={GM.name} gameIcon={GAME_ICONS[GM.id]} accentColor={GM.color}
              steps={RELAY_TUTORIAL_STEPS}
              onClose={() => setShowHowTo(false)}
            />
          )}
          <button
            onClick={() => {
              // Consumes team 0's own needsReady flag right here, same as goToNextTeam does for
              // every later hand-off — otherwise this first team's SECOND turn (no swap in between)
              // would spuriously show "send someone up" again for the same person still standing.
              setNeedsReadyByTeam(prev => ({ ...prev, [currentKey]: false }));
              setPhase(phoneFlow ? "asking" : "ready");
            }}
            className="rl-btn"
            style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "#0D9488", color: "white", border: "3px solid #1A1A2E", borderRadius: "16px", padding: "16px 48px", fontSize: "19px", fontWeight: "900", cursor: "pointer", boxShadow: "6px 6px 0 #1A1A2E" }}
          >
            <Icon name="megaphone" size={20} /> Let's Play!
          </button>
        </div>
      </div>
    );
  }

  if (phase === "final") {
    const ranking = denseRank(teams, t => (wordsByTeam[t.id] ?? 0) * POINTS_PER_WORD).sort((a, b) => b.value - a.value);
    const winners = ranking.filter(r => r.rank === 0);
    const isTie = winners.length > 1;
    const headline = isTie
      ? `${winners.map(w => w.item.name).join(" & ")} tied for the most words guessed!`
      : `${winners[0]?.item.name} guessed the most words!`;
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
            <div style={{ color: "#5EEAD4", fontSize: "14px" }}>{wordsByTeam[t.id] ?? 0} words</div>
            {peoplePerTeam > 1 && <div style={{ opacity: 0.85, fontWeight: "700" }}>Person {Math.min((slotIndexByTeam[key] ?? 0) + 1, peoplePerTeam)} of {peoplePerTeam}</div>}
            <div style={{ opacity: 0.8, fontWeight: "700" }}>{finished ? "Done" : `${questionsLeftFor(i)} questions left`}</div>
          </div>
        );
      })}
    </div>
  );

  const askerLabel = inputMode === "phone" && askerDeviceId
    ? `Asker: phone ${teamDevices.indexOf(askerDeviceId) + 1} of ${teamDevices.length}`
    : null;
  const currentSlotNumber = Math.min((slotIndexByTeam[currentKey] ?? 0) + 1, peoplePerTeam);
  const currentQuestionNumber = Math.min((questionsUsedByTeam[currentKey] ?? 0) + 1, QUESTIONS_PER_PERSON);

  return (
    <div style={arenaStyle}>
      {STYLE_TAG}
      {/* Suppressed for a Class Check-In sitting — the class-level badge (LessonGamesGenerator.tsx's
          renderClassCheckInBadge) is the only floating reconnect button shown then, and it's the
          only one pointing at the right (class, not per-game) join URL. */}
      {inputMode === "phone" && sessionCode && !presetPhoneSession && (
        <PhoneReconnectBadge
          sessionCode={sessionCode} joinUrl={`${window.location.origin}${window.location.pathname}?join=${sessionCode}&game=relay`}
          teams={teams} connectedTeamIds={connectedTeamIds}
          phoneCountByTeam={Object.fromEntries(teams.map(t => [String(t.id), (connectedByTeam[String(t.id)] ?? []).length]))}
          accent="#5EEAD4" panelBg="linear-gradient(160deg,#0F766E,#022C22)" borderColor="#2DD4BF66"
        />
      )}
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ background: "#134E4A", border: "3px solid #1A1A2E", borderRadius: "14px", padding: "14px 16px", marginBottom: "16px", textAlign: "center", color: "white", boxShadow: "4px 4px 0 #1A1A2E" }}>
          <div style={{ fontWeight: "900", fontSize: "18px" }}><TeamIcon team={currentTeam} /> {currentTeam.name}'s turn</div>
          <div style={{ fontWeight: "800", fontSize: "13px", opacity: 0.9, marginTop: "4px" }}>
            {peoplePerTeam > 1 ? `Person ${currentSlotNumber} of ${peoplePerTeam} · ` : ""}Question {currentQuestionNumber} of {QUESTIONS_PER_PERSON}{askerLabel ? ` · ${askerLabel}` : ""}
          </div>
        </div>

        {phase === "ready" && (
          <div style={{ background: "#022C22", border: "4px solid #1A1A2E", borderRadius: "22px", padding: "32px 18px", textAlign: "center", boxShadow: "6px 6px 0 #1A1A2E" }}>
            <div style={{ fontSize: "40px", marginBottom: "8px" }}>🙋</div>
            <div style={{ fontWeight: "900", fontSize: "22px", color: "#5EEAD4", marginBottom: "8px" }}>{currentTeam.name}: send someone up!</div>
            <div style={{ color: "#CCFBF1", fontSize: "15px", fontWeight: "600", lineHeight: 1.6, maxWidth: "460px", margin: "0 auto 20px" }}>
              Whoever is asking steps to the front and <strong>faces away from the screen</strong>. When they're ready, show the word to the teacher and the class.
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
              <div style={{ position: "absolute", top: "10px", right: "10px" }}>
                <FlagPromptButton gameId="relay" questionData={{ raw: teamWords[currentKey] }} />
              </div>
              <div style={{ color: "#5EEAD4", fontWeight: "800", fontSize: "13px", textTransform: "uppercase", marginBottom: "10px" }}>The hidden word — asker faces away!</div>
              <div key={teamWords[currentKey]} style={{ background: "rgba(0,0,0,0.35)", borderRadius: "18px", border: "3px solid #14B8A655", padding: "24px 12px", color: "#F0FDFA", fontWeight: "900", fontSize: "clamp(36px,9vw,72px)", lineHeight: 1.05, minHeight: "120px", display: "flex", alignItems: "center", justifyContent: "center", overflowWrap: "anywhere", textShadow: "0 0 18px rgba(45,212,191,0.6)", animation: "rlWordPop 0.25s ease-out" }}>
                {teamWords[currentKey]}
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: "12px" }}>
              <button onClick={markGuessed} className="rl-btn" style={bigBtn("#22C55E")}>Guessed it! +{POINTS_PER_WORD}</button>
              <button onClick={markMissed} className="rl-btn" style={bigBtn("rgba(0,0,0,0.3)", "#5EEAD4")}>Not yet →</button>
            </div>
            <div style={{ textAlign: "center", marginTop: "10px" }}>
              <button onClick={changeWord} style={{ background: "none", border: "none", color: "#99F6E499", fontSize: "12px", fontWeight: "700", cursor: "pointer", textDecoration: "underline" }}>Change this word</button>
            </div>
          </>
        ) : (
          <div style={{ background: "#022C22", border: "3px dashed #0D9488", borderRadius: "22px", padding: "34px 18px", textAlign: "center" }}>
            <div style={{ marginBottom: "10px" }}><Icon name="phone" size={34} /></div>
            <div style={{ fontWeight: "900", fontSize: "18px", color: "#5EEAD4", marginBottom: "6px" }}>Asking time!</div>
            <div style={{ color: "#99F6E4", fontSize: "14px", fontWeight: "600", lineHeight: 1.5 }}>
              The asker is at the front asking yes/no questions. The word is on the answering phones — it isn't shown here.
            </div>
          </div>
        ))}

        {phase === "reveal" && isCpuTurn && (
          <div style={{ background: "#022C22", border: "4px solid #6B7280", borderRadius: "22px", padding: "28px 18px", textAlign: "center", boxShadow: "6px 6px 0 #1A1A2E" }}>
            <div style={{ fontSize: "40px", marginBottom: "6px" }}>🤖</div>
            <div style={{ color: "#5EEAD4", fontWeight: "800", fontSize: "13px", textTransform: "uppercase" }}>CPU guessed it! +{POINTS_PER_WORD}</div>
          </div>
        )}

        {phase === "reveal" && !isCpuTurn && (
          <div style={{ background: "#022C22", border: "4px solid #22C55E", borderRadius: "22px", padding: "28px 18px", textAlign: "center", boxShadow: "6px 6px 0 #1A1A2E" }}>
            <div style={{ fontSize: "40px", marginBottom: "6px" }}>🎉</div>
            <div style={{ color: "#5EEAD4", fontWeight: "800", fontSize: "13px", textTransform: "uppercase", marginBottom: "8px" }}>{currentTeam.name} guessed it! +{POINTS_PER_WORD}</div>
            {screenShowsWord && (
              <div style={{ fontWeight: "900", fontSize: "clamp(32px,8vw,60px)", color: "#F0FDFA", lineHeight: 1.1, marginBottom: "10px", overflowWrap: "anywhere" }}>{revealWord}</div>
            )}
            <div style={{ color: "#CCFBF1", fontSize: "16px", fontWeight: "800", marginBottom: "18px" }}>
              {inputMode === "phone" && askerDeviceId
                ? "Time to swap — the next phone in line takes over next turn!"
                : `Time to swap — someone new from ${currentTeam.name} takes over next turn!`}
            </div>
            {screenShowsWord ? (
              <button onClick={continueFromReveal} className="rl-btn" style={bigBtn("#0D9488")}>{allTeamsFinished ? "See final results" : "Next team →"}</button>
            ) : (
              <div style={{ color: "#99F6E4", fontSize: "13px", fontWeight: "600" }}>A teammate taps "Next team" on their phone to keep going.</div>
            )}
          </div>
        )}

        {scoreStrip}
      </div>
    </div>
  );
}
