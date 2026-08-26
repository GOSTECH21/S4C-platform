import { supabase } from "@/app/lib/supabase";
import { issueClimateCredits } from "./sponsor-climate-credits.service";
export async function settleCampaign(
  campaign: any,
  payment: number
) {
  const updatedGoals =
    (campaign.goals_triggered || 0) + 1;

  const updatedCredits =
    (campaign.climate_credits_issued || 0) + payment;
await issueClimateCredits(
  campaign,
  payment
);

console.log(
  `🌱 ${payment.toLocaleString()} Climate Credits Issued`
);
console.log("Updating campaign:");
console.log(campaign);
console.log("campaign.id =", campaign.id);
console.log("campaign.campaign_id =", campaign.campaign_id);
  const { data, error } = await supabase
    .from("sponsorship_campaigns")
    .update({
      goals_triggered: updatedGoals,
      climate_credits_issued: updatedCredits,
    })
    .eq("id", campaign.id)
    .select()
    .single();

  if (error) throw error;

  return data;
}