-- Local Business Climate Sponsor club + Match records.
-- Shared across phone and PC so a login on one device shows the same
-- sponsored Club and Matches on the other. Paste into the Supabase SQL
-- Editor if the table is not applied yet. Safe to run more than once.

alter table public.sponsors add column if not exists club_name text;
alter table public.sponsors add column if not exists postcode text;
alter table public.sponsors add column if not exists pledge_gbp numeric;
alter table public.sponsors add column if not exists match_sponsorships jsonb;
alter table public.sponsors add column if not exists sponsor_tier text;

create table if not exists public.local_sponsor_records (
  brand_key text not null,
  club_key text not null,
  brand_name text not null,
  club_name text not null,
  email text,
  pledge_gbp numeric not null default 0,
  postcode text,
  logo_url text,
  tagline text,
  source text,
  match_sponsorships jsonb not null default '[]'::jsonb,
  submitted_at timestamptz,
  accepted_terms boolean,
  signer_name text,
  signed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (brand_key, club_key)
);

alter table public.local_sponsor_records enable row level security;

drop policy if exists "Authenticated users can view local sponsor records"
  on public.local_sponsor_records;
create policy "Authenticated users can view local sponsor records"
  on public.local_sponsor_records
  for select
  using (auth.uid() is not null);

drop policy if exists "Authenticated users can save local sponsor records"
  on public.local_sponsor_records;
create policy "Authenticated users can save local sponsor records"
  on public.local_sponsor_records
  for insert
  with check (auth.uid() is not null);

drop policy if exists "Authenticated users can update local sponsor records"
  on public.local_sponsor_records;
create policy "Authenticated users can update local sponsor records"
  on public.local_sponsor_records
  for update
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

drop policy if exists "Authenticated users can delete local sponsor records"
  on public.local_sponsor_records;
create policy "Authenticated users can delete local sponsor records"
  on public.local_sponsor_records
  for delete
  using (auth.uid() is not null);

revoke all on table public.local_sponsor_records from public;
grant select, insert, update, delete on table public.local_sponsor_records to authenticated;
