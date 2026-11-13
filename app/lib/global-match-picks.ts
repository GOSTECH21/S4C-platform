/** Global Brand pick rules that must not pull the published fixture catalogue. */

import {
  appendChosenMatch,
  brandKey,
  canClaimLeadClimateSponsor,
  clubsMatch,
  isNamedFixture,
  isSponsorBlockedFromClub,
  occupyingLeadClimateSponsorForMatch,
  secondLeadClimateSponsorRejectedMessage,
  type GoalSponsorshipNetwork,
  type MatchDayClubLock,
} from "./climate-sponsors";
import { sameNamedFixture } from "./club-fixtures";

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
