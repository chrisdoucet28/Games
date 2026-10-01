-- Undo for supabase/migrations/20260923000000_admin_dashboard_data.sql.
-- Run only if the Growth/Billing/Teachers & Classes panels and the auto-fix activity log have to
-- be backed out. No teacher-facing data is touched (these are all read-only aggregate functions
-- plus one admin-only log table).

drop function if exists public.admin_list_teachers();
drop function if exists public.admin_most_flagged_games();
drop function if exists public.admin_signups_by_week();
drop function if exists public.admin_growth_stats();

drop policy if exists "Admins manage auto fix runs" on public.auto_fix_runs;
drop table if exists public.auto_fix_runs;
