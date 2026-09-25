"use client";

import { useMemo, useState } from "react";
import FanNav from "@/app/dashboard/supporter/components/FanNav";
import { ClimateProjectsLeaderboard } from "@/app/components/fan/ClimateProjectsLeaderboard";
import type { ClimateProjectVoteRow } from "@/app/lib/climate-projects-leaderboard";
import { fanVotingWindowCopy } from "@/app/lib/voting-window";

const INITIAL: ClimateProjectVoteRow[] = [
  { id: "gss", name: "Global Schools Solar", votesReceived: 7, fundingGoal: 80000 },
  { id: "wee", name: "Wee Spoke Hub", votesReceived: 12, fundingGoal: 65000 },
  { id: "retrofit", name: "Edinburgh Building Retrofit Collective", votesReceived: 4, fundingGoal: 90000 },
  { id: "porty", name: "Porty Community Energy", votesReceived: 9, fundingGoal: 160000 },
  { id: "craigshill", name: "Growing Together Craigshill", votesReceived: 2, fundingGoal: 40000 },
];

const REQUIRED_VOTES = 3;
const TOTAL_AMOUNT = 50000;
const AMOUNT_PER_VOTE = 1000;

export default function ClimateProjectsPreviewPage() {
  const [projects, setProjects] = useState(INITIAL);
  const [votedIds, setVotedIds] = useState<Set<string>>(
    () => new Set(["wee", "porty"])
  );
  const votedNames = useMemo(
    () => projects.filter((project) => votedIds.has(project.id)).map((row) => row.name),
    [projects, votedIds]
  );

  function vote(projectId: string) {
    if (votedIds.has(projectId) || votedIds.size >= REQUIRED_VOTES) return;
    setVotedIds((prev) => new Set([...prev, projectId]));
    setProjects((prev) =>
      prev.map((row) =>
        row.id === projectId
          ? { ...row, votesReceived: row.votesReceived + 1 }
          : row
      )
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 p-8 text-white">
      <div className="mx-auto max-w-6xl">
        <FanNav />
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-green-400">
          Climate Projects
        </p>
        <h1 className="mt-2 text-4xl font-black">Climate Projects Leaderboard</h1>
        <p className="mt-3 max-w-2xl text-slate-300">
          Projects you have voted for appear in the box. Press Vote on the
          leaderboard; the remaining amount reduces by the rate Hibernian
          stipulated. {fanVotingWindowCopy()}
        </p>

        <section className="mt-10 space-y-8">
          <div className="rounded-2xl border border-green-500/30 bg-slate-900 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-green-400">
              Projects Voted for
            </p>
            <h2 className="mt-2 text-2xl font-black">Hibernian</h2>
            <ul className="mt-4 space-y-1 text-slate-300">
              {votedNames.map((name) => (
                <li key={name}>• {name}</li>
              ))}
            </ul>
          </div>

          <ClimateProjectsLeaderboard
            clubName="Hibernian"
            projects={projects}
            votedIds={votedIds}
            requiredVotes={REQUIRED_VOTES}
            totalAmount={TOTAL_AMOUNT}
            amountPerVote={AMOUNT_PER_VOTE}
            onVote={vote}
          />
        </section>
      </div>
    </main>
  );
}
