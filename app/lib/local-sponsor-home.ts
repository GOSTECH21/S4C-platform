/** Local Business Climate Sponsor login home: calendar, matches, money, LOBI. */

import { brandsMatch, displayLockFixture, isNamedFixture, type MatchDayClubLock } from "./climate-sponsors";
import { sameNamedFixture, type ClubFixture } from "./club-fixtures";
import {
  allLocalSponsors,
  totalLocalPledge,
  uniqueLocalClubBrandRecords,
  type LocalSponsorRecord,
} from "./local-sponsor";
import {
  matchDateKey,
  sponsoredMatchesFromLock,
  type SponsoredMatchListing,
} from "./sponsor-signed-home";

export function localRecordsForBrand(
  brandName: string,
  records: LocalSponsorRecord[] = allLocalSponsors()
): LocalSponsorRecord[] {
  return uniqueLocalClubBrandRecords(
    records.filter((row) => brandsMatch(row.brandName, brandName))
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
      const fixture = fixtures.find((row) =>
        sameNamedFixture(row.fixtureName, match.fixtureName)
      );
      const date =
        matchDateKey(fixture?.date) ||
        matchDateKey(record.submittedAt) ||
        matchDateKey(record.signedAt) ||
        matchDateKey(record.createdAt);
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
