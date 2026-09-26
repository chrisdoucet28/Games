import { MascotIcon, type MascotName } from "./MascotArt";
import { MASCOT_ICON_BY_EMOJI } from "./TeamIcon";
import { MASCOT_OPTIONS } from "../../data/constants";
import { LESSON_TOPICS } from "../../data/learnTopics";

// The app's own full-color illustrated mascots (MascotArt.tsx) — the same art team setup uses —
// rather than raw emoji glyphs, so a lesson page's mascots are recognizably ClassCade's own
// characters, not a generic emoji picker. Order matches MASCOT_OPTIONS (team setup's own list).
const ALL_MASCOTS: MascotName[] = MASCOT_OPTIONS.map(emoji => MASCOT_ICON_BY_EMOJI[emoji]);
const PAIR_COUNT = Math.floor(ALL_MASCOTS.length / 2);

// Deterministically picks a mascot pair for a topic so the same topic always shows the same pair
// (stable across reloads, and matching between the Learn screen and its lesson plan) while
// different topics get different pairs. Walks through EVERY mascot in the app exactly once across
// the first PAIR_COUNT topics (ordered by their position in LESSON_TOPICS), then wraps around and
// repeats from the start — every mascot gets a turn before any one repeats, rather than a few
// favorites showing up on every page. `variant` offsets the "cta" pair from the "header" pair by
// half the rotation so the same page never shows the exact same two characters twice.
export function pickMascotPair(topicId: string, variant: "header" | "cta"): [MascotName, MascotName] {
  const index = LESSON_TOPICS.findIndex(t => t.id === topicId);
  const safeIndex = index === -1 ? 0 : index;
  const offset = variant === "cta" ? Math.floor(PAIR_COUNT / 2) : 0;
  const slot = (safeIndex + offset) % PAIR_COUNT;
  return [ALL_MASCOTS[slot * 2], ALL_MASCOTS[slot * 2 + 1]];
}

// "header" overlaps a card's top-right border (the card needs position:relative); "cta" sits
// centered above a call-to-action, cheering it on.
export function MascotDuo({ variant, mascots }: { variant: "header" | "cta"; mascots: [MascotName, MascotName] }) {
  if (variant === "header") {
    return (
      <div style={{ position: "absolute", top: "-16px", right: "24px", display: "flex", alignItems: "flex-end", pointerEvents: "none" }}>
        <span style={{ display: "inline-block", transform: "rotate(-8deg)" }}><MascotIcon name={mascots[0]} size={30} /></span>
        <span style={{ display: "inline-block", transform: "rotate(6deg)", marginLeft: "-8px" }}><MascotIcon name={mascots[1]} size={36} /></span>
      </div>
    );
  }
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-end", marginBottom: "2px" }}>
      <span style={{ display: "inline-block", transform: "rotate(-8deg)" }}><MascotIcon name={mascots[0]} size={34} /></span>
      <span style={{ display: "inline-block", transform: "rotate(6deg)", marginLeft: "-6px" }}><MascotIcon name={mascots[1]} size={40} /></span>
    </div>
  );
}
