"use client";

import { useMemo } from "react";
import { ClubClimateSponsorTabs } from "@/app/components/club/ClubClimateSponsorTabs";
import type { LeadClubSponsorRow } from "@/app/lib/climate-sponsors";
import type { LocalSponsorRecord } from "@/app/lib/local-sponsor";

const LEADS: LeadClubSponsorRow[] = [
  {
    brandKey: "american express",
    brandName: "American Express",
    email: "amex@example.com",
    matches: ["Arsenal v Chelsea"],
    lockedAt: new Date().toISOString(),
    inNetwork: true,
  },
  {
    brandKey: "puma",
    brandName: "Puma",
    email: "puma@example.com",
    matches: ["Bayern Munich v Arsenal"],
    lockedAt: new Date().toISOString(),
    inNetwork: true,
  },
  {
    brandKey: "diageo",
    brandName: "Diageo",
    email: "diageo@example.com",
    matches: ["Arsenal v Manchester United"],
    lockedAt: new Date().toISOString(),
    inNetwork: true,
  },
];

const LOCALS: LocalSponsorRecord[] = [
  {
    brandName: "The Stadium Cafe",
    email: "cafe@example.com",
    clubName: "Arsenal",
    pledgeGbp: 1250,
    createdAt: new Date().toISOString(),
    submittedAt: new Date().toISOString(),
    source: "registered",
    matchSponsorships: [
      { fixtureName: "Arsenal v Chelsea", amountGbp: 750 },
      { fixtureName: "Arsenal v Manchester United", amountGbp: 500 },
    ],
  },
  {
    brandName: "Highbury Hardware",
    email: "hardware@example.com",
    clubName: "Arsenal",
    pledgeGbp: 500,
    createdAt: new Date().toISOString(),
    submittedAt: new Date().toISOString(),
    source: "registered",
    matchSponsorships: [
      { fixtureName: "Arsenal v Chelsea", amountGbp: 500 },
    ],
  },
];

export default function ClubSponsorsPreviewPage() {
  const leads = useMemo(() => LEADS, []);
  const locals = useMemo(() => LOCALS, []);
  return (
    <main className="min-h-screen bg-slate-950 p-8 text-white">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-green-400">
          Arsenal FC preview
        </p>
        <h1 className="mt-2 text-4xl font-black">Club dashboard sponsors</h1>
        <ClubClimateSponsorTabs
          clubName="Arsenal"
          leadSponsors={leads}
          localSponsors={locals}
        />
      </div>
    </main>
  );
}
