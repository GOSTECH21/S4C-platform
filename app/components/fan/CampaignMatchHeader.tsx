"use client";

import { BrandMark } from "@/app/components/club/BrandMark";
import { fanMatchMetaLine } from "@/app/lib/fan-match-meta";
import {
  campaignHeadline,
  matchSponsorshipHeading,
} from "@/app/lib/sponsorship-auction";

export const MATCH_SPONSORSHIP_HEADER = "match-sponsorship-v1";
export const SPONSORED_BY_LABEL = "Sponsored By";

export function CampaignMatchHeader({
  clubName,
  matchTitle,
  sponsorName,
  sponsorLogoUrl,
  kickoffAt,
  venue,
}: {
  clubName: string;
  matchTitle: string;
  sponsorName?: string | null;
  sponsorLogoUrl?: string | null;
  kickoffAt?: string | Date | null;
  venue?: string | null;
}) {
  const brand = String(sponsorName ?? "").trim();
  const meta = fanMatchMetaLine({ kickoffAt, venue, clubName });

  return (
    <div className="text-center" data-campaign-header={MATCH_SPONSORSHIP_HEADER}>
      <p className="text-sm font-semibold text-emerald-800">
        {matchSponsorshipHeading(clubName)}
      </p>
      <h1 className="mt-2 text-3xl font-black text-slate-950 md:text-5xl">
        {campaignHeadline(matchTitle)}
      </h1>
      {meta ? (
        <p
          data-fan-match-meta=""
          className="mt-2 text-sm font-semibold text-emerald-800"
        >
          {meta}
        </p>
      ) : null}
      {brand ? (
        <div
          className="mt-5 flex flex-col items-center gap-3"
          data-sponsored-by=""
        >
          <p className="text-sm font-semibold text-slate-600">
            {SPONSORED_BY_LABEL}
          </p>
          <div className="flex items-center justify-center gap-3">
            <p className="text-lg font-black">{brand}</p>
            <BrandMark name={brand} logoUrl={sponsorLogoUrl} large />
          </div>
        </div>
      ) : null}
    </div>
  );
}
