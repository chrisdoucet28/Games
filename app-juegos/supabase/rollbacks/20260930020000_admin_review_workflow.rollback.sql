-- Undo for supabase/migrations/20260930020000_admin_review_workflow.sql.
-- Run only if the queued/done triage workflow has to be backed out. Any row currently 'queued' or
-- 'done' has no equivalent in the old two-state model -- this maps 'queued'/'done' back to
-- 'reviewed' (feedback) / 'applied' (content_suggestions) rather than failing the constraint
-- change, but that loses the distinction the new states existed to capture.

update public.feedback set status = 'reviewed' where status in ('queued', 'done');
alter table public.feedback drop constraint feedback_status_check;
alter table public.feedback add constraint feedback_status_check check (status = any (array['new', 'reviewed']));
alter table public.feedback drop column if exists admin_note;

update public.content_suggestions set status = 'applied' where status = 'queued';
alter table public.content_suggestions drop constraint content_suggestions_status_check;
alter table public.content_suggestions add constraint content_suggestions_status_check check (status = any (array['new', 'applied', 'dismissed']));
alter table public.content_suggestions drop column if exists admin_note;
