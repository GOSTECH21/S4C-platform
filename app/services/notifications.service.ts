import { supabase } from "../lib/supabase";

export async function createNotification({
  title,
  message,
  clubId,
  fixtureId,
  sponsorCreditId,
}: {
  title: string;
  message: string;
  clubId: string;
  fixtureId: string;
  sponsorCreditId?: string;
}) {
  const { data, error } = await supabase
    .from("notifications")
    .insert([
      {
        title,
        message,
        club_id: clubId,
        fixture_id: fixtureId,
        sponsor_credit_id: sponsorCreditId || null,
      },
    ])
    .select();

  if (error) throw error;

  return data;
}

export async function getNotifications() {
  const { data, error } = await supabase
    .from("notifications")
    .select(`
      *,
      clubs(name),
      fixtures(
        home_club:clubs!fixtures_home_club_id_fkey(name),
        away_club:clubs!fixtures_away_club_id_fkey(name)
      )
    `)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data;
}