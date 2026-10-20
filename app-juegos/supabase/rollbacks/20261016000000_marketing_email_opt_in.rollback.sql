-- Undo for supabase/migrations/20261016000000_marketing_email_opt_in.sql.
-- Drops every teacher's recorded email consent — export the list first (Admin → Teachers) if it
-- might be needed. Deliberately does NOT revert section 4 (the is_admin security fix): putting
-- that hole back has no upside.

drop function if exists public.admin_marketing_opt_ins();
drop trigger if exists stamp_marketing_opt_in_trigger on public.profiles;
drop function if exists public.stamp_marketing_opt_in();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$function$;

alter table public.profiles drop column if exists marketing_prompt_seen;
alter table public.profiles drop column if exists marketing_opt_in_at;
alter table public.profiles drop column if exists marketing_opt_in;
