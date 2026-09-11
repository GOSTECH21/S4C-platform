import { getTeamCatalog } from "@/app/services/teams.service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const catalog = await getTeamCatalog();
    return Response.json({ catalog });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load team catalog.";
    return Response.json({ error: message }, { status: 500 });
  }
}
