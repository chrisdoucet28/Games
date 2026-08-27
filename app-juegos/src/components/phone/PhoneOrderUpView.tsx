import type { OrderUpStatePayload, OrderUpActionPayload, OrderUpTicketItem } from "../../lib/liveSession";

type Props = {
  state: OrderUpStatePayload;
  teamId: string | number;
  onAction: (payload: OrderUpActionPayload) => void;
};

// Small local re-implementation of OrderUpGame.tsx's ItemBadge — can't import a game file's
// internal component from here, and it's a two-line badge, not worth threading through a shared
// file for one reuse.
function ItemBadge({ item }: { item: OrderUpTicketItem }) {
  const label = item.kind === "grammar" ? item.label : `"${item.word}"`;
  const bg = item.kind === "grammar" ? "#FCE7F3" : "#FEF9C3";
  const color = item.kind === "grammar" ? "#9D174D" : "#854D0E";
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", background: bg, color, borderRadius: "10px", padding: "3px 9px", fontSize: "11px", fontWeight: "800", margin: "2px" }}>
      <span style={{ fontSize: "14px" }}>{item.foodEmoji}</span>{label}
    </span>
  );
}

// Screen-authoritative, like PhoneHotSeatView — this view never generates its own tickets or runs
// its own timers, it just renders whatever the screen's latest broadcast says and forwards a claim
// tap back as a one-shot action. Unlike every other phone-mode game, several teams (including this
// one) can be simultaneously "active" here — there's no single "my turn" concept, just an ever-
// changing shared board every connected phone renders its own claimed-vs-open view off of.
export function PhoneOrderUpView({ state, teamId, onAction }: Props) {
  const team = state.roster.find(t => t.id === teamId);

  const wrapStyle: React.CSSProperties = {
    minHeight: "100vh", padding: "20px 18px", fontFamily: "'Segoe UI',system-ui,sans-serif", color: "#831843",
    background: "radial-gradient(ellipse at 50% -10%,#FFE4E6 0%,#FFF1F2 60%,#FFFFFF 100%)",
  };

  if (state.phase === "final") {
    return (
      <div style={{ ...wrapStyle, textAlign: "center", display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ fontSize: "44px", marginBottom: "10px" }}>🔔</div>
        <div style={{ fontWeight: "900", fontSize: "20px", color: "#BE185D" }}>Kitchen's closed!</div>
        <div style={{ color: "#9D174D", fontSize: "14px", marginTop: "8px" }}>Check the big screen for final results.</div>
      </div>
    );
  }

  if (state.phase === "lobby") {
    return (
      <div style={{ ...wrapStyle, textAlign: "center", display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ fontSize: "36px", marginBottom: "6px" }}>{team?.mascot ?? team?.color.emoji}</div>
        <div style={{ fontWeight: "900", fontSize: "18px", color: "#BE185D", marginBottom: "8px" }}>You're in as {team?.name}!</div>
        <div style={{ color: "#9D174D", fontSize: "14px", lineHeight: 1.6 }}>Get ready — waiting for your teacher to open the diner…</div>
      </div>
    );
  }

  const myTickets = state.tickets.filter(t => t.claimedBy === teamId);
  const openTickets = state.tickets.filter(t => t.claimedBy === undefined);

  return (
    <div style={wrapStyle}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
        <span style={{ fontWeight: "900", fontSize: "15px" }}>{team?.mascot ?? team?.color.emoji} {team?.name}</span>
        <span style={{ fontSize: "13px", fontWeight: "800", color: "#BE185D" }}>{state.scores[String(teamId)] ?? 0} pts</span>
      </div>

      {myTickets.length > 0 && (
        <div style={{ marginBottom: "18px" }}>
          <div style={{ fontSize: "12px", fontWeight: "800", color: "#BE185D", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "8px" }}>Your claimed orders</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {myTickets.map(t => (
              <div key={t.id} style={{ background: "white", border: "2px solid #BE185D", borderRadius: "14px", padding: "10px 12px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                  <span style={{ fontSize: "22px" }}>{t.customerEmoji}</span>
                  <span style={{ fontSize: "12px", fontWeight: "800", color: t.secondsLeft <= t.totalSeconds * 0.25 ? "#EF4444" : "#9D174D" }}>⏱️ {t.secondsLeft}s</span>
                </div>
                <div>{t.items.map((item, i) => <ItemBadge key={i} item={item} />)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ fontSize: "12px", fontWeight: "800", color: "#9D174D", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "8px" }}>Open orders — tap to claim</div>
      {openTickets.length === 0 ? (
        <div style={{ fontSize: "13px", color: "#9D174D", opacity: 0.7, padding: "8px 0" }}>No open orders right now.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {openTickets.map(t => (
            <button
              key={t.id}
              onClick={() => onAction({ teamId, action: "claimTicket", ticketId: t.id })}
              style={{ background: "white", border: "1.5px dashed #FBCFE8", borderRadius: "14px", padding: "10px 12px", textAlign: "left", cursor: "pointer" }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                <span style={{ fontSize: "22px" }}>{t.customerEmoji}</span>
                <span style={{ fontSize: "11px", fontWeight: "800", color: "#F43F5E" }}>Claim!</span>
              </div>
              <div>{t.items.map((item, i) => <ItemBadge key={i} item={item} />)}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
