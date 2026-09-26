"use client";

import { useEffect, useState } from "react";
import FanNav from "@/app/dashboard/supporter/components/FanNav";
import { ClimateProjectGroupFolders } from "@/app/components/fan/ClimateProjectGroupFolders";
import { formatWalletGbp, type NumberedClimateProject } from "@/app/lib/sponsor-wallet";
import {
  archivePostedProjects,
  loadFundedProjects,
  readProjectArchive,
  type ArchivedClimateProject,
} from "@/app/lib/climate-funding";
import { fanVotingWindowCopy } from "@/app/lib/voting-window";

const PREVIEW_CLUB = "preview-hibs";
const CURRENT_WINDOW = {
  postedAt: "2026-09-20T12:00:00.000Z",
  matchDate: "2026-09-20",
  windowId: "2026-09-20",
};

const INITIAL: NumberedClimateProject[] = [
  { id: "gss", name: "Global Schools Solar", number: 1, fundedGbp: 0, votesReceived: 7 },
  { id: "wee", name: "Wee Spoke Hub", number: 2, fundedGbp: 0, votesReceived: 12 },
  { id: "retrofit", name: "Edinburgh Building Retrofit Collective", number: 3, fundedGbp: 0, votesReceived: 4 },
  { id: "porty", name: "Porty Community Energy", number: 4, fundedGbp: 0, votesReceived: 9 },
  { id: "craigshill", name: "Growing Together Craigshill", number: 5, fundedGbp: 0, votesReceived: 2 },
];

const PREVIOUS_WINDOWS: Array<{
  postedAt: string;
  matchDate: string;
  windowId: string;
  projects: NumberedClimateProject[];
}> = [
  {
    postedAt: "2026-08-16T12:00:00.000Z",
    matchDate: "2026-08-16",
    windowId: "2026-08-16",
    projects: [
      { id: "gss-aug", name: "Global Schools Solar", number: 1, fundedGbp: 12.5, votesReceived: 18 },
      { id: "heat", name: "Clean Heat Edinburgh", number: 2, fundedGbp: 8.1, votesReceived: 11 },
      { id: "cockenzie", name: "360 Centre Cockenzie", number: 3, fundedGbp: 4.2, votesReceived: 6 },
      { id: "farmhouse", name: "Bridgend Farmhouse", number: 4, fundedGbp: 3.4, votesReceived: 5 },
      { id: "fittie", name: "Fittie Community Hall and Garden", number: 5, fundedGbp: 6.7, votesReceived: 9 },
    ],
  },
  {
    postedAt: "2026-07-12T12:00:00.000Z",
    matchDate: "2026-07-12",
    windowId: "2026-07-12",
    projects: [
      { id: "porty-jul", name: "Porty Community Energy", number: 1, fundedGbp: 9.8, votesReceived: 14 },
      { id: "retrofit-jul", name: "Edinburgh Building Retrofit Collective", number: 2, fundedGbp: 5.6, votesReceived: 8 },
      { id: "craigshill-jul", name: "Growing Together Craigshill", number: 3, fundedGbp: 2.3, votesReceived: 4 },
      { id: "spoke-jul", name: "Wee Spoke Hub", number: 4, fundedGbp: 7.1, votesReceived: 10 },
      { id: "coast-jul", name: "Paws on Plastic", number: 5, fundedGbp: 1.9, votesReceived: 3 },
    ],
  },
];

function seedPreviewArchive() {
  for (const row of PREVIOUS_WINDOWS) {
    archivePostedProjects(PREVIEW_CLUB, row.projects, {
      postedAt: row.postedAt,
      matchDate: row.matchDate,
      windowId: row.windowId,
    });
  }
}

export default function ClimateProjectsPreviewPage() {
  const [projects, setProjects] = useState(INITIAL);
  const [archive, setArchive] = useState<ArchivedClimateProject[]>([]);

  useEffect(() => {
    seedPreviewArchive();
    const current = loadFundedProjects(PREVIEW_CLUB, INITIAL, CURRENT_WINDOW.windowId);
    setProjects(current);
    archivePostedProjects(PREVIEW_CLUB, current, CURRENT_WINDOW);
    setArchive(readProjectArchive(PREVIEW_CLUB));
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 p-8 text-white">
      <div className="mx-auto max-w-6xl">
        <FanNav />
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-green-400">
          Climate Projects
        </p>
        <h1 className="mt-2 text-4xl font-black">Climate Projects</h1>
        <p className="mt-3 max-w-2xl text-slate-300">
          Check Received totals here at any time. Vote on My S4P. Open a climate
          project group Folder to see every previous project your club
          Sustainability Director posted. {fanVotingWindowCopy()}
        </p>

        <section className="mt-10 space-y-8">
          <div className="rounded-2xl border border-green-500/30 bg-slate-900 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-green-400">
              Project Voted For this Match Day
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
            <h2 className="text-2xl font-black">Current Climate Project List</h2>
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
                  <p className="mt-3 text-sm text-slate-400">Received</p>
                  <p className="text-xl font-black text-green-400">
                    {formatWalletGbp(project.fundedGbp)}
                  </p>
                </li>
              ))}
            </ol>
          </div>

          <ClimateProjectGroupFolders
            clubName="Hibernian"
            archive={archive}
            currentWindowId={CURRENT_WINDOW.windowId}
          />
        </section>
      </div>
    </main>
  );
}
