import type { ClubFixture } from "@/app/lib/club-fixtures";
import { withDemoClubFixtures } from "@/app/lib/demo-club-fixtures";

export async function loadClubFixtures(clubName: string): Promise<ClubFixture[]> {
  const club = clubName.trim();
  if (!club) return [];
  const fallback = withDemoClubFixtures(club, []);
  try {
    const response = await fetch(
      `/api/sponsor/club-fixtures?club=${encodeURIComponent(club)}`,
      { cache: "no-store" }
    );
    if (!response.ok) return fallback;
    const payload = (await response.json()) as { fixtures?: ClubFixture[] };
    const rows = Array.isArray(payload.fixtures) ? payload.fixtures : [];
    return withDemoClubFixtures(club, rows);
  } catch {
    return fallback;
  }
}
