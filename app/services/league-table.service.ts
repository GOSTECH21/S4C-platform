import { supabase } from "../lib/supabase";

export async function initializeLeagueTable(
  competitionId: string
) {
  const { data: clubs, error } = await supabase
    .from("clubs")
    .select("id")
    .eq("competition_id", competitionId);

  if (error) throw error;

  const rows = clubs.map((club) => ({
    competition_id: competitionId,
    club_id: club.id,

    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,

    goals_for: 0,
    goals_against: 0,
    goal_difference: 0,
    points: 0,
  }));
console.log("Clubs found:", clubs);
console.log("Rows to insert:", rows);
  const { error: insertError } = await supabase
    .from("league_table")
    .insert(rows);

  if (insertError) throw insertError;

  return rows;
}