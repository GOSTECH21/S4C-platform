import {
  CURRENT_SEASON_LEAGUES,
  leagueForClubName,
  seasonNamesMatch,
} from "./current-season";

/** Season-to-date CO₂ tonnes used to rank Premier League clubs on the CILT. */
const PREMIER_LEAGUE_TONNES: Record<string, number> = {
  Arsenal: 18640,
  Liverpool: 17420,
  Chelsea: 16110,
  "Manchester City": 15880,
  "Manchester United": 14260,
  "Tottenham Hotspur": 13190,
  "Newcastle United": 12840,
  "Aston Villa": 11970,
  "Nottingham Forest": 10820,
  "Brighton & Hove Albion": 10150,
  Fulham: 9640,
  Bournemouth: 9120,
  "Crystal Palace": 8740,
  Everton: 8310,
  Brentford: 7980,
  "Leeds United": 7420,
  Sunderland: 6910,
  "Ipswich Town": 6240,
  "Coventry City": 5810,
  "Hull City": 5360,
};

/** Season-to-date CO₂ tonnes for the 12-club Scottish Premiership CILT. */
const SCOTTISH_PREMIERSHIP_TONNES: Record<string, number> = {
  Celtic: 15240,
  Rangers: 14110,
  Hearts: 12840,
  Hibernian: 11320,
  Aberdeen: 10480,
  Kilmarnock: 9120,
  Motherwell: 8460,
  "Dundee United": 7810,
  "St Mirren": 7240,
  Dundee: 6680,
  "St Johnstone": 6010,
  Falkirk: 5420,
};

const TONNES_BY_LEAGUE: Record<string, Record<string, number>> = {
  "Premier League": PREMIER_LEAGUE_TONNES,
  "Scottish Premiership": SCOTTISH_PREMIERSHIP_TONNES,
};

export type CiltRow = {
  position: number;
  club: string;
  tonnes: number;
  isClub: boolean;
};

export function ciltLeagueForClub(clubName: string): string | null {
  const league = leagueForClubName(clubName);
  if (league && TONNES_BY_LEAGUE[league]) return league;
  return null;
}

export function climateImpactLeagueTable(
  leagueName: string,
  clubName: string,
  extraTonnes = 0
): CiltRow[] {
  const clubs = CURRENT_SEASON_LEAGUES[leagueName];
  if (!clubs?.length) return [];
  const baselines = TONNES_BY_LEAGUE[leagueName] ?? {};

  const rows = clubs.map((club) => {
    const base =
      baselines[club] ??
      Object.entries(baselines).find(([name]) =>
        seasonNamesMatch(name, club)
      )?.[1] ??
      0;
    const isClub = seasonNamesMatch(club, clubName);
    return {
      club,
      tonnes: base + (isClub ? Math.max(0, extraTonnes) : 0),
      isClub,
    };
  });

  rows.sort((left, right) => {
    if (right.tonnes !== left.tonnes) return right.tonnes - left.tonnes;
    return left.club.localeCompare(right.club);
  });

  return rows.map((row, index) => ({
    ...row,
    position: index + 1,
  }));
}

export function premierLeagueCilt(
  clubName: string,
  extraTonnes = 0
): CiltRow[] {
  return climateImpactLeagueTable("Premier League", clubName, extraTonnes);
}

export function scottishPremiershipCilt(
  clubName: string,
  extraTonnes = 0
): CiltRow[] {
  return climateImpactLeagueTable("Scottish Premiership", clubName, extraTonnes);
}

export function ciltPositionLabel(row: CiltRow | undefined): string {
  if (!row) return "Not ranked";
  const suffix =
    row.position % 10 === 1 && row.position % 100 !== 11
      ? "st"
      : row.position % 10 === 2 && row.position % 100 !== 12
        ? "nd"
        : row.position % 10 === 3 && row.position % 100 !== 13
          ? "rd"
          : "th";
  return `${row.position}${suffix}`;
}
