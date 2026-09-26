-- Let fans vote on a posted Match Day five even when the hosted schema
-- still requires supporter_votes.campaign_id and match_campaigns.match_id.
-- Safe to run more than once in the Supabase SQL editor.

alter table public.supporter_votes
  alter column campaign_id drop not null;

alter table public.match_campaigns
  alter column match_id drop not null;

drop policy if exists "Fans can read open match campaigns" on public.match_campaigns;
create policy "Fans can read open match campaigns"
  on public.match_campaigns
  for select
  using (status = 'open' or auth.role() = 'authenticated');

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

create or replace function public.open_match_day_campaign_for_club(p_club_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  existing uuid;
  opened uuid;
begin
  if p_club_id is null then
    return null;
  end if;

  select id into existing
  from public.match_campaigns
  where club_id = p_club_id
  order by case when coalesce(status, '') = 'open' then 0 else 1 end, id
  limit 1;

  if existing is not null then
    update public.match_campaigns
      set status = 'open'
      where id = existing
        and coalesce(status, '') is distinct from 'open';
    return existing;
  end if;

  begin
    insert into public.match_campaigns (club_id, title, status)
    values (p_club_id, 'Match Day Climate Campaign', 'open')
    returning id into opened;
    return opened;
  exception when not_null_violation then
    insert into public.match_campaigns (club_id, title, status, match_id)
    select
      p_club_id,
      'Match Day Climate Campaign',
      'open',
      f.id
    from public.fixtures f
    where f.home_club_id = p_club_id or f.away_club_id = p_club_id
    limit 1
    returning id into opened;
    return opened;
  end;
end;
$$;

revoke all on function public.open_match_day_campaign_for_club(uuid) from public;
grant execute on function public.open_match_day_campaign_for_club(uuid) to authenticated;
grant execute on function public.open_match_day_campaign_for_club(uuid) to anon;
