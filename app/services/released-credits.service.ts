import { supabase } from "../lib/supabase";

export async function getReleasedCredits() {
  const { data, error } = await supabase
    .from("sponsor_climate_credits")
    .select(`
      *,
      clubs(id, name),
      sponsor_campaigns(
        id,
        campaign_name,
        sponsors(name)
      )
    `)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data;
}