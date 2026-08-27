// Phase 1 of the custom icon system (see plan) — replaces raw emoji in shared chrome with
// hand-drawn SVG glyphs on a 24x24 grid, styled to inherit the surrounding text color via
// currentColor (matching how a plain emoji today just sits in whatever-color text it's placed in).
// Every glyph is built from solid, non-overlapping fill="currentColor" shapes or stroke-only lines
// (rings, chevrons, arcs) — a same-color fill drawn on top of an already-opaque same-color shape is
// invisible, so internal "hole" details (dice pips, the warning triangle's "!") use an SVG mask or
// an evenodd fill-rule instead of overlapping fills. Reused as-is by a future Phase 2 badge wrapper
// for the 15 GAME_MODES icons, so nothing here is throwaway work.
export type IconName =
  | "learn" | "check" | "gem" | "joystick" | "flag" | "trophy" | "controller" | "books"
  | "close" | "chart" | "party" | "bolt" | "person" | "palette" | "printer" | "refresh"
  | "gear" | "save" | "chat" | "target" | "phone" | "search" | "folder" | "lock" | "dice"
  | "bookOpen" | "mic" | "rocket" | "warning" | "image" | "school" | "trash" | "play" | "gift"
  | "back" | "next" | "plus"
  // Phase 2 — one glyph per GAME_MODES entry (Word Whack/Sentence Auction/Battleship/Vault Heist/
  // King of the Hill/Hot Potato/Castle Defense/Race Track/Minefield/Order Up/Card Shuffle/Hot Seat/
  // Zombie Siege). Rocket Fuel and Spy Among Us reuse "rocket" and "search" above — no need for a
  // near-duplicate glyph when an existing one already fits.
  | "hammer" | "gavel" | "anchor" | "safe" | "crown" | "potato" | "castle" | "checkeredFlag"
  | "mine" | "plate" | "cardTilt" | "flame" | "skull"
  // Phase 4 — ThemeAmbience's decorative floating background glyphs (one drift + one twinkle
  // per accent theme). Rendered at low opacity/small scale, so simpler silhouettes than the
  // functional icons above are fine here.
  | "cloud" | "sparkle" | "moon" | "star" | "dove" | "bubble" | "leaf" | "blossom"
  // Phase 3 — team mascot options. "⚡"/"🌟" reuse "bolt"/"star" above (same glyph already
  // exists), so only the 20 creatures/objects below are new.
  | "dragon" | "unicorn" | "robot" | "fox" | "frog" | "lion" | "penguin" | "dino" | "bee"
  | "butterfly" | "octopus" | "eagle" | "turtle" | "wolf" | "owl" | "tiger" | "pizza"
  | "pumpkin" | "ghost" | "ninja";

const ICONS: Record<IconName, React.ReactNode> = {
  learn: (
    <>
      <polygon points="12,4 22,9 12,14 2,9" fill="currentColor" />
      <rect x="6" y="11" width="12" height="4" rx="1.5" fill="currentColor" />
      <circle cx="20" cy="9" r="1.3" fill="currentColor" />
      <line x1="20" y1="9" x2="20" y2="17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="20" cy="19" r="1.6" fill="currentColor" />
    </>
  ),
  check: <path d="M4 13 L9.5 18.5 L20 6" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />,
  gem: <polygon points="12,3 19,9 12,21 5,9" fill="currentColor" />,
  joystick: (
    <>
      <circle cx="12" cy="6" r="4" fill="currentColor" />
      <rect x="10" y="9" width="4" height="7" rx="1.5" fill="currentColor" />
      <rect x="5" y="16" width="14" height="4" rx="2" fill="currentColor" />
    </>
  ),
  flag: (
    <>
      <line x1="5" y1="3" x2="5" y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M6,4 H19 L15.5,8 L19,12 H6 Z" fill="currentColor" />
    </>
  ),
  trophy: (
    <>
      <path d="M7,4 H17 L16,11 Q12,15 8,11 Z" fill="currentColor" />
      <path d="M7,5 Q2,5 2,9 Q2,12 7,12" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M17,5 Q22,5 22,9 Q22,12 17,12" fill="none" stroke="currentColor" strokeWidth="2" />
      <rect x="10.5" y="14" width="3" height="4" fill="currentColor" />
      <rect x="8" y="18" width="8" height="2.5" rx="1" fill="currentColor" />
    </>
  ),
  controller: (
    <>
      <rect x="3" y="9" width="18" height="8" rx="4" fill="currentColor" />
      <circle cx="5" cy="17" r="2.6" fill="currentColor" />
      <circle cx="19" cy="17" r="2.6" fill="currentColor" />
    </>
  ),
  books: (
    <>
      <rect x="3" y="15" width="18" height="3" rx="1" fill="currentColor" />
      <rect x="4" y="11" width="16" height="3" rx="1" fill="currentColor" fillOpacity="0.75" />
      <rect x="5" y="7" width="14" height="3" rx="1" fill="currentColor" fillOpacity="0.5" />
    </>
  ),
  close: (
    <>
      <line x1="5" y1="5" x2="19" y2="19" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
      <line x1="19" y1="5" x2="5" y2="19" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
    </>
  ),
  chart: (
    <>
      <rect x="3" y="13" width="4" height="8" rx="1" fill="currentColor" />
      <rect x="10" y="8" width="4" height="13" rx="1" fill="currentColor" />
      <rect x="17" y="3" width="4" height="18" rx="1" fill="currentColor" />
    </>
  ),
  party: (
    <>
      <circle cx="12" cy="12" r="2.4" fill="currentColor" />
      <circle cx="5" cy="6" r="1.5" fill="currentColor" />
      <circle cx="19" cy="7" r="1.8" fill="currentColor" />
      <circle cx="6" cy="18" r="1.6" fill="currentColor" />
      <circle cx="19" cy="18" r="1.3" fill="currentColor" />
      <rect x="10.5" y="2" width="3" height="3" rx="0.6" fill="currentColor" transform="rotate(20 12 3.5)" />
    </>
  ),
  bolt: <polygon points="13,1 4,14 11,14 9,23 20,9 13,9" fill="currentColor" />,
  person: (
    <>
      <circle cx="12" cy="7" r="4.5" fill="currentColor" />
      <path d="M3,21 a9,7 0 0 1 18,0 Z" fill="currentColor" />
    </>
  ),
  palette: (
    <path
      d="M12,3 C6.5,3 3,7 3,12 C3,17.5 7.5,21 12,21 C13.4,21 14.5,19.9 14.5,18.5 C14.5,17.8 14.2,17.2 13.7,16.7 C13.4,16.4 13.3,16 13.5,15.6 C13.7,15.2 14.1,15 14.5,15 H17 C19.5,15 21,13 21,10.5 C21,6.5 17,3 12,3 Z"
      fill="currentColor"
    />
  ),
  printer: (
    <>
      <rect x="6" y="2" width="12" height="7" rx="1" fill="currentColor" />
      <rect x="3" y="8" width="18" height="9" rx="2.5" fill="currentColor" />
      <rect x="7" y="14" width="10" height="7" rx="1" fill="currentColor" fillOpacity="0.55" />
    </>
  ),
  refresh: (
    <>
      <path d="M5,11 a7,7 0 0 1 12.3,-4.3 M19,4 v4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M19,13 a7,7 0 0 1 -12.3,4.3 M5,20 v-4 h4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  gear: (
    <>
      <path d="M12,2 v3 M12,19 v3 M2,12 h3 M19,12 h3 M4.9,4.9 l2.1,2.1 M17,17 l2.1,2.1 M19.1,4.9 l-2.1,2.1 M7,17 l-2.1,2.1" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="12" cy="12" r="3.4" fill="currentColor" />
    </>
  ),
  save: <path d="M5,3 H15 L21,9 V19 A2,2 0 0 1 19,21 H5 A2,2 0 0 1 3,19 V5 A2,2 0 0 1 5,3 Z" fill="currentColor" />,
  chat: <path d="M3,5 H21 A1,1 0 0 1 22,6 V16 A1,1 0 0 1 21,17 H9 L4,21 V17 H3 A1,1 0 0 1 2,16 V6 A1,1 0 0 1 3,5 Z" fill="currentColor" />,
  target: (
    <>
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="5.3" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="1.8" fill="currentColor" />
    </>
  ),
  phone: (
    <>
      <rect x="7" y="2" width="10" height="20" rx="2.5" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="19" r="1.3" fill="currentColor" />
    </>
  ),
  search: (
    <>
      <circle cx="10" cy="10" r="6.5" fill="none" stroke="currentColor" strokeWidth="2.4" />
      <line x1="15" y1="15" x2="21" y2="21" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
    </>
  ),
  folder: <path d="M3,6 A1,1 0 0 1 4,5 H9 L11,7 H20 A1,1 0 0 1 21,8 V18 A1,1 0 0 1 20,19 H4 A1,1 0 0 1 3,18 Z" fill="currentColor" />,
  lock: (
    <>
      <path d="M7,10 V8 A5,5 0 0 1 17,8 V10" fill="none" stroke="currentColor" strokeWidth="2.2" />
      <rect x="5" y="10" width="14" height="11" rx="2" fill="currentColor" />
    </>
  ),
  dice: (
    <>
      <mask id="icon-dice-pips">
        <rect x="0" y="0" width="24" height="24" fill="white" />
        <circle cx="8" cy="8" r="1.5" fill="black" />
        <circle cx="16" cy="8" r="1.5" fill="black" />
        <circle cx="12" cy="12" r="1.5" fill="black" />
        <circle cx="8" cy="16" r="1.5" fill="black" />
        <circle cx="16" cy="16" r="1.5" fill="black" />
      </mask>
      <rect x="3" y="3" width="18" height="18" rx="5" fill="currentColor" mask="url(#icon-dice-pips)" />
    </>
  ),
  bookOpen: <path d="M12,5 C10,3.5 6,3 3,4 V18 C6,17 10,17.5 12,19 C14,17.5 18,17 21,18 V4 C18,3 14,3.5 12,5 Z" fill="currentColor" />,
  mic: (
    <>
      <rect x="9" y="2" width="6" height="12" rx="3" fill="currentColor" />
      <path d="M6,11 A6,6 0 0 0 18,11" fill="none" stroke="currentColor" strokeWidth="2" />
      <line x1="12" y1="17" x2="12" y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="8" y1="21" x2="16" y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </>
  ),
  rocket: <path d="M12,2 C16,6 18,11 16,17 L14,15 V19 L12,22 L10,19 V15 L8,17 C6,11 8,6 12,2 Z" fill="currentColor" />,
  warning: (
    <path
      fillRule="evenodd"
      d="M12,2 L23,21 H1 Z M11,8.5 H13 L12.6,15 H11.4 Z M11.3,16.3 H12.7 V17.7 H11.3 Z"
      fill="currentColor"
    />
  ),
  image: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="9" cy="10" r="2" fill="currentColor" />
      <path d="M4,18 L10,12 L14,16 L17,13 L21,17 V19 A1,1 0 0 1 20,20 H5 A1,1 0 0 1 4,19 Z" fill="currentColor" />
    </>
  ),
  school: (
    <>
      <path d="M12,2 L22,8 V10 H2 V8 Z" fill="currentColor" />
      <rect x="4" y="10" width="16" height="10" fill="currentColor" />
    </>
  ),
  trash: (
    <>
      <path d="M5,7 H19 L18,21 A1,1 0 0 1 17,22 H7 A1,1 0 0 1 6,21 Z" fill="currentColor" />
      <rect x="3" y="4" width="18" height="2.5" rx="1" fill="currentColor" />
      <rect x="9" y="1.5" width="6" height="2.5" rx="1" fill="currentColor" />
    </>
  ),
  play: <polygon points="6,4 20,12 6,20" fill="currentColor" />,
  gift: (
    <>
      <rect x="3" y="10" width="18" height="10" rx="1.5" fill="currentColor" />
      <rect x="2" y="6" width="20" height="4.5" rx="1.5" fill="currentColor" />
    </>
  ),
  back: <polyline points="15,4 7,12 15,20" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />,
  next: <polyline points="9,4 17,12 9,20" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />,
  plus: (
    <>
      <line x1="12" y1="4" x2="12" y2="20" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <line x1="4" y1="12" x2="20" y2="12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </>
  ),
  hammer: (
    <g transform="rotate(28 12 12)">
      <rect x="10.5" y="8" width="3" height="12" rx="1.2" fill="currentColor" />
      <rect x="6" y="3" width="11" height="6" rx="1.8" fill="currentColor" />
    </g>
  ),
  gavel: (
    <>
      <g transform="rotate(-35 12 12)">
        <rect x="9" y="3" width="6" height="9" rx="1.5" fill="currentColor" />
        <rect x="10.5" y="12" width="3" height="8" rx="1" fill="currentColor" />
      </g>
      <rect x="4" y="19" width="9" height="2.5" rx="1" fill="currentColor" />
    </>
  ),
  anchor: (
    <>
      <circle cx="12" cy="5" r="2" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <line x1="12" y1="7" x2="12" y2="19" stroke="currentColor" strokeWidth="2" />
      <line x1="7" y1="10" x2="17" y2="10" stroke="currentColor" strokeWidth="2" />
      <path d="M6,14 a6,6 0 0 0 12,0" fill="none" stroke="currentColor" strokeWidth="2" />
    </>
  ),
  safe: (
    <>
      <mask id="icon-safe-dial">
        <rect x="0" y="0" width="24" height="24" fill="white" />
        <circle cx="12" cy="12" r="4" fill="black" />
      </mask>
      <rect x="3" y="3" width="18" height="18" rx="3" fill="currentColor" mask="url(#icon-safe-dial)" />
      <rect x="10.5" y="10.5" width="3" height="3" rx="1" fill="currentColor" />
      <rect x="5.5" y="6" width="3" height="2" rx="0.5" fill="currentColor" />
    </>
  ),
  crown: (
    <>
      <polygon points="4,18 4,9 8,13 12,6 16,13 20,9 20,18" fill="currentColor" />
      <rect x="4" y="18" width="16" height="3" rx="1" fill="currentColor" />
    </>
  ),
  potato: (
    <>
      <mask id="icon-potato-eyes">
        <rect width="24" height="24" fill="white" />
        <circle cx="9" cy="11" r="1" fill="black" />
        <circle cx="15" cy="14" r="1" fill="black" />
        <circle cx="13" cy="9" r="0.8" fill="black" />
      </mask>
      <path d="M12,4 C17,4 21,7 20,12 C19,17 15,20 10,19 C5,18 3,14 4,10 C5,6 8,4 12,4 Z" fill="currentColor" mask="url(#icon-potato-eyes)" />
    </>
  ),
  castle: (
    <>
      <rect x="5" y="10" width="14" height="10" fill="currentColor" />
      <rect x="4" y="7" width="3" height="4" fill="currentColor" />
      <rect x="10.5" y="7" width="3" height="4" fill="currentColor" />
      <rect x="17" y="7" width="3" height="4" fill="currentColor" />
      <polygon points="12,2 15,7 9,7" fill="currentColor" />
    </>
  ),
  checkeredFlag: (
    <>
      <line x1="5" y1="3" x2="5" y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <mask id="icon-flag-check">
        <rect width="24" height="24" fill="black" />
        <rect x="6" y="4" width="14" height="10" fill="white" />
        <rect x="6" y="4" width="3.5" height="3.5" fill="black" />
        <rect x="13" y="4" width="3.5" height="3.5" fill="black" />
        <rect x="9.5" y="7.5" width="3.5" height="3.5" fill="black" />
        <rect x="16.5" y="7.5" width="3.5" height="3.5" fill="black" />
        <rect x="6" y="11" width="3.5" height="3" fill="black" />
        <rect x="13" y="11" width="3.5" height="3" fill="black" />
      </mask>
      <rect x="6" y="4" width="14" height="10" fill="currentColor" mask="url(#icon-flag-check)" />
    </>
  ),
  mine: (
    <>
      <circle cx="12" cy="13" r="6" fill="currentColor" />
      <line x1="12" y1="3" x2="12" y2="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="4" y1="8" x2="7" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="20" y1="8" x2="17" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="5" y1="18" x2="8" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="19" y1="18" x2="16" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="3" r="1.3" fill="currentColor" />
    </>
  ),
  plate: (
    <>
      <circle cx="13" cy="13" r="7" fill="none" stroke="currentColor" strokeWidth="2.2" />
      <circle cx="13" cy="13" r="3" fill="currentColor" />
      <line x1="4" y1="3" x2="4" y2="9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="2.7" y1="3" x2="2.7" y2="7" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
      <line x1="5.3" y1="3" x2="5.3" y2="7" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
    </>
  ),
  cardTilt: (
    <g transform="rotate(-8 12 12)">
      <rect x="6" y="3" width="11" height="16" rx="2" fill="currentColor" />
    </g>
  ),
  flame: (
    <path d="M12,2 C15,7.5 16.5,10.5 14.5,14 C16,12.5 17,14.5 17,16.5 C17,20 14.5,22 12,22 C8.5,22 6,20 6,16 C6,12.5 8.5,11 9.5,8.5 C10,11 11,11 11,9 C11,6.5 10.5,4.5 12,2 Z" fill="currentColor" />
  ),
  skull: (
    <>
      <mask id="icon-skull-eyes">
        <rect width="24" height="24" fill="white" />
        <circle cx="9" cy="11" r="2" fill="black" />
        <circle cx="15" cy="11" r="2" fill="black" />
      </mask>
      <path d="M12,3 C17,3 20,7 20,11 C20,14 18,16.5 16,18 V21 L14,19 L12,21 L10,19 L8,21 V18 C6,16.5 4,14 4,11 C4,7 7,3 12,3 Z" fill="currentColor" mask="url(#icon-skull-eyes)" />
    </>
  ),
  cloud: (
    <>
      <circle cx="7" cy="14" r="4" fill="currentColor" />
      <circle cx="12" cy="11" r="5" fill="currentColor" />
      <circle cx="17" cy="14" r="4" fill="currentColor" />
      <rect x="5" y="13" width="14" height="5" rx="2.5" fill="currentColor" />
    </>
  ),
  sparkle: <path d="M12,2 L14,10 L22,12 L14,14 L12,22 L10,14 L2,12 L10,10 Z" fill="currentColor" />,
  moon: <path d="M15,3 A9,9 0 1,0 15,21 A7,7 0 0,1 15,3 Z" fill="currentColor" />,
  star: <polygon points="12,2 14.9,8.6 22,9.3 16.5,14 18.2,21 12,17.3 5.8,21 7.5,14 2,9.3 9.1,8.6" fill="currentColor" />,
  dove: <path d="M2,14 C6,10 10,10 12,13 C14,10 18,10 22,14 C18,13 15,14 13,17 L12,22 L11,17 C9,14 6,13 2,14 Z" fill="currentColor" />,
  bubble: (
    <>
      <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="9" cy="9" r="2" fill="currentColor" fillOpacity="0.5" />
    </>
  ),
  leaf: <path d="M4,20 C4,10 10,4 20,4 C20,14 14,20 4,20 Z" fill="currentColor" />,
  blossom: (
    <>
      <circle cx="12" cy="5" r="4.2" fill="currentColor" />
      <circle cx="19" cy="10" r="4.2" fill="currentColor" />
      <circle cx="16.5" cy="18" r="4.2" fill="currentColor" />
      <circle cx="7.5" cy="18" r="4.2" fill="currentColor" />
      <circle cx="5" cy="10" r="4.2" fill="currentColor" />
    </>
  ),
  dragon: (
    <>
      <mask id="icon-dragon-eye">
        <rect width="24" height="24" fill="white" />
        <circle cx="15" cy="10" r="1.3" fill="black" />
      </mask>
      <path d="M3,15 C3,9 9,4 17,4 L15,8 L21,7 L17,11 L19,14 C15,16 10,18 5,17 Z" fill="currentColor" mask="url(#icon-dragon-eye)" />
    </>
  ),
  unicorn: (
    <>
      <path d="M7,20 V13 C7,8 10,5 14,5 C15,5 16,6 16,7 L15,9 C17,9 18,11 17,13 L14,14 V20 Z" fill="currentColor" />
      <polygon points="14,5 12,1 16,4" fill="currentColor" />
    </>
  ),
  robot: (
    <>
      <mask id="icon-robot-eyes">
        <rect width="24" height="24" fill="white" />
        <rect x="8" y="11" width="2.5" height="3" fill="black" />
        <rect x="13.5" y="11" width="2.5" height="3" fill="black" />
      </mask>
      <rect x="5" y="8" width="14" height="12" rx="3" fill="currentColor" mask="url(#icon-robot-eyes)" />
      <line x1="12" y1="8" x2="12" y2="4" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="3" r="1.5" fill="currentColor" />
      <rect x="3" y="12" width="2" height="5" rx="1" fill="currentColor" />
      <rect x="19" y="12" width="2" height="5" rx="1" fill="currentColor" />
    </>
  ),
  fox: (
    <>
      <polygon points="5,10 9,3 10,11" fill="currentColor" />
      <polygon points="19,10 15,3 14,11" fill="currentColor" />
      <path d="M12,9 C17,9 19,13 17,17 C15,20 9,20 7,17 C5,13 7,9 12,9 Z" fill="currentColor" />
    </>
  ),
  frog: (
    <>
      <circle cx="8" cy="8" r="3" fill="currentColor" />
      <circle cx="16" cy="8" r="3" fill="currentColor" />
      <ellipse cx="12" cy="14" rx="8" ry="6" fill="currentColor" />
    </>
  ),
  lion: (
    <>
      <circle cx="12" cy="4" r="3" fill="currentColor" />
      <circle cx="19" cy="8" r="3" fill="currentColor" />
      <circle cx="20" cy="16" r="3" fill="currentColor" />
      <circle cx="12" cy="21" r="3" fill="currentColor" />
      <circle cx="4" cy="16" r="3" fill="currentColor" />
      <circle cx="5" cy="8" r="3" fill="currentColor" />
      <circle cx="12" cy="12" r="4.5" fill="currentColor" />
    </>
  ),
  penguin: (
    <>
      <mask id="icon-penguin-belly">
        <rect width="24" height="24" fill="white" />
        <ellipse cx="12" cy="15" rx="4" ry="6" fill="black" />
      </mask>
      <path d="M12,3 C17,3 19,9 19,14 C19,19 16,21 12,21 C8,21 5,19 5,14 C5,9 7,3 12,3 Z" fill="currentColor" mask="url(#icon-penguin-belly)" />
      <polygon points="10.5,13 13.5,13 12,15.5" fill="currentColor" />
    </>
  ),
  dino: (
    <path d="M4,20 L4,15 C4,10 8,6 13,6 C13,4 15,3 17,4 C16,5 16,6 17,7 C19,8 20,10 19,12 L21,13 L18,14 C17,17 14,19 10,19 L10,20 L7,20 L7,17 L6,17 L6,20 Z" fill="currentColor" />
  ),
  bee: (
    <>
      <ellipse cx="6" cy="8" rx="4" ry="3" fill="currentColor" fillOpacity="0.5" transform="rotate(-20 6 8)" />
      <ellipse cx="18" cy="8" rx="4" ry="3" fill="currentColor" fillOpacity="0.5" transform="rotate(20 18 8)" />
      <mask id="icon-bee-stripes">
        <rect width="24" height="24" fill="white" />
        <rect x="6" y="10.5" width="12" height="2" fill="black" />
        <rect x="6" y="14.5" width="12" height="2" fill="black" />
      </mask>
      <ellipse cx="12" cy="14" rx="6" ry="7" fill="currentColor" mask="url(#icon-bee-stripes)" />
    </>
  ),
  butterfly: (
    <>
      <ellipse cx="7" cy="9" rx="5" ry="4" fill="currentColor" transform="rotate(-15 7 9)" />
      <ellipse cx="17" cy="9" rx="5" ry="4" fill="currentColor" transform="rotate(15 17 9)" />
      <ellipse cx="8" cy="16" rx="4" ry="3.5" fill="currentColor" transform="rotate(-15 8 16)" />
      <ellipse cx="16" cy="16" rx="4" ry="3.5" fill="currentColor" transform="rotate(15 16 16)" />
      <rect x="11.2" y="6" width="1.6" height="14" rx="0.8" fill="currentColor" />
    </>
  ),
  octopus: (
    <>
      <circle cx="12" cy="9" r="7" fill="currentColor" />
      <path d="M5,13 C4,17 3,19 2,21 M8,15 C7,19 7,21 6,22 M12,16 V22 M16,15 C17,19 17,21 18,22 M19,13 C20,17 21,19 22,21" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" />
    </>
  ),
  eagle: (
    <>
      <path d="M2,13 C7,9 11,9 13,12 C15,9 19,9 22,13 C18,12 16,13 14,16 L13,21 L12,16 C10,13 8,12 2,13 Z" fill="currentColor" />
      <polygon points="12,10 14,12 12,13" fill="currentColor" />
    </>
  ),
  turtle: (
    <>
      <circle cx="4" cy="9" r="2.5" fill="currentColor" />
      <circle cx="6" cy="18" r="2.2" fill="currentColor" />
      <circle cx="18" cy="18" r="2.2" fill="currentColor" />
      <circle cx="20" cy="9" r="2.5" fill="currentColor" />
      <ellipse cx="12" cy="12" rx="8" ry="6" fill="currentColor" />
    </>
  ),
  wolf: (
    <>
      <polygon points="6,9 8,2 11,10" fill="currentColor" />
      <polygon points="18,9 16,2 13,10" fill="currentColor" />
      <path d="M12,8 C18,8 20,13 17,18 C15,21 9,21 7,18 C4,13 6,8 12,8 Z" fill="currentColor" />
    </>
  ),
  owl: (
    <>
      <polygon points="7,7 5,2 10,6" fill="currentColor" />
      <polygon points="17,7 19,2 14,6" fill="currentColor" />
      <ellipse cx="12" cy="14" rx="7" ry="8" fill="currentColor" />
    </>
  ),
  tiger: (
    <>
      <polygon points="5,8 3,2 9,6" fill="currentColor" />
      <polygon points="19,8 21,2 15,6" fill="currentColor" />
      <mask id="icon-tiger-stripes">
        <rect width="24" height="24" fill="white" />
        <rect x="4" y="9" width="3" height="8" fill="black" transform="rotate(20 5 13)" />
        <rect x="17" y="9" width="3" height="8" fill="black" transform="rotate(-20 19 13)" />
        <rect x="10" y="18" width="4" height="3" fill="black" />
      </mask>
      <circle cx="12" cy="13" r="8" fill="currentColor" mask="url(#icon-tiger-stripes)" />
    </>
  ),
  pizza: (
    <>
      <mask id="icon-pizza-toppings">
        <rect width="24" height="24" fill="white" />
        <circle cx="10" cy="10" r="1.4" fill="black" />
        <circle cx="14" cy="13" r="1.4" fill="black" />
        <circle cx="9" cy="15" r="1.2" fill="black" />
      </mask>
      <polygon points="12,3 21,20 3,20" fill="currentColor" mask="url(#icon-pizza-toppings)" />
    </>
  ),
  pumpkin: (
    <>
      <ellipse cx="12" cy="14" rx="8" ry="7" fill="currentColor" />
      <rect x="10.5" y="3" width="3" height="4" rx="1" fill="currentColor" />
    </>
  ),
  ghost: (
    <>
      <mask id="icon-ghost-eyes">
        <rect width="24" height="24" fill="white" />
        <circle cx="9" cy="12" r="1.4" fill="black" />
        <circle cx="15" cy="12" r="1.4" fill="black" />
      </mask>
      <path d="M5,20 V11 C5,6 8,3 12,3 C16,3 19,6 19,11 V20 L16,17 L13,20 L10,17 Z" fill="currentColor" mask="url(#icon-ghost-eyes)" />
    </>
  ),
  ninja: (
    <>
      <mask id="icon-ninja-eyes">
        <rect width="24" height="24" fill="white" />
        <rect x="6" y="10" width="12" height="3" rx="1.5" fill="black" />
      </mask>
      <circle cx="12" cy="12" r="9" fill="currentColor" mask="url(#icon-ninja-eyes)" />
    </>
  ),
};

type Props = { name: IconName; size?: number; color?: string; style?: React.CSSProperties; className?: string };

export function Icon({ name, size = 16, color, style, className }: Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      aria-hidden="true"
      className={className}
      style={{ display: "inline-block", verticalAlign: "-3px", flexShrink: 0, color, ...style }}
    >
      {ICONS[name]}
    </svg>
  );
}
