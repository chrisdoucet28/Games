import { supabase } from "./supabaseClient";

// new: not yet triaged. queued: confirmed real, waiting for a Claude Code session to actually
// apply it (the owner doesn't edit topics.ts themselves). applied: actually shipped. dismissed:
// not a real change, or a duplicate. See the 20260930020000_admin_review_workflow migration.
export type ContentSuggestionStatus = "new" | "queued" | "applied" | "dismissed";

export interface ContentSuggestion {
  id: string;
  user_id: string;
  topic_id: string;
  section: string;
  item_index: number | null;
  original: unknown;
  proposed: unknown;
  note: string | null;
  status: ContentSuggestionStatus;
  created_at: string;
  // Admin-only free-text context left while triaging — same idea as feedback.admin_note.
  admin_note: string | null;
}

export async function listContentSuggestions(): Promise<ContentSuggestion[]> {
  const { data, error } = await supabase
    .from("content_suggestions")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as ContentSuggestion[];
}

export async function createContentSuggestion(input: {
  topicId: string;
  section: string;
  itemIndex: number | null;
  original: unknown;
  proposed: unknown;
  note: string;
}): Promise<void> {
  const { error } = await supabase.from("content_suggestions").insert({
    topic_id: input.topicId,
    section: input.section,
    item_index: input.itemIndex,
    original: input.original,
    proposed: input.proposed,
    note: input.note || null,
  });
  if (error) throw error;
}

export async function setContentSuggestionStatus(id: string, status: ContentSuggestionStatus): Promise<void> {
  const { error } = await supabase.from("content_suggestions").update({ status }).eq("id", id);
  if (error) throw error;
}

export async function setContentSuggestionAdminNote(id: string, note: string): Promise<void> {
  const { error } = await supabase.from("content_suggestions").update({ admin_note: note || null }).eq("id", id);
  if (error) throw error;
}
