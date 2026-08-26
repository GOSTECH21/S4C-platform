import { supabase } from "../lib/supabase";
import { getCurrentSponsor } from "./current-sponsor.service";

export type Campaign = {
  id: string;
  sponsor_id: string;
  fixture_id: string | null;
  campaign_name: string;
  trigger_type: string;
  funding_per_trigger: number;
  credit_name: string;
  credit_code: string;
  credit_value: number;
  max_budget: number;
  amount_committed: number;
  status: string;
  created_at: string;
};

export async function getSponsorCampaigns(): Promise<Campaign[]> {
  const sponsor = await getCurrentSponsor();

  const { data, error } = await supabase
    .from("sponsorship_campaigns")
    .select("*")
    .eq("sponsor_id", sponsor.id)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? []) as Campaign[];
}

export async function createDashboardCampaign({
  campaignName,
  triggerEvent,
  supporterReward,
  contribution,
  budget,
}: {
  campaignName: string;
  triggerEvent: string;
  supporterReward: string;
  contribution: number;
  budget: number;
}) {
  const sponsor = await getCurrentSponsor();

   const campaign = {
    sponsor_id: sponsor.id,
    fixture_id: null,
    campaign_name: campaignName,
    trigger_type: triggerEvent,
    funding_per_trigger: contribution,
    credit_name: supporterReward,
    credit_code: "GBP",
    credit_value: contribution,
    max_budget: budget,
    amount_committed: 0,
    status: "active",
  };

   const { data, error } = await supabase
    .from("sponsorship_campaigns")
    .insert(campaign)
    .select()
    .single();

    return data;
}

export async function deleteCampaign(id: string) {
  const sponsor = await getCurrentSponsor();

  const { error } = await supabase
    .from("sponsorship_campaigns")
    .delete()
    .eq("id", id)
    .eq("sponsor_id", sponsor.id);

  if (error) throw error;
}