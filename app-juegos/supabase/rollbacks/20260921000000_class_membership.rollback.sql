-- Undo for supabase/migrations/20260921000000_class_membership.sql.
-- Run only if the class-membership feature has to be backed out. This deletes every class membership
-- and check-in record (students' class XP goes with them). It leaves student accounts, practice
-- progress and everything from the earlier student_accounts migration untouched.

drop function if exists public.remove_class_member(uuid);
drop function if exists public.decide_class_member(uuid, boolean);
drop function if exists public.list_class_members(uuid);
drop function if exists public.record_class_attendance(uuid);
drop function if exists public.link_my_team(uuid, text);
drop function if exists public.my_classes();
drop function if exists public.leave_class(uuid);
drop function if exists public.request_join_class(text, text);

drop table if exists public.class_join_attempts;
drop table if exists public.class_attendance;
drop table if exists public.class_members;

drop function if exists public.regenerate_class_join_code(uuid);
drop function if exists public.ensure_class_join_code(uuid);
drop function if exists public.generate_class_join_code();
drop trigger if exists protect_class_join_code_trigger on public.classes;
drop function if exists public.protect_class_join_code();
drop index if exists public.classes_join_code_key;
alter table public.classes drop column if exists join_code;

-- set_my_role back to its student_accounts version (without the membership clean-up line).
create or replace function public.set_my_role(new_role text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'Not logged in.';
  end if;
  if new_role not in ('teacher', 'student') then
    raise exception 'Invalid account type.';
  end if;
  if new_role = 'student' and exists (select 1 from public.classes where user_id = uid) then
    raise exception 'This account has classes, so it can''t become a student account. Delete the classes first, or sign up with a new account.';
  end if;
  perform set_config('app.allow_role_change', 'on', true);
  update public.profiles set role = new_role, role_chosen = true where id = uid;
  perform set_config('app.allow_role_change', 'off', true);
end;
$$;
revoke all on function public.set_my_role(text) from public, anon;
grant execute on function public.set_my_role(text) to authenticated;
