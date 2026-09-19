-- S4P Admin Database: only authorized staff (profiles.role = 'admin')
-- can list every Fan name and email. Fans can still insert and read
-- their own supporter row after they register.
--
-- Apply this in the Supabase SQL editor (or via `psql`) against the project.
-- It is safe to run more than once.

create or replace function public.is_s4p_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and lower(coalesce(role, '')) = 'admin'
  );
$$;

revoke all on function public.is_s4p_staff() from public;
grant execute on function public.is_s4p_staff() to authenticated;

alter table public.supporters enable row level security;

do $$
declare
  policy record;
begin
  for policy in
    select policyname
    from pg_policies
    where schemaname = 'public'
      and tablename = 'supporters'
  loop
    execute format(
      'drop policy if exists %I on public.supporters',
      policy.policyname
    );
  end loop;
end $$;

create policy "Fans can view their supporter row"
  on public.supporters
  for select
  using (
    public.is_s4p_staff()
    or auth_user_id = auth.uid()
    or (
      email is not null
      and lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    )
  );

create policy "Fans can insert their supporter row"
  on public.supporters
  for insert
  with check (
    public.is_s4p_staff()
    or (
      auth.uid() is not null
      and (auth_user_id is null or auth_user_id = auth.uid())
    )
  );

create policy "Fans can update their supporter row"
  on public.supporters
  for update
  using (
    public.is_s4p_staff()
    or auth_user_id = auth.uid()
    or (
      email is not null
      and lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    )
  )
  with check (
    public.is_s4p_staff()
    or auth_user_id is null
    or auth_user_id = auth.uid()
  );

drop policy if exists "S4P staff can view supporter preferences"
  on public.supporter_preferences;
create policy "S4P staff can view supporter preferences"
  on public.supporter_preferences
  for select
  using (public.is_s4p_staff());

drop policy if exists "S4P staff can view club accounts"
  on public.club_accounts;
create policy "S4P staff can view club accounts"
  on public.club_accounts
  for select
  using (public.is_s4p_staff());

drop policy if exists "S4P staff can view sponsors"
  on public.sponsors;
create policy "S4P staff can view sponsors"
  on public.sponsors
  for select
  using (public.is_s4p_staff());
