"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getMyS4PCampaigns,
  getOrCreateSupporter,
  getVotedProjectIds,
  markPortfolioProjectsVoted,
  submitCampaignVotes,
  describeDataError,
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
  formatStipulatedRate,
  EXPOSURES_PER_POST,
} from "@/app/lib/sponsorship-auction";
import { MatchDayProjectCard } from "@/app/components/fan/MatchDayProjectCard";
import { TodaysClimateSponsors } from "@/app/components/fan/TodaysClimateSponsors";
import { liveMatchDayBranding } from "@/app/services/match-day-branding.service";
import { readFanPostSchedule } from "@/app/lib/match-day-post";
import type { LocalSponsorRecord } from "@/app/lib/local-sponsor";

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
    await Promise.all(
      camps.map((campaign) => {
        const votedOnThis = voteableProjects(campaign)
          .map((project) => project.id)
          .filter((id) => voted.has(id));
        return markPortfolioProjectsVoted(
          campaign.postedClubId ?? campaign.clubId,
          votedOnThis
        );
      })
    );
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
          <h2 className="text-2xl font-bold">No posted climate projects right now</h2>
          <p className="mt-3 text-slate-300">
            You support {teams.map((team) => team.displayName).join(", ")}.
            When one of those clubs posts its Match Day climate projects, they
            appear here straight away so you can vote.
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
        campaign.campaignId,
        campaign.postedClubId ?? campaign.clubId
      );
      setSubmitted(true);
      try {
        await onVotesChanged();
      } catch {
        // The vote is saved even if the page refresh fails.
      }
    } catch (err) {
      console.error("Failed to submit vote:", describeDataError(err));
      setError(describeDataError(err, "Failed to submit your vote."));
    } finally {
      setSubmitting(false);
    }
  }

  const selectedProjects = voteable.filter((project) => selected.has(project.id));
  const impact = summariseImpact(selectedProjects);
  const canSubmit = selected.size === required && !submitting;
  const headline = campaignHeadline(campaign.matchTitle);
  const schedule = readFanPostSchedule(
    campaign.postedClubId ?? campaign.clubId
  );
  const branding = liveMatchDayBranding({
    clubId: campaign.postedClubId ?? campaign.clubId,
    clubName: campaign.clubName,
    projects: voteable,
    storedLeadName: schedule?.leadSponsorName,
    storedLeadLogoUrl: schedule?.leadSponsorLogoUrl,
    campaignSponsorName: campaign.sponsorName,
    campaignSponsorLogoUrl: campaign.sponsorLogoUrl,
    storedLocals: schedule?.localAssignments,
  });
  const leadName = branding.lead.name;
  const leadLogoUrl = branding.lead.logoUrl;
  const placements = branding.placements;
  const rankedLocals = placements
    .map((row) => row.local)
    .filter((row): row is LocalSponsorRecord => Boolean(row));

  return (
    <main className="pb-8 text-white">
      <div className="mx-auto max-w-[90rem] px-4 md:px-8">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-300">
            {campaign.clubName} fans power climate action
          </p>
          <h1 className="mt-2 text-3xl font-black md:text-5xl">{headline}</h1>
          <p className="mx-auto mt-3 max-w-3xl text-slate-300">
            Choose{" "}
            <span className="font-bold text-white">
              {numberWord(required)} Climate Projects
            </span>
            . These five projects were selected by the {campaign.clubName}{" "}
            Sustainability Team. Your vote helps decide how Match Day climate
            funding is allocated.
          </p>
          <p className="mx-auto mt-3 max-w-3xl text-sm text-slate-400">
            The 72-hour voting window closes 2 hours before kick-off. The Lead
            Climate Sponsor pays the {formatMoney(campaign.minimumAmount)} Base
            Match Sponsorship even if the match ends 0–0, plus{" "}
            {campaign.gbpPerGoal > 0
              ? `${formatMoney(campaign.gbpPerGoal)} for every ${campaign.scoreLabel} scored`
              : `the posted amount for every ${campaign.scoreLabel} scored`}
            {campaign.maxAmount > 0
              ? `, up to a maximum of ${formatMoney(campaign.maxAmount)}`
              : ""}
            . {formatStipulatedRate(campaign.gbpPerVote)} is the brand-exposure
            counter: this post is 1 eyeball and {EXPOSURES_PER_POST} lead-sponsor
            exposures. Local Business Climate Sponsors appear 1-each, with
            exposures scaled to their pledge.
          </p>
        </div>

        <div className="mt-8">
          <TodaysClimateSponsors
            leadName={leadName}
            leadLogoUrl={leadLogoUrl}
            locals={rankedLocals}
          />
        </div>

        {error && (
          <div className="mt-6 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-center text-red-300">
            {error}
          </div>
        )}

        {submitted && !error && (
          <div className="mt-6 rounded-xl border border-green-500/40 bg-green-500/10 p-4 text-center text-green-300">
            ✓ Your vote has been submitted. The sponsor still pays the{" "}
            {formatMoney(campaign.minimumAmount)} Base Match Sponsorship if
            the club does not score, plus the posted amount for every{" "}
            {campaign.scoreLabel}
            {campaign.maxAmount > 0
              ? `, up to ${formatMoney(campaign.maxAmount)}`
              : ""}
            .
          </div>
        )}

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {placements.map((row) => (
            <MatchDayProjectCard
              key={row.project.id}
              project={row.project}
              cardIndex={row.cardIndex}
              clubName={campaign.clubName}
              leadName={leadName}
              leadLogoUrl={leadLogoUrl}
              local={row.local}
              localScale={row.scale}
              selected={selected.has(row.project.id)}
              disabled={
                !selected.has(row.project.id) && selected.size >= required
              }
              onToggle={() => toggle(row.project.id)}
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
