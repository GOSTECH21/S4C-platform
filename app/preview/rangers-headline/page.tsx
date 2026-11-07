"use client";

import FanNav from "@/app/dashboard/supporter/components/FanNav";
import { CampaignMatchHeader } from "@/app/components/fan/CampaignMatchHeader";
import { nextFanMatchForClub } from "@/app/lib/climate-sponsors";
import { sponsorLogoSrc } from "@/app/services/teams.service";

const NOW = "2026-11-06T21:00:00.000Z";

export default function RangersHeadlinePreviewPage() {
  const next = nextFanMatchForClub({
    clubName: "Rangers",
    signedOff: [
      {
        clubName: "Rangers",
        fixtureName: "Rangers v Aberdeen",
        fixtureDate: "2026-11-24",
        kickoff: "20:00",
        lockedAt: NOW,
      },
    ],
    published: [
      {
        fixtureName: "St Mirren v Rangers",
        date: "2026-11-07",
        kickoff: "20:00",
      },
      {
        fixtureName: "Rangers v Aberdeen",
        date: "2026-11-24",
        kickoff: "20:00",
      },
    ],
    now: NOW,
  });

  return (
    <main className="min-h-screen p-8 text-white">
      <div className="mx-auto max-w-6xl">
        <FanNav />
        <CampaignMatchHeader
          clubName="Rangers"
          matchTitle={next?.fixtureName ?? "Rangers v Aberdeen"}
          sponsorName="Diageo"
          sponsorLogoUrl={sponsorLogoSrc("Diageo", null)}
        />
      </div>
    </main>
  );
}
