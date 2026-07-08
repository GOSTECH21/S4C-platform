import { supabase } from "../lib/supabase";

export async function getSupporters() {
  const { data, error } = await supabase
    .from("supporters")
    .select(`
      *,
      clubs(name)
    `)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data;
}

export async function createSupporter({
  fullName,
  email,
  favouriteClubId,
  country,
  city,
}: {
  fullName: string;
  email: string;
  favouriteClubId: string;
  country: string;
  city: string;
}) {
  const { data, error } = await supabase
    .from("supporters")
    .insert([
      {
        full_name: fullName,
        email,
        favourite_club_id: favouriteClubId,
        country,
        city,
        notification_enabled: true,
      },
    ])
    .select();

  if (error) throw error;

  return data;
}