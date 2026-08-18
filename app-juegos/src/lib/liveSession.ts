import { supabase } from "./supabaseClient";
import type { RealtimeChannel } from "@supabase/supabase-js";
import type { TeamColor } from "../types";

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
export type AuctionStatePayload = {
  phase: AuctionPhase;
  qi: number;
  sentence: string;
  roster: AuctionRosterEntry[];
  banks: Record<string, number>;
  connectedTeamIds: (string | number)[];
  ts: number;
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
