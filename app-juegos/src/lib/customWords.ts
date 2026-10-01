// Turns whatever a teacher types or pastes into a clean list of words for the vocabulary games
// (Hot Seat, Word Relay — and any word-list game added later; see hooks/useWordDeck.ts), and
// remembers the last list on that computer. Pure helpers, no React.

export const MAX_WORDS = 200;
export const MAX_WORD_LENGTH = 40;

export type ParsedWordList = {
  words: string[];
  // Items skipped for being longer than MAX_WORD_LENGTH.
  tooLong: number;
  // Repeats of an earlier item (case-insensitive) that were left out.
  duplicates: number;
  // True when the list had more than MAX_WORDS usable items and the rest were left out.
  capped: boolean;
};

const WRAPPING_QUOTES = /^(["'“‘«])(.*)(["'”’»])$/;

// Splits on commas, semicolons and line breaks (so a list pasted from a spreadsheet column or a
// document works too), tidies each item, keeps multi-word items ("look after", "Taylor Swift") and
// the teacher's own capitalisation, and drops repeats.
export function parseWordList(text: string): ParsedWordList {
  const seen = new Set<string>();
  const words: string[] = [];
  let tooLong = 0;
  let duplicates = 0;
  let capped = false;

  for (const raw of text.split(/[,;\n\r\t]+/)) {
    let item = raw.replace(/\s+/g, " ").trim();
    // A leading bullet or list number: "- run", "• run", "3. run", "3) run".
    item = item.replace(/^(?:[-*•·]+|\d+[.)])\s+/, "");
    const quoted = item.match(WRAPPING_QUOTES);
    if (quoted) item = quoted[2].trim();
    if (!item) continue;
    if (item.length > MAX_WORD_LENGTH) { tooLong += 1; continue; }
    const key = item.toLowerCase();
    if (seen.has(key)) { duplicates += 1; continue; }
    if (words.length >= MAX_WORDS) { capped = true; continue; }
    seen.add(key);
    words.push(item);
  }
  return { words, tooLong, duplicates, capped };
}

// One shared key: a teacher's words are the same whichever vocabulary game they're used in. Stores
// the raw text (as typed) so the commas and line breaks come back exactly as they left them.
const STORAGE_KEY = "classcade-custom-words";

export function loadSavedWords(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

export function saveWords(text: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, text);
  } catch {
    // Private browsing / storage full: the list just isn't remembered — never worth an error.
  }
}

export function clearSavedWords(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing to clear.
  }
}
