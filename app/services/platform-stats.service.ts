import { supabase } from "../lib/supabase";
import { mergePlatformStats, type PlatformStats } from "../lib/platform-stats";

async function countRows(table: string): Promise<number> {
  const { count, error } = await supabase
    .from(table)
    .select("*", { count: "exact", head: true });
  if (error) return 0;
  return Number(count) || 0;
}

async function impactMomentsCreated(): Promise<number> {
  const { count, error: creditError } = await supabase
    .from("sponsor_climate_credits")
    .select("*", { count: "exact", head: true });
  if (!creditError && Number(count) > 0) return Number(count);

  const { data, error } = await supabase
    .from("fixtures")
    .select("home_score, away_score");
  if (error || !data) return 0;
  return data.reduce((sum, row) => {
    const fixture = row as { home_score?: number | null; away_score?: number | null };
    return (
      sum +
      Math.max(0, Math.round(Number(fixture.home_score) || 0)) +
      Math.max(0, Math.round(Number(fixture.away_score) || 0))
    );
  }, 0);
}

async function climateWalletTakesGbp(): Promise<number> {
  const { data, error } = await supabase
    .from("climate_wallet_takes")
    .select("amount_gbp");
  if (error || !data) return 0;
  return data.reduce(
    (sum, row) => sum + (Number((row as { amount_gbp?: number }).amount_gbp) || 0),
    0
  );
}

async function climateProjectsFunded(): Promise<number> {
  const { data, error } = await supabase
    .from("supporter_votes")
    .select("climate_project_id");
  if (error || !data) return 0;
  const ids = new Set(
    data
      .map((row) => String((row as { climate_project_id?: string }).climate_project_id ?? ""))
      .filter(Boolean)
  );
  return ids.size;
}

async function fansEngagedFromRoster(): Promise<number | null> {
  try {
    const { data, error } = await supabase.rpc("s4p_fans_engaged");
    if (error || data == null) return null;
    return Math.max(0, Math.round(Number(data) || 0));
  } catch {
    return null;
  }
}

function asFundingTakes(...amounts: Array<number | null | undefined>): number {
  return amounts.reduce<number>(
    (highest, amount) => Math.max(highest, Number(amount) || 0),
    0
  );
}

export async function loadPlatformStats(): Promise<PlatformStats> {
  const tableTakes = await climateWalletTakesGbp().catch(() => 0);
  const rosterFans = await fansEngagedFromRoster();

  try {
    const { data, error } = await supabase.rpc("platform_stats");
    if (!error && data && typeof data === "object") {
      const row = data as Record<string, unknown>;
      const hasLiveFundingKeys =
        "fundingMobilisedGbp" in row ||
        "funding_mobilised_gbp" in row ||
        "climateProjectsFunded" in row ||
        "climate_projects_funded" in row ||
        "impactMomentsCreated" in row ||
        "impact_moments_created" in row;
      if (hasLiveFundingKeys) {
        const rpcTakes = Number(row.walletTakesGbp ?? row.wallet_takes_gbp);
        const rpcIncludesTakes = "walletTakesGbp" in row || "wallet_takes_gbp" in row;
        const rpcFansAreRoster =
          row.fansCountedAsRoster === true ||
          row.fans_counted_as_roster === true;
        const rpcFans = Number(row.fansEngaged ?? row.fans_engaged) || 0;
        const takes = asFundingTakes(tableTakes, rpcIncludesTakes ? rpcTakes : 0);
        return mergePlatformStats({
          fundingMobilisedGbp: takes,
          walletTakesGbp: takes,
          impactMomentsCreated:
            Number(row.impactMomentsCreated ?? row.impact_moments_created) || 0,
          fansEngaged: rosterFans ?? (rpcFansAreRoster ? rpcFans : 0),
          sportsTeams:
            Number(
              row.sportsTeams ?? row.sports_teams ?? row.teamsInvolved ?? row.teams_involved
            ) || 0,
          climateProjectsFunded:
            Number(row.climateProjectsFunded ?? row.climate_projects_funded) || 0,
        });
      }
    }
  } catch {
    // Fall through to table counts when the RPC is not on the hosted DB yet.
  }

  const [sportsTeams, fundedProjects, moments] = await Promise.all([
    countRows("clubs"),
    climateProjectsFunded(),
    impactMomentsCreated().catch(() => 0),
  ]);

  return mergePlatformStats({
    fansEngaged: rosterFans ?? 0,
    sportsTeams,
    climateProjectsFunded: fundedProjects,
    fundingMobilisedGbp: tableTakes,
    walletTakesGbp: tableTakes,
    impactMomentsCreated: moments,
  });
}
