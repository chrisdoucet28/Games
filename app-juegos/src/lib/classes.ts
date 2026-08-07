import { supabase } from "./supabaseClient";
import type { SavedClass, Team, QuestionData, TeamRosterEntry } from "../types";

export async function listClasses(): Promise<SavedClass[]> {
  const { data, error } = await supabase
    .from("classes")
    .select("*")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return data as SavedClass[];
}

export async function createClass(name: string, school: string | null, defaultLevel: string | null): Promise<SavedClass> {
  const { data, error } = await supabase
    .from("classes")
    .insert({ name, school, default_level: defaultLevel })
    .select()
    .single();
  if (error) throw error;
  return data as SavedClass;
}

export async function deleteClass(classId: string): Promise<void> {
  const { error } = await supabase.from("classes").delete().eq("id", classId);
  if (error) throw error;
}

export type SaveProgressInput = {
  teams: Team[];
  selectedTopics: string[];
  selectedGame: string;
  level: string;
  focus: string;
  questionsSnapshot: QuestionData[];
  minefieldGridData: unknown | null;
  gameState: unknown | null;
};

// Called when the teacher explicitly hits "Save Progress" mid-game.
export async function saveProgress(classId: string, input: SaveProgressInput): Promise<void> {
  const { error } = await supabase
    .from("classes")
    .update({
      teams: input.teams,
      in_progress: true,
      selected_topics: input.selectedTopics,
      selected_game: input.selectedGame,
      level: input.level,
      focus: input.focus,
      questions_snapshot: input.questionsSnapshot,
      minefield_grid_data: input.minefieldGridData,
      game_state: input.gameState,
    })
    .eq("id", classId);
  if (error) throw error;
}

// Called when a game reaches its natural end (or the teacher ends it outright) — the class's
// running scores still need to persist, but there's nothing left to resume.
export async function clearProgress(classId: string, teams: Team[]): Promise<void> {
  const { error } = await supabase
    .from("classes")
    .update({
      teams,
      in_progress: false,
      selected_topics: null,
      selected_game: null,
      level: null,
      focus: null,
      questions_snapshot: null,
      minefield_grid_data: null,
      game_state: null,
    })
    .eq("id", classId);
  if (error) throw error;
}

// Auto-remembers every team actually played under this class — called whenever a class-linked
// lineup gets finalized (setup completing, or a game only getting linked to a class later via
// Save & Exit). Matches by name (trimmed, case-insensitive, same rule this app already uses for
// score continuity in LessonGamesGenerator's handleSetup) so re-using a name updates that saved
// team's color/mascot in place instead of piling up duplicates.
export async function upsertTeamRoster(classId: string, teams: Team[]): Promise<TeamRosterEntry[]> {
  const { data, error: fetchError } = await supabase
    .from("classes")
    .select("team_roster")
    .eq("id", classId)
    .single();
  if (fetchError) throw fetchError;

  const roster: TeamRosterEntry[] = (data?.team_roster as TeamRosterEntry[] | null) ?? [];
  const merged = [...roster];
  teams.forEach(t => {
    const key = t.name.trim().toLowerCase();
    const idx = merged.findIndex(r => r.name.trim().toLowerCase() === key);
    if (idx !== -1) {
      merged[idx] = { ...merged[idx], color: t.color, mascot: t.mascot ?? null };
    } else {
      merged.push({ id: crypto.randomUUID(), name: t.name, color: t.color, mascot: t.mascot ?? null });
    }
  });

  const { error } = await supabase.from("classes").update({ team_roster: merged }).eq("id", classId);
  if (error) throw error;
  return merged;
}

// Removes one saved team from a class's roster — deliberately doesn't touch the current session's
// live teams even if that name is in play right now; it only forgets the preset for next time.
export async function deleteFromTeamRoster(classId: string, rosterId: string): Promise<TeamRosterEntry[]> {
  const { data, error: fetchError } = await supabase
    .from("classes")
    .select("team_roster")
    .eq("id", classId)
    .single();
  if (fetchError) throw fetchError;

  const roster: TeamRosterEntry[] = (data?.team_roster as TeamRosterEntry[] | null) ?? [];
  const next = roster.filter(r => r.id !== rosterId);

  const { error } = await supabase.from("classes").update({ team_roster: next }).eq("id", classId);
  if (error) throw error;
  return next;
}
