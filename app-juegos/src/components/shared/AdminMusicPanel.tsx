import { ADMIN_COLORS as C } from "./adminColors";
import { GAME_MODES } from "../../data/constants";
import { MUSIC_FILES, GAME_OVERRIDES, MUSIC_VOLUME, TENSION_VOLUME_SCALE, type MusicContext } from "../../lib/music";

// Short, teacher-facing "when does this actually play" blurbs -- paraphrased from the authoring
// comments already in lib/music.ts (the real source of truth for WHY each override exists), not
// invented here. Keyed by gameId + context; only covers a game's OWN override for that context --
// a game falling through to the shared default gets a plain "(shared default)" tag instead, since
// there's no game-specific moment to describe.
const CONTEXT_NOTES: Partial<Record<string, Partial<Record<MusicContext, string>>>> = {
  whack: { gameplay: "Brief intro only.", tension: "The whole 90-second whack-a-mole frenzy." },
  auction: { gameplay: "Browsing a lot before bidding.", tension: "The live bid countdown." },
  hotpotato: { gameplay: "The cartoon-chase answering window.", tension: "The exploding-timer moment." },
  vault: { gameplay: "Reading the lock and planning the rewrite.", tension: "Actively cracking the lock." },
  castle: { tension: "The timed answer under active attack." },
  cards: { tension: "The timed speaking/writing task itself." },
  hill: { tension: "The timed answer during a duel." },
  zombie: { gameplay: "Between waves, bracing for the next one.", tension: "Zombies actively attacking right now." },
  rocket: { tension: "The 90-second fueling turn." },
  orderup: { tension: "Basically the whole game — one shared ticket-filling clock." },
  minefield: { tension: "The speaking phase each turn — the real main event." },
  battleship: { gameplay: "Right after firing, while a team reads the correction — deliberately the most background track in the set.", tension: "Picking a target." },
  hotseat: { tension: "The describe-and-guess turn — basically the whole game." },
  racetrack: { gameplay: "The main racing song for most of the game.", tension: "The final-stretch climax (leader in the last zone) — mixed louder, it's meant to peak, not go quiet." },
  spy: { gameplay: "Free discussion trying to spot the spy.", tension: "The vote, or the spy's under-pressure guess." },
  bounty: { tension: "Once the round is live — teams writing, bounties being claimed." },
  relay: { tension: "The whole question-asking stretch, start to finish." },
};

const CONTEXT_LABEL: Record<MusicContext, string> = { ambient: "Ambient", gameplay: "Gameplay", tension: "Tension" };

type Usage = { gameName: string; context: MusicContext; note?: string; isDefault: boolean; volumeNote?: string };
type Track = { src: string; usages: Usage[] };

// Builds one entry per unique audio FILE (not per game) -- a track reused across games (e.g.
// whack-tension.mp3 also covers Hot Potato's tension) shows up once, with every place it's heard
// listed underneath, instead of once per game with the same player duplicated.
function buildTracks(): Track[] {
  const bySrc = new Map<string, Track>();
  const get = (src: string): Track => {
    let t = bySrc.get(src);
    if (!t) { t = { src, usages: [] }; bySrc.set(src, t); }
    return t;
  };

  get(MUSIC_FILES.ambient).usages.push({
    gameName: "Site-wide", context: "ambient", isDefault: false,
    note: "Menus, setup, results, My Classes, My Profile, Billing — anywhere that isn't active gameplay or a Lesson Plan.",
  });

  // Seeded even if nothing ends up using them (see the "not heard anywhere right now" note below) --
  // still worth showing as a real, playable track, not silently omitted.
  get(MUSIC_FILES.gameplay);
  get(MUSIC_FILES.tension);

  for (const g of GAME_MODES) {
    (["gameplay", "tension"] as const).forEach(ctx => {
      const override = GAME_OVERRIDES[g.id]?.[ctx];
      const src = override ?? MUSIC_FILES[ctx];
      const scale = ctx === "tension" ? TENSION_VOLUME_SCALE[g.id] : undefined;
      get(src).usages.push({
        gameName: g.name,
        context: ctx,
        isDefault: !override,
        note: override ? CONTEXT_NOTES[g.id]?.[ctx] : undefined,
        volumeNote: scale && scale !== 1 ? `Plays ${scale}× louder than usual here` : undefined,
      });
    });
  }

  return Array.from(bySrc.values());
}

function basename(url: string): string {
  return url.split("/").pop() ?? url;
}

// A track's own "home" context (for showing its base volume) is whichever context it was
// authored for: the shared ambient/gameplay/tension files map 1:1, and every per-game override
// file is only ever assigned to one context across all its usages (nothing mixes a file between
// gameplay and tension), so the first usage's context is always representative.
function homeContext(track: Track): MusicContext {
  if (track.src === MUSIC_FILES.ambient) return "ambient";
  if (track.src === MUSIC_FILES.gameplay) return "gameplay";
  if (track.src === MUSIC_FILES.tension) return "tension";
  return track.usages[0]?.context ?? "gameplay";
}

const card: React.CSSProperties = { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "14px 16px" };

function TrackCard({ track }: { track: Track }) {
  const ctx = homeContext(track);
  const defaultUsages = track.usages.filter(u => u.isDefault);
  const specificUsages = track.usages.filter(u => !u.isDefault);
  const isUnusedSharedDefault = (track.src === MUSIC_FILES.gameplay || track.src === MUSIC_FILES.tension) && track.usages.length === 0;

  return (
    <div style={card}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: 13.5, fontWeight: 800, color: C.ink, fontFamily: "monospace" }}>{basename(track.src)}</span>
        <span style={{ fontSize: 10.5, fontWeight: 700, color: C.inkFaint, flexShrink: 0 }}>Volume {Math.round(MUSIC_VOLUME[ctx] * 100)}%</span>
      </div>
      <audio controls src={track.src} style={{ width: "100%", height: 32, marginBottom: 10 }} />

      <div style={{ fontSize: 10.5, fontWeight: 800, color: C.inkFaint, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
        Where &amp; when it plays
      </div>

      {isUnusedSharedDefault ? (
        <div style={{ fontSize: 11.5, color: C.inkFaint, fontWeight: 600, fontStyle: "italic" }}>
          Not heard anywhere right now — every game that reaches this context ({CONTEXT_LABEL[ctx]}) has its own custom track instead. Kept ready as the fallback for any future game that doesn't get one.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {specificUsages.map((u, i) => (
            <div key={i} style={{ fontSize: 12, lineHeight: 1.45 }}>
              <span style={{ fontWeight: 800, color: C.ink }}>{u.gameName}</span>
              <span style={{ color: C.inkFaint, fontWeight: 700 }}> — {CONTEXT_LABEL[u.context]}</span>
              {u.volumeNote && <span style={{ color: C.warn, fontWeight: 700 }}> · {u.volumeNote}</span>}
              {u.note && <div style={{ color: C.inkFaint, fontWeight: 600, marginTop: 1 }}>{u.note}</div>}
            </div>
          ))}
          {defaultUsages.length > 0 && (
            <div style={{ fontSize: 12, color: C.inkFaint, fontWeight: 600, lineHeight: 1.6 }}>
              <span style={{ fontWeight: 800, color: C.inkDim }}>Shared default for:</span>{" "}
              {defaultUsages.map(u => `${u.gameName} (${CONTEXT_LABEL[u.context]})`).join(", ")}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function AdminMusicPanel() {
  const tracks = buildTracks();
  // Shared/site-wide files first (ambient, then the two generic defaults), then every per-game
  // override file in the order its game first appears in GAME_MODES.
  const sharedSrcs: string[] = [MUSIC_FILES.ambient, MUSIC_FILES.gameplay, MUSIC_FILES.tension];
  const shared = sharedSrcs.map(src => tracks.find(t => t.src === src)!).filter(Boolean);
  const perGame = tracks.filter(t => !sharedSrcs.includes(t.src));

  return (
    <>
      <div style={{ fontSize: 12, color: C.inkFaint, fontWeight: 600, marginBottom: 2 }}>
        {tracks.length} distinct tracks. A track used by more than one game (the same file reused for a
        similar mood elsewhere) is listed once here, with every place it plays underneath.
      </div>

      <div style={{ fontSize: 11, fontWeight: 800, color: C.inkFaint, textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 8 }}>
        Shared / site-wide
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 10 }}>
        {shared.map(t => <TrackCard key={t.src} track={t} />)}
      </div>

      <div style={{ fontSize: 11, fontWeight: 800, color: C.inkFaint, textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 10 }}>
        Per-game tracks ({perGame.length})
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 10 }}>
        {perGame.map(t => <TrackCard key={t.src} track={t} />)}
      </div>
    </>
  );
}
