/** 2026/27 sport-day catalog: published Matches, grouped by league on a given day. */

import { fixtureDisplayName } from "./club-fixtures";
import publishedFixtures from "../data/published-fixtures.json";
import {
  SPORTING_CALENDAR_LEAGUE_ORDER,
  SPORTING_CALENDAR_LEAGUES,
  sportingLeagueByName,
  venueForTeam,
  type CalendarSport,
  type SportingLeagueDef,
  type SportingTeam,
} from "./sporting-calendar-leagues";

export {
  SPORTING_CALENDAR_LEAGUE_ORDER,
  SPORTING_CALENDAR_LEAGUES,
  sportingLeagueByName,
};
export type { CalendarSport, SportingLeagueDef, SportingTeam };

export const SPORTING_CALENDAR_SEASON = "2026/27";
export const GLOBAL_MATCH_DAY_EXAMPLE_DATE = "2026-10-31";

export type CalendarMatch = {
  id: string;
  date: string;
  kickoff: string;
  league: string;
  sport: CalendarSport;
  country: string;
  homeName: string;
  awayName: string;
  venue: string;
  fixtureName: string;
};

export type LeagueDayGroup = {
  league: string;
  sport: CalendarSport;
  country: string;
  matches: CalendarMatch[];
};

type PublishedRow = {
  league: string;
  sport: string;
  country: string;
  date: string;
  kickoff: string;
  homeName: string;
  awayName: string;
  venue?: string;
};

type PublishedFile = {
  season?: string;
  source?: string;
  matches?: PublishedRow[];
};

function asCalendarSport(value: string): CalendarSport {
  if (value === "NFL" || value === "NBA" || value === "Rugby") return value;
  return "Football";
}

function publishedFile(): PublishedFile {
  return publishedFixtures as PublishedFile;
}

function calendarMatchFromPublished(row: PublishedRow): CalendarMatch | null {
  const home = row.homeName?.trim();
  const away = row.awayName?.trim();
  const date = row.date?.trim();
  const leagueName = row.league?.trim();
  if (!home || !away || !date || !leagueName) return null;
  const league = sportingLeagueByName(leagueName);
  const sport = league?.sport ?? asCalendarSport(row.sport);
  const country = league?.country || row.country || "";
  const venue =
    row.venue?.trim() ||
    (league ? venueForTeam(league, home) : "") ||
    "TBC";
  return {
    id: `${leagueName}:${date}:${home}:${away}`,
    date,
    kickoff: row.kickoff || league?.kickoff || "",
    league: leagueName,
    sport,
    country,
    homeName: home,
    awayName: away,
    venue,
    fixtureName: fixtureDisplayName(home, away),
  };
}

function compareCalendarMatch(left: CalendarMatch, right: CalendarMatch): number {
  const league =
    SPORTING_CALENDAR_LEAGUE_ORDER.indexOf(left.league) -
    SPORTING_CALENDAR_LEAGUE_ORDER.indexOf(right.league);
  if (league !== 0) return league;
  if (left.kickoff !== right.kickoff) {
    return left.kickoff.localeCompare(right.kickoff);
  }
  return left.fixtureName.localeCompare(right.fixtureName);
}

function loadPublishedCatalog(): CalendarMatch[] {
  const rows = publishedFile().matches ?? [];
  return rows
    .flatMap((row) => {
      const match = calendarMatchFromPublished(row);
      return match ? [match] : [];
    })
    .sort(compareCalendarMatch);
}

let cachedCatalog: CalendarMatch[] | null = null;

export function publishedFixtureSource(): string {
  return publishedFile().source ?? "";
}

export function sportingCalendarMatches(): CalendarMatch[] {
  if (cachedCatalog) return cachedCatalog;
  cachedCatalog = loadPublishedCatalog();
  return cachedCatalog;
}

export function matchesOnCalendarDate(date: string): CalendarMatch[] {
  return sportingCalendarMatches().filter((row) => row.date === date);
}

export function matchesByLeagueOnDate(date: string): LeagueDayGroup[] {
  const matches = matchesOnCalendarDate(date);
  const groups = new Map<string, LeagueDayGroup>();
  for (const match of matches) {
    const current = groups.get(match.league);
    if (current) {
      current.matches.push(match);
      continue;
    }
    groups.set(match.league, {
      league: match.league,
      sport: match.sport,
      country: match.country,
      matches: [match],
    });
  }
  return SPORTING_CALENDAR_LEAGUE_ORDER.flatMap((name) => {
    const group = groups.get(name);
    return group ? [group] : [];
  });
}

export function calendarDatesInMonth(year: number, month: number): Set<string> {
  const prefix = `${year}-${String(month + 1).padStart(2, "0")}-`;
  const dates = new Set<string>();
  for (const match of sportingCalendarMatches()) {
    if (match.date.startsWith(prefix)) dates.add(match.date);
  }
  return dates;
}

export function findCalendarMatch(
  date: string,
  fixtureName: string
): CalendarMatch | null {
  return (
    matchesOnCalendarDate(date).find(
      (row) => row.fixtureName === fixtureName
    ) ?? null
  );
}

export function leagueMatchCountOnDate(date: string, league: string): number {
  return matchesOnCalendarDate(date).filter((row) => row.league === league)
    .length;
}
