"use client";

import { useEffect, useState } from "react";
import FanNav from "@/app/dashboard/supporter/components/FanNav";
import { MatchDayWalletVote } from "@/app/components/fan/MatchDayWalletVote";
import {
  allocateWalletVote,
  createLocalWallet,
  formatWalletGbp,
  remainingGbp,
  type ClimateWallet,
  type NumberedClimateProject,
} from "@/app/lib/sponsor-wallet";
import { loadFundedProjects, writeProjectFunding } from "@/app/lib/climate-funding";
import { fanVotingWindowCopy } from "@/app/lib/voting-window";

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
  const [wallet, setWallet] = useState<ClimateWallet>(() =>
    createLocalWallet({
      clubName: "Hibernian",
      brandName: "Top Cellar",
      sponsorshipGbp: 750,
    })
  );

  useEffect(() => {
    setProjects(loadFundedProjects(PREVIEW_CLUB, INITIAL));
  }, []);

  function vote(_brandName: string, projectNumber: string) {
    const result = allocateWalletVote({
      wallet,
      projects,
      projectNumber: Number(projectNumber),
    });
    if (!result.ok) return;
    setWallet(result.wallet);
    setProjects(result.projects);
    writeProjectFunding(PREVIEW_CLUB, result.projects);
  }

  return (
    <main className="min-h-screen bg-slate-950 p-8 text-white">
      <div className="mx-auto max-w-6xl">
        <FanNav />
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-green-400">
          Climate Projects
        </p>
        <h1 className="mt-2 text-4xl font-black">Climate Projects</h1>
        <p className="mt-3 max-w-2xl text-slate-300">
          Received amounts are the running 5-day total. Check them here at any
          time. {fanVotingWindowCopy()}
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

          <MatchDayWalletVote
            clubName="Hibernian"
            projects={projects}
            sponsors={[
              {
                brandName: wallet.brandName,
                kind: wallet.kind,
                remainingGbp: remainingGbp(wallet),
              },
            ]}
            onVote={vote}
          />
        </section>
      </div>
    </main>
  );
}
