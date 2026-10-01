"use client";

import { useEffect, useState } from "react";
import { BrandMark } from "@/app/components/club/BrandMark";
import {
  topClimateSponsors,
  type ClubClimateSponsor,
} from "@/app/lib/climate-sponsors";
import { formatMoney } from "@/app/lib/sponsorship-auction";
import { rosterForClubName } from "@/app/services/climate-sponsors.service";

export function TopClimateSponsorsPromo({ clubName }: { clubName: string }) {
  const [top, setTop] = useState<ClubClimateSponsor[]>([]);

  useEffect(() => {
    const roster = rosterForClubName(clubName);
    setTop(roster ? topClimateSponsors(roster.sponsors) : []);
  }, [clubName]);

  if (top.length === 0) return null;

  return (
    <section className="mx-auto mt-12 max-w-7xl rounded-3xl border border-amber-400/30 bg-slate-900 p-10 text-white">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-300">
        Our Climate Sponsors
      </p>
      <h2 className="mt-2 text-3xl font-black">
        Top 3 Climate Project Sponsors
      </h2>
      <p className="mt-2 max-w-2xl text-slate-400">
        Ranked by climate-project spend. Promote these brands on the club website.
      </p>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {top.map((sponsor, index) => (
          <div
            key={sponsor.id}
            className="rounded-2xl border border-slate-700 bg-slate-950 p-6"
          >
            <div className="flex items-center gap-3">
              <BrandMark name={sponsor.brandName} logoUrl={sponsor.logoUrl} large />
              <div>
                <p className="text-xs text-amber-300">#{index + 1}</p>
                <h3 className="text-xl font-bold">{sponsor.brandName}</h3>
              </div>
            </div>
            <p className="mt-4 text-sm text-slate-400">
              {formatMoney(sponsor.spentGbp)} climate-project spend
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
