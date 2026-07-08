import { supabase } from "../lib/supabase";

export async function getCompetitions() {
  const { data, error } = await supabase
    .from("competitions")
    .select(`
      *,
      sports (
        name
      )
    `)
    .order("name");

  if (error) throw error;

  return data;
}

export async function createCompetition({
  sportId,
  name,
  country,
  season,
}: {
  sportId: string;
  name: string;
  country: string;
  season: string;
}) {
  const { data, error } = await supabase
    .from("competitions")
    .insert([
      {
        sport_id: sportId,
        name,
        country,
        season,
      },
    ])
    .select();

  if (error) throw error;

  return data;
}