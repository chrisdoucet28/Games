-- Undo for supabase/migrations/20260922010000_content_suggestions.sql.
-- Run only if the Content & Topics suggestion queue has to be backed out. This deletes every
-- drafted (not-yet-applied) content suggestion. No teacher-facing data is touched.

drop policy if exists "Admins manage content suggestions" on public.content_suggestions;
drop table if exists public.content_suggestions;
