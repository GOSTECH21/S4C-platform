-- PASTE this file into Supabase Dashboard → SQL Editor → New query → Run.
-- The platform is no longer limited to Arsenal, Hearts and Hibernian.
-- Disable the old three-club prune so new Fan, Club and Sponsor rows stay.

create or replace function public.is_s4p_demo_club_name(p_name text)
returns boolean
language sql
immutable
as $s4p$
  select true;
$s4p$;

create or replace function public.s4p_prune_non_demo_clubs()
returns json
language plpgsql
security definer
set search_path = public
as $s4p$
begin
  return json_build_object(
    'disabled', true,
    'message', 'Three-club prune is retired. Every Sporting Calendar club stays.'
  );
end;
$s4p$;

revoke all on function public.s4p_prune_non_demo_clubs() from public;
revoke all on function public.s4p_prune_non_demo_clubs() from anon, authenticated;
