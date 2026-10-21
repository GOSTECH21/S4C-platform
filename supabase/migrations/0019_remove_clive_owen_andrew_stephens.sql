-- PASTE this file into Supabase Dashboard → SQL Editor → New query → Run.
-- Deletes Clive Owen and Andrew Stephens, who registered as Gillette
-- Sponsors for Hearts of Midlothian FC. Gillette as a brand stays.
-- Safe to run more than once.

create or replace function public.is_s4p_removed_sponsor_person(p_name text)
returns boolean
language sql
immutable
as $s4p$
  select (
    select k = any (array['cliveowen', 'andrewstephens'])
        or k like 'cliveowen%'
        or k like 'andrewstephens%'
    from (
      select btrim(
        regexp_replace(
          lower(coalesce(split_part(coalesce(p_name, ''), '@', 1), '')),
          '[^a-z0-9]+',
          '',
          'g'
        )
      ) as k
    ) s
  );
$s4p$;

create or replace function public.is_s4p_hearts_club_name(p_name text)
returns boolean
language sql
immutable
as $s4p$
  select (
    select k in (
      'hearts',
      'heartsofmidlothian',
      'heartsofmidlothianfc',
      'heartofmidlothian',
      'heartofmidlothianfc'
    )
    from (
      select btrim(regexp_replace(lower(coalesce(p_name, '')), '[^a-z0-9]+', '', 'g')) as k
    ) s
  );
$s4p$;

create or replace function public.is_s4p_gillette_brand(p_name text)
returns boolean
language sql
immutable
as $s4p$
  select btrim(regexp_replace(lower(coalesce(p_name, '')), '[^a-z0-9]+', '', 'g'))
    like 'gillette%';
$s4p$;

do $s4p$
declare
  removed_user_ids uuid[] := '{}';
begin
  if to_regclass('public.sponsors') is not null then
    select coalesce(array_agg(user_id), '{}')
      into removed_user_ids
    from public.sponsors
    where user_id is not null
      and public.is_s4p_removed_sponsor_person(website);
  end if;

  if to_regclass('public.sponsor_offer_signatures') is not null then
    delete from public.sponsor_offer_signatures
    where public.is_s4p_removed_sponsor_person(signer_name)
       or sponsor_id in (
            select id from public.sponsors
            where public.is_s4p_removed_sponsor_person(website)
          );
  end if;

  if to_regclass('public.sponsor_project_proposals') is not null then
    delete from public.sponsor_project_proposals
    where public.is_s4p_removed_sponsor_person(sponsor_name)
       or public.is_s4p_removed_sponsor_person(sponsor_email)
       or sponsor_id in (
            select id from public.sponsors
            where public.is_s4p_removed_sponsor_person(website)
          );
  end if;

  if to_regclass('public.sponsor_club_network') is not null then
    delete from public.sponsor_club_network
    where public.is_s4p_removed_sponsor_person(email)
       or (
         public.is_s4p_gillette_brand(brand_name)
         and public.is_s4p_hearts_club_name(club_name)
         and exists (
           select 1
           from public.sponsors s
           where public.is_s4p_removed_sponsor_person(s.website)
             and public.is_s4p_gillette_brand(s.name)
         )
       );
  end if;

  if to_regclass('public.sponsors') is not null then
    delete from public.sponsors
    where public.is_s4p_removed_sponsor_person(website);
  end if;

  if to_regclass('public.profiles') is not null and removed_user_ids <> '{}' then
    delete from public.profiles
    where id = any (removed_user_ids);
  end if;
end
$s4p$;
