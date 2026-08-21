import { supabase } from "./supabaseClient";
import type { RealtimeChannel } from "@supabase/supabase-js";
import type { TeamColor } from "../types";
import type { ParsedMCQ, Difficulty } from "../hooks/useMoleGame";

// Short, hand-typeable fallback code — excludes visually ambiguous characters (0/O, 1/I/l) since
// a teacher might read it aloud, or a student might type it in manually if scanning fails.
const CODE_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const CODE_LENGTH = 5;

export function generateSessionCode(): string {
  let code = "";
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  }
  return code;
}

export type AuctionRosterEntry = { id: string | number; name: string; color: TeamColor; mascot?: string | null };

// Mirrors AuctionGame.tsx's own local Phase type — kept as an independent literal union here
// rather than importing it, matching this file's existing "self-contained payload types" pattern.
export type AuctionPhase = "intro" | "betting" | "result" | "final";

// Broadcast from the teacher's screen -> every phone. Sent on every relevant change AND on a
// standing interval regardless — the interval resend is what lets a phone that subscribes mid-
// game (a late scanner, or a reconnect after dropping wifi) get a fresh copy within one interval,
// instead of needing a separate "hello, catch me up" handshake. `ts` doubles as a liveness check
// on the phone side — no state broadcast for ~12-15s means the teacher's tab is gone. `phase`
// lets a phone tell "hasn't started yet" from "round in progress" from "auction is over" without
// needing separate one-shot events for each (though "ended" below still exists as an immediate
// push, so a phone doesn't have to wait out a full interval to find out the game's done).
//
// `correct`/`results` are only populated once phase is "result" (or "final") — same "not a new
// leak" reasoning as everything else broadcast on this channel: the shared screen already reveals
// the answer and every team's outcome at that same moment, this just lets a phone show its own
// team's outcome too. A team that sat out (broke) has no entry in `results` — nothing to reveal.
export type AuctionResultInfo = { won: boolean; delta: number; vote: "true" | "false" | null; amount: number };

export type AuctionStatePayload = {
  phase: AuctionPhase;
  qi: number;
  sentence: string;
  roster: AuctionRosterEntry[];
  banks: Record<string, number>;
  connectedTeamIds: (string | number)[];
  ts: number;
  correct?: boolean;
  results?: Record<string, AuctionResultInfo>;
};

// Broadcast from a phone -> the teacher's screen. Sent on every local change and re-sent once on
// every (re)connect, so a bet made right before a drop isn't lost.
export type AuctionBetPayload = {
  teamId: string | number;
  vote: "true" | "false";
  amount: number;
};

function auctionChannelName(code: string): string {
  // Game-id prefixed, not a bare code — lets a second game adopt this same pattern later without
  // any risk of its channels colliding with Auction's.
  return `auction-${code}`;
}

// Presence key must be random per *connection*, not the teamId — two different devices both
// tracking the same teamId need to show up as two separate presence entries, not collapse into
// one, or "this team is already claimed" detection on the join screen breaks.
export function openAuctionChannel(code: string): RealtimeChannel {
  return supabase.channel(auctionChannelName(code), {
    config: { presence: { key: crypto.randomUUID() } },
  });
}

// Shared by every game's phone-mode channel teardown — never had any Auction-specific logic, so
// this is just the generic close, used by both Auction and Spy Among Us (and any future game).
export function closeChannel(channel: RealtimeChannel | null): void {
  if (channel) supabase.removeChannel(channel);
}

// --- Spy Among Us (group mode + solo + 1v1) ---
//
// Unlike Auction, phones here are receive-only: no bet-equivalent broadcast comes back from a
// phone, so there's no SpyActionPayload. Each round's `roles` map covers every team's private
// role+prompt, broadcast to everyone on the channel — same "channel code is the trust boundary"
// model Auction already uses; a phone only ever *displays* its own team's entry.
export type SpyRosterEntry = { id: string | number; name: string; color: TeamColor; mascot?: string | null };

// Mirrors SpyAmongUsGame.tsx's own Phase type minus "intro" (collapses to "lobby" — see
// mapPhase in SpyAmongUsGame.tsx). "peek" is a real, reachable phase here (unlike group mode,
// where phone mode skips it entirely) whenever solo play's teacher stand-in still needs their own
// on-screen reveal. "speak-2p"/"guess-2p"/"reveal-2p" are the 1v1 ruleset's counterparts to
// "speak"/"spy-guess"/"reveal".
export type SpyPhase =
  | "lobby" | "peek" | "discuss" | "order-roll" | "speak" | "speak-2p"
  | "vote" | "spy-guess" | "guess-2p" | "reveal-2p" | "reveal" | "final";

export type SpyRoleInfo = { role: "spy" | "crew"; prompt: string };

export type SpyStatePayload = {
  phase: SpyPhase;
  ri: number;
  roster: SpyRosterEntry[];
  roles: Record<string, SpyRoleInfo>;
  speakOrder: (string | number)[];
  speakIdx: number;
  connectedTeamIds: (string | number)[];
  ts: number;
};

function spyChannelName(code: string): string {
  return `spy-${code}`;
}

export function openSpyChannel(code: string): RealtimeChannel {
  return supabase.channel(spyChannelName(code), {
    config: { presence: { key: crypto.randomUUID() } },
  });
}

// --- Word Whack ---
//
// Bidirectional, unlike Spy Among Us — but not per-tap. The active team's phone runs the whole
// mole-spawn/duck/hit loop locally (via hooks/useMoleGame, the same hook the teacher's screen
// uses in screen mode) so there's zero network latency on the actual tapping, which matters on a
// game where a mole is only up for 2-5 seconds. The phone only ever sends one message per turn —
// a final report once its local 90s timer runs out — not a stream of per-hit events.
export type WhackRosterEntry = { id: string | number; name: string; color: TeamColor; mascot?: string | null };

// "turn" covers both "waiting" and "it's your turn" — a single broadcast reaches every phone at
// once, so which one applies is derived client-side per phone by comparing activeTeamId to that
// phone's own teamId, not baked into this shared field.
export type WhackPhase = "lobby" | "turn" | "review" | "final";

// Broadcast teacher's screen -> every phone. `pool`/`difficulty` are sent as-is (not secret —
// every phone gets the same question set a screen-mode player would see, same trust model as
// every other phone-mode game on this channel type). `activeTeamId`/`startRoundIdx` tell the
// active team's phone it's their turn and exactly which pool cursor to continue from, so the
// "no question repeats this playthrough" guarantee holds globally across screen- and phone-driven
// turns alike, not just within one team's turn.
export type WhackStatePayload = {
  phase: WhackPhase;
  pool: ParsedMCQ[];
  difficulty: Difficulty;
  turnSeconds: number;
  roster: WhackRosterEntry[];
  activeTeamId: string | number | null;
  startRoundIdx: number;
  scores: Record<string, number>;
  connectedTeamIds: (string | number)[];
  // Only populated once phase is "review"/"final" — every question that came up this game, for
  // the shared post-game review list (screen and phones show the identical list).
  playedRounds: ParsedMCQ[];
  ts: number;
};

// Broadcast phone -> teacher's screen, sent exactly once per phone-driven turn, when that phone's
// own local turn timer actually expires.
export type WhackTurnReportPayload = {
  teamId: string | number;
  finalScore: number;
  bestCombo: number;
  endRoundIdx: number;
  playedRounds: ParsedMCQ[];
};

function whackChannelName(code: string): string {
  return `whack-${code}`;
}

export function openWhackChannel(code: string): RealtimeChannel {
  return supabase.channel(whackChannelName(code), {
    config: { presence: { key: crypto.randomUUID() } },
  });
}

// --- Hot Seat ---
//
// Screen-authoritative, unlike Word Whack — no strict per-word timing pressure here (marking a
// word "Correct" a few hundred ms late is imperceptible), so the screen keeps running the exact
// same word-deck/timer/scoring logic it always has; a phone-driven turn is just that same state
// broadcast out, and phone taps folded back in as if they were local button clicks. See
// HotSeatGame.tsx for exactly where.
export type HotSeatRosterEntry = { id: string | number; name: string; color: TeamColor; mascot?: string | null };

// Which specific card a phone shows during "turn" is derived client-side from activeTeamId +
// teamStructure (see PhoneHotSeatView.tsx) — a single broadcast phase can't itself be "describing"
// for one team and "guessing" for another at the same time.
export type HotSeatPhase = "lobby" | "turn" | "final";

export type HotSeatStatePayload = {
  phase: HotSeatPhase;
  // "groups": the active team's own phone describes (teammates give clues, matches the in-person
  // rule). "solo": every *other* connected team's phone describes instead, since a 1-person "team"
  // has no teammates of its own to hide the word from — see the plan's reasoning.
  teamStructure: "groups" | "solo";
  roster: HotSeatRosterEntry[];
  activeTeamId: string | number | null;
  currentWord: string;
  timeLeft: number;
  turnSeconds: number;
  turnCorrect: number;
  scores: Record<string, number>;
  connectedTeamIds: (string | number)[];
  ts: number;
};

// Broadcast phone -> screen. teamId is validated against who's actually allowed to act right now —
// the active team in "groups" mode, anyone but the active team in "solo" mode (see HotSeatGame.tsx).
export type HotSeatActionPayload = { teamId: string | number; action: "correct" | "skip" | "endTurn" };

function hotSeatChannelName(code: string): string {
  return `hotseat-${code}`;
}

export function openHotSeatChannel(code: string): RealtimeChannel {
  return supabase.channel(hotSeatChannelName(code), {
    config: { presence: { key: crypto.randomUUID() } },
  });
}
