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

// Single-class fetch for the "continue where you left off" prompt on a fresh page load (see
// LessonGamesGenerator's lastActiveClassId persistence) — resolves to null rather than throwing
// on a missing/deleted class, since that's just "nothing to offer," not a real error.
export async function getClass(classId: string): Promise<SavedClass | null> {
  const { data, error } = await supabase
    .from("classes")
    .select("*")
    .eq("id", classId)
    .maybeSingle();
  if (error) throw error;
  return (data as SavedClass | null) ?? null;
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

// A session's active `teams` array only ever covers whoever was actually selected for that
// sitting — it's never guaranteed to be the class's FULL roster (a teacher might run a quick
// round with just one or two students, then come back later and select everyone again). Every
// write path below used to persist `teams` as a flat overwrite, which meant running a session
// with fewer students than the class's full history silently erased every other roster member's
// score from the database the moment that narrower array was saved — not just hidden from the
// current screen, actually gone. This merges onto whatever's already persisted instead: an
// incoming team (matched by trimmed, case-insensitive name, same key handleSetup's own
// score-continuity lookup and upsertTeamRoster already use) overwrites that name's entry, but any
// OTHER name currently in the database and not present in this session's `teams` keeps its last
// known score untouched rather than being dropped. The only way a name should actually disappear
// from a class for good is the explicit "remove from roster" action (deleteFromTeamRoster) — never
// just "wasn't picked for today."
async function mergeTeamsForPersist(classId: string, teams: Team[]): Promise<Team[]> {
  const { data, error } = await supabase
    .from("classes")
    .select("teams")
    .eq("id", classId)
    .single();
  if (error) throw error;

  const persisted: Team[] = (data?.teams as Team[] | null) ?? [];
  const byName = new Map(persisted.map(t => [t.name.trim().toLowerCase(), t]));
  teams.forEach(t => { byName.set(t.name.trim().toLowerCase(), t); });
  return Array.from(byName.values());
}

// Called when the teacher explicitly hits "Save Progress" mid-game.
export async function saveProgress(classId: string, input: SaveProgressInput): Promise<void> {
  const mergedTeams = await mergeTeamsForPersist(classId, input.teams);
  const { error } = await supabase
    .from("classes")
    .update({
      teams: mergedTeams,
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
  const mergedTeams = await mergeTeamsForPersist(classId, teams);
  const { error } = await supabase
    .from("classes")
    .update({
      teams: mergedTeams,
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
  const mergedTeams = await mergeTeamsForPersist(classId, teams);
  const { error } = await supabase.from("classes").update({ teams: mergedTeams }).eq("id", classId);
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
