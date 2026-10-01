-- Real data for the admin panel's Growth, Billing, and Teachers & Classes sections (previously
-- placeholders), plus an activity log for the "ClassCade feedback auto-fixer" cloud routine.
--
-- Additive and backward compatible. Rollback: supabase/rollbacks/20260923000000_admin_dashboard_data.rollback.sql
--
-- profiles/classes/subscriptions RLS already scopes each teacher to their own rows, and rightly
-- so — this doesn't loosen that. Instead every cross-teacher aggregate the admin panel needs is a
-- SECURITY DEFINER function (same pattern as my_classes/list_class_members already use) that
-- self-checks public.is_admin() before doing anything, so an admin's dashboard can read across
-- every account without granting that access more broadly. admin_list_teachers() also joins
-- auth.users for email, which a client-side query could never do directly (auth.* isn't exposed
-- over PostgREST) — a SECURITY DEFINER function runs with the function owner's privileges, so it
-- can read auth.users the same way profiles' own creation trigger already does.

-- 1. Auto-fix routine activity log ------------------------------------------------------------
-- Written by the routine itself at the end of every run (it already has Supabase write access —
-- see the feedback_autofix_routine memory); the admin panel just displays the most recent rows.
-- Purely an admin scratchpad, same as content_suggestions — admin-only end to end.
create table public.auto_fix_runs (
  id uuid primary key default gen_random_uuid(),
  ran_at timestamptz not null default now(),
  rows_found integer not null default 0,
  rows_fixed integer not null default 0,
  rows_skipped integer not null default 0,
  summary text not null,
  had_errors boolean not null default false
);
alter table public.auto_fix_runs enable row level security;
create policy "Admins manage auto fix runs"
  on public.auto_fix_runs for all
  using (public.is_admin())
  with check (public.is_admin());

-- 2. Growth ---------------------------------------------------------------------------------
create or replace function public.admin_growth_stats()
returns table (
  total_teachers integer, total_students integer, total_classes integer,
  real_paid_subs integer, promo_redeemed_total integer
)
language plpgsql security definer stable set search_path = '' as $$
begin
  if not public.is_admin() then raise exception 'Not authorized.'; end if;
  return query select
    (select count(*)::integer from public.profiles where role = 'teacher' or role is null),
    (select count(*)::integer from public.profiles where role = 'student'),
    (select count(*)::integer from public.classes),
    (select count(*)::integer from public.subscriptions where status in ('active','trialing')),
    (select coalesce(sum(times_redeemed), 0)::integer from public.promo_codes);
end;
$$;

create or replace function public.admin_signups_by_week()
returns table (week_start date, signups integer)
language plpgsql security definer stable set search_path = '' as $$
begin
  if not public.is_admin() then raise exception 'Not authorized.'; end if;
  return query
    select date_trunc('week', created_at)::date, count(*)::integer
    from public.profiles
    where created_at > now() - interval '9 weeks'
    group by 1 order by 1;
end;
$$;

create or replace function public.admin_most_flagged_games()
returns table (game_id text, total integer, unreviewed integer)
language plpgsql security definer stable set search_path = '' as $$
begin
  if not public.is_admin() then raise exception 'Not authorized.'; end if;
  return query
    select f.game_id, count(*)::integer, count(*) filter (where f.status = 'new')::integer
    from public.feedback f
    where f.kind = 'flag' and f.game_id is not null
    group by f.game_id order by 3 desc, 2 desc limit 8;
end;
$$;

-- 3. Teachers & Classes -----------------------------------------------------------------------
create or replace function public.admin_list_teachers()
returns table (id uuid, email text, display_name text, created_at timestamptz, is_paid boolean, class_count integer)
language plpgsql security definer stable set search_path = '' as $$
begin
  if not public.is_admin() then raise exception 'Not authorized.'; end if;
  return query
    select p.id, u.email::text, p.display_name, p.created_at,
      exists (select 1 from public.subscriptions s where s.user_id = p.id and s.status in ('active','trialing')),
      (select count(*)::integer from public.classes c where c.user_id = p.id)
    from public.profiles p
    join auth.users u on u.id = p.id
    where p.role = 'teacher' or p.role is null
    order by p.created_at desc;
end;
$$;
