-- Sponsor match offers (Option 1) and sponsor-chosen lists sent to clubs (Option 2).
-- Safe to run more than once.

create table if not exists public.sponsor_match_offers (
  id uuid primary key default gen_random_uuid(),
  club_id uuid,
  club_name text not null,
  club_email text,
  match_title text,
  match_date timestamptz,
  score_label text not null default 'Goal',
  project_ids uuid[] not null default '{}',
  projects jsonb not null default '[]'::jsonb,
  posted_at timestamptz not null default now(),
  headline text,
  status text not null default 'open'
);

create table if not exists public.sponsor_offer_signatures (
  id uuid primary key default gen_random_uuid(),
  offer_id uuid not null,
  sponsor_id uuid,
  signer_name text not null,
  brand_name text not null,
  accepted_terms boolean not null default false,
  signed_at timestamptz not null default now()
);

create table if not exists public.sponsor_project_proposals (
  id uuid primary key default gen_random_uuid(),
  club_id uuid,
  club_name text not null,
  sponsor_id uuid,
  sponsor_name text,
  sponsor_email text,
  project_ids uuid[] not null default '{}',
  projects jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  status text not null default 'sent'
);

alter table public.sponsor_match_offers enable row level security;
alter table public.sponsor_offer_signatures enable row level security;
alter table public.sponsor_project_proposals enable row level security;

drop policy if exists "Anyone can view sponsor match offers" on public.sponsor_match_offers;
create policy "Anyone can view sponsor match offers"
  on public.sponsor_match_offers for select using (true);

drop policy if exists "Authenticated users can insert sponsor match offers" on public.sponsor_match_offers;
create policy "Authenticated users can insert sponsor match offers"
  on public.sponsor_match_offers for insert
  with check (auth.uid() is not null);

drop policy if exists "Anyone can view sponsor signatures" on public.sponsor_offer_signatures;
create policy "Anyone can view sponsor signatures"
  on public.sponsor_offer_signatures for select using (true);

drop policy if exists "Authenticated users can sign sponsor offers" on public.sponsor_offer_signatures;
create policy "Authenticated users can sign sponsor offers"
  on public.sponsor_offer_signatures for insert
  with check (auth.uid() is not null);

drop policy if exists "Anyone can view sponsor proposals" on public.sponsor_project_proposals;
create policy "Anyone can view sponsor proposals"
  on public.sponsor_project_proposals for select using (true);

drop policy if exists "Authenticated users can insert sponsor proposals" on public.sponsor_project_proposals;
create policy "Authenticated users can insert sponsor proposals"
  on public.sponsor_project_proposals for insert
  with check (auth.uid() is not null);
