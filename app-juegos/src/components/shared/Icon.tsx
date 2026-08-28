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
  // Phase 6 — per-game emoji sweep (games' own internal UI, not shared chrome). "help" is used
  // identically by all 15 games' "How to Play" button, so it's defined once here rather than
  // per-game. The rest are added as each game's sweep needs them, reused across games where a
  // later one needs the same concept.
  | "help" | "pencil" | "clock" | "ship" | "shield" | "explosion" | "wave" | "medal"
  | "screen" | "clipboard" | "coin" | "volcano" | "people"
  | "tent" | "balloon" | "popcorn" | "eye" | "shuffle" | "hand"
  | "keyboard" | "bell" | "pause" | "hourglass" | "sleep" | "column" | "wallet"
  | "planet" | "stop" | "satellite" | "fuel" | "ufo" | "astronaut"
  | "door" | "window" | "zombie" | "gun" | "axe" | "tree" | "megaphone" | "house" | "chair"
  | "handshake" | "idea" | "sword"
  // Phase 4 — ThemeAmbience's decorative floating background glyphs (one drift + one twinkle
  // per accent theme). Rendered at low opacity/small scale, so simpler silhouettes than the
  // functional icons above are fine here.
  | "cloud" | "sparkle" | "moon" | "star" | "dove" | "bubble" | "leaf" | "blossom";

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
  help: (
    <>
      <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M9.5,9.3 C9.5,7.2 11,6 12.4,6.3 C13.7,6.6 14.6,7.9 14,9.1 C13.6,10 12.5,10.4 12,11.3 C11.7,11.8 11.6,12.3 11.6,13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="11.6" cy="16.3" r="1.3" fill="currentColor" />
    </>
  ),
  pencil: (
    <g transform="rotate(45 12 12)">
      <rect x="10.5" y="3" width="3" height="14" rx="1" fill="currentColor" />
      <polygon points="10.5,17 13.5,17 12,21" fill="currentColor" />
      <rect x="10" y="1.3" width="4" height="2.4" rx="1" fill="currentColor" />
    </g>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9.5" fill="none" stroke="currentColor" strokeWidth="2" />
      <line x1="12" y1="12" x2="12" y2="6.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="12" y1="12" x2="16" y2="14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </>
  ),
  ship: (
    <>
      <path d="M4,14 L20,14 L17.5,20 H6.5 Z" fill="currentColor" />
      <rect x="11" y="4" width="2" height="10" fill="currentColor" />
      <path d="M13,5 L19,8 L13,10.5 Z" fill="currentColor" />
    </>
  ),
  shield: (
    <path d="M12,2 L20,5 V11 C20,16.5 16.5,20.5 12,22 C7.5,20.5 4,16.5 4,11 V5 Z" fill="currentColor" />
  ),
  explosion: (
    <polygon points="12,2 14,9 20,6 15.5,11 22,12 15.5,13 20,18 14,15 12,22 10,15 4,18 8.5,13 2,12 8.5,11 4,6 10,9" fill="currentColor" />
  ),
  wave: (
    <path d="M2,13 C4,10 6,10 8,13 C10,16 12,16 14,13 C16,10 18,10 20,13 C21,14.4 21.5,14.7 22,15 M2,18.5 C4,15.5 6,15.5 8,18.5 C10,21.5 12,21.5 14,18.5 C16,15.5 18,15.5 20,18.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  ),
  medal: (
    <>
      <path d="M7,2 L3,10 L8,9 Z" fill="currentColor" />
      <path d="M17,2 L21,10 L16,9 Z" fill="currentColor" />
      <mask id="icon-medal-star">
        <rect width="24" height="24" fill="white" />
        <polygon points="12,11.5 12.9,13.8 15.3,13.9 13.4,15.4 14.1,17.7 12,16.3 9.9,17.7 10.6,15.4 8.7,13.9 11.1,13.8" fill="black" />
      </mask>
      <circle cx="12" cy="15" r="7" fill="currentColor" mask="url(#icon-medal-star)" />
    </>
  ),
  screen: (
    <>
      <rect x="2" y="4" width="20" height="13" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
      <line x1="8" y1="21" x2="16" y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="12" y1="17" x2="12" y2="21" stroke="currentColor" strokeWidth="2" />
    </>
  ),
  clipboard: (
    <>
      <mask id="icon-clipboard-lines">
        <rect width="24" height="24" fill="white" />
        <rect x="7.5" y="10" width="9" height="1.6" fill="black" />
        <rect x="7.5" y="13.5" width="9" height="1.6" fill="black" />
        <rect x="7.5" y="17" width="6" height="1.6" fill="black" />
      </mask>
      <rect x="5" y="4" width="14" height="18" rx="2" fill="currentColor" mask="url(#icon-clipboard-lines)" />
      <rect x="8" y="2" width="8" height="4" rx="1.5" fill="currentColor" />
    </>
  ),
  coin: (
    <>
      <mask id="icon-coin-ring">
        <rect width="24" height="24" fill="white" />
        <circle cx="12" cy="12" r="7" fill="none" stroke="black" strokeWidth="1.3" />
      </mask>
      <circle cx="12" cy="12" r="10" fill="currentColor" mask="url(#icon-coin-ring)" />
    </>
  ),
  volcano: (
    <>
      <mask id="icon-volcano-crater">
        <rect width="24" height="24" fill="white" />
        <polygon points="12,5 14.5,8 9.5,8" fill="black" />
      </mask>
      <polygon points="12,3 20,21 4,21" fill="currentColor" mask="url(#icon-volcano-crater)" />
      <circle cx="12" cy="4.5" r="1.1" fill="currentColor" />
    </>
  ),
  people: (
    <>
      <circle cx="8" cy="8" r="3.2" fill="currentColor" />
      <circle cx="17" cy="9" r="2.6" fill="currentColor" opacity="0.75" />
      <path d="M2,20 a6,6 0 0 1 12,0 Z" fill="currentColor" />
      <path d="M14,20 a5,5 0 0 1 9,0 Z" fill="currentColor" opacity="0.75" />
    </>
  ),
  tent: (
    <>
      <line x1="12" y1="1" x2="12" y2="4" stroke="currentColor" strokeWidth="1.6" />
      <polygon points="12,2 12.8,4.2 11.2,4.2" fill="currentColor" />
      <polygon points="12,4 22,19 16,19 12,10 8,19 2,19" fill="currentColor" />
    </>
  ),
  balloon: (
    <>
      <path d="M12,2 C17,2 19,6.5 17.5,10.5 C16.5,13 14,14.5 14,16.5 V17.5 H10 V16.5 C10,14.5 7.5,13 6.5,10.5 C5,6.5 7,2 12,2 Z" fill="currentColor" />
      <polygon points="10.5,17.5 13.5,17.5 12,19.5" fill="currentColor" />
      <line x1="12" y1="19.5" x2="12" y2="23" stroke="currentColor" strokeWidth="1.2" />
    </>
  ),
  popcorn: (
    <>
      <path d="M6,10 L7.5,22 H16.5 L18,10 Z" fill="currentColor" />
      <circle cx="8" cy="7" r="2.6" fill="currentColor" />
      <circle cx="12" cy="5.5" r="2.8" fill="currentColor" />
      <circle cx="16" cy="7" r="2.6" fill="currentColor" />
    </>
  ),
  eye: (
    <>
      <mask id="icon-eye-pupil">
        <rect width="24" height="24" fill="white" />
        <circle cx="12" cy="12" r="3.4" fill="black" />
      </mask>
      <path d="M2,12 C5,6 9,3.5 12,3.5 C15,3.5 19,6 22,12 C19,18 15,20.5 12,20.5 C9,20.5 5,18 2,12 Z" fill="currentColor" mask="url(#icon-eye-pupil)" />
      <circle cx="12" cy="12" r="1.6" fill="currentColor" />
    </>
  ),
  shuffle: (
    <>
      <path d="M3,7 H8 L19,17 H21" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <polygon points="21,17 17.5,17.3 19.3,20.5" fill="currentColor" />
      <path d="M3,17 H8 L12.5,12.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M15.5,9.5 L19,7 H21" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <polygon points="21,7 17.5,6.7 19.3,3.5" fill="currentColor" />
    </>
  ),
  hand: (
    <>
      <rect x="6" y="11" width="12" height="10" rx="4" fill="currentColor" />
      <rect x="6.5" y="2" width="3" height="11" rx="1.5" fill="currentColor" />
      <rect x="10.2" y="1" width="3" height="12" rx="1.5" fill="currentColor" />
      <rect x="13.9" y="2" width="3" height="11" rx="1.5" fill="currentColor" />
      <rect x="17.5" y="5" width="3" height="9" rx="1.5" fill="currentColor" />
      <rect x="2" y="10" width="5" height="7" rx="2.5" fill="currentColor" />
    </>
  ),
  keyboard: (
    <>
      <mask id="icon-keyboard-keys">
        <rect width="24" height="24" fill="white" />
        <rect x="4" y="8" width="2.5" height="2.5" fill="black" />
        <rect x="7.5" y="8" width="2.5" height="2.5" fill="black" />
        <rect x="11" y="8" width="2.5" height="2.5" fill="black" />
        <rect x="14.5" y="8" width="2.5" height="2.5" fill="black" />
        <rect x="18" y="8" width="2.5" height="2.5" fill="black" />
        <rect x="4" y="11.5" width="2.5" height="2.5" fill="black" />
        <rect x="7.5" y="11.5" width="2.5" height="2.5" fill="black" />
        <rect x="11" y="11.5" width="2.5" height="2.5" fill="black" />
        <rect x="14.5" y="11.5" width="2.5" height="2.5" fill="black" />
        <rect x="18" y="11.5" width="2.5" height="2.5" fill="black" />
        <rect x="6" y="15" width="12" height="2.2" fill="black" />
      </mask>
      <rect x="2" y="5.5" width="20" height="13" rx="2.5" fill="currentColor" mask="url(#icon-keyboard-keys)" />
    </>
  ),
  bell: (
    <>
      <path d="M12,2 C13,2 13.5,2.8 13.4,3.6 C16.5,4.5 18,7 18,10.5 V14 L20,17 H4 L6,14 V10.5 C6,7 7.5,4.5 10.6,3.6 C10.5,2.8 11,2 12,2 Z" fill="currentColor" />
      <path d="M9,18.5 C9,20 10.3,21.5 12,21.5 C13.7,21.5 15,20 15,18.5 Z" fill="currentColor" />
    </>
  ),
  pause: (
    <>
      <rect x="6" y="4" width="4" height="16" rx="1.2" fill="currentColor" />
      <rect x="14" y="4" width="4" height="16" rx="1.2" fill="currentColor" />
    </>
  ),
  hourglass: (
    <>
      <path d="M6,3 H18 V7 L13,12 L18,17 V21 H6 V17 L11,12 L6,7 Z" fill="currentColor" />
      <rect x="5" y="2" width="14" height="2" rx="1" fill="currentColor" />
      <rect x="5" y="20" width="14" height="2" rx="1" fill="currentColor" />
    </>
  ),
  sleep: (
    <path d="M5,7 H15 L5,15 H15 M9,13 H19 L9,21 H19" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  ),
  column: (
    <>
      <rect x="4" y="2" width="16" height="2.5" rx="0.5" fill="currentColor" />
      <rect x="4" y="19.5" width="16" height="2.5" rx="0.5" fill="currentColor" />
      <rect x="6" y="5" width="2.5" height="14" fill="currentColor" />
      <rect x="10.75" y="5" width="2.5" height="14" fill="currentColor" />
      <rect x="15.5" y="5" width="2.5" height="14" fill="currentColor" />
    </>
  ),
  wallet: (
    <>
      <mask id="icon-wallet-clasp">
        <rect width="24" height="24" fill="white" />
        <circle cx="17" cy="13" r="1.6" fill="black" />
      </mask>
      <path d="M3,7 A2,2 0 0 1 5,5 H17 A2,2 0 0 1 19,7 V9 H4 A1,1 0 0 0 3,10 Z" fill="currentColor" />
      <rect x="3" y="9" width="18" height="10" rx="2" fill="currentColor" mask="url(#icon-wallet-clasp)" />
    </>
  ),
  planet: (
    <>
      <circle cx="12" cy="12" r="6" fill="currentColor" />
      <ellipse cx="12" cy="12" rx="10" ry="3" fill="none" stroke="currentColor" strokeWidth="1.8" transform="rotate(-18 12 12)" />
    </>
  ),
  stop: <rect x="5" y="5" width="14" height="14" rx="2" fill="currentColor" />,
  satellite: (
    <>
      <rect x="3" y="2" width="5" height="8" rx="0.6" fill="currentColor" transform="rotate(-45 5.5 6)" />
      <rect x="16" y="14" width="5" height="8" rx="0.6" fill="currentColor" transform="rotate(-45 18.5 18)" />
      <rect x="9.5" y="9.5" width="5" height="5" rx="1" fill="currentColor" transform="rotate(-45 12 12)" />
      <line x1="15" y1="9" x2="19" y2="5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="20" cy="4" r="1.2" fill="currentColor" />
    </>
  ),
  fuel: (
    <>
      <rect x="9" y="3" width="6" height="4" rx="1" fill="currentColor" />
      <mask id="icon-fuel-drop">
        <rect width="24" height="24" fill="white" />
        <path d="M12,10.5 C13.3,12.3 14,13.6 14,14.7 C14,16.1 13.1,17 12,17 C10.9,17 10,16.1 10,14.7 C10,13.6 10.7,12.3 12,10.5 Z" fill="black" />
      </mask>
      <rect x="5" y="7" width="14" height="14" rx="2" fill="currentColor" mask="url(#icon-fuel-drop)" />
    </>
  ),
  ufo: (
    <>
      <ellipse cx="12" cy="10.5" rx="11" ry="3.2" fill="currentColor" />
      <path d="M8,8 C8,4.7 9.8,2.5 12,2.5 C14.2,2.5 16,4.7 16,8 Z" fill="currentColor" opacity="0.85" />
      <ellipse cx="12" cy="14" rx="6" ry="2" fill="currentColor" opacity="0.6" />
    </>
  ),
  astronaut: (
    <>
      <mask id="icon-astronaut-visor">
        <rect width="24" height="24" fill="white" />
        <ellipse cx="12" cy="12.5" rx="6.5" ry="7.5" fill="black" />
      </mask>
      <circle cx="12" cy="12" r="10" fill="currentColor" mask="url(#icon-astronaut-visor)" />
      <ellipse cx="9.5" cy="10.5" rx="2.3" ry="2.8" fill="currentColor" opacity="0.35" />
    </>
  ),
  door: (
    <>
      <mask id="icon-door-knob">
        <rect width="24" height="24" fill="white" />
        <circle cx="15" cy="12" r="1.2" fill="black" />
      </mask>
      <rect x="5" y="2" width="14" height="20" rx="1" fill="currentColor" mask="url(#icon-door-knob)" />
    </>
  ),
  window: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="1.5" fill="none" stroke="currentColor" strokeWidth="2" />
      <line x1="12" y1="3" x2="12" y2="21" stroke="currentColor" strokeWidth="2" />
      <line x1="3" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="2" />
    </>
  ),
  zombie: (
    <>
      <mask id="icon-zombie-face">
        <rect width="24" height="24" fill="white" />
        <path d="M6.5,9 L9.5,12 M9.5,9 L6.5,12" stroke="black" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M14.5,9 L17.5,12 M17.5,9 L14.5,12" stroke="black" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M8,17 Q12,15 16,17 Q12,19.5 8,17 Z" fill="black" />
      </mask>
      <circle cx="12" cy="13" r="9" fill="currentColor" mask="url(#icon-zombie-face)" />
    </>
  ),
  gun: <path d="M3,13 H15 V10 H21 V15 H17 V19 H13 V15 H7 L5,19 H2 Z" fill="currentColor" />,
  axe: (
    <>
      <rect x="10.5" y="6" width="2" height="16" rx="1" fill="currentColor" transform="rotate(20 11.5 14)" />
      <path d="M11,2 C15,2 18,5 18,8 C18,9.5 16.5,10.5 14,10 L9,7.5 C8.5,5 8.5,2 11,2 Z" fill="currentColor" />
    </>
  ),
  tree: (
    <>
      <polygon points="12,2 18,11 6,11" fill="currentColor" />
      <polygon points="12,7 19,16 5,16" fill="currentColor" />
      <rect x="10.5" y="16" width="3" height="6" fill="currentColor" />
    </>
  ),
  megaphone: (
    <>
      <path d="M3,11 L11,7 V17 L3,13 Z" fill="currentColor" />
      <path d="M11,7 L20,3 V21 L11,17 Z" fill="currentColor" opacity="0.85" />
      <rect x="2" y="10.5" width="2.5" height="3" rx="1" fill="currentColor" />
    </>
  ),
  house: (
    <>
      <mask id="icon-house-door">
        <rect width="24" height="24" fill="white" />
        <rect x="10" y="14" width="4" height="7" fill="black" />
      </mask>
      <polygon points="12,2 22,10 19,10 19,21 5,21 5,10 2,10" fill="currentColor" mask="url(#icon-house-door)" />
    </>
  ),
  chair: (
    <>
      <rect x="6" y="3" width="12" height="9" rx="1.5" fill="currentColor" />
      <rect x="6" y="12" width="2.5" height="9" rx="1" fill="currentColor" />
      <rect x="15.5" y="12" width="2.5" height="9" rx="1" fill="currentColor" />
      <rect x="6" y="15" width="12" height="2" fill="currentColor" />
    </>
  ),
  handshake: (
    <>
      <path d="M2,10 L8,10 L12,14 L9,17 L2,17 Z" fill="currentColor" />
      <path d="M22,10 L16,10 L12,14 L15,17 L22,17 Z" fill="currentColor" />
    </>
  ),
  idea: (
    <>
      <path d="M12,2 C8,2 5,5 5,9 C5,11.5 6.3,13.3 8,14.6 V17 H16 V14.6 C17.7,13.3 19,11.5 19,9 C19,5 16,2 12,2 Z" fill="currentColor" />
      <rect x="9" y="19" width="6" height="1.8" rx="0.9" fill="currentColor" />
      <rect x="9.5" y="21.3" width="5" height="1.6" rx="0.8" fill="currentColor" />
    </>
  ),
  sword: (
    <g transform="rotate(45 12 12)">
      <rect x="10.5" y="2" width="3" height="13" rx="1" fill="currentColor" />
      <rect x="7" y="14" width="10" height="2.4" rx="1" fill="currentColor" />
      <rect x="10.5" y="16" width="3" height="6" rx="1" fill="currentColor" />
    </g>
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
