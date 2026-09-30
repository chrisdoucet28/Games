-- Reworks the admin review workflow on both feedback and content_suggestions. The real workflow:
-- a teacher flags/suggests something with zero extra decisions required of them, the app owner
-- triages it in /admin, and whatever gets confirmed-real has to wait for a Claude Code session to
-- actually implement -- the owner doesn't write the code themselves. The previous two-state status
-- (new/reviewed, new/applied) couldn't represent "I've looked at this and confirmed it's real, it's
-- just waiting for someone to code it" as distinct from "reviewed" implying it's been handled.
-- Rollback: supabase/rollbacks/20260930020000_admin_review_workflow.rollback.sql
--
-- New shared status shape: new -> queued (confirmed real, waiting on a coding session) -> done
-- (feedback) / applied (content_suggestions, same meaning, kept as the existing word) -> OR
-- dismissed (not a real issue) at any point before done/applied.

-- 1. feedback ---------------------------------------------------------------------------------
alter table public.feedback drop constraint feedback_status_check;
-- Existing 'reviewed' rows never produced a queued, actionable item under the old system (per the
-- owner's own description of the problem) -- functionally equivalent to today's 'dismissed', so
-- that's what they become. Nothing else about old rows changes.
update public.feedback set status = 'dismissed' where status = 'reviewed';
alter table public.feedback add constraint feedback_status_check check (status = any (array['new', 'queued', 'done', 'dismissed']));

-- Admin-only free-text context left while triaging (e.g. "pool-wide variety problem, needs 4-5
-- new mistake types") -- the thing a future Claude session with no memory of this review actually
-- needs to act correctly, which a bare status/tag can't carry on its own.
alter table public.feedback add column if not exists admin_note text;

-- 2. content_suggestions -----------------------------------------------------------------------
alter table public.content_suggestions drop constraint content_suggestions_status_check;
alter table public.content_suggestions add constraint content_suggestions_status_check check (status = any (array['new', 'queued', 'applied', 'dismissed']));
alter table public.content_suggestions add column if not exists admin_note text;
