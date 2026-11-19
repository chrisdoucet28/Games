drop policy if exists "feedback_insert_anon" on public.feedback;
-- Safe immediately after apply since the anon policy (just dropped) was the only way a null
-- user_id row could ever be created -- if this is run later, after real anonymous feedback has
-- accumulated, backfill those rows (or delete them) before re-adding the NOT NULL constraint.
alter table public.feedback alter column user_id set not null;
