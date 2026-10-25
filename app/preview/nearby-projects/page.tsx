"use client";

import { ClimateProjectListingForm } from "@/app/components/climate/ClimateProjectListingForm";
import { ProjectSiteLine } from "@/app/components/climate/ProjectSiteLine";
import {
  LISTED_PROJECT_SITES,
  STADIUM_NEARBY_PROJECT_MILES,
  nearbyProjectsCopy,
  nearbyProjectsForClub,
  stadiumSiteForClub,
} from "@/app/lib/project-site";
import { nearbyClimateProjectsForClub } from "@/app/lib/stadium-nearby-projects";

const CLUBS = [
  "Hibernian",
  "Hearts of Midlothian",
  "Arsenal",
  "Swansea City",
] as const;

const FAR_NAMES = [
  "360 Centre Cockenzie",
  "South Seeds",
  "Fittie Community Hall and Garden",
];

function localBusinessCheck(postcode: string, clubName: string) {
  return `${postcode} can register as a Local Business Climate Sponsor for ${clubName}.`;
}

export default function NearbyProjectsPreviewPage() {
  const listed = LISTED_PROJECT_SITES;

  return (
    <main className="min-h-screen p-8 text-white">
      <div className="mx-auto max-w-6xl">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-green-400">
          Preview
        </p>
        <h1 className="mt-2 text-4xl font-black">
          Climate Projects within {STADIUM_NEARBY_PROJECT_MILES} miles
        </h1>
        <p className="mt-3 max-w-3xl text-slate-300">
          Climate Project Providers now enter the postcode and address where
          the project is implemented. Public listings for existing partners
          (Bridgend Farmhouse, Porty Community Energy, Edinburgh Remakery, Wee
          Spoke Hub, Cargo Bike Movement, Islington Clean Air Schools) are
          matched to Hearts, Hibernian and Arsenal stadium postcodes.
        </p>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {CLUBS.map((clubName) => {
            const stadium = stadiumSiteForClub(clubName);
            const nearby = nearbyProjectsForClub(
              listed,
              clubName,
              STADIUM_NEARBY_PROJECT_MILES
            );
            const nearbyList = nearbyClimateProjectsForClub(clubName);
            return (
              <section
                key={clubName}
                className="rounded-2xl border border-slate-800 bg-slate-900 p-5"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-green-400">
                  {clubName}
                </p>
                <h2 className="mt-2 text-xl font-black">
                  {stadium?.address.split(",")[0]}
                </h2>
                <p className="mt-1 text-sm text-emerald-300">
                  Stadium postcode {stadium?.postcode}
                </p>
                <p className="mt-3 text-sm text-slate-400">
                  {nearbyProjectsCopy(clubName)}
                </p>
                <ul className="mt-4 space-y-3">
                  {nearby.map((row) => (
                    <li key={row.project.name}>
                      <p className="font-bold">{row.project.name}</p>
                      <ProjectSiteLine
                        project={row.project}
                        clubName={clubName}
                      />
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-xs uppercase tracking-[0.16em] text-slate-500">
                  Climate Projects near my Stadium ({nearbyList.length})
                </p>
                <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-slate-300">
                  {nearbyList.map((project) => (
                    <li key={project.name}>{project.name}</li>
                  ))}
                </ol>
              </section>
            );
          })}
        </div>

        <section className="mt-10 rounded-2xl border border-amber-500/30 bg-slate-900 p-6">
          <h2 className="text-2xl font-black">Outside the 5-mile radius</h2>
          <p className="mt-2 text-sm text-slate-400">
            These listed projects stay in the national catalog but are not
            treated as near Easter Road, Tynecastle or the Emirates.
          </p>
          <ul className="mt-4 grid gap-3 md:grid-cols-3">
            {FAR_NAMES.map((name) => {
              const site = LISTED_PROJECT_SITES.find((row) => row.name === name);
              return (
                <li
                  key={name}
                  className="rounded-xl border border-slate-800 bg-slate-950 p-4"
                >
                  <p className="font-bold">{name}</p>
                  <p className="mt-1 text-sm text-slate-400">
                    {site?.address}, {site?.postcode}
                  </p>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="mt-10 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-2xl font-black">
            Local Business Climate Sponsors
          </h2>
          <p className="mt-2 max-w-3xl text-sm text-slate-400">
            A Local Business Climate Sponsor can choose any club. Their brand
            is shown to that club&apos;s fans, wherever those fans are.
          </p>
          <ul className="mt-4 space-y-2 text-sm text-slate-300">
            <li>
              EH6 6AD (Leith) can sponsor Hibernian —{" "}
              {localBusinessCheck("EH6 6AD", "Hibernian")}
            </li>
            <li>
              G41 2LG (Glasgow Southside) can sponsor Hibernian —{" "}
              {localBusinessCheck("G41 2LG", "Hibernian")}
            </li>
            <li>
              N7 6PA (Holloway) can sponsor Arsenal —{" "}
              {localBusinessCheck("N7 6PA", "Arsenal")}
            </li>
          </ul>
        </section>

        <div className="mt-12">
          <ClimateProjectListingForm
            defaultCountry="Scotland"
            defaultSignerName=""
            heading="Climate Project Form"
            intro="Postcode and address of implementation are required so fans can FUND-IT local Climate Projects. Local Business Climate Sponsors can choose any club so their brand is visible to that club's fans."
          />
        </div>
      </div>
    </main>
  );
}
