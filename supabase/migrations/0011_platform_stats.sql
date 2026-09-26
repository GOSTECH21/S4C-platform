-- PASTE this file into Supabase Dashboard → SQL Editor → New query → Run.
-- Do not paste a cursor.com URL. Copy the SQL text only (no line numbers).
-- Safe to run more than once.
--
-- Public homepage counters: fans, clubs, climate projects, and the sum of
-- estimated_co2 figures Climate Project Providers attach to their projects.
-- Counts only — no names or emails.

create or replace function public.platform_stats()
returns json
language sql
stable
security definer
set search_path = public
as $s4p$
  select json_build_object(
    'fansEngaged', (select count(*)::int from public.supporters),
    'teamsInvolved', (select count(*)::int from public.clubs),
    'climateProjects', (select count(*)::int from public.climate_projects),
    'co2Avoided', (
      select coalesce(sum(estimated_co2), 0)
      from public.climate_projects
    )
  );
$s4p$;

revoke all on function public.platform_stats() from public;
grant execute on function public.platform_stats() to anon, authenticated;
