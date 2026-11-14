import { useEffect, useRef, useState } from "react";
import { Icon, type IconName } from "./Icon";
import { setMusicSuspended } from "../../lib/music";

// Each game's "How to Play" button opens its animated explainer video (made 2026-11 with HyperFrames
// from real game screens — source projects live outside this repo, in Desktop\classcade-videos).
// The videos replaced the old scripted step-by-step walkthroughs (data/tutorials/, removed).
// It never autoplays — the teacher presses play (owner, 2026-11-13).
// Hosted on the same Vercel Blob store as the music. Blobs are cached for a year, so a re-edited
// video must be uploaded under a NEW name (bump -v1 → -v2) and the entry below updated — never
// overwrite the old file in place, or browsers keep showing the old one.
const VIDEO_BASE = "https://es8h1nft4dvfmlmp.public.blob.vercel-storage.com/video/how-to";
const HOW_TO_VIDEOS: Record<string, string> = {
  whack: "whack-v2", auction: "auction-v2", battleship: "battleship-v2", vault: "vault-v1", hill: "hill-v1",
  hotpotato: "hotpotato-v1", castle: "castle-v1", racetrack: "racetrack-v1", minefield: "minefield-v1",
  rocket: "rocket-v1", orderup: "orderup-v1", bounty: "bounty-v1", hotseat: "hotseat-v2", relay: "relay-v2",
  cards: "cards-v1", spy: "spy-v1", zombie: "zombie-v3",
};

interface HowToPlayModalProps {
  gameId: string;
  gameName: string;
  gameIcon: IconName;
  accentColor: string;
  onClose: () => void;
}

export function HowToPlayModal({ gameId, gameName, gameIcon, accentColor, onClose }: HowToPlayModalProps) {
  const file = HOW_TO_VIDEOS[gameId];
  const [failed, setFailed] = useState(!file);
  // Big centre play button (owner, 2026-11-13: obvious for the teacher to hit). Shown whenever the video
  // isn't playing; the browser's own small controls only appear once it has started, for pause/scrub/fullscreen.
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);

  // The video has its own soundtrack — hush the background music while it's open.
  useEffect(() => {
    setMusicSuspended(true);
    return () => setMusicSuspended(false);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.82)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000, padding: "16px" }}
    >
      <div
        onClick={e => e.stopPropagation()}
        role="dialog" aria-label={`${gameName} — How to Play`}
        style={{ background: "#0C1E3D", borderRadius: "18px", padding: "14px", width: "min(1000px, 100%)", boxShadow: `0 0 0 3px ${accentColor}, 0 20px 60px rgba(0,0,0,0.5)`, fontFamily: "'Segoe UI',system-ui,sans-serif" }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px", padding: "0 4px" }}>
          <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 900, color: "white", display: "flex", alignItems: "center", gap: "8px" }}>
            <Icon name={gameIcon} size={18} color={accentColor} /> {gameName} — How to Play
          </h3>
          <button onClick={onClose} aria-label="Close" style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "white", cursor: "pointer", lineHeight: 1, padding: "8px", borderRadius: "10px", display: "flex" }}>
            <Icon name="close" size={16} />
          </button>
        </div>
        {failed ? (
          <div style={{ aspectRatio: "16 / 9", borderRadius: "12px", background: "#000", color: "#CBD5E1", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "24px", fontSize: "15px", fontWeight: 700, lineHeight: 1.6 }}>
            The How to Play video couldn’t load — please check your internet connection and try again.
          </div>
        ) : (
          <div style={{ position: "relative" }}>
            <video
              ref={videoRef}
              src={`${VIDEO_BASE}/${file}.mp4`}
              poster={`${VIDEO_BASE}/${file}.jpg`}
              controls={started} playsInline preload="metadata"
              onPlay={() => { setPlaying(true); setStarted(true); }}
              onPause={() => setPlaying(false)}
              onEnded={() => setPlaying(false)}
              onError={() => setFailed(true)}
              style={{ display: "block", width: "100%", aspectRatio: "16 / 9", borderRadius: "12px", background: "#000" }}
            />
            {!playing && (
              <button
                onClick={() => { videoRef.current?.play().catch(() => {}); }}
                aria-label="Play the How to Play video"
                className="htp-bigplay"
                style={{
                  position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)",
                  width: "clamp(84px, 14vw, 128px)", height: "clamp(84px, 14vw, 128px)", borderRadius: "50%",
                  border: "5px solid white", background: accentColor, color: "white", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 8px 30px rgba(0,0,0,0.55)",
                }}
              >
                <svg viewBox="0 0 24 24" style={{ width: "46%", height: "46%", marginLeft: "8%" }} aria-hidden="true"><polygon points="5,3 21,12 5,21" fill="currentColor" /></svg>
              </button>
            )}
            <style>{`.htp-bigplay{animation:htpPulse 1.6s ease-in-out infinite}.htp-bigplay:hover{filter:brightness(1.1)}@keyframes htpPulse{0%,100%{transform:translate(-50%,-50%) scale(1)}50%{transform:translate(-50%,-50%) scale(1.07)}}`}</style>
          </div>
        )}
      </div>
    </div>
  );
}

// The long "How to Play" button every game shows right under its description box (owner, 2026-11-13:
// between the description and the teams, full width, not a small button further down). Owns its own
// open/closed state, so a game just drops <HowToPlayBar … /> in and needs no state of its own.
export function HowToPlayBar({ gameId, gameName, gameIcon, accentColor }: Omit<HowToPlayModalProps, "onClose">) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", width: "100%", maxWidth: "540px",
          margin: "4px auto 18px", padding: "12px 18px", borderRadius: "14px", cursor: "pointer",
          background: "rgba(255,255,255,0.95)", color: accentColor, border: `2px solid ${accentColor}`,
          boxShadow: "0 3px 10px rgba(0,0,0,0.18)", fontSize: "16px", fontWeight: 900, fontFamily: "inherit",
        }}
      >
        <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "28px", height: "28px", borderRadius: "50%", background: accentColor, color: "white" }}>
          <Icon name="play" size={13} />
        </span>
        How to Play <span style={{ fontWeight: 700, fontSize: "13px", opacity: 0.75 }}>· watch the video</span>
      </button>
      {open && <HowToPlayModal gameId={gameId} gameName={gameName} gameIcon={gameIcon} accentColor={accentColor} onClose={() => setOpen(false)} />}
    </>
  );
}
