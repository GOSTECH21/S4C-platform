import { supabase } from "@/app/lib/supabase";
import { getCurrentSponsor } from "./current-sponsor.service";

export async function createSponsorshipCampaign(campaign: any) {
  const { data, error } = await supabase
    .from("sponsorship_campaigns")
    .insert([campaign])
    .select()
    .single();

  if (error) {
  console.error("❌ Find Matching Campaign Error:", error);
  throw error;
}

return data;
}
export async function findMatchingCampaign(
  fixture: string,
  sponsoredEvent: string
) {
    console.group("🔍 Searching Sponsorship Campaigns");

console.log("Fixture:", fixture);
console.log("Sponsored Event:", sponsoredEvent);
 const { data, error } = await supabase
  .from("sponsorship_campaigns")
  .select("*");

console.log("Supabase error:", error);
console.table(data);

  if (error) {
  console.error("❌ Find Matching Campaign Error:", error);
  throw error;
}

console.log("🔍 Matching Campaign Search");
console.log("Fixture:", fixture);
console.log("Sponsored Event:", sponsoredEvent);
console.log("Campaigns Found:", data?.length ?? 0);

if (data && data.length > 0) {
  console.table(data);
} else {
  console.log("No matching campaigns found.");
}

return data;
}
export async function getSponsorCampaigns() {
  const sponsor = await getCurrentSponsor();

  console.log("================================");
  console.log("Current Sponsor:");
  console.log(sponsor);
  console.log("Sponsor ID:", sponsor.id);
  console.log("================================");
  const { data, error } = await supabase
    .from("sponsorship_campaigns")
    .select("*")
    .eq("sponsor_id", sponsor.id)
    .order("created_at", { ascending: false });

  console.log("Campaigns returned:");
  console.table(data);

  if (error) {
    console.error("Get Sponsor Campaigns Error:", error);
    throw error;
  }
console.log("Supabase error:", error);
console.log("Supabase data:", data);
  console.log("Returned campaigns:", data);
return data ?? [];
}