-- Student accounts, step 1: roles + progress tables.
--
-- Additive and backward compatible: this database is shared with the live site, whose code never
-- reads the new profile columns. Every account production creates is a working teacher
-- (role default 'teacher'); server-side blocks below only ever apply to role = 'student'.
-- Rollback: supabase/rollbacks/20260920000000_student_accounts.rollback.sql

-- 1. Role columns -------------------------------------------------------------------------------
alter table public.profiles
  add column if not exists role text not null default 'teacher' check (role in ('teacher', 'student')),
  add column if not exists role_chosen boolean not null default false;

-- Accounts that already created classes are clearly teachers — no first-login prompt for them. Every
-- other existing account is asked once at next login.
update public.profiles set role_chosen = true
where id in (select user_id from public.classes);

-- 2. Role can only change through set_my_role() ------------------------------------------------
-- The profiles UPDATE policy has no column restriction, so without this a client could rewrite its
-- own role directly. Admin / service-role / SQL-console updates (auth.uid() is null) pass through.
create or replace function public.protect_profile_role()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if auth.uid() is null then
    return new;
  end if;
  if (new.role is distinct from old.role or new.role_chosen is distinct from old.role_chosen)
     and coalesce(current_setting('app.allow_role_change', true), '') <> 'on' then
    raise exception 'Account type can only be changed from the account type screen.';
  end if;
  return new;
end;
$$;

drop trigger if exists protect_profile_role_trigger on public.profiles;
create trigger protect_profile_role_trigger
  before update on public.profiles
  for each row execute function public.protect_profile_role();

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

-- 3. Students can't create classes ---------------------------------------------------------------
create or replace function public.enforce_free_class_limit()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  existing_count integer;
  launch_phase_class_cap constant integer := 20;
  user_role text;
begin
  select role into user_role from public.profiles where id = new.user_id;
  if user_role = 'student' then
    raise exception 'Student accounts can''t create classes.';
  end if;
  select count(*) into existing_count from public.classes where user_id = new.user_id;
  if existing_count >= launch_phase_class_cap then
    raise exception 'You''ve reached the % class limit. Delete an old class to add a new one.', launch_phase_class_cap;
  end if;
  return new;
end;
$$;

-- 4. Students don't read the teacher leaderboard ----------------------------------------------
drop policy if exists "Authenticated users can read the leaderboard" on public.leaderboard_entries;
create policy "Teachers can read the leaderboard" on public.leaderboard_entries
  for select to authenticated
  using (coalesce((select role from public.profiles where id = (select auth.uid())), 'teacher') <> 'student');

-- 5. Progress tables ---------------------------------------------------------------------------
create table public.lesson_completions (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  topic_id text not null check (char_length(topic_id) between 1 and 80),
  completed_at timestamptz not null default now(),
  primary key (user_id, topic_id)
);
alter table public.lesson_completions enable row level security;
revoke all on public.lesson_completions from anon;

create policy "lesson_completions_select_own" on public.lesson_completions
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "lesson_completions_insert_own" on public.lesson_completions
  for insert to authenticated
  with check (
    (select auth.uid()) = user_id
    and exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'student')
  );
create policy "lesson_completions_delete_own" on public.lesson_completions
  for delete to authenticated using ((select auth.uid()) = user_id);

-- id is generated by the client so a double submit (StrictMode, retry) is an idempotent no-op.
create table public.practice_rounds (
  id uuid primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  topics text[] not null default '{}' check (cardinality(topics) <= 10),
  correct integer not null,
  total integer not null,
  created_at timestamptz not null default now(),
  check (total between 1 and 50 and correct between 0 and total)
);
create index practice_rounds_user_created_idx on public.practice_rounds (user_id, created_at desc);
alter table public.practice_rounds enable row level security;
revoke all on public.practice_rounds from anon;

create policy "practice_rounds_select_own" on public.practice_rounds
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "practice_rounds_insert_own" on public.practice_rounds
  for insert to authenticated
  with check (
    (select auth.uid()) = user_id
    and exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'student')
  );

-- Same shape as enforce_feedback_rate_limit — bounds scripted abuse of client-reported progress.
create or replace function public.enforce_practice_rate_limit()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  recent_count integer;
  rate_limit_per_hour constant integer := 60;
begin
  select count(*) into recent_count
  from public.practice_rounds
  where user_id = new.user_id
    and created_at > now() - interval '1 hour';
  if recent_count >= rate_limit_per_hour then
    raise exception 'That''s a lot of practice rounds — take a short break before recording more.';
  end if;
  return new;
end;
$$;

create trigger enforce_practice_rate_limit_trigger
  before insert on public.practice_rounds
  for each row execute function public.enforce_practice_rate_limit();

-- Totals for the calling user only (security_invoker keeps RLS in force).
create or replace view public.my_practice_totals with (security_invoker = true) as
select
  count(*)::int as rounds,
  coalesce(sum(correct), 0)::int as correct_answers,
  coalesce(sum(total), 0)::int as answered,
  (count(*) filter (where total >= 10 and correct = total))::int as perfect_rounds
from public.practice_rounds
where user_id = auth.uid();
revoke all on public.my_practice_totals from anon;
grant select on public.my_practice_totals to authenticated;
