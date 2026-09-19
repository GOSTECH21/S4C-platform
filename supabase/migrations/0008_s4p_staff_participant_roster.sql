-- PASTE this file into Supabase Dashboard → SQL Editor → New query → Run.
-- Do not paste a cursor.com URL. Copy the SQL text only (no line numbers).
-- Safe to run more than once.
--
-- S4P Admin Database: only authorized staff (profiles.role = 'admin')
-- can list every Fan name and email. Fans can still insert and read
-- their own supporter row after they register.

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

alter table public.supporters enable row level security;

do $s4p$
declare
  pol record;
begin
  for pol in
    select policyname
    from pg_policies
    where schemaname = 'public'
      and tablename = 'supporters'
  loop
    execute format(
      'drop policy if exists %I on public.supporters',
      pol.policyname
    );
  end loop;
end
$s4p$;

drop policy if exists "Fans can view their supporter row" on public.supporters;
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

drop policy if exists "Fans can insert their supporter row" on public.supporters;
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

drop policy if exists "Fans can update their supporter row" on public.supporters;
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

do $s4p$
begin
  if to_regclass('public.supporter_preferences') is not null then
    execute 'drop policy if exists "S4P staff can view supporter preferences" on public.supporter_preferences';
    execute 'create policy "S4P staff can view supporter preferences" on public.supporter_preferences for select using (public.is_s4p_staff())';
  end if;
  if to_regclass('public.club_accounts') is not null then
    execute 'drop policy if exists "S4P staff can view club accounts" on public.club_accounts';
    execute 'create policy "S4P staff can view club accounts" on public.club_accounts for select using (public.is_s4p_staff())';
  end if;
  if to_regclass('public.sponsors') is not null then
    execute 'drop policy if exists "S4P staff can view sponsors" on public.sponsors';
    execute 'create policy "S4P staff can view sponsors" on public.sponsors for select using (public.is_s4p_staff())';
  end if;
end
$s4p$;
