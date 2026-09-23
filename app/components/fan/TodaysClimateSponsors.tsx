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
  const pledges = locals.map((row) => row.pledgeGbp);

  return (
    <section className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
      <p className="text-center text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-emerald-300">
        Today&apos;s Climate Sponsors
      </p>
      <div className="mt-3 flex overflow-hidden rounded-xl border border-white/10 bg-white">
        <div
          className="flex min-w-0 items-center gap-3 px-4 py-3"
          style={{ width: `${LEAD_CLIMATE_SPONSOR_SHARE}%` }}
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
          className="flex min-w-0 items-stretch border-l border-slate-200"
          style={{ width: `${LOCAL_BUSINESS_SPONSOR_SHARE}%` }}
        >
          {locals.length === 0 ? (
            <p className="flex items-center px-3 text-xs font-semibold text-slate-400">
              Local Business Climate Sponsors
            </p>
          ) : (
            locals.map((local, index) => {
              const logo =
                local.logoUrl ||
                loadBrandLogo(local.brandName) ||
                sponsorLogoSrc(local.brandName, local.logoUrl);
              return (
                <div
                  key={`${local.brandName}:${index}`}
                  className="flex min-w-0 flex-col items-center justify-center gap-1 border-l border-slate-100 px-1.5 py-2 text-center"
                  style={{ flex: localHeaderFlex(local.pledgeGbp, pledges) }}
                >
                  {index === 0 ? (
                    <p className="hidden text-[0.45rem] font-semibold uppercase tracking-[0.12em] text-slate-500 xl:block">
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
                    className={
                      local.pledgeGbp >= 1250
                        ? "h-12 w-12 text-sm"
                        : local.pledgeGbp >= 750
                          ? "h-9 w-9 text-xs"
                          : "h-7 w-7 text-[0.65rem]"
                    }
                  />
                  <p className="w-full truncate text-[0.6rem] font-black text-slate-800">
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
