import { supabase } from "./supabaseClient";

// new: unreviewed. queued: the app owner has confirmed this is real and it's waiting for a Claude
// Code session to actually implement — the owner doesn't write the code themselves, so this is the
// real "to-do" state, distinct from new (not looked at) and done (actually shipped). dismissed: not
// a real issue, or a duplicate. See the 20260930020000_admin_review_workflow migration.
export type FeedbackStatus = "new" | "queued" | "done" | "dismissed";

export interface FeedbackRow {
  id: string;
  user_id: string;
  kind: "general" | "flag";
  message: string;
  game_id: string | null;
  question_data: unknown;
  status: FeedbackStatus;
  created_at: string;
  // Admin-only signal set while triaging — "this is a bigger pattern, not just this one prompt"
  // (e.g. a topic's whole mistake-pool testing only one underlying rule, the modals_possibility
  // case this was built for). Never settable by the teacher submitting the flag.
  is_pattern_issue: boolean;
  // Admin-only free-text context left while triaging — what a future Claude session (no memory of
  // this review) actually needs to act correctly; a bare status/tag can't carry that on its own.
  admin_note: string | null;
  // Joined in client-side from profiles — null if the account was since deleted, or (defensively)
  // if RLS ever blocks the profiles read even though it shouldn't for an admin.
  display_name: string | null;
}

// feedback.user_id has no foreign key to profiles (it references auth.users, which PostgREST can't
// embed), so the display name is joined here in a second query instead of a single embedded select.
export async function listFeedback(): Promise<FeedbackRow[]> {
  const { data: feedback, error } = await supabase
    .from("feedback")
    .select("id, user_id, kind, message, game_id, question_data, status, created_at, is_pattern_issue, admin_note")
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

export async function setFeedbackStatus(id: string, status: FeedbackStatus): Promise<void> {
  const { error } = await supabase.from("feedback").update({ status }).eq("id", id);
  if (error) throw error;
}

export async function setFeedbackPatternIssue(id: string, isPatternIssue: boolean): Promise<void> {
  const { error } = await supabase.from("feedback").update({ is_pattern_issue: isPatternIssue }).eq("id", id);
  if (error) throw error;
}

export async function setFeedbackAdminNote(id: string, note: string): Promise<void> {
  const { error } = await supabase.from("feedback").update({ admin_note: note || null }).eq("id", id);
  if (error) throw error;
}
