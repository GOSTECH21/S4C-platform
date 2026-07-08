import { supabase } from "../lib/supabase";

export async function allocateCredit({
  supporterClaimId,
  climateAssetId,
  amount = 1,
}: {
  supporterClaimId: string;
  climateAssetId: string;
  amount?: number;
}) {
  const { data: asset, error: assetError } = await supabase
    .from("climate_assets")
    .select("amount_funded")
    .eq("id", climateAssetId)
    .single();

  if (assetError) throw assetError;

  const { data, error } = await supabase
    .from("credit_allocations")
    .insert([
      {
        supporter_claim_id: supporterClaimId,
        climate_asset_id: climateAssetId,
        amount,
      },
    ])
    .select();

  if (error) throw error;

  const { error: updateAssetError } = await supabase
    .from("climate_assets")
    .update({
      amount_funded: Number(asset.amount_funded || 0) + amount,
    })
    .eq("id", climateAssetId);

  if (updateAssetError) throw updateAssetError;

  const { error: updateClaimError } = await supabase
    .from("supporter_claims")
    .update({
      allocation_status: "allocated",
    })
    .eq("id", supporterClaimId);

  if (updateClaimError) throw updateClaimError;

  return data;
}