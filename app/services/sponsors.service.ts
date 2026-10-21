import { supabase } from "../lib/supabase";
import {
  isRemovedSponsorBrand,
  isRemovedSponsorIdentity,
} from "../lib/climate-sponsors";

export async function getSponsors() {
  const { data, error } = await supabase
    .from("sponsors")
    .select("*")
    .order("name");

  if (error) throw error;

  return (data ?? []).filter((row) => {
    const record = row as { name?: string; website?: string };
    return (
      !isRemovedSponsorBrand(String(record.name ?? "")) &&
      !isRemovedSponsorIdentity(record.website)
    );
  });
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
  if (isRemovedSponsorIdentity(website)) {
    throw new Error("This sponsor account has been removed from the platform.");
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