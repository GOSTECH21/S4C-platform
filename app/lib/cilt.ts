import {
  CURRENT_SEASON_LEAGUES,
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

export type CiltRow = {
  position: number;
  club: string;
  tonnes: number;
  isClub: boolean;
};

export function premierLeagueCilt(
  clubName: string,
  extraTonnes = 0
): CiltRow[] {
  const clubs = CURRENT_SEASON_LEAGUES["Premier League"];
  const rows = clubs.map((club) => {
    const base =
      PREMIER_LEAGUE_TONNES[club] ??
      Object.entries(PREMIER_LEAGUE_TONNES).find(([name]) =>
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
