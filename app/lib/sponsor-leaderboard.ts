import { brandsMatch } from "./climate-sponsors";
import {
  LEAD_CLIMATE_SPONSOR_LABEL,
  LOCAL_BUSINESS_SPONSOR_LABEL,
} from "./dual-sponsor";

export type SponsorDonationKind =
  | typeof LEAD_CLIMATE_SPONSOR_LABEL
  | typeof LOCAL_BUSINESS_SPONSOR_LABEL;

export type SponsorDonationEntry = {
  brandName: string;
  donationGbp: number;
  clubName?: string | null;
  logoUrl?: string | null;
  kind?: SponsorDonationKind;
};

export type SponsorLeaderboardRow = {
  rank: number;
  brandName: string;
  donationGbp: number;
  clubNames: string[];
  logoUrl: string | null;
  kind: SponsorDonationKind;
};

export type SponsorLeaderboardScope = "global" | "local";

export const DEFAULT_SPONSOR_LEADERBOARD_SCOPE: SponsorLeaderboardScope =
  "global";

export const SPONSOR_LEADERBOARD_SCOPE_OPTIONS: Array<{
  value: SponsorLeaderboardScope;
  label: string;
}> = [
  { value: "global", label: "Global Leaderboard" },
  { value: "local", label: "Local Leaderboard" },
];

export function leaderboardForScope(
  rows: SponsorLeaderboardRow[],
  scope: SponsorLeaderboardScope = DEFAULT_SPONSOR_LEADERBOARD_SCOPE
): SponsorLeaderboardRow[] {
  const kind =
    scope === "local"
      ? LOCAL_BUSINESS_SPONSOR_LABEL
      : LEAD_CLIMATE_SPONSOR_LABEL;
  return rows
    .filter((row) => row.kind === kind)
    .map((row, index) => ({ ...row, rank: index + 1 }));
}

function brandIndex(name: string, names: string[]): number {
  return names.findIndex((row) => brandsMatch(row, name));
}

/** Rank sponsors from the largest donation to the smallest. Same brand is merged. */
export function rankSponsorDonations(
  entries: SponsorDonationEntry[]
): SponsorLeaderboardRow[] {
  const brands: string[] = [];
  const byClub = new Map<string, Map<string, number>>();
  const clubLabels = new Map<string, string[]>();
  const logos = new Map<string, string | null>();
  const kinds = new Map<string, SponsorDonationKind>();

  for (const entry of entries) {
    const name = entry.brandName.trim();
    const amount = Math.max(0, Number(entry.donationGbp) || 0);
    if (!name || amount <= 0) continue;
    let index = brandIndex(name, brands);
    if (index < 0) {
      brands.push(name);
      index = brands.length - 1;
    }
    const key = brands[index];
    const club = entry.clubName?.trim() || "*";
    const clubMap = byClub.get(key) ?? new Map<string, number>();
    clubMap.set(club, Math.max(clubMap.get(club) ?? 0, amount));
    byClub.set(key, clubMap);
    if (entry.clubName?.trim()) {
      const listed = clubLabels.get(key) ?? [];
      if (!listed.some((row) => brandsMatch(row, entry.clubName!))) {
        clubLabels.set(key, [...listed, entry.clubName.trim()]);
      }
    }
    if (entry.logoUrl && !logos.get(key)) logos.set(key, entry.logoUrl);
    if (entry.kind === LEAD_CLIMATE_SPONSOR_LABEL) {
      kinds.set(key, LEAD_CLIMATE_SPONSOR_LABEL);
    } else if (!kinds.has(key)) {
      kinds.set(key, entry.kind ?? LOCAL_BUSINESS_SPONSOR_LABEL);
    }
  }

  return [...brands]
    .map((brandName) => {
      const amounts = [...(byClub.get(brandName)?.values() ?? [])];
      const donationGbp = amounts.reduce((sum, value) => sum + value, 0);
      return {
        brandName,
        donationGbp,
        clubNames: clubLabels.get(brandName) ?? [],
        logoUrl: logos.get(brandName) ?? null,
        kind: kinds.get(brandName) ?? LOCAL_BUSINESS_SPONSOR_LABEL,
      };
    })
    .sort((left, right) => {
      if (right.donationGbp !== left.donationGbp) {
        return right.donationGbp - left.donationGbp;
      }
      return left.brandName.localeCompare(right.brandName);
    })
    .map((row, index) => ({ ...row, rank: index + 1 }));
}
