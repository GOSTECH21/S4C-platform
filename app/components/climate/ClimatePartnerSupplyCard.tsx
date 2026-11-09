"use client";

import { showcaseImagesForProject } from "@/app/lib/project-images";
import {
  climateProjectBlurb,
  fallbackHeroImage,
} from "@/app/lib/fan-climate-project-cards";

/** Compact Climate Partner supply card: same layout as the fan 1/5 card, ~1/3 size. */
export const CLIMATE_PARTNER_SUPPLY_STAMP = "climate-partner-supply-card-v1";

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
  };
  badge?: string;
  selected?: boolean;
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

  return (
    <article
      data-climate-partner-supply={CLIMATE_PARTNER_SUPPLY_STAMP}
      className={`overflow-hidden rounded-2xl bg-s4p-paper p-3 text-slate-950 ${
        selected ? "ring-2 ring-s4p-mark" : ""
      } ${className}`}
    >
      {badge ? (
        <p className="inline-flex rounded-full bg-emerald-100 px-2.5 py-0.5 text-[0.65rem] font-semibold text-emerald-900">
          {badge}
        </p>
      ) : null}
      <h3 className="mt-2 text-lg font-black leading-tight tracking-tight">
        {project.name}
      </h3>
      <p className="mt-1 line-clamp-3 text-xs leading-relaxed text-slate-500">
        {blurb}
      </p>
      <div className="mt-3 overflow-hidden rounded-xl bg-emerald-50">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={hero} alt="" className="h-24 w-full object-cover" />
      </div>
      {children}
    </article>
  );
}
