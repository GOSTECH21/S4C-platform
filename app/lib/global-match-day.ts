/** Global Brand multi-Match lock-in: several named fixtures on one calendar day. */

import {
  clubsMatch,
  displayLockFixture,
  isNamedFixture,
  isSponsorBlockedFromClub,
  type ChosenMatch,
  type MatchDayClubLock,
} from "./climate-sponsors";
import { sameNamedFixture } from "./club-fixtures";
import {
  GLOBAL_MATCH_DAY_EXAMPLE_DATE,
  findCalendarMatch,
  matchesOnCalendarDate,
  type CalendarMatch,
} from "./sporting-calendar";
import {
  type GlobalMatchPick,
} from "./global-match-picks";

export { GLOBAL_MATCH_DAY_EXAMPLE_DATE };
export {
  canAddGlobalPick,
  countPicksByLeague,
  describeGlobalPicks,
  globalPickKey,
  syntheticLockFromPicks,
  type GlobalMatchPick,
  type LeaguePickCount,
} from "./global-match-picks";

export function defaultLeadClubForMatch(
  match: CalendarMatch,
  brandName: string
): string | null {
  if (!isSponsorBlockedFromClub(brandName, match.homeName)) {
    return match.homeName;
  }
  if (!isSponsorBlockedFromClub(brandName, match.awayName)) {
    return match.awayName;
  }
  return null;
}

export function pickFromCalendarMatch(
  match: CalendarMatch,
  brandName: string,
  clubName?: string
): GlobalMatchPick | null {
  const club =
    clubName?.trim() || defaultLeadClubForMatch(match, brandName) || "";
  if (!club) return null;
  if (isSponsorBlockedFromClub(brandName, club)) return null;
  if (
    !clubsMatch(club, match.homeName) &&
    !clubsMatch(club, match.awayName)
  ) {
    return null;
  }
  return {
    date: match.date,
    league: match.league,
    sport: match.sport,
    fixtureName: match.fixtureName,
    clubName: club,
    homeName: match.homeName,
    awayName: match.awayName,
    kickoff: match.kickoff,
    venue: match.venue,
  };
}

export const BUDWEISER_EXAMPLE_FIXTURES: Array<{
  league: string;
  fixtureName: string;
  clubName: string;
}> = [
  {
    league: "Premier League",
    fixtureName: "Chelsea v Manchester United",
    clubName: "Chelsea",
  },
  {
    league: "Premier League",
    fixtureName: "Manchester City v Brighton",
    clubName: "Manchester City",
  },
  {
    league: "Scottish Premiership",
    fixtureName: "Motherwell v St Mirren",
    clubName: "Motherwell",
  },
  {
    league: "La Liga",
    fixtureName: "Levante v Atletico Madrid",
    clubName: "Atletico Madrid",
  },
  {
    league: "La Liga",
    fixtureName: "Rayo Vallecano v Celta Vigo",
    clubName: "Rayo Vallecano",
  },
  {
    league: "La Liga",
    fixtureName: "Barcelona v Alaves",
    clubName: "Barcelona",
  },
];

export function budweiserExamplePicks(
  date = GLOBAL_MATCH_DAY_EXAMPLE_DATE
): GlobalMatchPick[] {
  return BUDWEISER_EXAMPLE_FIXTURES.flatMap((row) => {
    const match = findCalendarMatch(date, row.fixtureName);
    if (!match || match.league !== row.league) return [];
    const pick = pickFromCalendarMatch(match, "Budweiser", row.clubName);
    return pick ? [pick] : [];
  });
}

export function toggleGlobalPick(
  basket: GlobalMatchPick[],
  match: CalendarMatch,
  brandName: string,
  clubName?: string
): GlobalMatchPick[] {
  const pick = pickFromCalendarMatch(match, brandName, clubName);
  if (!pick) return basket;
  const exists = basket.findIndex(
    (row) =>
      row.date === pick.date &&
      sameNamedFixture(row.fixtureName, pick.fixtureName) &&
      clubsMatch(row.clubName, pick.clubName)
  );
  if (exists >= 0) {
    return basket.filter((_, index) => index !== exists);
  }
  const withoutOtherClub = basket.filter(
    (row) =>
      !(
        row.date === pick.date &&
        sameNamedFixture(row.fixtureName, pick.fixtureName)
      )
  );
  return [...withoutOtherClub, pick];
}

export function isMatchPicked(
  basket: GlobalMatchPick[],
  match: CalendarMatch,
  clubName?: string
): boolean {
  return basket.some(
    (row) =>
      row.date === match.date &&
      sameNamedFixture(row.fixtureName, match.fixtureName) &&
      (!clubName || clubsMatch(row.clubName, clubName))
  );
}

export function picksOnDate(
  basket: GlobalMatchPick[],
  date: string
): GlobalMatchPick[] {
  return basket.filter((row) => row.date === date);
}

export function globalPicksFromLock(
  lock: MatchDayClubLock | null | undefined,
  date?: string
): GlobalMatchPick[] {
  if (!lock) return [];
  const rows: ChosenMatch[] = [
    ...(lock.matches ?? []),
    {
      clubName: lock.clubName,
      fixtureName: displayLockFixture(lock),
      competition: lock.competition,
      fixtureDate: lock.fixtureDate,
      kickoff: lock.kickoff,
      venue: lock.venue,
      lockedAt: lock.lockedAt,
    },
  ];
  const seen = new Set<string>();
  const picks: GlobalMatchPick[] = [];
  for (const row of rows) {
    const fixtureDate = String(row.fixtureDate ?? "").slice(0, 10);
    if (date && fixtureDate !== date) continue;
    if (!isNamedFixture(row.fixtureName)) continue;
    const key = `${fixtureDate}|${row.fixtureName}|${row.clubName}`.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    const match =
      (fixtureDate && findCalendarMatch(fixtureDate, row.fixtureName)) ||
      matchesOnCalendarDate(fixtureDate).find((item) =>
        sameNamedFixture(item.fixtureName, row.fixtureName)
      );
    picks.push({
      date: fixtureDate,
      league: row.competition?.replace(/\s+Match$/i, "") || match?.league || "",
      sport: match?.sport || "Football",
      fixtureName: row.fixtureName,
      clubName: row.clubName,
      homeName: match?.homeName || row.clubName,
      awayName: match?.awayName || "",
      kickoff: row.kickoff || match?.kickoff || "",
      venue: row.venue || match?.venue || "",
    });
  }
  return picks;
}

export const GLOBAL_MATCH_DAY_STEPS = [
  "Type-in the Name of the Club you wish to sponsor",
  "Click Select the Match",
  "Choose one of this Club's next 10 League or Cup Matches",
  "Lock-in that Match and go straight to your Carbon Wallet",
  "See this Club's chosen Climate Projects, then enter your Match-Sponsorship amount",
] as const;

export const GLOBAL_MATCH_DAY_INTRO = GLOBAL_MATCH_DAY_STEPS.map(
  (step, index) => `${index + 1}. ${step}`
).join("; ");
