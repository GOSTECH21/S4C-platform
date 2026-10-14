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
/** First full NFL Sunday after the Budweiser Saturday example. */
export const NFL_EXAMPLE_DATE = "2026-11-01";
export const NFL_EXAMPLE_MONTH = { year: 2026, month: 10 };
/** Guinness Men's Six Nations Super Saturday. */
export const SIX_NATIONS_EXAMPLE_DATE = "2027-03-13";
export const SIX_NATIONS_EXAMPLE_MONTH = { year: 2027, month: 2 };
/** First Rugby Australia-confirmed 2027 Rugby Championship date. */
export const RUGBY_CHAMPIONSHIP_EXAMPLE_DATE = "2027-07-10";
export const RUGBY_CHAMPIONSHIP_EXAMPLE_MONTH = { year: 2027, month: 6 };

export function calendarLeagueDomId(league: string): string {
  return `calendar-league-${league.replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "")}`;
}

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
    kickoff:
      typeof row.kickoff === "string" ? row.kickoff : league?.kickoff || "",
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

export function rugbyCalendarHints(leaguesOnDay: readonly string[]): string[] {
  const names = new Set(leaguesOnDay);
  const hints: string[] = [];
  if (names.has("Top 14")) {
    hints.push(
      "Top 14 is in the competition row. Click Top 14 to open the collapsible fixture list."
    );
  } else {
    hints.push(
      "Top 14 is the French club championship and plays most weekends. Saturday 31 October has a Top 14 round."
    );
  }
  if (names.has("Six Nations")) {
    hints.push(
      "Six Nations is in the competition row. Click Six Nations to open the collapsible fixture list."
    );
  } else {
    hints.push(
      "Six Nations is in February and March 2027. Click Load Six Nations Super Saturday 13 March."
    );
  }
  if (names.has("The Rugby Championship")) {
    hints.push(
      "The Rugby Championship is in the competition row."
    );
  } else if (names.has("Nations Championship")) {
    hints.push(
      "The Rugby Championship is paused in 2026. Nations Championship is in the competition row — click it to open the collapsible list."
    );
  } else {
    hints.push(
      "The Rugby Championship returns in July 2027 (2026 is the Nations Championship). Click Load The Rugby Championship 10 July."
    );
  }
  return hints;
}
