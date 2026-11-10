"use client";

import { s4pTabClass } from "@/app/lib/s4p-tabs";
import {
  CLIMATE_PROJECT_SCOPE_PROMPT,
  CLIMATE_PROJECT_SCOPES,
  climateProjectScopeButtonLabel,
  otherClimateProjectScopes,
  type ClimateProjectScope,
} from "@/app/lib/s4p-climate-projects";

export function ClubClimateProjectScopeChooser({
  selected = null,
  onChoose,
}: {
  selected?: ClimateProjectScope | null;
  onChoose: (scope: ClimateProjectScope) => void;
}) {
  return (
    <section
      id="select-climate-projects"
      className="mt-8 rounded-3xl border border-slate-700 bg-slate-900 p-6 sm:p-10"
    >
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-green-400">
        Climate Project Lists
      </p>
      <h2
        id="select-climate-projects-heading"
        className="mt-3 text-3xl font-black text-white md:text-4xl"
      >
        {CLIMATE_PROJECT_SCOPE_PROMPT}
      </h2>
      <p className="mt-4 max-w-3xl text-lg text-slate-300">
        Choose Local, National or International Projects.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {CLIMATE_PROJECT_SCOPES.map((scope) => (
          <button
            key={scope}
            type="button"
            aria-pressed={selected === scope}
            onClick={() => onChoose(scope)}
            className={`rounded-xl px-4 py-4 text-lg font-bold ${
              selected === scope
                ? s4pTabClass(true)
                : "bg-blue-600 text-white hover:bg-blue-500"
            }`}
          >
            {climateProjectScopeButtonLabel(scope)}
          </button>
        ))}
      </div>
    </section>
  );
}

export function ClubClimateProjectScopeTabs({
  current,
  onChoose,
}: {
  current: ClimateProjectScope;
  onChoose: (scope: ClimateProjectScope) => void;
}) {
  const others = otherClimateProjectScopes(current);
  return (
    <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
      {others.map((scope) => (
        <button
          key={scope}
          type="button"
          onClick={() => onChoose(scope)}
          className={`rounded-xl px-5 py-3 font-bold ${s4pTabClass(false)}`}
        >
          {climateProjectScopeButtonLabel(scope)}
        </button>
      ))}
    </div>
  );
}
