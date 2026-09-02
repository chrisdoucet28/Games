import { useState, useEffect, useRef, useCallback } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import type { GameProps, Team } from "../../types";
import { teamsGridCols, GAME_MODES, GAME_ICONS } from "../../data/constants";
import { denseRank } from "../../utils/ranking";
import { RankBadge } from "../shared/RankBadge";
import { HowToPlayModal } from "../shared/HowToPlayModal";
import { FlagPromptButton } from "../shared/FlagPromptButton";
import { PhoneJoinPanel } from "../shared/PhoneJoinPanel";
import { PhoneReconnectBadge } from "../shared/PhoneReconnectBadge";
import { MASCOT_ICON_BY_EMOJI } from "../shared/TeamIcon";
import { MascotIcon } from "../shared/MascotArt";
import { Icon, type IconName } from "../shared/Icon";
import { AUCTION_TUTORIAL_STEPS } from "../../data/tutorials/auction";
import {
  generateSessionCode, openAuctionChannel, closeChannel,
  type AuctionStatePayload, type AuctionBetPayload, type AuctionResultInfo,
} from "../../lib/liveSession";

const GM = GAME_MODES.find(g => g.id === "auction")!;

interface Bet {
  amount?: number;
  vote?: "true" | "false";
}

interface ResultMsg {
  teamId: string | number;
  won: boolean;
  delta: number;
  vote: string | null;
  amount: number;
  satOut: boolean;
}

const AMBIENT_BITS = Array.from({ length: 14 }, (_, i) => ({
  left: (i * 41) % 100,
  top: (i * 29) % 100,
  size: 10 + (i % 3) * 5,
  dur: 5 + (i % 5),
  delay: (i % 6) * 0.6,
  iconName: (["sparkle", "coin", "wallet", "star"] as const satisfies readonly IconName[])[i % 4],
}));

const STYLE_TAG = (
  <style>{`
    @keyframes auctionDrift{0%{transform:translateY(0) rotate(0deg);opacity:0.15}50%{opacity:0.4}100%{transform:translateY(-30px) rotate(20deg);opacity:0.15}}
    @keyframes spotlightPulse{0%,100%{opacity:0.55}50%{opacity:0.85}}
    @keyframes gavelSwing{0%{transform:rotate(-50deg)}45%{transform:rotate(18deg)}62%{transform:rotate(-8deg)}80%{transform:rotate(4deg)}100%{transform:rotate(0deg)}}
    @keyframes stampSlam{0%{transform:scale(2.6) rotate(-14deg);opacity:0}45%{transform:scale(0.9) rotate(-8deg);opacity:1}65%{transform:scale(1.1) rotate(-9deg)}100%{transform:scale(1) rotate(-7deg);opacity:1}}
    @keyframes chipShimmer{0%,100%{filter:brightness(1)}50%{filter:brightness(1.3)}}
    @keyframes coinFall{0%{transform:translateY(-6px) rotate(0deg);opacity:1}100%{transform:translateY(64px) rotate(200deg);opacity:0}}
    @keyframes ribbonPop{0%{transform:rotate(35deg) scale(0)}70%{transform:rotate(35deg) scale(1.15)}100%{transform:rotate(35deg) scale(1)}}
    @keyframes cardIn{0%{opacity:0;transform:translateY(10px) scale(0.96)}100%{opacity:1;transform:translateY(0) scale(1)}}
    .auction-btn:hover:not(:disabled){transform:translateY(-2px) scale(1.02);filter:brightness(1.08)}
    .auction-btn:active:not(:disabled){transform:translateY(0) scale(0.97)}
    .auction-allin:hover{box-shadow:0 0 14px #F9731688}
  `}</style>
);

function AmbientBackdrop() {
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
      {AMBIENT_BITS.map((b, i) => (
        <div key={i} style={{
          position: "absolute", left: `${b.left}%`, top: `${b.top}%`, color: "#FCD34D", opacity: 0.55,
          animation: `auctionDrift ${b.dur}s ease-in-out infinite ${b.delay}s`,
        }}><Icon name={b.iconName} size={b.size} /></div>
      ))}
    </div>
  );
}

function MascotAvatar({ mascot, color, size = 30 }: { mascot?: string | null; color: string; size?: number }) {
  const iconName = mascot ? MASCOT_ICON_BY_EMOJI[mascot] : undefined;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      width: `${size}px`, height: `${size}px`, borderRadius: "50%",
      background: `radial-gradient(circle at 35% 30%, ${color}66, #1E1033)`,
      border: `2px solid ${color}`,
      boxShadow: `0 0 8px ${color}77`,
    }}>{iconName && <MascotIcon name={iconName} size={Math.round(size * 0.8)} />}</span>
  );
}

function ChipStack({ amount, max = 200 }: { amount: number; max?: number }) {
  const chipCount = amount <= 0 ? 0 : Math.min(6, Math.max(1, Math.ceil((amount / max) * 6)));
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      {Array.from({ length: chipCount }).map((_, i) => (
        <div key={i} style={{
          width: "15px", height: "15px", borderRadius: "50%",
          background: "radial-gradient(circle at 35% 30%, #FDE68A, #D97706 70%, #92400E)",
          border: "1.5px solid #FCD34D", marginLeft: i === 0 ? 0 : "-7px", flexShrink: 0,
          boxShadow: "0 1px 2px rgba(0,0,0,0.5)", animation: `chipShimmer 2.2s ease-in-out infinite ${i * 0.15}s`,
        }} />
      ))}
    </div>
  );
}

// Betting-phase replacement for the on-screen card grid when inputMode === "phone" — teams place
// their actual bets privately on their own devices, so this deliberately shows status only
// (locked in / not yet / not connected), never the vote or amount itself.
function PhoneModeWaitingRoom({ teams, bets, connectedTeamIds, isBroke, allBetsPlaced, activeTeamsEmpty, onReveal }: {
  teams: Team[];
  bets: Record<string | number, Bet>;
  connectedTeamIds: Set<string | number>;
  isBroke: (t: Team) => boolean;
  allBetsPlaced: boolean;
  activeTeamsEmpty: boolean;
  onReveal: () => void;
}) {
  return (
    <div>
      <p style={{ textAlign: "center", fontWeight: "800", color: "#DDD6FE", fontSize: "15px", marginBottom: "14px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
        <Icon name="phone" size={14} /> Teams are betting privately on their phones
      </p>
      <div style={{ display: "grid", gridTemplateColumns: teamsGridCols(teams.length), gap: "12px", marginBottom: "18px" }}>
        {teams.map(t => {
          const broke = isBroke(t);
          const connected = connectedTeamIds.has(t.id);
          const b = bets[t.id];
          const locked = !!b?.vote && !!b?.amount;
          let statusLabel: React.ReactNode = <><Icon name="hourglass" size={12} /> Waiting…</>;
          let statusColor = "#9CA3AF";
          if (broke) { statusLabel = <><Icon name="sleep" size={12} /> Sitting out</>; statusColor = "#6B7280"; }
          else if (!connected) { statusLabel = <><Icon name="sleep" size={12} /> Not connected</>; statusColor = "#6B7280"; }
          else if (locked) { statusLabel = <><Icon name="lock" size={12} /> Locked in</>; statusColor = "#4ADE80"; }
          return (
            <div key={t.id} style={{ background: `linear-gradient(160deg,${t.color.dark}44,#150C28)`, border: `2px solid ${t.color.bg}`, borderRadius: "16px", padding: "14px", textAlign: "center" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "8px" }}>
                <MascotAvatar mascot={t.mascot} color={t.color.bg} />
                <span style={{ fontWeight: "900", color: "white", fontSize: "15px" }}>{t.name}</span>
              </div>
              <div style={{ fontWeight: "800", fontSize: "13px", color: statusColor, display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}>{statusLabel}</div>
            </div>
          );
        })}
      </div>
      <div style={{ textAlign: "center" }}>
        {activeTeamsEmpty ? (
          <button onClick={onReveal} className="auction-btn" style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            background: "linear-gradient(135deg,#4C1D95,#7C3AED)", color: "white", border: "none", borderRadius: "14px",
            padding: "14px 36px", fontSize: "17px", fontWeight: "900", cursor: "pointer", transition: "transform 0.15s ease"
          }}><Icon name="next" size={18} /> Skip to Revival Round</button>
        ) : (
          <>
            <button onClick={onReveal} disabled={!allBetsPlaced} className="auction-btn" style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              background: allBetsPlaced ? "linear-gradient(135deg,#78350F,#F7C948)" : "#4B5563",
              color: allBetsPlaced ? "#150F00" : "#9CA3AF", border: "none", borderRadius: "14px",
              padding: "14px 36px", fontSize: "17px", fontWeight: "900", transition: "transform 0.15s ease",
              cursor: allBetsPlaced ? "pointer" : "not-allowed"
            }}><Icon name="hammer" size={18} /> Reveal Answer</button>
            {!allBetsPlaced && <p style={{ color: "#9CA3AF", fontSize: "13px", marginTop: "8px" }}>Waiting for all connected teams to lock in their bet</p>}
          </>
        )}
      </div>
    </div>
  );
}

// What "Save & Exit" snapshots and "Resume" restores — the current lot number and each team's
// running bank/win count. Resuming skips straight to "betting" on that lot rather than replaying
// the intro screen or whatever bets/result were on screen when it was saved.
type AuctionSnapshot = {
  qi: number;
  auctionBank: Record<string | number, number>;
  roundsWon: Record<string | number, number>;
};

function validateAuctionSnapshot(raw: unknown, questionCount: number): AuctionSnapshot | undefined {
  const s = raw as Partial<AuctionSnapshot> | null | undefined;
  if (!s || typeof s.qi !== "number" || s.qi < 0 || s.qi >= questionCount) return undefined;
  if (!s.auctionBank || typeof s.auctionBank !== "object") return undefined;
  return { qi: s.qi, auctionBank: s.auctionBank, roundsWon: s.roundsWon ?? {} };
}

export function AuctionGame({ questions, teams, onUpdateScore, onEnd, forceFinalRef, serializeStateRef, initialGameState }: GameProps) {
  const AUCTION_START = 200;
  const BET_AMOUNTS = [25, 50, 100];

  const resumed = useRef(validateAuctionSnapshot(initialGameState, questions.length)).current;

  const [qi, setQi] = useState(() => resumed?.qi ?? 0);
  const [phase, setPhase] = useState<"intro" | "betting" | "result" | "final">(resumed ? "betting" : "intro");
  const [showHowTo, setShowHowTo] = useState(false);
  const [bets, setBets] = useState<Record<string | number, Bet>>({});
  const [resultMsg, setResultMsg] = useState<ResultMsg[]>([]);
  const [satOutLastRound, setSatOutLastRound] = useState<Set<string | number>>(new Set());
  // Wins tracked per team across the whole auction — resultMsg itself resets every round, so this
  // is the one thing that needs to survive to the final results screen.
  const [roundsWon, setRoundsWon] = useState<Record<string | number, number>>(() => resumed?.roundsWon ?? {});

  const [auctionBank, setAuctionBank] = useState<Record<string | number, number>>(() =>
    resumed?.auctionBank ?? Object.fromEntries(teams.map(t => [t.id, AUCTION_START]))
  );

  // "Play on Phones" mode — always defaults to screen, even on Resume (see the note on the intro
  // toggle below for why a resumed game intentionally never reopens a phone session).
  const [inputMode, setInputMode] = useState<"screen" | "phone">("screen");
  const [introStep, setIntroStep] = useState<"setup" | "qr">("setup");
  const [sessionCode, setSessionCode] = useState<string | null>(null);
  const [connectedTeamIds, setConnectedTeamIds] = useState<Set<string | number>>(new Set());
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!serializeStateRef) return;
    serializeStateRef.current = (): AuctionSnapshot => ({ qi, auctionBank, roundsWon });
    return () => { if (serializeStateRef) serializeStateRef.current = null; };
  }, [serializeStateRef, qi, auctionBank, roundsWon]);

  const auctionBankRef = useRef(auctionBank);
  const hasFlushedBankRef = useRef(false);
  useEffect(() => { auctionBankRef.current = auctionBank; }, [auctionBank]);

  // Refs the phone-mode broadcaster (below) reads from, so opening/closing the realtime channel
  // only happens when phone mode itself toggles on/off, not on every round/bank/presence change.
  const qiRef = useRef(qi);
  const sentenceRef = useRef(questions[qi]?.sentence ?? "");
  const phaseRef = useRef(phase);
  // resultMsg is what drives sendState()'s per-team win/lose overlay data — it's cleared back to
  // [] at the top of nextRound() in the same tick phase flips off "result", so the overlay
  // disappears on its own the instant the teacher advances, no extra bookkeeping needed.
  const resultMsgRef = useRef(resultMsg);
  const connectedTeamIdsRef = useRef<Set<string | number>>(new Set());
  const sendStateRef = useRef<(() => void) | null>(null);
  useEffect(() => {
    qiRef.current = qi;
    sentenceRef.current = questions[qi]?.sentence ?? "";
    phaseRef.current = phase;
    resultMsgRef.current = resultMsg;
  }, [qi, questions, phase, resultMsg]);

  // Opens/closes the realtime channel only when phone mode itself is toggled on/off — broadcasts
  // a fresh AuctionStatePayload on every presence change and on a standing interval (covers late
  // joiners and reconnects with no separate handshake needed), and folds incoming phone bets
  // straight into the same `bets` state the on-screen cards already use, so resolveRound/
  // nextRound/allBetsPlaced need zero changes to understand a phone-submitted bet.
  useEffect(() => {
    if (inputMode !== "phone" || !sessionCode) return;
    const channel = openAuctionChannel(sessionCode);
    channelRef.current = channel;

    const sendState = () => {
      const currentQuestion = questions[qiRef.current];
      const results: Record<string, AuctionResultInfo> = {};
      resultMsgRef.current.forEach(r => {
        if (!r.satOut) results[String(r.teamId)] = { won: r.won, delta: r.delta, vote: r.vote as "true" | "false" | null, amount: r.amount };
      });
      const payload: AuctionStatePayload = {
        phase: phaseRef.current,
        qi: qiRef.current,
        sentence: sentenceRef.current,
        roster: teams.map(t => ({ id: t.id, name: t.name, color: t.color, mascot: t.mascot })),
        banks: Object.fromEntries(teams.map(t => [String(t.id), auctionBankRef.current[t.id] ?? 0])),
        connectedTeamIds: Array.from(connectedTeamIdsRef.current),
        ts: Date.now(),
        correct: Object.keys(results).length > 0 ? !!currentQuestion?.isCorrect : undefined,
        results: Object.keys(results).length > 0 ? results : undefined,
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
      sendState(); // roster/connected list changed — push a fresh state right away, don't wait for the interval
    });

    channel.on("broadcast", { event: "bet" }, ({ payload }) => {
      const bet = payload as AuctionBetPayload;
      setBets(b => ({ ...b, [bet.teamId]: { vote: bet.vote, amount: bet.amount } }));
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
  }, [inputMode, sessionCode, teams]);

  // Pushes an immediate state update on round/phase transitions rather than waiting for the
  // interval, so a phone doesn't sit on stale content (the previous sentence, or a waiting-room
  // screen after the teacher's already hit Start) for up to ~4s.
  useEffect(() => {
    sendStateRef.current?.();
  }, [qi, phase]);

  // Tells every connected phone the auction is over the moment it actually ends, rather than
  // leaving them to conclude that from silence — without this, closing the channel on unmount
  // (once the teacher clicks through the final screen's own End Game button) looks identical to a
  // dropped connection from the phone's side, and it'd sit on the "lost connection" message for no
  // good reason. `state.phase === "final"` (sent from here on) covers a phone that only
  // reconnects/joins after this point too, not just the phones already listening right now.
  useEffect(() => {
    if (phase === "final" && channelRef.current) {
      channelRef.current.send({ type: "broadcast", event: "ended", payload: {} });
    }
  }, [phase]);

  const flushBankToScores = useCallback(() => {
    if (hasFlushedBankRef.current) return;
    hasFlushedBankRef.current = true;
    teams.forEach(t => {
      const bank = auctionBankRef.current[t.id] ?? 0;
      if (bank > 0) onUpdateScore(t.id, bank);
    });
  }, [teams, onUpdateScore]);

  const flushAndEnd = useCallback(() => {
    flushBankToScores();
    if (forceFinalRef) forceFinalRef.current = null;
    onEnd();
  }, [flushBankToScores, forceFinalRef, onEnd]);

  useEffect(() => {
    if (!forceFinalRef) return;
    forceFinalRef.current = phase === "final" ? null : () => {
      flushBankToScores();
      setPhase("final");
      return true;
    };
    return () => { if (forceFinalRef) forceFinalRef.current = null; };
  }, [forceFinalRef, flushBankToScores, phase]);

  const s = questions[qi];
  if (!s) return null;

  const setBetField = (teamId: string | number, field: keyof Bet, value: any) => {
    setBets(b => ({ ...b, [teamId]: { ...(b[teamId] || {}), [field]: value } }));
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

  const isBroke = (t: any) => (auctionBank[t.id] ?? 0) <= 0;
  // In phone mode, a team with no phone connected (forgotten, dead battery) must not block
  // resolveRound() forever — matches this app's general "teacher stays in control" posture.
  const activeTeams = teams.filter(t => !isBroke(t) && (inputMode === "screen" || connectedTeamIds.has(t.id)));

  const allBetsPlaced = activeTeams.every(t => {
    const b = bets[t.id];
    return b && b.amount && b.amount > 0 && (b.vote === "true" || b.vote === "false");
  });

  const resolveRound = () => {
    const msgs: ResultMsg[] = [];
    const brokeThisRound = new Set<string | number>();
    const newBank = { ...auctionBank };

    teams.forEach(t => {
      if (isBroke(t)) {
        brokeThisRound.add(t.id);
        msgs.push({ teamId: t.id, won: false, delta: 0, vote: null, amount: 0, satOut: true });
        return;
      }
      const b = bets[t.id] || {};
      const amount = b.amount || 0;
      const votedCorrect = b.vote === "true";
      const wasCorrect = !!s.isCorrect;
      const won = votedCorrect === wasCorrect;
      const delta = won ? amount : -amount;
      newBank[t.id] = Math.max(0, (newBank[t.id] ?? 0) + delta);
      msgs.push({ teamId: t.id, won, delta, vote: b.vote || null, amount, satOut: false });
    });

    setAuctionBank(newBank);
    setSatOutLastRound(brokeThisRound);
    setResultMsg(msgs);
    setRoundsWon(prev => {
      const next = { ...prev };
      msgs.forEach(m => { if (m.won) next[m.teamId] = (next[m.teamId] ?? 0) + 1; });
      return next;
    });
    setPhase("result");
  };

  const nextRound = () => {
    if (satOutLastRound.size > 0) {
      setAuctionBank(prev => {
        const next = { ...prev };
        satOutLastRound.forEach(id => { next[id] = (next[id] ?? 0) + 25; });
        return next;
      });
    }

    if (qi + 1 >= questions.length) {
      // Flush the bank into real scores now so the final screen's ranking reflects it, but don't
      // call onEnd yet — show this game's own results first, matching every other game's pattern.
      flushBankToScores();
      setPhase("final");
      return;
    }
    setQi(i => i + 1);
    setBets({});
    setResultMsg([]);
    setPhase("betting");
  };

  const arenaStyle: React.CSSProperties = {
    margin: "-20px", padding: "20px", borderRadius: "20px", position: "relative", overflow: "hidden",
    background: "radial-gradient(ellipse at 50% -10%,#6D28D9 0%,#2E1065 45%,#0F0524 100%)",
  };

  // Tutorial mockup: src/data/tutorials/auction.tsx — update if this intro's rules text changes.
  if (phase === "intro") return (
    <div style={{ ...arenaStyle, textAlign: "center" }}>
      <AmbientBackdrop />
      {STYLE_TAG}
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ position: "relative", background: "linear-gradient(160deg,#3B0764,#1E1033)", border: "2px solid #FCD34D66", borderRadius: "20px", padding: "28px 24px", marginBottom: "10px", color: "white", maxWidth: "520px", margin: "0 auto 10px", boxShadow: "0 0 50px rgba(124,58,237,0.45)", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: "-70px", left: "50%", transform: "translateX(-50%)", width: "280px", height: "220px", background: "radial-gradient(ellipse at 50% 0%,rgba(253,224,71,0.28),transparent 70%)", animation: "spotlightPulse 3s ease-in-out infinite" }} />
          <div style={{ position: "relative", marginBottom: "10px" }}><Icon name="hammer" size={36} /></div>
          <div style={{ position: "relative", fontWeight: "900", fontSize: "20px", marginBottom: "10px", color: "#FCD34D" }}>Sentence Auction</div>
          <div style={{ position: "relative", fontSize: "15px", lineHeight: 1.7, opacity: 0.95 }}>
            A sentence goes up for auction — <strong style={{ color: "#FCD34D" }}>correct or incorrect?</strong> Secretly pick your verdict and <strong style={{ color: "#FCD34D" }}>bet points</strong> on it.<br />
            Win and keep the points, lose and they're gone! Go <strong style={{ color: "#FB923C" }}>All In</strong> for big risk, or bet the <strong>25pt minimum</strong> to stay safe.
          </div>
        </div>
        <div style={{ marginTop: "24px", marginBottom: "20px", fontSize: "14px", color: "#C4B5FD", fontWeight: "600" }}>
          Each team gets a <strong style={{ color: "#FCD34D" }}>200 pt auction bank</strong> — separate from your score. Bet wisely — your final bank total adds to your score!
        </div>
        <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap", marginBottom: "24px" }}>
          {teams.map(t => (
            <div key={t.id} style={{ display: "flex", alignItems: "center", gap: "8px", background: `linear-gradient(160deg,${t.color.dark}55,#1E1033)`, border: `2px solid ${t.color.bg}`, borderRadius: "14px", padding: "8px 18px 8px 10px", fontWeight: "800", fontSize: "14px", color: "white" }}>
              <MascotAvatar mascot={t.mascot} color={t.color.bg} />
              {t.name}
            </div>
          ))}
        </div>
        {introStep === "setup" && (
          <div style={{ marginBottom: "20px" }}>
            <div style={{ fontSize: "13px", color: "#C4B5FD", fontWeight: "700", marginBottom: "10px" }}>How will teams place their bets?</div>
            <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
              <button onClick={handlePickScreenMode} style={{
                padding: "10px 20px", borderRadius: "12px", fontWeight: "800", fontSize: "14px", cursor: "pointer",
                border: `2px solid ${inputMode === "screen" ? "#FCD34D" : "rgba(255,255,255,0.2)"}`,
                background: inputMode === "screen" ? "rgba(253,224,71,0.15)" : "rgba(255,255,255,0.05)",
                color: inputMode === "screen" ? "#FCD34D" : "#C4B5FD",
                display: "inline-flex", alignItems: "center", gap: "6px",
              }}><Icon name="screen" size={14} /> Play on Screen</button>
              <button onClick={handlePickPhoneMode} style={{
                padding: "10px 20px", borderRadius: "12px", fontWeight: "800", fontSize: "14px", cursor: "pointer",
                border: `2px solid ${inputMode === "phone" ? "#FCD34D" : "rgba(255,255,255,0.2)"}`,
                background: inputMode === "phone" ? "rgba(253,224,71,0.15)" : "rgba(255,255,255,0.05)",
                color: inputMode === "phone" ? "#FCD34D" : "#C4B5FD",
                display: "inline-flex", alignItems: "center", gap: "6px",
              }}><Icon name="phone" size={14} /> Play on Phones</button>
            </div>
          </div>
        )}

        {introStep === "qr" && sessionCode && (() => {
          const joinUrl = `${window.location.origin}${window.location.pathname}?join=${sessionCode}`;
          return (
            <PhoneJoinPanel
              sessionCode={sessionCode} joinUrl={joinUrl} teams={teams} connectedTeamIds={connectedTeamIds}
              accent="#FCD34D" panelBg="linear-gradient(160deg,#3B0764,#1E1033)" borderColor="#FCD34D66"
              footer={
                <button onClick={handlePickScreenMode} style={{ background: "none", border: "none", color: "#9CA3AF", fontSize: "12px", fontWeight: "700", cursor: "pointer", textDecoration: "underline" }}>
                  Switch back to Play on Screen
                </button>
              }
            />
          );
        })()}

        <button onClick={() => setShowHowTo(true)} style={{ display: "inline-flex", alignItems: "center", gap: "6px", marginBottom: "14px", background: "rgba(255,255,255,0.95)", color: GM.color, border: `2px solid ${GM.color}`, boxShadow: "0 2px 8px rgba(0,0,0,0.18)", borderRadius: "12px", padding: "10px 24px", fontSize: "14px", fontWeight: "800", cursor: "pointer" }}>
          <Icon name="help" size={15} /> How to Play
        </button>
        {showHowTo && (
          <HowToPlayModal
            gameName={GM.name} gameIcon={GAME_ICONS[GM.id]} accentColor={GM.color}
            steps={AUCTION_TUTORIAL_STEPS}
            onClose={() => setShowHowTo(false)}
          />
        )}
        <button onClick={() => setPhase("betting")} className="auction-btn" style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "linear-gradient(135deg,#78350F,#F7C948)", color: "#150F00", border: "none", borderRadius: "16px", padding: "16px 48px", fontSize: "19px", fontWeight: "900", cursor: "pointer", boxShadow: "0 6px 24px rgba(247,201,72,0.4)", transition: "transform 0.15s ease" }}>
          <Icon name="hammer" size={20} /> Start the Auction!
        </button>
      </div>
    </div>
  );

  if (phase === "final") {
    // Rank by this auction's own bank, not team.score — score is the cross-game running total
    // (already includes whatever a team walked in with from earlier games, plus this auction's
    // flushed-in bank), so ranking by it declared whoever was ahead overall as "winning the
    // auction" even when another team had the bigger bank. A tie for the highest bank shows two
    // gold gavels instead of an arbitrary array-order winner.
    const ranking = denseRank(teams, t => auctionBank[t.id] ?? 0).sort((a, b) => b.value - a.value);
    const winners = ranking.filter(r => r.rank === 0);
    const isTie = winners.length > 1;
    const headline = isTie
      ? `${winners.map(w => w.item.name).join(" & ")} tied for the biggest bank!`
      : `${winners[0]?.item.name} walked away with the biggest bank!`;
    return (
      <div style={{ ...arenaStyle, textAlign: "center" }}>
        <AmbientBackdrop />
        {STYLE_TAG}
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ marginBottom: "6px" }}><Icon name="hammer" size={44} color="#FCD34D" /></div>
          <div style={{ fontWeight: "900", fontSize: "22px", color: "#FCD34D", marginBottom: "16px" }}>{headline}</div>
          <div style={{ display: "grid", gridTemplateColumns: teamsGridCols(teams.length), gap: "10px", margin: "0 auto 20px", maxWidth: "760px" }}>
            {ranking.map(({ item: t, rank, value }) => (
              <div key={t.id} style={{ background: `linear-gradient(160deg,${t.color.dark}55,#1E1033)`, border: `2px solid ${t.color.bg}`, borderRadius: "14px", padding: "12px" }}>
                <div><RankBadge rank={rank} size={22} /></div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", marginTop: "4px" }}>
                  <MascotAvatar mascot={t.mascot} color={t.color.bg} size={24} />
                  <span style={{ fontWeight: "800", color: "white", fontSize: "14px" }}>{t.name}</span>
                </div>
                <div style={{ color: "#FCD34D", fontWeight: "900", fontSize: "16px", marginTop: "4px" }}>{value} final bank</div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "5px", marginTop: "6px" }}>
                  <ChipStack amount={value} />
                </div>
                <div style={{ fontSize: "11px", color: "#C4B5FD", fontWeight: "700", marginTop: "4px" }}>Won {roundsWon[t.id] ?? 0} of {questions.length} lots</div>
              </div>
            ))}
          </div>
          <button onClick={flushAndEnd} className="auction-btn" style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "linear-gradient(135deg,#78350F,#F7C948)", color: "#150F00", border: "none", borderRadius: "14px", padding: "14px 36px", fontSize: "17px", fontWeight: "900", cursor: "pointer", transition: "transform 0.15s ease" }}><Icon name="checkeredFlag" size={18} /> End Game</button>
        </div>
      </div>
    );
  }

  return (
    <div style={arenaStyle}>
      <AmbientBackdrop />
      {STYLE_TAG}
      {inputMode === "phone" && sessionCode && (
        <PhoneReconnectBadge
          sessionCode={sessionCode} joinUrl={`${window.location.origin}${window.location.pathname}?join=${sessionCode}`}
          teams={teams} connectedTeamIds={connectedTeamIds}
          accent="#FCD34D" panelBg="linear-gradient(160deg,#3B0764,#1E1033)" borderColor="#FCD34D66"
        />
      )}
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ position: "relative", background: "linear-gradient(160deg,#3B0764,#1E1033)", border: "2px solid #FCD34D55", borderRadius: "18px", padding: "22px 24px", marginBottom: "18px", textAlign: "center", boxShadow: "0 0 40px rgba(124,58,237,0.35)", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: "-60px", left: "50%", transform: "translateX(-50%)", width: "260px", height: "200px", background: "radial-gradient(ellipse at 50% 0%,rgba(253,224,71,0.22),transparent 70%)", animation: "spotlightPulse 3s ease-in-out infinite" }} />
          <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <span style={{ background: "rgba(253,224,71,0.15)", border: "1px solid #FCD34D55", color: "#FCD34D", padding: "3px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "700", display: "inline-flex", alignItems: "center", gap: "5px" }}><Icon name="hammer" size={12} /> Lot №{qi + 1} of {questions.length}</span>
            <span style={{ background: "rgba(255,255,255,0.12)", color: "white", padding: "3px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "700", display: "inline-flex", alignItems: "center", gap: "5px" }}><Icon name="column" size={12} /> Sentence Auction</span>
          </div>
          <p style={{ position: "relative", fontSize: "clamp(16px,3vw,22px)", fontWeight: "800", color: "white", lineHeight: 1.5, margin: "0 0 8px", fontStyle: "italic" }}>
            "{s.sentence}"
          </p>
          <p style={{ position: "relative", color: "#C4B5FD", fontSize: "14px", margin: 0 }}>
            Is this sentence <strong style={{ color: "#FCD34D" }}>correct</strong> or <strong style={{ color: "#F87171" }}>incorrect</strong>?
          </p>
        </div>

        {phase === "betting" && (inputMode === "phone" ? (
          <PhoneModeWaitingRoom
            teams={teams} bets={bets} connectedTeamIds={connectedTeamIds} isBroke={isBroke}
            allBetsPlaced={allBetsPlaced} activeTeamsEmpty={activeTeams.length === 0} onReveal={resolveRound}
          />
        ) : (
          <div>
            <p style={{ textAlign: "center", fontWeight: "800", color: "#DDD6FE", fontSize: "15px", marginBottom: "14px" }}>Each team: choose TRUE or FALSE, then place your bet</p>
            <div style={{ display: "grid", gridTemplateColumns: teamsGridCols(teams.length), gap: "12px", marginBottom: "18px" }}>
              {teams.map(t => {
                const b = bets[t.id] || {};
                const broke = isBroke(t);

                if (broke) {
                  return (
                    <div key={t.id} style={{ position: "relative", background: "linear-gradient(160deg,#1F1B2E,#120E1E)", border: "3px solid #4B5563", borderRadius: "16px", padding: "14px", opacity: 0.85, textAlign: "center", overflow: "hidden" }}>
                      <div style={{ position: "absolute", top: "12px", right: "-32px", background: "#DC2626", color: "white", fontWeight: "900", fontSize: "10px", letterSpacing: "0.05em", padding: "3px 36px", transform: "rotate(35deg)", boxShadow: "0 2px 6px rgba(0,0,0,0.5)", animation: "ribbonPop 0.4s ease-out" }}>BANKRUPT</div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", marginBottom: "8px" }}>
                        <MascotAvatar mascot={t.mascot} color="#6B7280" />
                        <span style={{ fontWeight: "900", color: "#D1D5DB", fontSize: "15px" }}>{t.name}</span>
                      </div>
                      <div style={{ marginBottom: "6px" }}><Icon name="wallet" size={28} color="#6B7280" /></div>
                      <div style={{ fontWeight: "800", color: "#9CA3AF", fontSize: "13px", marginBottom: "4px" }}>Sitting out this round</div>
                      <div style={{ fontWeight: "700", color: "#4ADE80", fontSize: "12px" }}>+25 pts revival next round!</div>
                    </div>
                  );
                }

                return (
                  <div key={t.id} style={{ background: `linear-gradient(160deg,${t.color.dark}44,#150C28)`, border: `2px solid ${t.color.bg}`, borderRadius: "16px", padding: "14px", animation: "cardIn 0.3s ease-out", boxShadow: `0 0 14px ${t.color.bg}33` }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: "900", color: "white", fontSize: "15px" }}>
                        <MascotAvatar mascot={t.mascot} color={t.color.bg} />
                        {t.name}
                      </span>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <ChipStack amount={auctionBank[t.id] ?? 0} />
                        <span style={{ fontSize: "12px", fontWeight: "800", color: "#FCD34D" }}>{auctionBank[t.id] ?? 0}</span>
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
                      <button onClick={() => setBetField(t.id, "vote", "true")} className="auction-btn" style={{
                        flex: 1, padding: "8px 4px", fontWeight: "800", fontSize: "14px", border: `2px solid ${t.color.bg}`, borderRadius: "10px", cursor: "pointer", transition: "transform 0.15s ease",
                        background: b.vote === "true" ? "#22C55E" : "rgba(255,255,255,0.06)",
                        color: b.vote === "true" ? "white" : "#E5E7EB",
                        display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "5px",
                      }}><Icon name="check" size={13} /> TRUE</button>
                      <button onClick={() => setBetField(t.id, "vote", "false")} className="auction-btn" style={{
                        flex: 1, padding: "8px 4px", fontWeight: "800", fontSize: "14px", border: `2px solid ${t.color.bg}`, borderRadius: "10px", cursor: "pointer", transition: "transform 0.15s ease",
                        background: b.vote === "false" ? "#EF4444" : "rgba(255,255,255,0.06)",
                        color: b.vote === "false" ? "white" : "#E5E7EB",
                        display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "5px",
                      }}><Icon name="close" size={12} /> FALSE</button>
                    </div>

                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                      {BET_AMOUNTS.filter(amt => amt <= (auctionBank[t.id] ?? 0)).map(amt => (
                        <button key={amt} onClick={() => setBetField(t.id, "amount", amt)} className="auction-btn" style={{
                          padding: "5px 10px", fontWeight: "700", fontSize: "13px", transition: "transform 0.15s ease",
                          border: `2px solid ${t.color.bg}`, borderRadius: "8px", cursor: "pointer",
                          background: b.amount === amt ? t.color.bg : "rgba(255,255,255,0.06)",
                          color: b.amount === amt ? "white" : "#E5E7EB"
                        }}>{amt}</button>
                      ))}
                      <button onClick={() => setBetField(t.id, "amount", auctionBank[t.id] ?? 0)} className="auction-btn auction-allin" style={{
                        padding: "5px 10px", fontWeight: "800", fontSize: "12px", transition: "transform 0.15s ease, box-shadow 0.15s ease",
                        border: `2px solid #FB923C`, borderRadius: "8px", cursor: "pointer",
                        background: b.amount === (auctionBank[t.id] ?? 0) ? "linear-gradient(135deg,#C2410C,#FB923C)" : "rgba(251,146,60,0.12)",
                        color: b.amount === (auctionBank[t.id] ?? 0) ? "white" : "#FDBA74",
                        display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "4px",
                      }}><Icon name="flame" size={12} /> ALL IN</button>
                    </div>

                    {b.vote && b.amount && b.amount > 0 && (
                      <div style={{ marginTop: "8px", fontSize: "12px", fontWeight: "700", color: "#FCD34D", background: "rgba(0,0,0,0.25)", borderRadius: "8px", padding: "5px 8px", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}>
                        Betting {b.amount}pts on {b.vote === "true" ? <>TRUE <Icon name="check" size={11} /></> : <>FALSE <Icon name="close" size={10} /></>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div style={{ textAlign: "center" }}>
              {activeTeams.length === 0 ? (
                <>
                  <p style={{ color: "#C4B5FD", fontSize: "13px", marginBottom: "8px" }}>All teams are out — proceed to next round!</p>
                  <button onClick={resolveRound} className="auction-btn" style={{
                    display: "inline-flex", alignItems: "center", gap: "8px",
                    background: "linear-gradient(135deg,#4C1D95,#7C3AED)", color: "white", border: "none", borderRadius: "14px",
                    padding: "14px 36px", fontSize: "17px", fontWeight: "900", cursor: "pointer", transition: "transform 0.15s ease"
                  }}><Icon name="next" size={18} /> Skip to Revival Round</button>
                </>
              ) : (
                <>
                  <button onClick={resolveRound} disabled={!allBetsPlaced} className="auction-btn" style={{
                    display: "inline-flex", alignItems: "center", gap: "8px",
                    background: allBetsPlaced ? "linear-gradient(135deg,#78350F,#F7C948)" : "#4B5563",
                    color: allBetsPlaced ? "#150F00" : "#9CA3AF", border: "none", borderRadius: "14px",
                    padding: "14px 36px", fontSize: "17px", fontWeight: "900", transition: "transform 0.15s ease",
                    cursor: allBetsPlaced ? "pointer" : "not-allowed"
                  }}><Icon name="hammer" size={18} /> Reveal Answer</button>
                  {!allBetsPlaced && <p style={{ color: "#9CA3AF", fontSize: "13px", marginTop: "8px" }}>All active teams must pick TRUE/FALSE and a bet amount</p>}
                </>
              )}
            </div>
          </div>
        ))}

        {phase === "result" && (
          <div key={qi}>
            <div style={{
              position: "relative", background: s.isCorrect ? "linear-gradient(160deg,#052E16,#0A0A18)" : "linear-gradient(160deg,#450A0A,#0A0A18)",
              border: `3px solid ${s.isCorrect ? "#22C55E" : "#EF4444"}`,
              borderRadius: "18px", padding: "18px 20px", textAlign: "center", marginBottom: "16px", overflow: "hidden",
              boxShadow: `0 0 30px ${s.isCorrect ? "#22C55E33" : "#EF444433"}`,
            }}>
              <div style={{ display: "inline-block", transformOrigin: "80% 90%", animation: "gavelSwing 0.6s ease-out" }}><Icon name="hammer" size={40} /></div>
              <div>
                <span style={{
                  display: "inline-block", fontWeight: "900", fontSize: "24px", letterSpacing: "0.06em",
                  color: s.isCorrect ? "#4ADE80" : "#F87171", border: `4px solid ${s.isCorrect ? "#4ADE80" : "#F87171"}`,
                  borderRadius: "8px", padding: "4px 20px", margin: "6px 0 12px",
                  animation: "stampSlam 0.5s cubic-bezier(.2,1.4,.6,1)",
                  textShadow: `0 0 12px ${s.isCorrect ? "#4ADE8088" : "#F8717188"}`,
                }}>
                  {s.isCorrect ? "SOLD! ✔" : "REJECTED! ✘"}
                </span>
              </div>
              <div style={{ fontWeight: "800", fontSize: "15px", color: "white", marginBottom: "6px" }}>
                This sentence is {s.isCorrect ? "CORRECT" : "INCORRECT"}
              </div>
              <p style={{ color: s.isCorrect ? "#86EFAC" : "#FCA5A5", fontSize: "15px", margin: 0, lineHeight: 1.5 }}>{s.explanation}</p>
              <div style={{ position: "absolute", top: "10px", right: "10px" }}>
                <FlagPromptButton gameId="auction" questionData={s} />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: teamsGridCols(teams.length), gap: "10px", marginBottom: "18px" }}>
              {resultMsg.map(r => {
                const t = teams.find(tm => tm.id === r.teamId);
                if (!t) return null;

                if (r.satOut) {
                  return (
                    <div key={r.teamId} style={{ background: "linear-gradient(160deg,#1F1B2E,#120E1E)", border: "3px solid #4B5563", borderRadius: "14px", padding: "12px", textAlign: "center", opacity: 0.85 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", marginBottom: "6px" }}>
                        <MascotAvatar mascot={t.mascot} color="#6B7280" size={24} />
                        <span style={{ fontWeight: "900", fontSize: "15px", color: "#D1D5DB" }}>{t.name}</span>
                      </div>
                      <div style={{ marginBottom: "4px" }}><Icon name="wallet" size={22} color="#6B7280" /></div>
                      <div style={{ fontSize: "13px", color: "#9CA3AF", fontWeight: "700" }}>Sat out</div>
                      <div style={{ fontSize: "12px", color: "#4ADE80", fontWeight: "700", marginTop: "4px" }}>+25 pts next round!</div>
                    </div>
                  );
                }

                return (
                  <div key={r.teamId} style={{
                    position: "relative", overflow: "hidden",
                    background: r.won ? "linear-gradient(160deg,#052E16,#0A0A18)" : "linear-gradient(160deg,#450A0A,#0A0A18)",
                    border: `3px solid ${r.won ? "#22C55E" : "#EF4444"}`,
                    borderRadius: "14px", padding: "12px", textAlign: "center",
                  }}>
                    {r.won && Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} style={{ position: "absolute", top: "6px", left: `${14 + i * 18}%`, animation: `coinFall 0.9s ease-in ${i * 0.08}s both` }}><Icon name="coin" size={13} color="#FCD34D" /></div>
                    ))}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", marginBottom: "6px" }}>
                      <MascotAvatar mascot={t.mascot} color={t.color.bg} size={24} />
                      <span style={{ fontWeight: "900", fontSize: "15px", color: "white" }}>{t.name}</span>
                    </div>
                    <div style={{ fontSize: "13px", marginBottom: "6px", color: "#D1D5DB" }}>
                      Voted: <strong style={{ display: "inline-flex", alignItems: "center", gap: "3px" }}>{r.vote === "true" ? <>TRUE <Icon name="check" size={11} /></> : <>FALSE <Icon name="close" size={10} /></>}</strong> · Bet: <strong>{r.amount}pts</strong>
                    </div>
                    <div style={{ fontWeight: "900", fontSize: "22px", color: r.won ? "#4ADE80" : "#F87171" }}>
                      {r.won ? `+${r.delta}` : `${r.delta}`}
                    </div>
                    <div style={{ fontSize: "13px", color: r.won ? "#86EFAC" : "#FCA5A5", fontWeight: "700" }}>{r.won ? "Correct!" : "Wrong!"}</div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", marginTop: "6px" }}>
                      <ChipStack amount={auctionBank[r.teamId] ?? 0} />
                      <span style={{ fontSize: "12px", color: "#FCD34D", fontWeight: "700" }}>{auctionBank[r.teamId] ?? 0} pts</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ textAlign: "center" }}>
              <button onClick={nextRound} className="auction-btn" style={{
                display: "inline-flex", alignItems: "center", gap: "8px",
                background: "linear-gradient(135deg,#78350F,#F7C948)", color: "#150F00", border: "none",
                borderRadius: "14px", padding: "14px 36px", fontSize: "17px", fontWeight: "900", cursor: "pointer", transition: "transform 0.15s ease"
              }}>{qi + 1 >= questions.length ? <><Icon name="trophy" size={18} /> See Final Results</> : <><Icon name="next" size={18} /> Next Sentence</>}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
