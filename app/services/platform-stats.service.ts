import { supabase } from "../lib/supabase";
import {
  compactIdentity,
  emailKey,
  engagedFanCount,
  storedFullName,
  type RegisteredFan,
} from "../lib/s4p-admin";
import { currentSeasonTeamCount } from "../lib/current-season";
import { mergePlatformStats, type PlatformStats } from "../lib/platform-stats";

async function impactMomentsCreated(): Promise<number> {
  const { count, error } = await supabase
    .from("score_events")
    .select("*", { count: "exact", head: true });
  if (!error && count != null) return Number(count) || 0;
  return 0;
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

async function fansEngagedFromTables(): Promise<number | null> {
  try {
    const [supporters, directors, sponsors] = await Promise.all([
      supabase
        .from("supporters")
        .select("id, full_name, email, auth_user_id, clubs(name)"),
      supabase
        .from("club_accounts")
        .select("first_name, last_name, email, auth_user_id"),
      supabase.from("sponsors").select("website, user_id"),
    ]);
    if (supporters.error || !supporters.data) return null;

    const fans: RegisteredFan[] = supporters.data.map((row) => {
      const club = (row as { clubs?: { name?: string } | null }).clubs;
      return {
        id: String(row.id),
        fullName: String(row.full_name ?? "").trim() || "Unnamed fan",
        email: String(row.email ?? "").trim() || "No email",
        clubName: String(club?.name ?? "").trim() || "No club selected",
        authUserId: row.auth_user_id ? String(row.auth_user_id) : null,
      };
    });

    const mappedDirectors = (directors.error ? [] : directors.data ?? []).map((row) => ({
      email: String(row.email ?? "").trim(),
      fullName: storedFullName(
        String(row.first_name ?? ""),
        String(row.last_name ?? "")
      ),
    }));
    const mappedSponsors = (sponsors.error ? [] : sponsors.data ?? []).map((row) => ({
      contactName: String(row.website ?? "").trim() || "No contact name",
      userId: row.user_id ? String(row.user_id) : null,
    }));

    if (mappedDirectors.length === 0 && mappedSponsors.length === 0) {
      return null;
    }

    return engagedFanCount(fans, {
      emails: mappedDirectors.map((row) => emailKey(row.email)).filter(Boolean),
      authUserIds: mappedSponsors
        .map((row) => row.userId)
        .filter((id): id is string => Boolean(id)),
      contactKeys: [
        ...mappedDirectors.map((row) => compactIdentity(row.fullName)),
        ...mappedSponsors.map((row) => compactIdentity(row.contactName)),
      ].filter((key) => key.length >= 6),
    });
  } catch {
    return null;
  }
}

async function loadFansEngaged(
  rpcFans = 0,
  rpcFansAreRoster = false
): Promise<number> {
  const fromSql = await fansEngagedFromRoster();
  if (fromSql != null) return fromSql;
  const fromTables = await fansEngagedFromTables();
  if (fromTables != null) return fromTables;
  return rpcFansAreRoster ? rpcFans : 0;
}

function asFundingTakes(...amounts: Array<number | null | undefined>): number {
  return amounts.reduce<number>(
    (highest, amount) => Math.max(highest, Number(amount) || 0),
    0
  );
}

export async function loadPlatformStats(): Promise<PlatformStats> {
  const tableTakes = await climateWalletTakesGbp().catch(() => 0);

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
        const moments = await impactMomentsCreated().catch(() => 0);
        return mergePlatformStats({
          fundingMobilisedGbp: takes,
          walletTakesGbp: takes,
          impactMomentsCreated: moments,
          fansEngaged: await loadFansEngaged(rpcFans, rpcFansAreRoster),
          sportsTeams: currentSeasonTeamCount(),
          climateProjectsFunded:
            Number(row.climateProjectsFunded ?? row.climate_projects_funded) || 0,
        });
      }
    }
  } catch {
    // Fall through to table counts when the RPC is not on the hosted DB yet.
  }

  const [fundedProjects, moments, fansEngaged] = await Promise.all([
    climateProjectsFunded(),
    impactMomentsCreated().catch(() => 0),
    loadFansEngaged(),
  ]);

  return mergePlatformStats({
    fansEngaged,
    sportsTeams: currentSeasonTeamCount(),
    climateProjectsFunded: fundedProjects,
    fundingMobilisedGbp: tableTakes,
    walletTakesGbp: tableTakes,
    impactMomentsCreated: moments,
  });
}
