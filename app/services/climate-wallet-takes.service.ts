import { supabase } from "../lib/supabase";
import {
  recordLocalWalletTake,
  type ClimateWalletTake,
} from "../lib/climate-wallet-takes";
import { roundGbp } from "../lib/sponsor-wallet";

function uuidOrNull(value?: string | null): string | null {
  if (!value) return null;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value
  )
    ? value
    : null;
}

export async function persistClimateWalletTake(take: {
  amountGbp: number;
  projectName: string;
  brandName: string;
  clubName: string;
  supporterId?: string | null;
}): Promise<ClimateWalletTake> {
  const row = recordLocalWalletTake(take);
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    let supporterId = uuidOrNull(take.supporterId);
    if (!supporterId && user?.id) {
      const existing = await supabase
        .from("supporters")
        .select("id")
        .eq("auth_user_id", user.id)
        .maybeSingle();
      supporterId = existing.data?.id ? String(existing.data.id) : null;
    }
    const payload = {
      amount_gbp: roundGbp(row.amountGbp),
      project_name: row.projectName,
      brand_name: row.brandName,
      club_name: row.clubName,
      supporter_id: supporterId,
      auth_user_id: user?.id ?? null,
      email: user?.email ?? null,
    };
    const { error } = await supabase.from("climate_wallet_takes").insert(payload);
    if (error) {
      await supabase.from("climate_wallet_takes").insert({
        amount_gbp: payload.amount_gbp,
        project_name: payload.project_name,
        brand_name: payload.brand_name,
        club_name: payload.club_name,
      });
    }
  } catch {
    // Local ledger still moves the homepage bar if the hosted table is not live yet.
  }
  return row;
}
