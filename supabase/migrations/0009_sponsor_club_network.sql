-- Clubs in each Sponsorship Manager's Goal Sponsorship Network.
-- Paste into Supabase SQL Editor if the Admin page cannot yet list clubs
-- after clicking a manager. Safe to run more than once.

create table if not exists public.sponsor_club_network (
  brand_name text not null,
  club_name text not null,
  email text,
  created_at timestamptz not null default now(),
  primary key (brand_name, club_name)
);

alter table public.sponsor_club_network enable row level security;

drop policy if exists "Authenticated users can view sponsor club networks"
  on public.sponsor_club_network;
create policy "Authenticated users can view sponsor club networks"
  on public.sponsor_club_network
  for select
  using (auth.uid() is not null);

drop policy if exists "Authenticated users can save sponsor club networks"
  on public.sponsor_club_network;
create policy "Authenticated users can save sponsor club networks"
  on public.sponsor_club_network
  for insert
  with check (auth.uid() is not null);

drop policy if exists "Authenticated users can update sponsor club networks"
  on public.sponsor_club_network;
create policy "Authenticated users can update sponsor club networks"
  on public.sponsor_club_network
  for update
  using (auth.uid() is not null)
  with check (auth.uid() is not null);
