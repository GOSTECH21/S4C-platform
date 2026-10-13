"use client";

import { BrandMark } from "@/app/components/club/BrandMark";
import { FundedClimateProjectsList } from "@/app/components/sponsor/FundedClimateProjectsList";
import { SponsorLobiTable } from "@/app/components/sponsor/SponsorLobiTable";
import { SponsoredMatchCalendar } from "@/app/components/sponsor/SponsoredMatchCalendar";
import { SPONSOR_NEW_SPONSORSHIP_LABEL } from "@/app/lib/routes";
import type { LobiRow } from "@/app/lib/lobi";
import type { FundedSponsorProject } from "@/app/lib/sponsor-signed-home";
import type { SponsoredMatchListing } from "@/app/lib/sponsor-signed-home";

export function LocalSignedSponsorHome({
  brand,
  logoUrl,
  matches,
  projects,
  lobiRows,
  postcodeArea,
  onNewSponsorship,
}: {
  brand: string;
  logoUrl: string | null;
  matches: SponsoredMatchListing[];
  projects: FundedSponsorProject[];
  lobiRows: LobiRow[];
  postcodeArea: string;
  onNewSponsorship: () => void;
}) {
  return (
    <div className="space-y-10">
      <div>
        <div className="flex items-center gap-4">
          <BrandMark name={brand} logoUrl={logoUrl} large />
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-green-400">
              Local Business Climate Sponsor
            </p>
            <h1 className="mt-2 text-4xl font-black tracking-tight">
              Signed in as {brand}
            </h1>
          </div>
        </div>
      </div>

      <SponsoredMatchCalendar
        matches={matches}
        intro="Spotlighted days are Match Days you have sponsored. Click a highlighted day to see the Match or Matches you sponsored."
      />
      <FundedClimateProjectsList projects={projects} kind="local" />
      <SponsorLobiTable rows={lobiRows} area={postcodeArea} />

      <div role="tablist" aria-label="Sponsorship actions">
        <button
          type="button"
          role="tab"
          onClick={onNewSponsorship}
          className="rounded-lg bg-s4p-mark px-5 py-2 text-sm font-bold text-slate-950 hover:brightness-110"
        >
          {SPONSOR_NEW_SPONSORSHIP_LABEL}
        </button>
      </div>
    </div>
  );
}
