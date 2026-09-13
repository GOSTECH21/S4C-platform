-- Fan team selection used by registration and My S4P.
--
-- Live hosted DB already has `supporter_preferences` (user_id, sport, club)
-- and `supporters.favourite_club_id`. This file documents the intended
-- club-id junction for when the migration can be applied in SQL editor.

create table if not exists public.supporter_clubs (
  supporter_id uuid not null references public.supporters (id) on delete cascade,
  club_id uuid not null references public.clubs (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (supporter_id, club_id)
);

alter table public.supporter_clubs enable row level security;

drop policy if exists "Fans can view their supported clubs" on public.supporter_clubs;
create policy "Fans can view their supported clubs"
  on public.supporter_clubs
  for select
  using (
    supporter_id in (
      select id from public.supporters where auth_user_id = auth.uid()
    )
  );

drop policy if exists "Fans can add supported clubs" on public.supporter_clubs;
create policy "Fans can add supported clubs"
  on public.supporter_clubs
  for insert
  with check (
    supporter_id in (
      select id from public.supporters where auth_user_id = auth.uid()
    )
  );

drop policy if exists "Fans can remove supported clubs" on public.supporter_clubs;
create policy "Fans can remove supported clubs"
  on public.supporter_clubs
  for delete
  using (
    supporter_id in (
      select id from public.supporters where auth_user_id = auth.uid()
    )
  );
