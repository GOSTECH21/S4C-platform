"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  castVote,
  getClimateProjectsForVoting,
  getOrCreateSupporter,
  getVotedProjectIds,
  removeVote,
  type ClimateProject,
} from "@/app/services/votes.service";
import FanNav from "../components/FanNav";

export default function VotePage() {
  const [projects, setProjects] = useState<ClimateProject[]>([]);
  const [votedIds, setVotedIds] = useState<Set<string>>(new Set());
  const [supporterId, setSupporterId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const supporter = await getOrCreateSupporter();

        if (!supporter) {
          window.location.href = "/login";
          return;
        }

        setSupporterId(supporter.id);

        const [projectList, voted] = await Promise.all([
          getClimateProjectsForVoting(),
          getVotedProjectIds(supporter.id),
        ]);

        setProjects(projectList);
        setVotedIds(voted);
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

  async function toggleVote(projectId: string) {
    if (!supporterId) return;

    const alreadyVoted = votedIds.has(projectId);
    setPendingId(projectId);
    setError(null);

    // Optimistic update.
    setVotedIds((prev) => {
      const next = new Set(prev);
      if (alreadyVoted) next.delete(projectId);
      else next.add(projectId);
      return next;
    });

    try {
      if (alreadyVoted) {
        await removeVote(supporterId, projectId);
      } else {
        await castVote(supporterId, projectId);
      }
    } catch (err) {
      console.error("Failed to update vote:", err);
      // Roll back on failure.
      setVotedIds((prev) => {
        const next = new Set(prev);
        if (alreadyVoted) next.add(projectId);
        else next.delete(projectId);
        return next;
      });
      setError(
        err instanceof Error ? err.message : "Failed to save your vote."
      );
    } finally {
      setPendingId(null);
    }
  }

  const voteCount = votedIds.size;

  return (
    <main className="min-h-screen bg-slate-950 p-8 text-white">
      <div className="mx-auto max-w-6xl">
        <FanNav />

        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-green-400">
              Vote for the planet
            </p>
            <h1 className="mt-3 text-4xl font-black">Climate Projects</h1>
            <p className="mt-3 max-w-2xl text-slate-300">
              These are the verified climate projects your support can help fund.
              Vote for every project you want your club and sponsors to back.
            </p>
          </div>

          <Link
            href="/dashboard/supporter/my-s4p"
            className="inline-flex h-fit items-center gap-2 rounded-xl border border-green-500/40 bg-green-500/10 px-5 py-3 font-bold text-green-300 hover:bg-green-500/20"
          >
            My S4P
            <span className="rounded-full bg-green-500 px-2 py-0.5 text-sm text-slate-950">
              {voteCount}
            </span>
          </Link>
        </div>

        {error && (
          <div className="mt-6 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-red-300">
            {error}
          </div>
        )}

        {loading ? (
          <p className="mt-12 text-slate-400">Loading climate projects...</p>
        ) : projects.length === 0 ? (
          <div className="mt-12 rounded-2xl border border-slate-800 bg-slate-900 p-8">
            <p className="text-slate-300">
              No active climate projects are available to vote on yet.
            </p>
          </div>
        ) : (
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {projects.map((project) => {
              const voted = votedIds.has(project.id);
              const isPending = pendingId === project.id;

              return (
                <div
                  key={project.id}
                  className={`flex flex-col rounded-2xl border p-6 transition ${
                    voted
                      ? "border-green-500 bg-green-950/20"
                      : "border-slate-800 bg-slate-900"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <h2 className="text-2xl font-bold">{project.name}</h2>
                    {project.category && (
                      <span className="whitespace-nowrap rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-300">
                        {project.category}
                      </span>
                    )}
                  </div>

                  {project.country && (
                    <p className="mt-1 text-sm text-slate-400">
                      📍 {project.country}
                    </p>
                  )}

                  <p className="mt-4 flex-1 text-slate-300">
                    {project.description}
                  </p>

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

                  <button
                    onClick={() => toggleVote(project.id)}
                    disabled={isPending}
                    className={`mt-6 w-full rounded-xl py-3 text-lg font-bold transition disabled:opacity-60 ${
                      voted
                        ? "bg-green-500 text-slate-950 hover:bg-green-400"
                        : "bg-slate-800 text-white hover:bg-slate-700"
                    }`}
                  >
                    {isPending
                      ? "Saving..."
                      : voted
                        ? "✓ Voted"
                        : "🌍 Vote for this project"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
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
