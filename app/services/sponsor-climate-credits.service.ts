import { supabase } from "../lib/supabase";

export async function getSponsorClimateCredits() {
  const { data, error } = await supabase
    .from("sponsor_climate_credits")
    .select(`
    id,
    credit_name,
    total_value,
    available,
    sponsor_campaigns(
        campaign_name,
        sponsors(name)
    ),
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
export async function getAvailableClimateCredits() {
  const { data, error } = await supabase
    .from("sponsor_climate_credits")
    .select("*")
    .eq("status", "available")
    .gt("credits_issued", 0);

  if (error) throw error;

  return data ?? [];
}
export async function issueClimateCredits(
  campaign: any,
  payment: number
) {
  const credits = payment;
  const { data, error } = await supabase
  .from("sponsor_climate_credits")
  .insert([
   {
  sponsor_campaign_id: campaign.id,
  fixture_id: campaign.fixture_id ?? null,
  club_id: campaign.club_id ?? null,
  score_event_id: campaign.score_event_id ?? null,

  credit_name: `${campaign.campaign_name} Climate Credits`,
  credit_code: `CC-${campaign.id.replace(/-/g, "").substring(0, 8).toUpperCase()}`,
  credit_value: 1,
  credits_issued: credits,
  credits_claimed: 0,
  total_value: credits,
  status: "available",
}
])

  .select()
  .single();

if (error) {
  console.error("❌ Climate Credit Insert Error:", error);
  throw error;
}

console.log("✅ Climate Credit Record Created:", data);

return data;

}