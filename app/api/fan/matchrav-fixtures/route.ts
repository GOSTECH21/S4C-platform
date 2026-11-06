import { NextRequest } from "next/server";
import { matchravStadiumForClub } from "@/app/lib/matchrav-journey";
import { calendarMatchesAsUpcoming } from "@/app/lib/sporting-calendar";
import { getPublishedFixturesForClub } from "@/app/services/next-fixtures.service";

export async function GET(request: NextRequest) {
  const club = String(request.nextUrl.searchParams.get("club") ?? "").trim();
  if (!club) {
    return Response.json({ fixtures: [], stadium: null });
  }

  const stadium = matchravStadiumForClub(club);
  const fromCalendar = calendarMatchesAsUpcoming(club).slice(0, 12);
  if (fromCalendar.length > 0) {
    return Response.json({ fixtures: fromCalendar, stadium });
  }

  try {
    const published = await getPublishedFixturesForClub(club);
    return Response.json({
      fixtures: published.slice(0, 12),
      stadium,
    });
  } catch {
    return Response.json({ fixtures: [], stadium });
  }
}
