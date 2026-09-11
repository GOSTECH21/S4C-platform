"use client";

import { useEffect, useState } from "react";
import {
  getMyS4PCampaign,
  getOrCreateSupporter,
  getVotedProjectIds,
  submitCampaignVotes,
  type ClimateProject,
  type S4PCampaign,
} from "@/app/services/votes.service";
import { summariseImpact } from "@/app/lib/impact";

export default function MyS4PDashboardPage() {
  const [supporterId, setSupporterId] = useState<string | null>(null);
  const [campaign, setCampaign] = useState<S4PCampaign | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const supporter = await getOrCreateSupporter();
        if (!supporter) {
          window.location.href = "/fan/login";
          return;
        }
        setSupporterId(supporter.id);

        const camp = await getMyS4PCampaign(supporter);
        setCampaign(camp);

        if (camp) {
          const voted = await getVotedProjectIds(supporter.id);
          const voteable = voteableProjects(camp);
          const preselected = voteable
            .map((p) => p.id)
            .filter((id) => voted.has(id));
          if (preselected.length > 0) {
            setSelected(new Set(preselected.slice(0, camp.requiredVotes)));
            setSubmitted(true);
          }
        }
      } catch (err) {
        console.error("Failed to load My S4P campaign:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load your campaign."
        );
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const required = campaign?.requiredVotes ?? 3;
  const voteable = campaign ? voteableProjects(campaign) : [];

  function toggle(projectId: string) {
    setSubmitted(false);
    setError(null);
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(projectId)) {
        next.delete(projectId);
      } else if (next.size < required) {
        next.add(projectId);
      }
      return next;
    });
  }

  async function submit() {
    if (!supporterId || !campaign || selected.size !== required) return;
    setSubmitting(true);
    setError(null);
    try {
      await submitCampaignVotes(
        supporterId,
        [...selected],
        voteable.map((project) => project.id),
        campaign.campaignId
      );
      setSubmitted(true);
    } catch (err) {
      console.error("Failed to submit vote:", err);
      setError(
        err instanceof Error ? err.message : "Failed to submit your vote."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className="px-8 pb-16 text-white">
        <p className="text-slate-400">Loading your campaign...</p>
      </main>
    );
  }

  if (!campaign) {
    return (
      <main className="px-8 pb-16 text-white">
        <div className="mx-auto max-w-5xl rounded-2xl border border-slate-800 bg-slate-900 p-8">
          <h2 className="text-2xl font-bold">No active campaign yet</h2>
          <p className="mt-3 text-slate-300">
            Your club hasn&apos;t pushed a match climate campaign to your S4P
            page yet. Check back on match day.
          </p>
        </div>
      </main>
    );
  }

  const selectedProjects = voteable.filter((p) => selected.has(p.id));
  const impact = summariseImpact(selectedProjects);
  const canSubmit = selected.size === required && !submitting;

  return (
    <main className="pb-40 text-white">
      <div className="mx-auto max-w-5xl px-8">
        <div className="text-center">
          <h1 className="text-3xl font-black md:text-4xl">
            {campaign.matchTitle} Climate Campaign
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-slate-300">
            Vote for the{" "}
            <span className="font-bold text-white">
              {numberWord(required).toUpperCase()}
            </span>{" "}
            climate projects you want funded if your club scores.
          </p>

          <div className="mt-5 inline-flex items-center rounded-lg bg-green-600 px-5 py-2 text-sm font-bold text-white">
            Sponsor Commitment: £{campaign.amountPerGoal.toLocaleString()} per
            Goal
          </div>
        </div>

        {error && (
          <div className="mt-6 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-center text-red-300">
            {error}
          </div>
        )}

        {submitted && !error && (
          <div className="mt-6 rounded-xl border border-green-500/40 bg-green-500/10 p-4 text-center text-green-300">
            ✓ Your vote has been submitted. If {campaign.clubName} scores, £
            {campaign.amountPerGoal.toLocaleString()} per goal will be split
            across your {required} chosen projects.
          </div>
        )}

        {campaign.featuredProject && (
          <div className="mt-10">
            <ProjectCard
              project={campaign.featuredProject}
              featured
              isSelected={selected.has(campaign.featuredProject.id)}
              disabled={
                !selected.has(campaign.featuredProject.id) &&
                selected.size >= required
              }
              onToggle={() => toggle(campaign.featuredProject!.id)}
            />
          </div>
        )}

        {campaign.projects.length > 0 && (
          <h2 className="mt-10 text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">
            Club climate projects
          </h2>
        )}

        <div className="mt-4 grid gap-6 md:grid-cols-2">
          {campaign.projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              isSelected={selected.has(project.id)}
              disabled={!selected.has(project.id) && selected.size >= required}
              onToggle={() => toggle(project.id)}
            />
          ))}
        </div>

        {submitted && selectedProjects.length > 0 && impact.totalCo2 > 0 && (
          <div className="mt-10 rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h3 className="text-lg font-bold">Estimated impact of your vote</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <ImpactStat
                label="Est. CO₂ funded"
                value={`${impact.totalCo2.toLocaleString()} t`}
              />
              <ImpactStat
                label="≈ Trees planted"
                value={impact.treesEquivalent.toLocaleString()}
              />
              <ImpactStat
                label="≈ Cars off the road"
                value={impact.carsOffRoad.toLocaleString()}
              />
            </div>
          </div>
        )}
      </div>

      <div className="fixed inset-x-0 bottom-0 border-t border-slate-800 bg-slate-950/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-8 py-5 sm:flex-row sm:justify-between">
          <div>
            <p className="font-bold">Your Vote</p>
            <p className="text-sm text-slate-400">
              {selected.size} of {required} projects selected
            </p>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-[0.65rem] uppercase tracking-[0.25em] text-slate-500">
                Presented by
              </p>
              <p className="text-lg font-black text-amber-300">
                {campaign.sponsorName}
              </p>
            </div>

            <button
              onClick={submit}
              disabled={!canSubmit}
              className={`rounded-lg px-6 py-3 font-bold transition ${
                canSubmit
                  ? "bg-green-500 text-slate-950 hover:bg-green-400"
                  : "cursor-not-allowed bg-slate-700 text-slate-400"
              }`}
            >
              {submitting
                ? "Submitting..."
                : submitted
                  ? "Update My Vote"
                  : "Submit My Vote"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

function voteableProjects(campaign: S4PCampaign): ClimateProject[] {
  return campaign.featuredProject
    ? [campaign.featuredProject, ...campaign.projects]
    : campaign.projects;
}

function ProjectCard({
  project,
  featured = false,
  isSelected,
  disabled,
  onToggle,
}: {
  project: ClimateProject;
  featured?: boolean;
  isSelected: boolean;
  disabled: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className={`flex flex-col rounded-2xl border p-6 md:p-8 ${
        featured
          ? "border-2 border-green-500 bg-slate-800"
          : isSelected
            ? "border-green-500 bg-slate-800"
            : "border-slate-700 bg-slate-900"
      }`}
    >
      {featured && (
        <span className="inline-flex w-fit rounded-full bg-green-600 px-4 py-2 text-sm font-bold text-white">
          ⭐ Featured Climate Project
        </span>
      )}

      <h2 className={`font-bold ${featured ? "mt-6 text-3xl" : "text-xl"}`}>
        {project.name}
      </h2>
      <p className={`mt-3 flex-1 text-slate-300 ${featured ? "text-lg leading-8" : "text-sm"}`}>
        {project.description}
      </p>

      {featured && (
        <div className="mt-5 space-y-1 text-sm text-slate-400">
          {project.country && <p>📍 {project.country}</p>}
          {project.estimated_co2 != null && (
            <p>🌳 Estimated CO₂ Offset: {project.estimated_co2.toLocaleString()} tonnes</p>
          )}
          {project.funding_goal != null && (
            <p>🎯 Funding Goal: £{project.funding_goal.toLocaleString()}</p>
          )}
        </div>
      )}

      <button
        onClick={onToggle}
        disabled={disabled}
        className={`mt-6 w-full rounded-lg py-3 font-bold transition ${
          featured ? "mt-8 py-4 text-lg" : ""
        } ${
          isSelected
            ? "bg-green-500 text-slate-950 hover:bg-green-400"
            : disabled
              ? "cursor-not-allowed bg-slate-800 text-slate-500"
              : featured
                ? "bg-green-500 text-slate-950 hover:bg-green-400"
                : "bg-slate-700 text-white hover:bg-slate-600"
        }`}
      >
        {isSelected ? "✓ Selected" : "Select Project"}
      </button>
    </div>
  );
}

function ImpactStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-950/60 p-4">
      <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-black text-green-400">{value}</p>
    </div>
  );
}

function numberWord(n: number): string {
  const words = ["zero", "one", "two", "three", "four", "five"];
  return words[n] ?? String(n);
}
