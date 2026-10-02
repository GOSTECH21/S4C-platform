import { getPublishedFixturesForClub } from "@/app/services/next-fixtures.service";
import { fixturesFromUpcoming } from "@/app/lib/club-fixtures";

export async function GET(request: Request) {
  const club = new URL(request.url).searchParams.get("club") ?? "";
  if (!club.trim()) {
    return Response.json({ fixtures: [] });
  }
  const matches = await getPublishedFixturesForClub(club);
  return Response.json({ fixtures: fixturesFromUpcoming(matches) });
}
