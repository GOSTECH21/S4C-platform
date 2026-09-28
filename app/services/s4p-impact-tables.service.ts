import { formatFundingGbp } from "../lib/platform-stats";
import { DEFAULT_WALLET_VOTE_GBP } from "../lib/sponsor-wallet";
import { adminDisplayName } from "../lib/s4p-admin";
import {
  IMPACT_TABLE_SPONSORS,
  IMPACT_TABLES,
  publicFanName,
  rankImpactRows,
  overallClimateImpactLeagueRows,
  type ImpactTableBoard,
} from "../lib/s4p-impact-tables";
import { supabase } from "../lib/supabase";
import { loadSponsorLeaderboard } from "./sponsor-leaderboard.service";

async function loadCistRows() {
  try {
    const rows = await loadSponsorLeaderboard();
    return rankImpactRows(
      rows.map((row) => ({
        name: row.brandName,
        metric: formatFundingGbp(row.donationGbp),
        sortValue: row.donationGbp,
      }))
    );
  } catch {
    return [];
  }
}

async function loadCiftRows() {
  try {
    const { data: votes, error: voteError } = await supabase
      .from("supporter_votes")
      .select("supporter_id");
    if (voteError || !votes?.length) return [];

    const counts = new Map<string, number>();
    for (const row of votes) {
      const id = String((row as { supporter_id?: string }).supporter_id ?? "");
      if (!id) continue;
      counts.set(id, (counts.get(id) ?? 0) + 1);
    }
    if (counts.size === 0) return [];

    const ids = [...counts.keys()];
    const { data: fans, error: fanError } = await supabase
      .from("supporters")
      .select("id, full_name, email")
      .in("id", ids);
    if (fanError) return [];

    const names = new Map(
      (fans ?? []).map((row) => {
        const fan = row as { id?: string; full_name?: string | null; email?: string | null };
        return [
          String(fan.id ?? ""),
          publicFanName(adminDisplayName(fan.full_name, fan.email)),
        ] as const;
      })
    );

    return rankImpactRows(
      [...counts.entries()].map(([id, votesCast]) => ({
        name: names.get(id) || "Fan",
        metric: formatFundingGbp(votesCast * DEFAULT_WALLET_VOTE_GBP),
        sortValue: votesCast,
      }))
    );
  } catch {
    return [];
  }
}

export async function loadS4pImpactTables(): Promise<ImpactTableBoard[]> {
  const [cist, cift] = await Promise.all([loadCistRows(), loadCiftRows()]);
  const byId = {
    cilt: overallClimateImpactLeagueRows(),
    cist,
    cift,
  };
  return IMPACT_TABLES.map((meta) => ({
    ...meta,
    sponsoredBy: IMPACT_TABLE_SPONSORS[meta.id],
    rows: byId[meta.id],
  }));
}
