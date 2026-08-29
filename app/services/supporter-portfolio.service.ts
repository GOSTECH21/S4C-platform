import { supabase } from "@/app/lib/supabase";

export async function getSupporterAllocations(supporterId: string) {
  const { data, error } = await supabase
    .from("credit_allocations")
    .select(`
      *,
      supporter_claims!inner(
        supporter_id
      ),
      climate_assets(
        name,
        country,
        expected_co2e_avoided_tonnes
      )
    `)
    .eq("supporter_claims.supporter_id", supporterId);

  if (error) throw error;

  return data;
}