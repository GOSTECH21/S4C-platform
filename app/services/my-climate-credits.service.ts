import { supabase } from "../lib/supabase";

export async function getMyClimateCredits(supporterId: string) {
  const { data, error } = await supabase
    .from("supporter_claims")
    .select(`
      *,
      sponsor_climate_credits(
        *,
        clubs(id, name),
        sponsor_campaigns(
          campaign_name,
          sponsors(name),
          fixtures(
            fixture_date,
            home_club:clubs!fixtures_home_club_id_fkey(name),
            away_club:clubs!fixtures_away_club_id_fkey(name)
          )
        )
      )
    `)
    .eq("supporter_id", supporterId)
    .eq("claim_status", "successful")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    throw error;
  }

  return data;
}