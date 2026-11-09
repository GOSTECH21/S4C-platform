"use client";

import {
  ClimatePartnerSupplyCard,
  climatePartnerSupplyBadge,
} from "@/app/components/climate/ClimatePartnerSupplyCard";
import type { ClimateProject } from "@/app/services/votes.service";

export function FeaturedGssPicker({
  options,
  chosenId,
  onChoose,
}: {
  options: ClimateProject[];
  chosenId: string | null;
  onChoose: (id: string) => void;
  clubName?: string | null;
  clubCountry?: string | null;
}) {
  return (
    <div data-gss-one-global="gss-one-global-v1">
      <p className="max-w-3xl text-sm font-semibold text-slate-300">
        Choose Global Schools Solar as the Featured Climate Project. Then
        choose 4 Climate Partner Projects from the Local and National lists.
      </p>
      <div
        role="radiogroup"
        aria-label="Featured Climate Project"
        className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
      >
        {options.map((project) => {
          const chosen = project.id === chosenId;
          return (
            <button
              key={project.id}
              type="button"
              role="radio"
              aria-checked={chosen}
              onClick={() => onChoose(project.id)}
              className="text-left"
            >
              <ClimatePartnerSupplyCard
                project={project}
                badge={
                  chosen
                    ? climatePartnerSupplyBadge("featured")
                    : "Choose as Featured"
                }
                selected={chosen}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
