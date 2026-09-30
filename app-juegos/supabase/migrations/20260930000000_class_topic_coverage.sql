-- Tracks which topics have actually been taught in a class, so students can see progress against
-- what their own class has covered (not just the whole public Learn library) and teachers can see
-- their own class's cumulative history for the first time -- classes.selected_topics only ever
-- reflects whatever game is currently in progress, cleared the moment it ends.
-- Rollback: supabase/rollbacks/20260930000000_class_topic_coverage.rollback.sql
--
-- Recorded only when a game actually reaches its Results screen (not merely started), by the
-- teacher's own client, for whichever class the game was linked to -- see record_class_coverage
-- below and LessonGamesGenerator.tsx's handleGameEnd. No backfill: coverage before this migration
-- ships is simply unknown, same as every other "starts tracking from here" addition in this app.

create table public.class_topic_coverage (
  class_id uuid not null references public.classes (id) on delete cascade,
  topic_id text not null,
  first_covered_at timestamptz not null default now(),
  primary key (class_id, topic_id)
);
create index class_topic_coverage_class_idx on public.class_topic_coverage (class_id);
alter table public.class_topic_coverage enable row level security;
-- No direct policies at all -- same posture as class_join_attempts: every access goes through the
-- two SECURITY DEFINER functions below, which check ownership/membership themselves.
revoke all on public.class_topic_coverage from anon, authenticated;

-- Teacher-only. Silently does nothing for a class the caller doesn't own, rather than raising --
-- matches record_class_attendance's own "never break the app over a best-effort write" posture,
-- since this is called right as a game ends, not something a teacher should ever see fail.
create or replace function public.record_class_coverage(p_class_id uuid, p_topic_ids text[])
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Not logged in.';
  end if;
  if not exists (select 1 from public.classes where id = p_class_id and user_id = auth.uid()) then
    return;
  end if;
  insert into public.class_topic_coverage (class_id, topic_id)
  select p_class_id, t from unnest(p_topic_ids) as t
  on conflict (class_id, topic_id) do nothing;
end;
$$;

-- Shared by both sides: a teacher reading their own class's history (ClassesScreen), or an
-- approved student member reading a class they're in (MyClassesSection). Empty (not an error) for
-- anyone else, same "never break the app" posture as link_my_team/record_class_attendance.
create or replace function public.get_class_coverage(p_class_id uuid)
returns table (topic_id text, first_covered_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Not logged in.';
  end if;
  if not exists (select 1 from public.classes where id = p_class_id and user_id = auth.uid())
     and not exists (select 1 from public.class_members where class_id = p_class_id and student_id = auth.uid() and status = 'approved') then
    return;
  end if;
  return query
  select c.topic_id, c.first_covered_at
  from public.class_topic_coverage c
  where c.class_id = p_class_id
  order by c.first_covered_at;
end;
$$;

revoke all on function public.record_class_coverage(uuid, text[]) from public, anon;
revoke all on function public.get_class_coverage(uuid) from public, anon;
grant execute on function public.record_class_coverage(uuid, text[]) to authenticated;
grant execute on function public.get_class_coverage(uuid) to authenticated;
