import { supabase } from "./supabaseClient";
import type { TeamRosterEntry } from "../types";

// Thin wrappers over the class-membership functions in the 20260921000000_class_membership
// migration. Every write there is a database function that checks who is calling — the tables
// themselves can't be written from the client at all. What each side can see is decided in the
// database too: a teacher only ever gets a student's typed name + status (never an email, never
// attendance); attendance and XP belong to the student.

export type MemberStatus = "pending" | "approved";

// --- Teacher side -------------------------------------------------------------------------------

export type ClassMemberRow = {
  id: string;
  student_name: string;
  status: MemberStatus;
  requested_at: string;
};

// Creates the class's join code the first time it's asked for; afterwards returns the same one.
export async function ensureClassJoinCode(classId: string): Promise<string> {
  const { data, error } = await supabase.rpc("ensure_class_join_code", { p_class_id: classId });
  if (error) throw error;
  return data as string;
}

export async function regenerateClassJoinCode(classId: string): Promise<string> {
  const { data, error } = await supabase.rpc("regenerate_class_join_code", { p_class_id: classId });
  if (error) throw error;
  return data as string;
}

export async function listClassMembers(classId: string): Promise<ClassMemberRow[]> {
  const { data, error } = await supabase.rpc("list_class_members", { p_class_id: classId });
  if (error) throw error;
  return (data ?? []) as ClassMemberRow[];
}

// Approving keeps the student; declining just removes the pending request.
export async function decideClassMember(memberId: string, approve: boolean): Promise<void> {
  const { error } = await supabase.rpc("decide_class_member", { p_member_id: memberId, p_approve: approve });
  if (error) throw error;
}

export async function removeClassMember(memberId: string): Promise<void> {
  const { error } = await supabase.rpc("remove_class_member", { p_member_id: memberId });
  if (error) throw error;
}

// --- Student side -------------------------------------------------------------------------------

export type JoinResult =
  | { ok: true; status: MemberStatus; class_name: string; already?: boolean }
  | { ok: false; error: string };

// Expected problems (wrong code, blank name, too many tries) come back as { ok: false, error } with
// a message written to be shown as-is; only genuine failures throw.
export async function requestJoinClass(code: string, name: string): Promise<JoinResult> {
  const { data, error } = await supabase.rpc("request_join_class", { p_code: code, p_name: name });
  if (error) throw error;
  return data as JoinResult;
}

export async function leaveClass(classId: string): Promise<void> {
  const { error } = await supabase.rpc("leave_class", { p_class_id: classId });
  if (error) throw error;
}

export type MyClass = {
  class_id: string;
  class_name: string;
  school: string | null;
  teacher_name: string | null;
  status: MemberStatus;
  // The saved team this student picked in a Class Check-In, or null if they haven't yet.
  team: TeamRosterEntry | null;
  last_checkin_on: string | null;
  checkins: number;
};

export async function getMyClasses(): Promise<MyClass[]> {
  const { data, error } = await supabase.rpc("my_classes");
  if (error) throw error;
  return (data ?? []) as MyClass[];
}

// Remembers which of the class's saved teams this student picked. Resolves false (never throws)
// when they aren't an approved member or the team isn't that class's — callers on the phone join
// screen treat every failure as "nothing to do", so an account can never get in the way of class.
export async function linkMyTeam(classId: string, rosterId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc("link_my_team", { p_class_id: classId, p_roster_id: rosterId });
    return !error && data === true;
  } catch {
    return false;
  }
}

// Counts today as a check-in. True only the first time each day; false for everything else.
export async function recordClassAttendance(classId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc("record_class_attendance", { p_class_id: classId });
    return !error && data === true;
  } catch {
    return false;
  }
}

// One class's saved-team link for the signed-in student (approved members only), for the phone join
// screen — never throws.
export async function getMyClassLink(classId: string): Promise<MyClass | null> {
  try {
    const all = await getMyClasses();
    return all.find(c => c.class_id === classId && c.status === "approved") ?? null;
  } catch {
    return null;
  }
}
