/** My S4P Admin for a signed-in Philanthropist: clubs, matches, fans engaged. */

import { countryForClub } from "./pst";
import { formatFundingGbp } from "./platform-stats";
import {
  PHILANTHROPIST_WALLET_VOTE_GBP,
  type ClimateWallet,
} from "./sponsor-wallet";
import { brandsMatch, clubsMatch } from "./sponsor-dashboard";
import {
  matchesForClub,
  type CalendarMatch,
} from "./sporting-calendar";
import { formatKickoff, formatMatchDate } from "./upcoming-matches";
import {
  philanthropistDisplayName,
  type PhilanthropistRecord,
} from "./philanthropist";
import type { ClimateWalletTake } from "./climate-wallet-takes";

export const PHILANTHROPIST_SEASON_FROM = "2026-08-01";
export const PHILANTHROPIST_MATCH_LIMIT = 12;

export type PhilanthropistMatchStatus = "sponsoring" | "sponsored";

export type PhilanthropistClubRow = {
  clubName: string;
  country: string;
  giftGbp: number;
  giftLabel: string;
  fansEngaged: number;
};

export type PhilanthropistMatchRow = {
  id: string;
  clubName: string;
  fixtureName: string;
  date: string;
  when: string;
  league: string;
  venue: string;
  amountGbp: number;
  amountLabel: string;
  status: PhilanthropistMatchStatus;
  statusLabel: string;
};

export type PhilanthropistAdminSnapshot = {
  clubs: PhilanthropistClubRow[];
  matches: PhilanthropistMatchRow[];
  fansEngaged: number;
};

export function philanthropistGifts(
  record: PhilanthropistRecord | null | undefined,
  extras: PhilanthropistRecord[] = []
): PhilanthropistRecord[] {
  const rows = [...extras];
  if (record) rows.unshift(record);
  const seen = new Set<string>();
  const unique: PhilanthropistRecord[] = [];
  for (const row of rows) {
    const club = row.clubName.trim();
    if (!club || row.giftGbp < 1) continue;
    const key = club.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(row);
  }
  return unique;
}

export function fansEngagedFromTakes(
  takes: Array<Pick<ClimateWalletTake, "brandName" | "clubName">>,
  brandName: string,
  clubName?: string
): number {
  const brand = brandName.trim();
  if (!brand) return 0;
  return takes.filter((take) => {
    if (!brandsMatch(take.brandName, brand)) return false;
    if (clubName && !clubsMatch(take.clubName, clubName)) return false;
    return true;
  }).length;
}

export function fansEngagedFromAllocated(allocatedGbp: number): number {
  const vote = PHILANTHROPIST_WALLET_VOTE_GBP;
  if (vote <= 0) return 0;
  return Math.max(0, Math.round((Number(allocatedGbp) || 0) / vote));
}

export function fansEngagedForGift({
  brandName,
  clubName,
  takes = [],
  wallets = [],
}: {
  brandName: string;
  clubName: string;
  takes?: Array<Pick<ClimateWalletTake, "brandName" | "clubName">>;
  wallets?: Array<Pick<ClimateWallet, "brandName" | "clubName" | "allocatedGbp" | "kind">>;
}): number {
  const fromTakes = fansEngagedFromTakes(takes, brandName, clubName);
  const fromWallets = wallets
    .filter(
      (wallet) =>
        wallet.kind === "philanthropist" &&
        brandsMatch(wallet.brandName, brandName) &&
        clubsMatch(wallet.clubName, clubName)
    )
    .reduce(
      (sum, wallet) => sum + fansEngagedFromAllocated(Number(wallet.allocatedGbp) || 0),
      0
    );
  return Math.max(fromTakes, fromWallets);
}

function isoToday(now: Date | string = new Date()): string {
  const date = typeof now === "string" ? new Date(now) : now;
  if (Number.isNaN(date.getTime())) return "2026-11-16";
  return date.toISOString().slice(0, 10);
}

export function matchStatusForDate(
  date: string,
  now: Date | string = new Date()
): PhilanthropistMatchStatus {
  return date < isoToday(now) ? "sponsored" : "sponsoring";
}

export function philanthropistMatchesForClub(
  clubName: string,
  giftGbp: number,
  now: Date | string = new Date()
): PhilanthropistMatchRow[] {
  const club = clubName.trim();
  if (!club || giftGbp < 1) return [];
  const rows = matchesForClub(club, { fromDate: PHILANTHROPIST_SEASON_FROM });
  const today = isoToday(now);
  const upcoming = rows.filter((row) => row.date >= today);
  const past = rows.filter((row) => row.date < today);
  const selected = [
    ...past.slice(-4),
    ...upcoming.slice(0, PHILANTHROPIST_MATCH_LIMIT),
  ].slice(-PHILANTHROPIST_MATCH_LIMIT);
  return selected.map((row) => toMatchRow(row, club, giftGbp, now));
}

function toMatchRow(
  row: CalendarMatch,
  clubName: string,
  giftGbp: number,
  now: Date | string
): PhilanthropistMatchRow {
  const status = matchStatusForDate(row.date, now);
  const when = [
    formatMatchDate(row.date),
    formatKickoff(row.kickoff || null),
  ]
    .filter(Boolean)
    .join(" · ");
  return {
    id: row.id,
    clubName,
    fixtureName: row.fixtureName.replace(/\s+v\s+/i, " vs "),
    date: row.date,
    when,
    league: row.league,
    venue: row.venue || "TBC",
    amountGbp: giftGbp,
    amountLabel: formatFundingGbp(giftGbp),
    status,
    statusLabel: status === "sponsored" ? "Sponsored" : "Sponsoring",
  };
}

export function philanthropistAdminSnapshot({
  record,
  extras = [],
  takes = [],
  wallets = [],
  now = new Date(),
}: {
  record: PhilanthropistRecord | null | undefined;
  extras?: PhilanthropistRecord[];
  takes?: Array<Pick<ClimateWalletTake, "brandName" | "clubName">>;
  wallets?: Array<Pick<ClimateWallet, "brandName" | "clubName" | "allocatedGbp" | "kind">>;
  now?: Date | string;
}): PhilanthropistAdminSnapshot {
  const gifts = philanthropistGifts(record, extras);
  const clubs = gifts.map((gift) => {
    const brand = philanthropistDisplayName(gift);
    return {
      clubName: gift.clubName.trim(),
      country: countryForClub(gift.clubName),
      giftGbp: gift.giftGbp,
      giftLabel: `${formatFundingGbp(gift.giftGbp)} per match`,
      fansEngaged: fansEngagedForGift({
        brandName: brand,
        clubName: gift.clubName,
        takes,
        wallets,
      }),
    };
  });
  const matches = gifts.flatMap((gift) =>
    philanthropistMatchesForClub(gift.clubName, gift.giftGbp, now)
  );
  const fansEngaged = clubs.reduce((sum, club) => sum + club.fansEngaged, 0);
  return { clubs, matches, fansEngaged };
}
