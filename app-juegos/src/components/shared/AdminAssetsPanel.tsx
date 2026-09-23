import { useRef } from "react";
import { ADMIN_COLORS as C } from "./adminColors";
import { MascotIcon, type MascotName } from "./MascotArt";
import { Icon } from "./Icon";
import { GAME_MODES, GAME_ICONS } from "../../data/constants";

// Every mascot/game-icon here is a live component (see MascotArt.tsx/Icon.tsx), not a stored file
// — the repo has only 3 static image assets total. Rendering the real components means this
// gallery can never go stale the way an exported PNG snapshot could; "Download PNG" rasterizes
// each tile client-side on demand instead.
const MASCOT_NAMES: MascotName[] = [
  "dragon", "unicorn", "robot", "fox", "frog", "lion", "penguin", "dino", "bee",
  "butterfly", "octopus", "rabbit", "turtle", "wolf", "owl", "tiger", "pizza",
  "ghost", "ninja", "alien", "panda", "shark", "dog", "cat",
];

// A small hardcoded index of Design Canvas / artifact marketing pages — manually added here as
// they're made (Design Canvas content can't be pulled into the app programmatically). Each one
// already has its own real PNG/PDF export via the `downloads` capability, so this is just a
// clickable directory, not a copy of the content.
const MARKETING_ARTIFACTS: { title: string; description: string; url: string }[] = [
  { title: "ClassCade Promo Graphics", description: "Social/marketing graphics for ClassCade", url: "https://claude.ai/artifact/XqVt3CRGUeD7CCzAdaiwEN" },
];

// Draws a clone of the given live SVG onto an offscreen canvas at a larger fixed size and triggers
// a download — no backend/storage needed since the source is already a vector in the DOM.
function downloadSvgAsPng(svg: SVGSVGElement, filename: string, size = 512) {
  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.setAttribute("width", String(size));
  clone.setAttribute("height", String(size));
  const svgString = new XMLSerializer().serializeToString(clone);
  const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
  const svgUrl = URL.createObjectURL(svgBlob);
  const img = new Image();
  img.onload = () => {
    URL.revokeObjectURL(svgUrl);
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(img, 0, 0, size, size);
    canvas.toBlob(blob => {
      if (!blob) return;
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      link.click();
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
    }, "image/png");
  };
  img.onerror = () => URL.revokeObjectURL(svgUrl);
  img.src = svgUrl;
}

function AssetTile({ label, filename, children }: { label: string; filename: string; children: React.ReactNode }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const handleDownload = () => {
    const svg = wrapRef.current?.querySelector("svg");
    if (svg) downloadSvgAsPng(svg, filename);
  };
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "14px 10px", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <div ref={wrapRef} style={{ height: 56, display: "flex", alignItems: "center", justifyContent: "center" }}>{children}</div>
      <div style={{ fontSize: 11.5, fontWeight: 700, color: C.inkDim, textAlign: "center" }}>{label}</div>
      <button
        onClick={handleDownload}
        style={{ border: `1px solid ${C.border}`, borderRadius: 8, padding: "5px 10px", fontSize: 10.5, fontWeight: 800, cursor: "pointer", fontFamily: "inherit", background: C.surface2, color: C.inkDim }}
      >
        Download PNG
      </button>
    </div>
  );
}

const sectionLabel: React.CSSProperties = { fontSize: 11, fontWeight: 800, color: C.inkFaint, textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 10 };
const tileGrid: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(96px, 1fr))", gap: 10 };

export function AdminAssetsPanel() {
  return (
    <>
      <div style={{ ...sectionLabel, marginTop: 0 }}>Mascots ({MASCOT_NAMES.length})</div>
      <div style={tileGrid}>
        {MASCOT_NAMES.map(name => (
          <AssetTile key={name} label={name} filename={`classcade-mascot-${name}.png`}>
            <MascotIcon name={name} size={48} />
          </AssetTile>
        ))}
      </div>

      <div style={sectionLabel}>Game Icons ({GAME_MODES.length})</div>
      <div style={tileGrid}>
        {GAME_MODES.map(g => {
          const iconName = GAME_ICONS[g.id];
          if (!iconName) return null;
          return (
            <AssetTile key={g.id} label={g.name} filename={`classcade-icon-${g.id}.png`}>
              <Icon name={iconName} size={32} color={g.color} />
            </AssetTile>
          );
        })}
      </div>

      <div style={sectionLabel}>Marketing Artifacts</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {MARKETING_ARTIFACTS.map(a => (
          <a
            key={a.url}
            href={a.url}
            target="_blank"
            rel="noreferrer"
            style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, textDecoration: "none", color: "inherit" }}
          >
            <div style={{ width: 34, height: 34, borderRadius: 9, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, border: `1px solid ${C.border}`, background: C.surface2 }}>🎨</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: C.ink }}>{a.title}</div>
              <div style={{ fontSize: 11.5, color: C.inkDim, fontWeight: 600 }}>{a.description}</div>
            </div>
            <div style={{ fontSize: 11.5, color: C.accent, fontWeight: 800 }}>Open →</div>
          </a>
        ))}
      </div>
    </>
  );
}
