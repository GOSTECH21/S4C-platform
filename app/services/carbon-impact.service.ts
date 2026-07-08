import { supabase } from "../lib/supabase";

export async function getCarbonImpactTable() {
  const { data, error } = await supabase
    .from("club_impact_totals")
    .select("*")
    .order("impact_score", { ascending: false });

  if (error) throw error;

  return data;
}