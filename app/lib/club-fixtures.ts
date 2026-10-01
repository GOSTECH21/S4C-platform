/** Demo Match Day fixtures a Lead or Local Business Climate Sponsor can pick. */

import {
  CURRENT_SEASON_LEAGUES,
  leagueForClubName,
  seasonNamesMatch,
} from "./current-season";

export type ClubFixture = {
  id: string;
  homeName: string;
  awayName: string;
  fixtureName: string;
  competition: string;
};

const EUROPEAN_OPPONENTS = [
  "Bayern Munich",
  "Real Madrid",
  "Barcelona",
  "Inter Milan",
];

const FEATURED_FIXTURES: Record<
  string,
  { home: string; away: string; competition: string }[]
> = {
  arsenal: [
    { home: "Arsenal", away: "Chelsea", competition: "Premier League Match" },
    {
      home: "Bayern Munich",
      away: "Arsenal",
      competition: "Champions League Match",
    },
    {
      home: "Arsenal",
      away: "Manchester United",
      competition: "Premier League Match",
    },
  ],
};

function clubKey(name: string): string {
  return name
    .toLowerCase()
    .replace(/fc\b/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function fixtureDisplayName(home: string, away: string): string {
  return `${home.trim()} v ${away.trim()}`;
}

export function isNamedFixture(label: string | null | undefined): boolean {
  return /\sv\s/i.test(String(label ?? "").trim());
}

export function clubFixtureId(
  home: string,
  away: string,
  competition: string
): string {
  return `${clubKey(home)}-${clubKey(away)}-${clubKey(competition)}`.replace(
    /\s+/g,
    "-"
  );
}

function toFixture(
  home: string,
  away: string,
  competition: string
): ClubFixture {
  return {
    id: clubFixtureId(home, away, competition),
    homeName: home,
    awayName: away,
    fixtureName: fixtureDisplayName(home, away),
    competition,
  };
}

function featuredFor(clubName: string): ClubFixture[] {
  const rows = FEATURED_FIXTURES[clubKey(clubName)] ?? [];
  return rows.map((row) => toFixture(row.home, row.away, row.competition));
}

function generatedFor(clubName: string): ClubFixture[] {
  const league = leagueForClubName(clubName);
  const clubs = league ? CURRENT_SEASON_LEAGUES[league] ?? [] : [];
  const self =
    clubs.find((club) => seasonNamesMatch(club, clubName)) ?? clubName.trim();
  if (!self) return [];
  const competition = league ? `${league} Match` : "Other Match Day";
  const opponents = clubs.filter((club) => !seasonNamesMatch(club, self));
  const fixtures: ClubFixture[] = [];
  opponents.slice(0, 6).forEach((opponent, index) => {
    fixtures.push(
      index % 2 === 0
        ? toFixture(self, opponent, competition)
        : toFixture(opponent, self, competition)
    );
  });
  if (
    league === "Premier League" ||
    league === "Bundesliga" ||
    league === "La Liga" ||
    league === "Serie A"
  ) {
    const euro =
      EUROPEAN_OPPONENTS.find((name) => !seasonNamesMatch(name, self)) ??
      "Bayern Munich";
    fixtures.push(toFixture(euro, self, "Champions League Match"));
  }
  return fixtures;
}

export function fixturesForClub(clubName: string): ClubFixture[] {
  if (!clubName.trim()) return [];
  const seen = new Set<string>();
  const rows: ClubFixture[] = [];
  for (const row of [...featuredFor(clubName), ...generatedFor(clubName)]) {
    const key = clubKey(row.fixtureName);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    rows.push(row);
  }
  return rows.slice(0, 8);
}

export function fixtureByName(
  clubName: string,
  fixtureName: string
): ClubFixture | null {
  const needle = clubKey(fixtureName);
  if (!needle) return null;
  return (
    fixturesForClub(clubName).find(
      (row) => clubKey(row.fixtureName) === needle
    ) ?? null
  );
}
