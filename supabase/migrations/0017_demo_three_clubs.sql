-- PASTE this file into Supabase Dashboard → SQL Editor → New query → Run.
-- Demo catalog: keep Hearts of Midlothian, Hibernian, and Arsenal only.
-- Deletes other clubs' directors, fans/supporters, and sponsors.
-- Does not delete opponent club rows used in demo-club fixtures
-- (for example Chelsea in Arsenal v Chelsea).

create or replace function public.s4p_normalize_club_name(p_name text)
returns text
language sql
immutable
as $s4p$
  select btrim(regexp_replace(
    regexp_replace(
      regexp_replace(
        regexp_replace(lower(coalesce(p_name, '')), '[^a-z0-9]+', ' ', 'g'),
        '\m(association football club|football club)\M', ' ', 'g'
      ),
      '\m(afc|fc|cf)\M', ' ', 'g'
    ),
    '\s+', ' ', 'g'
  ));
$s4p$;

create or replace function public.is_s4p_demo_club_name(p_name text)
returns boolean
language sql
immutable
as $s4p$
  select public.s4p_normalize_club_name(p_name) in (
    'arsenal',
    'hearts',
    'heart of midlothian',
    'hearts of midlothian',
    'hibernian'
  );
$s4p$;

create or replace function public.s4p_prune_non_demo_clubs()
returns json
language plpgsql
security definer
set search_path = public
as $s4p$
declare
  demo_ids uuid[] := '{}';
  stale_fan_ids uuid[] := '{}';
  dropped_accounts int := 0;
  dropped_fans int := 0;
  dropped_prefs int := 0;
  dropped_networks int := 0;
  dropped_sponsors int := 0;
  dropped_offers int := 0;
  dropped_proposals int := 0;
begin
  select coalesce(array_agg(id), '{}')
    into demo_ids
  from public.clubs
  where public.is_s4p_demo_club_name(name)
    and lower(name) not like '%women%';

  if to_regclass('public.club_accounts') is not null then
    delete from public.club_accounts
    where club_id is null
       or not (club_id = any (demo_ids));
    get diagnostics dropped_accounts = row_count;
  end if;

  if to_regclass('public.supporters') is not null then
    select coalesce(array_agg(id), '{}')
      into stale_fan_ids
    from public.supporters
    where favourite_club_id is null
       or not (favourite_club_id = any (demo_ids));

    if stale_fan_ids <> '{}' and to_regclass('public.supporter_votes') is not null then
      delete from public.supporter_votes
      where supporter_id = any (stale_fan_ids);
    end if;

    if stale_fan_ids <> '{}' then
      delete from public.supporters
      where id = any (stale_fan_ids);
      get diagnostics dropped_fans = row_count;
    end if;
  end if;

  if to_regclass('public.supporter_clubs') is not null then
    delete from public.supporter_clubs
    where not (club_id = any (demo_ids));
  end if;

  if to_regclass('public.supporter_preferences') is not null then
    delete from public.supporter_preferences
    where not public.is_s4p_demo_club_name(club);
    get diagnostics dropped_prefs = row_count;
  end if;

  if to_regclass('public.sponsors') is not null
     and to_regclass('public.sponsor_club_network') is not null then
    delete from public.sponsors s
    where exists (
            select 1
            from public.sponsor_club_network n
            where lower(trim(n.brand_name)) = lower(trim(s.name))
          )
      and not exists (
            select 1
            from public.sponsor_club_network n
            where lower(trim(n.brand_name)) = lower(trim(s.name))
              and public.is_s4p_demo_club_name(n.club_name)
          );
    get diagnostics dropped_sponsors = row_count;
  end if;

  if to_regclass('public.sponsor_club_network') is not null then
    delete from public.sponsor_club_network
    where not public.is_s4p_demo_club_name(club_name);
    get diagnostics dropped_networks = row_count;
  end if;

  if to_regclass('public.sponsor_match_offers') is not null then
    delete from public.sponsor_match_offers
    where not public.is_s4p_demo_club_name(club_name);
    get diagnostics dropped_offers = row_count;
  end if;

  if to_regclass('public.sponsor_project_proposals') is not null then
    delete from public.sponsor_project_proposals
    where not public.is_s4p_demo_club_name(club_name);
    get diagnostics dropped_proposals = row_count;
  end if;

  return json_build_object(
    'demoClubIds', demo_ids,
    'directors', dropped_accounts,
    'fans', dropped_fans,
    'preferences', dropped_prefs,
    'sponsorNetworks', dropped_networks,
    'sponsors', dropped_sponsors,
    'matchOffers', dropped_offers,
    'proposals', dropped_proposals
  );
end;
$s4p$;

revoke all on function public.s4p_prune_non_demo_clubs() from public;
grant execute on function public.s4p_prune_non_demo_clubs() to anon, authenticated;

select public.s4p_prune_non_demo_clubs();

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
    where exists (
            select 1
            from public.clubs c
            where c.id = s.favourite_club_id
              and public.is_s4p_demo_club_name(c.name)
          )
      and not exists (
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
    from public.supporters s
    where exists (
            select 1
            from public.clubs c
            where c.id = s.favourite_club_id
              and public.is_s4p_demo_club_name(c.name)
          );
  end if;

  return coalesce(fans, 0);
end;
$s4p$;
