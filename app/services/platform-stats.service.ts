import { supabase } from "../lib/supabase";
import {
  catalogClimateProjectCount,
  catalogCo2Avoided,
  mergePlatformStats,
  type PlatformStats,
} from "../lib/platform-stats";
import { PARTNER_MATCH_DAY_CATALOG } from "../lib/sccan-catalog";

async function countRows(table: string): Promise<number> {
  const { count, error } = await supabase
    .from(table)
    .select("*", { count: "exact", head: true });
  if (error) return 0;
  return Number(count) || 0;
}

async function sumProjectCo2(): Promise<number> {
  const { data, error } = await supabase
    .from("climate_projects")
    .select("name, estimated_co2");
  if (error || !data) return catalogCo2Avoided();
  const byName = new Map<string, number>();
  for (const project of PARTNER_MATCH_DAY_CATALOG) {
    byName.set(project.name.toLowerCase(), Number(project.estimated_co2) || 0);
  }
  for (const row of data as Array<{ name?: string; estimated_co2?: number | null }>) {
    const name = String(row.name ?? "").trim().toLowerCase();
    const tonnes = Number(row.estimated_co2) || 0;
    if (!name) continue;
    byName.set(name, Math.max(byName.get(name) ?? 0, tonnes));
  }
  return [...byName.values()].reduce((sum, tonnes) => sum + tonnes, 0);
}

export async function loadPlatformStats(): Promise<PlatformStats> {
  try {
    const { data, error } = await supabase.rpc("platform_stats");
    if (!error && data && typeof data === "object") {
      const row = data as Record<string, unknown>;
      return mergePlatformStats({
        fansEngaged: Number(row.fansEngaged ?? row.fans_engaged) || 0,
        teamsInvolved: Number(row.teamsInvolved ?? row.teams_involved) || 0,
        climateProjects: Number(row.climateProjects ?? row.climate_projects) || 0,
        co2Avoided: Number(row.co2Avoided ?? row.co2_avoided) || 0,
      });
    }
  } catch {
    // Fall through to table counts when the RPC is not on the hosted DB yet.
  }

  const [fansEngaged, teamsInvolved, climateProjects, co2Avoided] =
    await Promise.all([
      countRows("supporters"),
      countRows("clubs"),
      countRows("climate_projects").then((count) =>
        Math.max(count, catalogClimateProjectCount())
      ),
      sumProjectCo2(),
    ]);

  return mergePlatformStats({
    fansEngaged,
    teamsInvolved,
    climateProjects,
    co2Avoided,
  });
}
