-- Permanent Match Day file record for Sustainability Directors:
-- selected climate projects and voted climate projects, kept per club.
-- Safe to run more than once.

create table if not exists public.club_climate_file_records (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null,
  campaign_id uuid,
  saved_at timestamptz not null default now(),
  match_label text,
  min_amount numeric,
  selected jsonb not null default '[]'::jsonb,
  voted jsonb not null default '[]'::jsonb
);

create index if not exists club_climate_file_records_club_saved_idx
  on public.club_climate_file_records (club_id, saved_at desc);

alter table public.club_climate_file_records enable row level security;

drop policy if exists "Club staff can view file records" on public.club_climate_file_records;
create policy "Club staff can view file records"
  on public.club_climate_file_records
  for select
  using (
    club_id in (
      select club_id from public.club_accounts where auth_user_id = auth.uid()
    )
  );

drop policy if exists "Club staff can insert file records" on public.club_climate_file_records;
create policy "Club staff can insert file records"
  on public.club_climate_file_records
  for insert
  with check (
    club_id in (
      select club_id from public.club_accounts where auth_user_id = auth.uid()
    )
  );

drop policy if exists "Club staff can update file records" on public.club_climate_file_records;
create policy "Club staff can update file records"
  on public.club_climate_file_records
  for update
  using (
    club_id in (
      select club_id from public.club_accounts where auth_user_id = auth.uid()
    )
  );
