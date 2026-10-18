/** 2026/27 sport-day catalog: published Matches, grouped by league on a given day. */

import {
  competitionLockLabel,
  fixtureDisplayName,
  type ClubFixture,
} from "./club-fixtures";
import publishedFixtures from "../data/published-fixtures.json";
import { namesExactlyMatch } from "./upcoming-matches";
import { leagueForSportingCalendarClub } from "./calendar-clubs";
import {
  CUP_COMPETITION_NAMES,
  SPORTING_CALENDAR_LEAGUE_ORDER,
  SPORTING_CALENDAR_LEAGUES,
  isCupCompetitionName,
  sportingLeagueByName,
  venueForTeam,
  type CalendarSport,
  type CupCompetitionName,
  type SportingLeagueDef,
  type SportingTeam,
} from "./sporting-calendar-leagues";

export {
  CUP_COMPETITION_NAMES,
  SPORTING_CALENDAR_LEAGUE_ORDER,
  SPORTING_CALENDAR_LEAGUES,
  isCupCompetitionName,
  sportingLeagueByName,
};
export type { CalendarSport, CupCompetitionName, SportingLeagueDef, SportingTeam };

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

export function localCalendarDateKey(now: Date = new Date()): string {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function calendarDateKey(value: string | Date): string {
  if (value instanceof Date) return localCalendarDateKey(value);
  return String(value ?? "").slice(0, 10);
}

/** Sponsors lock-in Matches that have not been played yet, including today. */
export function isUpcomingCalendarDate(
  date: string | Date,
  from: string | Date = new Date()
): boolean {
  const day = calendarDateKey(date);
  const start = calendarDateKey(from);
  return Boolean(day) && Boolean(start) && day >= start;
}

export function calendarDatesInMonth(
  year: number,
  month: number,
  from: string | Date = new Date()
): Set<string> {
  const prefix = `${year}-${String(month + 1).padStart(2, "0")}-`;
  const dates = new Set<string>();
  for (const match of sportingCalendarMatches()) {
    if (
      match.date.startsWith(prefix) &&
      isUpcomingCalendarDate(match.date, from)
    ) {
      dates.add(match.date);
    }
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

export function matchesForClub(
  clubName: string,
  options?: { fromDate?: string | Date }
): CalendarMatch[] {
  const needle = clubName.trim();
  if (!needle) return [];
  const from = options?.fromDate ?? new Date();
  return sportingCalendarMatches()
    .filter(
      (row) =>
        isUpcomingCalendarDate(row.date, from) &&
        (namesExactlyMatch(row.homeName, needle) ||
          namesExactlyMatch(row.awayName, needle))
    )
    .sort((left, right) =>
      left.date === right.date
        ? left.kickoff.localeCompare(right.kickoff)
        : left.date.localeCompare(right.date)
    );
}

/** Next League and Cup Matches a sponsor can lock for the typed Club. */
export const CLUB_MATCH_CALENDAR_COUNT = 10;

export function nextClubMatches(
  clubName: string,
  options?: { fromDate?: string | Date; limit?: number }
): CalendarMatch[] {
  const limit = options?.limit ?? CLUB_MATCH_CALENDAR_COUNT;
  const clubLeague = leagueForSportingCalendarClub(clubName);
  return matchesForClub(clubName, { fromDate: options?.fromDate })
    .filter((row) => {
      if (isCupCompetitionName(row.league)) return true;
      if (!clubLeague) return true;
      return row.league === clubLeague;
    })
    .slice(0, Math.max(0, limit));
}

export function clubFixtureFromCalendarMatch(match: CalendarMatch): ClubFixture {
  return {
    id: match.id,
    homeName: match.homeName,
    awayName: match.awayName,
    fixtureName: match.fixtureName,
    competition: competitionLockLabel(match.league),
    date: match.date,
    kickoff: match.kickoff || null,
    venue: match.venue || null,
    sourceUrl: null,
  };
}

export function monthsCoveringMatches(
  matches: CalendarMatch[]
): Array<{ year: number; month: number }> {
  const seen = new Set<string>();
  const months: Array<{ year: number; month: number }> = [];
  for (const match of matches) {
    const parsed = monthFromIsoDate(match.date);
    if (!parsed) continue;
    const key = `${parsed.year}-${parsed.month}`;
    if (seen.has(key)) continue;
    seen.add(key);
    months.push(parsed);
  }
  return months;
}

export function resolveSportingCalendarClub(query: string): string | null {
  const needle = query.trim();
  if (!needle) return null;
  const clubs = clubsOnSportingCalendar();
  const exact = clubs.find((name) => namesExactlyMatch(name, needle));
  if (exact) return exact;
  const lower = needle.toLowerCase();
  const starts = clubs.filter((name) => name.toLowerCase().startsWith(lower));
  if (starts.length === 1) return starts[0];
  const includes = clubs.filter((name) => name.toLowerCase().includes(lower));
  if (includes.length === 1) return includes[0];
  return null;
}

export function cupMatchesForClub(clubName: string): CalendarMatch[] {
  return matchesForClub(clubName).filter((row) =>
    isCupCompetitionName(row.league)
  );
}

export function clubsOnSportingCalendar(): string[] {
  const names = new Set<string>();
  for (const league of SPORTING_CALENDAR_LEAGUES) {
    if (league.sport !== "Football") continue;
    if (isCupCompetitionName(league.name)) continue;
    for (const team of league.teams) names.add(team.name);
  }
  for (const match of sportingCalendarMatches()) {
    if (!isCupCompetitionName(match.league)) continue;
    names.add(match.homeName);
    names.add(match.awayName);
  }
  return [...names].sort((left, right) => left.localeCompare(right));
}

export function busyCupDate(league: string): string | null {
  const counts = new Map<string, number>();
  for (const row of sportingCalendarMatches()) {
    if (row.league !== league) continue;
    counts.set(row.date, (counts.get(row.date) ?? 0) + 1);
  }
  let best: string | null = null;
  let n = 0;
  for (const [date, count] of counts) {
    if (count > n) {
      best = date;
      n = count;
    }
  }
  return best;
}

export function monthFromIsoDate(date: string): { year: number; month: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!match) return null;
  return { year: Number(match[1]), month: Number(match[2]) - 1 };
}

export function cupCalendarHints(leaguesOnDay: readonly string[]): string[] {
  const names = new Set(leaguesOnDay);
  const present = CUP_COMPETITION_NAMES.filter((league) => names.has(league));
  if (present.length === 0) return [];
  return [`Cup competitions in the row: ${present.join(", ")}.`];
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
