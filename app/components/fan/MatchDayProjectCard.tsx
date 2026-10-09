"use client";

import { useState } from "react";
import { DualSponsorStrip } from "@/app/components/fan/DualSponsorStrip";
import { ClimateProjectCivBlock } from "@/app/components/climate/ClimateProjectCiv";
import { ProjectSiteLine } from "@/app/components/climate/ProjectSiteLine";
import { climateImpactTags } from "@/app/lib/match-day-local-sponsors";
import type { LocalSponsorRecord } from "@/app/lib/local-sponsor";

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
  showVote = false,
  showSponsors = true,
  fundedGbp,
}: {
  project: {
    id: string;
    name: string;
    description?: string | null;
    category?: string | null;
    image_url?: string | null;
    estimated_co2?: number | null;
    funding_goal?: number | null;
    location?: string | null;
    status?: string | null;
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
  const [open, setOpen] = useState(false);
  const tags = climateImpactTags(project);
  const detailsId = `project-details-${project.id}`;

  return (
    <article
      className={`overflow-hidden rounded-2xl border bg-[#07150f] text-white shadow-xl ${
        selected ? "border-maroon-400 border-rose-400" : "border-white/10"
      }`}
    >
      <h3 className="text-lg font-black leading-tight">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={detailsId}
          onClick={() => setOpen((current) => !current)}
          className="flex w-full items-center gap-3 px-4 py-3 text-left"
        >
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rose-700 text-lg font-black text-white">
            {cardIndex}
          </span>
          <span className="flex-1">{project.name}</span>
          <span className="shrink-0 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-300">
            {open ? "Hide" : "Details"}
          </span>
        </button>
      </h3>
      {open ? (
        <div id={detailsId} className="flex flex-1 flex-col px-4 pb-4">
          {project.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={project.image_url}
              alt=""
              className="mb-3 h-36 w-full rounded-2xl object-cover"
            />
          ) : null}
          <p className="flex-1 text-sm leading-6 text-slate-300">
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
          <div className="mt-2">
            <ProjectSiteLine project={project} clubName={clubName} />
          </div>
          <ClimateProjectCivBlock
            project={project}
            fundedGbp={typeof fundedGbp === "number" ? fundedGbp : 0}
          />
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
              FUND-IT this Project
            </button>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
