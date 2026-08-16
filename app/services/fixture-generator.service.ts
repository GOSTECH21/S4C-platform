import { supabase } from "../lib/supabase";

export async function generateFixtures(
  competitionId: string,
  startDate: string
) {
  const { data: clubs, error } = await supabase
    .from("clubs")
    .select("*")
    .eq("competition_id", competitionId)
    .order("name");

  if (error) throw error;

  console.log(`Found ${clubs.length} clubs`);

  return clubs;
}