import { supabase } from "@/app/lib/supabase";

export async function createSponsorshipCampaign(campaign: any) {
  const { data, error } = await supabase
    .from("sponsorship_campaigns")
    .insert([campaign])
    .select()
    .single();

  if (error) throw error;

  return data;
}