"use client";

import { BrandMark } from "@/app/components/club/BrandMark";
import { FundedClimateProjectsList } from "@/app/components/sponsor/FundedClimateProjectsList";
import { SponsorLobiTable } from "@/app/components/sponsor/SponsorLobiTable";
import { SponsoredMatchCalendar } from "@/app/components/sponsor/SponsoredMatchCalendar";
import { SPONSOR_NEW_SPONSORSHIP_LABEL } from "@/app/lib/routes";
import type { LobiRow } from "@/app/lib/lobi";
import type { LocalSponsoredClubMatch } from "@/app/lib/local-sponsor-home";
import { formatFundingGbp } from "@/app/lib/platform-stats";
import type { FundedSponsorProject } from "@/app/lib/sponsor-signed-home";
import type { SponsoredMatchListing } from "@/app/lib/sponsor-signed-home";

export function LocalSignedSponsorHome({
  brand,
  logoUrl,
  matches,
  clubMatches = [],
  projects,
  lobiRows,
  postcodeArea,
  onNewSponsorship,
}: {
  brand: string;
  logoUrl: string | null;
  matches: SponsoredMatchListing[];
  clubMatches?: LocalSponsoredClubMatch[];
  projects: FundedSponsorProject[];
  lobiRows: LobiRow[];
  postcodeArea: string;
  onNewSponsorship: () => void;
}) {
  const sponsored = clubMatches.length > 0 ? clubMatches : matches.map((row) => ({
    clubName: row.clubName,
    fixtureName: row.fixtureName,
    amountGbp: 0,
  }));
  return (
    <div className="min-w-0 space-y-10">
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

      <section className="rounded-3xl border border-green-500/30 bg-slate-900 p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-green-400">
          Your Club and Matches
        </p>
        <h2 className="mt-2 text-3xl font-black">Who you are sponsoring</h2>
        {sponsored.length === 0 ? (
          <p className="mt-4 text-slate-300">
            No Club or Match is stored for this login yet. Open this page on the
            phone you registered on so Score-For-Planet can copy your Club and
            Match here, or start a new sponsorship.
          </p>
        ) : (
          <ul className="mt-6 space-y-3">
            {sponsored.map((row) => (
              <li
                key={`${row.clubName}-${row.fixtureName}`}
                className="rounded-2xl border border-slate-700 bg-slate-950 p-5"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-green-400">
                  {row.clubName}
                </p>
                <p className="mt-1 text-lg font-bold">{row.fixtureName}</p>
                {row.amountGbp > 0 ? (
                  <p className="mt-1 text-sm text-slate-400">
                    {formatFundingGbp(row.amountGbp)}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>

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
