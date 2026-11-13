import { useEffect, useState } from "react";
import { Icon, type IconName } from "./Icon";
import { setMusicSuspended } from "../../lib/music";

// Each game's "How to Play" button opens its animated explainer video (made 2026-11 with HyperFrames
// from real game screens — source projects live outside this repo, in Desktop\classcade-videos).
// The videos replaced the old scripted step-by-step walkthroughs (data/tutorials/, removed).
// Hosted on the same Vercel Blob store as the music. Blobs are cached for a year, so a re-edited
// video must be uploaded under a NEW name (bump -v1 → -v2) and the entry below updated — never
// overwrite the old file in place, or browsers keep showing the old one.
const VIDEO_BASE = "https://es8h1nft4dvfmlmp.public.blob.vercel-storage.com/video/how-to";
const HOW_TO_VIDEOS: Record<string, string> = {
  whack: "whack-v1", auction: "auction-v1", battleship: "battleship-v1", vault: "vault-v1", hill: "hill-v1",
  hotpotato: "hotpotato-v1", castle: "castle-v1", racetrack: "racetrack-v1", minefield: "minefield-v1",
  rocket: "rocket-v1", orderup: "orderup-v1", bounty: "bounty-v1", hotseat: "hotseat-v1", relay: "relay-v1",
  cards: "cards-v1", spy: "spy-v1", zombie: "zombie-v1",
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
          <video
            src={`${VIDEO_BASE}/${file}.mp4`}
            poster={`${VIDEO_BASE}/${file}.jpg`}
            controls autoPlay playsInline preload="auto"
            onError={() => setFailed(true)}
            style={{ display: "block", width: "100%", aspectRatio: "16 / 9", borderRadius: "12px", background: "#000" }}
          />
        )}
      </div>
    </div>
  );
}
