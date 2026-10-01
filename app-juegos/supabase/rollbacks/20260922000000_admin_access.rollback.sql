-- Undo for supabase/migrations/20260922000000_admin_access.sql.
-- Run only if the /admin panel feature has to be backed out. This removes admin read/update access
-- to feedback and other profiles, and the is_admin flag itself. No teacher-facing data is touched.

drop policy if exists "Admins can update feedback status" on public.feedback;
drop policy if exists "Admins can view all feedback" on public.feedback;
drop policy if exists "Admins can view all profiles" on public.profiles;

drop function if exists public.is_admin();

alter table public.profiles drop column if exists is_admin;
