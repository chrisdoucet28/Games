import { supabase } from "./supabaseClient";

// Write-only from the app's side — this table has no SELECT policy for authenticated/anon, so
// nothing here ever reads it back. Review happens later, directly against Supabase.
export async function submitGeneralFeedback(message: string): Promise<void> {
  const { error } = await supabase.from("feedback").insert({ kind: "general", message });
  if (error) throw error;
}

export async function submitFlag(gameId: string, questionData: unknown, message: string): Promise<void> {
  const { error } = await supabase.from("feedback").insert({
    kind: "flag",
    game_id: gameId,
    question_data: questionData ?? null,
    message,
  });
  if (error) throw error;
}
