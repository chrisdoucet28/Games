import { supabase } from "./supabaseClient";

export interface ContentSuggestion {
  id: string;
  user_id: string;
  topic_id: string;
  section: string;
  item_index: number | null;
  original: unknown;
  proposed: unknown;
  note: string | null;
  status: "new" | "applied" | "dismissed";
  created_at: string;
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

export async function setContentSuggestionStatus(id: string, status: "applied" | "dismissed" | "new"): Promise<void> {
  const { error } = await supabase.from("content_suggestions").update({ status }).eq("id", id);
  if (error) throw error;
}
