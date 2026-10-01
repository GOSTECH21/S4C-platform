import { brandsMatch } from "./climate-sponsors";
import { clubsMatch } from "./sponsor-dashboard";
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
  clubDonations: Array<{ clubName: string; amount: number }>;
  logoUrl: string | null;
  kind: SponsorDonationKind;
};

export type SponsorLeaderboardScope = "global" | "local" | "affiliates";

export const DEFAULT_SPONSOR_LEADERBOARD_SCOPE: SponsorLeaderboardScope =
  "global";

export const SPONSOR_LEADERBOARD_SCOPE_OPTIONS: Array<{
  value: SponsorLeaderboardScope;
  label: string;
}> = [
  { value: "global", label: "Global Leaderboard" },
  { value: "local", label: "Local Leaderboard" },
  { value: "affiliates", label: "Affiliates" },
];

export type SponsorIndustryCategory =
  | "restaurants"
  | "car-companies"
  | "hotels"
  | "fashion-retailers"
  | "others";

export type SponsorLeaderboardCategory = "all" | SponsorIndustryCategory;

export const DEFAULT_SPONSOR_LEADERBOARD_CATEGORY: SponsorLeaderboardCategory =
  "all";

export const SPONSOR_LEADERBOARD_CATEGORY_OPTIONS: Array<{
  value: SponsorLeaderboardCategory;
  label: string;
}> = [
  { value: "all", label: "All Categories" },
  { value: "restaurants", label: "Restaurants" },
  { value: "car-companies", label: "Car Companies" },
  { value: "hotels", label: "Hotels" },
  { value: "fashion-retailers", label: "Fashion Retailers" },
  { value: "others", label: "Others" },
];

const RESTAURANT_BRANDS = [
  "Mash Tun",
  "Kokobean Cafe",
  "Kokobean",
  "Top Cellar",
  "Interval",
  "Edinburgh Roasters",
];
const CAR_COMPANY_BRANDS = [
  "BMW",
  "Braidview Garage",
  "Broadview Garage",
];
const HOTEL_BRANDS = ["Marriott", "Hilton", "Premier Inn", "Travelodge"];
const FASHION_RETAILER_BRANDS = ["Puma", "Nike", "Adidas"];

function listedBrand(name: string, listed: string[]): boolean {
  return listed.some((row) => brandsMatch(name, row));
}

export function sponsorIndustryCategory(
  brandName: string
): SponsorIndustryCategory {
  if (listedBrand(brandName, RESTAURANT_BRANDS)) return "restaurants";
  if (listedBrand(brandName, CAR_COMPANY_BRANDS)) return "car-companies";
  if (listedBrand(brandName, HOTEL_BRANDS)) return "hotels";
  if (listedBrand(brandName, FASHION_RETAILER_BRANDS)) return "fashion-retailers";
  const key = brandName.trim().toLowerCase();
  if (
    /\b(cafe|café|restaurant|pub|bar|bistro|grill|diner|bakery|kitchen|tavern|eatery)\b/.test(
      key
    )
  ) {
    return "restaurants";
  }
  if (
    /\b(garage|motors|motor|automotive|auto|bmw|toyota|ford|mercedes|volkswagen|honda|tesla|audi|nissan)\b/.test(
      key
    )
  ) {
    return "car-companies";
  }
  if (/\b(hotel|hotels|inn|resort|marriott|hilton|hyatt|travelodge)\b/.test(key)) {
    return "hotels";
  }
  if (
    /\b(fashion|clothing|apparel|boutique|nike|adidas|puma|zara|gucci|burberry|primark)\b/.test(
      key
    )
  ) {
    return "fashion-retailers";
  }
  return "others";
}

export function sponsorIndustryCategoryLabel(brandName: string): string {
  const category = sponsorIndustryCategory(brandName);
  return (
    SPONSOR_LEADERBOARD_CATEGORY_OPTIONS.find((option) => option.value === category)
      ?.label ?? "Others"
  );
}

function clubIsChosen(clubName: string, chosenClubs: string[]): boolean {
  return chosenClubs.some((chosen) => clubsMatch(clubName, chosen));
}

export function leaderboardForScope(
  rows: SponsorLeaderboardRow[],
  scope: SponsorLeaderboardScope = DEFAULT_SPONSOR_LEADERBOARD_SCOPE,
  affiliateClubs: string[] = []
): SponsorLeaderboardRow[] {
  if (scope === "affiliates") {
    return rows
      .map((row) => {
        const matched = row.clubDonations.filter((donation) =>
          clubIsChosen(donation.clubName, affiliateClubs)
        );
        const clubNames =
          matched.length > 0
            ? matched.map((donation) => donation.clubName)
            : row.clubNames.filter((club) => clubIsChosen(club, affiliateClubs));
        const donationGbp =
          matched.length > 0
            ? matched.reduce((sum, donation) => sum + donation.amount, 0)
            : clubNames.length > 0
              ? row.donationGbp
              : 0;
        return { ...row, clubNames, donationGbp };
      })
      .filter((row) => row.donationGbp > 0 && row.clubNames.length > 0)
      .sort((left, right) => {
        if (right.donationGbp !== left.donationGbp) {
          return right.donationGbp - left.donationGbp;
        }
        return left.brandName.localeCompare(right.brandName);
      })
      .map((row, index) => ({ ...row, rank: index + 1 }));
  }
  const kind =
    scope === "local"
      ? LOCAL_BUSINESS_SPONSOR_LABEL
      : LEAD_CLIMATE_SPONSOR_LABEL;
  return rows
    .filter((row) => row.kind === kind)
    .map((row, index) => ({ ...row, rank: index + 1 }));
}

export function leaderboardForCategory(
  rows: SponsorLeaderboardRow[],
  category: SponsorLeaderboardCategory = DEFAULT_SPONSOR_LEADERBOARD_CATEGORY
): SponsorLeaderboardRow[] {
  if (category === "all") return rows;
  return rows
    .filter((row) => sponsorIndustryCategory(row.brandName) === category)
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
        clubDonations: [...(byClub.get(brandName)?.entries() ?? [])]
          .filter(([club]) => club !== "*")
          .map(([clubName, amount]) => ({ clubName, amount })),
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
