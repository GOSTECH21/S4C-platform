import { currentSeasonTeamCount } from "./current-season";

export const PLATFORM_STATS_POLL_MS = 15_000;

export type PlatformStats = {
  fundingMobilisedGbp: number;
  walletTakesGbp: number;
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
  walletTakesGbp = 0,
  impactMomentsCreated = 0,
  fansEngaged = 0,
  sportsTeams: _ignoredClubRowCount = 0,
  teamsInvolved: _ignoredTeamsInvolved = 0,
  climateProjectsFunded = 0,
  climateProjects = 0,
}: Partial<PlatformStats> & {
  teamsInvolved?: number;
  climateProjects?: number;
} = {}): PlatformStats {
  void _ignoredClubRowCount;
  void _ignoredTeamsInvolved;
  return {
    fundingMobilisedGbp: asGbp(fundingMobilisedGbp),
    walletTakesGbp: asGbp(walletTakesGbp),
    impactMomentsCreated: asCount(impactMomentsCreated),
    fansEngaged: asCount(fansEngaged),
    sportsTeams: currentSeasonTeamCount(),
    climateProjectsFunded: asCount(climateProjectsFunded || climateProjects),
  };
}

export function formatStatCount(value: number): string {
  return Math.max(0, Math.round(Number(value) || 0)).toLocaleString("en-GB");
}

export function formatFundingGbp(value: number): string {
  const amount = asGbp(value);
  const hasPence = Math.round(amount * 100) % 100 !== 0;
  return `£${amount.toLocaleString("en-GB", {
    minimumFractionDigits: hasPence ? 2 : 0,
    maximumFractionDigits: 2,
  })}`;
}
