"use client";

import { useEffect, useState } from "react";
import { showcaseImagesForProject } from "@/app/lib/project-images";
import {
  climateProjectBlurb,
  fallbackHeroImage,
} from "@/app/lib/fan-climate-project-cards";
import { climateImpactTags } from "@/app/lib/match-day-local-sponsors";
import { ClimateProjectCivBlock } from "@/app/components/climate/ClimateProjectCiv";

/** Compact Climate Partner supply card: same layout as the fan 1/5 card, ~1/3 size. */
export const CLIMATE_PARTNER_SUPPLY_STAMP = "climate-partner-supply-card-v1";
export const CLIMATE_PLATFORM_PROJECT_CARD_STAMP =
  "climate-platform-project-card-v1";

export function climatePartnerSupplyBadge(
  kind: "featured" | "local" | "national" | "international"
): string {
  if (kind === "featured") return "Featured climate project";
  if (kind === "local") return "Local climate project";
  if (kind === "national") return "National climate project";
  return "International climate project";
}

export function ClimatePartnerSupplyCard({
  project,
  badge,
  selected = false,
  fundedGbp = 0,
  className = "",
  children,
}: {
  project: {
    id: string;
    name: string;
    description?: string | null;
    category?: string | null;
    image_url?: string | null;
    location?: string | null;
    country?: string | null;
    funding_goal?: number | null;
    estimated_co2?: number | null;
    status?: string | null;
  };
  badge?: string;
  selected?: boolean;
  fundedGbp?: number;
  className?: string;
  children?: React.ReactNode;
}) {
  const photos = showcaseImagesForProject({
    id: project.id,
    image_url: project.image_url,
  });
  const hero =
    photos[0] ||
    project.image_url ||
    fallbackHeroImage(project.name, project.category);
  const blurb = climateProjectBlurb(project);
  const tags = climateImpactTags(project);
  const detailsId = `climate-project-details-${project.id}`;
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 640px)");
    const sync = () => setOpen(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  return (
    <article
      data-climate-partner-supply={CLIMATE_PARTNER_SUPPLY_STAMP}
      data-climate-platform-card={CLIMATE_PLATFORM_PROJECT_CARD_STAMP}
      className={`overflow-hidden rounded-2xl bg-s4p-paper p-3 text-slate-950 ${
        selected ? "ring-2 ring-s4p-mark" : ""
      } ${className}`}
    >
      {badge ? (
        <p className="inline-flex rounded-full bg-emerald-100 px-2.5 py-0.5 text-[0.65rem] font-semibold text-emerald-900">
          {badge}
        </p>
      ) : null}
      <h3 className="mt-2 text-lg font-black leading-tight tracking-tight sm:text-xl">
        {project.name}
      </h3>
      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500 sm:line-clamp-3">
        {blurb}
      </p>
      <div className="mt-3 overflow-hidden rounded-xl bg-emerald-50">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={hero}
          alt=""
          className="h-16 w-full object-cover sm:h-24 md:h-28"
        />
      </div>
      <h4 className="mt-3">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={detailsId}
          onClick={() => setOpen((current) => !current)}
          className="flex w-full items-center justify-between rounded-lg bg-emerald-50 px-3 py-2 text-left text-xs font-semibold uppercase tracking-[0.16em] text-emerald-800"
        >
          <span>Project details</span>
          <span>{open ? "Hide" : "Show"}</span>
        </button>
      </h4>
      {open ? (
        <div id={detailsId} className="mt-2">
          <ClimateProjectCivBlock
            project={project}
            fundedGbp={fundedGbp}
            compact
            tone="paper"
          />
          <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[0.7rem] font-semibold text-emerald-700">
            {tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
        </div>
      ) : null}
      {children}
    </article>
  );
}
