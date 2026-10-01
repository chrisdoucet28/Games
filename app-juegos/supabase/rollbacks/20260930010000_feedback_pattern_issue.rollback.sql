-- Undo for supabase/migrations/20260930010000_feedback_pattern_issue.sql.
-- Run only if the "pattern issue" flag checkbox has to be backed out. Drops the column and
-- whatever values teachers have already set on it -- there's no way to recover those afterward.

alter table public.feedback drop column if exists is_pattern_issue;
