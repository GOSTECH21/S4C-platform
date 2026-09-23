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
  localTagline,
  localScale = 1,
  amountBadge,
  featured = false,
}: {
  leadName: string;
  leadLogoUrl?: string | null;
  localName?: string | null;
  localLogoUrl?: string | null;
  localTagline?: string | null;
  localScale?: number;
  amountBadge?: string | null;
  featured?: boolean;
}) {
  const leadLogo =
    leadLogoUrl || loadBrandLogo(leadName) || sponsorLogoSrc(leadName, leadLogoUrl);
  const localLogo = localName
    ? localLogoUrl || loadBrandLogo(localName) || sponsorLogoSrc(localName, localLogoUrl)
    : null;
  const scale = Math.min(1, Math.max(0, Number(localScale) || 1));

  return (
    <div className="mt-4 flex min-h-[8.5rem] flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-950/70">
      <section
        className={`flex min-w-0 items-center gap-3 border-b border-white/10 bg-white ${
          featured ? "px-4 py-3" : "px-3 py-2.5"
        }`}
        style={{ flex: LEAD_CLIMATE_SPONSOR_SHARE }}
      >
        <BrandMark
          name={leadName}
          logoUrl={leadLogo}
          large={featured}
          className={featured ? "h-16 w-16 text-xl" : "h-14 w-14 text-lg"}
        />
        <div className="min-w-0">
          <p className="text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
            {LEAD_CLIMATE_SPONSOR_LABEL}
          </p>
          <p
            className={`truncate font-black text-slate-950 ${
              featured ? "text-lg" : "text-sm"
            }`}
          >
            {leadName}
          </p>
          {amountBadge ? (
            <p className="mt-0.5 text-xs font-semibold text-emerald-700">
              {amountBadge}
            </p>
          ) : null}
        </div>
      </section>
      <section
        className={`flex min-w-0 items-center gap-2 bg-white ${
          featured ? "px-3 py-2.5" : "px-2.5 py-2"
        }`}
        style={{ flex: LOCAL_BUSINESS_SPONSOR_SHARE }}
      >
        <div
          className="flex min-w-0 items-center gap-2"
          style={{ width: `${Math.round(scale * 100)}%` }}
        >
          {localName ? (
            <BrandMark
              name={localName}
              logoUrl={localLogo}
              className={
                scale >= 0.85
                  ? "h-12 w-12 text-sm"
                  : scale >= 0.55
                    ? "h-9 w-9 text-xs"
                    : "h-7 w-7 text-[0.65rem]"
              }
            />
          ) : (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-sm font-black text-amber-700">
              LB
            </div>
          )}
          <div className="min-w-0">
            <p className="text-[0.52rem] font-semibold uppercase tracking-[0.14em] text-slate-500">
              {LOCAL_BUSINESS_SPONSOR_LABEL}
            </p>
            <p
              className={`truncate font-black ${
                localName ? "text-slate-950" : "text-slate-400"
              } ${featured ? "text-sm" : "text-xs"}`}
            >
              {localName ?? `From £${LOCAL_SPONSOR_MIN_GBP} near this stadium`}
            </p>
            {localTagline ? (
              <p className="truncate text-[0.65rem] text-slate-500">{localTagline}</p>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}
