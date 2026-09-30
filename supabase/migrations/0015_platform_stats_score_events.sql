-- PASTE this file into Supabase Dashboard → SQL Editor → New query → Run.
-- Do not paste a cursor.com URL. Copy the SQL text only (no line numbers).
-- Safe to run more than once.
--
-- Sports Teams = the 2026/27 catalog (200 unique clubs). Do not count leftover
-- duplicate club rows such as extra unassigned "Arsenal FC" copies.
-- Impact Moments Created = posted score events (goals, tries, etc), not the
-- 530 climate-credit rows from signed offers.

create or replace function public.platform_stats()
returns json
language plpgsql
stable
security definer
set search_path = public
as $s4p$
declare
  fans int := 0;
  teams int := 200;
  funded_projects int := 0;
  funding numeric := 0;
  moments int := 0;
begin
  fans := public.s4p_fans_engaged();

  if to_regclass('public.climate_wallet_takes') is not null then
    select coalesce(sum(amount_gbp), 0)
      into funding
    from public.climate_wallet_takes;
  end if;

  if to_regclass('public.score_events') is not null then
    select count(*)::int into moments from public.score_events;
  end if;

  if to_regclass('public.supporter_votes') is not null then
    select count(distinct climate_project_id)::int
      into funded_projects
    from public.supporter_votes
    where climate_project_id is not null;
  end if;

  return json_build_object(
    'fansEngaged', coalesce(fans, 0),
    'fansCountedAsRoster', true,
    'sportsTeams', coalesce(teams, 200),
    'teamsInvolved', coalesce(teams, 200),
    'climateProjectsFunded', coalesce(funded_projects, 0),
    'fundingMobilisedGbp', coalesce(funding, 0),
    'walletTakesGbp', coalesce(funding, 0),
    'impactMomentsCreated', coalesce(moments, 0)
  );
end;
$s4p$;

revoke all on function public.platform_stats() from public;
grant execute on function public.platform_stats() to anon, authenticated;
