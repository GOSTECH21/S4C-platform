"use client";

import { BrandMark } from "@/app/components/club/BrandMark";
import {
  LEAD_CLIMATE_SPONSOR_LABEL,
  LEAD_CLIMATE_SPONSOR_SHARE,
  LOCAL_BUSINESS_SPONSOR_LABEL,
  LOCAL_BUSINESS_SPONSOR_SHARE,
  localHeaderFlex,
} from "@/app/lib/dual-sponsor";
import type { LocalSponsorRecord } from "@/app/lib/local-sponsor";
import { isLeadClimateBrand } from "@/app/lib/match-day-branding";
import { loadBrandLogo } from "@/app/services/climate-sponsors.service";
import { sponsorLogoSrc } from "@/app/services/teams.service";

export function TodaysClimateSponsors({
  leadName,
  leadLogoUrl,
  locals,
}: {
  leadName: string;
  leadLogoUrl?: string | null;
  locals: LocalSponsorRecord[];
}) {
  const leadLogo =
    leadLogoUrl || loadBrandLogo(leadName) || sponsorLogoSrc(leadName, leadLogoUrl);
  const localOnly = locals.filter(
    (row) =>
      !isLeadClimateBrand(row.brandName) &&
      row.brandName.trim().toLowerCase() !== leadName.trim().toLowerCase()
  );

  return (
    <section className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
      <p className="text-center text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-emerald-300">
        Today&apos;s Climate Sponsors
      </p>
      <div className="mt-3 flex overflow-hidden rounded-xl border border-white/10">
        <div
          className="flex min-w-0 items-center gap-3 bg-white px-4 py-3"
          style={{
            flex: `0 0 ${LEAD_CLIMATE_SPONSOR_SHARE}%`,
            width: `${LEAD_CLIMATE_SPONSOR_SHARE}%`,
            maxWidth: `${LEAD_CLIMATE_SPONSOR_SHARE}%`,
          }}
        >
          <BrandMark name={leadName} logoUrl={leadLogo} large />
          <div className="min-w-0">
            <p className="text-[0.58rem] font-semibold uppercase tracking-[0.16em] text-slate-500">
              {LEAD_CLIMATE_SPONSOR_LABEL}
            </p>
            <p className="truncate text-lg font-black text-slate-950">{leadName}</p>
          </div>
        </div>
        <div
          className="flex min-w-0 items-stretch border-l-2 border-amber-300 bg-amber-50"
          style={{
            flex: `0 0 ${LOCAL_BUSINESS_SPONSOR_SHARE}%`,
            width: `${LOCAL_BUSINESS_SPONSOR_SHARE}%`,
            maxWidth: `${LOCAL_BUSINESS_SPONSOR_SHARE}%`,
          }}
        >
          {localOnly.length === 0 ? (
            <p className="flex items-center px-3 text-xs font-semibold text-amber-800/70">
              Local Business Climate Sponsors — 35% logo space
            </p>
          ) : (
            localOnly.map((local, index) => {
              const logo =
                local.logoUrl ||
                loadBrandLogo(local.brandName) ||
                sponsorLogoSrc(local.brandName, local.logoUrl);
              return (
                <div
                  key={`${local.brandName}:${index}`}
                  className="flex min-w-0 flex-col items-center justify-center gap-1 border-l border-amber-200 px-1 py-2 text-center"
                  style={{ flex: localHeaderFlex(local.pledgeGbp) }}
                >
                  {index === 0 ? (
                    <p className="hidden text-[0.45rem] font-semibold uppercase tracking-[0.12em] text-amber-800/80 xl:block">
                      {LOCAL_BUSINESS_SPONSOR_LABEL}
                    </p>
                  ) : (
                    <p className="hidden text-[0.45rem] font-semibold uppercase tracking-[0.12em] text-transparent xl:block">
                      {LOCAL_BUSINESS_SPONSOR_LABEL}
                    </p>
                  )}
                  <BrandMark
                    name={local.brandName}
                    logoUrl={logo}
                    className="h-8 w-8 text-[0.6rem]"
                  />
                  <p className="w-full truncate text-[0.55rem] font-black text-slate-800">
                    {local.brandName}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
