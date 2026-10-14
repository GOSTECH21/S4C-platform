/** 2026/27 sport-day catalog: every mined Match, grouped by league on a given day. */

import { fixtureDisplayName } from "./club-fixtures";
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

type Pairing = { home: SportingTeam; away: SportingTeam };

type SlateRow = {
  homeName: string;
  awayName: string;
  kickoff: string;
};

function addDays(iso: string, days: number): string {
  const date = new Date(`${iso}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function weekdayUtc(iso: string): number {
  return new Date(`${iso}T00:00:00.000Z`).getUTCDay();
}

function onWeekday(iso: string, weekday: number): string {
  const current = weekdayUtc(iso);
  return addDays(iso, (weekday - current + 7) % 7);
}

function circleRounds(teams: SportingTeam[]): Pairing[][] {
  const rotating = [...teams];
  if (rotating.length % 2 !== 0) {
    rotating.push({ name: "BYE", venue: "" });
  }
  const total = rotating.length;
  const half = total / 2;
  const rounds: Pairing[][] = [];
  for (let round = 0; round < total - 1; round += 1) {
    const matches: Pairing[] = [];
    for (let i = 0; i < half; i += 1) {
      const left = rotating[i];
      const right = rotating[total - 1 - i];
      if (left.name === "BYE" || right.name === "BYE") continue;
      const homeFirst = round % 2 === 0;
      matches.push(
        homeFirst
          ? { home: left, away: right }
          : { home: right, away: left }
      );
    }
    rounds.push(matches);
    const fixed = rotating[0];
    const rest = rotating.slice(1);
    rest.unshift(rest.pop()!);
    rotating.splice(0, rotating.length, fixed, ...rest);
  }
  return rounds;
}

function seasonRounds(league: SportingLeagueDef): Pairing[][] {
  const first = circleRounds(league.teams);
  if (league.singleLegs && league.singleLegs > 0) {
    return first.slice(0, league.singleLegs);
  }
  return [
    ...first,
    ...first.map((round) =>
      round.map((match) => ({ home: match.away, away: match.home }))
    ),
  ];
}

function calendarMatch(
  league: SportingLeagueDef,
  date: string,
  kickoff: string,
  home: string,
  away: string
): CalendarMatch {
  return {
    id: `${league.name}:${date}:${home}:${away}`,
    date,
    kickoff,
    league: league.name,
    sport: league.sport,
    country: league.country,
    homeName: home,
    awayName: away,
    venue: venueForTeam(league, home),
    fixtureName: fixtureDisplayName(home, away),
  };
}

function kickoffForIndex(league: SportingLeagueDef, index: number): string {
  if (league.sport === "NBA") {
    return ["00:00", "01:00", "02:30", "03:00"][index % 4];
  }
  if (league.name === "NFL") {
    if (index === 0) return "18:30";
    if (index >= 14) return "21:20";
    return "18:00";
  }
  if (league.name === "Premier League") {
    if (index === 0) return "12:30";
    if (index === 8) return "17:30";
    return "15:00";
  }
  if (league.name === "La Liga") {
    if (index < 3) return "13:00";
    if (index < 7) return "16:00";
    return "21:00";
  }
  if (league.name === "Serie A") {
    return index < 6 ? "15:00" : "18:00";
  }
  if (league.name === "Ligue 1") {
    return index < 5 ? "17:00" : "21:00";
  }
  if (league.name === "Bundesliga") {
    return index === 0 ? "15:30" : "18:30";
  }
  return league.kickoff;
}

function generateLeague(league: SportingLeagueDef): CalendarMatch[] {
  const rounds = seasonRounds(league);
  const start = onWeekday(league.startDate, league.weekday);
  const rows: CalendarMatch[] = [];
  const nbaGap = league.name === "NBA" ? 3 : 7;
  rounds.forEach((round, roundIndex) => {
    const date = addDays(start, roundIndex * nbaGap);
    round.forEach((match, matchIndex) => {
      rows.push(
        calendarMatch(
          league,
          date,
          kickoffForIndex(league, matchIndex),
          match.home.name,
          match.away.name
        )
      );
    });
  });
  return rows;
}

function slate(
  leagueName: string,
  rows: SlateRow[]
): CalendarMatch[] {
  const league = sportingLeagueByName(leagueName);
  if (!league) return [];
  return rows.map((row) =>
    calendarMatch(
      league,
      GLOBAL_MATCH_DAY_EXAMPLE_DATE,
      row.kickoff,
      row.homeName,
      row.awayName
    )
  );
}

/** Curated Saturday 31 October 2026 slates — a full mined Match Day by league. */
export const OCTOBER_31_2026_SLATES: Record<string, CalendarMatch[]> = {
  "Premier League": slate("Premier League", [
    { homeName: "Liverpool", awayName: "Manchester City", kickoff: "12:30" },
    { homeName: "Manchester United", awayName: "Tottenham Hotspur", kickoff: "15:00" },
    { homeName: "Newcastle United", awayName: "Brighton", kickoff: "15:00" },
    { homeName: "Aston Villa", awayName: "Everton", kickoff: "15:00" },
    { homeName: "West Ham United", awayName: "Fulham", kickoff: "15:00" },
    { homeName: "Crystal Palace", awayName: "Wolverhampton Wanderers", kickoff: "15:00" },
    { homeName: "Nottingham Forest", awayName: "Bournemouth", kickoff: "15:00" },
    { homeName: "Brentford", awayName: "Leeds United", kickoff: "15:00" },
    { homeName: "Burnley", awayName: "Sunderland", kickoff: "15:00" },
    { homeName: "Chelsea", awayName: "Arsenal", kickoff: "17:30" },
  ]),
  "EFL Championship": slate("EFL Championship", [
    { homeName: "Leicester City", awayName: "Southampton", kickoff: "12:30" },
    { homeName: "Ipswich Town", awayName: "Coventry City", kickoff: "15:00" },
    { homeName: "Sheffield United", awayName: "Middlesbrough", kickoff: "15:00" },
    { homeName: "West Bromwich Albion", awayName: "Watford", kickoff: "15:00" },
    { homeName: "Norwich City", awayName: "Bristol City", kickoff: "15:00" },
    { homeName: "Birmingham City", awayName: "Wrexham", kickoff: "15:00" },
    { homeName: "Hull City", awayName: "Stoke City", kickoff: "15:00" },
    { homeName: "Derby County", awayName: "Preston North End", kickoff: "15:00" },
    { homeName: "Swansea City", awayName: "Oxford United", kickoff: "15:00" },
    { homeName: "Portsmouth", awayName: "Queens Park Rangers", kickoff: "15:00" },
    { homeName: "Millwall", awayName: "Charlton Athletic", kickoff: "15:00" },
    { homeName: "Blackburn Rovers", awayName: "Sheffield Wednesday", kickoff: "15:00" },
  ]),
  "EFL League One": slate("EFL League One", [
    { homeName: "Bolton Wanderers", awayName: "Huddersfield Town", kickoff: "12:30" },
    { homeName: "Cardiff City", awayName: "Luton Town", kickoff: "15:00" },
    { homeName: "Reading", awayName: "Wycombe Wanderers", kickoff: "15:00" },
    { homeName: "Stockport County", awayName: "Lincoln City", kickoff: "15:00" },
    { homeName: "Barnsley", awayName: "Plymouth Argyle", kickoff: "15:00" },
    { homeName: "Wigan Athletic", awayName: "Blackpool", kickoff: "15:00" },
    { homeName: "Leyton Orient", awayName: "AFC Wimbledon", kickoff: "15:00" },
    { homeName: "Peterborough United", awayName: "Stevenage", kickoff: "15:00" },
    { homeName: "Rotherham United", awayName: "Doncaster Rovers", kickoff: "15:00" },
    { homeName: "Exeter City", awayName: "Northampton Town", kickoff: "15:00" },
    { homeName: "Mansfield Town", awayName: "Port Vale", kickoff: "15:00" },
    { homeName: "Bradford City", awayName: "Burton Albion", kickoff: "15:00" },
  ]),
  "Women's Super League": slate("Women's Super League", [
    { homeName: "Chelsea Women", awayName: "Arsenal Women", kickoff: "12:30" },
    { homeName: "Manchester City Women", awayName: "Manchester United Women", kickoff: "14:00" },
    { homeName: "Liverpool Women", awayName: "Everton Women", kickoff: "14:00" },
    { homeName: "Tottenham Hotspur Women", awayName: "West Ham United Women", kickoff: "17:30" },
    { homeName: "Aston Villa Women", awayName: "Brighton Women", kickoff: "14:00" },
    { homeName: "Leicester City Women", awayName: "London City Lionesses", kickoff: "14:00" },
  ]),
  "Scottish Premiership": slate("Scottish Premiership", [
    { homeName: "Rangers", awayName: "Hibernian", kickoff: "12:30" },
    { homeName: "Hearts", awayName: "Aberdeen", kickoff: "15:00" },
    { homeName: "Celtic", awayName: "Dundee United", kickoff: "15:00" },
    { homeName: "Motherwell", awayName: "Kilmarnock", kickoff: "15:00" },
    { homeName: "St Mirren", awayName: "Dundee", kickoff: "15:00" },
    { homeName: "Falkirk", awayName: "Livingston", kickoff: "15:00" },
  ]),
  Bundesliga: slate("Bundesliga", [
    { homeName: "Bayern Munich", awayName: "Borussia Dortmund", kickoff: "15:30" },
    { homeName: "Bayer Leverkusen", awayName: "RB Leipzig", kickoff: "15:30" },
    { homeName: "Eintracht Frankfurt", awayName: "VfB Stuttgart", kickoff: "15:30" },
    { homeName: "VfL Wolfsburg", awayName: "SC Freiburg", kickoff: "15:30" },
    { homeName: "Union Berlin", awayName: "Mainz 05", kickoff: "15:30" },
    { homeName: "Werder Bremen", awayName: "FC Augsburg", kickoff: "15:30" },
    { homeName: "TSG Hoffenheim", awayName: "FC Heidenheim", kickoff: "15:30" },
    { homeName: "St Pauli", awayName: "FC Koln", kickoff: "18:30" },
    { homeName: "Hamburger SV", awayName: "Borussia Monchengladbach", kickoff: "18:30" },
  ]),
  "La Liga": slate("La Liga", [
    { homeName: "Girona", awayName: "Mallorca", kickoff: "13:00" },
    { homeName: "Alaves", awayName: "Levante", kickoff: "13:00" },
    { homeName: "Elche", awayName: "Real Oviedo", kickoff: "13:00" },
    { homeName: "Villarreal", awayName: "Real Sociedad", kickoff: "16:00" },
    { homeName: "Sevilla", awayName: "Valencia", kickoff: "16:00" },
    { homeName: "Osasuna", awayName: "Rayo Vallecano", kickoff: "16:00" },
    { homeName: "Getafe", awayName: "Espanyol", kickoff: "16:00" },
    { homeName: "Atletico Madrid", awayName: "Athletic Club", kickoff: "18:00" },
    { homeName: "Real Betis", awayName: "Celta Vigo", kickoff: "18:00" },
    { homeName: "Real Madrid", awayName: "Barcelona", kickoff: "21:00" },
  ]),
  "Ligue 1": slate("Ligue 1", [
    { homeName: "Lille", awayName: "Lens", kickoff: "17:00" },
    { homeName: "Nice", awayName: "Rennes", kickoff: "17:00" },
    { homeName: "Strasbourg", awayName: "Toulouse", kickoff: "17:00" },
    { homeName: "Nantes", awayName: "Angers", kickoff: "17:00" },
    { homeName: "Brest", awayName: "Le Havre", kickoff: "17:00" },
    { homeName: "Auxerre", awayName: "Lorient", kickoff: "17:00" },
    { homeName: "Metz", awayName: "Paris FC", kickoff: "17:00" },
    { homeName: "Marseille", awayName: "Lyon", kickoff: "21:00" },
    { homeName: "Paris Saint-Germain", awayName: "Monaco", kickoff: "21:00" },
  ]),
  "Serie A": slate("Serie A", [
    { homeName: "Atalanta", awayName: "Bologna", kickoff: "15:00" },
    { homeName: "Fiorentina", awayName: "Torino", kickoff: "15:00" },
    { homeName: "Udinese", awayName: "Genoa", kickoff: "15:00" },
    { homeName: "Cagliari", awayName: "Lecce", kickoff: "15:00" },
    { homeName: "Parma", awayName: "Como", kickoff: "15:00" },
    { homeName: "Sassuolo", awayName: "Pisa", kickoff: "15:00" },
    { homeName: "Hellas Verona", awayName: "Cremonese", kickoff: "15:00" },
    { homeName: "Lazio", awayName: "Roma", kickoff: "18:00" },
    { homeName: "Napoli", awayName: "AC Milan", kickoff: "18:00" },
    { homeName: "Inter Milan", awayName: "Juventus", kickoff: "20:45" },
  ]),
  "Premiership Rugby": slate("Premiership Rugby", [
    { homeName: "Saracens", awayName: "Harlequins", kickoff: "15:00" },
    { homeName: "Leicester Tigers", awayName: "Northampton Saints", kickoff: "15:00" },
    { homeName: "Bath", awayName: "Bristol Bears", kickoff: "15:05" },
    { homeName: "Sale Sharks", awayName: "Exeter Chiefs", kickoff: "17:30" },
    { homeName: "Gloucester", awayName: "Newcastle Red Bulls", kickoff: "15:00" },
  ]),
  "Super League": slate("Super League", [
    { homeName: "Wigan Warriors", awayName: "St Helens", kickoff: "15:00" },
    { homeName: "Leeds Rhinos", awayName: "Hull KR", kickoff: "17:30" },
    { homeName: "Warrington Wolves", awayName: "Catalans Dragons", kickoff: "15:00" },
    { homeName: "Leigh Leopards", awayName: "Hull FC", kickoff: "15:00" },
    { homeName: "Wakefield Trinity", awayName: "Huddersfield Giants", kickoff: "15:00" },
    { homeName: "Castleford Tigers", awayName: "Salford Red Devils", kickoff: "15:00" },
  ]),
  NBA: slate("NBA", [
    { homeName: "Boston Celtics", awayName: "New York Knicks", kickoff: "00:30" },
    { homeName: "Philadelphia 76ers", awayName: "Miami Heat", kickoff: "00:00" },
    { homeName: "Milwaukee Bucks", awayName: "Chicago Bulls", kickoff: "01:00" },
    { homeName: "Cleveland Cavaliers", awayName: "Detroit Pistons", kickoff: "00:00" },
    { homeName: "Minnesota Timberwolves", awayName: "Denver Nuggets", kickoff: "01:00" },
    { homeName: "Dallas Mavericks", awayName: "San Antonio Spurs", kickoff: "01:30" },
    { homeName: "Los Angeles Lakers", awayName: "Golden State Warriors", kickoff: "03:00" },
    { homeName: "Phoenix Suns", awayName: "LA Clippers", kickoff: "03:00" },
  ]),
};

function nflLondonSlate(): CalendarMatch[] {
  const league = sportingLeagueByName("NFL");
  if (!league) return [];
  return [
    calendarMatch(
      league,
      GLOBAL_MATCH_DAY_EXAMPLE_DATE,
      "14:30",
      "Jacksonville Jaguars",
      "New England Patriots"
    ),
    calendarMatch(
      league,
      GLOBAL_MATCH_DAY_EXAMPLE_DATE,
      "17:30",
      "Atlanta Falcons",
      "Los Angeles Rams"
    ),
  ];
}

function withOctober31Slates(generated: CalendarMatch[]): CalendarMatch[] {
  const kept = generated.filter(
    (row) => row.date !== GLOBAL_MATCH_DAY_EXAMPLE_DATE
  );
  const slates: CalendarMatch[] = [];
  for (const league of SPORTING_CALENDAR_LEAGUE_ORDER) {
    if (league === "NFL") {
      slates.push(...nflLondonSlate());
      continue;
    }
    slates.push(...(OCTOBER_31_2026_SLATES[league] ?? []));
  }
  return [...kept, ...slates].sort(compareCalendarMatch);
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

let cachedCatalog: CalendarMatch[] | null = null;

export function sportingCalendarMatches(): CalendarMatch[] {
  if (cachedCatalog) return cachedCatalog;
  const generated = SPORTING_CALENDAR_LEAGUES.flatMap(generateLeague);
  cachedCatalog = withOctober31Slates(generated);
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
