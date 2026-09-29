import { supabase } from "../lib/supabase";
import { mergePlatformStats, type PlatformStats } from "../lib/platform-stats";

async function countRows(table: string): Promise<number> {
  const { count, error } = await supabase
    .from(table)
    .select("*", { count: "exact", head: true });
  if (error) return 0;
  return Number(count) || 0;
}

async function signedOfferFundingGbp(): Promise<number> {
  const [{ data: offers }, { data: signatures }] = await Promise.all([
    supabase.from("sponsor_match_offers").select("id, sponsorship_amount_gbp"),
    supabase.from("sponsor_offer_signatures").select("offer_id"),
  ]);
  const signedIds = new Set(
    (signatures ?? []).map((row) => String((row as { offer_id?: string }).offer_id ?? ""))
  );
  signedIds.delete("");
  return (offers ?? []).reduce((sum, row) => {
    const offer = row as { id?: string; sponsorship_amount_gbp?: number | null };
    if (!offer.id || !signedIds.has(String(offer.id))) return sum;
    return sum + (Number(offer.sponsorship_amount_gbp) || 0);
  }, 0);
}

async function climateCreditFundingGbp(): Promise<number> {
  const { data, error } = await supabase
    .from("sponsor_climate_credits")
    .select("total_value");
  if (error || !data) return 0;
  return data.reduce(
    (sum, row) => sum + (Number((row as { total_value?: number }).total_value) || 0),
    0
  );
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

function withTakes(
  stats: Partial<PlatformStats>,
  extraTakes: number
): PlatformStats {
  return mergePlatformStats({
    ...stats,
    fundingMobilisedGbp: (Number(stats.fundingMobilisedGbp) || 0) + extraTakes,
    walletTakesGbp: (Number(stats.walletTakesGbp) || 0) + extraTakes,
  });
}

export async function loadPlatformStats(): Promise<PlatformStats> {
  const takes = await climateWalletTakesGbp().catch(() => 0);

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
        return withTakes(
          {
            fundingMobilisedGbp:
              Number(row.fundingMobilisedGbp ?? row.funding_mobilised_gbp) || 0,
            impactMomentsCreated:
              Number(row.impactMomentsCreated ?? row.impact_moments_created) || 0,
            fansEngaged: Number(row.fansEngaged ?? row.fans_engaged) || 0,
            sportsTeams:
              Number(
                row.sportsTeams ?? row.sports_teams ?? row.teamsInvolved ?? row.teams_involved
              ) || 0,
            climateProjectsFunded:
              Number(row.climateProjectsFunded ?? row.climate_projects_funded) || 0,
            walletTakesGbp: rpcIncludesTakes ? rpcTakes || 0 : 0,
          },
          rpcIncludesTakes ? 0 : takes
        );
      }
    }
  } catch {
    // Fall through to table counts when the RPC is not on the hosted DB yet.
  }

  const [
    fansEngaged,
    sportsTeams,
    fundedProjects,
    offerFunding,
    creditFunding,
    moments,
  ] = await Promise.all([
    countRows("supporters"),
    countRows("clubs"),
    climateProjectsFunded(),
    signedOfferFundingGbp().catch(() => 0),
    climateCreditFundingGbp().catch(() => 0),
    impactMomentsCreated().catch(() => 0),
  ]);

  return withTakes(
    {
      fansEngaged,
      sportsTeams,
      climateProjectsFunded: fundedProjects,
      fundingMobilisedGbp: offerFunding + creditFunding,
      impactMomentsCreated: moments,
    },
    takes
  );
}
