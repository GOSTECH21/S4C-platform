import { supabase } from "../lib/supabase";

type Club = {
  id: string;
  name: string;
  stadium: string;
};

/*
|--------------------------------------------------------------------------
| Round Robin Fixture Generator
|--------------------------------------------------------------------------
*/

function generateRoundRobin(clubs: Club[]) {
  const teams = [...clubs];

  // Add a BYE if odd number of clubs
  if (teams.length % 2 !== 0) {
    teams.push({
      id: "BYE",
      name: "BYE",
      stadium: "",
    });
  }

  const rounds: any[] = [];
  const totalRounds = teams.length - 1;
  const half = teams.length / 2;

  for (let round = 0; round < totalRounds; round++) {
    const matches = [];

    for (let i = 0; i < half; i++) {
      const home = teams[i];
      const away = teams[teams.length - 1 - i];

      if (home.id !== "BYE" && away.id !== "BYE") {
        matches.push({
          home,
          away,
        });
      }
    }

    rounds.push(matches);

    const fixed = teams[0];

    const rotating = teams.slice(1);

    rotating.unshift(rotating.pop()!);

    teams.splice(1, teams.length - 1, ...rotating);

    teams[0] = fixed;
  }

  return rounds;
}

/*
|--------------------------------------------------------------------------
| Generate Fixtures
|--------------------------------------------------------------------------
*/

export async function generateFixtures({
  competitionId,
  season,
  startDate,
  kickoffTime,
}: {
  competitionId: string;
  season: string;
  startDate: string;
  kickoffTime: string;
}) {

  // Load clubs

  const { data: clubs, error } = await supabase
    .from("clubs")
    .select("*")
    .eq("competition_id", competitionId)
    .order("name");

  if (error) throw error;

  // Prevent duplicate seasons

  const { count, error: countError } = await supabase
    .from("fixtures")
    .select("*", {
      count: "exact",
      head: true,
    })
    .eq("competition_id", competitionId);

  if (countError) throw countError;

  if ((count ?? 0) > 0) {
    throw new Error(
      "Fixtures already exist for this competition. Delete them first before generating a new season."
    );
  }

  console.log("Competition:", competitionId);
  console.log("Season:", season);
  console.log("Start:", startDate);
  console.log("Kickoff:", kickoffTime);
  console.log("Clubs:", clubs.length);

  const rounds = generateRoundRobin(clubs as Club[]);
    const fixtures: any[] = [];

  // FIRST LEG

  for (let round = 0; round < rounds.length; round++) {
    const fixtureDate = new Date(startDate);
    fixtureDate.setDate(fixtureDate.getDate() + round * 7);

    for (const match of rounds[round]) {
      fixtures.push({
        competition_id: competitionId,

        home_club_id: match.home.id,
        away_club_id: match.away.id,

        fixture_date: fixtureDate.toISOString().split("T")[0],

        kickoff_time: kickoffTime,

        venue: match.home.stadium,

        season,
      });
    }
  }

  // SECOND LEG (reverse home/away)

  const firstLegRounds = rounds.length;

  for (let round = 0; round < rounds.length; round++) {
    const fixtureDate = new Date(startDate);

    fixtureDate.setDate(
      fixtureDate.getDate() + (firstLegRounds + round) * 7
    );

    for (const match of rounds[round]) {
      fixtures.push({
        competition_id: competitionId,

        home_club_id: match.away.id,
        away_club_id: match.home.id,

        fixture_date: fixtureDate.toISOString().split("T")[0],

        kickoff_time: kickoffTime,

        venue: match.away.stadium,

        season,
      });
    }
  }

  console.log("Fixtures Generated:", fixtures.length);

  const { error: insertError } = await supabase
    .from("fixtures")
    .insert(fixtures);

  if (insertError) throw insertError;

  console.log(`${fixtures.length} fixtures saved.`);

  return fixtures;
}

/*
|--------------------------------------------------------------------------
| Delete Fixtures
|--------------------------------------------------------------------------
*/

export async function deleteFixtures(
  competitionId: string
) {
  const { error } = await supabase
    .from("fixtures")
    .delete()
    .eq("competition_id", competitionId);

  if (error) throw error;

  return true;
}