import { useState, useRef, useCallback, useEffect } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import type { GameProps } from "../../types";
import { useTurnTimer } from "../../hooks/useTurnTimer";
import { teamsGridCols, GAME_MODES } from "../../data/constants";
import { denseRank, medalForRank } from "../../utils/ranking";
import { HowToPlayModal } from "../shared/HowToPlayModal";
import { FlagPromptButton } from "../shared/FlagPromptButton";
import { PhoneJoinPanel } from "../shared/PhoneJoinPanel";
import { PhoneReconnectBadge } from "../shared/PhoneReconnectBadge";
import { ORDERUP_TUTORIAL_STEPS } from "../../data/tutorials/orderup";
import {
  generateSessionCode, openOrderUpChannel, closeChannel,
  type OrderUpPhase, type OrderUpStatePayload, type OrderUpActionPayload, type OrderUpTicketInfo,
} from "../../lib/liveSession";

const GM = GAME_MODES.find(g => g.id === "orderup")!;

// The diner queue used to always sit at a fixed 3 customers regardless of class size — a 2-team
// class found that overwhelming (2 people covering 3 orders) while a 5-team class found it too
// quiet (5 teams idling over the same 3). Capacity now scales with team count, and — like the
// item-count difficulty — ramps up from a single customer rather than starting at max immediately.
const MAX_QUEUE_SLOTS_CAP = 6;
const SLOT_RAMP_INTERVAL = 4;
// Floored at 2 (not 1) so solo play still ramps up to two customers waiting at once — the whole
// point of the queue is "orders pile up if you're slow," and with a hard cap of 1 a solo player
// could never actually experience that pressure, no matter how long the session ran. A 2-team
// class already sits at exactly 2 from the plain team-count formula, so this floor doesn't change
// anything for 2+ teams — it only fixes the 1-team case.
function maxQueueSlots(teamCount: number): number {
  return Math.max(2, Math.min(teamCount, MAX_QUEUE_SLOTS_CAP));
}
// Every class used to start at exactly 1 customer no matter how many teams were playing, so a
// 5-team class spent its first several resolutions with only one ticket to fight over. Bigger
// classes now open with more choice on the board from the very first customer, still ramping up
// to the full cap from there rather than starting at max immediately.
function initialQueueSlots(teamCount: number): number {
  return Math.max(1, Math.ceil(teamCount / 2));
}
function currentQueueCapacity(resolvedCount: number, maxSlots: number, initialSlots: number): number {
  return Math.min(maxSlots, initialSlots + Math.floor(resolvedCount / SLOT_RAMP_INTERVAL));
}
// A shared round timer, rather than the old fully open-ended "End Game whenever" model — gives the
// class a race-against-the-clock target ("how many can we serve before time's up?") instead of just
// grinding until the teacher stops it. Picked on the intro screen like Vault Heist's timer speed.
const SESSION_SECONDS_BY_LENGTH: Record<string, number> = { short: 300, medium: 480, long: 720 };
// Every served ticket hands the serving team a dish matching that ticket's food icon — every time
// a team's running count of ONE dish type hits a multiple of DISH_SET_SIZE, they get an instant
// DISH_SET_BONUS combo payout on top of normal per-ticket points (paid immediately, not saved up
// for round-end, so it lands as a real live moment — banner and all — not a hidden final-screen
// calculation). Keeps paying out every DISH_SET_SIZE more of the same dish, no cap.
const DISH_SET_SIZE = 3;
const DISH_SET_BONUS = 30;
// Only charged against a ticket's claiming team when it expires — an unclaimed ticket expiring
// costs nobody (see the expiry interval below). Claiming is a real commitment now, not just "tap
// to open judging": once claimed, that team alone is on the hook if they don't finish in time.
const UNHAPPY_PENALTY = 5;
// Difficulty ramps over the course of the session rather than staying at a flat 50/40/10 the
// whole time — the first RAMP_TO_TWO_ITEM tickets resolved (served or expired) are 1-item only,
// tickets up to RAMP_TO_THREE_ITEM add in 2-item, and only after that does the full 50/40/10 mix
// (including 3-item) unlock. "Resolved" (not "generated") is the session clock, so it only
// advances as the class actually works through orders.
const RAMP_TO_TWO_ITEM = 5;
const RAMP_TO_THREE_ITEM = 15;
// Long on purpose — writing a full sentence (sometimes stacking several constraints) takes a lot
// longer than a shout-answer game's timer, and this is meant to be comfortable even for a slower
// writer, not a race.
const TICKET_SECONDS_BY_ITEM_COUNT: Record<number, number> = { 1: 100, 2: 150, 3: 200 };
// Non-linear — stacking three constraints into one natural sentence is harder than linear, and
// this stays under the 50-100 range this app reserves for rarer bonus events elsewhere.
const ORDER_SCORE_BY_ITEM_COUNT: Record<number, number> = { 1: 10, 2: 25, 3: 45 };

// "Positive"/"negative"/"question" are sentence-FORM categories, not tense-specific content — the
// counterpart to how "negative"/"question" already work as transform tags in the rest of this
// app's content. They need no data lookup at all (there's no "positive" transform tag, nor should
// there be — it just means "write a normal affirmative statement"), so they're always available
// alongside whatever specific transform tags the selected topics themselves contain. There used to
// be an A1/A2-only gate here suppressing every other tag — but a topic's own level (e.g. "Future:
// Will and Going To" and "Zero/First Conditional" are all A2) has nothing to do with whether its
// specific grammar content is appropriate for Order Up: a teacher who explicitly picked that topic
// wants exactly that structure tested, not silently downgraded to bare positive/negative/question.
const SIMPLE_FORMS = ["positive", "negative", "question"] as const;
const SIMPLE_FORM_LABELS: Record<string, string> = {
  positive: "Positive",
  negative: "Negative",
  question: "Question",
};
// A sentence can't be both positive and negative at once — picking one on a ticket rules the
// other out of that same ticket entirely (question can still combine with either).
const MUTUALLY_EXCLUSIVE_FORMS: Record<string, string> = { positive: "negative", negative: "positive" };
// Capped at exactly 1 — stacking two or more unrelated grammar structures into one sentence (e.g.
// "too much/too many" + "past perfect", or even just "negative" + "third conditional") gets
// unwritable fast and only gets worse as more transform tags are added to the content over time.
// A multi-item ticket's other slot(s) always fall back to vocab words instead once this cap is hit.
const MAX_GRAMMAR_ITEMS_PER_TICKET = 1;

function autoLabel(tag: string): string {
  const cleaned = tag.replace(/^tense-/, "");
  return cleaned.split("-").map(w => w[0].toUpperCase() + w.slice(1)).join(" ");
}

// Hand-authored only for the tags whose auto-generated hyphen-split title case reads as gibberish
// to a non-linguist teacher — the rest of the ~80 transform tags in topics.ts are legible enough
// straight out of autoLabel (e.g. "first-conditional" -> "First Conditional").
const GRAMMAR_LABEL_OVERRIDES: Record<string, string> = {
  "ed-adjective": "-ED Adjective (e.g. bored)",
  "ing-adjective": "-ING Adjective (e.g. boring)",
  "can-cant-negative": "Can't (Negative Ability)",
  "can-cant-question": "Can...? (Question)",
  "be-used-to": "Be Used To",
  "get-used-to-recent": "Get Used To",
  "used-to-past": "Used To (Past Habit)",
  "literal-to-idiom": "Turn It Into an Idiom",
  "plain-to-phrasal-verb": "Turn It Into a Phrasal Verb",
  "phrasal-verb-to-plain": "Turn the Phrasal Verb Plain",
  "third-conditional-but-for": "3rd Conditional (But For...)",
  "third-conditional-inversion": "3rd Conditional (Had I...)",
  "causative-verb": "Causative (Have/Get Something Done)",
  "causative-active": "Causative (Active Form)",
  "question-tag": "Question Tag (..., isn't it?)",
  "imperative-to-polite-question": "Turn It Into a Polite Question",
  "wish-if-only": "Wish / If Only",
  "too-much-many": "Too Much / Too Many",
  "so-neither": "So Do I / Neither Do I",
  "prefer-rather": "I'd Prefer / I'd Rather",
  "reason-because": "Give a Reason (because)",
  "invitation-make": "Make an Invitation",
  "invitation-reject": "Reject an Invitation",
  "future-will-instant": "Future (will — instant decision)",
};

function grammarLabel(tag: string): string {
  return SIMPLE_FORM_LABELS[tag] ?? GRAMMAR_LABEL_OVERRIDES[tag] ?? autoLabel(tag);
}

const CUSTOMER_EMOJIS = ["🧑", "👩", "👨", "🧔", "👵", "👴", "🧑‍🦱", "👩‍🦱", "🧑‍🦰", "👩‍🦳"];
// Classic diner fare — one dish per BADGE, each drawn independently, so a multi-item order can mix
// dishes (e.g. a cookie + a pizza on the same ticket). What's shown on a badge is exactly the dish
// serving it hands the team, so bigger orders visibly advance (or complete) more than one combo at
// once — that variety is deliberate, not a limitation to work around.
const DINER_FOOD_EMOJIS = ["🍔", "🍟", "🌭", "🍕", "🥤", "🍦", "🥞", "🧇", "🍩", "🍪", "🥧", "🍰"];

function randomFrom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Each item's foodEmoji IS the dish that item hands the serving team (see resolveCorrect) — no
// separate ticket-level dish field, since a ticket can hand out several different dishes at once.
type TicketItem =
  | { kind: "grammar"; transform: string; label: string; foodEmoji: string }
  | { kind: "vocab"; word: string; foodEmoji: string };
type Ticket = { id: number; items: TicketItem[]; customerEmoji: string; totalSeconds: number; secondsLeft: number; claimedBy?: string | number; submittedSentence?: string };
type JudgingState = { ticketId: number; teamId: string | number } | null;
type Phase = "intro" | "playing" | "final";
type Banner = { text: string; kind: "success" | "expired"; key: number };
type DishCounts = Record<string, number>;

function pickItemCount(resolvedCount: number): number {
  if (resolvedCount < RAMP_TO_TWO_ITEM) return 1;
  if (resolvedCount < RAMP_TO_THREE_ITEM) return Math.random() < 0.55 ? 1 : 2;
  const r = Math.random();
  if (r < 0.5) return 1;
  if (r < 0.9) return 2;
  return 3;
}

// Picks each item's KIND with an even coin flip, independent of how large each pool is — the
// actual content is wildly lopsided (1200+ unique vocab words vs. ~85 grammar options across
// positive/negative/question + every topic's transform tags combined), so slicing one shuffled
// combined pool would make tickets almost never show a grammar badge. Falls back to whichever
// kind still has an unused entry if the flip lands on one this ticket has already exhausted.
function generateTicket(grammarPool: string[], vocabWordPool: string[], nextId: () => number, resolvedCount: number): Ticket {
  const itemCount = pickItemCount(resolvedCount);
  const usedGrammar = new Set<string>();
  const usedVocab = new Set<string>();
  const excludedGrammar = new Set<string>();
  const items: TicketItem[] = [];
  let grammarCount = 0;
  // A 1-item ticket has nothing else on it to anchor a bare form against — "write a positive
  // sentence" alone gives a student no concrete content to write about. Bare forms stay available
  // as the (single, capped) grammar slot on 2-3 item tickets, where they're always paired with at
  // least one vocab word already; a solo ticket's lone slot is restricted to vocab or a specific
  // named structure instead.
  const soloTicket = itemCount === 1;
  for (let i = 0; i < itemCount; i++) {
    const grammarCandidates = grammarCount >= MAX_GRAMMAR_ITEMS_PER_TICKET
      ? []
      : grammarPool.filter(t => !usedGrammar.has(t) && !excludedGrammar.has(t));
    const grammarLeft = soloTicket
      ? grammarCandidates.filter(t => !(SIMPLE_FORMS as readonly string[]).includes(t))
      : grammarCandidates;
    const vocabLeft = vocabWordPool.filter(w => !usedVocab.has(w));
    if (!grammarLeft.length && !vocabLeft.length) break;
    const wantGrammar = Math.random() < 0.5;
    const useGrammar = wantGrammar ? grammarLeft.length > 0 : !vocabLeft.length && grammarLeft.length > 0;
    if (useGrammar) {
      const tag = grammarLeft[Math.floor(Math.random() * grammarLeft.length)];
      usedGrammar.add(tag);
      grammarCount += 1;
      const excluded = MUTUALLY_EXCLUSIVE_FORMS[tag];
      if (excluded) excludedGrammar.add(excluded);
      items.push({ kind: "grammar", transform: tag, label: grammarLabel(tag), foodEmoji: randomFrom(DINER_FOOD_EMOJIS) });
    } else {
      const word = vocabLeft[Math.floor(Math.random() * vocabLeft.length)];
      usedVocab.add(word);
      items.push({ kind: "vocab", word, foodEmoji: randomFrom(DINER_FOOD_EMOJIS) });
    }
  }
  const totalSeconds = TICKET_SECONDS_BY_ITEM_COUNT[items.length] ?? TICKET_SECONDS_BY_ITEM_COUNT[1];
  return {
    id: nextId(),
    items,
    customerEmoji: randomFrom(CUSTOMER_EMOJIS),
    totalSeconds,
    secondsLeft: totalSeconds,
  };
}

function totalDishes(counts: DishCounts | undefined): number {
  if (!counts) return 0;
  return Object.values(counts).reduce((sum, c) => sum + c, 0);
}
function formatClock(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

const STYLE_TAG = (
  <style>{`
    @keyframes ouCustomerIn{0%{opacity:0;transform:translateY(14px) scale(0.92)}100%{opacity:1;transform:translateY(0) scale(1)}}
    @keyframes ouBannerIn{0%{opacity:0;transform:translate(-50%,-16px) scale(0.9)}15%{opacity:1;transform:translate(-50%,0) scale(1.03)}25%{transform:translate(-50%,0) scale(1)}85%{opacity:1;transform:translate(-50%,0) scale(1)}100%{opacity:0;transform:translate(-50%,-10px) scale(0.96)}}
    @keyframes ouUrgentPulse{0%,100%{opacity:1}50%{opacity:0.5}}
    .ou-btn:hover:not(:disabled){transform:translateY(-2px) scale(1.02);filter:brightness(1.08)}
    .ou-btn:active:not(:disabled){transform:translateY(0) scale(0.97)}
  `}</style>
);

// A cute little diner facade — striped awning + hanging sign — sitting above the queue, so the
// board reads as "customers lined up outside a restaurant" rather than an abstract stack of cards.
function DinerFacade() {
  return (
    <div style={{ maxWidth: "700px", margin: "0 auto 16px", borderRadius: "16px 16px 6px 6px", overflow: "hidden", boxShadow: "0 6px 18px rgba(190,24,93,0.18)" }}>
      <div style={{ height: "30px", background: "repeating-linear-gradient(45deg,#F43F5E 0 16px,#FFF1F2 16px 32px)" }} />
      <div style={{ background: "linear-gradient(180deg,#FFE4E6,#FFF1F2)", padding: "8px 16px", textAlign: "center" }}>
        <span style={{ fontWeight: "900", fontSize: "14px", color: "#9D174D", letterSpacing: "0.03em" }}>🍽️ ORDER UP DINER</span>
      </div>
    </div>
  );
}

// Classic diner floor tile strip, purely decorative, anchored along the bottom of the scene.
const floorStrip = (
  <div style={{
    position: "absolute", left: 0, right: 0, bottom: 0, height: "14px",
    background: "repeating-linear-gradient(90deg,#FDA4AF 0 20px,#FFF1F2 20px 40px)",
    opacity: 0.6, pointerEvents: "none",
  }} />
);

function ItemBadge({ item }: { item: TicketItem }) {
  const label = item.kind === "grammar" ? item.label : `"${item.word}"`;
  const bg = item.kind === "grammar" ? "#FCE7F3" : "#FEF9C3";
  const color = item.kind === "grammar" ? "#9D174D" : "#854D0E";
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", background: bg, color, borderRadius: "10px", padding: "3px 9px", fontSize: "11px", fontWeight: "800", margin: "2px" }}>
      <span style={{ fontSize: "14px" }}>{item.foodEmoji}</span>{label}
    </span>
  );
}

function TicketCard({ ticket, teams, judging, isPhoneMode, answerMode, onClaim, onOpenJudging, onRelease, onCorrect, onWrong, onSkip }: {
  ticket: Ticket;
  teams: GameProps["teams"];
  judging: JudgingState;
  isPhoneMode: boolean;
  answerMode: "spoken" | "typing";
  onClaim: (ticketId: number, teamId: string | number) => void;
  onOpenJudging: (ticketId: number) => void;
  onRelease: (ticketId: number) => void;
  onCorrect: () => void;
  onWrong: () => void;
  onSkip: (ticketId: number) => void;
}) {
  const isJudging = judging?.ticketId === ticket.id;
  const judgingTeam = isJudging ? teams.find(t => t.id === judging!.teamId) : null;
  const claimedTeam = ticket.claimedBy !== undefined ? teams.find(t => t.id === ticket.claimedBy) : null;
  // Another ticket is already being judged — the "Ready to judge" tap on this one would no-op, so
  // show it dimmed rather than let a teacher tap it and wonder why nothing happened.
  const judgingBlocked = judging !== null && !isJudging;
  const pct = Math.max(0, (ticket.secondsLeft / ticket.totalSeconds) * 100);
  const urgent = pct < 25;

  return (
    <div style={{
      position: "relative", width: "230px", background: "linear-gradient(160deg,#FFFFFF,#FFF1F2)", border: `2px solid ${urgent ? "#EF4444" : "#FBCFE8"}`,
      borderRadius: "16px", padding: "12px", textAlign: "center", animation: "ouCustomerIn 0.4s ease-out",
      boxShadow: urgent ? "0 0 16px rgba(239,68,68,0.4)" : "0 4px 14px rgba(190,24,93,0.12)",
    }}>
      <div style={{ position: "absolute", top: "6px", right: "6px" }}>
        <FlagPromptButton gameId="orderup" questionData={ticket} />
      </div>
      {/* Timer sits right above the customer's head, not buried under the order — a small clock,
          not a generic progress bar, so it visually reads as "their patience," not "loading." */}
      <div style={{ height: "6px", background: "#FBCFE8", borderRadius: "4px", overflow: "hidden", marginBottom: "6px" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: urgent ? "#EF4444" : "#F43F5E", transition: "width 1s linear" }} />
      </div>
      <div style={{ fontSize: "34px", lineHeight: 1, animation: urgent ? "ouUrgentPulse 0.8s ease-in-out infinite" : "none" }}>{ticket.customerEmoji}</div>

      <div style={{ background: "white", border: "1px dashed #FBCFE8", borderRadius: "10px", padding: "6px", margin: "8px 0", minHeight: "40px" }}>
        {ticket.items.map((item, i) => <ItemBadge key={i} item={item} />)}
      </div>

      {isJudging ? (
        <div>
          {answerMode === "typing" && ticket.submittedSentence ? (
            <div style={{ background: "white", border: "1px solid #FBCFE8", borderRadius: "8px", padding: "6px 10px", margin: "0 0 8px", fontSize: "13px", fontWeight: "700", color: "#831843" }}>
              “{ticket.submittedSentence}”
            </div>
          ) : (
            <div style={{ fontSize: "12px", fontWeight: "800", color: "#9D174D", marginBottom: "6px" }}>
              {judgingTeam?.mascot ?? judgingTeam?.color.emoji} {judgingTeam?.name} — one sentence, every dish above.
            </div>
          )}
          <div style={{ display: "flex", gap: "6px", justifyContent: "center" }}>
            <button onClick={onCorrect} className="ou-btn" style={{ background: "#22C55E", color: "white", border: "none", borderRadius: "10px", padding: "8px 12px", fontSize: "13px", fontWeight: "700", cursor: "pointer", transition: "transform 0.15s ease" }}>✅ Serve it!</button>
            <button onClick={onWrong} className="ou-btn" style={{ background: "#EF4444", color: "white", border: "none", borderRadius: "10px", padding: "8px 12px", fontSize: "13px", fontWeight: "700", cursor: "pointer", transition: "transform 0.15s ease" }}>❌ Wrong</button>
          </div>
        </div>
      ) : claimedTeam ? (
        <div>
          <div style={{ fontSize: "12px", fontWeight: "800", color: claimedTeam.color.dark, marginBottom: "8px" }}>
            {claimedTeam.mascot ?? claimedTeam.color.emoji} Claimed by {claimedTeam.name}
          </div>
          {answerMode === "typing" && ticket.submittedSentence && (
            <div style={{ background: "white", border: "1px solid #FBCFE8", borderRadius: "8px", padding: "6px 10px", margin: "0 0 8px", fontSize: "13px", fontWeight: "700", color: "#831843" }}>
              “{ticket.submittedSentence}”
            </div>
          )}
          <div style={{ display: "flex", gap: "6px", justifyContent: "center", flexWrap: "wrap" }}>
            {answerMode === "typing" && !ticket.submittedSentence ? (
              <div style={{ fontSize: "11px", fontWeight: "700", color: "#9D174D", padding: "8px 0" }}>✍️ {claimedTeam.name} is typing…</div>
            ) : (
              <button
                onClick={() => onOpenJudging(ticket.id)}
                disabled={judgingBlocked}
                className="ou-btn"
                title={judgingBlocked ? "Finish judging the current order first" : undefined}
                style={{
                  background: judgingBlocked ? "#D1D5DB" : "linear-gradient(135deg,#BE185D,#F43F5E)", color: "white", border: "none",
                  borderRadius: "10px", padding: "8px 12px", fontSize: "13px", fontWeight: "700",
                  cursor: judgingBlocked ? "not-allowed" : "pointer", transition: "transform 0.15s ease",
                }}
              >{answerMode === "typing" ? "✅ Judge it" : "🙋 Ready to judge"}</button>
            )}
            <button onClick={() => onRelease(ticket.id)} className="ou-btn" style={{
              background: "none", color: "#9CA3AF", border: "1px solid #E5E7EB", borderRadius: "10px",
              padding: "8px 10px", fontSize: "12px", fontWeight: "700", cursor: "pointer", transition: "transform 0.15s ease",
            }}>Release claim</button>
          </div>
        </div>
      ) : (
        <div>
          {isPhoneMode ? (
            <div style={{ fontSize: "11px", fontWeight: "700", color: "#9D174D", padding: "6px 0" }}>📱 Waiting for a team to claim on their phone…</div>
          ) : (
            <div style={{ display: "flex", gap: "4px", justifyContent: "center", flexWrap: "wrap" }}>
              {teams.map(t => (
                <button key={t.id} onClick={() => onClaim(ticket.id, t.id)} className="ou-btn" style={{
                  background: t.color.bg, color: "white", border: "none", borderRadius: "8px",
                  padding: "5px 9px", fontSize: "11px", fontWeight: "800", cursor: "pointer", transition: "transform 0.15s ease",
                }}>{t.mascot ?? t.color.emoji} {t.name}</button>
              ))}
            </div>
          )}
          {/* No penalty and no stats impact, unlike an expired ticket — this is a deliberate "nobody
              wants this one" call, not a failure, so it shouldn't cost the class anything. Stays a
              teacher/class call regardless of input mode, so it never moves to phones. */}
          <button onClick={() => onSkip(ticket.id)} className="ou-btn" style={{
            marginTop: "6px", background: "none", color: "#9CA3AF", border: "1px solid #E5E7EB",
            borderRadius: "8px", padding: "3px 10px", fontSize: "10px", fontWeight: "700", cursor: "pointer", transition: "transform 0.15s ease",
          }}>⏭️ Skip — no one got it</button>
        </div>
      )}
    </div>
  );
}

// A round-length countdown drives its own "final" phase (results + set-collection payout), but the
// always-present top-bar "End Game" button in LessonGamesGenerator.tsx can still bail out early at
// any time, same as every other game — this only adds a natural end, it doesn't remove the old one.
// What "Save & Exit" snapshots and "Resume" restores — the session length choice, seconds left on
// the shared session clock, the difficulty ramp's resolved-order count, and each team's dish/combo
// tally. Resuming skips straight to "playing" with a fresh (empty) ticket queue that immediately
// tops back up via the existing capacity effect, rather than trying to restore the exact tickets
// and per-ticket countdowns that were on screen when it was saved.
type OrderUpSnapshot = {
  sessionLength: string;
  sessionSecondsLeft: number;
  resolvedCount: number;
  dishCounts: Record<string | number, DishCounts>;
  comboBonusByTeam: Record<string | number, number>;
};

function validateOrderUpSnapshot(raw: unknown): OrderUpSnapshot | undefined {
  const s = raw as Partial<OrderUpSnapshot> | null | undefined;
  if (!s || !SESSION_SECONDS_BY_LENGTH[s.sessionLength ?? ""]) return undefined;
  if (typeof s.sessionSecondsLeft !== "number" || s.sessionSecondsLeft <= 0) return undefined;
  if (typeof s.resolvedCount !== "number" || s.resolvedCount < 0) return undefined;
  return {
    sessionLength: s.sessionLength!,
    sessionSecondsLeft: s.sessionSecondsLeft,
    resolvedCount: s.resolvedCount,
    dishCounts: s.dishCounts ?? {},
    comboBonusByTeam: s.comboBonusByTeam ?? {},
  };
}

export function OrderUpGame({ questions, teams, onUpdateScore, onEnd, forceFinalRef, paused, onTogglePause, serializeStateRef, initialGameState }: GameProps) {
  const resumed = useRef(validateOrderUpSnapshot(initialGameState)).current;

  // A ref (not just the `paused` prop) so the per-ticket countdown interval's closure always reads
  // the latest value without needing to tear down and rebuild the interval every time pause toggles.
  const pausedRef = useRef(false);
  useEffect(() => { pausedRef.current = !!paused; }, [paused]);

  const contentGrammarTags = useRef([
    ...new Set(questions.filter(q => q.type === "rewrite sentences" && q.transform).map(q => q.transform as string)),
  ]).current;
  const grammarPool = useRef([...SIMPLE_FORMS, ...contentGrammarTags]).current;
  const vocabWordPool = useRef([...new Set(questions.filter(q => q.word).map(q => q.word as string))]).current;

  const [phase, setPhase] = useState<Phase>(resumed ? "playing" : "intro");
  const [showHowTo, setShowHowTo] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [sessionLength, setSessionLength] = useState<string>(resumed?.sessionLength ?? "medium");
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [judging, setJudging] = useState<JudgingState>(null);
  const [banner, setBanner] = useState<Banner | null>(null);
  // Per-team tally of collected dishes by emoji, e.g. { teamId: { "🍔": 2, "🍟": 1 } } — one dish is
  // added whenever that team serves a ticket. Combo bonuses fire live off this (see resolveCorrect)
  // the instant one dish type's count hits a multiple of DISH_SET_SIZE.
  const [dishCounts, setDishCounts] = useState<Record<string | number, DishCounts>>(() => resumed?.dishCounts ?? {});
  // Running total of combo bonuses already paid out per team — purely for the final screen's
  // display (the actual points already landed live via onUpdateScore when each combo fired).
  const [comboBonusByTeam, setComboBonusByTeam] = useState<Record<string | number, number>>(() => resumed?.comboBonusByTeam ?? {});

  // "Play on Phones" — lets a team claim from their seat instead of walking up to the shared
  // screen. Available at any team count, including true solo — every ticket is auto-claimed for
  // the sole team the instant it's generated (see the top-up effect below), so solo play still
  // gets everything phone mode offers except an actual claiming step, since there's nobody else to
  // claim against. Always defaults to screen, even on Resume, same as every other phone-mode game.
  const [inputMode, setInputMode] = useState<"screen" | "phone">("screen");
  const [introStep, setIntroStep] = useState<"setup" | "qr">("setup");
  const [sessionCode, setSessionCode] = useState<string | null>(null);
  const [connectedTeamIds, setConnectedTeamIds] = useState<Set<string | number>>(new Set());
  // "spoken": however a team wants to show the teacher their sentence in person (written down,
  // said aloud, whatever) — teacher taps "Ready to judge" once they've seen/heard it (today's only
  // mode). "typing": type it on the claimed phone instead, submit, and the shared screen shows the
  // actual text for the teacher to judge remotely, no need to physically show anyone anything.
  // Whole-session choice, same shape as Hot Seat's teamStructure toggle — never varies per team or
  // per ticket.
  const [answerMode, setAnswerMode] = useState<"spoken" | "typing">("spoken");
  const channelRef = useRef<RealtimeChannel | null>(null);

  const ticketIdRef = useRef(0);
  const bannerIdRef = useRef(0);
  // The session's difficulty "clock" — advances only as orders actually get resolved (served or
  // expired), not as tickets are merely generated, so the ramp tracks real class progress.
  const resolvedCountRef = useRef(resumed?.resolvedCount ?? 0);

  const pushBanner = useCallback((text: string, kind: Banner["kind"]) => {
    const key = bannerIdRef.current++;
    setBanner({ text, kind, key });
    setTimeout(() => setBanner(prev => (prev?.key === key ? null : prev)), 2400);
  }, []);

  const maxSlots = maxQueueSlots(teams.length);
  const initialSlots = initialQueueSlots(teams.length);

  // Combo bonuses are already paid out live as they happen (see resolveCorrect) — nothing left to
  // settle here, this just moves to the results screen.
  const handleSessionEnd = useCallback(() => setPhase("final"), []);

  useEffect(() => {
    if (!forceFinalRef) return;
    forceFinalRef.current = phase === "final" ? null : () => { handleSessionEnd(); return true; };
    return () => { if (forceFinalRef) forceFinalRef.current = null; };
  }, [forceFinalRef, phase, handleSessionEnd]);

  // On resume, seed the shared session clock from the exact seconds left when it was saved rather
  // than handing back a full fresh session (`resumed` is stable for this mount, so this stays
  // pinned to the resumed value rather than re-deriving on every sessionLength change).
  const sessionSeconds = resumed ? resumed.sessionSecondsLeft : SESSION_SECONDS_BY_LENGTH[sessionLength];
  const { timeLeft: sessionTimeLeft } = useTurnTimer(sessionSeconds, phase === "playing", handleSessionEnd, undefined, paused);

  useEffect(() => {
    if (!serializeStateRef) return;
    serializeStateRef.current = (): OrderUpSnapshot => ({
      sessionLength,
      sessionSecondsLeft: sessionTimeLeft,
      resolvedCount: resolvedCountRef.current,
      dishCounts,
      comboBonusByTeam,
    });
    return () => { if (serializeStateRef) serializeStateRef.current = null; };
  }, [serializeStateRef, sessionLength, sessionTimeLeft, dishCounts, comboBonusByTeam]);

  // Tops the queue up to whatever the current ramp allows — fires on mount (spawning the first
  // customer) and again after every resolution (serve/expire), since removing a ticket changes
  // tickets.length and re-triggers this effect. Reading resolvedCountRef.current here (rather than
  // a state value) always reflects the latest count, including a threshold just crossed by the
  // resolution that caused this re-run, so the ramp advances at the moment it should rather than
  // one resolution late.
  useEffect(() => {
    if (phase !== "playing") return;
    const capacity = currentQueueCapacity(resolvedCountRef.current, maxSlots, initialSlots);
    if (tickets.length < capacity) {
      const needed = capacity - tickets.length;
      const newTickets = Array.from({ length: needed }, () => generateTicket(grammarPool, vocabWordPool, () => ticketIdRef.current++, resolvedCountRef.current));
      // Solo play has nobody else to claim against, so there's no "tap to claim" step at all —
      // every ticket is simply already claimed by the one team that exists, the moment it appears.
      // Everything downstream (the claimed-not-judging card, typing mode, judging, expiry penalty)
      // then just works unchanged, with zero teams.length === 1 special-casing anywhere else.
      if (teams.length === 1) newTickets.forEach(t => { t.claimedBy = teams[0].id; });
      setTickets(prev => [...prev, ...newTickets]);
    }
  }, [phase, tickets.length, grammarPool, vocabWordPool, maxSlots, initialSlots, teams]);

  // Mirrors `tickets` for the interval below to read synchronously — the interval callback needs
  // to call onUpdateScore/pushBanner as plain statements, not from inside setTickets' own updater
  // function (React can invoke a setState updater during its own render pass, and calling a
  // DIFFERENT component's setState — onUpdateScore reaches back up to LessonGamesGenerator — from
  // inside one triggers "Cannot update a component while rendering a different component"; the
  // same hazard useTurnTimer.ts's own onExpire comment already warns about).
  const ticketsRef = useRef<Ticket[]>([]);
  useEffect(() => { ticketsRef.current = tickets; }, [tickets]);

  useEffect(() => {
    if (phase !== "playing") return;
    const id = setInterval(() => {
      if (pausedRef.current) return;
      const survivors: Ticket[] = [];
      const expiredTickets: Ticket[] = [];
      ticketsRef.current.forEach(t => {
        const secondsLeft = t.secondsLeft - 1;
        if (secondsLeft <= 0) expiredTickets.push(t);
        else survivors.push({ ...t, secondsLeft });
      });
      // No inline replacement here — the top-up effect above handles spawning new customers once
      // tickets.length changes, so capacity growth from the ramp is picked up naturally.
      setTickets(survivors);
      if (expiredTickets.length > 0) {
        resolvedCountRef.current += expiredTickets.length;
        // Only a ticket's claiming team is on the hook when it expires — an unclaimed ticket
        // expiring costs nobody, since no one ever committed to it.
        const claimedExpired = expiredTickets.filter(t => t.claimedBy !== undefined);
        const unclaimedCount = expiredTickets.length - claimedExpired.length;
        if (claimedExpired.length > 0) {
          const penaltyByTeam = new Map<string | number, number>();
          claimedExpired.forEach(t => {
            const teamId = t.claimedBy!;
            penaltyByTeam.set(teamId, (penaltyByTeam.get(teamId) ?? 0) + UNHAPPY_PENALTY);
          });
          penaltyByTeam.forEach((amount, teamId) => onUpdateScore(teamId, -amount));
        }
        if (claimedExpired.length === 1 && unclaimedCount === 0) {
          const team = teams.find(t => t.id === claimedExpired[0].claimedBy);
          pushBanner(`😤 ${team?.mascot ?? team?.color.emoji ?? ""} ${team?.name ?? "A team"}'s customer left unhappy! -${UNHAPPY_PENALTY}pts`, "expired");
        } else if (claimedExpired.length > 0) {
          const totalPenalty = claimedExpired.length * UNHAPPY_PENALTY;
          const extra = unclaimedCount > 0 ? ` (+${unclaimedCount} unclaimed, no penalty)` : "";
          pushBanner(`😤 ${claimedExpired.length} claimed customer${claimedExpired.length > 1 ? "s" : ""} left unhappy! -${totalPenalty}pts total${extra}`, "expired");
        } else {
          pushBanner(unclaimedCount > 1 ? `😤 ${unclaimedCount} customers left — nobody had claimed them.` : "😤 A customer left — nobody had claimed them.", "expired");
        }
      }
    }, 1000);
    return () => clearInterval(id);
  }, [phase, pushBanner, teams, onUpdateScore]);

  // If the ticket currently being judged just expired out from under the teacher, drop the judge
  // view instead of leaving it pointed at a ticket that no longer exists.
  useEffect(() => {
    if (judging && !tickets.some(t => t.id === judging.ticketId)) setJudging(null);
  }, [tickets, judging]);

  // A team commitment, not "open judging" — claiming just marks the ticket theirs (checked inside
  // the functional updater, not via a separate read beforehand, so two near-simultaneous claims on
  // the same ticket — a screen tap racing a phone broadcast, say — can't both succeed). Judging is
  // now a distinct, later step (see openJudging).
  const claimTicket = (ticketId: number, teamId: string | number) => {
    setTickets(prev => prev.map(t => (t.id === ticketId && t.claimedBy === undefined ? { ...t, claimedBy: teamId } : t)));
  };

  // Teacher-only, screen-side: brings up Serve/Wrong for an already-claimed ticket. No-ops if
  // another ticket is already being judged — the teacher can only listen to one team at a time, and
  // this stops a second "ready to judge" tap from silently stealing the judging slot out from under
  // whichever team is already up, the exact bug the old single-slot claim design had.
  const openJudging = (ticketId: number) => {
    if (judging) return;
    const ticket = tickets.find(t => t.id === ticketId);
    if (ticket?.claimedBy === undefined) return;
    setJudging({ ticketId, teamId: ticket.claimedBy });
  };

  // No-penalty bail-out for a team that claimed something they realize they can't finish — the
  // per-ticket counterpart to the existing no-penalty "Skip" a class can already use on an
  // unclaimed ticket nobody wants to attempt. Clears any typed draft too, so the next team to claim
  // this ticket (same team retrying, or a different one) doesn't inherit a stale sentence.
  const releaseClaim = (ticketId: number) => {
    setTickets(prev => prev.map(t => (t.id === ticketId ? { ...t, claimedBy: undefined, submittedSentence: undefined } : t)));
  };

  // Typing mode only — records a team's current sentence for a ticket they hold. Checking
  // `t.claimedBy === teamId` inside the functional updater (not a separate read beforehand) closes
  // the same race claimTicket already guards against: a submission delayed just long enough to
  // arrive after this ticket was marked Wrong (which clears claimedBy) and reclaimed by someone
  // else shouldn't attach a stale sentence to the new claimant's ticket. Stays freely editable —
  // there's no "final" submit here, just whatever the team's phone last sent; it only locks once
  // the teacher actually opens judging on it (enforced client-side in PhoneOrderUpView.tsx via
  // judgingTicketId, not here — this function itself never needs to know about judging).
  const submitSentence = (ticketId: number, teamId: string | number, sentence: string) => {
    setTickets(prev => prev.map(t => (t.id === ticketId && t.claimedBy === teamId ? { ...t, submittedSentence: sentence } : t)));
  };

  const resolveCorrect = () => {
    if (!judging) return;
    const ticket = tickets.find(t => t.id === judging.ticketId);
    if (!ticket) { setJudging(null); return; }
    const score = ORDER_SCORE_BY_ITEM_COUNT[ticket.items.length] ?? ORDER_SCORE_BY_ITEM_COUNT[1];
    onUpdateScore(judging.teamId, score);
    resolvedCountRef.current += 1;

    // One dish per badge, not one dish for the whole ticket — a multi-item order can advance (or
    // complete) several different combos at once. Tally gains per distinct emoji first (an order
    // can carry two badges of the same dish), then read the team's current counts from render-time
    // state (safe here — a click handler, not an interval, so the closure is already fresh) to work
    // out how many DISH_SET_SIZE thresholds each gain crosses via floor-division deltas, which
    // correctly credits multiple combo completions in one serve if a big gain jumps clean over more
    // than one threshold.
    const gains: Record<string, number> = {};
    ticket.items.forEach(item => { gains[item.foodEmoji] = (gains[item.foodEmoji] ?? 0) + 1; });
    const existingCounts = dishCounts[judging.teamId] ?? {};
    let comboBonusEarned = 0;
    const comboParts: string[] = [];
    Object.entries(gains).forEach(([emoji, gain]) => {
      const before = existingCounts[emoji] ?? 0;
      const after = before + gain;
      const combosHit = Math.floor(after / DISH_SET_SIZE) - Math.floor(before / DISH_SET_SIZE);
      if (combosHit > 0) {
        comboBonusEarned += combosHit * DISH_SET_BONUS;
        comboParts.push(combosHit > 1 ? `${emoji}×${combosHit} combos` : `${emoji} combo`);
      }
    });

    setDishCounts(prev => {
      const teamCounts = { ...(prev[judging.teamId] ?? {}) };
      Object.entries(gains).forEach(([emoji, gain]) => {
        teamCounts[emoji] = (teamCounts[emoji] ?? 0) + gain;
      });
      return { ...prev, [judging.teamId]: teamCounts };
    });
    if (comboBonusEarned > 0) {
      onUpdateScore(judging.teamId, comboBonusEarned);
      setComboBonusByTeam(prev => ({ ...prev, [judging.teamId]: (prev[judging.teamId] ?? 0) + comboBonusEarned }));
    }
    // No inline replacement — removing this ticket changes tickets.length, which re-triggers the
    // top-up effect to spawn a new customer if the current ramp capacity allows it.
    setTickets(prev => prev.filter(t => t.id !== ticket.id));
    pushBanner(
      comboBonusEarned > 0
        ? `✅ Order served! +${score} pts · ${comboParts.join(" · ")}! +${comboBonusEarned} pts`
        : `✅ Order served! +${score} pts`,
      "success",
    );
    setJudging(null);
  };

  // Wrong doesn't cost the ticket itself — it just goes back to the open pool (claimedBy cleared),
  // same team or a different one can reclaim and try again.
  const resolveWrong = () => {
    if (judging) {
      const ticketId = judging.ticketId;
      setTickets(prev => prev.map(t => (t.id === ticketId ? { ...t, claimedBy: undefined, submittedSentence: undefined } : t)));
    }
    setJudging(null);
  };

  // Removes an unclaimed ticket outright — no penalty, no resolvedCount bump, no dish/combo
  // credit. Distinct from letting it expire (which costs every team UNHAPPY_PENALTY points and
  // advances the difficulty ramp) — this is the teacher/class choosing to pass on an order nobody
  // wants to attempt, not a failure. The top-up effect picks up the freed slot on its own once
  // tickets.length changes, same as any other removal.
  const skipTicket = (ticketId: number) => setTickets(prev => prev.filter(t => t.id !== ticketId));

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

  // Refs the phone-mode broadcaster reads synchronously, so opening/closing the realtime channel
  // only happens when phone mode itself toggles on/off, not on every tickets/phase/timer change —
  // same pattern as every other phone-mode game.
  const phaseRef = useRef(phase);
  const sessionTimeLeftRef = useRef(sessionTimeLeft);
  const connectedTeamIdsRef = useRef<Set<string | number>>(new Set());
  const answerModeRef = useRef(answerMode);
  const judgingRef = useRef(judging);
  const sendStateRef = useRef<(() => void) | null>(null);
  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => { sessionTimeLeftRef.current = sessionTimeLeft; }, [sessionTimeLeft]);
  useEffect(() => { answerModeRef.current = answerMode; }, [answerMode]);
  useEffect(() => { judgingRef.current = judging; }, [judging]);

  // Opens/closes the realtime channel only when phone mode itself is toggled on/off. Screen-
  // authoritative like Hot Seat — the ticket queue, timers, and claim/expiry logic all keep running
  // exactly as they do in screen mode; a phone's claim tap is just folded into the exact same
  // claimTicket() function the screen's own buttons call.
  useEffect(() => {
    if (inputMode !== "phone" || !sessionCode) return;
    const channel = openOrderUpChannel(sessionCode);
    channelRef.current = channel;

    const sendState = () => {
      const rawPhase = phaseRef.current;
      const mappedPhase: OrderUpPhase = rawPhase === "intro" ? "lobby" : rawPhase === "final" ? "final" : "playing";
      const broadcastTickets: OrderUpTicketInfo[] = ticketsRef.current.map(t => ({
        id: t.id, items: t.items, customerEmoji: t.customerEmoji,
        totalSeconds: t.totalSeconds, secondsLeft: t.secondsLeft, claimedBy: t.claimedBy,
        submittedSentence: t.submittedSentence,
      }));
      const scores: Record<string, number> = {};
      teams.forEach(t => { scores[String(t.id)] = t.score; });
      const payload: OrderUpStatePayload = {
        phase: mappedPhase,
        roster: teams.map(t => ({ id: t.id, name: t.name, color: t.color, mascot: t.mascot })),
        tickets: broadcastTickets,
        sessionTimeLeft: sessionTimeLeftRef.current,
        scores,
        connectedTeamIds: Array.from(connectedTeamIdsRef.current),
        answerMode: answerModeRef.current,
        judgingTicketId: judgingRef.current?.ticketId ?? null,
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

    // The only place phone input actually touches game logic — validates each action against the
    // live ticket state, then calls the exact same function a screen-mode click would.
    channel.on("broadcast", { event: "action" }, ({ payload }) => {
      const action = payload as OrderUpActionPayload;
      if (phaseRef.current !== "playing") return;
      const ticket = ticketsRef.current.find(t => t.id === action.ticketId);
      if (action.action === "claimTicket") {
        if (!ticket || ticket.claimedBy !== undefined) return;
        claimTicket(action.ticketId, action.teamId);
      } else if (action.action === "submitSentence") {
        if (!ticket || ticket.claimedBy !== action.teamId) return;
        submitSentence(action.ticketId, action.teamId, action.sentence);
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
  }, [inputMode, sessionCode, teams]);

  // Piggybacks on the existing per-second expiry tick (tickets changes every second while playing)
  // instead of a second parallel timer — same trick Hot Seat's timeLeft-keyed effect uses. Also
  // fires immediately on a claim/release/judge resolution, so a phone's own board never sits stale
  // for up to 4s waiting on the standing interval above.
  useEffect(() => {
    sendStateRef.current?.();
  }, [phase, tickets, sessionTimeLeft]);

  // Tells every connected phone the session is over the moment it actually ends.
  useEffect(() => {
    if (phase === "final" && channelRef.current) {
      channelRef.current.send({ type: "broadcast", event: "ended", payload: {} });
    }
  }, [phase]);

  const arenaStyle: React.CSSProperties = {
    margin: "-20px", padding: "20px 20px 26px", borderRadius: "20px", position: "relative", overflow: "hidden",
    background: "radial-gradient(circle at 50% 0%, #FFF1F2 0%, #FFE4E6 55%, #FECDD3 100%)",
  };

  // Tutorial mockup: src/data/tutorials/orderup.tsx — update if this intro's rules text changes.
  if (phase === "intro") return (
    <div style={{ ...arenaStyle, textAlign: "center" }}>
      {STYLE_TAG}
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ background: "linear-gradient(135deg,#FFFFFF,#FFE4E6)", border: "2px solid #FBCFE8", borderRadius: "20px", padding: "28px 24px", marginBottom: "10px", color: "#831843", maxWidth: "560px", margin: "0 auto 10px", boxShadow: "0 6px 24px rgba(190,24,93,0.18)" }}>
          <div style={{ fontSize: "36px", marginBottom: "10px" }}>🍽️</div>
          <div style={{ fontWeight: "900", fontSize: "20px", marginBottom: "10px", color: "#BE185D" }}>Order Up Diner</div>
          <div style={{ fontSize: "15px", lineHeight: 1.7 }}>
            Customers line up outside the diner — each little dish above their head is one English requirement: a sentence form, a grammar point, or a vocabulary word.<br />
            Claim any customer and write <strong style={{ color: "#BE185D" }}>one sentence</strong> that satisfies every dish at once — wait too long once you've claimed one and <strong style={{ color: "#BE185D" }}>your team</strong> loses points!
          </div>
        </div>
        <div style={{ marginBottom: "22px" }}>
          <div style={{ fontSize: "13px", fontWeight: "700", color: "#9D174D", marginBottom: "8px" }}>⏱️ How long is the dinner rush?</div>
          <div style={{ display: "flex", gap: "8px", justifyContent: "center", flexWrap: "wrap" }}>
            {(["short", "medium", "long"] as const).map(len => (
              <button key={len} onClick={() => setSessionLength(len)} className="ou-btn" style={{
                background: sessionLength === len ? "linear-gradient(135deg,#BE185D,#F43F5E)" : "rgba(255,255,255,0.6)",
                color: sessionLength === len ? "white" : "#9D174D",
                border: `2px solid ${sessionLength === len ? "#F43F5E" : "#FBCFE8"}`,
                borderRadius: "12px", padding: "10px 18px", cursor: "pointer",
                fontWeight: "800", fontSize: "14px", transition: "all 0.15s",
              }}>
                {len === "short" ? "Short · 5 min" : len === "medium" ? "Medium · 8 min" : "Long · 12 min"}
              </button>
            ))}
          </div>
        </div>
        <div style={{ marginBottom: "18px" }}>
          <button onClick={() => setShowPreview(v => !v)} className="ou-btn" style={{ background: showPreview ? "#BE185D" : "rgba(255,255,255,0.6)", color: showPreview ? "white" : "#9D174D", border: "2px solid #FBCFE8", borderRadius: "10px", padding: "8px 20px", fontWeight: "800", fontSize: "13px", cursor: "pointer", transition: "all 0.15s" }}>
            {showPreview ? "Hide word & grammar list" : "👁️ Preview words & grammar points"}
          </button>
          {showPreview && (
            <div style={{ background: "rgba(255,255,255,0.75)", border: "2px solid #FBCFE8", borderRadius: "14px", padding: "16px", marginTop: "12px", textAlign: "left", maxWidth: "560px", margin: "12px auto 0" }}>
              {vocabWordPool.length > 0 && (
                <div style={{ marginBottom: grammarPool.length > 0 ? "14px" : 0 }}>
                  <div style={{ fontWeight: "800", fontSize: "12px", color: "#9D174D", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.04em" }}>Possible vocabulary words</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {[...vocabWordPool].sort().map((word, i) => (
                      <span key={`${word}-${i}`} style={{ background: "#FEF9C3", color: "#854D0E", border: "1px solid #FDE68A", borderRadius: "6px", padding: "4px 10px", fontSize: "12px", fontWeight: "700" }}>{word}</span>
                    ))}
                  </div>
                </div>
              )}
              {grammarPool.length > 0 && (
                <div>
                  <div style={{ fontWeight: "800", fontSize: "12px", color: "#9D174D", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.04em" }}>Possible grammar points</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {/* grammarPool itself isn't deduped against SIMPLE_FORMS (a topic's own content
                        can legitimately use "negative"/"question" as transform tags too) — dedupe
                        here so the preview never shows the same label twice. */}
                    {[...new Set(grammarPool)].map(tag => (
                      <span key={tag} style={{ background: "#FCE7F3", color: "#9D174D", border: "1px solid #FBCFE8", borderRadius: "6px", padding: "4px 10px", fontSize: "12px", fontWeight: "700" }}>{grammarLabel(tag)}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        <>
          {introStep === "setup" && (
            <div style={{ marginBottom: "20px" }}>
              <div style={{ fontSize: "13px", color: "#9D174D", fontWeight: "700", marginBottom: "10px" }}>How will orders get answered?</div>
              <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                <button onClick={handlePickScreenMode} className="ou-btn" style={{
                  padding: "10px 20px", borderRadius: "12px", fontWeight: "800", fontSize: "14px", cursor: "pointer",
                  border: `2px solid ${inputMode === "screen" ? "#BE185D" : "rgba(0,0,0,0.1)"}`,
                  background: inputMode === "screen" ? "rgba(190,24,93,0.1)" : "rgba(255,255,255,0.6)",
                  color: inputMode === "screen" ? "#BE185D" : "#9D174D",
                }}>🖥️ Play on Screen</button>
                <button onClick={handlePickPhoneMode} className="ou-btn" style={{
                  padding: "10px 20px", borderRadius: "12px", fontWeight: "800", fontSize: "14px", cursor: "pointer",
                  border: `2px solid ${inputMode === "phone" ? "#BE185D" : "rgba(0,0,0,0.1)"}`,
                  background: inputMode === "phone" ? "rgba(190,24,93,0.1)" : "rgba(255,255,255,0.6)",
                  color: inputMode === "phone" ? "#BE185D" : "#9D174D",
                }}>📱 Play on Phones</button>
              </div>
            </div>
          )}

          {introStep === "qr" && sessionCode && (() => {
            const joinUrl = `${window.location.origin}${window.location.pathname}?join=${sessionCode}&game=orderup`;
            return (
              <PhoneJoinPanel
                sessionCode={sessionCode} joinUrl={joinUrl} teams={teams} connectedTeamIds={connectedTeamIds}
                accent="#BE185D" panelBg="linear-gradient(160deg,#FFFFFF,#FFE4E6)" borderColor="#FBCFE8"
                footer={
                  <button onClick={handlePickScreenMode} style={{ background: "none", border: "none", color: "#9CA3AF", fontSize: "12px", fontWeight: "700", cursor: "pointer", textDecoration: "underline" }}>
                    Switch back to Play on Screen
                  </button>
                }
              >
                <div style={{ marginBottom: "14px" }}>
                  <div style={{ fontSize: "12px", color: "#9D174D", fontWeight: "700", marginBottom: "8px" }}>How will orders be answered?</div>
                  <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                    <button onClick={() => setAnswerMode("spoken")} className="ou-btn" style={{
                      padding: "6px 14px", borderRadius: "10px", fontWeight: "800", fontSize: "12px", cursor: "pointer",
                      border: `2px solid ${answerMode === "spoken" ? "#BE185D" : "rgba(0,0,0,0.1)"}`,
                      background: answerMode === "spoken" ? "rgba(190,24,93,0.15)" : "rgba(255,255,255,0.6)",
                      color: answerMode === "spoken" ? "#BE185D" : "#9D174D",
                    }}>🙋 Show your teacher</button>
                    <button onClick={() => setAnswerMode("typing")} className="ou-btn" style={{
                      padding: "6px 14px", borderRadius: "10px", fontWeight: "800", fontSize: "12px", cursor: "pointer",
                      border: `2px solid ${answerMode === "typing" ? "#BE185D" : "rgba(0,0,0,0.1)"}`,
                      background: answerMode === "typing" ? "rgba(190,24,93,0.15)" : "rgba(255,255,255,0.6)",
                      color: answerMode === "typing" ? "#BE185D" : "#9D174D",
                    }}>⌨️ Type it on your phone</button>
                  </div>
                  <div style={{ fontSize: "11px", color: "#9D174D99", marginTop: "6px" }}>
                    {answerMode === "spoken" ? "A team writes their sentence and shows it to you directly; you decide when to judge it." : "A team types their sentence on their phone — it shows up here for you to judge."}
                  </div>
                </div>
              </PhoneJoinPanel>
            );
          })()}
        </>
        <button onClick={() => setShowHowTo(true)} className="ou-btn" style={{ display: "block", margin: "0 auto 14px", background: "rgba(255,255,255,0.95)", color: GM.color, border: `2px solid ${GM.color}`, boxShadow: "0 2px 8px rgba(0,0,0,0.18)", borderRadius: "12px", padding: "10px 24px", fontSize: "14px", fontWeight: "800", cursor: "pointer" }}>
          ❓ How to Play
        </button>
        {showHowTo && (
          <HowToPlayModal
            gameName={GM.name} gameIcon={GM.icon} accentColor={GM.color}
            steps={ORDERUP_TUTORIAL_STEPS}
            onClose={() => setShowHowTo(false)}
          />
        )}
        <button onClick={() => setPhase("playing")} className="ou-btn" style={{ background: "linear-gradient(135deg,#F43F5E,#FB7185)", color: "white", border: "none", borderRadius: "16px", padding: "16px 48px", fontSize: "19px", fontWeight: "900", cursor: "pointer", boxShadow: "0 6px 24px rgba(244,63,94,0.4)", transition: "transform 0.15s ease" }}>🔔 Open the Diner!</button>
      </div>
    </div>
  );

  if (phase === "final") {
    // Dense rank on final score — two teams tied for first both get gold instead of an
    // arbitrary array-order winner/runner-up split.
    const ranking = denseRank(teams, t => t.score).sort((a, b) => b.value - a.value);
    const winners = ranking.filter(r => r.rank === 0);
    const isTie = winners.length > 1;
    const headline = isTie
      ? `${winners.map(w => w.item.name).join(" & ")} tied for the best dinner rush!`
      : `${winners[0]?.item.name} served the best dinner rush.`;
    return (
      <div style={{ ...arenaStyle, textAlign: "center" }}>
        {STYLE_TAG}
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: "44px", marginBottom: "6px" }}>🔔</div>
          <div style={{ fontWeight: "900", fontSize: "22px", color: "#BE185D", marginBottom: "4px" }}>Kitchen's closed!</div>
          <div style={{ fontSize: "13px", color: "#9D174D", marginBottom: "16px" }}>{headline}</div>
          <div style={{ display: "grid", gridTemplateColumns: teamsGridCols(teams.length), gap: "10px", margin: "0 auto 20px", maxWidth: "760px" }}>
            {ranking.map(({ item: t, rank, value }) => {
              const counts = dishCounts[t.id];
              const bonus = comboBonusByTeam[t.id] ?? 0;
              const served = totalDishes(counts);
              const dishEntries = Object.entries(counts ?? {});
              return (
                <div key={t.id} style={{ background: "linear-gradient(160deg,#FFFFFF,#FFF1F2)", border: `2px solid ${t.color.bg}`, borderRadius: "14px", padding: "12px" }}>
                  <div style={{ fontSize: "20px" }}>{medalForRank(rank)}</div>
                  <div style={{ fontWeight: "800", color: "#831843", fontSize: "14px", marginTop: "4px" }}>{t.mascot ?? t.color.emoji} {t.name}</div>
                  <div style={{ color: "#BE185D", fontWeight: "900", fontSize: "16px", marginTop: "4px" }}>{value} pts</div>
                  <div style={{ fontSize: "11px", color: "#9D174D", marginTop: "4px" }}>{served} order{served === 1 ? "" : "s"} served</div>
                  {dishEntries.length > 0 && (
                    <div style={{ display: "flex", gap: "3px", justifyContent: "center", flexWrap: "wrap", marginTop: "6px" }}>
                      {dishEntries.map(([emoji, count]) => (
                        <span key={emoji} style={{ background: "#FEF9C3", borderRadius: "8px", padding: "2px 6px", fontSize: "11px", fontWeight: "800", color: "#854D0E" }}>{emoji}×{count}</span>
                      ))}
                    </div>
                  )}
                  {bonus > 0 && (
                    <div style={{ fontSize: "11px", fontWeight: "800", color: "#15803D", marginTop: "6px" }}>+{bonus} from combos 🎉</div>
                  )}
                </div>
              );
            })}
          </div>
          <button onClick={onEnd} className="ou-btn" style={{ background: "linear-gradient(135deg,#BE185D,#F43F5E)", color: "white", border: "none", borderRadius: "12px", padding: "12px 28px", fontSize: "16px", fontWeight: "800", cursor: "pointer", transition: "transform 0.15s ease" }}>🏁 End Game</button>
        </div>
      </div>
    );
  }

  return (
    <div style={arenaStyle}>
      {STYLE_TAG}
      {floorStrip}
      {inputMode === "phone" && sessionCode && (
        <PhoneReconnectBadge
          sessionCode={sessionCode} joinUrl={`${window.location.origin}${window.location.pathname}?join=${sessionCode}&game=orderup`}
          teams={teams} connectedTeamIds={connectedTeamIds}
          accent="#BE185D" panelBg="linear-gradient(160deg,#FFFFFF,#FFE4E6)" borderColor="#FBCFE8"
        />
      )}
      {paused && (
        <div onClick={onTogglePause} style={{
          position: "absolute", inset: 0, zIndex: 30, cursor: "pointer", borderRadius: "20px",
          background: "rgba(69,10,10,0.72)", display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <div style={{ textAlign: "center", color: "white" }}>
            <div style={{ fontSize: "44px", marginBottom: "8px" }}>⏸️</div>
            <div style={{ fontWeight: "900", fontSize: "22px", color: "#FDA4AF" }}>Paused</div>
            <div style={{ fontSize: "14px", color: "#FECDD3", marginTop: "6px", fontWeight: "700" }}>Tap to resume</div>
          </div>
        </div>
      )}
      {banner && (
        <div key={banner.key} style={{
          position: "absolute", top: "14px", left: "50%", zIndex: 20, whiteSpace: "nowrap",
          background: banner.kind === "success" ? "linear-gradient(135deg,#15803D,#22C55E)" : "linear-gradient(135deg,#BE185D,#F43F5E)",
          border: `2px solid ${banner.kind === "success" ? "#86EFAC" : "#FBCFE8"}`,
          borderRadius: "14px", padding: "10px 22px", boxShadow: "0 8px 28px rgba(0,0,0,0.25)",
          animation: "ouBannerIn 2.4s ease-in-out forwards",
        }}>
          <span style={{ color: "white", fontWeight: "900", fontSize: "15px", textShadow: "0 1px 3px rgba(0,0,0,0.3)" }}>{banner.text}</span>
        </div>
      )}
      <div style={{ position: "relative", zIndex: 1 }}>
        <DinerFacade />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", margin: "0 auto 10px" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "6px", padding: "5px 14px",
            background: sessionTimeLeft <= 30 ? "#FEE2E2" : "white", border: `2px solid ${sessionTimeLeft <= 30 ? "#EF4444" : "#FBCFE8"}`,
            borderRadius: "999px", fontWeight: "900", fontSize: "13px", color: sessionTimeLeft <= 30 ? "#B91C1C" : "#BE185D",
            animation: sessionTimeLeft <= 30 ? "ouUrgentPulse 0.8s ease-in-out infinite" : "none",
          }}>
            ⏱️ {formatClock(sessionTimeLeft)} left in the rush
          </div>
          {/* Right next to the countdown a teacher is already watching, not just up in the generic
              top bar, so it's actually noticed and used, not just present. */}
          {onTogglePause && (
            <button onClick={onTogglePause} className="ou-btn" title="Freeze the clock so you can explain something to the class" style={{
              background: paused ? "#F59E0B" : "#D97706", color: "white",
              border: paused ? "2px solid #FDE68A" : "2px solid rgba(255,255,255,0.6)",
              borderRadius: "999px", padding: "5px 12px", fontSize: "13px", fontWeight: "800", cursor: "pointer",
              boxShadow: paused ? "0 0 0 3px rgba(245,158,11,0.35)" : "0 2px 6px rgba(217,119,6,0.45)",
            }}>
              {paused ? "▶️ Resume" : "⏸️ Pause"}
            </button>
          )}
        </div>
        <div style={{ textAlign: "center", color: "#BE185D", fontWeight: "800", fontSize: "13px", marginBottom: "10px" }}>
          🍽️ Write one sentence that satisfies every dish to serve a customer!
        </div>
        {Object.keys(dishCounts).length > 0 && (
          <div style={{ display: "flex", gap: "8px", justifyContent: "center", flexWrap: "wrap", marginBottom: "14px" }}>
            {teams.filter(t => totalDishes(dishCounts[t.id]) > 0).map(t => (
              <div key={t.id} style={{ display: "flex", alignItems: "center", gap: "5px", background: "white", border: `1.5px solid ${t.color.bg}`, borderRadius: "999px", padding: "3px 10px" }}>
                <span style={{ fontWeight: "800", fontSize: "11px", color: t.color.dark }}>{t.mascot ?? t.color.emoji} {t.name}:</span>
                {Object.entries(dishCounts[t.id] ?? {}).map(([emoji, count]) => (
                  <span key={emoji} style={{ fontSize: "11px", fontWeight: "700", color: "#854D0E" }}>{emoji}×{count}</span>
                ))}
              </div>
            ))}
          </div>
        )}
        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
          {tickets.map(t => (
            <TicketCard
              key={t.id} ticket={t} teams={teams} judging={judging} isPhoneMode={inputMode === "phone"} answerMode={answerMode}
              onClaim={claimTicket} onOpenJudging={openJudging} onRelease={releaseClaim}
              onCorrect={resolveCorrect} onWrong={resolveWrong} onSkip={skipTicket}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
