import { supabase } from "./supabaseClient";

export interface GrowthStats {
  total_teachers: number;
  total_students: number;
  total_classes: number;
  real_paid_subs: number;
  promo_redeemed_total: number;
}

export interface WeeklySignups {
  week_start: string;
  signups: number;
}

export interface FlaggedGame {
  game_id: string;
  total: number;
  unreviewed: number;
}

export interface AdminTeacher {
  id: string;
  email: string;
  display_name: string | null;
  created_at: string;
  is_paid: boolean;
  class_count: number;
}

export interface AutoFixRun {
  id: string;
  ran_at: string;
  rows_found: number;
  rows_fixed: number;
  rows_skipped: number;
  summary: string;
  had_errors: boolean;
}

export async function getGrowthStats(): Promise<GrowthStats> {
  const { data, error } = await supabase.rpc("admin_growth_stats").single();
  if (error) throw error;
  return data as GrowthStats;
}

export async function getSignupsByWeek(): Promise<WeeklySignups[]> {
  const { data, error } = await supabase.rpc("admin_signups_by_week");
  if (error) throw error;
  return (data ?? []) as WeeklySignups[];
}

export async function getMostFlaggedGames(): Promise<FlaggedGame[]> {
  const { data, error } = await supabase.rpc("admin_most_flagged_games");
  if (error) throw error;
  return (data ?? []) as FlaggedGame[];
}

export async function listTeachers(): Promise<AdminTeacher[]> {
  const { data, error } = await supabase.rpc("admin_list_teachers");
  if (error) throw error;
  return (data ?? []) as AdminTeacher[];
}

export async function listAutoFixRuns(): Promise<AutoFixRun[]> {
  const { data, error } = await supabase
    .from("auto_fix_runs")
    .select("*")
    .order("ran_at", { ascending: false })
    .limit(10);
  if (error) throw error;
  return (data ?? []) as AutoFixRun[];
}

// Wipes the whole activity log -- it's just a running feed for the admin panel (the routine's own
// Supabase MCP tools never read it back), so clearing it has no effect on the routine's actual
// queue/status work. `.not("id", "is", null)` is the standard Supabase JS pattern for "delete
// every row" -- the client refuses a bare `.delete()` with no filter at all.
export async function clearAutoFixRuns(): Promise<void> {
  const { error } = await supabase.from("auto_fix_runs").delete().not("id", "is", null);
  if (error) throw error;
}
