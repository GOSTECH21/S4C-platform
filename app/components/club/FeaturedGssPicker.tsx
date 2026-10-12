"use client";

import { climateProjectCountryLabel } from "@/app/lib/featured-climate-country";
import { ClimateProjectCivBlock } from "@/app/components/climate/ClimateProjectCiv";
import type { ClimateProject } from "@/app/services/votes.service";

export function FeaturedGssPicker({
  options,
  chosenId,
  onChoose,
  clubName,
  clubCountry,
}: {
  options: ClimateProject[];
  chosenId: string | null;
  onChoose: (id: string) => void;
  clubName?: string | null;
  clubCountry?: string | null;
}) {
  return (
    <div>
      <p className="max-w-3xl text-sm font-semibold text-slate-300">
        Choose one Featured Climate Project. There can never be two Featured projects.
      </p>
      <div
        role="radiogroup"
        aria-label="Featured Climate Project"
        className="mt-4 grid gap-4 md:grid-cols-2"
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
              className={`rounded-2xl border p-6 text-left ${
                chosen
                  ? "border-s4p-mark bg-green-500/10 ring-2 ring-s4p-mark"
                  : "border-slate-700 bg-slate-950 hover:border-s4p-mark"
              }`}
            >
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.25em] text-green-400">
                {chosen
                  ? "Featured Climate Project"
                  : "Choose as Featured"}
              </p>
              <h2 className="mt-2 text-2xl font-bold">{project.name}</h2>
              <p className="mt-2 text-slate-300">{project.description}</p>
              <p className="mt-3 text-sm text-slate-400">
                {climateProjectCountryLabel(project, {
                  clubName,
                  country: clubCountry,
                })}
              </p>
              <ClimateProjectCivBlock project={project} compact={false} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
