-- Content Suggestions queue for the /admin panel's Content & Topics browser.
--
-- Additive and backward compatible — a brand-new table nothing else reads or writes.
-- Rollback: supabase/rollbacks/20260922010000_content_suggestions.rollback.sql
--
-- topics.ts (the actual game/lesson question content) lives in git as source code, not a
-- database table — there's no live "edit and save" path to it, and deliberately not building one
-- here (see the admin_panel_project memory for why: it would mean either moving all game content
-- out of topics.ts into a database, or giving the live site a way to push git commits, both much
-- bigger changes than "let the admin propose an edit"). This table is a lightweight draft queue
-- instead: browsing a topic's full content in /admin can save a proposed replacement for any one
-- item here, to be reviewed and actually applied later in the topic's own branch chat (new-topics/
-- game-lesson-changes/vault-heist), same as how a teacher's free-text feedback flag already works.
--
-- Purely an admin scratchpad — nothing outside /admin ever reads this table, so RLS is simple:
-- every operation is admin-only, reusing the same public.is_admin() helper as feedback/profiles
-- (see 20260922000000_admin_access.sql).
create table public.content_suggestions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  -- References topics.ts's TOPIC_LIBRARY key (e.g. "irregular_verbs") — not a foreign key, since
  -- that content lives in git, not a database table.
  topic_id text not null,
  -- Which array on that topic entry the item came from (e.g. "questions", "cardTasks",
  -- "auctionSentences", "spyRounds", "hotSeatWords", "hotPotatoPrompts", "halfSentences") or
  -- "minefieldGrid" for that one single-object field.
  section text not null,
  -- Best-effort position within that array at the moment this was drafted — topics.ts can be
  -- edited by other branches in the meantime, so `original` (a full snapshot) is what actually
  -- lets a later session re-locate the real item; this is just a starting hint.
  item_index integer,
  original jsonb not null,
  proposed jsonb not null,
  note text,
  status text not null default 'new' check (status in ('new', 'applied', 'dismissed')),
  created_at timestamptz not null default now()
);

alter table public.content_suggestions enable row level security;

create policy "Admins manage content suggestions"
  on public.content_suggestions for all
  using (public.is_admin())
  with check (public.is_admin());
