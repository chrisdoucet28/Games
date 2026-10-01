-- Lets a teacher flag a prompt as evidence of a bigger problem (the whole topic's content type is
-- too narrow/repetitive, not just this one wording), separate from an ordinary "this one prompt is
-- wrong" flag. Prompted by a real case: modals_possibility's "correct grammar mistakes" pool only
-- ever tests one underlying rule (bare infinitive after a modal) in a few surface variations
-- (extra "to", wrong "-ing", modal+"-s", "is" instead of "be") -- a teacher flagging one specific
-- instance of that pattern needs a way to say "this isn't about this one item's wording."
-- Rollback: supabase/rollbacks/20260930010000_feedback_pattern_issue.rollback.sql
--
-- Additive and backward compatible: defaults to false, so every existing row and every caller that
-- doesn't know about this column yet keeps working exactly as before.

alter table public.feedback add column if not exists is_pattern_issue boolean not null default false;
