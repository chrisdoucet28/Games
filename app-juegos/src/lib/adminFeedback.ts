import { supabase } from "./supabaseClient";

export interface FeedbackRow {
  id: string;
  user_id: string;
  kind: "general" | "flag";
  message: string;
  game_id: string | null;
  question_data: unknown;
  status: "new" | "reviewed";
  created_at: string;
  // Joined in client-side from profiles — null if the account was since deleted, or (defensively)
  // if RLS ever blocks the profiles read even though it shouldn't for an admin.
  display_name: string | null;
}

// feedback.user_id has no foreign key to profiles (it references auth.users, which PostgREST can't
// embed), so the display name is joined here in a second query instead of a single embedded select.
export async function listFeedback(): Promise<FeedbackRow[]> {
  const { data: feedback, error } = await supabase
    .from("feedback")
    .select("id, user_id, kind, message, game_id, question_data, status, created_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  const rows = (feedback ?? []) as Omit<FeedbackRow, "display_name">[];

  const userIds = Array.from(new Set(rows.map((r) => r.user_id)));
  const nameById = new Map<string, string | null>();
  if (userIds.length > 0) {
    const { data: profiles, error: profileError } = await supabase
      .from("profiles")
      .select("id, display_name")
      .in("id", userIds);
    if (profileError) throw profileError;
    for (const p of profiles ?? []) nameById.set(p.id, p.display_name);
  }

  return rows.map((r) => ({ ...r, display_name: nameById.get(r.user_id) ?? null }));
}

export async function markFeedbackReviewed(id: string): Promise<void> {
  const { error } = await supabase.from("feedback").update({ status: "reviewed" }).eq("id", id);
  if (error) throw error;
}
