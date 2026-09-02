import { supabase } from "./supabaseClient";
import type { LeaderboardEntry } from "../types";

// Reads the site-wide Leaderboard for the current semester — a Postgres trigger on `classes`
// keeps public.leaderboard_entries in sync (see current_semester()/sync_leaderboard_from_class()
// in the Supabase project), so this is purely a read: the client never writes this table.
export async function getLeaderboard(limit = 50): Promise<LeaderboardEntry[]> {
  const { data: semester, error: semesterError } = await supabase.rpc("current_semester");
  if (semesterError) throw semesterError;

  const { data, error } = await supabase
    .from("leaderboard_entries")
    .select("class_id, team_name, team_color, mascot, score")
    .eq("semester", semester as string)
    .order("score", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data as LeaderboardEntry[];
}
