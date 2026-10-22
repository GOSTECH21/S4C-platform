import {
  CLUB_MATCH_CALENDAR_COUNT,
  nextClubMatches,
  resolveSportingCalendarClub,
} from "@/app/lib/sporting-calendar";
import { isCupCompetitionName } from "@/app/lib/sporting-calendar-leagues";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const clubQuery = new URL(request.url).searchParams.get("club") ?? "";
  const resolved = resolveSportingCalendarClub(clubQuery);
  if (!resolved) {
    return Response.json({
      club: clubQuery.trim(),
      matches: [],
      error: "Choose a club from the list to see their upcoming matches.",
    });
  }

  const matches = nextClubMatches(resolved).map((row) => ({
    id: row.id,
    date: row.date,
    kickoff: row.kickoff,
    league: row.league,
    cup: isCupCompetitionName(row.league),
    homeName: row.homeName,
    awayName: row.awayName,
    venue: row.venue,
    fixtureName: row.fixtureName,
  }));

  return Response.json({
    club: resolved,
    count: CLUB_MATCH_CALENDAR_COUNT,
    matches,
  });
}
