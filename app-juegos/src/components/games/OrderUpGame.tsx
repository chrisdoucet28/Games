import { useState, useRef, useCallback, useEffect } from "react";
import type { GameProps } from "../../types";

const QUEUE_SLOTS = 3;
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
// there be — it just means "write a normal affirmative statement"), so they're always available at
// every level. At A1/A2 they're the ONLY grammar items offered; every other transform tag pulled
// from the topic content encodes real tense/structure knowledge and is withheld until B1+.
const SIMPLE_FORMS = ["positive", "negative", "question"] as const;
const SIMPLE_FORM_LABELS: Record<string, string> = {
  positive: "Positive",
  negative: "Negative",
  question: "Question",
};
// A sentence can't be both positive and negative at once — picking one on a ticket rules the
// other out of that same ticket entirely (question can still combine with either).
const MUTUALLY_EXCLUSIVE_FORMS: Record<string, string> = { positive: "negative", negative: "positive" };
// Stacking three unrelated grammar structures into one sentence (e.g. "too much/too many" +
// "past perfect" + "modal obligation") is close to unwritable even for strong students — cap
// grammar items per ticket at 2, so a 3-item ticket always includes at least one vocab word.
const MAX_GRAMMAR_ITEMS_PER_TICKET = 2;

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
// Classic diner fare — one dish gets attached to each individual badge (not one icon per ticket),
// matching the original brief literally: "each food item is tied to ONE fixed English target."
const DINER_FOOD_EMOJIS = ["🍔", "🍟", "🌭", "🍕", "🥤", "🍦", "🥞", "🧇", "🍩", "🍪", "🥧", "🍰"];

function randomFrom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

type TicketItem =
  | { kind: "grammar"; transform: string; label: string; foodEmoji: string }
  | { kind: "vocab"; word: string; foodEmoji: string };
type Ticket = { id: number; items: TicketItem[]; customerEmoji: string; totalSeconds: number; secondsLeft: number };
type JudgingState = { ticketId: number; teamId: string | number } | null;
type Phase = "intro" | "playing";
type Banner = { text: string; kind: "success" | "expired"; key: number };

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
  for (let i = 0; i < itemCount; i++) {
    const grammarLeft = grammarCount >= MAX_GRAMMAR_ITEMS_PER_TICKET
      ? []
      : grammarPool.filter(t => !usedGrammar.has(t) && !excludedGrammar.has(t));
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

function TicketCard({ ticket, teams, judging, onClaim, onCorrect, onWrong }: {
  ticket: Ticket;
  teams: GameProps["teams"];
  judging: JudgingState;
  onClaim: (ticketId: number, teamId: string | number) => void;
  onCorrect: () => void;
  onWrong: () => void;
}) {
  const isJudging = judging?.ticketId === ticket.id;
  const judgingTeam = isJudging ? teams.find(t => t.id === judging!.teamId) : null;
  const pct = Math.max(0, (ticket.secondsLeft / ticket.totalSeconds) * 100);
  const urgent = pct < 25;

  return (
    <div style={{
      width: "230px", background: "linear-gradient(160deg,#FFFFFF,#FFF1F2)", border: `2px solid ${urgent ? "#EF4444" : "#FBCFE8"}`,
      borderRadius: "16px", padding: "12px", textAlign: "center", animation: "ouCustomerIn 0.4s ease-out",
      boxShadow: urgent ? "0 0 16px rgba(239,68,68,0.4)" : "0 4px 14px rgba(190,24,93,0.12)",
    }}>
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
          <div style={{ fontSize: "12px", fontWeight: "800", color: "#9D174D", marginBottom: "6px" }}>
            {judgingTeam?.color.emoji} {judgingTeam?.name} — one sentence, every dish above.
          </div>
          <div style={{ display: "flex", gap: "6px", justifyContent: "center" }}>
            <button onClick={onCorrect} className="ou-btn" style={{ background: "#22C55E", color: "white", border: "none", borderRadius: "10px", padding: "8px 12px", fontSize: "13px", fontWeight: "700", cursor: "pointer", transition: "transform 0.15s ease" }}>✅ Serve it!</button>
            <button onClick={onWrong} className="ou-btn" style={{ background: "#EF4444", color: "white", border: "none", borderRadius: "10px", padding: "8px 12px", fontSize: "13px", fontWeight: "700", cursor: "pointer", transition: "transform 0.15s ease" }}>❌ Wrong</button>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", gap: "4px", justifyContent: "center", flexWrap: "wrap" }}>
          {teams.map(t => (
            <button key={t.id} onClick={() => onClaim(ticket.id, t.id)} className="ou-btn" style={{
              background: t.color.bg, color: "white", border: "none", borderRadius: "8px",
              padding: "5px 9px", fontSize: "11px", fontWeight: "800", cursor: "pointer", transition: "transform 0.15s ease",
            }}>{t.color.emoji} {t.name}</button>
          ))}
        </div>
      )}
    </div>
  );
}

// No internal gameover phase (no lives/vault/rounds, matching Card Shuffle/Sentence Auction) — the
// always-present top-bar "End Game" button in LessonGamesGenerator.tsx handles ending this game.
export function OrderUpGame({ questions, teams, onUpdateScore, level }: GameProps) {
  const isBeginner = level === "A1" || level === "A2";

  const contentGrammarTags = useRef([
    ...new Set(questions.filter(q => q.type === "rewrite sentences" && q.transform).map(q => q.transform as string)),
  ]).current;
  const grammarPool = useRef(isBeginner ? [...SIMPLE_FORMS] : [...SIMPLE_FORMS, ...contentGrammarTags]).current;
  const vocabWordPool = useRef([...new Set(questions.filter(q => q.word).map(q => q.word as string))]).current;

  const [phase, setPhase] = useState<Phase>("intro");
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [judging, setJudging] = useState<JudgingState>(null);
  const [banner, setBanner] = useState<Banner | null>(null);
  const ticketIdRef = useRef(0);
  const bannerIdRef = useRef(0);
  // The session's difficulty "clock" — advances only as orders actually get resolved (served or
  // expired), not as tickets are merely generated, so the ramp tracks real class progress.
  const resolvedCountRef = useRef(0);

  const pushBanner = useCallback((text: string, kind: Banner["kind"]) => {
    const key = bannerIdRef.current++;
    setBanner({ text, kind, key });
    setTimeout(() => setBanner(prev => (prev?.key === key ? null : prev)), 2400);
  }, []);

  useEffect(() => {
    if (phase === "playing" && tickets.length === 0) {
      setTickets(Array.from({ length: QUEUE_SLOTS }, () => generateTicket(grammarPool, vocabWordPool, () => ticketIdRef.current++, resolvedCountRef.current)));
    }
  }, [phase, tickets.length, grammarPool, vocabWordPool]);

  useEffect(() => {
    if (phase !== "playing") return;
    const id = setInterval(() => {
      setTickets(prev => {
        const survivors: Ticket[] = [];
        let expiredCount = 0;
        prev.forEach(t => {
          const secondsLeft = t.secondsLeft - 1;
          if (secondsLeft <= 0) expiredCount += 1;
          else survivors.push({ ...t, secondsLeft });
        });
        if (expiredCount > 0) {
          resolvedCountRef.current += expiredCount;
          pushBanner("😤 A customer left unhappy!", "expired");
        }
        const replacements = Array.from({ length: expiredCount }, () => generateTicket(grammarPool, vocabWordPool, () => ticketIdRef.current++, resolvedCountRef.current));
        return [...survivors, ...replacements];
      });
    }, 1000);
    return () => clearInterval(id);
  }, [phase, grammarPool, vocabWordPool, pushBanner]);

  // If the ticket currently being judged just expired out from under the teacher, drop the judge
  // view instead of leaving it pointed at a ticket that no longer exists.
  useEffect(() => {
    if (judging && !tickets.some(t => t.id === judging.ticketId)) setJudging(null);
  }, [tickets, judging]);

  const claimTicket = (ticketId: number, teamId: string | number) => setJudging({ ticketId, teamId });

  const resolveCorrect = () => {
    if (!judging) return;
    const ticket = tickets.find(t => t.id === judging.ticketId);
    if (!ticket) { setJudging(null); return; }
    const score = ORDER_SCORE_BY_ITEM_COUNT[ticket.items.length] ?? ORDER_SCORE_BY_ITEM_COUNT[1];
    onUpdateScore(judging.teamId, score);
    resolvedCountRef.current += 1;
    const replacement = generateTicket(grammarPool, vocabWordPool, () => ticketIdRef.current++, resolvedCountRef.current);
    setTickets(prev => prev.map(t => (t.id === ticket.id ? replacement : t)));
    pushBanner(`✅ Order served! +${score} pts`, "success");
    setJudging(null);
  };

  const resolveWrong = () => setJudging(null);

  const arenaStyle: React.CSSProperties = {
    margin: "-20px", padding: "20px 20px 26px", borderRadius: "20px", position: "relative", overflow: "hidden",
    background: "radial-gradient(circle at 50% 0%, #FFF1F2 0%, #FFE4E6 55%, #FECDD3 100%)",
  };

  if (phase === "intro") return (
    <div style={{ ...arenaStyle, textAlign: "center" }}>
      {STYLE_TAG}
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ background: "linear-gradient(135deg,#FFFFFF,#FFE4E6)", border: "2px solid #FBCFE8", borderRadius: "20px", padding: "28px 24px", marginBottom: "10px", color: "#831843", maxWidth: "560px", margin: "0 auto 10px", boxShadow: "0 6px 24px rgba(190,24,93,0.18)" }}>
          <div style={{ fontSize: "36px", marginBottom: "10px" }}>🍽️</div>
          <div style={{ fontWeight: "900", fontSize: "20px", marginBottom: "10px", color: "#BE185D" }}>Order Up Diner</div>
          <div style={{ fontSize: "15px", lineHeight: 1.7 }}>
            Customers line up outside the diner — each little dish above their head is one English requirement:
            a sentence <strong style={{ color: "#BE185D" }}>form</strong> (positive, negative, or a question), an <strong style={{ color: "#BE185D" }}>advanced grammar point</strong>, or a specific <strong style={{ color: "#BE185D" }}>vocabulary word</strong>.<br />
            Any team can claim any customer. Write <strong style={{ color: "#BE185D" }}>one sentence</strong> that satisfies every dish at once — the teacher judges. Wait too long and the customer leaves unhappy!
          </div>
        </div>
        <button onClick={() => setPhase("playing")} className="ou-btn" style={{ background: "linear-gradient(135deg,#F43F5E,#FB7185)", color: "white", border: "none", borderRadius: "16px", padding: "16px 48px", fontSize: "19px", fontWeight: "900", cursor: "pointer", boxShadow: "0 6px 24px rgba(244,63,94,0.4)", transition: "transform 0.15s ease" }}>🔔 Open the Diner!</button>
      </div>
    </div>
  );

  return (
    <div style={arenaStyle}>
      {STYLE_TAG}
      {floorStrip}
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
        <div style={{ textAlign: "center", color: "#BE185D", fontWeight: "800", fontSize: "13px", marginBottom: "12px" }}>
          🍽️ Write one sentence that satisfies every dish to serve a customer!
        </div>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
          {tickets.map(t => (
            <TicketCard key={t.id} ticket={t} teams={teams} judging={judging} onClaim={claimTicket} onCorrect={resolveCorrect} onWrong={resolveWrong} />
          ))}
        </div>
      </div>
    </div>
  );
}
