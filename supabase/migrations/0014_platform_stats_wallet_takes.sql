-- PASTE this file into Supabase Dashboard → SQL Editor → New query → Run.
-- Do not paste a cursor.com URL. Copy the SQL text only (no line numbers).
-- Safe to run more than once.
--
-- Homepage counters:
--   £ Climate Funding Mobilised = cash actually taken from Carbon Wallets
--     into Climate Projects (climate_wallet_takes). Signed sponsor offers
--     and climate credits are commitments, not mobilised cash.
--   Fans Engaged = the same unique-fan roster as Admin → Fans by club
--     (Sustainability Directors and Sponsorship Managers are not fans;
--     one person with two emails counts once).

create or replace function public.s4p_compact_identity(value text)
returns text
language sql
immutable
as $s4p$
  select lower(regexp_replace(coalesce(value, ''), '[^a-z0-9]', '', 'g'));
$s4p$;

create or replace function public.s4p_fan_person_key(full_name text, email text)
returns text
language plpgsql
immutable
as $s4p$
declare
  stored text;
  local_part text;
  compact_name text;
  compact_local text;
  token text;
  suffix text;
  first_name text;
  guessed text;
  display text;
  suffixes text[] := array[
    'liverpool', 'budweiser', 'gillette', 'villafc', 'fulham', 'diageo',
    'villa', 'okey', 'gill', 'ful', 'bud', 'dia', 'lfc', 'liv'
  ];
  firsts text[] := array[
    'christopher', 'alexander', 'stephen', 'steven', 'godwin', 'jacob',
    'jason', 'james', 'jerry', 'clive', 'steve', 'john', 'paul', 'owen'
  ];
begin
  stored := lower(btrim(regexp_replace(coalesce(full_name, ''), '\s+', ' ', 'g')));
  local_part := split_part(coalesce(email, ''), '@', 1);
  compact_name := regexp_replace(stored, '\s+', '', 'g');
  compact_local := regexp_replace(lower(local_part), '\s+', '', 'g');

  if stored like '% %' and compact_name is distinct from compact_local then
    display := stored;
  else
    token := regexp_replace(public.s4p_compact_identity(local_part), '[0-9]+$', '');
    foreach suffix in array suffixes loop
      if length(token) - length(suffix) >= 4
         and right(token, length(suffix)) = suffix then
        token := left(token, length(token) - length(suffix));
        exit;
      end if;
    end loop;
    foreach first_name in array firsts loop
      if length(token) - length(first_name) >= 3
         and left(token, length(first_name)) = first_name then
        guessed := first_name || ' ' || substr(token, length(first_name) + 1);
        exit;
      end if;
    end loop;
    display := coalesce(guessed, nullif(stored, ''), 'unnamed fan');
  end if;

  if display like '% %' then
    return display;
  end if;
  return coalesce(nullif(lower(btrim(coalesce(email, ''))), ''), display);
end;
$s4p$;

create or replace function public.s4p_fans_engaged()
returns integer
language plpgsql
stable
security definer
set search_path = public
as $s4p$
declare
  fans int := 0;
begin
  if to_regclass('public.supporters') is null then
    return 0;
  end if;

  if to_regclass('public.club_accounts') is not null
     and to_regclass('public.sponsors') is not null then
    select count(distinct coalesce(
             nullif(public.s4p_fan_person_key(s.full_name, s.email), ''),
             s.id::text
           ))::int
      into fans
    from public.supporters s
    where not exists (
            select 1
            from public.club_accounts d
            where d.email is not null
              and lower(trim(d.email)) = lower(trim(coalesce(s.email, '')))
          )
      and (
            s.auth_user_id is null
            or (
              not exists (
                select 1
                from public.club_accounts d
                where d.auth_user_id is not null
                  and d.auth_user_id = s.auth_user_id
              )
              and not exists (
                select 1
                from public.sponsors sp
                where sp.user_id is not null
                  and sp.user_id = s.auth_user_id
              )
            )
          )
      and not exists (
            select 1
            from public.club_accounts d
            where length(public.s4p_compact_identity(
                    coalesce(d.first_name, '') || coalesce(d.last_name, '')
                  )) >= 6
              and (
                public.s4p_compact_identity(split_part(coalesce(s.email, ''), '@', 1))
                  = public.s4p_compact_identity(
                      coalesce(d.first_name, '') || coalesce(d.last_name, '')
                    )
                or public.s4p_compact_identity(split_part(coalesce(s.email, ''), '@', 1))
                  like public.s4p_compact_identity(
                    coalesce(d.first_name, '') || coalesce(d.last_name, '')
                  ) || '%'
              )
          );
  else
    select count(distinct coalesce(
             nullif(public.s4p_fan_person_key(s.full_name, s.email), ''),
             s.id::text
           ))::int
      into fans
    from public.supporters s;
  end if;

  return coalesce(fans, 0);
end;
$s4p$;

create or replace function public.platform_stats()
returns json
language plpgsql
stable
security definer
set search_path = public
as $s4p$
declare
  fans int := 0;
  teams int := 0;
  funded_projects int := 0;
  funding numeric := 0;
  moments int := 0;
  credit_count int := 0;
begin
  fans := public.s4p_fans_engaged();

  if to_regclass('public.clubs') is not null then
    select count(*)::int into teams from public.clubs;
  end if;

  if to_regclass('public.climate_wallet_takes') is not null then
    select coalesce(sum(amount_gbp), 0)
      into funding
    from public.climate_wallet_takes;
  end if;

  if to_regclass('public.sponsor_climate_credits') is not null then
    select count(*)::int
      into credit_count
    from public.sponsor_climate_credits;
    moments := coalesce(credit_count, 0);
  end if;

  if coalesce(moments, 0) = 0 and to_regclass('public.fixtures') is not null then
    select coalesce(sum(coalesce(home_score, 0) + coalesce(away_score, 0)), 0)::int
      into moments
    from public.fixtures;
  end if;

  if to_regclass('public.supporter_votes') is not null then
    select count(distinct climate_project_id)::int
      into funded_projects
    from public.supporter_votes
    where climate_project_id is not null;
  end if;

  return json_build_object(
    'fansEngaged', coalesce(fans, 0),
    'fansCountedAsRoster', true,
    'sportsTeams', coalesce(teams, 0),
    'teamsInvolved', coalesce(teams, 0),
    'climateProjectsFunded', coalesce(funded_projects, 0),
    'fundingMobilisedGbp', coalesce(funding, 0),
    'walletTakesGbp', coalesce(funding, 0),
    'impactMomentsCreated', coalesce(moments, 0)
  );
end;
$s4p$;

revoke all on function public.s4p_compact_identity(text) from public;
revoke all on function public.s4p_fan_person_key(text, text) from public;
revoke all on function public.s4p_fans_engaged() from public;
revoke all on function public.platform_stats() from public;
grant execute on function public.s4p_fans_engaged() to anon, authenticated;
grant execute on function public.platform_stats() to anon, authenticated;
