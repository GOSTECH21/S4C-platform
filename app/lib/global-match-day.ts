/** Global Brand multi-Match lock-in: several named fixtures on one calendar day. */

import {
  appendChosenMatch,
  brandKey,
  canClaimLeadClimateSponsor,
  clubsMatch,
  displayLockFixture,
  isNamedFixture,
  isSponsorBlockedFromClub,
  occupyingLeadClimateSponsorForMatch,
  secondLeadClimateSponsorRejectedMessage,
  type ChosenMatch,
  type GoalSponsorshipNetwork,
  type MatchDayClubLock,
} from "./climate-sponsors";
import { sameNamedFixture } from "./club-fixtures";
import {
  GLOBAL_MATCH_DAY_EXAMPLE_DATE,
  findCalendarMatch,
  matchesOnCalendarDate,
  type CalendarMatch,
} from "./sporting-calendar";

export { GLOBAL_MATCH_DAY_EXAMPLE_DATE };

export type GlobalMatchPick = {
  date: string;
  league: string;
  sport: string;
  fixtureName: string;
  clubName: string;
  homeName: string;
  awayName: string;
  kickoff: string;
  venue: string;
};

export type LeaguePickCount = {
  league: string;
  count: number;
};

export function globalPickKey(pick: {
  date: string;
  fixtureName: string;
  clubName: string;
}): string {
  return `${pick.date}|${pick.fixtureName}|${pick.clubName}`.toLowerCase();
}

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

export function countPicksByLeague(picks: GlobalMatchPick[]): LeaguePickCount[] {
  const counts = new Map<string, number>();
  const order: string[] = [];
  for (const pick of picks) {
    const current = counts.get(pick.league) ?? 0;
    if (!counts.has(pick.league)) order.push(pick.league);
    counts.set(pick.league, current + 1);
  }
  return order.map((league) => ({
    league,
    count: counts.get(league) ?? 0,
  }));
}

export function describeGlobalPicks(picks: GlobalMatchPick[]): string {
  const groups = countPicksByLeague(picks);
  if (groups.length === 0) return "No Matches selected.";
  return groups
    .map((row) => {
      const noun = row.count === 1 ? "Match" : "Matches";
      return `${row.count} ${row.league} ${noun}`;
    })
    .join("; ");
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

export function syntheticLockFromPicks(
  brandName: string,
  picks: GlobalMatchPick[]
): MatchDayClubLock | null {
  if (picks.length === 0) return null;
  const lockedAt = "2026-10-14T09:00:00.000Z";
  let lock: MatchDayClubLock | null = null;
  for (const pick of picks) {
    const next: MatchDayClubLock = {
      brandKey: brandKey(brandName),
      clubName: pick.clubName,
      matchLabel: `${pick.league} Match`,
      fixtureName: pick.fixtureName,
      competition: pick.league,
      fixtureDate: pick.date,
      kickoff: pick.kickoff,
      venue: pick.venue,
      lockedAt,
    };
    lock = appendChosenMatch(lock, next);
  }
  return lock;
}

export function canAddGlobalPick({
  pick,
  brandName,
  networks = [],
  locks = [],
  basket = [],
}: {
  pick: GlobalMatchPick;
  brandName: string;
  networks?: GoalSponsorshipNetwork[];
  locks?: MatchDayClubLock[];
  basket?: GlobalMatchPick[];
}): { ok: true } | { ok: false; reason: string } {
  if (!isNamedFixture(pick.fixtureName)) {
    return { ok: false, reason: "Select a named Match." };
  }
  if (isSponsorBlockedFromClub(brandName, pick.clubName)) {
    return {
      ok: false,
      reason: secondLeadClimateSponsorRejectedMessage(
        pick.clubName,
        "Puma",
        pick.fixtureName
      ),
    };
  }
  const already = basket.some(
    (row) =>
      row.date === pick.date &&
      sameNamedFixture(row.fixtureName, pick.fixtureName) &&
      clubsMatch(row.clubName, pick.clubName)
  );
  if (already) return { ok: true };
  const synthetic = syntheticLockFromPicks(brandName, basket);
  const combined = synthetic ? [...locks, synthetic] : locks;
  if (
    !canClaimLeadClimateSponsor({
      clubName: pick.clubName,
      brandName,
      fixtureName: pick.fixtureName,
      networks,
      locks: combined,
    })
  ) {
    const occupant = occupyingLeadClimateSponsorForMatch({
      clubName: pick.clubName,
      fixtureName: pick.fixtureName,
      networks,
      locks: combined,
    });
    return {
      ok: false,
      reason: secondLeadClimateSponsorRejectedMessage(
        pick.clubName,
        occupant?.brandName ?? "another brand",
        pick.fixtureName
      ),
    };
  }
  return { ok: true };
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
  "Look at the Sporting Calendar",
  "Select any Day of the week and look for Matches to be played by this Club",
  "Lock-in that Match",
  "Proceed to your Carbon Wallet to complete transaction",
] as const;

export const GLOBAL_MATCH_DAY_INTRO = GLOBAL_MATCH_DAY_STEPS.map(
  (step, index) => `${index + 1}. ${step}`
).join("; ");
