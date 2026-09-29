-- PASTE this file into Supabase Dashboard → SQL Editor → New query → Run.
-- Do not paste a cursor.com URL. Copy the SQL text only (no line numbers).
-- Safe to run more than once.
--
-- Each fan take from a Carbon Wallet (Checkbox 1 / Checkbox 2) is a row.
-- The homepage £ Climate Funding Mobilised bar is this sum only — cash
-- that has left a sponsor wallet and gone into Climate Projects.

create table if not exists public.climate_wallet_takes (
  id uuid primary key default gen_random_uuid(),
  amount_gbp numeric not null,
  project_name text,
  brand_name text,
  club_name text,
  created_at timestamptz not null default now()
);

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
