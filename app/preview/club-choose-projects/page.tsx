"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ClubNav from "@/app/components/club/ClubNav";
import ClubChooseProjectsCopy from "@/app/components/club/ClubChooseProjectsCopy";
import {
  ClubClimateProjectScopeChooser,
  ClubClimateProjectScopeTabs,
} from "@/app/components/club/ClubClimateProjectScopeChooser";
import {
  CLUB_ADDRESS_BOOKS_ID,
  CLUB_SELECT_PROJECTS_PATH,
} from "@/app/lib/routes";
import {
  SELECT_CLIMATE_PROJECTS_LABEL,
  SEND_INVITATION_LABEL,
} from "@/app/lib/partner-projects";
import { climateProjectListsForClub } from "@/app/lib/sccan-catalog";
import {
  ClimatePartnerSupplyCard,
  climatePartnerSupplyBadge,
} from "@/app/components/climate/ClimatePartnerSupplyCard";
import {
  climateProjectsForScope,
  climateProjectScopeHeading,
  type ClimateProjectScope,
} from "@/app/lib/s4p-climate-projects";

const LISTS = climateProjectListsForClub("Everton", "England");

export default function ClubChooseProjectsPreviewPage() {
  const [open, setOpen] = useState(false);
  const [scope, setScope] = useState<ClimateProjectScope | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requested = params.get("scope");
    if (
      requested === "local" ||
      requested === "national" ||
      requested === "international"
    ) {
      setOpen(true);
      setScope(requested);
      return;
    }
    if (params.get("open") === "1") setOpen(true);
  }, []);

  const visible = scope
    ? climateProjectsForScope(scope, LISTS).slice(0, 6)
    : [];

  return (
    <main className="min-h-screen p-4 text-white sm:p-10">
      <div className="mx-auto max-w-6xl">
        <ClubNav />
        <section className="mt-8 rounded-3xl border border-slate-700 bg-slate-900 p-10">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-green-400">
              Choose Projects
            </p>
            <div className="mx-auto mt-6 max-w-3xl text-left">
              <ClubChooseProjectsCopy />
            </div>
          </div>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="mt-10 block w-full rounded-xl bg-blue-600 py-4 text-center text-lg font-bold text-white hover:bg-blue-500"
          >
            {SELECT_CLIMATE_PROJECTS_LABEL}
          </button>
        </section>

        {open && scope === null ? (
          <ClubClimateProjectScopeChooser onChoose={setScope} />
        ) : null}

        {open && scope ? (
          <section className="mt-8">
            <p className="font-bold">{climateProjectScopeHeading(scope)}</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {visible.map((project) => (
                <ClimatePartnerSupplyCard
                  key={project.name}
                  project={{
                    id: project.name,
                    name: project.name,
                    description: project.description,
                    category: project.category,
                    image_url: null,
                    location: project.location,
                    country: project.country,
                  }}
                  badge={climatePartnerSupplyBadge(scope)}
                />
              ))}
            </div>
            <ClubClimateProjectScopeTabs current={scope} onChoose={setScope} />
            <Link
              href={`/preview/club-sponsors-address-books#${CLUB_ADDRESS_BOOKS_ID}`}
              className="mt-10 block w-full rounded-xl bg-green-500 py-4 text-center text-lg font-bold text-slate-950"
            >
              {SEND_INVITATION_LABEL}
            </Link>
            <p className="mt-3 text-sm text-slate-400">
              Live path: {CLUB_SELECT_PROJECTS_PATH}
            </p>
          </section>
        ) : null}
      </div>
    </main>
  );
}
