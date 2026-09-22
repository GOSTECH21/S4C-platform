import { treesEquivalentFromCo2 } from "./impact";
import { currentSeasonTeamCount } from "./current-season";
import { PARTNER_MATCH_DAY_CATALOG } from "./sccan-catalog";

export const PLATFORM_STATS_POLL_MS = 15_000;

export type PlatformStats = {
  fansEngaged: number;
  teamsInvolved: number;
  climateProjects: number;
  co2Avoided: number;
  treesPlanted: number;
};

export function catalogClimateProjectCount(): number {
  const names = new Set(
    PARTNER_MATCH_DAY_CATALOG.map((project) => project.name.toLowerCase())
  );
  return names.size;
}

export function catalogCo2Avoided(): number {
  return PARTNER_MATCH_DAY_CATALOG.reduce(
    (sum, project) => sum + (Number(project.estimated_co2) || 0),
    0
  );
}

export function mergePlatformStats({
  fansEngaged = 0,
  teamsInvolved = 0,
  climateProjects = 0,
  co2Avoided = 0,
}: Partial<PlatformStats> = {}): PlatformStats {
  const co2 = Math.max(0, Number(co2Avoided) || 0) || catalogCo2Avoided();
  return {
    fansEngaged: Math.max(0, Math.round(Number(fansEngaged) || 0)),
    teamsInvolved: Math.max(
      Math.round(Number(teamsInvolved) || 0),
      currentSeasonTeamCount()
    ),
    climateProjects: Math.max(
      Math.round(Number(climateProjects) || 0),
      catalogClimateProjectCount()
    ),
    co2Avoided: co2,
    treesPlanted: treesEquivalentFromCo2(co2),
  };
}

export function formatStatCount(value: number): string {
  return Math.max(0, Math.round(Number(value) || 0)).toLocaleString("en-GB");
}
