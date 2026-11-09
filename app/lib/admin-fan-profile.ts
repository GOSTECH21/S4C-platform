import { adminFanProfilePath } from "./routes";
import {
  p4pCategoryById,
  predictionCategoryIds,
  type P4pPrediction,
} from "./predict-for-planet";
import { TRAVEL_MODES, formatTravelKgCo2e } from "./match-day-travel";
import { roundGbp } from "./sponsor-wallet";
import type { RegisteredFan } from "./s4p-admin";

export const ADMIN_FAN_PROFILE_STAMP = "admin-fan-profile-v1";

export type StaffFanProject = {
  projectName: string;
  clubName: string;
  amountGbp: number | null;
  source: "vote" | "wallet" | "p4p";
};

export type StaffFanDonation = {
  projectName: string;
  clubName: string;
  brandName: string;
  amountGbp: number;
  source: "wallet" | "p4p";
  at: string;
};

export type StaffFanPrediction = {
  id: string;
  clubName: string;
  fixtureName: string;
  categoryLabels: string[];
  projectName: string;
  engagementGbp: number;
  correct: boolean | null;
  at: string;
};

export type StaffFanMatchrav = {
  id: string;
  clubName: string;
  fixtureName: string;
  origin: string;
  outboundMode: string;
  returnMode: string;
  totalKg: number;
  status: string;
  at: string;
};

export type StaffFanProfile = {
  fan: RegisteredFan;
  clubs: string[];
  projects: StaffFanProject[];
  donations: StaffFanDonation[];
  totalDonationsGbp: number;
  predictions: StaffFanPrediction[];
  matchrav: StaffFanMatchrav[];
};

export function staffFanProfileHref(id: string) {
  return adminFanProfilePath(id);
}

export function totalFanDonationsGbp(
  donations: Array<{ amountGbp?: number | null }>
) {
  return roundGbp(
    donations.reduce(
      (sum, row) => sum + Math.max(0, Number(row.amountGbp) || 0),
      0
    )
  );
}

export function p4pCategoryLabels(
  input: Pick<P4pPrediction, "categoryId" | "categoryIds">
) {
  return predictionCategoryIds(input).map(
    (id) => p4pCategoryById(id)?.label ?? id
  );
}

export function travelModeLabel(mode: string | null | undefined) {
  const id = String(mode ?? "").trim();
  return TRAVEL_MODES.find((row) => row.id === id)?.label ?? id;
}

export function formatFanDonationGbp(amount: number) {
  return `£${roundGbp(amount).toLocaleString("en-GB", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatFanMatchravKg(kg: number) {
  return formatTravelKgCo2e(kg);
}

export function uniqueProfileClubs(names: string[]) {
  const seen = new Map<string, string>();
  for (const name of names) {
    const trimmed = name.trim();
    if (!trimmed || trimmed === "No club selected") continue;
    const key = trimmed.toLowerCase();
    if (!seen.has(key)) seen.set(key, trimmed);
  }
  return [...seen.values()];
}

export function emptyStaffFanProfile(fan: RegisteredFan): StaffFanProfile {
  return {
    fan,
    clubs: uniqueProfileClubs([fan.clubName]),
    projects: [],
    donations: [],
    totalDonationsGbp: 0,
    predictions: [],
    matchrav: [],
  };
}

export function buildStaffFanProfile(input: {
  fan: RegisteredFan;
  clubs?: string[];
  projects?: StaffFanProject[];
  donations?: StaffFanDonation[];
  predictions?: StaffFanPrediction[];
  matchrav?: StaffFanMatchrav[];
}): StaffFanProfile {
  const donations = input.donations ?? [];
  return {
    fan: input.fan,
    clubs: uniqueProfileClubs([
      ...(input.clubs ?? []),
      input.fan.clubName,
    ]),
    projects: input.projects ?? [],
    donations,
    totalDonationsGbp: totalFanDonationsGbp(donations),
    predictions: input.predictions ?? [],
    matchrav: input.matchrav ?? [],
  };
}

export function sampleStaffFanProfile(): StaffFanProfile {
  return buildStaffFanProfile({
    fan: {
      id: "sample-fan",
      fullName: "Alex Mobile",
      email: "alexmobilefan@gmail.com",
      clubName: "Rangers",
      authUserId: "auth-alex-mobile",
    },
    clubs: ["Rangers"],
    projects: [
      {
        projectName: "Global Schools Solar",
        clubName: "Rangers",
        amountGbp: 12.5,
        source: "wallet",
      },
      {
        projectName: "Wee Spoke Hub",
        clubName: "Rangers",
        amountGbp: 0.4,
        source: "p4p",
      },
    ],
    donations: [
      {
        projectName: "Global Schools Solar",
        clubName: "Rangers",
        brandName: "Lead Climate Sponsor",
        amountGbp: 12.5,
        source: "wallet",
        at: "2026-11-09T12:00:00.000Z",
      },
      {
        projectName: "Wee Spoke Hub",
        clubName: "Rangers",
        brandName: "P4P",
        amountGbp: 0.4,
        source: "p4p",
        at: "2026-11-09T15:10:00.000Z",
      },
    ],
    predictions: [
      {
        id: "p4p-1",
        clubName: "Rangers",
        fixtureName: "Rangers vs Celtic",
        categoryLabels: ["Corner awarded", "Yellow card issued", "Foul committed"],
        projectName: "Wee Spoke Hub",
        engagementGbp: 0.1,
        correct: null,
        at: "2026-11-09T15:05:00.000Z",
      },
    ],
    matchrav: [
      {
        id: "trip-1",
        clubName: "Rangers",
        fixtureName: "Rangers vs Celtic",
        origin: "G1 2AA",
        outboundMode: "Train",
        returnMode: "Train",
        totalKg: 8.4,
        status: "confirmed",
        at: "2026-11-09T10:20:00.000Z",
      },
    ],
  });
}
