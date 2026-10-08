"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getMyS4PCampaigns,
  getOrCreateSupporter,
  describeDataError,
  type CampaignProject,
  type S4PCampaign,
  type Supporter,
} from "@/app/services/votes.service";
import FanNav from "../components/FanNav";
import { FAN_LOGIN_PATH, SUPPORTER_CAMPAIGN_PATH } from "@/app/lib/routes";
import { filterCampaignsForFan } from "@/app/lib/fan-campaign-scope";
import { getSupportedTeams } from "@/app/services/teams.service";
import {
  climateProjectsReceivedCopy,
  fanVotingWindowForMatchCopy,
  resolveVotingWindow,
} from "@/app/lib/voting-window";
import {
  fanVisibleProjects,
  visibleMatchDayFolderForClub,
} from "@/app/services/match-day-folder.service";
import {
  formatWalletGbp,
  type NumberedClimateProject,
} from "@/app/lib/sponsor-wallet";
import { SIGNED_SPONSORSHIP_EVENT } from "@/app/lib/sponsor-completion-flow";
import { ProjectSiteLine } from "@/app/components/climate/ProjectSiteLine";
import { nearbyProjectsCopy, stadiumSiteForClub } from "@/app/lib/project-site";

function campaignProjects(campaign: S4PCampaign): CampaignProject[] {
  return campaign.featuredProject
    ? [campaign.featuredProject, ...campaign.projects]
    : campaign.projects;
}

export default function VotePage() {
  const [campaigns, setCampaigns] = useState<S4PCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function reload(current: Supporter) {
    const [supported, posted] = await Promise.all([
      getSupportedTeams(current),
      getMyS4PCampaigns(current),
    ]);
    setCampaigns(filterCampaignsForFan(posted, supported));
  }

  useEffect(() => {
    async function load() {
      try {
        const supporter = await getOrCreateSupporter();
        if (!supporter) {
          window.location.href = FAN_LOGIN_PATH;
          return;
        }
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

  useEffect(() => {
    async function refreshLive() {
      const supporter = await getOrCreateSupporter();
      if (supporter) await reload(supporter);
    }
    function onLive() {
      void refreshLive();
    }
    window.addEventListener(SIGNED_SPONSORSHIP_EVENT, onLive);
    window.addEventListener("storage", onLive);
    return () => {
      window.removeEventListener(SIGNED_SPONSORSHIP_EVENT, onLive);
      window.removeEventListener("storage", onLive);
    };
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 p-8 text-white">
      <div className="mx-auto max-w-6xl">
        <FanNav />

        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-green-400">
              Climate Projects
            </p>
            <h1 className="mt-2 text-4xl font-black">Climate Projects</h1>
            <p className="mt-3 max-w-2xl text-slate-300">
              {climateProjectsReceivedCopy()}
            </p>
            <p className="mt-2 max-w-2xl text-sm text-emerald-300">
              Put FUND-IT onto Climate Projects within 5 miles of your club
              stadium postcode when those local projects are on the Match Day
              list.
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
              Sustainability Director posts Climate Projects, the running
              Received totals appear here for 5 days.
            </p>
          </div>
        ) : (
          campaigns.map((campaign) => (
            <CampaignClimateBoard
              key={campaign.campaignId ?? campaign.clubId}
              campaign={campaign}
            />
          ))
        )}
      </div>
    </main>
  );
}

function CampaignClimateBoard({ campaign }: { campaign: S4PCampaign }) {
  const listed = campaignProjects(campaign);
  const clubId = campaign.postedClubId ?? campaign.clubId;
  const fallback = listed.map((project, index) => ({
    id: project.id,
    name: project.name,
    number: index + 1,
    fundedGbp: 0,
    votesReceived: project.votesReceived,
  }));
  const [numbered, setNumbered] = useState<NumberedClimateProject[]>(() =>
    fanVisibleProjects(
      visibleMatchDayFolderForClub({ clubId, clubName: campaign.clubName }),
      clubId,
      fallback
    )
  );
  const votingWindow = resolveVotingWindow({
    kickoff: campaign.kickoffAt,
    opensAt: campaign.votingOpens,
    closesAt: campaign.votingCloses,
    postedAt: campaign.postedAt,
  });

  useEffect(() => {
    function refresh() {
      const next = visibleMatchDayFolderForClub({
        clubId,
        clubName: campaign.clubName,
      });
      setNumbered((prev) => fanVisibleProjects(next, clubId, prev));
    }
    refresh();
    const timer = window.setInterval(refresh, 5000);
    window.addEventListener("storage", refresh);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("storage", refresh);
    };
  }, [clubId, campaign.clubName]);

  return (
    <section className="mt-10 space-y-8">
      <div className="rounded-2xl border border-green-500/30 bg-slate-900 p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-green-400">
          Projects Voted for
        </p>
        <h2 className="mt-2 text-2xl font-black">{campaign.clubName}</h2>
        <p className="mt-1 text-sm text-slate-400">
          Cumulative Received for the 5-day Vote
          {campaign.kickoffAt
            ? `. ${fanVotingWindowForMatchCopy(votingWindow)}`
            : ""}
          .
        </p>
        {stadiumSiteForClub(campaign.clubName) ? (
          <p className="mt-3 text-sm text-emerald-300">
            {nearbyProjectsCopy(campaign.clubName)}
          </p>
        ) : null}
        <ul className="mt-4 space-y-1 text-slate-300">
          {numbered.map((project) => (
            <li key={project.id}>
              • Project {project.number}: {project.name} —{" "}
              {formatWalletGbp(project.fundedGbp)}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h2 className="text-2xl font-black">Climate Project list</h2>
        <p className="mt-1 text-sm text-slate-400">
          The Received amount on each project is the running total from every
          fan during this 5-day Vote.
        </p>
        <ol className="mt-4 grid gap-3 md:grid-cols-5">
          {numbered.map((project) => (
            <li
              key={project.id}
              className="rounded-2xl border border-slate-800 bg-slate-900 p-4"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-green-400">
                Project {project.number}
              </p>
              <h3 className="mt-2 font-bold leading-tight text-white">
                {project.name}
              </h3>
              <div className="mt-2">
                <ProjectSiteLine
                  project={project}
                  clubName={campaign.clubName}
                />
              </div>
              <p className="mt-3 text-sm text-slate-400">Received</p>
              <p className="text-xl font-black text-green-400">
                {formatWalletGbp(project.fundedGbp)}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
