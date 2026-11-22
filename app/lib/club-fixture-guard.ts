/** A club card may only name a match that club is playing. */

import { leagueForSportingCalendarClub } from "./calendar-clubs";
import { fixtureSides, isNamedFixture, sameNamedFixture } from "./club-fixtures";
import {
  matchesOnCalendarDate,
  nextClubMatches,
  sportingCalendarMatches,
  type CalendarMatch,
} from "./sporting-calendar";
import { namesMatch } from "./upcoming-matches";

export function fixtureIncludesClub(
  fixtureName: string | null | undefined,
  clubName: string | null | undefined
): boolean {
  const club = String(clubName ?? "").trim();
  const sides = fixtureSides(String(fixtureName ?? ""));
  if (!club || !sides) return false;
  return namesMatch(sides[0], club) || namesMatch(sides[1], club);
}

function clubFixtureOnDate(
  clubName: string,
  date: string | null | undefined
): CalendarMatch | null {
  const key = String(date ?? "").slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(key)) return null;
  const rows = matchesOnCalendarDate(key).filter(
    (row) =>
      namesMatch(row.homeName, clubName) || namesMatch(row.awayName, clubName)
  );
  if (rows.length === 0) return null;
  const league = leagueForSportingCalendarClub(clubName);
  return (league && rows.find((row) => row.league === league)) || rows[0];
}

/** Exact "Hearts v Celtic", not the reverse fixture on another date. */
function publishedFixture(
  fixtureName: string,
  date?: string | null
): CalendarMatch | null {
  const needle = fixtureName.trim().toLowerCase();
  const rows = sportingCalendarMatches().filter((row) =>
    sameNamedFixture(row.fixtureName, fixtureName)
  );
  const exact = rows.filter(
    (row) => row.fixtureName.trim().toLowerCase() === needle
  );
  const pool = exact.length > 0 ? exact : rows;
  const key = String(date ?? "").slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(key)) {
    const onDate = pool.find((row) => row.date === key);
    if (onDate) return onDate;
  }
  return pool[0] ?? null;
}

export type AlignedClubFixture = {
  fixtureName: string;
  changed: boolean;
  date?: string;
  kickoff?: string;
  venue?: string;
};

/**
 * Keep a fixture that names this club. If the stored title is another club's
 * match — including a different match on the same day — replace it with this
 * club's published fixture.
 */
export function alignClubFixture({
  clubName,
  fixtureName,
  date,
}: {
  clubName: string;
  fixtureName?: string | null;
  date?: string | null;
}): AlignedClubFixture {
  const club = String(clubName ?? "").trim();
  const stored = String(fixtureName ?? "")
    .replace(/\s+climate campaign$/i, "")
    .trim();
  if (!club) {
    return { fixtureName: stored, changed: false };
  }
  if (stored && fixtureIncludesClub(stored, club)) {
    return { fixtureName: stored, changed: false };
  }
  if (!stored || !isNamedFixture(stored)) {
    return { fixtureName: stored, changed: false };
  }

  const foreign = publishedFixture(stored, date);
  const replacement =
    (foreign && clubFixtureOnDate(club, foreign.date)) ||
    clubFixtureOnDate(club, date) ||
    nextClubMatches(club, { limit: 1 })[0] ||
    null;
  if (!replacement) {
    return { fixtureName: `${club} Match Day`, changed: true };
  }
  return {
    fixtureName: replacement.fixtureName,
    changed: replacement.fixtureName !== stored,
    date: replacement.date,
    kickoff: replacement.kickoff,
    venue: replacement.venue,
  };
}

export function fixtureTitleForClub(input: {
  clubName: string;
  fixtureName?: string | null;
  date?: string | null;
}): string {
  return alignClubFixture(input).fixtureName;
}
