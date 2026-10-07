import { supabase } from "../lib/supabase";
import { isRemovedSponsorBrand } from "../lib/climate-sponsors";

export async function getSponsors() {
  const { data, error } = await supabase
    .from("sponsors")
    .select("*")
    .order("name");

  if (error) throw error;

  return (data ?? []).filter(
    (row) => !isRemovedSponsorBrand(String((row as { name?: string }).name ?? ""))
  );
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
  if (isRemovedSponsorBrand(name)) {
    throw new Error("This brand is not available as a Climate Sponsor.");
  }

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