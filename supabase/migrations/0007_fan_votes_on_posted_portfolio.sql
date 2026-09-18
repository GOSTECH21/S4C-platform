-- Fan votes on a posted Match Day five (club_match_portfolio) currently fail
-- when the club has no match_campaigns row. Hosted supporter_votes.campaign_id
-- is NOT NULL (23502). Villa posted its five without a campaign because
-- match_campaigns.match_id is also required and Villa has no fixture.
-- Safe to run more than once in the Supabase SQL editor.

alter table public.supporter_votes
  alter column campaign_id drop not null;

alter table public.match_campaigns
  alter column match_id drop not null;

drop policy if exists "Posted Match Day can open a campaign" on public.match_campaigns;
create policy "Posted Match Day can open a campaign"
  on public.match_campaigns
  for insert
  with check (
    status = 'open'
    and club_id in (
      select club_id
      from public.club_match_portfolio
      where coalesce(status, '') in ('posted', 'posted-voted')
    )
  );

drop policy if exists "Posted Match Day can attach campaign projects" on public.campaign_projects;
create policy "Posted Match Day can attach campaign projects"
  on public.campaign_projects
  for insert
  with check (
    campaign_id in (
      select id
      from public.match_campaigns
      where club_id in (
        select club_id
        from public.club_match_portfolio
        where coalesce(status, '') in ('posted', 'posted-voted')
      )
    )
  );
