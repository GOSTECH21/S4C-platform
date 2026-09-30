-- PASTE this file into Supabase Dashboard → SQL Editor → New query → Run.
-- Clears a club's posted Climate Projects and Goals-scored sponsorship
-- campaigns so that club can start afresh.
-- Does not delete shared catalog climate projects, other clubs, Chelsea
-- "Goals Scored vs Arsenal" campaigns, or sponsor login accounts.

create or replace function public.clear_club_projects_and_sponsors(p_club_name text)
returns json
language plpgsql
security definer
set search_path = public
as $s4p$
declare
  club_ids uuid[] := '{}';
  campaign_ids uuid[] := '{}';
  sponsorship_ids uuid[] := '{}';
  portfolios int := 0;
  campaign_projects int := 0;
  match_campaigns int := 0;
  club_projects int := 0;
  sponsorship_campaigns int := 0;
  votes int := 0;
  needle text;
begin
  needle := regexp_replace(lower(coalesce(p_club_name, '')), '[^a-z0-9]+', ' ', 'g');
  needle := btrim(regexp_replace(needle, '\m(fc|football club)\M', ' ', 'g'));
  needle := btrim(regexp_replace(needle, '\s+', ' ', 'g'));

  select coalesce(array_agg(id), '{}')
    into club_ids
  from public.clubs
  where btrim(regexp_replace(
          regexp_replace(lower(name), '[^a-z0-9]+', ' ', 'g'),
          '\m(fc|football club)\M', ' ', 'g'
        )) = needle
    and lower(name) not like '%women%';

  if club_ids = '{}' then
    return json_build_object(
      'clubIds', club_ids,
      'portfolios', 0,
      'campaignProjects', 0,
      'matchCampaigns', 0,
      'clubProjects', 0,
      'sponsorshipCampaigns', 0
    );
  end if;

  select coalesce(array_agg(id), '{}')
    into campaign_ids
  from public.match_campaigns
  where club_id = any (club_ids);

  if campaign_ids <> '{}' and to_regclass('public.supporter_votes') is not null then
    delete from public.supporter_votes
    where campaign_id = any (campaign_ids);
    get diagnostics votes = row_count;
  end if;

  if campaign_ids <> '{}' and to_regclass('public.campaign_projects') is not null then
    delete from public.campaign_projects
    where campaign_id = any (campaign_ids);
    get diagnostics campaign_projects = row_count;
  end if;

  if campaign_ids <> '{}' then
    delete from public.match_campaigns
    where id = any (campaign_ids);
    get diagnostics match_campaigns = row_count;
  end if;

  if to_regclass('public.club_match_portfolio') is not null then
    delete from public.club_match_portfolio
    where club_id = any (club_ids);
    get diagnostics portfolios = row_count;
  end if;

  if to_regclass('public.climate_projects') is not null then
    delete from public.climate_projects
    where club_id = any (club_ids);
    get diagnostics club_projects = row_count;
  end if;

  if to_regclass('public.club_climate_file_records') is not null then
    delete from public.club_climate_file_records
    where club_id = any (club_ids);
  end if;

  if to_regclass('public.sponsor_project_proposals') is not null then
    delete from public.sponsor_project_proposals
    where club_id = any (club_ids)
       or btrim(regexp_replace(
            regexp_replace(lower(coalesce(club_name, '')), '[^a-z0-9]+', ' ', 'g'),
            '\m(fc|football club)\M', ' ', 'g'
          )) = needle;
  end if;

  if to_regclass('public.sponsor_match_offers') is not null then
    delete from public.sponsor_match_offers
    where club_id = any (club_ids)
       or btrim(regexp_replace(
            regexp_replace(lower(coalesce(club_name, '')), '[^a-z0-9]+', ' ', 'g'),
            '\m(fc|football club)\M', ' ', 'g'
          )) = needle;
  end if;

  if to_regclass('public.sponsorship_campaigns') is not null then
    select coalesce(array_agg(id), '{}')
      into sponsorship_ids
    from public.sponsorship_campaigns
    where btrim(regexp_replace(
            regexp_replace(
              regexp_replace(lower(coalesce(sponsored_event, '')), 'goals scored', '', 'g'),
              '[^a-z0-9]+', ' ', 'g'
            ),
            '\m(fc|football club)\M', ' ', 'g'
          )) = needle;
    if sponsorship_ids <> '{}' then
      delete from public.sponsorship_campaigns
      where id = any (sponsorship_ids);
      get diagnostics sponsorship_campaigns = row_count;
    end if;
  end if;

  return json_build_object(
    'clubIds', club_ids,
    'portfolios', portfolios,
    'campaignProjects', campaign_projects,
    'matchCampaigns', match_campaigns,
    'clubProjects', club_projects,
    'sponsorshipCampaigns', sponsorship_campaigns,
    'votes', votes
  );
end;
$s4p$;

revoke all on function public.clear_club_projects_and_sponsors(text) from public;
grant execute on function public.clear_club_projects_and_sponsors(text) to anon, authenticated;

select public.clear_club_projects_and_sponsors('Arsenal');
