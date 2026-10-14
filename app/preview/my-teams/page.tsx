import FanNav from "@/app/dashboard/supporter/components/FanNav";
import MyTeamsList from "@/app/components/fan/MyTeamsList";
import { demoUpcomingForClub } from "@/app/lib/demo-club-fixtures";
import type { UpcomingMatch } from "@/app/lib/upcoming-matches";

const HIBERNIAN = {
  id: "hibernian",
  name: "Hibernian",
  displayName: "Hibernian",
  sport: "Football",
  competition: "Scottish Premiership",
};

const CUP: UpcomingMatch = {
  id: "demo:hibernian:cup",
  date: "2026-11-01",
  kickoff: "15:00",
  homeName: "Heart of Midlothian",
  awayName: "Hibernian",
  venue: "Tynecastle Park",
  competition: "Scottish League Cup",
  source: "s4p",
  sourceUrl: null,
};

export default function MyTeamsPreviewPage() {
  const fixtures = {
    [HIBERNIAN.id]: [CUP, ...demoUpcomingForClub("Hibernian")],
  };

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <FanNav />
        <MyTeamsList teams={[HIBERNIAN]} fixtures={fixtures} />
      </div>
    </main>
  );
}
