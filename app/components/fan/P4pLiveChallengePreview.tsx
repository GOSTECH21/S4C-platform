"use client";
/* s4p-predict-for-planet-v7 */

import { BrandMark } from "@/app/components/club/BrandMark";
import {
  P4P_CATEGORIES,
  P4P_ENGAGEMENT_GBP,
  P4P_FANS_ENGAGEMENT_LABEL,
  P4P_LIVE_CHALLENGE_FOOTER,
  P4P_LIVE_CHALLENGE_LABEL,
  P4P_POWERED_BY_LABEL,
  P4P_TAGLINE,
  formatP4pGbp,
} from "@/app/lib/predict-for-planet";
import { loadBrandLogo } from "@/app/services/climate-sponsors.service";
import { sponsorLogoSrc } from "@/app/services/teams.service";

export function P4pLiveChallengePreview({
  fixtureName,
  brandName,
  slotLabel,
  sponsorshipGbp,
  allocatedGbp = 0,
  uniqueFans = 0,
  eligiblePredictions = 0,
  badge = "Preview",
}: {
  fixtureName: string;
  brandName: string;
  slotLabel: string;
  sponsorshipGbp: number;
  allocatedGbp?: number;
  uniqueFans?: number;
  eligiblePredictions?: number;
  badge?: string;
}) {
  const sponsorLogo =
    loadBrandLogo(brandName) || sponsorLogoSrc(brandName, null);
  const engagementTarget = Math.max(
    1,
    Math.round(Math.max(0, sponsorshipGbp) / P4P_ENGAGEMENT_GBP)
  );
  const progressPercent =
    sponsorshipGbp > 0
      ? Math.round(
          Math.min(1, Math.max(0, allocatedGbp) / sponsorshipGbp) * 100
        )
      : 0;

  return (
    <div data-testid="p4p-game-time-preview" className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <h2 className="text-xl font-black">What fans see on Predict-For Planet</h2>
        <p className="text-sm font-black uppercase tracking-[0.12em] text-emerald-800">
          {P4P_TAGLINE}
        </p>
      </div>

      <article
        data-testid="p4p-live-challenge"
        className="rounded-3xl border border-emerald-700/30 bg-white p-6 text-slate-950"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-800">
              {P4P_LIVE_CHALLENGE_LABEL}
            </p>
            <h3 className="mt-2 text-3xl font-black">{fixtureName}</h3>
            <p className="mt-1 text-sm text-slate-600">
              Game-Time Sponsor · {slotLabel}
            </p>
          </div>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">
            {badge}
          </span>
        </div>

        <div className="mt-6">
          <div className="flex items-end justify-between gap-3">
            <p className="text-lg font-black">{P4P_FANS_ENGAGEMENT_LABEL}</p>
            <p className="text-lg font-black tabular-nums">
              {eligiblePredictions.toLocaleString("en-GB")} /{" "}
              {engagementTarget.toLocaleString("en-GB")}
            </p>
          </div>
          <div className="mt-3 h-3 overflow-hidden rounded-full bg-emerald-100">
            <div
              className="h-full rounded-full bg-emerald-600"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="mt-2 text-sm text-emerald-800">
            {progressPercent}% of engagement target achieved
          </p>
        </div>

        <dl className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-emerald-700/20 bg-[var(--s4p-canvas)] p-4">
            <dt className="text-sm text-slate-600">Unique fans participating</dt>
            <dd className="mt-1 text-2xl font-black tabular-nums">
              {uniqueFans.toLocaleString("en-GB")}
            </dd>
          </div>
          <div className="rounded-2xl border border-emerald-700/20 bg-[var(--s4p-canvas)] p-4">
            <dt className="text-sm text-slate-600">
              Total eligible predictions submitted
            </dt>
            <dd className="mt-1 text-2xl font-black tabular-nums">
              {eligiblePredictions.toLocaleString("en-GB")}
            </dd>
          </div>
          <div className="rounded-2xl border border-emerald-700/20 bg-[var(--s4p-canvas)] p-4">
            <dt className="text-sm text-slate-600">Climate funding unlocked</dt>
            <dd className="mt-1 text-3xl font-black text-emerald-800">
              {formatP4pGbp(allocatedGbp)}
            </dd>
          </div>
          <div className="rounded-2xl border border-emerald-700/20 bg-[var(--s4p-canvas)] p-4">
            <dt className="text-sm text-slate-600">Sponsor commitment</dt>
            <dd className="mt-1 text-3xl font-black">
              {formatP4pGbp(sponsorshipGbp)}
            </dd>
          </div>
        </dl>
        <p className="mt-5 text-sm text-slate-600">{P4P_LIVE_CHALLENGE_FOOTER}</p>
      </article>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-black uppercase tracking-[0.14em] text-slate-700">
            What happens next?
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {P4P_CATEGORIES.map((category) => (
              <p
                key={category.id}
                className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-950"
              >
                {category.label}
              </p>
            ))}
          </div>
        </div>
        <aside
          data-testid="p4p-powered-by"
          className="w-full shrink-0 sm:w-44"
        >
          <p className="text-sm font-black uppercase tracking-[0.14em] text-slate-700">
            {P4P_POWERED_BY_LABEL}
          </p>
          <div className="mt-3 rounded-2xl border border-slate-300 bg-white p-4 text-center">
            <BrandMark
              name={brandName}
              logoUrl={sponsorLogo}
              large
              className="mx-auto h-20 w-20 text-xl"
            />
            <p className="mt-3 text-sm font-black text-slate-950">{brandName}</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
