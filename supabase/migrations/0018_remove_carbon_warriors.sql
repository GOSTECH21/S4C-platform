-- PASTE this file into Supabase Dashboard → SQL Editor → New query → Run.
-- Completely deletes Carbon Warriors Limited as a Climate Sponsor.
-- Safe to run more than once.

create or replace function public.is_s4p_removed_sponsor_brand(p_name text)
returns boolean
language sql
immutable
as $s4p$
  select btrim(regexp_replace(lower(coalesce(p_name, '')), '[^a-z0-9]+', '', 'g'))
    like 'carbonwarriors%';
$s4p$;

do $s4p$
begin
  if to_regclass('public.sponsor_club_network') is not null then
    delete from public.sponsor_club_network
    where public.is_s4p_removed_sponsor_brand(brand_name);
  end if;

  if to_regclass('public.sponsor_offer_signatures') is not null then
    delete from public.sponsor_offer_signatures
    where public.is_s4p_removed_sponsor_brand(brand_name);
  end if;

  if to_regclass('public.sponsor_project_proposals') is not null then
    delete from public.sponsor_project_proposals
    where public.is_s4p_removed_sponsor_brand(sponsor_name);
  end if;

  if to_regclass('public.sponsors') is not null then
    delete from public.sponsors
    where public.is_s4p_removed_sponsor_brand(name);
  end if;
end
$s4p$;
