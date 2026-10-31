/** Local Business Climate Sponsor login home: calendar, matches, money, LOBI. */

import { brandsMatch, displayLockFixture, isNamedFixture, type MatchDayClubLock } from "./climate-sponsors";
import { sameNamedFixture, type ClubFixture } from "./club-fixtures";
import {
  allLocalSponsors,
  totalLocalPledge,
  uniqueLocalClubBrandRecords,
  type LocalMatchSponsorship,
  type LocalSponsorRecord,
} from "./local-sponsor";
import {
  matchDateKey,
  sponsoredMatchesFromLock,
  type SponsoredMatchListing,
} from "./sponsor-signed-home";
import { sportingCalendarMatches } from "./sporting-calendar";

export function localRecordsForBrand(
  brandName: string,
  records: LocalSponsorRecord[] = allLocalSponsors()
): LocalSponsorRecord[] {
  return uniqueLocalClubBrandRecords(
    records.filter((row) => brandsMatch(row.brandName, brandName))
  );
}

export type LocalSponsoredClubMatch = {
  clubName: string;
  fixtureName: string;
  amountGbp: number;
};

export function localSponsoredClubMatches(
  records: LocalSponsorRecord[]
): LocalSponsoredClubMatch[] {
  const lines: LocalSponsoredClubMatch[] = [];
  const seen = new Set<string>();
  for (const record of uniqueLocalClubBrandRecords(records)) {
    const matches = record.matchSponsorships ?? [];
    if (matches.length === 0 && record.clubName) {
      const key = `${record.clubName.toLowerCase()}|${record.clubName.toLowerCase()} match`;
      if (seen.has(key)) continue;
      seen.add(key);
      lines.push({
        clubName: record.clubName,
        fixtureName: `${record.clubName} Match`,
        amountGbp: totalLocalPledge(record),
      });
      continue;
    }
    for (const match of matches) {
      const fixtureName = match.fixtureName.trim();
      if (!fixtureName) continue;
      const key = `${record.clubName.toLowerCase()}|${fixtureName.toLowerCase()}`;
      if (seen.has(key)) continue;
      seen.add(key);
      lines.push({
        clubName: record.clubName,
        fixtureName,
        amountGbp: Number(match.amountGbp) || 0,
      });
    }
  }
  return lines;
}

function calendarDateForFixture(
  fixtureName: string,
  clubName?: string
): string | null {
  const catalog = sportingCalendarMatches().filter((row) =>
    sameNamedFixture(row.fixtureName, fixtureName)
  );
  const exact = catalog.find((row) => row.fixtureName === fixtureName);
  if (exact) return matchDateKey(exact.date);
  if (clubName) {
    const forClub = catalog.find(
      (row) =>
        row.homeName.toLowerCase().includes(clubName.trim().toLowerCase()) ||
        row.awayName.toLowerCase().includes(clubName.trim().toLowerCase()) ||
        clubName.toLowerCase().includes(row.homeName.toLowerCase()) ||
        clubName.toLowerCase().includes(row.awayName.toLowerCase())
    );
    if (forClub) return matchDateKey(forClub.date);
  }
  return matchDateKey(catalog[0]?.date);
}

function dateForSponsoredMatch(
  match: LocalMatchSponsorship,
  record: LocalSponsorRecord,
  fixtures: ClubFixture[]
): string | null {
  const fromRecord = matchDateKey(match.date);
  if (fromRecord) return fromRecord;
  const fixture = fixtures.find((row) =>
    sameNamedFixture(row.fixtureName, match.fixtureName)
  );
  return (
    matchDateKey(fixture?.date) ||
    calendarDateForFixture(match.fixtureName, record.clubName) ||
    matchDateKey(record.submittedAt) ||
    matchDateKey(record.signedAt) ||
    matchDateKey(record.createdAt)
  );
}

export function localSponsoredMatches({
  records,
  lock,
  fixtures = [],
}: {
  records: LocalSponsorRecord[];
  lock?: MatchDayClubLock | null;
  fixtures?: ClubFixture[];
}): SponsoredMatchListing[] {
  const listings: SponsoredMatchListing[] = [];
  const seen = new Set<string>();

  function add(row: SponsoredMatchListing) {
    const key = `${row.date}|${row.fixtureName.toLowerCase()}`;
    if (seen.has(key)) return;
    seen.add(key);
    listings.push(row);
  }

  for (const record of records) {
    const matches = record.matchSponsorships ?? [];
    if (matches.length === 0 && record.clubName) {
      const fallback =
        matchDateKey(record.submittedAt) ||
        matchDateKey(record.signedAt) ||
        matchDateKey(record.createdAt);
      if (fallback) {
        add({
          date: fallback,
          clubName: record.clubName,
          fixtureName: `${record.clubName} Match`,
          headline: `${record.clubName} · ${totalLocalPledge(record)}`,
          offerId: `local:${record.brandName}:${record.clubName}`,
        });
      }
      continue;
    }
    for (const match of matches) {
      const date = dateForSponsoredMatch(match, record, fixtures);
      if (!date) continue;
      add({
        date,
        clubName: record.clubName,
        fixtureName: match.fixtureName,
        headline: `${record.clubName} · ${match.fixtureName}`,
        offerId: `local:${record.brandName}:${record.clubName}:${match.fixtureName}`,
      });
    }
  }

  for (const row of sponsoredMatchesFromLock(lock)) add(row);
  return listings.sort((left, right) =>
    left.date === right.date
      ? left.fixtureName.localeCompare(right.fixtureName)
      : left.date.localeCompare(right.date)
  );
}

export function localCommittedGbp(records: LocalSponsorRecord[]): number {
  const byClub = new Map<string, number>();
  for (const record of uniqueLocalClubBrandRecords(records)) {
    const key = record.clubName.trim().toLowerCase();
    byClub.set(key, (byClub.get(key) ?? 0) + totalLocalPledge(record));
  }
  return [...byClub.values()].reduce((sum, value) => sum + value, 0);
}

export function hasLocalSponsorship(
  records: LocalSponsorRecord[],
  lock?: MatchDayClubLock | null
): boolean {
  if (records.some((row) => totalLocalPledge(row) > 0 || (row.matchSponsorships?.length ?? 0) > 0)) {
    return true;
  }
  return Boolean(lock?.clubName && isNamedFixture(displayLockFixture(lock)));
}
