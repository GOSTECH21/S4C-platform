import { supabase } from "../lib/supabase";

export async function getSponsors() {
  const { data, error } = await supabase
    .from("sponsors")
    .select("*")
    .order("name");

  if (error) throw error;

  return data;
}

export async function createSponsor({
  name,
  industry,
  website,
}: {
  name: string;
  industry: string;
  website: string;
}) {
  const { data, error } = await supabase
    .from("sponsors")
    .insert([
      {
        name,
        industry,
        website,
      },
    ])
    .select();

  if (error) throw error;

  return data;
}