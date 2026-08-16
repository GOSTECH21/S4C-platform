import { supabase } from "../lib/supabase";

export async function getClubs() {
  const { data, error } = await supabase
    .from("clubs")
    .select(`
      *,
      competitions(name)
    `)
    .order("name");

  if (error) throw error;

  return data;
}

export async function getClubByName(name: string) {
  const { data, error } = await supabase
    .from("clubs")
    .select("*")
    .ilike("name", name)
    .single();

  if (error) throw error;

  return data;
}

export async function createClub({
  competitionId,
  name,
  shortName,
  country,
  city,
  stadium,
}: {
  competitionId: string;
  name: string;
  shortName: string;
  country: string;
  city: string;
  stadium: string;
}) {
  const { data, error } = await supabase
    .from("clubs")
    .insert([
      {
        competition_id: competitionId,
        name,
        short_name: shortName,
        country,
        city,
        stadium,
      },
    ])
    .select();

  if (error) throw error;

  return data;
}