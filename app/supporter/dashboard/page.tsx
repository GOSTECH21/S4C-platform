"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getMyS4PCampaigns,
  getOrCreateSupporter,
  getVotedProjectIds,
  submitCampaignVotes,
  type ClimateProject,
  type S4PCampaign,
} from "@/app/services/votes.service";
import { getSupportedTeams, type TeamOption } from "@/app/services/teams.service";
import { summariseImpact } from "@/app/lib/impact";
import { FAN_LOGIN_PATH, SUPPORTER_TEAMS_PATH } from "@/app/lib/routes";

export default function MyS4PDashboardPage() {
  const [supporterId, setSupporterId] = useState<string | null>(null);
  const [campaigns, setCampaigns] = useState<S4PCampaign[]>([]);
  const [teams, setTeams] = useState<TeamOption[]>([]);
  const [votedIds, setVotedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const supporter = await getOrCreateSupporter();
        if (!supporter) {
          window.location.href = FAN_LOGIN_PATH;
          return;
        }
        setSupporterId(supporter.id);
        const [supported, camps] = await Promise.all([
          getSupportedTeams(supporter),
          getMyS4PCampaigns(supporter),
        ]);
        setTeams(supported);
        setCampaigns(camps);
        setVotedIds(await getVotedProjectIds(supporter.id));
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

  if (loading) {
    return (
      <main className="px-8 pb-16 text-white">
        <p className="text-slate-400">Loading your campaign...</p>
      </main>
    );
  }

  if (teams.length === 0) {
    return (
      <main className="px-8 pb-16 text-white">
        <div className="mx-auto max-w-5xl rounded-2xl border border-slate-800 bg-slate-900 p-8">
          <h2 className="text-2xl font-bold">Choose the teams you support</h2>
          <p className="mt-3 text-slate-300">
            My S4P only shows matches for your teams. Select clubs across
            football, rugby and other sports so you receive their sponsored
            climate projects on match day.
          </p>
          <Link
            href={SUPPORTER_TEAMS_PATH}
            className="mt-6 inline-flex rounded-lg bg-green-500 px-5 py-3 font-bold text-slate-950"
          >
            Choose my teams
          </Link>
        </div>
      </main>
    );
  }

  if (campaigns.length === 0) {
    return (
      <main className="px-8 pb-16 text-white">
        <div className="mx-auto max-w-5xl rounded-2xl border border-slate-800 bg-slate-900 p-8">
          <h2 className="text-2xl font-bold">No sponsored match right now</h2>
          <p className="mt-3 text-slate-300">
            You support {teams.map((team) => team.displayName).join(", ")}.
            When one of those teams is playing, you will see the five climate
            projects their sustainability director selected for that match.
          </p>
          <Link
            href={SUPPORTER_TEAMS_PATH}
            className="mt-6 inline-flex rounded-lg border border-green-500/40 px-5 py-3 font-bold text-green-300"
          >
            Update my teams
          </Link>
        </div>
      </main>
    );
  }

  return (
    <div className="space-y-16 pb-16">
      {error && (
        <div className="mx-auto max-w-5xl px-8">
          <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-center text-red-300">
            {error}
          </div>
        </div>
      )}
      {campaigns.map((campaign) => (
        <CampaignPanel
          key={campaign.campaignId ?? campaign.clubId}
          campaign={campaign}
          supporterId={supporterId}
          votedIds={votedIds}
        />
      ))}
    </div>
  );
}

function CampaignPanel({
  campaign,
  supporterId,
  votedIds,
}: {
  campaign: S4PCampaign;
  supporterId: string | null;
  votedIds: Set<string>;
}) {
  const required = campaign.requiredVotes;
  const voteable = voteableProjects(campaign);
  const [selected, setSelected] = useState<Set<string>>(() => {
    const preselected = voteable
      .map((project) => project.id)
      .filter((id) => votedIds.has(id));
    return new Set(preselected.slice(0, required));
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(
    voteable.some((project) => votedIds.has(project.id))
  );
  const [error, setError] = useState<string | null>(null);

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
    if (!supporterId || selected.size !== required) return;
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

  const selectedProjects = voteable.filter((project) => selected.has(project.id));
  const impact = summariseImpact(selectedProjects);
  const canSubmit = selected.size === required && !submitting;
  const s2ps = `£${campaign.amountPerGoal.toLocaleString()}/${campaign.scoreLabel}`;

  return (
    <main className="pb-8 text-white">
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
            climate projects you want funded if {campaign.clubName} scores.
          </p>

          <div className="mt-5 inline-flex items-center rounded-lg bg-green-600 px-5 py-2 text-sm font-bold text-white">
            S2PS: {s2ps}
          </div>
        </div>

        {error && (
          <div className="mt-6 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-center text-red-300">
            {error}
          </div>
        )}

        {submitted && !error && (
          <div className="mt-6 rounded-xl border border-green-500/40 bg-green-500/10 p-4 text-center text-green-300">
            ✓ Your vote has been submitted. If {campaign.clubName} scores,{" "}
            {s2ps} will be split across your {required} chosen projects.
          </div>
        )}

        {campaign.featuredProject && (
          <div className="mt-10">
            <ProjectCard
              project={campaign.featuredProject}
              featured
              sponsorName={campaign.sponsorName}
              sponsorLogoUrl={campaign.sponsorLogoUrl}
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
              sponsorName={campaign.sponsorName}
              sponsorLogoUrl={campaign.sponsorLogoUrl}
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

        <div className="mt-8 flex flex-col items-center gap-4 rounded-2xl border border-slate-800 bg-slate-950/80 px-6 py-5 sm:flex-row sm:justify-between">
          <div>
            <p className="font-bold">Your Vote</p>
            <p className="text-sm text-slate-400">
              {selected.size} of {required} projects selected
            </p>
          </div>

          <div className="flex items-center gap-6">
            <SponsorMark
              name={campaign.sponsorName}
              logoUrl={campaign.sponsorLogoUrl}
            />
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
  sponsorName,
  sponsorLogoUrl,
  isSelected,
  disabled,
  onToggle,
}: {
  project: ClimateProject;
  featured?: boolean;
  sponsorName: string;
  sponsorLogoUrl: string | null;
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

      <SponsorMark name={sponsorName} logoUrl={sponsorLogoUrl} className="mt-5" />

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

function SponsorMark({
  name,
  logoUrl,
  className = "",
}: {
  name: string;
  logoUrl: string | null;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {logoUrl ? (
        <img src={logoUrl} alt="" className="h-8 w-auto rounded-sm bg-white/10 p-1" />
      ) : (
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-amber-300 text-xs font-black text-slate-950">
          {name.slice(0, 1)}
        </span>
      )}
      <div className="text-left">
        <p className="text-[0.65rem] uppercase tracking-[0.25em] text-slate-500">
          Sponsored by
        </p>
        <p className="text-sm font-bold text-amber-300">{name}</p>
      </div>
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
