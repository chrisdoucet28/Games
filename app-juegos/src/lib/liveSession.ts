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

// --- Word Relay ---
//
// Twenty-questions style: each team has its own hidden word, and one person at a time (the
// "asker") has to ask yes/no questions to find it out while everyone else who knows the word
// answers. This is the only game whose phones are individual PEOPLE rather than one phone per
// team — several phones can join the same team, each identified by a per-device id (see
// getDeviceId), and the screen rotates the asker through them. The word itself is only ever shown
// to the "answerer" phones (never the asker's), and never on the main screen while any answerer
// phone is connected. See RelayGame.tsx for exactly where.
export type RelayRosterEntry = { id: string | number; name: string; color: TeamColor; mascot?: string | null };

export type RelayPhase = "lobby" | "ready" | "asking" | "reveal" | "final";

export type RelayStatePayload = {
  phase: RelayPhase;
  roster: RelayRosterEntry[];
  // The team whose turn it is — during "reveal", the team that just guessed.
  activeTeamId: string | number | null;
  // The active team's current asker phone, or null when that team plays physically (no phones).
  askerDeviceId: string | null;
  // Connected device ids per team, current asker first, so a phone can say "you're #2 in line".
  askerQueueByTeam: Record<string, string[]>;
  // Phones allowed to see the word and press the controls this turn.
  answererDeviceIds: string[];
  // Only sent while a word is live (asking/reveal); the phone UI shows it to answerers only.
  currentWord: string;
  // True when no answerer phone is connected, so the main screen must show the word itself.
  screenShowsWord: boolean;
  phoneCountByTeam: Record<string, number>;
  questionsLeftByTeam: Record<string, number>;
  questionsPerTeam: number;
  // Words correctly guessed per team this game.
  wordsByTeam: Record<string, number>;
  connectedTeamIds: (string | number)[];
  ts: number;
};

// Broadcast phone -> screen. Validated screen-side: right phase, and the sender's deviceId must be
// one of the current answerers.
export type RelayActionPayload = {
  teamId: string | number;
  deviceId: string;
  action: "guessed" | "missed" | "next" | "changeWord";
};

const DEVICE_ID_KEY = "classcade-device-id";

// A stable id for THIS phone/tab, sent along with the team claim so a game that cares about
// individual people (Word Relay) can tell two phones on the same team apart. sessionStorage, not
// localStorage: it survives a refresh of the same tab (so a phone doesn't turn into a "new person"
// mid-game) but a second tab is a second device, which is exactly what a phone-per-student setup
// looks like.
let memoryDeviceId: string | null = null;
export function getDeviceId(): string {
  if (memoryDeviceId) return memoryDeviceId;
  try {
    const existing = sessionStorage.getItem(DEVICE_ID_KEY);
    if (existing) { memoryDeviceId = existing; return existing; }
    const created = crypto.randomUUID();
    sessionStorage.setItem(DEVICE_ID_KEY, created);
    memoryDeviceId = created;
    return created;
  } catch {
    memoryDeviceId = crypto.randomUUID();
    return memoryDeviceId;
  }
}

function relayChannelName(code: string): string {
  return `relay-${code}`;
}

export function openRelayChannel(code: string): RealtimeChannel {
  return supabase.channel(relayChannelName(code), {
    config: { presence: { key: crypto.randomUUID() } },
  });
}

// --- Order Up ---
//
// Screen-authoritative, like Hot Seat — the shared floor's ticket queue, timers, and claim/expiry
// logic all keep running exactly as they do in screen mode; a phone-driven claim is just an
// "action" broadcast folded straight into the same claimTicket() screen-mode buttons already call.
// Unlike every other phone-mode game, several teams can be independently "active" at once here
// (each holding their own claimed ticket(s)) rather than one team having the floor at a time — the
// state broadcast just carries the whole live ticket board so every phone can render its own
// "claimed by me" vs. "still open" view off the same shared data.
export type OrderUpRosterEntry = { id: string | number; name: string; color: TeamColor; mascot?: string | null };

export type OrderUpPhase = "lobby" | "playing" | "final";

// Duplicated from OrderUpGame.tsx's own TicketItem rather than imported — matches this file's
// existing self-contained-payload-types convention (see AuctionPhase/SpyPhase above).
export type OrderUpTicketItem =
  | { kind: "grammar"; transform: string; label: string; foodEmoji: string }
  | { kind: "vocab"; word: string; foodEmoji: string };

export type OrderUpTicketInfo = {
  id: number;
  items: OrderUpTicketItem[];
  customerEmoji: string;
  totalSeconds: number;
  secondsLeft: number;
  claimedBy?: string | number;
  // Only meaningful once answerMode is "typing" — undefined in "spoken" the whole game through.
  submittedSentence?: string;
};

export type OrderUpStatePayload = {
  phase: OrderUpPhase;
  roster: OrderUpRosterEntry[];
  tickets: OrderUpTicketInfo[];
  sessionTimeLeft: number;
  scores: Record<string, number>;
  connectedTeamIds: (string | number)[];
  // Whole-session choice (picked once alongside phone mode itself, like Hot Seat's teamStructure)
  // — never varies per team or per ticket.
  answerMode: "spoken" | "typing";
  // Mirrors the screen's own judging?.ticketId ?? null — lets a phone tell "still mine to edit"
  // from "the teacher is looking at this right now," so a typed answer can't change out from under
  // an in-progress judgment.
  judgingTicketId: number | null;
  ts: number;
};

// Named claimTicket, not bare "claim" — PhoneJoinScreen.tsx already has its own unrelated
// team-identity "claim" (handleClaim/claimedTeamId) for joining the session in the first place;
// keeping the field name distinct avoids confusing the two concepts when skimming this file later.
export type OrderUpActionPayload =
  | { teamId: string | number; action: "claimTicket"; ticketId: number }
  | { teamId: string | number; action: "submitSentence"; ticketId: number; sentence: string };

function orderUpChannelName(code: string): string {
  return `orderup-${code}`;
}

export function openOrderUpChannel(code: string): RealtimeChannel {
  return supabase.channel(orderUpChannelName(code), {
    config: { presence: { key: crypto.randomUUID() } },
  });
}

// --- Race Track ---
//
// The simplest phone-mode game yet: one shared question goes up for the whole class at once (no
// ticket queue, no per-team content, nothing to type), so a phone's only job is to be a personal
// "BUZZ!" button. Screen-authoritative like every other game here — the screen alone decides who
// gets credited (buzzing is purely an input-timing signal feeding into the teacher's existing
// judgment, never a substitute for it).
export type RaceTrackRosterEntry = { id: string | number; name: string; color: TeamColor; mascot?: string | null };

// "interlude" covers the dice-roll/effect-reveal chain (RaceTrackGame.tsx's "rolling"/"effect"
// phases) — without a distinct value for that ~2-3s stretch, it would have to map to "lobby", which
// PhoneJoinScreen.tsx's shared pre-game gate reads as "hasn't started yet," wrongly telling a phone
// mid-race to go back to waiting.
export type RaceTrackPhase = "lobby" | "task" | "interlude" | "final";

export type RaceTrackStatePayload = {
  phase: RaceTrackPhase;
  roster: RaceTrackRosterEntry[];
  connectedTeamIds: (string | number)[];
  // `${zone.id}:${typeIdx}` — mirrors the screen's own question-identity key. A new value means a
  // genuinely new question; every phone clears its buzzed-or-not display when this changes.
  taskKey: string;
  // This round's resolved buzz winner, or null while the buzzer is open. "Round" isn't always the
  // same as "question" — see rejectedTeamIds below.
  buzzedTeamId: string | number | null;
  // Teams marked "wrong" on the CURRENT question — excluded from re-buzzing until taskKey changes,
  // even though the buzzer itself reopens for everyone else once a team's marked wrong.
  rejectedTeamIds: (string | number)[];
  // Each team's current track position — a light phone-side context strip, not load-bearing.
  positions: Record<string, number>;
  ts: number;
};

// The only phone-originated action. Marking a buzz "wrong" and reopening the round is teacher-only,
// screen-side (RaceTrackGame.tsx's own markBuzzWrong) — never broadcast by a phone; phones just
// react to buzzedTeamId/rejectedTeamIds changing in the next state push, the same way they react to
// a new taskKey.
export type RaceTrackActionPayload = { teamId: string | number; action: "buzz"; ts: number };

function raceTrackChannelName(code: string): string {
  return `racetrack-${code}`;
}

export function openRaceTrackChannel(code: string): RealtimeChannel {
  return supabase.channel(raceTrackChannelName(code), {
    config: { presence: { key: crypto.randomUUID() } },
  });
}

// --- King of the Hill ---
//
// Unlike Race Track's buzzer, this one is a pure informational overlay, not a turn-taking gate.
// King of the Hill is turn-based — most of a turn has exactly one eligible team, nothing to race
// for. The one exception is a contested duel (a 2-team head-to-head over a zone someone already
// owns), where in grammar-mode content "the fastest correct answer wins." Both teams already
// answer out loud regardless of buzz order, so buzzing here just tells the teacher who hit their
// button first — they still make the same single Attacker/Defender/Neither judgment click they
// always have. Topic-mode content and solo (CPU) play don't get this at all — see KingOfHillGame.tsx.
export type HillRosterEntry = { id: string | number; name: string; color: TeamColor; mascot?: string | null };

// "idle" covers everything that isn't a live grammar-mode duel — rolling (fires at the start of
// every round, not just the game's opening one), pick, answer, a resolved contest awaiting "Next
// Turn," round-end. A phone has nothing to do in any of those beyond "watch the shared screen."
export type HillPhase = "lobby" | "idle" | "duel" | "final";

export type HillStatePayload = {
  phase: HillPhase;
  roster: HillRosterEntry[];
  connectedTeamIds: (string | number)[];
  // Only meaningful during "duel" — exactly which two teams are in the ring right now.
  attackerId: string | number | null;
  defenderId: string | number | null;
  // A new value means a genuinely new duel instance — resets buzzedTeamId on every connected phone.
  contestKey: string;
  buzzedTeamId: string | number | null;
  ts: number;
};

export type HillActionPayload = { teamId: string | number; action: "buzz"; ts: number };

function hillChannelName(code: string): string {
  return `hill-${code}`;
}

export function openHillChannel(code: string): RealtimeChannel {
  return supabase.channel(hillChannelName(code), {
    config: { presence: { key: crypto.randomUUID() } },
  });
}

// --- Bounty Board ---
//
// Screen-authoritative, same family as Order Up/Hot Seat — a phone-driven submit/claim/fix is just
// an "action" broadcast folded into the exact same functions the screen's own buttons call. Unlike
// Order Up's independent per-ticket queue, every team answers the SAME shared prompt each round,
// and a round can't advance until every entry (including every escalated re-claim) resolves
// correctly — so the state payload carries one prompt plus two flat lists (this round's original
// entries, and any bounties spawned from a wrong one) rather than a ticket board.
export type BountyBoardRosterEntry = { id: string | number; name: string; color: TeamColor; mascot?: string | null };

export type BountyBoardPhase = "lobby" | "playing" | "final";

// One team's status against the CURRENT round's shared prompt. `text` is the typing-mode draft/
// submission (unused in spoken mode until a Wrong judgment fills it in from what the teacher typed
// in by hand — see BountyBoardGame.tsx). `resolved` covers BOTH ways a team's round obligation gets
// satisfied: answered correctly immediately, or the bounty it spawned was eventually solved by
// someone else — a round only advances once every entry reads resolved.
export type BountyRoundEntry = {
  teamId: string | number;
  text: string;
  submitted: boolean;
  resolved: boolean;
};

// A currently-open (or just-resolved) bounty. The same `id` persists across every escalation —
// fields mutate in place on each miss rather than spawning a new bounty per attempt, so nothing has
// to chase an id chain to find "the current state of this team's original wrong answer."
export type Bounty = {
  id: number;
  originalTeamId: string | number;   // whose round entry this traces back to — flipping THIS
                                      // entry's resolved flag is what unblocks round advancement.
  wrongText: string;                 // the most recent wrong attempt — what a claimant must fix.
  value: number;                     // current payout if claimed correctly: BOUNTY_VALUE * (missCount + 1).
  missCount: number;                 // consecutive wrong attempts so far, always >= 1 once it exists.
  excludedTeamId: string | number;   // most recent team to fail this — cannot reclaim until someone
                                      // else takes it over (then THAT team becomes excluded instead).
  claimedBy?: string | number;       // undefined = open for claiming.
  // Typing-mode only — the claiming team's current fix draft/submission, same role as Order Up's
  // Ticket.submittedSentence. Unused (stays undefined) the whole game through in spoken mode.
  fixText?: string;
  resolved: boolean;
};

export type BountyBoardStatePayload = {
  phase: BountyBoardPhase;
  roster: BountyBoardRosterEntry[];
  connectedTeamIds: (string | number)[];
  roundNumber: number;
  totalRounds: number;
  promptText: string;
  answerMode: "spoken" | "typing";
  roundEntries: BountyRoundEntry[];
  bounties: Bounty[];
  scores: Record<string, number>;
  ts: number;
};

export type BountyBoardActionPayload =
  | { teamId: string | number; action: "submitRound"; text: string }
  | { teamId: string | number; action: "claimBounty"; bountyId: number }
  | { teamId: string | number; action: "submitBountyFix"; bountyId: number; text: string };

function bountyBoardChannelName(code: string): string {
  return `bounty-${code}`;
}

export function openBountyBoardChannel(code: string): RealtimeChannel {
  return supabase.channel(bountyBoardChannelName(code), {
    config: { presence: { key: crypto.randomUUID() } },
  });
}

// --- Class Check-In ---
//
// Not a tenth "game" — a class-scoped meta-channel opened once per sitting (see
// LessonGamesGenerator.tsx's "Start Class Check-In") that tells every checked-in phone WHICH
// specific per-game channel to open next. Every per-game channel above is already prefixed by its
// own game id (e.g. `orderup-${code}` vs `bounty-${code}`), so reusing the exact same code text
// across every one of them for a whole sitting is safe — no collision risk, and it means this
// payload only ever needs to say which game is active, never a new code. Purely a "here's what's
// active" beacon: actual gameplay actions for whichever game is live still flow over THAT game's
// own channel, opened separately by ClassJoinScreen.tsx — never over this one.
export type ClassSessionRosterEntry = { id: string | number; name: string; color: TeamColor; mascot?: string | null };

export type ClassSessionStatePayload = {
  // Which GameMode.id is currently on screen, or null between games (game-select/results/
  // topic-select) and during any non-phone-capable game — a checked-in phone shows the "watch the
  // shared screen" placeholder whenever this is null or isn't in PHONE_CAPABLE_GAME_IDS below.
  activeGame: string | null;
  roster: ClassSessionRosterEntry[];
  connectedTeamIds: (string | number)[];
  ts: number;
};

// No phone -> screen action type here on purpose — a phone never sends anything on this channel,
// it only ever reads `activeGame` to decide which per-game channel to open next. The team claim
// itself travels as Presence (`track()`), exactly like every other game's join screen, not as a
// broadcast event.

function classSessionChannelName(code: string): string {
  return `class-${code}`;
}

export function openClassSessionChannel(code: string): RealtimeChannel {
  return supabase.channel(classSessionChannelName(code), {
    config: { presence: { key: crypto.randomUUID() } },
  });
}

// The 9 games whose own per-game channel a checked-in phone can actually open and drive — kept
// here (not duplicated in LessonGamesGenerator.tsx or ClassJoinScreen.tsx) since this file is
// already the single inventory of every phone-mode channel that exists.
export const PHONE_CAPABLE_GAME_IDS: ReadonlySet<string> = new Set([
  "auction", "spy", "whack", "hotseat", "orderup", "racetrack", "hill", "bounty", "relay",
]);
