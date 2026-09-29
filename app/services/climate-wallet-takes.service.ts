import { supabase } from "../lib/supabase";
import {
  recordLocalWalletTake,
  type ClimateWalletTake,
} from "../lib/climate-wallet-takes";
import { roundGbp } from "../lib/sponsor-wallet";

export async function persistClimateWalletTake(take: {
  amountGbp: number;
  projectName: string;
  brandName: string;
  clubName: string;
}): Promise<ClimateWalletTake> {
  const row = recordLocalWalletTake(take);
  try {
    await supabase.from("climate_wallet_takes").insert({
      amount_gbp: roundGbp(row.amountGbp),
      project_name: row.projectName,
      brand_name: row.brandName,
      club_name: row.clubName,
    });
  } catch {
    // Local ledger still moves the homepage bar if the hosted table is not live yet.
  }
  return row;
}
