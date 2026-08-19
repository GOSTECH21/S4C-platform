import { supabase } from "@/app/lib/supabase/browser";
import { getCurrentSponsor } from "./sponsors.service";

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
  const sponsor = await getCurrentSponsor();

  const sponsorship = {
    sponsor_id: sponsor.id,
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
  const sponsor = await getCurrentSponsor();

  const { data, error } = await supabase
    .from("sponsorships")
    .select("*")
    .eq("sponsor_id", sponsor.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data;
}

export async function deleteSponsorship(id: string) {
  const sponsor = await getCurrentSponsor();

  const { error } = await supabase
    .from("sponsorships")
    .delete()
    .eq("id", id)
    .eq("sponsor_id", sponsor.id);

  if (error) {
    throw error;
  }
}