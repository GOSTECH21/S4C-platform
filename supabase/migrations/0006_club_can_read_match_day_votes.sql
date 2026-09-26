-- Let Sustainability Directors see fan votes on their Match Day projects.
-- Safe to run more than once in the Supabase SQL editor.

drop policy if exists "Club staff can view votes on their projects" on public.supporter_votes;
create policy "Club staff can view votes on their projects"
  on public.supporter_votes
  for select
  using (
    climate_project_id in (
      select project_id
      from public.club_match_portfolio
      where club_id in (
        select club_id from public.club_accounts where auth_user_id = auth.uid()
      )
      and project_id is not null
    )
    or campaign_id in (
      select id from public.match_campaigns
      where club_id in (
        select club_id from public.club_accounts where auth_user_id = auth.uid()
      )
    )
  );

drop policy if exists "Club staff can attach campaign projects" on public.campaign_projects;
create policy "Club staff can attach campaign projects"
  on public.campaign_projects
  for insert
  with check (
    campaign_id in (
      select id from public.match_campaigns
      where club_id in (
        select club_id from public.club_accounts where auth_user_id = auth.uid()
      )
    )
  );

drop policy if exists "Authenticated users can update campaign vote counts" on public.campaign_projects;
create policy "Authenticated users can update campaign vote counts"
  on public.campaign_projects
  for update
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
