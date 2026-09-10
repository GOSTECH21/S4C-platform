"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getOrCreateSupporter,
  getVotedProjects,
  type ClimateProject,
  type Supporter,
} from "@/app/services/votes.service";
import { summariseImpact, type ImpactSummary } from "@/app/lib/impact";
import FanNav from "../components/FanNav";

export default function MyS4PPage() {
  const [supporter, setSupporter] = useState<Supporter | null>(null);
  const [projects, setProjects] = useState<ClimateProject[]>([]);
  const [impact, setImpact] = useState<ImpactSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const currentSupporter = await getOrCreateSupporter();

        if (!currentSupporter) {
          window.location.href = "/login";
          return;
        }

        setSupporter(currentSupporter);

        const voted = await getVotedProjects(currentSupporter.id);
        setProjects(voted);
        setImpact(summariseImpact(voted));
      } catch (err) {
        console.error("Failed to load My S4P:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load your S4P page."
        );
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const displayName = supporter?.full_name || supporter?.email || "Supporter";

  return (
    <main className="min-h-screen bg-slate-950 p-8 text-white">
      <div className="mx-auto max-w-6xl">
        <FanNav />

        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-green-400">
          My S4P
        </p>
        <h1 className="mt-3 text-4xl font-black">
          {loading ? "Your climate impact" : `${displayName}'s climate impact`}
        </h1>
        <p className="mt-3 max-w-2xl text-slate-300">
          Every project you vote for helps direct climate funding. Here is the
          estimated impact of the projects you support.
        </p>

        {error && (
          <div className="mt-6 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-red-300">
            {error}
          </div>
        )}

        {loading ? (
          <p className="mt-12 text-slate-400">Loading your impact...</p>
        ) : projects.length === 0 ? (
          <div className="mt-12 rounded-2xl border border-slate-800 bg-slate-900 p-8">
            <h2 className="text-2xl font-bold">You haven&apos;t voted yet</h2>
            <p className="mt-3 text-slate-300">
              Vote for the climate projects you care about and your estimated
              impact will appear here.
            </p>
            <Link
              href="/dashboard/supporter/vote"
              className="mt-6 inline-block rounded-xl bg-green-500 px-6 py-3 font-bold text-slate-950 hover:bg-green-400"
            >
              Browse Climate Projects
            </Link>
          </div>
        ) : (
          <>
            {impact && (
              <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
                <ImpactCard
                  label="Projects supported"
                  value={impact.projectCount.toLocaleString()}
                  hint={
                    impact.categories.length > 0
                      ? impact.categories.join(" · ")
                      : undefined
                  }
                />
                <ImpactCard
                  label="Estimated CO₂ saved"
                  value={`${impact.totalCo2.toLocaleString()} t`}
                  hint="Across all your projects"
                />
                <ImpactCard
                  label="≈ Trees planted"
                  value={impact.treesEquivalent.toLocaleString()}
                  hint="Equivalent yearly absorption"
                />
                <ImpactCard
                  label="≈ Cars off the road"
                  value={impact.carsOffRoad.toLocaleString()}
                  hint="For one year"
                />
              </div>
            )}

            {impact && impact.totalFunding > 0 && (
              <p className="mt-6 text-slate-300">
                Total funding goal of your projects:{" "}
                <span className="font-bold text-green-400">
                  £{impact.totalFunding.toLocaleString()}
                </span>
                {impact.countries.length > 0 && (
                  <>
                    {" "}
                    across{" "}
                    <span className="font-bold text-green-400">
                      {impact.countries.length}
                    </span>{" "}
                    {impact.countries.length === 1 ? "country" : "countries"}.
                  </>
                )}
              </p>
            )}

            <h2 className="mt-12 text-2xl font-bold">
              Projects you&apos;ve voted for
            </h2>

            <div className="mt-6 grid gap-6 md:grid-cols-2">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="flex flex-col rounded-2xl border border-slate-800 bg-slate-900 p-6"
                >
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-xl font-bold">{project.name}</h3>
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

                  <p className="mt-3 flex-1 text-slate-300">
                    {project.description}
                  </p>

                  <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-950/60 p-4">
                    <span className="text-xs uppercase tracking-wide text-slate-400">
                      Your estimated impact
                    </span>
                    <span className="text-lg font-bold text-green-400">
                      {project.estimated_co2 != null
                        ? `${project.estimated_co2.toLocaleString()} t CO₂`
                        : "TBC"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}

function ImpactCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-3 text-3xl font-black text-green-400">{value}</p>
      {hint && <p className="mt-2 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}
