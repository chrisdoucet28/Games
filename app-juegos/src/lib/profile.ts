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

const BRANDING_BUCKET = "branding";
type BrandingKind = "avatar" | "logo";
const BRANDING_COLUMN: Record<BrandingKind, "avatar_url" | "org_logo_url"> = { avatar: "avatar_url", logo: "org_logo_url" };

// Overwrites any previous upload of the same kind for this user (fixed filename, `upsert: true`)
// rather than accumulating orphaned files — a teacher only ever needs their single current
// picture/logo, never a history of past ones. The `?t=` cache-bust is needed because the URL
// itself doesn't change on re-upload, so without it the browser (and any already-open tab) would
// keep showing the old cached image.
async function uploadBrandingImage(kind: BrandingKind, file: File): Promise<string> {
  const userId = await currentUserId();
  const ext = file.name.split(".").pop() ?? "png";
  const path = `${userId}/${kind}.${ext}`;
  const { error: uploadError } = await supabase.storage.from(BRANDING_BUCKET).upload(path, file, { upsert: true });
  if (uploadError) throw uploadError;
  const { data } = supabase.storage.from(BRANDING_BUCKET).getPublicUrl(path);
  const url = `${data.publicUrl}?t=${Date.now()}`;
  const { error: updateError } = await supabase.from("profiles").update({ [BRANDING_COLUMN[kind]]: url }).eq("id", userId);
  if (updateError) throw updateError;
  return url;
}

// Clears the profile's pointer to the image; the storage object itself is left in place (harmless
// — the fixed filename means the next upload of that kind just overwrites it via `upsert`).
async function removeBrandingImage(kind: BrandingKind): Promise<void> {
  const userId = await currentUserId();
  const { error } = await supabase.from("profiles").update({ [BRANDING_COLUMN[kind]]: null }).eq("id", userId);
  if (error) throw error;
}

export const uploadAvatar = (file: File) => uploadBrandingImage("avatar", file);
export const uploadOrgLogo = (file: File) => uploadBrandingImage("logo", file);
export const removeAvatar = () => removeBrandingImage("avatar");
export const removeOrgLogo = () => removeBrandingImage("logo");
