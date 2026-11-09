-- Copy ALL of this SQL (from the first CREATE through the last END).
-- Paste into Supabase Dashboard → SQL Editor → New query → Run.
-- This is SQL text, not a URL or a file path. Safe to run more than once.
--
-- Lets S4P Admin open an individual Fan/Supporter profile with Climate
-- Project funds, donations, P4P predictions and Matchrav journeys.

create or replace function public.is_s4p_staff()
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $s4p$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and lower(coalesce(role, '')) = 'admin'
  );
$s4p$;

revoke all on function public.is_s4p_staff() from public;
grant execute on function public.is_s4p_staff() to authenticated;

create table if not exists public.climate_wallet_takes (
  id uuid primary key default gen_random_uuid(),
  amount_gbp numeric not null,
  project_name text,
  brand_name text,
  club_name text,
  created_at timestamptz not null default now()
);

alter table public.climate_wallet_takes
  add column if not exists supporter_id uuid,
  add column if not exists auth_user_id uuid,
  add column if not exists email text;

create index if not exists climate_wallet_takes_supporter_idx
  on public.climate_wallet_takes (supporter_id);
create index if not exists climate_wallet_takes_auth_idx
  on public.climate_wallet_takes (auth_user_id);

alter table public.climate_wallet_takes enable row level security;

drop policy if exists "Anyone can read climate wallet takes" on public.climate_wallet_takes;
create policy "Anyone can read climate wallet takes"
  on public.climate_wallet_takes
  for select
  using (true);

drop policy if exists "Signed-in fans can record climate wallet takes" on public.climate_wallet_takes;
create policy "Signed-in fans can record climate wallet takes"
  on public.climate_wallet_takes
  for insert
  with check (auth.uid() is not null);

grant select on public.climate_wallet_takes to anon, authenticated;
grant insert on public.climate_wallet_takes to authenticated;

create table if not exists public.fan_p4p_predictions (
  id text primary key,
  supporter_id uuid,
  auth_user_id uuid,
  email text,
  fan_id text,
  club_name text,
  fixture_name text,
  window_index int,
  category_id text,
  category_ids text[],
  project_name text,
  engagement_gbp numeric,
  participation_gbp numeric,
  accuracy_gbp numeric,
  correct boolean,
  at timestamptz not null default now()
);

create table if not exists public.fan_p4p_project_funds (
  id text primary key,
  supporter_id uuid,
  auth_user_id uuid,
  email text,
  fan_id text,
  club_name text,
  fixture_name text,
  project_name text,
  amount_gbp numeric not null,
  at timestamptz not null default now()
);

create table if not exists public.fan_matchrav_trips (
  id text primary key,
  supporter_id uuid,
  auth_user_id uuid,
  email text,
  club text,
  fixture_name text,
  venue text,
  match_date text,
  origin text,
  destination text,
  outbound_mode text,
  return_mode text,
  outbound_miles numeric,
  return_miles numeric,
  total_kg numeric,
  saved_vs_solo_car_kg numeric,
  status text,
  confirmed_mode text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.fan_p4p_predictions enable row level security;
alter table public.fan_p4p_project_funds enable row level security;
alter table public.fan_matchrav_trips enable row level security;

create or replace function public.fan_activity_is_own(row_auth uuid, row_email text)
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $s4p$
  select
    public.is_s4p_staff()
    or (row_auth is not null and row_auth = auth.uid())
    or (
      row_email is not null
      and lower(row_email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    );
$s4p$;

revoke all on function public.fan_activity_is_own(uuid, text) from public;
grant execute on function public.fan_activity_is_own(uuid, text) to authenticated;

drop policy if exists "Staff and owner can view p4p predictions" on public.fan_p4p_predictions;
create policy "Staff and owner can view p4p predictions"
  on public.fan_p4p_predictions
  for select
  using (public.fan_activity_is_own(auth_user_id, email));

drop policy if exists "Signed-in fans can write p4p predictions" on public.fan_p4p_predictions;
create policy "Signed-in fans can write p4p predictions"
  on public.fan_p4p_predictions
  for insert
  with check (auth.uid() is not null);

drop policy if exists "Signed-in fans can update p4p predictions" on public.fan_p4p_predictions;
create policy "Signed-in fans can update p4p predictions"
  on public.fan_p4p_predictions
  for update
  using (public.fan_activity_is_own(auth_user_id, email));

drop policy if exists "Staff and owner can view p4p funds" on public.fan_p4p_project_funds;
create policy "Staff and owner can view p4p funds"
  on public.fan_p4p_project_funds
  for select
  using (public.fan_activity_is_own(auth_user_id, email));

drop policy if exists "Signed-in fans can write p4p funds" on public.fan_p4p_project_funds;
create policy "Signed-in fans can write p4p funds"
  on public.fan_p4p_project_funds
  for insert
  with check (auth.uid() is not null);

drop policy if exists "Signed-in fans can update p4p funds" on public.fan_p4p_project_funds;
create policy "Signed-in fans can update p4p funds"
  on public.fan_p4p_project_funds
  for update
  using (public.fan_activity_is_own(auth_user_id, email));

drop policy if exists "Staff and owner can view matchrav trips" on public.fan_matchrav_trips;
create policy "Staff and owner can view matchrav trips"
  on public.fan_matchrav_trips
  for select
  using (public.fan_activity_is_own(auth_user_id, email));

drop policy if exists "Signed-in fans can write matchrav trips" on public.fan_matchrav_trips;
create policy "Signed-in fans can write matchrav trips"
  on public.fan_matchrav_trips
  for insert
  with check (auth.uid() is not null);

drop policy if exists "Signed-in fans can update matchrav trips" on public.fan_matchrav_trips;
create policy "Signed-in fans can update matchrav trips"
  on public.fan_matchrav_trips
  for update
  using (public.fan_activity_is_own(auth_user_id, email));

grant select, insert, update on public.fan_p4p_predictions to authenticated;
grant select, insert, update on public.fan_p4p_project_funds to authenticated;
grant select, insert, update on public.fan_matchrav_trips to authenticated;

do $s4p$
begin
  if to_regclass('public.supporter_votes') is not null then
    execute 'drop policy if exists "S4P staff can view supporter votes" on public.supporter_votes';
    execute 'create policy "S4P staff can view supporter votes" on public.supporter_votes for select using (public.is_s4p_staff())';
  end if;
end
$s4p$;
