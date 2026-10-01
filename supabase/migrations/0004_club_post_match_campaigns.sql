-- Allow club Sustainability Directors to post an open Match Day campaign
-- so supporters can vote on the club's five climate projects.
-- Safe to run more than once.

alter table public.match_campaigns enable row level security;

drop policy if exists "Club staff can insert match campaigns" on public.match_campaigns;
create policy "Club staff can insert match campaigns"
  on public.match_campaigns
  for insert
  with check (
    club_id in (
      select club_id from public.club_accounts where auth_user_id = auth.uid()
    )
  );

drop policy if exists "Club staff can update match campaigns" on public.match_campaigns;
create policy "Club staff can update match campaigns"
  on public.match_campaigns
  for update
  using (
    club_id in (
      select club_id from public.club_accounts where auth_user_id = auth.uid()
    )
  )
  with check (
    club_id in (
      select club_id from public.club_accounts where auth_user_id = auth.uid()
    )
  );
