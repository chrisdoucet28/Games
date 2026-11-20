import { useEffect, useRef, useState } from "react";
import { Icon, type IconName } from "./Icon";
import { MascotIcon, type MascotName } from "./MascotArt";
import { HowToPlayModal, HOW_TO_VIDEOS, VIDEO_BASE } from "./HowToPlayModal";
import { GAME_MODES, GAME_ICONS } from "../../data/constants";
import type { GameMode } from "../../types";

// Everything a first-time visitor sees on the welcome screen below the Start a Game / Lesson Plans
// buttons: a moving wall of the real games (each card shows a still from that game's own How to
// Play video and plays it, muted, when hovered), a 3-step "how it works", and a count-up stat band.
// Purely presentational — no state a teacher cares about. The rows scroll even when the OS asks for reduced motion
// (owner's Windows has animations off and wanted to see it move), so a visible Pause button is the
// off switch instead (WCAG 2.2.2).

const FONT = "'Segoe UI',system-ui,sans-serif";

const css = `
@keyframes ccScrollL{from{transform:translateX(0)}to{transform:translateX(-50%)}}
@keyframes ccScrollR{from{transform:translateX(-50%)}to{transform:translateX(0)}}
@keyframes ccFloat{0%,100%{transform:translateY(0) rotate(var(--r))}50%{transform:translateY(-14px) rotate(calc(var(--r) * -1))}}
@keyframes ccPop{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}
.cc-row{display:flex;gap:16px;width:max-content;will-change:transform}
.cc-row.l{animation:ccScrollL 100s linear infinite}
.cc-row.r{animation:ccScrollR 110s linear infinite}
.cc-rows:hover .cc-row{animation-play-state:paused}
.cc-card{position:relative;flex:0 0 auto;width:300px;height:176px;border-radius:16px;overflow:hidden;cursor:pointer;border:2px solid rgba(255,255,255,0.18);background:#0C1E3D;transition:transform .2s ease,box-shadow .2s ease,border-color .2s ease;padding:0;font-family:${FONT};text-align:left}
.cc-card:hover,.cc-card:focus-visible{transform:translateY(-6px) scale(1.03);border-color:var(--c);box-shadow:0 14px 34px rgba(0,0,0,0.45),0 0 0 2px var(--c);outline:none}
.cc-card img,.cc-card video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.cc-step{animation:ccPop .6s ease both}
@media (max-width:900px){.cc-float{display:none!important}}
.cc-paused .cc-row{animation-play-state:paused!important}`;

// The floating mascots that bob around the title. Fixed list so the page looks the same every visit.
const FLOATERS: { name: MascotName; left?: string; right?: string; top: string; size: number; r: string; delay: string; dur: string }[] = [
  { name: "dragon", left: "-4%", top: "4%", size: 64, r: "-10deg", delay: "0s", dur: "5.2s" },
  { name: "fox", left: "7%", top: "62%", size: 52, r: "8deg", delay: "-1.4s", dur: "4.6s" },
  { name: "robot", right: "-3%", top: "10%", size: 62, r: "9deg", delay: "-0.6s", dur: "5.8s" },
  { name: "penguin", right: "8%", top: "66%", size: 50, r: "-7deg", delay: "-2.2s", dur: "4.9s" },
  { name: "unicorn", left: "-12%", top: "40%", size: 46, r: "6deg", delay: "-3s", dur: "6.1s" },
  { name: "octopus", right: "-11%", top: "42%", size: 46, r: "-8deg", delay: "-1s", dur: "5.5s" },
];

export function FloatingMascots() {
  return (
    <>
      <style>{css}</style>
      {FLOATERS.map(f => (
        <div
          key={f.name}
          className="cc-float"
          aria-hidden="true"
          style={{
            position: "absolute", left: f.left, right: f.right, top: f.top, pointerEvents: "none",
            ["--r" as string]: f.r, animation: `ccFloat ${f.dur} ease-in-out ${f.delay} infinite`,
            filter: "drop-shadow(0 8px 14px rgba(0,0,0,0.35))",
          }}
        >
          <MascotIcon name={f.name} size={f.size} />
        </div>
      ))}
    </>
  );
}

function GameCard({ game, onOpen, decoy }: { game: GameMode; onOpen: (g: GameMode) => void; decoy?: boolean }) {
  const [hover, setHover] = useState(false);
  const file = HOW_TO_VIDEOS[game.id];
  return (
    <button
      className="cc-card"
      style={{ ["--c" as string]: game.color }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
      onClick={() => onOpen(game)}
      aria-label={`${game.name}: watch how it works`}
      aria-hidden={decoy || undefined}
      tabIndex={decoy ? -1 : undefined}
    >
      {file && <img src={`${VIDEO_BASE}/${file}.jpg`} alt="" loading="lazy" draggable={false} />}
      {file && hover && <video src={`${VIDEO_BASE}/${file}.mp4`} autoPlay muted loop playsInline preload="none" />}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(7,16,40,0) 35%,rgba(7,16,40,0.92) 100%)" }} />
      <div style={{ position: "absolute", left: 12, right: 12, bottom: 10, display: "flex", flexDirection: "column", gap: 3 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Icon name={GAME_ICONS[game.id]} size={20} color={game.color} />
          <span style={{ color: "white", fontWeight: 800, fontSize: 15 }}>{game.name}</span>
        </div>
        <span style={{ color: "rgba(255,255,255,0.82)", fontSize: 11.5, lineHeight: 1.35 }}>{game.tag}</span>
      </div>
      <span style={{ position: "absolute", top: 10, right: 10, background: "rgba(0,0,0,0.55)", color: "white", fontSize: 10.5, fontWeight: 800, letterSpacing: "0.04em", padding: "4px 9px", borderRadius: 999, display: "flex", alignItems: "center", gap: 4 }}>
        &#9654; WATCH
      </span>
    </button>
  );
}

export function GameShowcase({ headingFont }: { headingFont?: string }) {
  const [open, setOpen] = useState<GameMode | null>(null);
  const [paused, setPaused] = useState(false);
  const half = Math.ceil(GAME_MODES.length / 2);
  const rowA = GAME_MODES.slice(0, half);
  const rowB = GAME_MODES.slice(half);
  // Each row is rendered twice back to back so the -50% scroll loops seamlessly.
  const renderRow = (games: GameMode[], dir: "l" | "r") => (
    <div className={`cc-row ${dir}`}>
      {[...games, ...games, ...games, ...games].map((g, i) => <GameCard key={`${g.id}-${i}`} game={g} onOpen={setOpen} decoy={i >= games.length} />)}
    </div>
  );
  return (
    <section aria-label="The games" style={{ width: "100vw", marginLeft: "calc(50% - 50vw)", marginTop: 44 }}>
      <h2 style={{ margin: "0 20px 6px", color: "white", fontSize: "clamp(22px,3.4vw,32px)", fontWeight: 900, textAlign: "center", fontFamily: headingFont }}>
        {GAME_MODES.length} games. Pick one, play in seconds.
      </h2>
      <p style={{ margin: "0 20px 20px", color: "rgba(255,255,255,0.78)", textAlign: "center", fontSize: 15 }}>
        Hover a game to preview it, or click to see how it works.
      </p>
      <div className={paused ? "cc-rows cc-paused" : "cc-rows"} style={{ overflow: "hidden", display: "flex", flexDirection: "column", gap: 16, padding: "10px 0 14px", maskImage: "linear-gradient(90deg,transparent,#000 6%,#000 94%,transparent)", WebkitMaskImage: "linear-gradient(90deg,transparent,#000 6%,#000 94%,transparent)" }}>
        {renderRow(rowA, "l")}
        {renderRow(rowB, "r")}
      </div>
      <div style={{ display: "flex", justifyContent: "center", marginTop: 4 }}>
        <button onClick={() => setPaused(p => !p)} aria-pressed={paused} style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.25)", color: "white", borderRadius: 999, padding: "6px 14px", fontSize: 12.5, fontWeight: 700, cursor: "pointer", fontFamily: FONT }}>
          {paused ? "▶ Play scrolling" : "❚❚ Pause scrolling"}
        </button>
      </div>
      {open && (
        <HowToPlayModal gameId={open.id} gameName={open.name} gameIcon={GAME_ICONS[open.id]} accentColor={open.color} onClose={() => setOpen(null)} />
      )}
    </section>
  );
}

const STEPS: { icon: IconName; title: string; body: string }[] = [
  { icon: "books", title: "Pick a level and a topic", body: "A1 to C1, across grammar, vocabulary and themes. Every topic has a short lesson that matches the questions." },
  { icon: "trophy", title: "Split into teams", body: "Up to 5 teams, each with its own mascot. Team scores are tracked for you." },
  { icon: "rocket", title: "Choose a game and play", body: "Quiet warm-ups, fast reflex games, full speaking challenges. No prep, no printing." },
];

export function HowItWorks({ accent, headingFont }: { accent: string; headingFont?: string }) {
  return (
    <section aria-label="How it works" style={{ marginTop: 40, width: "100%" }}>
      <h2 style={{ margin: "0 0 18px", color: "white", fontSize: "clamp(22px,3.4vw,32px)", fontWeight: 900, textAlign: "center", fontFamily: headingFont }}>How it works</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 16 }}>
        {STEPS.map((s, i) => (
          <div key={s.title} className="cc-step" style={{ animationDelay: `${i * 0.12}s`, background: "rgba(255,255,255,0.09)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 18, padding: "20px 18px", textAlign: "left", backdropFilter: "blur(8px)" }}>
            <div style={{ width: 46, height: 46, borderRadius: 14, background: accent, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12, boxShadow: "0 6px 16px rgba(0,0,0,0.3)" }}>
              <Icon name={s.icon} size={24} color="white" />
            </div>
            <div style={{ color: "white", fontWeight: 800, fontSize: 17, marginBottom: 6, fontFamily: headingFont }}>{s.title}</div>
            <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 14, lineHeight: 1.55 }}>{s.body}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

// Counts up from 0 once the stat scrolls into view.
function CountUp({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [n, setN] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      io.disconnect();
      const start = performance.now();
      const tick = (t: number) => {
        const p = Math.min(1, (t - start) / 1100);
        setN(Math.round(to * (1 - Math.pow(1 - p, 3))));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }, { threshold: 0.4 });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [to]);
  return <span ref={ref}>{n}{suffix}</span>;
}

export function StatBand({ topics, games, headingFont }: { topics: number; games: number; headingFont?: string }) {
  const stats: { node: React.ReactNode; label: string }[] = [
    { node: <CountUp to={games} />, label: "game modes" },
    { node: <CountUp to={topics} suffix="+" />, label: "built-in topics" },
    { node: <>A1&ndash;C1</>, label: "every level" },
    { node: <>2&ndash;5</>, label: "teams per game" },
  ];
  return (
    <section aria-label="ClassCade at a glance" style={{ marginTop: 40, width: "100%", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 12 }}>
      {stats.map(s => (
        <div key={s.label} style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.18)", borderRadius: 16, padding: "18px 10px" }}>
          <div style={{ color: "#FCD34D", fontWeight: 900, fontSize: "clamp(28px,4.4vw,40px)", lineHeight: 1.1, fontFamily: headingFont }}>{s.node}</div>
          <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 13.5, fontWeight: 700, marginTop: 4 }}>{s.label}</div>
        </div>
      ))}
    </section>
  );
}
