"use client";

import { BrandMark } from "@/app/components/club/BrandMark";
import {
  LEAD_CLIMATE_SPONSOR_LABEL,
  LEAD_CLIMATE_SPONSOR_SHARE,
  LOCAL_BUSINESS_SPONSOR_LABEL,
  LOCAL_BUSINESS_SPONSOR_SHARE,
} from "@/app/lib/dual-sponsor";
import { LOCAL_SPONSOR_MIN_GBP } from "@/app/lib/local-sponsor";
import { loadBrandLogo } from "@/app/services/climate-sponsors.service";
import { sponsorLogoSrc } from "@/app/services/teams.service";

export function DualSponsorStrip({
  leadName,
  leadLogoUrl,
  localName,
  localLogoUrl,
  amountBadge,
  featured = false,
}: {
  leadName: string;
  leadLogoUrl?: string | null;
  localName?: string | null;
  localLogoUrl?: string | null;
  amountBadge?: string | null;
  featured?: boolean;
}) {
  const leadLogo =
    leadLogoUrl || loadBrandLogo(leadName) || sponsorLogoSrc(leadName, leadLogoUrl);
  const localLogo = localName
    ? localLogoUrl || loadBrandLogo(localName) || sponsorLogoSrc(localName, localLogoUrl)
    : null;

  return (
    <div className="mt-5 flex overflow-hidden rounded-2xl border border-slate-700">
      <section
        className={`flex min-w-0 items-center gap-3 bg-emerald-950/70 ${
          featured ? "px-4 py-4" : "px-3 py-3"
        }`}
        style={{ width: `${LEAD_CLIMATE_SPONSOR_SHARE}%` }}
      >
        <BrandMark name={leadName} logoUrl={leadLogo} large={featured} />
        <div className="min-w-0">
          <p className="text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-emerald-300">
            {LEAD_CLIMATE_SPONSOR_LABEL}
          </p>
          <p
            className={`truncate font-black text-white ${
              featured ? "text-lg" : "text-sm"
            }`}
          >
            {leadName}
          </p>
          {amountBadge ? (
            <p className="mt-1 text-xs font-semibold text-emerald-200">
              {amountBadge}
            </p>
          ) : null}
        </div>
      </section>
      <section
        className={`flex min-w-0 items-center gap-2 border-l border-amber-400/30 bg-amber-950/50 ${
          featured ? "px-3 py-4" : "px-2.5 py-3"
        }`}
        style={{ width: `${LOCAL_BUSINESS_SPONSOR_SHARE}%` }}
      >
        {localName ? (
          <BrandMark name={localName} logoUrl={localLogo} />
        ) : (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-lg font-black text-amber-300">
            LB
          </div>
        )}
        <div className="min-w-0">
          <p className="text-[0.55rem] font-semibold uppercase tracking-[0.14em] text-amber-300">
            {LOCAL_BUSINESS_SPONSOR_LABEL}
          </p>
          <p
            className={`truncate font-black ${
              localName ? "text-white" : "text-amber-100/70"
            } ${featured ? "text-sm" : "text-xs"}`}
          >
            {localName ?? `From £${LOCAL_SPONSOR_MIN_GBP} near this stadium`}
          </p>
        </div>
      </section>
    </div>
  );
}
