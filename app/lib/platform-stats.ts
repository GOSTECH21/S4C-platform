import { currentSeasonTeamCount } from "./current-season";

export const PLATFORM_STATS_POLL_MS = 15_000;

export type PlatformStats = {
  fundingMobilisedGbp: number;
  impactMomentsCreated: number;
  fansEngaged: number;
  sportsTeams: number;
  climateProjectsFunded: number;
};

function asCount(value: unknown): number {
  return Math.max(0, Math.round(Number(value) || 0));
}

function asGbp(value: unknown): number {
  return Math.max(0, Math.round((Number(value) || 0) * 100) / 100);
}

export function mergePlatformStats({
  fundingMobilisedGbp = 0,
  impactMomentsCreated = 0,
  fansEngaged = 0,
  sportsTeams = 0,
  teamsInvolved = 0,
  climateProjectsFunded = 0,
  climateProjects = 0,
}: Partial<PlatformStats> & {
  teamsInvolved?: number;
  climateProjects?: number;
} = {}): PlatformStats {
  return {
    fundingMobilisedGbp: asGbp(fundingMobilisedGbp),
    impactMomentsCreated: asCount(impactMomentsCreated),
    fansEngaged: asCount(fansEngaged),
    sportsTeams: Math.max(
      asCount(sportsTeams || teamsInvolved),
      currentSeasonTeamCount()
    ),
    climateProjectsFunded: asCount(climateProjectsFunded || climateProjects),
  };
}

export function formatStatCount(value: number): string {
  return Math.max(0, Math.round(Number(value) || 0)).toLocaleString("en-GB");
}

export function formatFundingGbp(value: number): string {
  const pounds = Math.max(0, Math.round(Number(value) || 0));
  return `£${pounds.toLocaleString("en-GB")}`;
}
