import { gameLabel, topicLabel, formatQuestionData } from "./AdminFeedbackPanel";
import type { FeedbackRow } from "../../lib/adminFeedback";
import type { ContentSuggestion } from "../../lib/adminContent";

// Bridges the one real gap in this workflow: the app owner triages here, but the Claude Code
// session that actually codes a fix starts with no memory of this conversation. "Queued" items
// from both tables are combined into one paste-ready block so a fresh session has everything it
// needs (what was flagged, which topic, whether it's pool-wide, and the owner's own note) without
// the owner having to re-explain it from scratch.
export function formatQueueForClaude(feedback: FeedbackRow[], suggestions: ContentSuggestion[]): string {
  const queuedFeedback = feedback.filter(f => f.status === "queued");
  const queuedSuggestions = suggestions.filter(s => s.status === "queued");
  if (queuedFeedback.length === 0 && queuedSuggestions.length === 0) return "";

  const lines: string[] = ["ClassCade admin review queue — paste this as the opening message of a new Claude Code session.", ""];

  if (queuedFeedback.length > 0) {
    lines.push(`Feedback (${queuedFeedback.length}):`);
    queuedFeedback.forEach((row, i) => {
      const tag = row.is_pattern_issue ? " [PATTERN ISSUE — affects the whole pool/topic, not just this one prompt]" : "";
      lines.push(`${i + 1}. ${gameLabel(row.game_id) ?? "—"}${tag}`);
      const topic = topicLabel(row.question_data);
      if (topic) lines.push(`   Topic: ${topic}`);
      lines.push(`   Teacher message: "${row.message}"`);
      const q = formatQuestionData(row.question_data);
      if (q) lines.push(`   Flagged content: ${q}`);
      if (row.admin_note) lines.push(`   Admin note: ${row.admin_note}`);
      lines.push("");
    });
  }

  if (queuedSuggestions.length > 0) {
    lines.push(`Content suggestions (${queuedSuggestions.length}):`);
    queuedSuggestions.forEach((row, i) => {
      lines.push(`${i + 1}. ${row.topic_id} · ${row.section}${row.item_index !== null ? ` #${row.item_index}` : ""}`);
      if (row.note) lines.push(`   Note: "${row.note}"`);
      lines.push(`   Original: ${JSON.stringify(row.original)}`);
      lines.push(`   Proposed: ${JSON.stringify(row.proposed)}`);
      if (row.admin_note) lines.push(`   Admin note: ${row.admin_note}`);
      lines.push("");
    });
  }

  return lines.join("\n").trimEnd();
}
