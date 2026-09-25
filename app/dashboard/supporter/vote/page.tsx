"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  getMyS4PCampaigns,
  getOrCreateSupporter,
  getVotedProjectIds,
  submitCampaignVotes,
  describeDataError,
  type CampaignProject,
  type S4PCampaign,
  type Supporter,
} from "@/app/services/votes.service";
import FanNav from "../components/FanNav";
import { ClimateProjectsLeaderboard } from "@/app/components/fan/ClimateProjectsLeaderboard";
import { FAN_LOGIN_PATH, SUPPORTER_CAMPAIGN_PATH } from "@/app/lib/routes";

function campaignProjects(campaign: S4PCampaign): CampaignProject[] {
  return campaign.featuredProject
    ? [campaign.featuredProject, ...campaign.projects]
    : campaign.projects;
}

export default function VotePage() {
  const [supporter, setSupporter] = useState<Supporter | null>(null);
  const [campaigns, setCampaigns] = useState<S4PCampaign[]>([]);
  const [votedIds, setVotedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function reload(current: Supporter) {
    const [posted, voted] = await Promise.all([
      getMyS4PCampaigns(current),
      getVotedProjectIds(current.id),
    ]);
    setCampaigns(posted);
    setVotedIds(voted);
  }

  useEffect(() => {
    async function load() {
      try {
        const supporter = await getOrCreateSupporter();
        if (!supporter) {
          window.location.href = FAN_LOGIN_PATH;
          return;
        }
        setSupporter(supporter);
        await reload(supporter);
      } catch (err) {
        console.error("Failed to load climate projects:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load climate projects."
        );
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  async function voteOnCampaign(campaign: S4PCampaign, projectId: string) {
    if (!supporter) return;
    const projects = campaignProjects(campaign);
    const campaignIds = new Set(projects.map((project) => project.id));
    const already = [...votedIds].filter((id) => campaignIds.has(id));
    if (already.includes(projectId) || already.length >= campaign.requiredVotes) {
      return;
    }
    setBusyId(projectId);
    setError(null);
    try {
      const next = [...already, projectId];
      await submitCampaignVotes(
        supporter.id,
        next,
        [...campaignIds],
        campaign.campaignId,
        campaign.postedClubId ?? campaign.clubId
      );
      setVotedIds((prev) => new Set([...prev, projectId]));
      setCampaigns((prev) =>
        prev.map((row) => {
          if ((row.campaignId ?? row.clubId) !== (campaign.campaignId ?? campaign.clubId)) {
            return row;
          }
          const bump = (project: CampaignProject) =>
            project.id === projectId
              ? { ...project, votesReceived: project.votesReceived + 1 }
              : project;
          return {
            ...row,
            featuredProject: row.featuredProject ? bump(row.featuredProject) : null,
            projects: row.projects.map(bump),
          };
        })
      );
    } catch (err) {
      console.error("Failed to vote:", describeDataError(err));
      setError(describeDataError(err, "Could not save your vote."));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 p-8 text-white">
      <div className="mx-auto max-w-6xl">
        <FanNav />

        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-green-400">
              Climate Projects
            </p>
            <h1 className="mt-2 text-4xl font-black">Climate Projects Leaderboard</h1>
            <p className="mt-3 max-w-2xl text-slate-300">
              Projects you have voted for appear in the box. The leaderboard
              ranks every posted Climate Project by votes. Press Vote to add
              yours; the remaining amount reduces by the rate your club
              stipulated.
            </p>
          </div>

          <Link
            href={SUPPORTER_CAMPAIGN_PATH}
            className="inline-flex h-fit items-center gap-2 rounded-xl border border-green-500/40 bg-green-500/10 px-5 py-3 font-bold text-green-300 hover:bg-green-500/20"
          >
            My S4P
            <span className="rounded-full bg-green-500 px-2 py-0.5 text-sm text-slate-950">
              {campaigns.length}
            </span>
          </Link>
        </div>

        {error && (
          <div className="mt-6 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-red-300">
            {error}
          </div>
        )}

        {loading ? (
          <p className="mt-10 text-slate-400">Loading climate projects...</p>
        ) : campaigns.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-slate-700 bg-slate-900 p-8">
            <p className="text-slate-300">
              No Match Day climate projects are posted yet. When your club
              posts them, they appear here to vote.
            </p>
          </div>
        ) : (
          campaigns.map((campaign) => (
            <CampaignClimateBoard
              key={campaign.campaignId ?? campaign.clubId}
              campaign={campaign}
              votedIds={votedIds}
              busy={busyId !== null}
              onVote={(projectId) => voteOnCampaign(campaign, projectId)}
            />
          ))
        )}
      </div>
    </main>
  );
}

function CampaignClimateBoard({
  campaign,
  votedIds,
  busy,
  onVote,
}: {
  campaign: S4PCampaign;
  votedIds: Set<string>;
  busy: boolean;
  onVote: (projectId: string) => void;
}) {
  const projects = campaignProjects(campaign);
  const campaignVoted = useMemo(
    () => projects.filter((project) => votedIds.has(project.id)),
    [projects, votedIds]
  );

  return (
    <section className="mt-10 space-y-8">
      <div className="rounded-2xl border border-green-500/30 bg-slate-900 p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-green-400">
          Projects Voted for
        </p>
        <h2 className="mt-2 text-2xl font-black">{campaign.clubName}</h2>
        {campaignVoted.length === 0 ? (
          <p className="mt-4 text-slate-400">
            You have not voted for any climate projects for {campaign.clubName}{" "}
            yet.
          </p>
        ) : (
          <ul className="mt-4 space-y-1 text-slate-300">
            {campaignVoted.map((project) => (
              <li key={project.id}>• {project.name}</li>
            ))}
          </ul>
        )}
      </div>

      <ClimateProjectsLeaderboard
        clubName={campaign.clubName}
        projects={projects.map((project) => ({
          id: project.id,
          name: project.name,
          votesReceived: project.votesReceived,
          fundingGoal: project.funding_goal,
        }))}
        votedIds={new Set(campaignVoted.map((project) => project.id))}
        requiredVotes={campaign.requiredVotes}
        totalAmount={campaign.minimumAmount}
        amountPerVote={campaign.gbpPerVote}
        onVote={onVote}
        busy={busy}
      />
    </section>
  );
}
