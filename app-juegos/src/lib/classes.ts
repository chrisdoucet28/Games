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
// Save & Exit), and also on every debounced autosave tick while a teacher is actively editing
// team-setup (see LessonGamesGenerator's roster-autosave effect).
//
// `rosterIds[i]` (parallel to `teams[i]`, optional) is the roster entry a caller already knows
// that slot maps to — e.g. it was hydrated from a tapped roster chip, or a previous call to this
// function already created/matched an entry for it. When present and still valid, that id is
// matched FIRST, so a rename updates the same row in place instead of leaving the old name behind
// as an orphaned entry and creating a fresh one under the new name (this used to be name-only
// matching, which broke exactly that way once autosave started calling this on every edit rather
// than once at save time). Name matching (trimmed, case-insensitive) is the fallback, still used
// when no id is known — the original "type the same name again" reuse path (e.g. handleSetup's
// score-continuity lookup uses the same rule) still works for callers that don't track ids.
//
// Returns the resolved roster id for each input team (same order as `teams`) alongside the merged
// roster, so a caller tracking ids per slot (team-setup's teamRosterIds) can save a freshly
// created id back for next time instead of losing track of it.
export async function upsertTeamRoster(
  classId: string,
  teams: Team[],
  rosterIds: (string | null | undefined)[] = []
): Promise<{ roster: TeamRosterEntry[]; resolvedIds: string[] }> {
  const { data, error: fetchError } = await supabase
    .from("classes")
    .select("team_roster")
    .eq("id", classId)
    .single();
  if (fetchError) throw fetchError;

  const roster: TeamRosterEntry[] = (data?.team_roster as TeamRosterEntry[] | null) ?? [];
  const merged = [...roster];
  const resolvedIds: string[] = [];
  teams.forEach((t, i) => {
    const knownId = rosterIds[i];
    let idx = knownId ? merged.findIndex(r => r.id === knownId) : -1;
    if (idx === -1) {
      const key = t.name.trim().toLowerCase();
      idx = merged.findIndex(r => r.name.trim().toLowerCase() === key);
    }
    if (idx !== -1) {
      merged[idx] = { ...merged[idx], name: t.name, color: t.color, mascot: t.mascot ?? null };
      resolvedIds.push(merged[idx].id);
    } else {
      const newId = crypto.randomUUID();
      merged.push({ id: newId, name: t.name, color: t.color, mascot: t.mascot ?? null });
      resolvedIds.push(newId);
    }
  });

  const { error } = await supabase.from("classes").update({ team_roster: merged }).eq("id", classId);
  if (error) throw error;
  return { roster: merged, resolvedIds };
}

// Checkpoints live team scores to the class without touching any in-progress-game bookkeeping
// (selected_game/questions_snapshot/game_state/etc are left exactly as they are) — for the
// game-select screen, where a teacher may want to save scores between games with no specific
// game yet chosen to "resume" into.
export async function saveTeams(classId: string, teams: Team[]): Promise<void> {
  const { error } = await supabase.from("classes").update({ teams }).eq("id", classId);
  if (error) throw error;
}

// Opts a class in/out of the site-wide Leaderboard. A Postgres trigger on `classes` reacts to this
// column changing (see lib/leaderboard.ts) — flipping it to true immediately removes that class's
// teams from public.leaderboard_entries; there's nothing else the client needs to do here.
export async function setLeaderboardVisibility(classId: string, hidden: boolean): Promise<void> {
  const { error } = await supabase.from("classes").update({ hide_from_leaderboard: hidden }).eq("id", classId);
  if (error) throw error;
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
