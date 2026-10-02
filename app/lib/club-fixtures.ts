/** Published Match Day fixtures a Lead or Local Business Climate Sponsor can pick. */

import {
  displayCompetition,
  formatKickoff,
  formatMatchDate,
  namesMatch,
  normalizeClubName,
  type UpcomingMatch,
} from "./upcoming-matches";

export function fixtureDisplayName(home: string, away: string): string {
  return `${home.trim()} v ${away.trim()}`;
}

export type ClubFixture = {
  id: string;
  homeName: string;
  awayName: string;
  fixtureName: string;
  competition: string;
  date: string;
  kickoff: string | null;
  venue: string | null;
  sourceUrl: string | null;
};

export function isNamedFixture(label: string | null | undefined): boolean {
  return /\sv\s/i.test(String(label ?? "").trim());
}

export function competitionLockLabel(
  competition: string | null | undefined
): string {
  const name = displayCompetition(competition) || String(competition ?? "").trim();
  if (/premier league/i.test(name)) return "Premier League Match";
  if (/champions league/i.test(name)) return "Champions League Match";
  if (/\bfa cup\b/i.test(name)) return "FA Cup Match";
  if (/scottish premiership/i.test(name)) return "Scottish Premiership Match";
  if (/la liga/i.test(name)) return "La Liga Match";
  if (/league cup|carabao/i.test(name)) return "Other Match Day";
  if (!name) return "Other Match Day";
  return /match$/i.test(name) ? name : `${name} Match`;
}

export function clubFixtureFromUpcoming(match: UpcomingMatch): ClubFixture {
  return {
    id: match.id,
    homeName: match.homeName,
    awayName: match.awayName,
    fixtureName: fixtureDisplayName(match.homeName, match.awayName),
    competition: competitionLockLabel(match.competition),
    date: match.date,
    kickoff: match.kickoff,
    venue: match.venue,
    sourceUrl: match.sourceUrl,
  };
}

export function fixturesFromUpcoming(matches: UpcomingMatch[]): ClubFixture[] {
  const seen = new Set<string>();
  const rows: ClubFixture[] = [];
  for (const match of matches) {
    const fixture = clubFixtureFromUpcoming(match);
    const key = `${fixture.date}|${normalizeClubName(fixture.homeName)}|${normalizeClubName(fixture.awayName)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    rows.push(fixture);
  }
  return rows;
}

export function fixtureSides(name: string): [string, string] | null {
  const parts = String(name ?? "")
    .replace(/\s+climate campaign$/i, "")
    .split(/\s+(?:vs\.?|v|versus)\s+/i)
    .map((part) => part.trim())
    .filter(Boolean);
  if (parts.length !== 2) return null;
  return [parts[0], parts[1]];
}

/** Same published match, including home/away reversed and vs/v spelling. */
export function sameNamedFixture(left: string, right: string): boolean {
  const a = fixtureSides(left);
  const b = fixtureSides(right);
  if (!a || !b) {
    const keyLeft = normalizeClubName(left);
    const keyRight = normalizeClubName(right);
    return Boolean(keyLeft && keyLeft === keyRight);
  }
  return (
    (namesMatch(a[0], b[0]) && namesMatch(a[1], b[1])) ||
    (namesMatch(a[0], b[1]) && namesMatch(a[1], b[0]))
  );
}

export function fixtureByIdOrName(
  fixtures: ClubFixture[],
  value: string
): ClubFixture | null {
  const needle = value.trim();
  if (!needle) return null;
  const byId = fixtures.find((row) => row.id === needle);
  if (byId) return byId;
  return (
    fixtures.find(
      (row) =>
        sameNamedFixture(row.fixtureName, needle) ||
        sameNamedFixture(`${row.homeName} vs ${row.awayName}`, needle)
    ) ?? null
  );
}

export type MatchDetails = {
  date: string;
  venue: string;
  kickoff: string;
};

export function matchDetailsLines(fixture: {
  date?: string | null;
  venue?: string | null;
  kickoff?: string | null;
}): MatchDetails {
  return {
    date: fixture.date ? formatMatchDate(fixture.date) : "TBC",
    venue: fixture.venue?.trim() || "TBC",
    kickoff: formatKickoff(fixture.kickoff ?? null),
  };
}

export function hasMatchDetails(fixture: {
  date?: string | null;
  venue?: string | null;
  kickoff?: string | null;
}): boolean {
  return Boolean(fixture.date || fixture.venue || fixture.kickoff);
}
