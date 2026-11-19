-- Teacher feedback: "it doesn't let you send feedback when you're not signed in" -- the app has an
-- anonymous-explore mode (no account required, no supabase.auth.signInAnonymously() call either --
-- a truly unauthenticated request runs as the `anon` Postgres role). public.feedback's only INSERT
-- policy was scoped to `authenticated` with user_id NOT NULL defaulting to auth.uid(), which
-- evaluates to NULL for an anon-role request -- RLS silently rejects every anonymous submission
-- (no matching policy at all, not even reaching the NOT NULL check).
-- Rollback: supabase/rollbacks/20261114000000_feedback_allow_anonymous.rollback.sql
alter table public.feedback alter column user_id drop not null;
create policy "feedback_insert_anon" on public.feedback for insert to anon with check (user_id is null);
