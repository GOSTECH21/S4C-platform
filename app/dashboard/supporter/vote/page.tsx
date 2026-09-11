"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getOrCreateSupporter,
  getVotedAndFundedProjects,
  type ClimateProject,
} from "@/app/services/votes.service";
import FanNav from "../components/FanNav";
import { SUPPORTER_CAMPAIGN_PATH } from "@/app/lib/routes";

export default function VotePage() {
  const [voted, setVoted] = useState<ClimateProject[]>([]);
  const [funded, setFunded] = useState<ClimateProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const supporter = await getOrCreateSupporter();

        if (!supporter) {
          window.location.href = "/fan/login";
          return;
        }

        const lists = await getVotedAndFundedProjects(supporter.id);
        setVoted(votedProjectsOnly(lists.voted, lists.funded));
        setFunded(lists.funded);
      } catch (err) {
        console.error("Failed to load climate projects:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load climate projects."
        );
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 p-8 text-white">
      <div className="mx-auto max-w-6xl">
        <FanNav />

        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-green-400">
              Your climate votes
            </p>
            <h1 className="mt-3 text-4xl font-black">Climate Projects</h1>
          </div>

          <Link
            href={SUPPORTER_CAMPAIGN_PATH}
            className="inline-flex h-fit items-center gap-2 rounded-xl border border-green-500/40 bg-green-500/10 px-5 py-3 font-bold text-green-300 hover:bg-green-500/20"
          >
            My S4P
            <span className="rounded-full bg-green-500 px-2 py-0.5 text-sm text-slate-950">
              {voted.length + funded.length}
            </span>
          </Link>
        </div>

        {error && (
          <div className="mt-6 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-red-300">
            {error}
          </div>
        )}

        <section className="mt-10">
          <p className="max-w-2xl text-slate-300">
            These are the verified climate projects that you have Voted for
          </p>

          {loading ? (
            <p className="mt-8 text-slate-400">Loading your votes...</p>
          ) : voted.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-dashed border-slate-700 bg-slate-900 p-8">
              <p className="text-slate-300">
                You have not voted for any climate projects yet. Choose three on
                My S4P.
              </p>
            </div>
          ) : (
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              {voted.map((project) => (
                <HistoryCard key={project.id} project={project} />
              ))}
            </div>
          )}
        </section>

        <section className="mt-16">
          <p className="max-w-2xl text-slate-300">
            These are verified climate projects you Voted for that are funded
          </p>

          {loading ? (
            <p className="mt-8 text-slate-400">Loading funded projects...</p>
          ) : funded.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-dashed border-slate-700 bg-slate-900 p-8">
              <p className="text-slate-300">
                None of your voted projects have been funded yet. They will
                appear here after a match unlocks climate funding.
              </p>
            </div>
          ) : (
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              {funded.map((project) => (
                <HistoryCard key={project.id} project={project} funded />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function votedProjectsOnly(
  voted: ClimateProject[],
  funded: ClimateProject[]
): ClimateProject[] {
  const fundedIds = new Set(funded.map((project) => project.id));
  return voted.filter((project) => !fundedIds.has(project.id));
}

function HistoryCard({
  project,
  funded = false,
}: {
  project: ClimateProject;
  funded?: boolean;
}) {
  return (
    <div className="flex flex-col rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <div className="flex items-start justify-between gap-4">
        <h2 className="text-2xl font-bold">{project.name}</h2>
        {funded ? (
          <span className="whitespace-nowrap rounded-full bg-green-500/15 px-3 py-1 text-xs font-semibold text-green-400">
            Funded
          </span>
        ) : project.category ? (
          <span className="whitespace-nowrap rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-300">
            {project.category}
          </span>
        ) : null}
      </div>

      {project.country && (
        <p className="mt-1 text-sm text-slate-400">📍 {project.country}</p>
      )}

      <p className="mt-4 flex-1 text-slate-300">{project.description}</p>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <Stat
          label="Est. CO₂ saved"
          value={
            project.estimated_co2 != null
              ? `${project.estimated_co2.toLocaleString()} t`
              : "TBC"
          }
        />
        <Stat
          label="Funding goal"
          value={
            project.funding_goal != null
              ? `£${project.funding_goal.toLocaleString()}`
              : "TBC"
          }
        />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-950/60 p-4">
      <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-lg font-bold text-green-400">{value}</p>
    </div>
  );
}
