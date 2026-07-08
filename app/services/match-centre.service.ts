import { supabase } from "../lib/supabase";

export async function getMatchCentreFixtures() {
  const { data, error } = await supabase
    .from("fixtures")
    .select(`
      *,
      competitions(name),
      home_club:clubs!fixtures_home_club_id_fkey(id, name),
      away_club:clubs!fixtures_away_club_id_fkey(id, name),
      sponsor_campaigns(
        *,
        sponsors(name)
      )
    `)
    .order("fixture_date", { ascending: false });

  if (error) throw error;

  return data;
}