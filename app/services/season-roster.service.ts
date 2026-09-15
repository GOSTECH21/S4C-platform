import {
  CURRENT_SEASON,
  CURRENT_SEASON_LEAGUES,
  LEAGUE_COUNTRY,
  LEAGUE_SPORT,
  canonicalLeagueName,
  findClubOnRoster,
  isCurrentSeasonLeagueFixture,
  normalizeSeasonName,
} from "../lib/current-season";
import { supabase } from "../lib/supabase";

type ClubRow = {
  id: string;
  name: string;
  competition_id: string | null;
};

type CompetitionRow = {
  id: string;
  name: string;
  sport_id: string | null;
  country: string | null;
  season: string | null;
};

let syncPromise: Promise<void> | null = null;

export function ensureCurrentSeasonRoster(): Promise<void> {
  if (!syncPromise) {
    syncPromise = syncCurrentSeasonRoster().catch((error) => {
      syncPromise = null;
      console.error("Failed to sync current-season clubs", error);
    });
  }
  return syncPromise;
}

async function syncCurrentSeasonRoster(): Promise<void> {
  const { data: competitions, error: competitionError } = await supabase
    .from("competitions")
    .select("id, name, sport_id, country, season");
  if (competitionError) throw competitionError;

  const { data: clubs, error: clubError } = await supabase
    .from("clubs")
    .select("id, name, competition_id");
  if (clubError) throw clubError;

  const { data: sports, error: sportsError } = await supabase
    .from("sports")
    .select("id, name");
  if (sportsError) throw sportsError;

  const clubRows = (clubs ?? []) as ClubRow[];
  const byName = new Map(
    (competitions ?? []).map((row) => [row.name, row as CompetitionRow])
  );
  const sportsByName = new Map(
    (sports ?? []).map((row) => [row.name as string, row as { id: string; name: string }])
  );

  await ensureLeagueCompetitions(byName, sportsByName);

  if (rosterAlreadyCurrent(clubRows, byName)) return;

  for (const competition of byName.values()) {
    if (
      CURRENT_SEASON_LEAGUES[competition.name] &&
      competition.season !== CURRENT_SEASON
    ) {
      await supabase
        .from("competitions")
        .update({ season: CURRENT_SEASON })
        .eq("id", competition.id);
    }
  }

  const desiredCompetition = new Map<string, string>();

  for (const [league, teams] of Object.entries(CURRENT_SEASON_LEAGUES)) {
    const competition = byName.get(league);
    if (!competition) continue;
    for (const teamName of teams) {
      let club = findClubOnRoster(clubRows, teamName);
      if (!club) {
        const { data: inserted, error } = await supabase
          .from("clubs")
          .insert({
            name: teamName,
            short_name: teamName.slice(0, 3).toUpperCase(),
            competition_id: competition.id,
            country: competition.country,
          })
          .select("id, name, competition_id")
          .single();
        if (error) throw error;
        club = inserted as ClubRow;
        clubRows.push(club);
      }
      desiredCompetition.set(club.id, competition.id);
    }
  }

  const managedIds = new Set(
    [...byName.values()]
      .filter((row) => CURRENT_SEASON_LEAGUES[row.name])
      .map((row) => row.id)
  );

  for (const club of clubRows) {
    const nextCompetitionId = desiredCompetition.get(club.id) ?? null;
    const inManagedLeague =
      Boolean(club.competition_id) && managedIds.has(club.competition_id!);
    if (nextCompetitionId && nextCompetitionId !== club.competition_id) {
      await supabase
        .from("clubs")
        .update({ competition_id: nextCompetitionId })
        .eq("id", club.id);
      club.competition_id = nextCompetitionId;
    } else if (!nextCompetitionId && inManagedLeague) {
      await supabase
        .from("clubs")
        .update({ competition_id: null })
        .eq("id", club.id);
      club.competition_id = null;
    }
  }

  await dropStaleLeagueFixtures(clubRows, byName);
}

async function ensureLeagueCompetitions(
  byName: Map<string, CompetitionRow>,
  sportsByName: Map<string, { id: string; name: string }>
): Promise<void> {
  for (const league of Object.keys(CURRENT_SEASON_LEAGUES)) {
    if (byName.has(league)) continue;
    const sportName = LEAGUE_SPORT[league] ?? "Football";
    let sport = sportsByName.get(sportName);
    if (!sport) {
      const { data: createdSport, error } = await supabase
        .from("sports")
        .insert({ name: sportName })
        .select("id, name")
        .single();
      if (error) throw error;
      sport = createdSport as { id: string; name: string };
      sportsByName.set(sport.name, sport);
    }
    const { data: created, error } = await supabase
      .from("competitions")
      .insert({
        sport_id: sport.id,
        name: league,
        country: LEAGUE_COUNTRY[league] ?? null,
        season: CURRENT_SEASON,
      })
      .select("id, name, sport_id, country, season")
      .single();
    if (error) throw error;
    byName.set(created.name, created as CompetitionRow);
  }
}

function rosterAlreadyCurrent(
  clubs: ClubRow[],
  competitions: Map<string, CompetitionRow>
): boolean {
  for (const [league, teams] of Object.entries(CURRENT_SEASON_LEAGUES)) {
    const competition = competitions.get(league);
    if (!competition) return false;
    const actual = clubs
      .filter((club) => club.competition_id === competition.id)
      .map((club) => normalizeSeasonName(club.name))
      .sort();
    const expected = teams.map(normalizeSeasonName).sort();
    if (actual.length !== expected.length) return false;
    if (actual.some((name, index) => name !== expected[index])) return false;
  }
  return true;
}

async function dropStaleLeagueFixtures(
  clubs: ClubRow[],
  competitions: Map<string, CompetitionRow>
): Promise<void> {
  const clubById = new Map(clubs.map((club) => [club.id, club]));
  const { data: fixtures } = await supabase
    .from("fixtures")
    .select("id, competition_id, home_club_id, away_club_id");

  const staleIds: string[] = [];
  for (const fixture of fixtures ?? []) {
    const competitionName = [...competitions.values()].find(
      (row) => row.id === fixture.competition_id
    )?.name;
    if (!canonicalLeagueName(competitionName)) continue;
    const home = clubById.get(fixture.home_club_id as string);
    const away = clubById.get(fixture.away_club_id as string);
    if (!home || !away) continue;
    if (!isCurrentSeasonLeagueFixture(competitionName, home.name, away.name)) {
      staleIds.push(fixture.id as string);
    }
  }

  if (staleIds.length === 0) return;
  for (const id of staleIds) {
    await supabase.from("fixtures").delete().eq("id", id);
  }
}
