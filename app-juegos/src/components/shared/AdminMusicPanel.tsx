import { ADMIN_COLORS as C } from "./adminColors";
import { GAME_MODES, GAME_ICONS } from "../../data/constants";
import { Icon, type IconName } from "./Icon";
import { MUSIC_FILES, GAME_OVERRIDES, MUSIC_VOLUME, TENSION_VOLUME_SCALE, type MusicContext } from "../../lib/music";

// Short, teacher-facing "when does this actually play" blurbs -- paraphrased from the authoring
// comments already in lib/music.ts (the real source of truth for WHY each override exists), not
// invented here. Only covers games/contexts worth a note; anything not listed just gets the plain
// context name ("Gameplay" / "Tension") with no further explanation.
const CONTEXT_NOTES: Partial<Record<string, Partial<Record<MusicContext, string>>>> = {
  whack: { gameplay: "Brief intro only.", tension: "The whole 90-second whack-a-mole frenzy." },
  auction: { gameplay: "Browsing a lot before bidding.", tension: "The live bid countdown." },
  hotpotato: { gameplay: "The cartoon-chase answering window.", tension: "The exploding-timer moment — reuses Word Whack's carnival-panic track." },
  vault: { gameplay: "Reading the lock and planning the rewrite.", tension: "Actively cracking the lock — mixed closer to gameplay's volume than most games' tension, since the old bigger drop felt too jarring." },
  castle: { tension: "The timed answer under active attack." },
  cards: { tension: "The timed speaking/writing task itself." },
  hill: { tension: "The timed answer during a duel." },
  zombie: { gameplay: "Between waves, bracing for the next one — reuses Rocket Fuel's own build-up track.", tension: "Zombies actively attacking right now." },
  rocket: { tension: "The 90-second fueling turn." },
  orderup: { tension: "Basically the whole game — one shared ticket-filling clock." },
  minefield: { tension: "The speaking phase each turn — the real main event." },
  battleship: { gameplay: "Right after firing, while a team reads the correction — deliberately the most background track in the set.", tension: "Picking a target — reuses Castle Defense's track." },
  hotseat: { tension: "The describe-and-guess turn — basically the whole game." },
  racetrack: { gameplay: "The main racing song for most of the game.", tension: "The final-stretch climax (leader in the last zone) — mixed louder, it's meant to peak, not go quiet." },
  spy: { gameplay: "Free discussion trying to spot the spy.", tension: "The vote, or the spy's under-pressure guess." },
  bounty: { tension: "Once the round is live — teams writing, bounties being claimed." },
  relay: { tension: "The whole question-asking stretch, start to finish." },
};

const CONTEXT_LABEL: Record<MusicContext, string> = { ambient: "Ambient", gameplay: "Gameplay", tension: "Tension" };

function basename(url: string): string {
  return url.split("/").pop() ?? url;
}

function Player({ src }: { src: string }) {
  return (
    // Native controls, not a custom skin -- this page is for the app owner to quickly audition a
    // track, not a teacher-facing surface that needs to match ClassCade's own visual identity.
    <audio controls src={src} style={{ width: "100%", height: 32 }} />
  );
}

const card: React.CSSProperties = { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "14px 16px" };
const sectionLabel: React.CSSProperties = { fontSize: 11, fontWeight: 800, color: C.inkFaint, textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 10 };
const trackRow: React.CSSProperties = { display: "flex", flexDirection: "column", gap: 6, padding: "10px 0" };
const filenamePill: React.CSSProperties = { fontSize: 10.5, fontWeight: 700, color: C.inkFaint, fontFamily: "monospace" };

function SharedTrackCard({ ctx }: { ctx: MusicContext }) {
  return (
    <div style={card}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 13, fontWeight: 800, color: C.ink }}>{CONTEXT_LABEL[ctx]}</span>
        <span style={{ fontSize: 10.5, fontWeight: 700, color: C.inkFaint }}>Volume {Math.round(MUSIC_VOLUME[ctx] * 100)}%</span>
      </div>
      <div style={filenamePill}>{basename(MUSIC_FILES[ctx])}</div>
      <Player src={MUSIC_FILES[ctx]} />
    </div>
  );
}

// One game's Gameplay/Tension rows. A row with no override plays the shared default above (shown
// as a quiet badge, not a re-embedded player -- the shared track is already playable at the top of
// the page, no need for 17 duplicate copies of the same two <audio> elements).
function GameMusicCard({ gameId, name, color, icon }: { gameId: string; name: string; color: string; icon: IconName | undefined }) {
  const overrides = GAME_OVERRIDES[gameId];
  const scale = TENSION_VOLUME_SCALE[gameId];
  const contexts: MusicContext[] = ["gameplay", "tension"];
  return (
    <div style={card}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
        <div style={{ width: 28, height: 28, borderRadius: 8, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: `${color}22`, border: `1px solid ${color}55` }}>
          {icon ? <Icon name={icon} size={15} color={color} /> : null}
        </div>
        <span style={{ fontSize: 13.5, fontWeight: 800, color: C.ink }}>{name}</span>
      </div>
      {contexts.map(ctx => {
        const override = overrides?.[ctx];
        const note = CONTEXT_NOTES[gameId]?.[ctx];
        return (
          <div key={ctx} style={{ ...trackRow, borderTop: `1px solid ${C.border}` }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 11.5, fontWeight: 800, color: C.inkDim }}>{CONTEXT_LABEL[ctx]}</span>
              {!override && <span style={{ fontSize: 10, fontWeight: 700, color: C.inkFaint, fontStyle: "italic" }}>Shared default</span>}
              {override && ctx === "tension" && scale && scale !== 1 && (
                <span style={{ fontSize: 10, fontWeight: 700, color: C.warn }}>Plays {scale}× louder than usual</span>
              )}
            </div>
            {note && <div style={{ fontSize: 11, color: C.inkFaint, fontWeight: 600, lineHeight: 1.4 }}>{note}</div>}
            {override ? (
              <>
                <div style={filenamePill}>{basename(override)}</div>
                <Player src={override} />
              </>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

export function AdminMusicPanel() {
  return (
    <>
      <div style={{ ...sectionLabel, marginTop: 0 }}>Site-wide</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 10 }}>
        <div style={card}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: C.ink }}>Ambient</span>
            <span style={{ fontSize: 10.5, fontWeight: 700, color: C.inkFaint }}>Volume {Math.round(MUSIC_VOLUME.ambient * 100)}%</span>
          </div>
          <div style={{ fontSize: 11, color: C.inkFaint, fontWeight: 600, marginBottom: 6 }}>Menus, setup, results, My Classes, My Profile, Billing — anywhere that isn't active gameplay or a Lesson Plan.</div>
          <div style={filenamePill}>{basename(MUSIC_FILES.ambient)}</div>
          <Player src={MUSIC_FILES.ambient} />
        </div>
      </div>

      <div style={sectionLabel}>Shared defaults</div>
      <div style={{ fontSize: 11.5, color: C.inkFaint, fontWeight: 600, marginTop: -6, marginBottom: 2 }}>
        What plays for any game below that doesn't have its own custom track for that moment.
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 10 }}>
        <SharedTrackCard ctx="gameplay" />
        <SharedTrackCard ctx="tension" />
      </div>

      <div style={sectionLabel}>Per-game tracks ({GAME_MODES.length})</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 10 }}>
        {GAME_MODES.map(g => (
          <GameMusicCard key={g.id} gameId={g.id} name={g.name} color={g.color} icon={GAME_ICONS[g.id]} />
        ))}
      </div>
    </>
  );
}
