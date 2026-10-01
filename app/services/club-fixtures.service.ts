import type { ClubFixture } from "@/app/lib/club-fixtures";

export async function loadClubFixtures(clubName: string): Promise<ClubFixture[]> {
  const club = clubName.trim();
  if (!club) return [];
  const response = await fetch(
    `/api/sponsor/club-fixtures?club=${encodeURIComponent(club)}`,
    { cache: "no-store" }
  );
  if (!response.ok) {
    throw new Error("Could not load published fixtures.");
  }
  const payload = (await response.json()) as { fixtures?: ClubFixture[] };
  return Array.isArray(payload.fixtures) ? payload.fixtures : [];
}
