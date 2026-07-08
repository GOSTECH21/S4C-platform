import { supabase } from "../lib/supabase";

export async function getSponsorCampaigns() {
  const { data, error } = await supabase
    .from("sponsor_campaigns")
    .select(`
      *,
      sponsors(name),
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

export async function createSponsorCampaign({
  sponsorId,
  fixtureId,
  campaignName,
  triggerType,
  fundingPerTrigger,
  creditName,
  creditCode,
  creditValue,
  maxBudget,
}: {
  sponsorId: string;
  fixtureId: string;
  campaignName: string;
  triggerType: string;
  fundingPerTrigger: number;
  creditName: string;
  creditCode: string;
  creditValue: number;
  maxBudget: number;
}) {
  const { data, error } = await supabase
    .from("sponsor_campaigns")
    .insert([
      {
        sponsor_id: sponsorId,
        fixture_id: fixtureId,
        campaign_name: campaignName,
        trigger_type: triggerType,
        funding_per_trigger: fundingPerTrigger,
        credit_name: creditName,
        credit_code: creditCode,
        credit_value: creditValue,
        max_budget: maxBudget,
      },
    ])
    .select();

  if (error) throw error;

  return data;
}