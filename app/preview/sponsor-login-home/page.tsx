"use client";

import { SignedSponsorHome } from "@/app/components/sponsor/SignedSponsorHome";
import type { MatchDayClubLock } from "@/app/lib/climate-sponsors";

const pepsiLock: MatchDayClubLock = {
  brandKey: "pepsi cola",
  clubName: "Arsenal",
  matchLabel: "Premier League Match",
  fixtureName: "Manchester City v Arsenal",
  competition: "Premier League",
  fixtureDate: "2026-11-21",
  kickoff: "15:00",
  venue: "Etihad Stadium",
  lockedAt: "2026-10-12T12:00:00.000Z",
  fundingLockedAt: "2026-10-12T12:30:00.000Z",
  commitmentFeeGbp: 2300,
  gbpPerGoal: 4000,
  maximumSponsorshipGbp: 7500,
};

const pendingOffers = [
  {
    clubId: "arsenal-demo",
    clubName: "Arsenal",
    matchTitle: "Manchester City v Arsenal",
    projects: [
      { id: "gss", name: "Global Schools Solar", fundedGbp: 2300 },
      { id: "islington", name: "Islington Tree Canopy", fundedGbp: 0.2 },
      { id: "emirates", name: "Emirates Community Garden", fundedGbp: 0 },
      { id: "cycle", name: "North London Cycle Hub", fundedGbp: 0 },
      { id: "solar", name: "Holloway School Solar", fundedGbp: 0 },
    ],
  },
];

export default function SponsorLoginHomePreview() {
  return (
    <div className="min-h-screen bg-slate-950 p-8 text-white">
      <SignedSponsorHome
        brand="Pepsi Cola"
        logoUrl={null}
        signed={[]}
        votedByClub={{
          "arsenal-demo": [
            { id: "gss", fundedGbp: 2300 },
            { id: "islington", fundedGbp: 0.2 },
          ],
        }}
        committedGbp={2300}
        lock={pepsiLock}
        pendingOffers={pendingOffers}
        onNewSponsorship={() => undefined}
      />
    </div>
  );
}
