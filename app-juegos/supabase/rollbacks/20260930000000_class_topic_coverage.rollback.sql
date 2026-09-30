-- Undo for supabase/migrations/20260930000000_class_topic_coverage.sql.
-- Run only if per-class topic coverage tracking has to be backed out. No other table is touched.

drop function if exists public.get_class_coverage(uuid);
drop function if exists public.record_class_coverage(uuid, text[]);
drop table if exists public.class_topic_coverage;
