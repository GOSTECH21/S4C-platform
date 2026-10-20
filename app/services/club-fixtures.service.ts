import type { ClubFixture } from "@/app/lib/club-fixtures";
import { sameNamedFixture } from "@/app/lib/club-fixtures";
import { withDemoClubFixtures } from "@/app/lib/demo-club-fixtures";
import { calendarFixturesForClub } from "@/app/lib/sporting-calendar";

function withCalendarClubFixtures(
  club: string,
  published: ClubFixture[]
): ClubFixture[] {
  const calendar = calendarFixturesForClub(club);
  if (published.length === 0) return withDemoClubFixtures(club, calendar);
  const extra = calendar.filter(
    (row) =>
      !published.some((live) => sameNamedFixture(live.fixtureName, row.fixtureName))
  );
  return withDemoClubFixtures(club, [...published, ...extra]);
}

export async function loadClubFixtures(clubName: string): Promise<ClubFixture[]> {
  const club = clubName.trim();
  if (!club) return [];
  const fallback = withCalendarClubFixtures(club, []);
  try {
    const response = await fetch(
      `/api/sponsor/club-fixtures?club=${encodeURIComponent(club)}`,
      { cache: "no-store" }
    );
    if (!response.ok) return fallback;
    const payload = (await response.json()) as { fixtures?: ClubFixture[] };
    const rows = Array.isArray(payload.fixtures) ? payload.fixtures : [];
    return withCalendarClubFixtures(club, rows);
  } catch {
    return fallback;
  }
}
