-- Marketing-email opt-in for teachers (a monthly "what's new" email, starting Nov 2026).
--
-- Additive and backward compatible: this database is shared with the live site, whose code never
-- reads the new columns. Nothing here changes what the live site can do — except section 4, a
-- security fix (see there).
-- Rollback: supabase/rollbacks/20261016000000_marketing_email_opt_in.rollback.sql
--
-- Consent is always opt-IN: every existing account starts at false and is asked once in-app
-- (marketing_prompt_seen = false). New email/password signups answer it on the sign-up form — the
-- checkbox value rides along in auth metadata and handle_new_user copies it in below, so it
-- survives email confirmation on a different device. Google signups can't carry metadata, so the
-- client parks their answer in localStorage and applies it on first login (App.tsx); if that's
-- lost, they simply get the one-time question instead.

-- 1. Columns -----------------------------------------------------------------------------------
alter table public.profiles add column if not exists marketing_opt_in boolean not null default false;
-- When consent was given (null while opted out) — kept as the consent record, set by the trigger
-- in section 3, never by the client.
alter table public.profiles add column if not exists marketing_opt_in_at timestamptz;
-- False until the account has answered (or dismissed) the one-time question.
alter table public.profiles add column if not exists marketing_prompt_seen boolean not null default false;

-- 2. New signups: copy the sign-up form's answer in ---------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  answered boolean := coalesce(new.raw_user_meta_data ? 'marketing_opt_in', false);
  -- Compared as text, not cast — a malformed value must never be able to fail the signup itself.
  opted_in boolean := coalesce(new.raw_user_meta_data->>'marketing_opt_in' = 'true', false);
begin
  insert into public.profiles (id, marketing_opt_in, marketing_opt_in_at, marketing_prompt_seen)
  values (new.id, opted_in, case when opted_in then now() end, answered);
  return new;
end;
$function$;

-- 3. Keep the consent timestamp honest -----------------------------------------------------------
create or replace function public.stamp_marketing_opt_in()
returns trigger
language plpgsql
set search_path to ''
as $function$
begin
  if new.marketing_opt_in is distinct from old.marketing_opt_in then
    new.marketing_opt_in_at := case when new.marketing_opt_in then now() end;
  else
    new.marketing_opt_in_at := old.marketing_opt_in_at;
  end if;
  return new;
end;
$function$;

drop trigger if exists stamp_marketing_opt_in_trigger on public.profiles;
create trigger stamp_marketing_opt_in_trigger
  before update on public.profiles
  for each row execute function public.stamp_marketing_opt_in();

-- 4. SECURITY FIX: is_admin was writable by its own user -----------------------------------------
-- "Users can update their own profile" has no column restriction, and protect_profile_role only
-- guarded role/role_chosen — so any logged-in account could PATCH its own profile to
-- is_admin = true and get the /admin panel plus every is_admin()-gated read (all profiles, all
-- feedback, and — after this migration — the opted-in email list). Checked 2026-10-16: only the
-- owner's account has it set, so it was never used. Same trigger, now also refusing is_admin
-- changes from any client session; the owner still flips it from the SQL editor (auth.uid() is
-- null there, which this already lets through).
create or replace function public.protect_profile_role()
returns trigger
language plpgsql
set search_path to ''
as $function$
begin
  if auth.uid() is null then
    return new;
  end if;
  if new.is_admin is distinct from old.is_admin then
    raise exception 'Not allowed.';
  end if;
  if (new.role is distinct from old.role or new.role_chosen is distinct from old.role_chosen)
     and coalesce(current_setting('app.allow_role_change', true), '') <> 'on' then
    raise exception 'Account type can only be changed from the account type screen.';
  end if;
  return new;
end;
$function$;

-- 5. Owner-only export of the opted-in list --------------------------------------------------------
create or replace function public.admin_marketing_opt_ins()
returns table (email text, display_name text, opted_in_at timestamptz)
language plpgsql security definer stable set search_path = '' as $$
begin
  if not public.is_admin() then raise exception 'Not authorized.'; end if;
  return query
    select u.email::text, p.display_name, p.marketing_opt_in_at
    from public.profiles p
    join auth.users u on u.id = p.id
    where p.marketing_opt_in
    order by p.marketing_opt_in_at desc;
end;
$$;

revoke execute on function public.admin_marketing_opt_ins() from public, anon;
grant execute on function public.admin_marketing_opt_ins() to authenticated;
