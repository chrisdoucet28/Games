import { GAME_CATEGORIES, CATEGORY_SHORT_LABELS } from "../../data/gameCategories";

// Narrows which game cards show below (and what "Surprise Me!" picks from) by the same "I need…"
// category each card is already grouped by. An empty set means "no restriction" — every game
// shows, same as before this existed. Chips wrap on narrow screens rather than scrolling.
//
// This used to have a second row filtering by how a game wants an answer (tap/speak/write), but
// that axis mostly just restated the category row less precisely (e.g. "Tap / pick" and
// "Understand the topic" always picked out the exact same 2 games) — dropped rather than kept as
// a row that looked like it was narrowing something but mostly wasn't.
type Props = {
  activeCategoryIds: ReadonlySet<string>;
  onToggleCategory: (id: string) => void;
  onClear: () => void;
  visibleCount: number;
  totalCount: number;
};

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      style={{
        background: active ? "#0C1E3D" : "white",
        color: active ? "white" : "#374151",
        border: `2px solid ${active ? "#0C1E3D" : "#D1D5DB"}`,
        borderRadius: "999px",
        padding: "5px 14px",
        fontWeight: 700,
        fontSize: "12.5px",
        cursor: "pointer",
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </button>
  );
}

export function GameFilterBar({ activeCategoryIds, onToggleCategory, onClear, visibleCount, totalCount }: Props) {
  const hasFilters = activeCategoryIds.size > 0;

  return (
    <div style={{ background: "white", border: "2px solid #E5E7EB", borderRadius: "16px", padding: "14px 18px", marginBottom: "22px", display: "flex", flexDirection: "column", gap: "10px" }}>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px" }}>
        <span style={{ fontSize: "11px", fontWeight: 800, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.06em", marginRight: "2px" }}>I need</span>
        {GAME_CATEGORIES.map(cat => (
          <Chip key={cat.id} active={activeCategoryIds.has(cat.id)} onClick={() => onToggleCategory(cat.id)}>
            {CATEGORY_SHORT_LABELS[cat.id] ?? cat.id}
          </Chip>
        ))}
      </div>
      {hasFilters && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px", paddingTop: "4px", borderTop: "1px solid #F3F4F6" }}>
          <span style={{ fontSize: "12.5px", color: "#6B7280", fontWeight: 600 }}>
            Showing {visibleCount} of {totalCount} games — Surprise Me! only picks from these.
          </span>
          <button
            type="button"
            onClick={onClear}
            style={{ background: "none", border: "none", color: "#4F46E5", fontWeight: 700, fontSize: "12.5px", cursor: "pointer", textDecoration: "underline", padding: 0 }}
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
