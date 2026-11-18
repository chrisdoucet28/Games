// Spy Among Us's crewmatePrompt/spyPrompt strings mix an instruction with quoted example
// phrases in one run-on sentence (e.g. "Talk about travel experiences using present perfect —
// 'I have visited', 'I've been to'…"), with nothing visually separating the two — caught live,
// students kept reading the quoted examples as part of what they literally had to say rather
// than as illustrations. This splits a prompt at wherever its example phrases start, so the
// caller can render them as two distinct chunks (see SpyAmongUsGame.tsx's peek card and
// PhoneSpyView.tsx's role card for the actual divider + "EXAMPLE" header).
//
// The divider is always either ": '" or " — '" (a colon or em dash directly followed by a
// quote) — taking the LEFTMOST such marker in the string is always correct even when the
// example phrases themselves contain further em dashes (a dialogue-exchange convention used in
// some prompts, e.g. "'I can swim.' — 'So can I.'"), because that kind of em dash only ever
// appears between two quotes that come after the real divider, never before it. Falls back to
// treating the whole string as instruction (no split) when no such marker exists at all, rather
// than guessing wrong on an unfamiliar shape.
export function splitPromptExample(prompt: string): { instruction: string; example: string | null } {
  const match = /^(.*?[:—])\s*(['"].*)$/.exec(prompt);
  if (!match) return { instruction: prompt, example: null };
  return { instruction: match[1].slice(0, -1).trim(), example: match[2].trim() };
}
