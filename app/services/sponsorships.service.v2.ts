import { supabase } from "@/app/lib/supabase/browser";
import { getCurrentSponsor } from "./sponsors.service.v2";

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
    console.error("CREATE SPONSORSHIP ERROR:", error);
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
    console.error("GET SPONSORSHIPS ERROR:", error);
    throw error;
  }

  return data;
}

export async function getSponsorship(id: string) {
  const sponsor = await getCurrentSponsor();

  const { data, error } = await supabase
    .from("sponsorships")
    .select("*")
    .eq("id", id)
    .eq("sponsor_id", sponsor.id)
    .single();

  if (error) {
    console.error("GET SPONSORSHIP ERROR:", error);
    throw error;
  }

  return data;
}

export async function updateSponsorship(
  id: string,
  updates: Partial<CreateSponsorshipInput>
) {
  const sponsor = await getCurrentSponsor();

  const { data, error } = await supabase
    .from("sponsorships")
    .update({
      product_id: updates.productId,
      sport: updates.sport,
      competition: updates.competition,
      fixture: updates.fixture,
      sponsored_team: updates.sponsoredTeam,
      trigger: updates.trigger,
      climate_impact_value: updates.climateImpactValue,
      marketing_budget: updates.marketingBudget,
    })
    .eq("id", id)
    .eq("sponsor_id", sponsor.id)
    .select()
    .single();

  if (error) {
    console.error("UPDATE SPONSORSHIP ERROR:", error);
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
    console.error("DELETE SPONSORSHIP ERROR:", error);
    throw error;
  }
}