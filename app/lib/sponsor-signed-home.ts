/** Post-sign-off sponsor home: Match-Day calendar, funded projects, CIST highlight. */

import {
  brandsMatch,
  displayLockFixture,
  isNamedFixture,
  type MatchDayClubLock,
} from "./climate-sponsors";
import {
  isWalletFundingLocked,
  resolveCommittedMatchFunding,
} from "./sponsor-completion-flow";
import { DEFAULT_WALLET_VOTE_GBP } from "./sponsor-wallet";
import { formatFundingGbp } from "./platform-stats";
import {
  rankImpactRows,
  type ImpactTableRow,
} from "./s4p-impact-tables";
import type { FolderOffer, SignedSponsorship } from "./sponsor-dashboard";
import { votedProjectsOnSignedOffer } from "./sponsor-dashboard";

export const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export type SponsoredMatchListing = {
  date: string;
  clubName: string;
  fixtureName: string;
  headline: string;
  offerId: string;
};

export type CalendarCell = {
  key: string;
  date: string | null;
  day: number | null;
  inMonth: boolean;
};

export type FundedSponsorProject = {
  id: string;
  name: string;
  clubName: string;
  matchTitle: string;
  description: string | null;
  fundedGbp: number;
  fanFunded: boolean;
};

export function matchDateKey(
  value: string | Date | null | undefined
): string | null {
  if (!value) return null;
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return null;
    return value.toISOString().slice(0, 10);
  }
  const raw = String(value).trim();
  const iso = raw.slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso;
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString().slice(0, 10);
}

export function fixtureLabelFromOffer(matchTitle: string, clubName: string): string {
  const title = String(matchTitle ?? "")
    .replace(/\s+climate campaign$/i, "")
    .trim();
  if (/\sv\s/i.test(title) || /\svs\.?\s/i.test(title)) return title;
  return title || `${clubName} Match`;
}

export function sponsoredMatchesFromSigned(
  signed: SignedSponsorship[]
): SponsoredMatchListing[] {
  return signed
    .map((row) => {
      const date =
        matchDateKey(row.offer.matchDate) ||
        matchDateKey(row.offer.postedAt) ||
        matchDateKey(row.signature.signedAt);
      if (!date) return null;
      return {
        date,
        clubName: row.offer.clubName,
        fixtureName: fixtureLabelFromOffer(row.offer.matchTitle, row.offer.clubName),
        headline: row.offer.headline,
        offerId: row.offer.id,
      };
    })
    .filter((row): row is SponsoredMatchListing => Boolean(row))
    .sort((left, right) =>
      left.date === right.date
        ? left.fixtureName.localeCompare(right.fixtureName)
        : left.date.localeCompare(right.date)
    );
}

export function hasCompletedMatchSponsorship(
  lock: MatchDayClubLock | null | undefined,
  wallet?: { commitmentFeeGbp?: number | null } | null
): boolean {
  if (!lock?.clubName?.trim()) return false;
  if (!isNamedFixture(displayLockFixture(lock))) return false;
  if (isWalletFundingLocked(lock)) return true;
  return Number(wallet?.commitmentFeeGbp) > 0;
}

export function sponsoredMatchesFromLock(
  lock: MatchDayClubLock | null | undefined
): SponsoredMatchListing[] {
  if (!lock?.clubName?.trim()) return [];
  const fixture = displayLockFixture(lock);
  if (!isNamedFixture(fixture)) return [];
  const date =
    matchDateKey(lock.fixtureDate) ||
    matchDateKey(lock.lockedAt) ||
    matchDateKey(lock.fundingLockedAt);
  if (!date) return [];
  return [
    {
      date,
      clubName: lock.clubName,
      fixtureName: fixture,
      headline: `${lock.clubName} · ${fixture}`,
      offerId: `lock:${lock.brandKey}:${date}`,
    },
  ];
}

export function sponsoredMatchesForHome(
  signed: SignedSponsorship[],
  lock?: MatchDayClubLock | null
): SponsoredMatchListing[] {
  const fromSigned = sponsoredMatchesFromSigned(signed);
  if (fromSigned.length > 0) return fromSigned;
  return sponsoredMatchesFromLock(lock);
}

export function committedGbpForSignedHome({
  signedExpenditureGbp,
  lock,
  wallet,
}: {
  signedExpenditureGbp?: number | null;
  lock?: MatchDayClubLock | null;
  wallet?: {
    commitmentFeeGbp?: number | null;
    gbpPerGoal?: number | null;
    maximumSponsorshipGbp?: number | null;
  } | null;
}): number {
  const signedAmount = Number(signedExpenditureGbp) || 0;
  if (signedAmount > 0) return signedAmount;
  const funding = resolveCommittedMatchFunding({ lock, wallet });
  return funding.baseAmount || funding.maxAmount || 0;
}

export function sponsoredDates(matches: SponsoredMatchListing[]): Set<string> {
  return new Set(matches.map((row) => row.date));
}

export function matchesOnDate(
  matches: SponsoredMatchListing[],
  date: string | null | undefined
): SponsoredMatchListing[] {
  const key = matchDateKey(date);
  if (!key) return [];
  return matches.filter((row) => row.date === key);
}

export function mondayWeekdayIndex(date: Date): number {
  return (date.getUTCDay() + 6) % 7;
}

export function monthCells(year: number, month: number): CalendarCell[] {
  const first = new Date(Date.UTC(year, month, 1));
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const lead = mondayWeekdayIndex(first);
  const cells: CalendarCell[] = [];
  for (let i = 0; i < lead; i += 1) {
    cells.push({ key: `lead-${i}`, date: null, day: null, inMonth: false });
  }
  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    cells.push({ key: date, date, day, inMonth: true });
  }
  while (cells.length % 7 !== 0) {
    cells.push({
      key: `tail-${cells.length}`,
      date: null,
      day: null,
      inMonth: false,
    });
  }
  return cells;
}

export function monthLabel(year: number, month: number): string {
  return new Date(Date.UTC(year, month, 1)).toLocaleString("en-GB", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function defaultCalendarMonth(
  matches: SponsoredMatchListing[],
  now = new Date()
): { year: number; month: number } {
  const latest = [...matches].sort((left, right) =>
    right.date.localeCompare(left.date)
  )[0];
  if (latest) {
    const [year, month] = latest.date.split("-").map(Number);
    return { year, month: month - 1 };
  }
  return { year: now.getUTCFullYear(), month: now.getUTCMonth() };
}

export function shiftMonth(
  year: number,
  month: number,
  delta: number
): { year: number; month: number } {
  const next = new Date(Date.UTC(year, month + delta, 1));
  return { year: next.getUTCFullYear(), month: next.getUTCMonth() };
}

export function fundedClimateProjectsFromOffers(
  offers: Array<
    Pick<FolderOffer, "clubId" | "clubName" | "matchTitle" | "projects">
  >,
  votedByClub: Record<string, Array<{ id: string; fundedGbp?: number | null }>> = {}
): FundedSponsorProject[] {
  const byId = new Map<string, FundedSponsorProject>();
  for (const offer of offers) {
    const voted = votedProjectsOnSignedOffer(
      offer,
      votedByClub[offer.clubId] ?? []
    );
    const votedIds = new Set(voted.map((project) => project.id));
    const votedFunded = new Map(
      voted.map((project) => [project.id, Number(project.fundedGbp) || 0])
    );
    for (const project of offer.projects) {
      const fanFunded = votedIds.has(project.id);
      const fromVotes = votedFunded.get(project.id) ?? 0;
      const fromOffer = Number(project.fundedGbp) || 0;
      const fundedGbp = fanFunded
        ? Math.max(fromVotes, fromOffer, DEFAULT_WALLET_VOTE_GBP)
        : fromOffer;
      const current = byId.get(project.id);
      if (!current) {
        byId.set(project.id, {
          id: project.id,
          name: project.name,
          clubName: offer.clubName,
          matchTitle: fixtureLabelFromOffer(offer.matchTitle, offer.clubName),
          description: project.description ?? null,
          fundedGbp,
          fanFunded,
        });
        continue;
      }
      current.fundedGbp += fundedGbp;
      current.fanFunded = current.fanFunded || fanFunded;
    }
  }
  return [...byId.values()].sort((left, right) => {
    if (right.fundedGbp !== left.fundedGbp) return right.fundedGbp - left.fundedGbp;
    return left.name.localeCompare(right.name);
  });
}

export function fundedClimateProjectsFromSigned(
  signed: SignedSponsorship[],
  votedByClub: Record<string, Array<{ id: string; fundedGbp?: number | null }>> = {}
): FundedSponsorProject[] {
  return fundedClimateProjectsFromOffers(
    signed.map((row) => row.offer),
    votedByClub
  );
}

export function fundedClimateProjectsForHome(
  signed: SignedSponsorship[],
  pending: Array<
    Pick<FolderOffer, "clubId" | "clubName" | "matchTitle" | "projects">
  > = [],
  votedByClub: Record<string, Array<{ id: string; fundedGbp?: number | null }>> = {}
): FundedSponsorProject[] {
  const fromSigned = fundedClimateProjectsFromSigned(signed, votedByClub);
  if (fromSigned.length > 0) return fromSigned;
  return fundedClimateProjectsFromOffers(pending, votedByClub);
}

export function cistRowsForSponsor({
  rows,
  brandName,
  ownFundingGbp,
}: {
  rows: Array<{ name: string; donationGbp?: number; funding?: string; sortValue?: number }>;
  brandName: string;
  ownFundingGbp: number;
}): Array<ImpactTableRow & { highlighted: boolean }> {
  const entries = rows.map((row) => ({
    name: row.name,
    metric: row.funding ?? formatFundingGbp(Number(row.donationGbp) || 0),
    sortValue:
      Number(row.sortValue) || Number(row.donationGbp) || 0,
    impactMoments: "0",
    funding: row.funding ?? formatFundingGbp(Number(row.donationGbp) || 0),
    climateImpact: "—",
  }));
  const ownName = brandName.trim();
  const existing = ownName
    ? entries.find((row) => brandsMatch(row.name, ownName))
    : undefined;
  if (existing) {
    if (ownFundingGbp > existing.sortValue) {
      existing.sortValue = ownFundingGbp;
      existing.metric = formatFundingGbp(ownFundingGbp);
      existing.funding = formatFundingGbp(ownFundingGbp);
    }
  } else if (ownName) {
    entries.push({
      name: ownName,
      metric: formatFundingGbp(ownFundingGbp),
      sortValue: ownFundingGbp,
      impactMoments: "0",
      funding: formatFundingGbp(ownFundingGbp),
      climateImpact: "—",
    });
  }
  return rankImpactRows(entries).map((row) => ({
    ...row,
    highlighted: brandsMatch(row.name, brandName),
  }));
}

export function showsSignedSponsorHome(
  signedCount: number,
  newSponsorship: boolean,
  completedMatch = false
): boolean {
  return (signedCount > 0 || completedMatch) && !newSponsorship;
}
