"use client";

import { DualSponsorStrip } from "@/app/components/fan/DualSponsorStrip";
import {
  climateImpactTags,
  climateProjectHeroClass,
} from "@/app/lib/match-day-local-sponsors";
import type { LocalSponsorRecord } from "@/app/lib/local-sponsor";
import { formatWalletGbp } from "@/app/lib/sponsor-wallet";

export function MatchDayProjectCard({
  project,
  cardIndex,
  clubName,
  leadName,
  leadLogoUrl,
  local,
  localScale = 1,
  selected = false,
  disabled = false,
  onToggle,
  showVote = true,
  showSponsors = true,
  fundedGbp,
}: {
  project: {
    id: string;
    name: string;
    description?: string | null;
    category?: string | null;
    image_url?: string | null;
  };
  cardIndex: number;
  clubName?: string;
  leadName?: string;
  leadLogoUrl?: string | null;
  local?: LocalSponsorRecord | null;
  localScale?: number;
  selected?: boolean;
  disabled?: boolean;
  onToggle?: () => void;
  showVote?: boolean;
  showSponsors?: boolean;
  fundedGbp?: number;
}) {
  const tags = climateImpactTags(project);
  const hero = climateProjectHeroClass(project);

  return (
    <article
      className={`flex h-full flex-col overflow-hidden rounded-3xl border bg-[#07150f] text-white shadow-xl ${
        selected ? "border-maroon-400 border-rose-400" : "border-white/10"
      }`}
    >
      <div className="relative h-36 overflow-hidden">
        {project.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={project.image_url}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <div className={`h-full w-full bg-gradient-to-br ${hero}`} />
        )}
        <span className="absolute right-3 top-3 flex h-12 w-12 items-center justify-center rounded-full bg-rose-700 text-2xl font-black text-white shadow-lg">
          {cardIndex}
        </span>
      </div>
      <div className="flex flex-1 flex-col px-4 pb-4 pt-4">
        <h3 className="flex items-start gap-3 text-lg font-black leading-tight">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-700 text-xl font-black text-white">
            {cardIndex}
          </span>
          <span>{project.name}</span>
        </h3>
        <p className="mt-2 flex-1 text-sm leading-6 text-slate-300">
          {project.description ||
            (clubName
              ? `A Match Day Climate Project posted by ${clubName}.`
              : "A Match Day Climate Project.")}
        </p>
        {showSponsors && leadName ? (
          <DualSponsorStrip
            leadName={leadName}
            leadLogoUrl={leadLogoUrl}
            localName={local?.brandName ?? null}
            localLogoUrl={local?.logoUrl}
            localTagline={local?.tagline}
            localScale={localScale}
          />
        ) : null}
        {typeof fundedGbp === "number" ? (
          <p className="mt-3 text-sm">
            <span className="text-slate-400">Received </span>
            <span className="font-black text-green-400">
              {formatWalletGbp(fundedGbp)}
            </span>
          </p>
        ) : null}
        <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[0.7rem] font-semibold text-emerald-300">
          {tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
        {showVote && onToggle ? (
          <button
            type="button"
            onClick={onToggle}
            disabled={disabled && !selected}
            className={`mt-4 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold transition ${
              selected
                ? "bg-rose-700 text-white"
                : disabled
                  ? "cursor-not-allowed bg-slate-800 text-slate-500"
                  : "bg-rose-800 text-white hover:bg-rose-700"
            }`}
          >
            <span
              className={`flex h-4 w-4 items-center justify-center rounded-sm border ${
                selected ? "border-white bg-white text-rose-800" : "border-white/70"
              }`}
            >
              {selected ? "✓" : ""}
            </span>
            Vote for this Project
          </button>
        ) : null}
      </div>
    </article>
  );
}
