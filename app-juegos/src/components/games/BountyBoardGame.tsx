import { useState, useRef, useCallback, useEffect, useMemo } from "react";
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
import { BOUNTYBOARD_TUTORIAL_STEPS } from "../../data/tutorials/bountyboard";
import { playSound } from "../../lib/sounds";
import { setMusicGame, setMusicContext, stopMusic } from "../../lib/music";
import { makeSoloCpuTeam } from "../../lib/soloOpponent";
import { useTurnTimer } from "../../hooks/useTurnTimer";
import { TurnTimerBar } from "../shared/TurnTimerBar";
import {
  generateSessionCode, openBountyBoardChannel, closeChannel,
  type BountyBoardPhase, type BountyBoardStatePayload, type BountyBoardActionPayload,
  type Bounty, type BountyRoundEntry,
} from "../../lib/liveSession";

const GM = GAME_MODES.find(g => g.id === "bounty")!;

// Base payout for a correct answer on the first try — every escalation is a whole multiple of
// this (V, 2V, 3V, 4V…), never compounding off the previous value. Matches Order Up's own
// single-item baseline (ORDER_SCORE_BY_ITEM_COUNT[1]).
const BOUNTY_VALUE = 10;
// Bounded by however many distinct "use vocabulary in a sentence" prompts the selected topics
// actually yield — a narrow topic selection shouldn't force 8 rounds out of a 3-item pool.
const MAX_ROUNDS = 8;

// Solo only — how long an open bounty sits unclaimed before the CPU steals it (see the steal-timer
// effect below). Generous compared to every other game's CPU delay constants on purpose: this
// window has to cover a player noticing the bounty and deciding to claim it, not a quick zone-pick
// or dice roll — Vault Heist's own CPU_ANSWER_MS_BY_DIFFICULTY is milliseconds for the same reason
// those games' CPU turns are near-instant, which this one deliberately isn't.
type Difficulty = "easy" | "medium" | "hard";
const CPU_STEAL_SECONDS_BY_DIFFICULTY: Record<Difficulty, number> = { easy: 20, medium: 12, hard: 6 };

// Solo only — the CPU now also submits its own round entry every round, same as a real second
// team would (previously it only ever reacted to the human's mistakes, which read as a watered-
// down version of the real game per direct teacher feedback). Higher = CPU gets it wrong more
// often, same "easy is more generous" direction as every other difficulty tunable in this file.
// Its wrong entries reuse real "correct grammar mistakes" content (question = the broken
// sentence, answer = the fix) rather than fabricating language — the exact content type
// Battleship already draws from, not a new authoring project.
const CPU_WRONG_CHANCE_BY_DIFFICULTY: Record<Difficulty, number> = { easy: 0.45, medium: 0.3, hard: 0.15 };
// Random spread before the CPU's own entry resolves each round — writes "at the same time" as the
// student per the game's own flavor text, not instantly, so it doesn't read as a scripted reveal.
const CPU_ENTRY_DELAY_MS = { min: 3000, max: 8000 };

type Phase = "intro" | "playing" | "final";
type Banner = { text: React.ReactNode; kind: "success" | "wrong"; key: number };

const STYLE_TAG = (
  <style>{`
    @keyframes bbPosterIn{0%{opacity:0;transform:translateY(14px) scale(0.94)}100%{opacity:1;transform:translateY(0) scale(1)}}
    @keyframes bbBannerIn{0%{opacity:0;transform:translate(-50%,-16px) scale(0.9)}15%{opacity:1;transform:translate(-50%,0) scale(1.03)}25%{transform:translate(-50%,0) scale(1)}85%{opacity:1;transform:translate(-50%,0) scale(1)}100%{opacity:0;transform:translate(-50%,-10px) scale(0.96)}}
    @keyframes bbUrgentPulse{0%,100%{opacity:1}50%{opacity:0.6}}
    .bb-btn:hover:not(:disabled){filter:brightness(1.08)}
    .bb-btn:active:not(:disabled){transform:translate(3px,3px) !important;box-shadow:0 0 0 #1A1A2E !important}
  `}</style>
);

// A hand-painted wooden "Bounty Board" header — parchment posters pinned to a saloon board, not a
// kitchen or courtroom, so this game reads as its own place the moment it opens.
function BoardHeader() {
  return (
    <div style={{ maxWidth: "700px", margin: "0 auto 16px", borderRadius: "10px", overflow: "hidden", boxShadow: "0 6px 18px rgba(120,53,15,0.25)" }}>
      <div style={{ height: "10px", background: "repeating-linear-gradient(90deg,#78350F 0 10px,#92400E 10px 20px)" }} />
      <div style={{ background: "linear-gradient(180deg,#F5E6C8,#EBD9AE)", padding: "8px 16px", textAlign: "center", border: "2px solid #78350F", borderTop: "none" }}>
        <span style={{ fontWeight: "900", fontSize: "14px", color: "#78350F", letterSpacing: "0.03em", display: "inline-flex", alignItems: "center", gap: "6px" }}><Icon name="sheriffStar" size={14} /> BOUNTY BOARD</span>
      </div>
    </div>
  );
}

function formatValue(v: number): string {
  return `💰 ${v} pts`;
}

// Hand-in-to-the-teacher mode only: teams write their sentence down (still a writing game), tell it
// to the teacher, and the teacher types what the team wrote so the WHOLE class can read it on the
// board, and only then rules right or wrong — the same order typing mode already gets for free
// (the phone's submission is on screen before Correct/Wrong appear). Posting an empty field is
// blocked so a wrong answer never becomes a bounty with nothing for the next team to correct.
function PostToBoardPrompt({ value, onChange, onPost, placeholder }: { value: string; onChange: (text: string) => void; onPost: () => void; placeholder: string }) {
  return (
    <div style={{ background: "white", border: "1px dashed #B45309", borderRadius: "8px", padding: "8px" }}>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={2}
        style={{ width: "100%", boxSizing: "border-box", border: "1px solid #FDE68A", borderRadius: "6px", padding: "6px 8px", fontSize: "12px", fontFamily: "inherit", resize: "vertical" }}
      />
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "6px" }}>
        <button onClick={onPost} disabled={!value.trim()} className="bb-btn" style={{ background: value.trim() ? "#B45309" : "#D1D5DB", color: "white", border: "2px solid #1A1A2E", borderRadius: "8px", padding: "5px 12px", fontSize: "11px", fontWeight: "800", cursor: value.trim() ? "pointer" : "not-allowed" }}>Post to board</button>
      </div>
    </div>
  );
}

// The card for a team's ORIGINAL round submission — every team gets exactly one of these each
// round (unlike a Bounty card, there's no claiming step here, it's always that team's own attempt).
// Disappears once resolved OR once it's spawned an open bounty (from that point on, the Bounty
// section is the live thing to look at for this team's entry).
function RoundEntryCard({ entry, team, answerMode, isPhoneMode, onPost, onCorrect, onWrong }: {
  entry: BountyRoundEntry;
  team: GameProps["teams"][number] | undefined;
  answerMode: "spoken" | "typing";
  isPhoneMode: boolean;
  onPost: (text: string) => void;
  onCorrect: () => void;
  onWrong: (text: string) => void;
}) {
  const [draft, setDraft] = useState("");
  const spoken = answerMode === "spoken";
  const ready = entry.text.trim() !== "";

  return (
    <div style={{
      position: "relative", width: "230px", background: "linear-gradient(160deg,#FFFBEB,#FEF3C7)", border: "2px solid #D97706",
      borderRadius: "12px", padding: "12px", textAlign: "center", animation: "bbPosterIn 0.4s ease-out",
      boxShadow: "0 4px 14px rgba(180,83,9,0.18)",
    }}>
      <div style={{ position: "absolute", top: "6px", right: "6px" }}>
        <FlagPromptButton gameId="bounty" questionData={{ teamId: entry.teamId, text: entry.text }} />
      </div>
      <div style={{ fontSize: "12px", fontWeight: "800", color: team?.color.dark ?? "#78350F", marginBottom: "8px" }}>
        <TeamIcon team={team} /> {team?.name ?? "Team"}
      </div>

      {!ready ? (
        spoken
          ? <PostToBoardPrompt value={draft} onChange={setDraft} onPost={() => onPost(draft.trim())} placeholder="Type what the team wrote, so the class can read it…" />
          : isPhoneMode
            ? <div style={{ fontSize: "11px", fontWeight: "700", color: "#92400E", padding: "8px 0", display: "inline-flex", alignItems: "center", gap: "4px" }}><Icon name="pencil" size={11} /> Typing on their phone…</div>
            : <div style={{ fontSize: "11px", fontWeight: "700", color: "#92400E", padding: "8px 0" }}>Waiting…</div>
      ) : (
        <>
          <div style={{ background: "white", border: "1px solid #FDE68A", borderRadius: "8px", padding: "8px 10px", margin: "0 0 8px", fontSize: "16px", fontWeight: "800", color: "#78350F", lineHeight: 1.35 }}>
            “{entry.text}”
          </div>
          {spoken && (
            <button onClick={() => { setDraft(entry.text); onPost(""); }} className="bb-btn" style={{ background: "none", border: "none", color: "#9CA3AF", fontSize: "11px", fontWeight: "700", cursor: "pointer", marginBottom: "6px", textDecoration: "underline" }}>Edit</button>
          )}
          <div style={{ display: "flex", gap: "6px", justifyContent: "center" }}>
            <button onClick={onCorrect} className="bb-btn" style={{ display: "inline-flex", alignItems: "center", gap: "5px", background: "#22C55E", color: "white", border: "2px solid #1A1A2E", borderRadius: "10px", padding: "8px 12px", fontSize: "13px", fontWeight: "700", cursor: "pointer", boxShadow: "3px 3px 0 #1A1A2E" }}><Icon name="check" size={13} /> Correct</button>
            <button
              onClick={() => onWrong(entry.text)}
              className="bb-btn"
              style={{ display: "inline-flex", alignItems: "center", gap: "5px", background: "#EF4444", color: "white", border: "2px solid #1A1A2E", borderRadius: "10px", padding: "8px 12px", fontSize: "13px", fontWeight: "700", cursor: "pointer", boxShadow: "3px 3px 0 #1A1A2E" }}
            ><Icon name="close" size={12} /> Wrong</button>
          </div>
        </>
      )}
    </div>
  );
}

// Solo only — the CPU's own round entry, alongside the human's RoundEntryCard. Purely a "writing"
// poster with no interaction: resolution happens automatically (see the effect in the main
// component, right after resolveRoundWrong) via a hidden dice roll, never a teacher click, since
// there's no real CPU sentence for anyone to judge — just a wait, then this card disappears the
// same way a resolved human entry does (correct) or turns into a real bounty (wrong).
function CpuRoundEntryCard({ team }: { team: GameProps["teams"][number] | undefined }) {
  return (
    <div style={{
      position: "relative", width: "230px", background: "linear-gradient(160deg,#FFFBEB,#FEF3C7)", border: "2px solid #D97706",
      borderRadius: "12px", padding: "12px", textAlign: "center", animation: "bbPosterIn 0.4s ease-out",
      boxShadow: "0 4px 14px rgba(180,83,9,0.18)",
    }}>
      <div style={{ fontSize: "12px", fontWeight: "800", color: team?.color.dark ?? "#78350F", marginBottom: "8px" }}>
        <TeamIcon team={team} /> {team?.name ?? "CPU"}
      </div>
      <div style={{ fontSize: "11px", fontWeight: "700", color: "#92400E", padding: "8px 0", display: "inline-flex", alignItems: "center", gap: "4px" }}>
        <Icon name="robot" size={11} /> Writing…
      </div>
    </div>
  );
}

// A wanted poster for an open (or being-fixed) bounty. `claimableTeams` already has the exclusion
// rule (and the solo-play fallback) baked in by the caller — this component just renders whatever
// list it's handed.
function BountyCard({ bounty, team, claimableTeams, answerMode, isPhoneMode, onClaim, onPostFix, onCorrect, onWrong, cpuSteal }: {
  bounty: Bounty;
  team: GameProps["teams"][number] | undefined; // the claiming team, once claimed
  claimableTeams: GameProps["teams"];
  answerMode: "spoken" | "typing";
  isPhoneMode: boolean;
  onClaim: (teamId: string | number) => void;
  onPostFix: (text: string) => void;
  onCorrect: () => void;
  onWrong: (text: string) => void;
  // Solo only — the CPU's own countdown to steal THIS bounty, shown so the threat is visible
  // rather than a silent trap. Absent once claimed (the race is over either way by then).
  cpuSteal?: { timeLeft: number; totalSeconds: number };
}) {
  const [draft, setDraft] = useState("");
  const spoken = answerMode === "spoken";
  const claimed = bounty.claimedBy !== undefined;
  const ready = claimed && (bounty.fixText ?? "").trim() !== "";

  return (
    <div style={{
      position: "relative", width: "240px", background: "linear-gradient(160deg,#FEF2F2,#FEE2E2)", border: "3px double #7F1D1D",
      borderRadius: "10px", padding: "12px", textAlign: "center", animation: "bbPosterIn 0.4s ease-out",
      boxShadow: "0 4px 16px rgba(127,29,29,0.22)",
    }}>
      <div style={{ fontSize: "10px", fontWeight: "900", color: "#7F1D1D", letterSpacing: "0.08em", marginBottom: "4px" }}>WANTED — CORRECTED</div>
      <div style={{ background: "white", border: "1px dashed #FCA5A5", borderRadius: "8px", padding: "6px 8px", margin: "0 0 6px", fontSize: "12px", fontWeight: "700", color: "#7F1D1D" }}>
        “{bounty.wrongText}”
      </div>
      <div style={{ fontWeight: "900", fontSize: "15px", color: "#B91C1C", marginBottom: "8px", animation: bounty.missCount >= 2 ? "bbUrgentPulse 1s ease-in-out infinite" : "none" }}>{formatValue(bounty.value)}</div>

      {!claimed ? (
        isPhoneMode ? (
          <div style={{ fontSize: "11px", fontWeight: "700", color: "#991B1B", padding: "6px 0" }}>Waiting for a team to claim on their phone…</div>
        ) : (
          <>
            {claimableTeams.length > 0 ? (
              <div style={{ display: "flex", gap: "4px", justifyContent: "center", flexWrap: "wrap" }}>
                {claimableTeams.map(t => (
                  <button key={t.id} onClick={() => onClaim(t.id)} className="bb-btn" style={{ background: t.color.bg, color: "white", border: "none", borderRadius: "8px", padding: "5px 9px", fontSize: "11px", fontWeight: "800", cursor: "pointer" }}><TeamIcon team={t} color="white" /> {t.name}</button>
                ))}
              </div>
            ) : !cpuSteal ? (
              <div style={{ fontSize: "11px", fontWeight: "700", color: "#991B1B", padding: "6px 0" }}>No eligible team yet</div>
            ) : null}
            {cpuSteal && (
              <div style={{ marginTop: claimableTeams.length > 0 ? "8px" : 0 }}>
                <div style={{ fontSize: "10px", fontWeight: "800", color: "#991B1B", marginBottom: "4px" }}><Icon name="robot" size={10} /> CPU is closing in…</div>
                <TurnTimerBar timeLeft={cpuSteal.timeLeft} totalSeconds={cpuSteal.totalSeconds} />
              </div>
            )}
          </>
        )
      ) : (
        <>
          <div style={{ fontSize: "11px", fontWeight: "800", color: team?.color.dark ?? "#7F1D1D", marginBottom: "6px" }}><TeamIcon team={team} /> {team?.name} is fixing it</div>
          {!ready ? (
            spoken
              ? <PostToBoardPrompt value={draft} onChange={setDraft} onPost={() => onPostFix(draft.trim())} placeholder="Type the fixed sentence they wrote, so the class can read it…" />
              : isPhoneMode
                ? <div style={{ fontSize: "11px", fontWeight: "700", color: "#991B1B", padding: "4px 0", display: "inline-flex", alignItems: "center", gap: "4px" }}><Icon name="pencil" size={11} /> Typing a fix…</div>
                : <div style={{ fontSize: "11px", fontWeight: "700", color: "#991B1B", padding: "4px 0" }}>Waiting…</div>
          ) : (
            <>
              <div style={{ background: "white", border: "1px solid #FCA5A5", borderRadius: "8px", padding: "8px 10px", margin: "0 0 8px", fontSize: "15px", fontWeight: "800", color: "#7F1D1D", lineHeight: 1.35 }}>
                “{bounty.fixText}”
              </div>
              {spoken && (
                <button onClick={() => { setDraft(bounty.fixText ?? ""); onPostFix(""); }} className="bb-btn" style={{ background: "none", border: "none", color: "#9CA3AF", fontSize: "11px", fontWeight: "700", cursor: "pointer", marginBottom: "6px", textDecoration: "underline" }}>Edit</button>
              )}
              <div style={{ display: "flex", gap: "6px", justifyContent: "center" }}>
                <button onClick={onCorrect} className="bb-btn" style={{ display: "inline-flex", alignItems: "center", gap: "5px", background: "#22C55E", color: "white", border: "2px solid #1A1A2E", borderRadius: "10px", padding: "8px 12px", fontSize: "13px", fontWeight: "700", cursor: "pointer", boxShadow: "3px 3px 0 #1A1A2E" }}><Icon name="check" size={13} /> Correct</button>
                <button
                  onClick={() => onWrong(bounty.fixText ?? "")}
                  className="bb-btn"
                  style={{ display: "inline-flex", alignItems: "center", gap: "5px", background: "#EF4444", color: "white", border: "2px solid #1A1A2E", borderRadius: "10px", padding: "8px 12px", fontSize: "13px", fontWeight: "700", cursor: "pointer", boxShadow: "3px 3px 0 #1A1A2E" }}
                ><Icon name="close" size={12} /> Wrong</button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

// Resume restarts the CURRENT round fresh (new prompt drawn, no attempt to reconstruct in-flight
// bounties) — same philosophy as Order Up's own snapshot, which never tries to restore exact
// mid-flight tickets/timers either. Only round-level/score-level state survives.
type BountyBoardSnapshot = {
  answerMode: "spoken" | "typing";
  roundNumber: number;
  gameScoreByTeam: Record<string | number, number>;
  // Solo only.
  cpuScore?: number;
  difficulty?: Difficulty;
};

function validateBountyBoardSnapshot(raw: unknown): BountyBoardSnapshot | undefined {
  const s = raw as Partial<BountyBoardSnapshot> | null | undefined;
  if (!s) return undefined;
  if (s.answerMode !== "spoken" && s.answerMode !== "typing") return undefined;
  if (typeof s.roundNumber !== "number" || s.roundNumber < 0) return undefined;
  const difficulty = s.difficulty === "easy" || s.difficulty === "hard" ? s.difficulty : "medium";
  return { answerMode: s.answerMode, roundNumber: s.roundNumber, gameScoreByTeam: s.gameScoreByTeam ?? {}, cpuScore: s.cpuScore ?? 0, difficulty };
}

export function BountyBoardGame({ questions, teams: propTeams, onUpdateScore, onEnd, forceFinalRef, serializeStateRef, initialGameState, presetPhoneSession }: GameProps) {
  const resumed = useRef(validateBountyBoardSnapshot(initialGameState)).current;
  const isSolo = propTeams.length === 1;
  // Constructed unconditionally so its identity never changes across renders regardless of
  // `isSolo` (a useRef initializer only runs once at mount) — same idiom as King of Hill's cpuRef.
  const cpuRef = useRef(isSolo ? makeSoloCpuTeam() : null);
  const [cpuScore, setCpuScore] = useState(() => resumed?.cpuScore ?? 0);
  const [difficulty, setDifficulty] = useState<Difficulty>(() => resumed?.difficulty ?? "medium");
  // Every render/ranking/scoring codepath below reads `teams`, not `propTeams` — this is the one
  // change that makes the CPU show up everywhere (team grid, scoreboard, final ranking, and the
  // claimableTeams exclusion logic, which already treats the CPU as a genuine second team with no
  // further changes needed).
  const teams = useMemo(
    () => (isSolo ? [propTeams[0], { ...cpuRef.current!, score: cpuScore }] : propTeams),
    [isSolo, propTeams, cpuScore]
  );
  // Routes a score change to the CPU's own local state instead of the real onUpdateScore prop —
  // callers must never pass the CPU's id to onUpdateScore directly (see soloOpponent.ts).
  const updateScore = (teamId: string | number, delta: number) => {
    if (isSolo && teamId === cpuRef.current?.id) setCpuScore(s => s + delta);
    else onUpdateScore(teamId, delta);
  };

  // Rocket Fuel's content-pool pattern, not Order Up's — one content type, filtered with a
  // graceful fallback to the full pool if a topic selection has none.
  const pool = useRef((() => {
    const uvs = questions.filter(q => q.type === "use vocabulary in a sentence");
    const finalPool = uvs.length ? uvs : questions;
    return [...finalPool].sort(() => Math.random() - 0.5);
  })()).current;
  const totalRounds = Math.min(MAX_ROUNDS, Math.max(1, pool.length));
  // Solo only — same idiom as `pool` above, but for the CPU's own round entries (see
  // CPU_WRONG_CHANCE_BY_DIFFICULTY). Empty for a topic selection with no "correct grammar
  // mistakes" content at all (rare) — the CPU simply never rolls wrong in that case, same
  // graceful-fallback spirit as `pool`'s own empty-uvs case.
  const cgmPool = useRef((() => {
    const cgm = questions.filter((q): q is typeof q & { question: string } => q.type === "correct grammar mistakes" && !!q.question);
    return [...cgm].sort(() => Math.random() - 0.5);
  })()).current;

  const [phase, setPhase] = useState<Phase>(resumed ? "playing" : "intro");
  const [showHowTo, setShowHowTo] = useState(false);
  const [roundNumber, setRoundNumber] = useState(resumed?.roundNumber ?? 0);
  const [roundEntries, setRoundEntries] = useState<BountyRoundEntry[]>([]);
  const [bounties, setBounties] = useState<Bounty[]>([]);
  const [gameScoreByTeam, setGameScoreByTeam] = useState<Record<string | number, number>>(() => resumed?.gameScoreByTeam ?? {});
  const [banner, setBanner] = useState<Banner | null>(null);

  const [inputMode, setInputMode] = useState<"screen" | "phone">(presetPhoneSession ? "phone" : "screen");
  const [introStep, setIntroStep] = useState<"setup" | "qr">("setup");
  const [sessionCode, setSessionCode] = useState<string | null>(presetPhoneSession?.code ?? null);
  const [connectedTeamIds, setConnectedTeamIds] = useState<Set<string | number>>(new Set());
  const [answerMode, setAnswerMode] = useState<"spoken" | "typing">(resumed?.answerMode ?? "spoken");
  const channelRef = useRef<RealtimeChannel | null>(null);

  const bountyIdRef = useRef(0);
  const bannerIdRef = useRef(0);

  const pushBanner = useCallback((text: React.ReactNode, kind: Banner["kind"]) => {
    const key = bannerIdRef.current++;
    setBanner({ text, kind, key });
    setTimeout(() => setBanner(prev => (prev?.key === key ? null : prev)), 2400);
  }, []);

  const currentPrompt = pool[roundNumber % pool.length];

  // The CPU's own round entry, alongside every real team's — see CPU_WRONG_CHANCE_BY_DIFFICULTY.
  // `submitted`/`text` are irrelevant for it (a dedicated card renders it, never RoundEntryCard),
  // only `resolved` matters, for `roundComplete` to correctly wait on it like any other entry.
  const seedRoundEntries = (): BountyRoundEntry[] => {
    const entries = propTeams.map(t => ({ teamId: t.id, text: "", submitted: answerMode === "spoken", resolved: false }));
    if (isSolo && cpuRef.current) entries.push({ teamId: cpuRef.current.id, text: "", submitted: true, resolved: false });
    return entries;
  };

  // Seeds the very first round (fresh start OR resume, both start with an empty roundEntries) the
  // moment play begins — every LATER round is seeded by goToNextRound below instead.
  useEffect(() => {
    if (phase !== "playing" || roundEntries.length > 0) return;
    setRoundEntries(seedRoundEntries());
    setBounties([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  useEffect(() => {
    if (phase === "final") { playSound("roundComplete"); stopMusic(); }
  }, [phase]);
  useEffect(() => {
    setMusicGame("bounty");
    return () => setMusicGame(null);
  }, []);
  // The intro screen rides the shared gameplay track; play switches to the "tension" context so a
  // different track starts the moment the game actually begins (same idiom as Hot Seat). Once a
  // Western track is uploaded, add a `bounty: { tension }` entry in music.ts's GAME_OVERRIDES.
  useEffect(() => {
    if (phase === "playing") setMusicContext("tension");
    return () => setMusicContext("gameplay");
  }, [phase]);

  useEffect(() => {
    if (!forceFinalRef) return;
    forceFinalRef.current = phase === "final" ? null : () => { setPhase("final"); return true; };
    return () => { if (forceFinalRef) forceFinalRef.current = null; };
  }, [forceFinalRef, phase]);

  useEffect(() => {
    if (!serializeStateRef) return;
    serializeStateRef.current = (): BountyBoardSnapshot => ({ answerMode, roundNumber, gameScoreByTeam, cpuScore, difficulty });
    return () => { if (serializeStateRef) serializeStateRef.current = null; };
  }, [serializeStateRef, answerMode, roundNumber, gameScoreByTeam, cpuScore, difficulty]);

  const submitRoundEntry = (teamId: string | number, text: string) => {
    setRoundEntries(prev => prev.map(e => (e.teamId === teamId ? { ...e, text, submitted: true } : e)));
  };

  const resolveRoundCorrect = (teamId: string | number) => {
    updateScore(teamId, BOUNTY_VALUE);
    setGameScoreByTeam(prev => ({ ...prev, [teamId]: (prev[teamId] ?? 0) + BOUNTY_VALUE }));
    setRoundEntries(prev => prev.map(e => (e.teamId === teamId ? { ...e, resolved: true } : e)));
    playSound("bounty");
    const team = teams.find(t => t.id === teamId);
    pushBanner(<><Icon name="check" size={14} /> <TeamIcon team={team} color="white" /> {team?.name ?? "A team"} got it! +{BOUNTY_VALUE} pts</>, "success");
  };

  const resolveRoundWrong = (teamId: string | number, wrongText: string) => {
    const id = bountyIdRef.current++;
    const value = BOUNTY_VALUE * 2;
    setBounties(prev => [...prev, { id, originalTeamId: teamId, wrongText, value, missCount: 1, excludedTeamId: teamId, claimedBy: undefined, resolved: false }]);
    const team = teams.find(t => t.id === teamId);
    pushBanner(<><Icon name="warning" size={14} /> {team?.name ?? "That"}'s sentence is now a bounty — {formatValue(value)}!</>, "wrong");
  };

  // Resolves the CPU's own round entry after a short delay — the exact same resolveRoundCorrect/
  // resolveRoundWrong a human's Correct/Wrong click already uses, just triggered by a hidden dice
  // roll instead. The ref (not just checking entry.resolved) guards against double-scheduling if
  // this effect re-runs mid-delay for an unrelated reason (e.g. a difficulty change mid-round).
  const cpuEntryScheduledRoundRef = useRef<number | null>(null);
  useEffect(() => {
    if (!isSolo || phase !== "playing" || !cpuRef.current) return;
    const cpuId = cpuRef.current.id;
    const entry = roundEntries.find(e => e.teamId === cpuId);
    if (!entry || entry.resolved) return;
    if (cpuEntryScheduledRoundRef.current === roundNumber) return;
    cpuEntryScheduledRoundRef.current = roundNumber;
    const delay = CPU_ENTRY_DELAY_MS.min + Math.random() * (CPU_ENTRY_DELAY_MS.max - CPU_ENTRY_DELAY_MS.min);
    const goWrong = cgmPool.length > 0 && Math.random() < CPU_WRONG_CHANCE_BY_DIFFICULTY[difficulty];
    const timer = setTimeout(() => {
      if (goWrong) {
        const item = cgmPool[Math.floor(Math.random() * cgmPool.length)];
        resolveRoundWrong(cpuId, item.question);
      } else {
        resolveRoundCorrect(cpuId);
      }
    }, delay);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSolo, phase, roundNumber, roundEntries, difficulty]);

  // Guarded inside the functional updater (not a separate read beforehand) — a screen click racing
  // a phone broadcast for the same bounty can't both succeed, same idiom as Order Up's claimTicket.
  // Solo always allows the human to claim their own bounty here — the CPU is the only "other team"
  // in that mode, it never manually claims through this function (it steals through cpuStealBounty
  // above instead), so the exclusion rule that keeps a real multi-team game honest would otherwise
  // leave the human with no claim button at all and hand every bounty to the CPU by default.
  const claimBounty = (bountyId: number, teamId: string | number) => {
    setBounties(prev => prev.map(b => {
      if (b.id !== bountyId || b.claimedBy !== undefined) return b;
      if (isSolo) return { ...b, claimedBy: teamId };
      const otherTeamEligible = teams.some(t => t.id !== b.excludedTeamId);
      if (b.excludedTeamId === teamId && otherTeamEligible) return b;
      return { ...b, claimedBy: teamId };
    }));
  };

  const submitBountyFix = (bountyId: number, teamId: string | number, text: string) => {
    setBounties(prev => prev.map(b => (b.id === bountyId && b.claimedBy === teamId ? { ...b, fixText: text } : b)));
  };

  const resolveBountyCorrect = (bountyId: number) => {
    const bounty = bounties.find(b => b.id === bountyId);
    if (!bounty || bounty.claimedBy === undefined) return;
    const teamId = bounty.claimedBy;
    updateScore(teamId, bounty.value);
    setGameScoreByTeam(prev => ({ ...prev, [teamId]: (prev[teamId] ?? 0) + bounty.value }));
    setBounties(prev => prev.map(b => (b.id === bountyId ? { ...b, resolved: true } : b)));
    setRoundEntries(prev => prev.map(e => (e.teamId === bounty.originalTeamId ? { ...e, resolved: true } : e)));
    playSound("bounty");
    const team = teams.find(t => t.id === teamId);
    pushBanner(<><Icon name="check" size={14} /> <TeamIcon team={team} color="white" /> {team?.name ?? "A team"} claimed the bounty! +{bounty.value} pts</>, "success");
  };

  const resolveBountyWrong = (bountyId: number, wrongText: string) => {
    const bounty = bounties.find(b => b.id === bountyId);
    if (!bounty || bounty.claimedBy === undefined) return;
    const missCount = bounty.missCount + 1;
    const value = BOUNTY_VALUE * (missCount + 1);
    const excludedTeamId = bounty.claimedBy;
    setBounties(prev => prev.map(b => (b.id === bountyId ? { ...b, missCount, value, excludedTeamId, wrongText, claimedBy: undefined, fixText: undefined } : b)));
    pushBanner(<><Icon name="warning" size={14} /> Still wrong — the bounty is now {formatValue(value)}!</>, "wrong");
  };

  // The CPU's whole role in this game: it never writes a real sentence (there's no legitimate wrong
  // text to fabricate for it), it only races the clock against the human's OWN open bounty. Claim
  // and resolve happen together here (not via claimBounty + resolveBountyCorrect back to back) —
  // those are both async state setters, so calling them sequentially would have resolveBountyCorrect
  // read the bounty's still-stale, still-unclaimed state from the same render.
  const cpuStealBounty = (bountyId: number) => {
    const bounty = bounties.find(b => b.id === bountyId);
    const cpuId = cpuRef.current?.id;
    if (!bounty || bounty.claimedBy !== undefined || cpuId === undefined) return;
    updateScore(cpuId, bounty.value);
    setGameScoreByTeam(prev => ({ ...prev, [cpuId]: (prev[cpuId] ?? 0) + bounty.value }));
    setBounties(prev => prev.map(b => (b.id === bountyId ? { ...b, claimedBy: cpuId, resolved: true } : b)));
    setRoundEntries(prev => prev.map(e => (e.teamId === bounty.originalTeamId ? { ...e, resolved: true } : e)));
    playSound("bounty");
    pushBanner(<><Icon name="robot" size={14} /> CPU beat you to it! +{bounty.value} pts</>, "wrong");
  };

  // Solo only — the bounty the CPU is racing to steal. Explicitly excludes the CPU's own bounty
  // (originalTeamId === cpuId) now that the CPU submits a round entry of its own too — otherwise
  // it would eventually "steal" its own mistake, which makes no sense and would quietly award it
  // points for fixing itself. The human's own bounty and the CPU's own bounty CAN be open at the
  // same time now (both entries went wrong the same round); this only ever targets the human's.
  const openBounty = bounties.find(b => !b.resolved && b.claimedBy === undefined && b.originalTeamId !== cpuRef.current?.id);
  const cpuStealSeconds = CPU_STEAL_SECONDS_BY_DIFFICULTY[difficulty];
  const { timeLeft: cpuStealTimeLeft } = useTurnTimer(
    cpuStealSeconds,
    isSolo && phase === "playing" && !!openBounty,
    () => { if (openBounty) cpuStealBounty(openBounty.id); },
    openBounty?.id ?? "none"
  );

  const roundComplete = roundEntries.length > 0 && roundEntries.every(e => e.resolved);
  const isLastRound = roundNumber >= totalRounds - 1;

  const goToNextRound = () => {
    if (isLastRound) { setPhase("final"); return; }
    const next = roundNumber + 1;
    setRoundNumber(next);
    setRoundEntries(seedRoundEntries());
    setBounties([]);
  };

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
  };

  // Refs the phone-mode broadcaster reads synchronously — same pattern as every other phone-mode
  // game, keeps the channel effect's own dependency array from needing every fast-changing value.
  const phaseRef = useRef(phase);
  const roundNumberRef = useRef(roundNumber);
  const currentPromptRef = useRef(currentPrompt);
  const roundEntriesRef = useRef(roundEntries);
  const bountiesRef = useRef(bounties);
  const answerModeRef = useRef(answerMode);
  const connectedTeamIdsRef = useRef<Set<string | number>>(new Set());
  const sendStateRef = useRef<(() => void) | null>(null);
  // Solo's `teams` array gets a new identity every time cpuScore changes — kept out of the channel
  // effect's own dependency array below (which uses the stable `propTeams` instead) so a CPU steal
  // doesn't tear down and reopen the realtime channel; sendState reads the current teams through
  // this ref instead, so phone clients still see live CPU scores without that reconnect.
  const teamsRef = useRef(teams);
  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => { roundNumberRef.current = roundNumber; }, [roundNumber]);
  useEffect(() => { currentPromptRef.current = currentPrompt; }, [currentPrompt]);
  useEffect(() => { roundEntriesRef.current = roundEntries; }, [roundEntries]);
  useEffect(() => { bountiesRef.current = bounties; }, [bounties]);
  useEffect(() => { answerModeRef.current = answerMode; }, [answerMode]);
  useEffect(() => { teamsRef.current = teams; }, [teams]);

  useEffect(() => {
    if (inputMode !== "phone" || !sessionCode) return;
    const channel = openBountyBoardChannel(sessionCode);
    channelRef.current = channel;

    const sendState = () => {
      const rawPhase = phaseRef.current;
      const mappedPhase: BountyBoardPhase = rawPhase === "intro" ? "lobby" : rawPhase === "final" ? "final" : "playing";
      const scores: Record<string, number> = {};
      teamsRef.current.forEach(t => { scores[String(t.id)] = t.score; });
      const payload: BountyBoardStatePayload = {
        phase: mappedPhase,
        roster: teamsRef.current.map(t => ({ id: t.id, name: t.name, color: t.color, mascot: t.mascot })),
        connectedTeamIds: Array.from(connectedTeamIdsRef.current),
        roundNumber: roundNumberRef.current,
        totalRounds,
        promptText: currentPromptRef.current?.question ?? "",
        answerMode: answerModeRef.current,
        roundEntries: roundEntriesRef.current,
        bounties: bountiesRef.current,
        scores,
        isSolo,
        ts: Date.now(),
      };
      channel.send({ type: "broadcast", event: "state", payload });
    };
    sendStateRef.current = sendState;

    channel.on("presence", { event: "sync" }, () => {
      const presenceState = channel.presenceState<{ teamId: string | number }>();
      const ids = new Set<string | number>();
      Object.values(presenceState).forEach(entries => entries.forEach(entry => ids.add(entry.teamId)));
      connectedTeamIdsRef.current = ids;
      setConnectedTeamIds(ids);
      sendState();
    });

    // The single ingress point for all phone input — validates against live ref state, then calls
    // the exact same functions the screen's own buttons call.
    channel.on("broadcast", { event: "action" }, ({ payload }) => {
      const action = payload as BountyBoardActionPayload;
      if (phaseRef.current !== "playing") return;
      if (action.action === "submitRound") {
        const entry = roundEntriesRef.current.find(e => e.teamId === action.teamId);
        if (!entry || entry.resolved) return;
        submitRoundEntry(action.teamId, action.text);
      } else if (action.action === "claimBounty") {
        const bounty = bountiesRef.current.find(b => b.id === action.bountyId);
        if (!bounty || bounty.claimedBy !== undefined) return;
        if (!isSolo) {
          const otherTeamEligible = teamsRef.current.some(t => t.id !== bounty.excludedTeamId);
          if (bounty.excludedTeamId === action.teamId && otherTeamEligible) return;
        }
        claimBounty(action.bountyId, action.teamId);
      } else if (action.action === "submitBountyFix") {
        const bounty = bountiesRef.current.find(b => b.id === action.bountyId);
        if (!bounty || bounty.claimedBy !== action.teamId) return;
        submitBountyFix(action.bountyId, action.teamId, action.text);
      }
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
  }, [inputMode, sessionCode, propTeams, totalRounds]);

  useEffect(() => {
    sendStateRef.current?.();
  }, [phase, roundNumber, roundEntries, bounties, teams]);

  useEffect(() => {
    if (phase === "final" && channelRef.current) {
      channelRef.current.send({ type: "broadcast", event: "ended", payload: {} });
    }
  }, [phase]);

  const arenaStyle: React.CSSProperties = {
    margin: "-20px", padding: "20px 20px 26px", borderRadius: "20px", position: "relative", overflow: "hidden",
    background: "radial-gradient(circle at 50% 0%, #FEF3C7 0%, #FDE9C0 55%, #F5DBA0 100%)",
  };

  // Tutorial mockup: src/data/tutorials/bountyboard.tsx — update if this intro's rules text changes.
  if (phase === "intro") return (
    <div style={{ ...arenaStyle, textAlign: "center" }}>
      {STYLE_TAG}
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ background: "#F5E6C8", border: "3px solid #1A1A2E", borderRadius: "20px", padding: "28px 24px", marginBottom: "10px", color: "#78350F", maxWidth: "560px", margin: "0 auto 10px", boxShadow: "5px 5px 0 #1A1A2E" }}>
          <div style={{ marginBottom: "10px" }}><Icon name="sheriffStar" size={36} /></div>
          <div style={{ fontWeight: "900", fontSize: "20px", marginBottom: "10px", color: "#92400E" }}>Bounty Board</div>
          <div style={{ fontSize: "15px", lineHeight: 1.7 }}>
            Every round, one word goes up on the board — every team writes <strong style={{ color: "#92400E" }}>their own sentence</strong> for it, at the same time, then hands it in for the teacher to post.<br />
            Get it wrong and it becomes a <strong style={{ color: "#B91C1C" }}>bounty</strong>: a different team can claim it and fix your exact sentence for double the points — miss it again and it's worth even more!
          </div>
        </div>
        {/* Skipped entirely for a Class Check-In sitting — presetPhoneSession already picked
            phone mode and its code, and the class-level QR already covered joining. */}
        {!presetPhoneSession && <>
          {introStep === "setup" && (
            <div style={{ marginBottom: "20px" }}>
              <div style={{ fontSize: "13px", color: "#92400E", fontWeight: "700", marginBottom: "10px" }}>How will answers get submitted?</div>
              <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                <button onClick={handlePickScreenMode} className="bb-btn" style={{
                  padding: "10px 20px", borderRadius: "12px", fontWeight: "800", fontSize: "14px", cursor: "pointer",
                  border: `2px solid ${inputMode === "screen" ? "#92400E" : "rgba(0,0,0,0.1)"}`,
                  background: inputMode === "screen" ? "rgba(146,64,14,0.1)" : "rgba(255,255,255,0.6)",
                  color: inputMode === "screen" ? "#92400E" : "#78350F",
                  display: "inline-flex", alignItems: "center", gap: "6px",
                }}><Icon name="screen" size={14} /> Play on Screen</button>
                <button onClick={handlePickPhoneMode} className="bb-btn" style={{
                  padding: "10px 20px", borderRadius: "12px", fontWeight: "800", fontSize: "14px", cursor: "pointer",
                  border: `2px solid ${inputMode === "phone" ? "#92400E" : "rgba(0,0,0,0.1)"}`,
                  background: inputMode === "phone" ? "rgba(146,64,14,0.1)" : "rgba(255,255,255,0.6)",
                  color: inputMode === "phone" ? "#92400E" : "#78350F",
                  display: "inline-flex", alignItems: "center", gap: "6px",
                }}><Icon name="phone" size={14} /> Play on Phones</button>
              </div>
            </div>
          )}

          {introStep === "qr" && sessionCode && (() => {
            const joinUrl = `${window.location.origin}${window.location.pathname}?join=${sessionCode}&game=bounty`;
            return (
              <PhoneJoinPanel
                sessionCode={sessionCode} joinUrl={joinUrl} teams={propTeams} connectedTeamIds={connectedTeamIds}
                accent="#92400E" panelBg="linear-gradient(160deg,#FFFFFF,#FEF3C7)" borderColor="#FDE68A"
                footer={
                  <button onClick={handlePickScreenMode} style={{ background: "none", border: "none", color: "#9CA3AF", fontSize: "12px", fontWeight: "700", cursor: "pointer", textDecoration: "underline" }}>
                    Switch back to Play on Screen
                  </button>
                }
              >
                <div style={{ marginBottom: "14px" }}>
                  <div style={{ fontSize: "12px", color: "#92400E", fontWeight: "700", marginBottom: "8px" }}>How do teams hand in their sentence?</div>
                  <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                    <button onClick={() => setAnswerMode("spoken")} className="bb-btn" style={{
                      padding: "6px 14px", borderRadius: "10px", fontWeight: "800", fontSize: "12px", cursor: "pointer",
                      border: `2px solid ${answerMode === "spoken" ? "#92400E" : "rgba(0,0,0,0.1)"}`,
                      background: answerMode === "spoken" ? "rgba(146,64,14,0.15)" : "rgba(255,255,255,0.6)",
                      color: answerMode === "spoken" ? "#92400E" : "#78350F",
                      display: "inline-flex", alignItems: "center", gap: "5px",
                    }}><Icon name="hand" size={12} /> Write it down, tell the teacher</button>
                    <button onClick={() => setAnswerMode("typing")} className="bb-btn" style={{
                      padding: "6px 14px", borderRadius: "10px", fontWeight: "800", fontSize: "12px", cursor: "pointer",
                      border: `2px solid ${answerMode === "typing" ? "#92400E" : "rgba(0,0,0,0.1)"}`,
                      background: answerMode === "typing" ? "rgba(146,64,14,0.15)" : "rgba(255,255,255,0.6)",
                      color: answerMode === "typing" ? "#92400E" : "#78350F",
                      display: "inline-flex", alignItems: "center", gap: "5px",
                    }}><Icon name="keyboard" size={12} /> Type it on your phone</button>
                  </div>
                </div>
              </PhoneJoinPanel>
            );
          })()}
        </>}
        {/* Solo only — the CPU's own steal-countdown speed. Same picker idiom as Race Track's own
            solo difficulty row. */}
        {isSolo && (
          <div style={{ marginBottom: "20px" }}>
            <div style={{ fontSize: "13px", color: "#92400E", fontWeight: "700", marginBottom: "10px" }}><Icon name="robot" size={13} /> How fast should the CPU steal a missed bounty?</div>
            <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
              {(["easy", "medium", "hard"] as const).map(d => {
                const selected = difficulty === d;
                const dotColor = d === "easy" ? "#22C55E" : d === "medium" ? "#EAB308" : "#EF4444";
                const label = d[0].toUpperCase() + d.slice(1);
                return (
                  <button key={d} onClick={() => setDifficulty(d)} className="bb-btn" style={{
                    padding: "10px 20px", borderRadius: "12px", fontWeight: "800", fontSize: "14px", cursor: "pointer",
                    border: `2px solid ${selected ? "#B91C1C" : "rgba(0,0,0,0.1)"}`,
                    background: selected ? "rgba(185,28,28,0.1)" : "rgba(255,255,255,0.6)",
                    color: selected ? "#B91C1C" : "#78350F",
                    display: "inline-flex", alignItems: "center", gap: "6px",
                  }}>
                    <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: dotColor, display: "inline-block" }} /> {label} · {CPU_STEAL_SECONDS_BY_DIFFICULTY[d]}s
                  </button>
                );
              })}
            </div>
          </div>
        )}
        <button onClick={() => setShowHowTo(true)} className="bb-btn" style={{ display: "inline-flex", alignItems: "center", gap: "6px", marginBottom: "14px", background: "rgba(255,255,255,0.95)", color: GM.color, border: `2px solid ${GM.color}`, boxShadow: "0 2px 8px rgba(0,0,0,0.18)", borderRadius: "12px", padding: "10px 24px", fontSize: "14px", fontWeight: "800", cursor: "pointer" }}>
          <Icon name="help" size={15} /> How to Play
        </button>
        {showHowTo && (
          <HowToPlayModal
            gameName={GM.name} gameIcon={GAME_ICONS[GM.id]} accentColor={GM.color}
            steps={BOUNTYBOARD_TUTORIAL_STEPS}
            onClose={() => setShowHowTo(false)}
          />
        )}
        <button onClick={() => setPhase("playing")} className="bb-btn" style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "#B45309", color: "white", border: "3px solid #1A1A2E", borderRadius: "16px", padding: "16px 48px", fontSize: "19px", fontWeight: "900", cursor: "pointer", boxShadow: "6px 6px 0 #1A1A2E" }}><Icon name="sheriffStar" size={20} /> Open the Board!</button>
      </div>
    </div>
  );

  if (phase === "final") {
    const ranking = denseRank(teams, t => gameScoreByTeam[t.id] ?? 0).sort((a, b) => b.value - a.value);
    const winners = ranking.filter(r => r.rank === 0);
    const isTie = winners.length > 1;
    const headline = isTie
      ? `${winners.map(w => w.item.name).join(" & ")} tied for top bounty hunter!`
      : `${winners[0]?.item.name} is the top bounty hunter.`;
    return (
      <div style={{ ...arenaStyle, textAlign: "center" }}>
        {STYLE_TAG}
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ marginBottom: "6px" }}><Icon name="sheriffStar" size={44} color="#92400E" /></div>
          <div style={{ fontWeight: "900", fontSize: "22px", color: "#92400E", marginBottom: "4px" }}>The board is cleared!</div>
          <div style={{ fontSize: "13px", color: "#78350F", marginBottom: "16px" }}>{headline}</div>
          <div style={{ display: "grid", gridTemplateColumns: teamsGridCols(teams.length), gap: "10px", margin: "0 auto 20px", maxWidth: "760px" }}>
            {ranking.map(({ item: t, rank, value }) => (
              <div key={t.id} style={{ background: "#FEF3C7", border: "2px solid #1A1A2E", boxShadow: "3px 3px 0 #1A1A2E", borderRadius: "14px", padding: "12px" }}>
                <div><RankBadge rank={rank} size={20} /></div>
                <div style={{ fontWeight: "800", color: "#78350F", fontSize: "14px", marginTop: "4px" }}><TeamIcon team={t} /> {t.name}</div>
                <div style={{ color: "#92400E", fontWeight: "900", fontSize: "16px", marginTop: "4px" }}>{value} pts</div>
              </div>
            ))}
          </div>
          <button onClick={onEnd} className="bb-btn" style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "#B45309", color: "white", border: "3px solid #1A1A2E", borderRadius: "12px", padding: "12px 28px", fontSize: "16px", fontWeight: "800", cursor: "pointer", boxShadow: "4px 4px 0 #1A1A2E" }}><Icon name="checkeredFlag" size={16} /> End Game</button>
        </div>
      </div>
    );
  }

  return (
    <div style={arenaStyle}>
      {STYLE_TAG}
      {/* Suppressed for a Class Check-In sitting — the class-level badge (LessonGamesGenerator.tsx's
          renderClassCheckInBadge) is the only floating reconnect button shown then, and it's the
          only one pointing at the right (class, not per-game) join URL. */}
      {inputMode === "phone" && sessionCode && !presetPhoneSession && (
        <PhoneReconnectBadge
          sessionCode={sessionCode} joinUrl={`${window.location.origin}${window.location.pathname}?join=${sessionCode}&game=bounty`}
          teams={propTeams} connectedTeamIds={connectedTeamIds}
          accent="#92400E" panelBg="linear-gradient(160deg,#FFFFFF,#FEF3C7)" borderColor="#FDE68A"
        />
      )}
      {banner && (
        <div key={banner.key} style={{
          position: "absolute", top: "14px", left: "50%", zIndex: 20, whiteSpace: "nowrap",
          background: banner.kind === "success" ? "#22C55E" : "#B45309",
          border: "3px solid #1A1A2E",
          borderRadius: "14px", padding: "10px 22px", boxShadow: "4px 4px 0 #1A1A2E",
          animation: "bbBannerIn 2.4s ease-in-out forwards",
        }}>
          <span style={{ color: "white", fontWeight: "900", fontSize: "15px", textShadow: "0 1px 3px rgba(0,0,0,0.3)", display: "inline-flex", alignItems: "center", gap: "6px" }}>{banner.text}</span>
        </div>
      )}
      <div style={{ position: "relative", zIndex: 1 }}>
        <BoardHeader />
        <div style={{ textAlign: "center", marginBottom: "6px" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "5px 14px", background: "white", border: "2px solid #FDE68A", borderRadius: "999px", fontWeight: "900", fontSize: "13px", color: "#92400E" }}>
            Round {roundNumber + 1} of {totalRounds}
          </span>
        </div>
        <div style={{ maxWidth: "560px", margin: "0 auto 16px", textAlign: "center" }}>
          <div style={{ fontSize: "11px", fontWeight: "800", color: "#92400E", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "4px" }}>This round's word</div>
          <div style={{ background: "white", border: "2px solid #D97706", borderRadius: "12px", padding: "10px 16px", fontSize: "15px", fontWeight: "700", color: "#78350F", position: "relative" }}>
            {currentPrompt?.question}
            <div style={{ position: "absolute", top: "6px", right: "6px" }}>
              <FlagPromptButton gameId="bounty" questionData={currentPrompt} />
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap", marginBottom: "18px" }}>
          {roundEntries
            .filter(e => !e.resolved && !bounties.some(b => b.originalTeamId === e.teamId && !b.resolved))
            .map(e => (
              e.teamId === cpuRef.current?.id ? (
                <CpuRoundEntryCard key={e.teamId} team={teams.find(t => t.id === e.teamId)} />
              ) : (
                <RoundEntryCard
                  key={e.teamId}
                  entry={e}
                  team={teams.find(t => t.id === e.teamId)}
                  answerMode={answerMode}
                  isPhoneMode={inputMode === "phone"}
                  onPost={text => submitRoundEntry(e.teamId, text)}
                  onCorrect={() => resolveRoundCorrect(e.teamId)}
                  onWrong={text => resolveRoundWrong(e.teamId, text)}
                />
              )
            ))}
        </div>

        {bounties.some(b => !b.resolved) && (
          <>
            <div style={{ textAlign: "center", color: "#7F1D1D", fontWeight: "800", fontSize: "13px", marginBottom: "10px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
              <Icon name="sheriffStar" size={14} /> Open bounties
            </div>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap", marginBottom: "10px" }}>
              {bounties.filter(b => !b.resolved).map(b => {
                // Solo is its own case, not a variant of the exclusion rule below: the human is
                // always the manual-claim button (catching their own mistake before the CPU does),
                // and the CPU is never one — it only ever claims automatically via the steal
                // countdown, through cpuStealBounty, never through this button. A real multi-team
                // exclusion still falls back to allowing anyone rather than soft-locking forever.
                const claimableTeams = isSolo ? [propTeams[0]] : (() => {
                  const eligible = teams.filter(t => t.id !== b.excludedTeamId);
                  return eligible.length > 0 ? eligible : teams;
                })();
                const isOpenBounty = b.id === openBounty?.id;
                return (
                  <BountyCard
                    key={b.id}
                    bounty={b}
                    team={b.claimedBy !== undefined ? teams.find(t => t.id === b.claimedBy) : undefined}
                    claimableTeams={claimableTeams}
                    cpuSteal={isSolo && isOpenBounty ? { timeLeft: cpuStealTimeLeft, totalSeconds: cpuStealSeconds } : undefined}
                    answerMode={answerMode}
                    isPhoneMode={inputMode === "phone"}
                    onClaim={teamId => claimBounty(b.id, teamId)}
                    onPostFix={text => { if (b.claimedBy !== undefined) submitBountyFix(b.id, b.claimedBy, text); }}
                    onCorrect={() => resolveBountyCorrect(b.id)}
                    onWrong={text => resolveBountyWrong(b.id, text)}
                  />
                );
              })}
            </div>
          </>
        )}

        <div style={{ textAlign: "center", marginTop: "10px" }}>
          <button
            onClick={goToNextRound}
            disabled={!roundComplete}
            className="bb-btn"
            title={roundComplete ? undefined : "Every bounty has to be cleared first"}
            style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              background: roundComplete ? "#B45309" : "#D1D5DB", color: "white",
              border: "3px solid #1A1A2E", borderRadius: "14px", padding: "12px 32px",
              fontSize: "15px", fontWeight: "900", cursor: roundComplete ? "pointer" : "not-allowed",
              boxShadow: roundComplete ? "4px 4px 0 #1A1A2E" : "none",
            }}
          >{isLastRound ? <><Icon name="trophy" size={16} /> Finish</> : <><Icon name="next" size={16} /> Next Round</>}</button>
        </div>
      </div>
    </div>
  );
}
