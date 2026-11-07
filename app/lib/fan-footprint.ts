/** FanFootprint Analytics — Sustainability Director reference board. */

import { CURRENT_SEASON } from "./current-season";
import { ciltBaselineStanding } from "./cilt";

export const FAN_FOOTPRINT_NAME = "FanFootprint Analytics";
export const FAN_FOOTPRINT_STAMP = "fan-footprint-v1";
export const FAN_FOOTPRINT_FUTURE_NOTE =
  "Future reference for the Club Sustainability Director. This board models supporter match-day travel so you can plan ahead of live Matchrav journeys.";

export type FanFootprintTabId =
  | "core"
  | "match"
  | "scenario"
  | "compliance"
  | "commercial";

export const FAN_FOOTPRINT_TABS: Array<{
  id: FanFootprintTabId;
  label: string;
}> = [
  { id: "core", label: "Core Dashboard" },
  { id: "match", label: "Match Analysis" },
  { id: "scenario", label: "Scenario Simulator" },
  { id: "compliance", label: "Compliance" },
  { id: "commercial", label: "Commercial" },
];

export type FanFootprintMonth = {
  month: string;
  matches: number;
  tonnes: number;
};

export type FanFootprintMode = {
  id: string;
  label: string;
  share: number;
  avgMiles: number;
  color: string;
};

export type FanFootprintMatchRow = {
  fixture: string;
  date: string;
  tonnes: number;
  mode: string;
};

export type FanFootprintSponsorship = {
  fixture: string;
  amountGbp: number;
  savedAt: string;
  sponsorName: string | null;
};

export type FanFootprintReport = {
  clubName: string;
  season: string;
  leagueName: string;
  totalTonnes: number;
  matches: number;
  kgPerFan: number;
  vsLastSeasonPct: number;
  lowCarbonShare: number;
  leaguePosition: number;
  leagueSize: number;
  months: FanFootprintMonth[];
  modes: FanFootprintMode[];
  matchesDetail: FanFootprintMatchRow[];
  sponsorshipTotalGbp: number;
};

function clubHash(name: string): number {
  let hash = 2166136261;
  for (let i = 0; i < name.length; i += 1) {
    hash = Math.imul(hash ^ name.charCodeAt(i), 16777619);
  }
  return Math.abs(hash);
}

const MONTHS: Array<{ month: string; matches: number }> = [
  { month: "Aug", matches: 2 },
  { month: "Sep", matches: 3 },
  { month: "Oct", matches: 3 },
  { month: "Nov", matches: 2 },
  { month: "Dec", matches: 2 },
  { month: "Jan", matches: 3 },
];

export function fanFootprintReport(options: {
  clubName: string;
  sponsorships?: FanFootprintSponsorship[];
}): FanFootprintReport {
  const clubName = options.clubName.trim() || "Club";
  const hash = clubHash(clubName);
  const standing = ciltBaselineStanding(clubName);
  const totalTonnes = Math.round((3.6 + (hash % 18) / 10) * 10) / 10;
  const matches = MONTHS.reduce((sum, row) => sum + row.matches, 0);
  const weights = [0.35, 0.42, 0.48, 0.31, 0.28, 0.38];
  const weightSum = weights.reduce((sum, row) => sum + row, 0);
  const months = MONTHS.map((row, index) => ({
    month: row.month,
    matches: row.matches,
    tonnes: Math.round(((weights[index] ?? 0.3) / weightSum) * totalTonnes * 100) / 100,
  }));
  const lowCarbonShare = 48 + (hash % 21);
  const carShare = Math.max(28, 100 - lowCarbonShare - 23);
  const trainShare = Math.round(lowCarbonShare * 0.6);
  const busShare = Math.max(8, lowCarbonShare - trainShare - 8);
  const walkShare = Math.max(4, 100 - carShare - trainShare - busShare);
  const modes: FanFootprintMode[] = [
    { id: "car", label: "Car", share: carShare, avgMiles: 24 + (hash % 12), color: "#f87171" },
    { id: "train", label: "Train", share: trainShare, avgMiles: 38 + (hash % 16), color: "#60a5fa" },
    {
      id: "bus",
      label: "Bus/Coach",
      share: busShare,
      avgMiles: 28 + (hash % 10),
      color: "#fbbf24",
    },
    {
      id: "walk",
      label: "Walk/Cycle",
      share: walkShare,
      avgMiles: 2 + (hash % 4),
      color: "#34d399",
    },
  ];
  const sponsorships = options.sponsorships ?? [];
  const matchesDetail: FanFootprintMatchRow[] =
    sponsorships.length > 0
      ? sponsorships.map((row, index) => ({
          fixture: row.fixture,
          date: row.savedAt.slice(0, 10),
          tonnes: months[index % months.length]?.tonnes ?? 0.3,
          mode: modes[index % modes.length]?.label ?? "Car",
        }))
      : months.flatMap((row, index) =>
          Array.from({ length: row.matches }, (_, matchIndex) => ({
            fixture: `${clubName} Match ${index + 1}.${matchIndex + 1}`,
            date: `2026-${String(8 + index).padStart(2, "0")}-0${matchIndex + 1}`,
            tonnes: Math.round((row.tonnes / row.matches) * 100) / 100,
            mode: modes[matchIndex % modes.length]?.label ?? "Car",
          }))
        );

  return {
    clubName,
    season: CURRENT_SEASON,
    leagueName: standing?.league ?? "League",
    totalTonnes,
    matches,
    kgPerFan: Math.round((10 + (hash % 40) / 10) * 10) / 10,
    vsLastSeasonPct: -1 * (8 + (hash % 15)),
    lowCarbonShare,
    leaguePosition: standing?.position ?? 8,
    leagueSize: standing?.size ?? 20,
    months,
    modes,
    matchesDetail,
    sponsorshipTotalGbp: sponsorships.reduce(
      (sum, row) => sum + Math.max(0, Number(row.amountGbp) || 0),
      0
    ),
  };
}

export function formatFanFootprintTonnes(value: number): string {
  return `${value.toLocaleString("en-GB", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })}t`;
}

export function formatFanFootprintKg(value: number): string {
  return `${value.toLocaleString("en-GB", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })}kg`;
}
