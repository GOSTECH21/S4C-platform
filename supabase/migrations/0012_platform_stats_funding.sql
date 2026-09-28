-- PASTE this file into Supabase Dashboard → SQL Editor → New query → Run.
-- Do not paste a cursor.com URL. Copy the SQL text only (no line numbers).
-- Safe to run more than once.
--
-- Public homepage counters: real £ mobilised, recorded impact moments,
-- registered fans, clubs, and climate projects that have received a vote.
-- Counts and sums only — no names or emails.

create or replace function public.platform_stats()
returns json
language plpgsql
stable
security definer
set search_path = public
as $s4p$
declare
  fans int := 0;
  teams int := 0;
  funded_projects int := 0;
  funding numeric := 0;
  moments int := 0;
  credit_count int := 0;
  credit_value numeric := 0;
begin
  if to_regclass('public.supporters') is not null then
    select count(*)::int into fans from public.supporters;
  end if;

  if to_regclass('public.clubs') is not null then
    select count(*)::int into teams from public.clubs;
  end if;

  if to_regclass('public.sponsor_match_offers') is not null
     and to_regclass('public.sponsor_offer_signatures') is not null then
    begin
      select coalesce(sum(o.sponsorship_amount_gbp), 0)
        into funding
      from public.sponsor_match_offers o
      where exists (
        select 1
        from public.sponsor_offer_signatures s
        where s.offer_id = o.id
      );
    exception
      when undefined_column then
        funding := 0;
    end;
  end if;

  if to_regclass('public.sponsor_climate_credits') is not null then
    select count(*)::int, coalesce(sum(total_value), 0)
      into credit_count, credit_value
    from public.sponsor_climate_credits;
    funding := coalesce(funding, 0) + coalesce(credit_value, 0);
    moments := coalesce(credit_count, 0);
  end if;

  if coalesce(moments, 0) = 0 and to_regclass('public.fixtures') is not null then
    select coalesce(sum(coalesce(home_score, 0) + coalesce(away_score, 0)), 0)::int
      into moments
    from public.fixtures;
  end if;

  if to_regclass('public.supporter_votes') is not null then
    select count(distinct climate_project_id)::int
      into funded_projects
    from public.supporter_votes
    where climate_project_id is not null;
  end if;

  return json_build_object(
    'fansEngaged', coalesce(fans, 0),
    'sportsTeams', coalesce(teams, 0),
    'teamsInvolved', coalesce(teams, 0),
    'climateProjectsFunded', coalesce(funded_projects, 0),
    'fundingMobilisedGbp', coalesce(funding, 0),
    'impactMomentsCreated', coalesce(moments, 0)
  );
end;
$s4p$;

revoke all on function public.platform_stats() from public;
grant execute on function public.platform_stats() to anon, authenticated;
