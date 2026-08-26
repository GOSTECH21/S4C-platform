import { supabase } from "../lib/supabase";
import { createNotification } from "./notifications.service";

export async function processSponsorTrigger({
  fixtureId,
  clubId,
  scoreEventId,
}: {
  fixtureId: string;
  clubId: string;
  scoreEventId?: string;
}) {
  const { data: campaigns, error: campaignError } = await supabase
    .from("sponsorship_campaigns")
    .select("*")
    .eq("fixture_id", fixtureId)
    .eq("trigger_type", "Goal")
    .eq("status", "active");

  if (campaignError) throw campaignError;

  if (!campaigns || campaigns.length === 0) {
    return null;
  }

  const campaign = campaigns[0];

  const creditsIssued = Math.floor(
    campaign.funding_per_trigger / campaign.credit_value
  );

  const totalValue = creditsIssued * campaign.credit_value;

  const { data, error } = await supabase
    .from("sponsor_climate_credits")
    .insert([
      {
        sponsor_campaign_id: campaign.id,
        fixture_id: fixtureId,
        club_id: clubId,
        score_event_id: scoreEventId || null,
        credit_name: campaign.credit_name,
        credit_code: campaign.credit_code,
        credit_value: campaign.credit_value,
        credits_issued: creditsIssued,
        credits_claimed: 0,
        total_value: totalValue,
        status: "available",
      },
    ])
    .select();

  if (error) throw error;
await createNotification({
  title: "GOAL! Climate Credits unlocked",
  message: `${campaign.credit_name} (${campaign.credit_code}) are now available to claim.`,
  clubId,
  fixtureId,
  sponsorCreditId: data?.[0]?.id,
});
  return data?.[0];
}