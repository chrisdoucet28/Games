import { supabase } from "./supabaseClient";
import type { SavedClass, Team, QuestionData } from "../types";

export async function listClasses(): Promise<SavedClass[]> {
  const { data, error } = await supabase
    .from("classes")
    .select("*")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return data as SavedClass[];
}

export async function createClass(name: string): Promise<SavedClass> {
  const { data, error } = await supabase
    .from("classes")
    .insert({ name })
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
