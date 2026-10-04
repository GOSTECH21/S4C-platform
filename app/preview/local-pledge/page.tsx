"use client";

import { useEffect, useState } from "react";
import { ClubClimateSponsorTabs } from "@/app/components/club/ClubClimateSponsorTabs";
import { MatchDayLocalSponsorBoard } from "@/app/components/club/MatchDayLocalSponsorBoard";
import {
  writeLocalSponsorRecord,
  type LocalSponsorRecord,
} from "@/app/lib/local-sponsor";

const FOUNTAIN: LocalSponsorRecord = {
  brandName: "The Fountain",
  email: "fountain@local.test",
  clubName: "Arsenal",
  pledgeGbp: 1550,
  createdAt: "2026-10-04T00:00:00.000Z",
  submittedAt: "2026-10-04T00:00:00.000Z",
  source: "registered",
  matchSponsorships: [
    { fixtureName: "Arsenal v Leeds United", amountGbp: 800 },
  ],
};

const PROJECTS = [
  { id: "gss", name: "Global Schools Solar", description: "", category: "Solar Energy" },
  { id: "lcr", name: "London Community Retrofit", description: "", category: "Renewable Energy" },
  { id: "icas", name: "Islington Clean Air Schools", description: "", category: "Clean Air" },
  { id: "scs", name: "Southwark Community Solar", description: "", category: "Solar Energy" },
  { id: "cwu", name: "Clean Water Uganda", description: "", category: "Water" },
];

export default function LocalPledgePreviewPage() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    writeLocalSponsorRecord(FOUNTAIN);
    setReady(true);
  }, []);
  if (!ready) return null;
  return (
    <main className="min-h-screen bg-slate-950 p-8 text-white">
      <div className="mx-auto max-w-6xl space-y-8">
        <h1 className="text-4xl font-black">The Fountain pledge preview</h1>
        <ClubClimateSponsorTabs
          clubName="Arsenal"
          leadSponsors={[]}
          localSponsors={[FOUNTAIN]}
        />
        <MatchDayLocalSponsorBoard
          clubName="Arsenal"
          projects={PROJECTS}
          leadName="Puma"
        />
      </div>
    </main>
  );
}
