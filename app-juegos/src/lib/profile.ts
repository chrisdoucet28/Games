import { supabase } from "./supabaseClient";
import type { Profile } from "../types";

// A row always exists by the time a user can call this — a database trigger creates a blank
// profile the instant an account signs up (see the create_profiles_table migration). RLS already
// scopes both of these to the caller's own row, but PostgREST separately refuses to run an
// unfiltered UPDATE/DELETE regardless of RLS, so `.eq("id", ...)` is required even though RLS
// alone would already make it safe.
async function currentUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  if (!data.user) throw new Error("Not logged in.");
  return data.user.id;
}

export async function getProfile(): Promise<Profile> {
  const userId = await currentUserId();
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single();
  if (error) throw error;
  return data as Profile;
}

export async function updateProfile(patch: { displayName?: string; themeId?: string; hasCompletedPlanIntro?: boolean }): Promise<Profile> {
  const userId = await currentUserId();
  const dbPatch: Record<string, unknown> = {};
  if (patch.displayName !== undefined) dbPatch.display_name = patch.displayName || null;
  if (patch.themeId !== undefined) dbPatch.theme_id = patch.themeId;
  if (patch.hasCompletedPlanIntro !== undefined) dbPatch.has_completed_plan_intro = patch.hasCompletedPlanIntro;
  const { data, error } = await supabase
    .from("profiles")
    .update(dbPatch)
    .eq("id", userId)
    .select()
    .single();
  if (error) throw error;
  return data as Profile;
}
