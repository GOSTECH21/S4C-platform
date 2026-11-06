"use client";

import FanNav from "@/app/dashboard/supporter/components/FanNav";
import { nextFanMatchForClub } from "@/app/lib/climate-sponsors";
import { campaignHeadline } from "@/app/lib/sponsorship-auction";
import {
  fanVotingWindowCopy,
  fanWalletDrainCopy,
} from "@/app/lib/voting-window";
import { formatWalletGbp } from "@/app/lib/sponsor-wallet";

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
  const headline = campaignHeadline(next?.fixtureName);

  return (
    <main className="min-h-screen p-8 text-white">
      <div className="mx-auto max-w-6xl">
        <FanNav />
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-300">
            Rangers
          </p>
          <h1
            className="mt-2 text-3xl font-black md:text-5xl"
            data-rangers-headline={next?.fixtureName ?? ""}
          >
            {headline}
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-400">
            {fanVotingWindowCopy()} {fanWalletDrainCopy(formatWalletGbp(0))}
          </p>
        </div>
      </div>
    </main>
  );
}
