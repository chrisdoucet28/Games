// Suggested word packs for the vocabulary games' "Use my own words" box (components/shared/
// CustomWordsPanel.tsx): one tap fills the box with a ready-made list the teacher can still edit
// before using it — e.g. "Famous people" for a "which celebrity am I?" round of Word Relay.
//
// Deliberately empty for now (the owner said packs come later). To add one, append an entry here:
//   { id: "family", name: "Family members", words: ["mother", "father", "grandmother", …] }
// and a "Suggested packs" row appears in the box automatically — nothing else to change.
export type WordPack = { id: string; name: string; words: string[] };

export const WORD_PACKS: WordPack[] = [];
