/** Country and League menus for Club Registration Step 1. */

import { sportCategory } from "./sports";
import {
  SPORTING_CALENDAR_LEAGUES,
  type CalendarSport,
} from "./sporting-calendar-leagues";

const PINNED_COUNTRIES = ["England", "Scotland"] as const;
const REGION_LABELS = new Set(["Europe", "International"]);

function calendarSportFor(sport: string | null | undefined): CalendarSport | null {
  const category = sportCategory(sport);
  if (!category) return null;
  return category.name as CalendarSport;
}

/** England and Scotland first, then other countries, then Europe / International. */
export function clubRegisterCountries(): string[] {
  const seen = new Set(
    SPORTING_CALENDAR_LEAGUES.map((league) => league.country).filter(Boolean)
  );
  const pinned = PINNED_COUNTRIES.filter((country) => seen.has(country));
  const rest = [...seen]
    .filter(
      (country) =>
        !PINNED_COUNTRIES.includes(country as (typeof PINNED_COUNTRIES)[number]) &&
        !REGION_LABELS.has(country)
    )
    .sort((left, right) => left.localeCompare(right));
  const regions = [...seen]
    .filter((country) => REGION_LABELS.has(country))
    .sort((left, right) => left.localeCompare(right));
  return [...pinned, ...rest, ...regions];
}

/** Leagues (and cups) for a Country, limited to the chosen Sport when one is set. */
export function clubRegisterLeaguesFor(
  country: string | null | undefined,
  sport: string | null | undefined
): string[] {
  const countryName = String(country ?? "").trim();
  if (!countryName) return [];
  const calendarSport = calendarSportFor(sport);
  return SPORTING_CALENDAR_LEAGUES.filter((league) => {
    if (league.country !== countryName) return false;
    if (!calendarSport) return true;
    return league.sport === calendarSport;
  }).map((league) => league.name);
}

export function leagueStillValidFor(
  league: string | null | undefined,
  country: string | null | undefined,
  sport: string | null | undefined
): boolean {
  const name = String(league ?? "").trim();
  if (!name) return false;
  return clubRegisterLeaguesFor(country, sport).includes(name);
}
