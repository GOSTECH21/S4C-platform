import { getUpcomingFixturesForTeams } from "@/app/services/next-fixtures.service";
import type { TeamRef } from "@/app/lib/upcoming-matches";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const rawTeams = (body as { teams?: unknown }).teams;
  if (!Array.isArray(rawTeams)) {
    return Response.json({ fixtures: {} });
  }

  const teams: TeamRef[] = rawTeams
    .map((row) => {
      if (!row || typeof row !== "object") return null;
      const team = row as Record<string, unknown>;
      if (typeof team.id !== "string" || typeof team.name !== "string") {
        return null;
      }
      return {
        id: team.id,
        name: team.name,
        displayName:
          typeof team.displayName === "string" ? team.displayName : team.name,
        sport: typeof team.sport === "string" ? team.sport : undefined,
      };
    })
    .filter((team): team is TeamRef => team !== null)
    .slice(0, 20);

  const fixtures = await getUpcomingFixturesForTeams(teams);
  return Response.json({ fixtures });
}
