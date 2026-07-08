import { supabase } from "../lib/supabase";

export async function getSponsorClimateCredits() {
  const { data, error } = await supabase
    .from("sponsor_climate_credits")
    .select(`
      *,
      sponsor_campaigns(
        campaign_name,
        sponsors(name)
      ),
      clubs(id,name),
      fixtures(
        fixture_date,
        home_club:clubs!fixtures_home_club_id_fkey(name),
        away_club:clubs!fixtures_away_club_id_fkey(name)
      )
    `)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data;
}