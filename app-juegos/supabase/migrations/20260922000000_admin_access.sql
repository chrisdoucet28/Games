-- Admin access for the new /admin panel (Feedback Inbox + Content & Topics + Assets).
--
-- Additive and backward compatible: this database is shared with the live site, whose code never
-- reads the new column. Nothing here changes what any existing (non-admin) account can do.
-- Rollback: supabase/rollbacks/20260922000000_admin_access.rollback.sql
--
-- public.feedback currently has ONLY an insert policy (teachers can flag content, but nothing
-- reads it back in-app "by design" — see feedback_review_workflow memory). This adds the one
-- reader: whoever is flagged is_admin on their own profile row. No new auth system — reuses the
-- same Supabase Auth session every teacher already has; is_admin is just a profiles column.
--
-- Policies below call a SECURITY DEFINER helper (public.is_admin()) instead of an inline
-- `exists (select 1 from profiles where ...)` subquery. The inline form caused
-- "infinite recursion detected in policy for relation profiles" (Postgres error 42P17) when a
-- profiles-table policy's own USING clause queried profiles again — confirmed via a dry run, not
-- just theoretical. A SECURITY DEFINER function runs with the function owner's privileges, so its
-- internal query bypasses RLS entirely and never re-triggers the calling policy.

-- 1. The admin flag -------------------------------------------------------------------------------
alter table public.profiles add column if not exists is_admin boolean not null default false;

update public.profiles
set is_admin = true
where id = (select id from auth.users where email = 'chrisdoucet18@gmail.com');

-- 2. Helper function used by every admin policy below ----------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;

-- 3. Let an admin read every profile (needed to show display_name on feedback rows) ---------------
drop policy if exists "Admins can view all profiles" on public.profiles;
create policy "Admins can view all profiles"
  on public.profiles for select
  using (public.is_admin());

-- 4. Let an admin read and update feedback ---------------------------------------------------------
drop policy if exists "Admins can view all feedback" on public.feedback;
create policy "Admins can view all feedback"
  on public.feedback for select
  using (public.is_admin());

drop policy if exists "Admins can update feedback status" on public.feedback;
create policy "Admins can update feedback status"
  on public.feedback for update
  using (public.is_admin());
