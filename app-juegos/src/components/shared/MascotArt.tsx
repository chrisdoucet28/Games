// Full-color "cute/glossy" mascot illustrations — the richer sibling of Icon.tsx's flat
// currentColor glyphs. Styled after the rounded, glossy modern emoji look (big simple eyes with a
// highlight dot, soft flat-to-subtle-gradient color, no sharp points or exposed teeth) rather than
// a painterly/shaded illustration — an earlier fully-shaded version read as "edgy" (a toothy fox
// grin, a spiky sunburst lion mane) instead of cute, which is the wrong register for a classroom
// team mascot. Each entry has its own fixed, baked-in palette (not currentColor), so a mascot
// reads as a real character and stays legible on any background without a per-site color override.
// Gradient/mask ids are static per mascot (not per-instance) — safe to duplicate across multiple
// simultaneous renders of the same mascot on one page (e.g. a team roster listing five dragons)
// because every instance defines the identical stops, so a duplicate DOM id just resolves to an
// equivalent definition. Same convention Icon.tsx already uses for its own masks.
import type { CSSProperties } from "react";

export type MascotName =
  | "dragon" | "unicorn" | "robot" | "fox" | "frog" | "lion" | "penguin" | "dino" | "bee"
  | "butterfly" | "octopus" | "eagle" | "turtle" | "wolf" | "owl" | "tiger" | "pizza"
  | "ghost" | "ninja" | "alien" | "panda" | "shark" | "dog" | "cat";

// Standard glossy eye pair — reused verbatim by every mascot whose face sits at the default
// head-circle position (cx 12 cy 13 r 9); a few (frog, penguin, robot, owl) place eyes on their
// own raised features instead and inline their own.
const EYES = (
  <>
    <circle cx="8.7" cy="12" r="1.9" fill="#1E293B" />
    <circle cx="15.3" cy="12" r="1.9" fill="#1E293B" />
    <circle cx="8.1" cy="11.4" r="0.55" fill="#FFFFFF" />
    <circle cx="14.7" cy="11.4" r="0.55" fill="#FFFFFF" />
  </>
);

const MASCOT_ART: Record<MascotName, React.ReactNode> = {
  dragon: (
    <>
      <radialGradient id="m-dragon-body" cx="35%" cy="28%" r="80%">
        <stop offset="0%" stopColor="#6EE7A0" />
        <stop offset="100%" stopColor="#22A85A" />
      </radialGradient>
      <path d="M8,3.5 C6.5,3 6,5 7,6.5 C6,7 5.5,8.5 6.5,9" fill="#1D8A4A" />
      <path d="M16,3.5 C17.5,3 18,5 17,6.5 C18,7 18.5,8.5 17.5,9" fill="#1D8A4A" />
      <circle cx="12" cy="13" r="9" fill="url(#m-dragon-body)" />
      <ellipse cx="12" cy="17" rx="5.5" ry="3.6" fill="#FDF6E3" />
      {EYES}
      <ellipse cx="12" cy="18" rx="1.3" ry="0.9" fill="#F59E0B" />
    </>
  ),
  unicorn: (
    <>
      <radialGradient id="m-unicorn-body" cx="35%" cy="28%" r="80%">
        <stop offset="0%" stopColor="#FFFFFF" />
        <stop offset="100%" stopColor="#E9D5FF" />
      </radialGradient>
      <polygon points="13,2 11.3,6.5 14.5,6" fill="#FCD34D" />
      <path d="M6.5,7 C5,6.3 4,7.3 3.2,6.3 M6.8,9.3 C5.3,9 4.5,10.2 3.5,9.5" stroke="#F0ABFC" strokeWidth="1.4" fill="none" strokeLinecap="round" />
      <circle cx="12" cy="13" r="9" fill="url(#m-unicorn-body)" />
      <ellipse cx="12" cy="17" rx="5" ry="3.4" fill="#FBF7FF" />
      {EYES}
      <ellipse cx="12" cy="18" rx="1.1" ry="0.8" fill="#F9A8D4" />
    </>
  ),
  robot: (
    <>
      <radialGradient id="m-robot-body" cx="35%" cy="28%" r="80%">
        <stop offset="0%" stopColor="#E2E8F0" />
        <stop offset="100%" stopColor="#94A3B8" />
      </radialGradient>
      <line x1="12" y1="4.5" x2="12" y2="2" stroke="#94A3B8" strokeWidth="1.6" />
      <circle cx="12" cy="1.6" r="1.2" fill="#FDE047" />
      <rect x="3.5" y="10" width="17" height="12" rx="6" fill="url(#m-robot-body)" />
      <circle cx="8.7" cy="14.5" r="2.1" fill="#38BDF8" />
      <circle cx="15.3" cy="14.5" r="2.1" fill="#38BDF8" />
      <circle cx="8.7" cy="14.5" r="1.1" fill="#1E293B" />
      <circle cx="15.3" cy="14.5" r="1.1" fill="#1E293B" />
      <circle cx="8.2" cy="13.9" r="0.4" fill="#FFFFFF" />
      <circle cx="14.8" cy="13.9" r="0.4" fill="#FFFFFF" />
      <rect x="9.5" y="18.5" width="5" height="1.4" rx="0.7" fill="#64748B" />
    </>
  ),
  fox: (
    <>
      <radialGradient id="m-fox-body" cx="35%" cy="28%" r="80%">
        <stop offset="0%" stopColor="#FDA95D" />
        <stop offset="100%" stopColor="#F0740E" />
      </radialGradient>
      <path d="M5.5,7 C5,4.5 6.5,3.5 8.5,5.5 Z" fill="#F0740E" />
      <path d="M18.5,7 C19,4.5 17.5,3.5 15.5,5.5 Z" fill="#F0740E" />
      <circle cx="12" cy="13" r="9" fill="url(#m-fox-body)" />
      <path d="M12,15 C9,15 7,17 7.5,19.5 C9,21.5 15,21.5 16.5,19.5 C17,17 15,15 12,15 Z" fill="#FEF3E2" />
      {EYES}
      <ellipse cx="12" cy="17.3" rx="1" ry="0.75" fill="#7C2D12" />
    </>
  ),
  frog: (
    <>
      <radialGradient id="m-frog-body" cx="35%" cy="28%" r="80%">
        <stop offset="0%" stopColor="#8CE6A0" />
        <stop offset="100%" stopColor="#3FAE5C" />
      </radialGradient>
      <circle cx="12" cy="14.5" r="9" fill="url(#m-frog-body)" />
      <circle cx="8.5" cy="8" r="3.4" fill="url(#m-frog-body)" />
      <circle cx="15.5" cy="8" r="3.4" fill="url(#m-frog-body)" />
      <circle cx="8.5" cy="7.6" r="1.6" fill="#1E293B" />
      <circle cx="15.5" cy="7.6" r="1.6" fill="#1E293B" />
      <circle cx="8" cy="7.1" r="0.45" fill="#FFFFFF" />
      <circle cx="15" cy="7.1" r="0.45" fill="#FFFFFF" />
      <ellipse cx="12" cy="18.5" rx="6" ry="3.6" fill="#DFF6E0" />
      <path d="M8.5,18 Q12,20 15.5,18" stroke="#3FAE5C" strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.7" />
    </>
  ),
  lion: (
    <>
      <circle cx="12" cy="4.5" r="5.2" fill="#E9932A" />
      <circle cx="17.3" cy="6.7" r="5.2" fill="#E9932A" />
      <circle cx="19.5" cy="12" r="5.2" fill="#E9932A" />
      <circle cx="17.3" cy="17.3" r="5.2" fill="#E9932A" />
      <circle cx="12" cy="19.5" r="5.2" fill="#E9932A" />
      <circle cx="6.7" cy="17.3" r="5.2" fill="#E9932A" />
      <circle cx="4.5" cy="12" r="5.2" fill="#E9932A" />
      <circle cx="6.7" cy="6.7" r="5.2" fill="#E9932A" />
      <circle cx="12" cy="12.5" r="6.3" fill="#FDE9B8" />
      <circle cx="9.2" cy="11.5" r="1.7" fill="#1E293B" />
      <circle cx="14.8" cy="11.5" r="1.7" fill="#1E293B" />
      <circle cx="8.7" cy="10.9" r="0.5" fill="#FFFFFF" />
      <circle cx="14.3" cy="10.9" r="0.5" fill="#FFFFFF" />
      <ellipse cx="12" cy="14.7" rx="1.2" ry="0.85" fill="#B45309" />
    </>
  ),
  penguin: (
    <>
      <radialGradient id="m-penguin-body" cx="35%" cy="28%" r="80%">
        <stop offset="0%" stopColor="#3B4B60" />
        <stop offset="100%" stopColor="#1E293B" />
      </radialGradient>
      <circle cx="12" cy="13" r="9" fill="url(#m-penguin-body)" />
      <ellipse cx="12" cy="15.5" rx="6" ry="7" fill="#F8FAFC" />
      <polygon points="10.3,15 13.7,15 12,17" fill="#F59E0B" />
      <ellipse cx="6.3" cy="19.5" rx="1.5" ry="0.9" fill="#F59E0B" />
      <ellipse cx="17.7" cy="19.5" rx="1.5" ry="0.9" fill="#F59E0B" />
      <circle cx="9" cy="12.3" r="1.7" fill="#1E293B" />
      <circle cx="15" cy="12.3" r="1.7" fill="#1E293B" />
      <circle cx="8.5" cy="11.7" r="0.5" fill="#FFFFFF" />
      <circle cx="14.5" cy="11.7" r="0.5" fill="#FFFFFF" />
    </>
  ),
  dino: (
    <>
      <radialGradient id="m-dino-body" cx="35%" cy="28%" r="80%">
        <stop offset="0%" stopColor="#B7E86B" />
        <stop offset="100%" stopColor="#6BA22E" />
      </radialGradient>
      <circle cx="16.5" cy="4.3" r="1.6" fill="#5A8A26" />
      <circle cx="19" cy="6.3" r="1.4" fill="#5A8A26" />
      <circle cx="20.5" cy="9" r="1.2" fill="#5A8A26" />
      <circle cx="12" cy="13" r="9" fill="url(#m-dino-body)" />
      <ellipse cx="10" cy="17.5" rx="5.5" ry="3.4" fill="#EFFAD6" />
      {EYES}
      <ellipse cx="12" cy="18.3" rx="1" ry="0.75" fill="#3F6212" />
    </>
  ),
  bee: (
    <>
      <radialGradient id="m-bee-body" cx="35%" cy="28%" r="80%">
        <stop offset="0%" stopColor="#FEE58A" />
        <stop offset="100%" stopColor="#F2C230" />
      </radialGradient>
      <ellipse cx="5.5" cy="9" rx="4.6" ry="3.4" fill="#DCEEFF" opacity="0.85" transform="rotate(-18 5.5 9)" />
      <ellipse cx="18.5" cy="9" rx="4.6" ry="3.4" fill="#DCEEFF" opacity="0.85" transform="rotate(18 18.5 9)" />
      <path d="M9,4 Q8.3,2.3 9.8,2 M15,4 Q15.7,2.3 14.2,2" stroke="#1E293B" strokeWidth="1.1" fill="none" strokeLinecap="round" />
      <circle cx="12" cy="13" r="9" fill="url(#m-bee-body)" />
      <rect x="3.3" y="10.3" width="17.4" height="2.6" rx="1.3" fill="#1E293B" opacity="0.88" />
      <rect x="3.3" y="15" width="17.4" height="2.6" rx="1.3" fill="#1E293B" opacity="0.88" />
      {EYES}
      <ellipse cx="12" cy="18.3" rx="1" ry="0.7" fill="#B45309" />
    </>
  ),
  butterfly: (
    <>
      <radialGradient id="m-butterfly-a" cx="35%" cy="28%" r="80%">
        <stop offset="0%" stopColor="#F0ABFC" />
        <stop offset="100%" stopColor="#C026D3" />
      </radialGradient>
      <radialGradient id="m-butterfly-b" cx="35%" cy="28%" r="80%">
        <stop offset="0%" stopColor="#93C5FD" />
        <stop offset="100%" stopColor="#3B82F6" />
      </radialGradient>
      <ellipse cx="6.5" cy="9.5" rx="5.3" ry="4.4" fill="url(#m-butterfly-a)" transform="rotate(-18 6.5 9.5)" />
      <ellipse cx="17.5" cy="9.5" rx="5.3" ry="4.4" fill="url(#m-butterfly-a)" transform="rotate(18 17.5 9.5)" />
      <ellipse cx="7.5" cy="16.5" rx="4" ry="3.4" fill="url(#m-butterfly-b)" transform="rotate(-15 7.5 16.5)" />
      <ellipse cx="16.5" cy="16.5" rx="4" ry="3.4" fill="url(#m-butterfly-b)" transform="rotate(15 16.5 16.5)" />
      <circle cx="6" cy="9" r="1.5" fill="#FDE68A" opacity="0.9" />
      <circle cx="18" cy="9" r="1.5" fill="#FDE68A" opacity="0.9" />
      <circle cx="12" cy="12.5" r="3.2" fill="#4C1D95" />
      <circle cx="10.7" cy="11.9" r="1" fill="#1E293B" />
      <circle cx="13.3" cy="11.9" r="1" fill="#1E293B" />
      <circle cx="10.4" cy="11.5" r="0.3" fill="#FFFFFF" />
      <circle cx="13" cy="11.5" r="0.3" fill="#FFFFFF" />
    </>
  ),
  octopus: (
    <>
      <radialGradient id="m-octopus-body" cx="35%" cy="28%" r="80%">
        <stop offset="0%" stopColor="#F0ABFC" />
        <stop offset="100%" stopColor="#B92FD1" />
      </radialGradient>
      <circle cx="6" cy="19.5" r="2.6" fill="#B92FD1" />
      <circle cx="10" cy="21" r="2.6" fill="#B92FD1" />
      <circle cx="14" cy="21" r="2.6" fill="#B92FD1" />
      <circle cx="18" cy="19.5" r="2.6" fill="#B92FD1" />
      <circle cx="12" cy="11" r="9" fill="url(#m-octopus-body)" />
      <circle cx="8.7" cy="10" r="1.9" fill="#1E293B" />
      <circle cx="15.3" cy="10" r="1.9" fill="#1E293B" />
      <circle cx="8.1" cy="9.4" r="0.55" fill="#FFFFFF" />
      <circle cx="14.7" cy="9.4" r="0.55" fill="#FFFFFF" />
      <path d="M9.3,13.8 Q12,15.3 14.7,13.8" stroke="#1E293B" strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.8" />
    </>
  ),
  eagle: (
    <>
      <radialGradient id="m-eagle-body" cx="35%" cy="28%" r="80%">
        <stop offset="0%" stopColor="#B4844A" />
        <stop offset="100%" stopColor="#7C5A2E" />
      </radialGradient>
      <circle cx="12" cy="13" r="9" fill="url(#m-eagle-body)" />
      <ellipse cx="12" cy="11.5" rx="6.3" ry="5.6" fill="#FBF8F2" />
      <path d="M10.3,14.3 Q12,16.3 13.7,14.3 Q12,15.6 10.3,14.3 Z" fill="#F2A93B" />
      {EYES}
    </>
  ),
  turtle: (
    <>
      <radialGradient id="m-turtle-body" cx="35%" cy="28%" r="80%">
        <stop offset="0%" stopColor="#8CE6A0" />
        <stop offset="100%" stopColor="#2F9653" />
      </radialGradient>
      <circle cx="3.6" cy="12" r="2.3" fill="#8CE6A0" />
      <circle cx="20.4" cy="12" r="2.3" fill="#8CE6A0" />
      <circle cx="12" cy="13" r="9" fill="url(#m-turtle-body)" />
      <path d="M12,7.5 L12,18.5 M6.5,13 L17.5,13 M8.3,9.3 L15.7,16.7 M15.7,9.3 L8.3,16.7" stroke="#1D7A42" strokeWidth="0.7" opacity="0.35" />
      <ellipse cx="12" cy="17.3" rx="5.3" ry="3.2" fill="#E7FBE8" />
      {EYES}
    </>
  ),
  wolf: (
    <>
      <radialGradient id="m-wolf-body" cx="35%" cy="28%" r="80%">
        <stop offset="0%" stopColor="#CBD5E1" />
        <stop offset="100%" stopColor="#64748B" />
      </radialGradient>
      <path d="M5.5,7 C5,4 7,3 8.7,5.7 Z" fill="#64748B" />
      <path d="M18.5,7 C19,4 17,3 15.3,5.7 Z" fill="#64748B" />
      <circle cx="12" cy="13" r="9" fill="url(#m-wolf-body)" />
      <path d="M12,15 C9.3,15 7.5,16.8 8,19 C9.3,20.8 14.7,20.8 16,19 C16.5,16.8 14.7,15 12,15 Z" fill="#F8FAFC" />
      {EYES}
      <ellipse cx="12" cy="17.3" rx="1" ry="0.75" fill="#334155" />
    </>
  ),
  owl: (
    <>
      <radialGradient id="m-owl-body" cx="35%" cy="28%" r="80%">
        <stop offset="0%" stopColor="#D9AB6E" />
        <stop offset="100%" stopColor="#A5713A" />
      </radialGradient>
      <path d="M6,5 C5,3.3 6.5,2.7 8.3,4.5 Z" fill="#8B5A2B" />
      <path d="M18,5 C19,3.3 17.5,2.7 15.7,4.5 Z" fill="#8B5A2B" />
      <circle cx="12" cy="13" r="9" fill="url(#m-owl-body)" />
      <circle cx="8.7" cy="12.3" r="3.1" fill="#FEF6E7" />
      <circle cx="15.3" cy="12.3" r="3.1" fill="#FEF6E7" />
      <circle cx="8.7" cy="12.3" r="1.6" fill="#1E293B" />
      <circle cx="15.3" cy="12.3" r="1.6" fill="#1E293B" />
      <circle cx="8.2" cy="11.7" r="0.5" fill="#FFFFFF" />
      <circle cx="14.8" cy="11.7" r="0.5" fill="#FFFFFF" />
      <polygon points="12,14.5 11,16.3 13,16.3" fill="#F59E0B" />
    </>
  ),
  tiger: (
    <>
      <radialGradient id="m-tiger-body" cx="35%" cy="28%" r="80%">
        <stop offset="0%" stopColor="#FDA95D" />
        <stop offset="100%" stopColor="#F0740E" />
      </radialGradient>
      <circle cx="5.5" cy="6" r="2.6" fill="#F0740E" />
      <circle cx="18.5" cy="6" r="2.6" fill="#F0740E" />
      <circle cx="5.5" cy="6" r="1.3" fill="#FDE9B8" />
      <circle cx="18.5" cy="6" r="1.3" fill="#FDE9B8" />
      <circle cx="12" cy="13" r="9" fill="url(#m-tiger-body)" />
      <path d="M4,9.5 Q6,10.5 5,12 M4.3,14.5 Q6.3,15 5.6,16.5 M19.7,14.5 Q17.7,15 18.4,16.5 M20,9.5 Q18,10.5 19,12" stroke="#1E293B" strokeWidth="1.3" fill="none" strokeLinecap="round" opacity="0.8" />
      <ellipse cx="12" cy="16" rx="5" ry="3.4" fill="#FEF3E2" />
      {EYES}
      <ellipse cx="12" cy="17" rx="1" ry="0.75" fill="#7C2D12" />
    </>
  ),
  pizza: (
    <>
      <radialGradient id="m-pizza-crust" cx="35%" cy="20%" r="90%">
        <stop offset="0%" stopColor="#FCD675" />
        <stop offset="100%" stopColor="#E8A33C" />
      </radialGradient>
      <path d="M12,3 L21,19.5 A2,2 0 0 1 19.3,21 H4.7 A2,2 0 0 1 3,19.5 Z" fill="url(#m-pizza-crust)" />
      <path d="M12,7.2 L18,18 H6 Z" fill="#E23B3B" />
      <path d="M12,7.2 L18,18 H6 Z" fill="#FCD675" opacity="0.35" />
      <circle cx="10" cy="12" r="1.5" fill="#B91C1C" />
      <circle cx="14" cy="14.3" r="1.5" fill="#B91C1C" />
      <circle cx="9.6" cy="16.3" r="1.3" fill="#B91C1C" />
      <circle cx="13.6" cy="10.6" r="1.1" fill="#65A30D" />
    </>
  ),
  alien: (
    <>
      <radialGradient id="m-alien-body" cx="35%" cy="26%" r="82%">
        <stop offset="0%" stopColor="#99F6E4" />
        <stop offset="100%" stopColor="#14B8A6" />
      </radialGradient>
      <ellipse cx="12" cy="13.5" rx="8" ry="9.5" fill="url(#m-alien-body)" />
      <ellipse cx="8.5" cy="12" rx="2.6" ry="3.4" fill="#0F172A" transform="rotate(-12 8.5 12)" />
      <ellipse cx="15.5" cy="12" rx="2.6" ry="3.4" fill="#0F172A" transform="rotate(12 15.5 12)" />
      <ellipse cx="7.7" cy="10.6" rx="0.7" ry="0.9" fill="#FFFFFF" opacity="0.8" />
      <ellipse cx="14.7" cy="10.6" rx="0.7" ry="0.9" fill="#FFFFFF" opacity="0.8" />
      <path d="M9,18 Q12,19.3 15,18" stroke="#0F766E" strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.7" />
    </>
  ),
  panda: (
    <>
      <radialGradient id="m-panda-body" cx="35%" cy="26%" r="82%">
        <stop offset="0%" stopColor="#FFFFFF" />
        <stop offset="100%" stopColor="#E5E9F0" />
      </radialGradient>
      <circle cx="5" cy="6" r="3.1" fill="#1E293B" />
      <circle cx="19" cy="6" r="3.1" fill="#1E293B" />
      <circle cx="12" cy="13" r="9" fill="url(#m-panda-body)" />
      <ellipse cx="8.5" cy="12" rx="2.6" ry="3.2" fill="#1E293B" transform="rotate(-8 8.5 12)" />
      <ellipse cx="15.5" cy="12" rx="2.6" ry="3.2" fill="#1E293B" transform="rotate(8 15.5 12)" />
      <circle cx="8.9" cy="12.2" r="1.3" fill="#FFFFFF" />
      <circle cx="15.1" cy="12.2" r="1.3" fill="#FFFFFF" />
      <circle cx="8.9" cy="12.2" r="0.75" fill="#1E293B" />
      <circle cx="15.1" cy="12.2" r="0.75" fill="#1E293B" />
      <circle cx="8.55" cy="11.85" r="0.22" fill="#FFFFFF" />
      <circle cx="14.75" cy="11.85" r="0.22" fill="#FFFFFF" />
      <ellipse cx="12" cy="16.5" rx="1.3" ry="1" fill="#1E293B" />
    </>
  ),
  shark: (
    <>
      <radialGradient id="m-shark-body" cx="35%" cy="26%" r="82%">
        <stop offset="0%" stopColor="#B8C6D9" />
        <stop offset="100%" stopColor="#6B7F99" />
      </radialGradient>
      <path d="M10,2.5 C10.5,1 12.5,1 13,2.5 L13.6,6.3 H9.4 Z" fill="#8393AC" />
      <circle cx="12" cy="13" r="9" fill="url(#m-shark-body)" />
      <path d="M4,15.5 C7,17.5 17,17.5 20,15.5 C20,19.5 16.5,21.8 12,21.8 C7.5,21.8 4,19.5 4,15.5 Z" fill="#EEF2F8" />
      {EYES}
      <path d="M9,18 Q12,19.3 15,18" stroke="#475569" strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.6" />
    </>
  ),
  dog: (
    <>
      <radialGradient id="m-dog-body" cx="35%" cy="26%" r="82%">
        <stop offset="0%" stopColor="#E8B274" />
        <stop offset="100%" stopColor="#C4874A" />
      </radialGradient>
      <ellipse cx="4.3" cy="10" rx="3.3" ry="5.2" fill="#C4874A" transform="rotate(-18 4.3 10)" />
      <ellipse cx="19.7" cy="10" rx="3.3" ry="5.2" fill="#C4874A" transform="rotate(18 19.7 10)" />
      <circle cx="12" cy="13" r="9" fill="url(#m-dog-body)" />
      <ellipse cx="12" cy="17" rx="5.3" ry="3.4" fill="#FDF3E4" />
      {EYES}
      <ellipse cx="12" cy="16.3" rx="1.3" ry="1" fill="#3B241A" />
    </>
  ),
  cat: (
    <>
      <radialGradient id="m-cat-body" cx="35%" cy="26%" r="82%">
        <stop offset="0%" stopColor="#FDE6C4" />
        <stop offset="100%" stopColor="#F0B366" />
      </radialGradient>
      <path d="M4.5,7 C4,4 6.5,3 8.5,5.8 Z" fill="#F0B366" />
      <path d="M19.5,7 C20,4 17.5,3 15.5,5.8 Z" fill="#F0B366" />
      <circle cx="12" cy="13" r="9" fill="url(#m-cat-body)" />
      <ellipse cx="12" cy="17" rx="5.3" ry="3.4" fill="#FEF6E9" />
      {EYES}
      <polygon points="11,16.3 13,16.3 12,17.4" fill="#D97757" />
      <path d="M2.5,15.5 L7,15.8 M2.8,18 L7.1,17.3 M21.5,15.5 L17,15.8 M21.2,18 L16.9,17.3" stroke="#C4874A" strokeWidth="0.6" opacity="0.6" strokeLinecap="round" />
    </>
  ),
  ghost: (
    <>
      <radialGradient id="m-ghost-body" cx="35%" cy="26%" r="82%">
        <stop offset="0%" stopColor="#FFFFFF" />
        <stop offset="100%" stopColor="#D6C6FA" />
      </radialGradient>
      <path d="M4.5,20.5 V11.5 C4.5,6.3 7.8,3 12,3 C16.2,3 19.5,6.3 19.5,11.5 V20.5 C19.5,21.4 18.3,21.7 17.7,21 L16.2,19.2 C15.8,18.7 15,18.7 14.6,19.2 L13.1,21 C12.6,21.6 11.4,21.6 10.9,21 L9.4,19.2 C9,18.7 8.2,18.7 7.8,19.2 L6.3,21 C5.7,21.7 4.5,21.4 4.5,20.5 Z" fill="url(#m-ghost-body)" />
      <circle cx="9" cy="12.5" r="1.8" fill="#1E293B" />
      <circle cx="15" cy="12.5" r="1.8" fill="#1E293B" />
      <circle cx="8.5" cy="11.9" r="0.5" fill="#FFFFFF" />
      <circle cx="14.5" cy="11.9" r="0.5" fill="#FFFFFF" />
      <ellipse cx="12" cy="16" rx="1.2" ry="0.9" fill="#8B5CF6" opacity="0.6" />
    </>
  ),
  ninja: (
    <>
      <radialGradient id="m-ninja-body" cx="35%" cy="28%" r="80%">
        <stop offset="0%" stopColor="#4B5A70" />
        <stop offset="100%" stopColor="#242F3E" />
      </radialGradient>
      <circle cx="12" cy="13" r="9" fill="url(#m-ninja-body)" />
      <path d="M3.5,11 C6,9.7 18,9.7 20.5,11 C18,12.5 6,12.5 3.5,11 Z" fill="#F1F5F9" />
      <path d="M20,10.3 L23,8.7 L22,12.2 Z" fill="#E11D48" />
      <circle cx="9" cy="11.1" r="1.5" fill="#1E293B" />
      <circle cx="15" cy="11.1" r="1.5" fill="#1E293B" />
      <circle cx="8.5" cy="10.6" r="0.45" fill="#FFFFFF" />
      <circle cx="14.5" cy="10.6" r="0.45" fill="#FFFFFF" />
    </>
  ),
};

type Props = { name: MascotName; size?: number; style?: CSSProperties; className?: string };

export function MascotIcon({ name, size = 24, style, className }: Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      aria-hidden="true"
      className={className}
      style={{ display: "inline-block", verticalAlign: "-4px", flexShrink: 0, filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.3))", ...style }}
    >
      {MASCOT_ART[name]}
    </svg>
  );
}
