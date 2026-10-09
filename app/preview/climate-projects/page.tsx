"use client";

import { useEffect, useState } from "react";
import FanNav from "@/app/dashboard/supporter/components/FanNav";
import { formatWalletGbp, type NumberedClimateProject } from "@/app/lib/sponsor-wallet";
import { loadFundedProjects } from "@/app/lib/climate-funding";
import { climateProjectsReceivedCopy } from "@/app/lib/voting-window";
import { ProjectSiteLine } from "@/app/components/climate/ProjectSiteLine";
import { nearbyProjectsCopy } from "@/app/lib/project-site";

const PREVIEW_CLUB = "preview-hibs";

const INITIAL: NumberedClimateProject[] = [
  { id: "gss", name: "Global Schools Solar", number: 1, fundedGbp: 0, votesReceived: 7 },
  { id: "wee", name: "Wee Spoke Hub", number: 2, fundedGbp: 0, votesReceived: 12 },
  { id: "retrofit", name: "Edinburgh Building Retrofit Collective", number: 3, fundedGbp: 0, votesReceived: 4 },
  { id: "porty", name: "Porty Community Energy", number: 4, fundedGbp: 0, votesReceived: 9 },
  { id: "craigshill", name: "Growing Together Craigshill", number: 5, fundedGbp: 0, votesReceived: 2 },
];

export default function ClimateProjectsPreviewPage() {
  const [projects, setProjects] = useState(INITIAL);

  useEffect(() => {
    setProjects(loadFundedProjects(PREVIEW_CLUB, INITIAL));
  }, []);

  return (
    <main className="min-h-screen p-8 text-white">
      <div className="mx-auto max-w-6xl">
        <FanNav />
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-green-400">
          Climate Projects
        </p>
        <h1 className="mt-2 text-4xl font-black">Climate Projects</h1>
        <p className="mt-3 max-w-2xl text-slate-300">
          {climateProjectsReceivedCopy()}
        </p>
        <p className="mt-2 max-w-2xl text-sm text-emerald-300">
          {nearbyProjectsCopy("Hibernian")}
        </p>

        <section className="mt-10 space-y-8">
          <div className="rounded-2xl border border-green-500/30 bg-slate-900 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-green-400">
              Projects Voted for
            </p>
            <h2 className="mt-2 text-2xl font-black">Hibernian</h2>
            <ul className="mt-4 space-y-1 text-slate-300">
              {projects.map((project) => (
                <li key={project.id}>
                  • Project {project.number}: {project.name} —{" "}
                  {formatWalletGbp(project.fundedGbp)}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-black">Climate Project list</h2>
            <p className="mt-1 text-sm text-slate-400">
              The Received amount on each project is the running total from every
              fan during this 5-day Vote.
            </p>
            <ol className="mt-4 grid gap-3 md:grid-cols-5">
              {projects.map((project) => (
                <li
                  key={project.id}
                  className="rounded-2xl border border-slate-800 bg-slate-900 p-4"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-green-400">
                    Project {project.number}
                  </p>
                  <h3 className="mt-2 font-bold leading-tight text-white">
                    {project.name}
                  </h3>
                  <div className="mt-2">
                    <ProjectSiteLine project={project} clubName="Hibernian" />
                  </div>
                  <p className="mt-3 text-sm text-slate-400">Received</p>
                  <p className="text-xl font-black text-green-400">
                    {formatWalletGbp(project.fundedGbp)}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </div>
    </main>
  );
}
