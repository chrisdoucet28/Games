-- Student accounts, steps 2 + 3: joining a teacher's class and Class Check-In linking.
--
-- Additive and backward compatible: this database is shared with the live site, whose code never
-- reads the new column or tables. Nothing here changes what an existing account can do — every
-- write goes through a SECURITY DEFINER function that checks who is calling.
-- Rollback: supabase/rollbacks/20260921000000_class_membership.rollback.sql
--
-- Privacy shape (owner's rules): a teacher sees ONLY the name a student typed and whether they are
-- pending/approved — never an email, never attendance. Attendance and XP are the student's own.

-- 1. A persistent join code per class ------------------------------------------------------------
alter table public.classes add column if not exists join_code text;
create unique index if not exists classes_join_code_key on public.classes (join_code) where join_code is not null;

-- The classes UPDATE/INSERT policies have no column restriction, so without this a teacher could set
-- join_code directly — and the unique index would then tell them whether a code exists elsewhere.
-- Only the two functions below (which flip app.allow_join_code_change) may set it.
create or replace function public.protect_class_join_code()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if auth.uid() is null then
    return new;
  end if;
  if coalesce(current_setting('app.allow_join_code_change', true), '') = 'on' then
    return new;
  end if;
  if tg_op = 'INSERT' then
    new.join_code := null;
  elsif new.join_code is distinct from old.join_code then
    raise exception 'The class code can only be changed from the Students panel.';
  end if;
  return new;
end;
$$;

drop trigger if exists protect_class_join_code_trigger on public.classes;
create trigger protect_class_join_code_trigger
  before insert or update on public.classes
  for each row execute function public.protect_class_join_code();

-- 6 characters from 31 (no 0/O/1/I/L look-alikes) ~ 887 million codes.
create or replace function public.generate_class_join_code()
returns text
language plpgsql
set search_path = public
as $$
declare
  alphabet constant text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  code text;
  i integer;
  tries integer := 0;
begin
  loop
    code := '';
    for i in 1..6 loop
      code := code || substr(alphabet, 1 + floor(random() * length(alphabet))::integer, 1);
    end loop;
    exit when not exists (select 1 from public.classes where join_code = code);
    tries := tries + 1;
    if tries > 20 then
      raise exception 'Couldn''t make a class code just now — please try again.';
    end if;
  end loop;
  return code;
end;
$$;
revoke all on function public.generate_class_join_code() from public, anon, authenticated;

-- Creates the code the first time a teacher opens a class's Students panel (no backfill needed).
create or replace function public.ensure_class_join_code(p_class_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  existing text;
  new_code text;
begin
  if uid is null then
    raise exception 'Not logged in.';
  end if;
  select join_code into existing from public.classes where id = p_class_id and user_id = uid;
  if not found then
    raise exception 'Class not found.';
  end if;
  if existing is not null then
    return existing;
  end if;
  new_code := public.generate_class_join_code();
  perform set_config('app.allow_join_code_change', 'on', true);
  update public.classes set join_code = new_code where id = p_class_id and user_id = uid;
  perform set_config('app.allow_join_code_change', 'off', true);
  return new_code;
end;
$$;

create or replace function public.regenerate_class_join_code(p_class_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  new_code text;
begin
  if uid is null then
    raise exception 'Not logged in.';
  end if;
  if not exists (select 1 from public.classes where id = p_class_id and user_id = uid) then
    raise exception 'Class not found.';
  end if;
  new_code := public.generate_class_join_code();
  perform set_config('app.allow_join_code_change', 'on', true);
  update public.classes set join_code = new_code where id = p_class_id and user_id = uid;
  perform set_config('app.allow_join_code_change', 'off', true);
  return new_code;
end;
$$;

-- 2. Membership + attendance tables ---------------------------------------------------------------
create table public.class_members (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes (id) on delete cascade,
  student_id uuid not null references auth.users (id) on delete cascade,
  student_name text not null check (char_length(btrim(student_name)) between 1 and 40),
  status text not null default 'pending' check (status in ('pending', 'approved')),
  -- The stable id of the class's saved team (classes.team_roster[].id) this student last picked in a
  -- Class Check-In. A teacher never reads this table directly (see list_class_members below).
  team_roster_id text,
  requested_at timestamptz not null default now(),
  approved_at timestamptz,
  unique (class_id, student_id)
);
create index class_members_student_idx on public.class_members (student_id);
create index class_members_class_idx on public.class_members (class_id, status);
alter table public.class_members enable row level security;
revoke all on public.class_members from anon;
revoke insert, update, delete on public.class_members from authenticated;

-- The student sees their own rows. There is deliberately NO teacher policy: a teacher only ever
-- gets name + status, through list_class_members().
create policy "class_members_select_own" on public.class_members
  for select to authenticated using ((select auth.uid()) = student_id);

-- One row per class per day a student checked in. Student-only, no teacher policy. class_id has no
-- foreign key on purpose: a teacher deleting a class must not quietly remove XP a student earned.
create table public.class_attendance (
  class_id uuid not null,
  student_id uuid not null references auth.users (id) on delete cascade,
  day date not null,
  primary key (class_id, student_id, day)
);
create index class_attendance_student_idx on public.class_attendance (student_id);
alter table public.class_attendance enable row level security;
revoke all on public.class_attendance from anon;
revoke insert, update, delete on public.class_attendance from authenticated;

create policy "class_attendance_select_own" on public.class_attendance
  for select to authenticated using ((select auth.uid()) = student_id);

-- Bounds guessing of join codes. RPC-internal: no policies and no grants, so nobody reads it directly.
create table public.class_join_attempts (
  user_id uuid not null references auth.users (id) on delete cascade,
  attempted_at timestamptz not null default now()
);
create index class_join_attempts_user_idx on public.class_join_attempts (user_id, attempted_at desc);
alter table public.class_join_attempts enable row level security;
revoke all on public.class_join_attempts from anon, authenticated;

-- 3. Student-side functions -----------------------------------------------------------------------
-- Expected failures come back as { ok: false, error } instead of raising — a raised exception rolls
-- back the whole call, including the attempt record that makes the rate limit work.
create or replace function public.request_join_class(p_code text, p_name text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  v_role text;
  v_name text := btrim(coalesce(p_name, ''));
  v_code text := upper(regexp_replace(coalesce(p_code, ''), '[^A-Za-z0-9]', '', 'g'));
  v_class_id uuid;
  v_class_name text;
  v_status text;
  v_recent integer;
  v_pending integer;
begin
  if uid is null then
    raise exception 'Not logged in.';
  end if;
  select role into v_role from public.profiles where id = uid;
  if v_role is distinct from 'student' then
    raise exception 'Only student accounts can join a class.';
  end if;
  if char_length(v_name) < 1 or char_length(v_name) > 40 then
    return jsonb_build_object('ok', false, 'error', 'Please enter your name (up to 40 characters).');
  end if;

  delete from public.class_join_attempts where attempted_at < now() - interval '1 day';
  select count(*) into v_recent from public.class_join_attempts where user_id = uid and attempted_at > now() - interval '1 hour';
  if v_recent >= 10 then
    return jsonb_build_object('ok', false, 'error', 'Too many tries — please wait a little while and try again.');
  end if;
  insert into public.class_join_attempts (user_id) values (uid);

  select id, name into v_class_id, v_class_name from public.classes where join_code = v_code;
  if v_class_id is null then
    return jsonb_build_object('ok', false, 'error', 'That code didn''t match a class. Check it with your teacher.');
  end if;

  select status into v_status from public.class_members where class_id = v_class_id and student_id = uid;
  if found then
    return jsonb_build_object('ok', true, 'status', v_status, 'class_name', v_class_name, 'already', true);
  end if;

  select count(*) into v_pending from public.class_members where student_id = uid and status = 'pending';
  if v_pending >= 5 then
    return jsonb_build_object('ok', false, 'error', 'You already have 5 requests waiting for approval. Wait for a teacher to answer one first.');
  end if;

  insert into public.class_members (class_id, student_id, student_name) values (v_class_id, uid, v_name);
  return jsonb_build_object('ok', true, 'status', 'pending', 'class_name', v_class_name);
end;
$$;

create or replace function public.leave_class(p_class_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Not logged in.';
  end if;
  delete from public.class_members where class_id = p_class_id and student_id = auth.uid();
end;
$$;

-- What a student sees on their home screen. Everything comes from here because a student can never
-- read a classes row directly. Shows nothing for a non-student account.
create or replace function public.my_classes()
returns table (
  class_id uuid,
  class_name text,
  school text,
  teacher_name text,
  status text,
  team jsonb,
  last_checkin_on date,
  checkins integer
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Not logged in.';
  end if;
  return query
  select
    m.class_id,
    c.name,
    c.school,
    p.display_name,
    m.status,
    (select r from jsonb_array_elements(coalesce(c.team_roster, '[]'::jsonb)) r where r ->> 'id' = m.team_roster_id limit 1),
    (select max(a.day) from public.class_attendance a where a.class_id = m.class_id and a.student_id = m.student_id),
    (select count(*)::integer from public.class_attendance a where a.class_id = m.class_id and a.student_id = m.student_id)
  from public.class_members m
  join public.classes c on c.id = m.class_id
  left join public.profiles p on p.id = c.user_id
  where m.student_id = auth.uid()
    and exists (select 1 from public.profiles me where me.id = auth.uid() and me.role = 'student')
  order by m.requested_at desc;
end;
$$;

-- Remembers which of the class's saved teams this student picked. False (not an error) when the
-- caller isn't an approved member or the team doesn't belong to that class, so a phone never breaks.
create or replace function public.link_my_team(p_class_id uuid, p_roster_id text)
returns boolean
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
  if not exists (select 1 from public.class_members where class_id = p_class_id and student_id = uid and status = 'approved') then
    return false;
  end if;
  if not exists (
    select 1 from public.classes c, jsonb_array_elements(coalesce(c.team_roster, '[]'::jsonb)) r
    where c.id = p_class_id and r ->> 'id' = p_roster_id
  ) then
    return false;
  end if;
  update public.class_members set team_roster_id = p_roster_id where class_id = p_class_id and student_id = uid;
  return true;
end;
$$;

-- Counts today (UTC) as a check-in for an approved member. True only the first time each day.
-- Not verifiable against a live Class Check-In (those live only in realtime channels), so the reward
-- it drives is deliberately small and student-only.
create or replace function public.record_class_attendance(p_class_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  inserted integer;
begin
  if uid is null then
    raise exception 'Not logged in.';
  end if;
  if not exists (select 1 from public.class_members where class_id = p_class_id and student_id = uid and status = 'approved') then
    return false;
  end if;
  insert into public.class_attendance (class_id, student_id, day)
  values (p_class_id, uid, (now() at time zone 'utc')::date)
  on conflict do nothing;
  get diagnostics inserted = row_count;
  return inserted > 0;
end;
$$;

-- 4. Teacher-side functions -----------------------------------------------------------------------
-- The ONLY way a teacher sees members: name + status, nothing else.
create or replace function public.list_class_members(p_class_id uuid)
returns table (id uuid, student_name text, status text, requested_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Not logged in.';
  end if;
  -- Qualified (cl.id): this function's output columns (id, status…) are also PL/pgSQL variables.
  if not exists (select 1 from public.classes cl where cl.id = p_class_id and cl.user_id = auth.uid()) then
    raise exception 'Class not found.';
  end if;
  return query
  select m.id, m.student_name, m.status, m.requested_at
  from public.class_members m
  where m.class_id = p_class_id
  order by (m.status = 'pending') desc, lower(m.student_name), m.requested_at;
end;
$$;

-- Approve, or decline (declining just removes the pending request).
create or replace function public.decide_class_member(p_member_id uuid, p_approve boolean)
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
  if not exists (
    select 1 from public.class_members m join public.classes c on c.id = m.class_id
    where m.id = p_member_id and c.user_id = uid
  ) then
    raise exception 'Student not found.';
  end if;
  if p_approve then
    update public.class_members set status = 'approved', approved_at = now() where id = p_member_id and status = 'pending';
  else
    delete from public.class_members where id = p_member_id and status = 'pending';
  end if;
end;
$$;

create or replace function public.remove_class_member(p_member_id uuid)
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
  delete from public.class_members m
  using public.classes c
  where m.id = p_member_id and c.id = m.class_id and c.user_id = uid;
end;
$$;

-- 5. Switching back to a teacher account drops any class memberships ------------------------------
-- Same function as before with one added line, so a former student doesn't linger in a class list.
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
  if new_role = 'teacher' then
    delete from public.class_members where student_id = uid;
  end if;
  perform set_config('app.allow_role_change', 'on', true);
  update public.profiles set role = new_role, role_chosen = true where id = uid;
  perform set_config('app.allow_role_change', 'off', true);
end;
$$;

-- 6. Only signed-in users may call any of these ---------------------------------------------------
revoke all on function public.ensure_class_join_code(uuid) from public, anon;
revoke all on function public.regenerate_class_join_code(uuid) from public, anon;
revoke all on function public.request_join_class(text, text) from public, anon;
revoke all on function public.leave_class(uuid) from public, anon;
revoke all on function public.my_classes() from public, anon;
revoke all on function public.link_my_team(uuid, text) from public, anon;
revoke all on function public.record_class_attendance(uuid) from public, anon;
revoke all on function public.list_class_members(uuid) from public, anon;
revoke all on function public.decide_class_member(uuid, boolean) from public, anon;
revoke all on function public.remove_class_member(uuid) from public, anon;
revoke all on function public.set_my_role(text) from public, anon;

grant execute on function public.ensure_class_join_code(uuid) to authenticated;
grant execute on function public.regenerate_class_join_code(uuid) to authenticated;
grant execute on function public.request_join_class(text, text) to authenticated;
grant execute on function public.leave_class(uuid) to authenticated;
grant execute on function public.my_classes() to authenticated;
grant execute on function public.link_my_team(uuid, text) to authenticated;
grant execute on function public.record_class_attendance(uuid) to authenticated;
grant execute on function public.list_class_members(uuid) to authenticated;
grant execute on function public.decide_class_member(uuid, boolean) to authenticated;
grant execute on function public.remove_class_member(uuid) to authenticated;
grant execute on function public.set_my_role(text) to authenticated;
