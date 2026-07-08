import { processSponsorTrigger } from "./sponsor-trigger.service";
import { supabase } from "../lib/supabase";

export async function getFixtures() {
  const { data, error } = await supabase
    .from("fixtures")
    .select(`
      *,
      competitions(name),
      home_club:clubs!fixtures_home_club_id_fkey(name),
      away_club:clubs!fixtures_away_club_id_fkey(name)
    `)
    .order("fixture_date");

  if (error) throw error;

  return data;
}

export async function createFixture({
  competitionId,
  homeClubId,
  awayClubId,
  fixtureDate,
  kickoffTime,
  venue,
}: {
  competitionId: string;
  homeClubId: string;
  awayClubId: string;
  fixtureDate: string;
  kickoffTime: string;
  venue: string;
}) {
  const { data, error } = await supabase
    .from("fixtures")
    .insert([
      {
        competition_id: competitionId,
        home_club_id: homeClubId,
        away_club_id: awayClubId,
        fixture_date: fixtureDate,
        kickoff_time: kickoffTime,
        venue,
      },
    ])
    .select();

  if (error) throw error;

  return data;
}
export async function updateFixtureScore({
  fixtureId,
  homeScore,
  awayScore,
  clubId,
}: {
  fixtureId: string;
  homeScore: number;
  awayScore: number;
  clubId: string;
}) {
  const { data, error } = await supabase
    .from("fixtures")
    .update({
      home_score: homeScore,
      away_score: awayScore,
    })
    .eq("id", fixtureId)
    .select();
  if (error) throw error;

  await processSponsorTrigger({
    fixtureId: fixtureId,
    clubId: clubId,
  });

  return data;
}