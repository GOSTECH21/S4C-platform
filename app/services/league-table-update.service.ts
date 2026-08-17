import { supabase } from "../lib/supabase";

export async function updateLeagueTable(fixtureId: string) {
  // Get the completed fixture
  const { data: fixture, error } = await supabase
    .from("fixtures")
    .select("*")
    .eq("id", fixtureId)
    .single();

  if (error) throw error;

  const homeGoals = fixture.home_score;
  const awayGoals = fixture.away_score;

  // Get both league table rows
  const { data: rows, error: tableError } = await supabase
    .from("league_table")
    .select("*")
    .eq("competition_id", fixture.competition_id)
    .in("club_id", [fixture.home_club_id, fixture.away_club_id]);

  if (tableError) throw tableError;

  const home = rows.find(r => r.club_id === fixture.home_club_id);
  const away = rows.find(r => r.club_id === fixture.away_club_id);

  if (!home || !away) {
    throw new Error("League table rows not found.");
  }

  home.played += 1;
  away.played += 1;

  home.goals_for += homeGoals;
  home.goals_against += awayGoals;

  away.goals_for += awayGoals;
  away.goals_against += homeGoals;

  if (homeGoals > awayGoals) {
    home.won += 1;
    away.lost += 1;

    home.points += 3;
  } else if (awayGoals > homeGoals) {
    away.won += 1;
    home.lost += 1;

    away.points += 3;
  } else {
    home.drawn += 1;
    away.drawn += 1;

    home.points += 1;
    away.points += 1;
  }

  home.goal_difference = home.goals_for - home.goals_against;
  away.goal_difference = away.goals_for - away.goals_against;

  await supabase
    .from("league_table")
    .update(home)
    .eq("id", home.id);

  await supabase
    .from("league_table")
    .update(away)
    .eq("id", away.id);

  return true;
}