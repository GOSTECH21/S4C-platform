"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getMyS4PCampaigns,
  getOrCreateSupporter,
  getVotedProjectIds,
  submitCampaignVotes,
  type CampaignProject,
  type S4PCampaign,
  type Supporter,
} from "@/app/services/votes.service";
import { getSupportedTeams, type TeamOption } from "@/app/services/teams.service";
import { summariseImpact } from "@/app/lib/impact";
import { FAN_LOGIN_PATH, SUPPORTER_TEAMS_PATH } from "@/app/lib/routes";
import {
  campaignHeadline,
  formatMatchHeadline,
  formatMoney,
  formatSponsorshipBadge,
  formatVoteCount,
  voteProgress,
} from "@/app/lib/sponsorship-auction";
import { climateProjectCountryLabel } from "@/app/lib/featured-climate-country";

export default function MyS4PDashboardPage() {
  const [supporter, setSupporter] = useState<Supporter | null>(null);
  const [campaigns, setCampaigns] = useState<S4PCampaign[]>([]);
  const [teams, setTeams] = useState<TeamOption[]>([]);
  const [votedIds, setVotedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadCampaigns(current: Supporter) {
    const [supported, camps, voted] = await Promise.all([
      getSupportedTeams(current),
      getMyS4PCampaigns(current),
      getVotedProjectIds(current.id),
    ]);
    setTeams(supported);
    setCampaigns(camps);
    setVotedIds(voted);
  }

  useEffect(() => {
    async function load() {
      try {
        const current = await getOrCreateSupporter();
        if (!current) {
          window.location.href = FAN_LOGIN_PATH;
          return;
        }
        setSupporter(current);
        await loadCampaigns(current);
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
            When one of those teams is playing, you will get a match-day alert
            on your phone and you will see the sponsored climate projects here
            so you can vote.
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

  const alertHeadline =
    campaigns.length === 1
      ? `${formatMatchHeadline(campaigns[0].matchTitle)} has sponsored climate projects ready for your vote.`
      : `${campaigns.length} sponsored matches are live for the teams you support.`;

  return (
    <div className="space-y-16 pb-16">
      {error && (
        <div className="mx-auto max-w-5xl px-8">
          <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-center text-red-300">
            {error}
          </div>
        </div>
      )}
      <div className="mx-auto max-w-5xl px-8">
        <div className="rounded-2xl border border-green-500/40 bg-green-500/10 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-green-400">
            Match-day alert
          </p>
          <p className="mt-2 text-lg font-bold text-white">{alertHeadline}</p>
          <p className="mt-2 text-sm text-slate-300">
            The same alert is sent to your phone. Vote below, then review funded
            value and carbon impact on Climate Projects.
          </p>
        </div>
      </div>
      {campaigns.map((campaign) => (
        <CampaignPanel
          key={campaign.campaignId ?? campaign.clubId}
          campaign={campaign}
          supporterId={supporter?.id ?? null}
          votedIds={votedIds}
          onVotesChanged={async () => {
            if (!supporter) return;
            await loadCampaigns(supporter);
          }}
        />
      ))}
    </div>
  );
}

function CampaignPanel({
  campaign,
  supporterId,
  votedIds,
  onVotesChanged,
}: {
  campaign: S4PCampaign;
  supporterId: string | null;
  votedIds: Set<string>;
  onVotesChanged: () => Promise<void>;
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
      await onVotesChanged();
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
  const headline = campaignHeadline(campaign.matchTitle);

  return (
    <main className="pb-8 text-white">
      <div className="mx-auto max-w-5xl px-8">
        <div className="text-center">
          <h1 className="text-3xl font-black md:text-4xl">{headline}</h1>
          <p className="mx-auto mt-3 max-w-2xl text-slate-300">
            Vote for the{" "}
            <span className="font-bold text-white">
              {numberWord(required).toUpperCase()}
            </span>{" "}
            Climate Projects you want funded if YOUR TEAM scores.
          </p>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-400">
            The 72-hour voting window closes 2 hours before kick-off. Until then
            the sponsorship amount per {campaign.scoreLabel} rises with votes,
            from {formatMoney(campaign.openingAmount)} up to{" "}
            {formatMoney(campaign.maxAmount)} at{" "}
            {formatVoteCount(campaign.voteTarget)} votes. The highest-bidder
            sponsor is then locked in. If your team does not score, they pay
            nothing — but still reach every voter.
          </p>
        </div>

        {error && (
          <div className="mt-6 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-center text-red-300">
            {error}
          </div>
        )}

        {submitted && !error && (
          <div className="mt-6 rounded-xl border border-green-500/40 bg-green-500/10 p-4 text-center text-green-300">
            ✓ Your vote has been submitted. Watch the Vote Received counters —
            as they rise, the live sponsorship amount per {campaign.scoreLabel}{" "}
            rises with them and locks 2 hours before kick-off.
          </div>
        )}

        {campaign.featuredProject && (
          <div className="mt-10">
            <ProjectCard
              project={campaign.featuredProject}
              featured
              clubName={campaign.clubName}
              sponsorName={campaign.sponsorName}
              scoreLabel={campaign.scoreLabel}
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
              clubName={campaign.clubName}
              sponsorName={campaign.sponsorName}
              scoreLabel={campaign.scoreLabel}
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
    </main>
  );
}

function voteableProjects(campaign: S4PCampaign): CampaignProject[] {
  return campaign.featuredProject
    ? [campaign.featuredProject, ...campaign.projects]
    : campaign.projects;
}

function ProjectCard({
  project,
  featured = false,
  clubName,
  sponsorName,
  scoreLabel,
  isSelected,
  disabled,
  onToggle,
}: {
  project: CampaignProject;
  featured?: boolean;
  clubName: string;
  sponsorName: string;
  scoreLabel: string;
  isSelected: boolean;
  disabled: boolean;
  onToggle: () => void;
}) {
  const progress = voteProgress({
    votesReceived: project.votesReceived,
    voteTarget: project.voteTarget,
  });
  const country = climateProjectCountryLabel(project, { clubName });

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
          {country && <p>📍 {country}</p>}
          {project.estimated_co2 != null && (
            <p>🌳 Estimated CO₂ Offset: {project.estimated_co2.toLocaleString()} tonnes</p>
          )}
          {project.funding_goal != null && (
            <p>🎯 Funding Goal: £{project.funding_goal.toLocaleString()}</p>
          )}
        </div>
      )}

      <div className="mt-5 flex items-center gap-3">
        <div
          className={`shrink-0 rounded-xl bg-green-500 text-slate-950 ${
            featured ? "px-4 py-3" : "px-3 py-2"
          }`}
        >
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em]">
            Sponsorship:
          </p>
          <p
            className={`font-black leading-tight ${
              featured ? "text-2xl" : "text-lg"
            }`}
          >
            {formatSponsorshipBadge({
              amount: project.currentAmount,
              scoreLabel,
              openingAmount: project.openingAmount,
              maxAmount: project.maxAmount,
            })}
          </p>
        </div>
        <SponsorMark name={sponsorName} />
      </div>

      <div className="mt-4 rounded-xl border border-slate-700/80 bg-slate-950/50 p-3">
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Votes received
          </p>
          <p className="text-lg font-black text-white">
            {formatVoteCount(project.votesReceived)}
          </p>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full rounded-full bg-green-500 transition-all"
            style={{ width: `${Math.max(progress * 100, progress > 0 ? 0.8 : 0)}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-slate-500">
          Opens at {formatMoney(project.openingAmount)} · peaks at{" "}
          {formatMoney(project.maxAmount)} / {scoreLabel} when votes reach{" "}
          {formatVoteCount(project.voteTarget)}. Locked 2 hours before kick-off.
        </p>
      </div>

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
  className = "",
}: {
  name: string;
  className?: string;
}) {
  return (
    <div className={`min-w-0 text-left ${className}`}>
      <p className="text-[0.65rem] uppercase tracking-[0.25em] text-slate-500">
        Sponsored by
      </p>
      <p className="text-sm font-bold text-amber-300">{name}</p>
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
