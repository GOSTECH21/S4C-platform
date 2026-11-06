import FanMatchravPanel from "@/app/components/fan/FanMatchravPanel";
import { matchravStadiumForClub } from "@/app/lib/matchrav-journey";
import { calendarMatchesAsUpcoming } from "@/app/lib/sporting-calendar";

export default async function FanMatchravPage({
  searchParams,
}: {
  searchParams: Promise<{ club?: string }>;
}) {
  const club = String((await searchParams)?.club ?? "").trim();
  const fixtures = club ? calendarMatchesAsUpcoming(club).slice(0, 12) : [];
  const stadium = club ? matchravStadiumForClub(club) : null;
  return (
    <FanMatchravPanel
      initialClub={club}
      initialFixtures={fixtures}
      initialStadium={stadium}
    />
  );
}
