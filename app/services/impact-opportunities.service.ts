import { supabase } from "../lib/supabase";

export async function getImpactOpportunities() {
  const { data, error } = await supabase
  .from("impact_opportunities")
  .select("*")
  .order("created_at", { ascending: false });

  if (error) throw error;

  return data;
}
export async function createImpactOpportunity({
  fixtureId,
  clubId,
  title,
  description,
}: {
  fixtureId: string;
  clubId: string;
  title: string;
  description: string;
}) {
  const { data, error } = await supabase
    .from("impact_opportunities")
    .insert([
      {
        fixture_id: fixtureId,
        club_id: clubId,
        title,
        description,
        status: "Open",
        funding_target: 8000,
        amount_funded: 0,
      },
    ])
    .select();

  if (error) throw error;

  return data;
}