"use client";

import { BrandMark } from "@/app/components/club/BrandMark";
import { FundedClimateProjectsList } from "@/app/components/sponsor/FundedClimateProjectsList";
import { SponsorCistTable } from "@/app/components/sponsor/SponsorCistTable";
import { SponsoredMatchCalendar } from "@/app/components/sponsor/SponsoredMatchCalendar";
import {
  SPONSOR_NEW_SPONSORSHIP_LABEL,
} from "@/app/lib/routes";
import {
  fundedClimateProjectsFromSigned,
  sponsoredMatchesFromSigned,
} from "@/app/lib/sponsor-signed-home";
import type { SignedSponsorship } from "@/app/lib/sponsor-dashboard";

export function SignedSponsorHome({
  brand,
  logoUrl,
  signed,
  votedByClub,
  committedGbp,
  onNewSponsorship,
}: {
  brand: string;
  logoUrl: string | null;
  signed: SignedSponsorship[];
  votedByClub: Record<string, Array<{ id: string; fundedGbp?: number | null }>>;
  committedGbp: number;
  onNewSponsorship: () => void;
}) {
  const matches = sponsoredMatchesFromSigned(signed);
  const projects = fundedClimateProjectsFromSigned(signed, votedByClub);

  return (
    <div className="space-y-10">
      <div>
        <div className="flex items-center gap-4">
          <BrandMark name={brand} logoUrl={logoUrl} large />
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-green-400">
              Signed in as {brand}
            </p>
            <h1 className="mt-2 text-4xl font-black tracking-tight">
              Your sponsored Match Days
            </h1>
          </div>
        </div>
      </div>

      <SponsoredMatchCalendar matches={matches} />
      <FundedClimateProjectsList projects={projects} />
      <SponsorCistTable brandName={brand} ownFundingGbp={committedGbp} />

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
