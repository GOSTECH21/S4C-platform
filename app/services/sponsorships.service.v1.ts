import { supabase } from "@/app/lib/supabase/browser";

export type CreateSponsorshipInput = {
  productId: string;
  sport: string;
  competition: string;
  fixture: string;
  sponsoredTeam: string;
  trigger: string;
  climateImpactValue: number;
  marketingBudget: number;
};

export async function createSponsorship(
  input: CreateSponsorshipInput
) {
  
  const sponsorship = {
    sponsor_id: "",
    product_id: input.productId,
    sport: input.sport,
    competition: input.competition,
    fixture: input.fixture,
    sponsored_team: input.sponsoredTeam,
    trigger: input.trigger,
    climate_impact_value: input.climateImpactValue,
    marketing_budget: input.marketingBudget,
    amount_committed: 0,
    status: "active",
  };

  const { data, error } = await supabase
    .from("sponsorships")
    .insert(sponsorship)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function getMySponsorships() {
 
  const { data, error } = await supabase
    .from("sponsorships")
    .select("*")
        .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data;
}

export async function deleteSponsorship(id: string) {
  
  const { error } = await supabase
    .from("sponsorships")
    .delete()
    .eq("id", id)
    
  if (error) {
    throw error;
  }
}