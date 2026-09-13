-- Enables supporters to vote for climate projects.
--
-- The `supporter_votes` table already exists (columns: id, supporter_id,
-- climate_project_id) but has Row Level Security enabled with no policies, so
-- authenticated supporters currently cannot insert or read their votes.
--
-- Apply this in the Supabase SQL editor (or via `psql`) against the project.
-- It is safe to run more than once.

-- 1. Track when a vote was cast (used to order the My S4P page).
alter table public.supporter_votes
  add column if not exists created_at timestamptz not null default now();

-- 2. Prevent a supporter from voting for the same project twice.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'supporter_votes_unique'
  ) then
    alter table public.supporter_votes
      add constraint supporter_votes_unique
      unique (supporter_id, climate_project_id);
  end if;
end $$;

-- 3. Row Level Security: a supporter may only see and manage their own votes.
alter table public.supporter_votes enable row level security;

drop policy if exists "Supporters can view their votes" on public.supporter_votes;
create policy "Supporters can view their votes"
  on public.supporter_votes
  for select
  using (
    supporter_id in (
      select id from public.supporters where auth_user_id = auth.uid()
    )
  );

drop policy if exists "Supporters can cast votes" on public.supporter_votes;
create policy "Supporters can cast votes"
  on public.supporter_votes
  for insert
  with check (
    supporter_id in (
      select id from public.supporters where auth_user_id = auth.uid()
    )
  );

drop policy if exists "Supporters can remove votes" on public.supporter_votes;
create policy "Supporters can remove votes"
  on public.supporter_votes
  for delete
  using (
    supporter_id in (
      select id from public.supporters where auth_user_id = auth.uid()
    )
  );
