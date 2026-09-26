"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getMyS4PCampaigns,
  getOrCreateSupporter,
  type CampaignProject,
  type S4PCampaign,
} from "@/app/services/votes.service";
import FanNav from "../components/FanNav";
import { ClimateProjectGroupFolders } from "@/app/components/fan/ClimateProjectGroupFolders";
import { FAN_LOGIN_PATH, SUPPORTER_CAMPAIGN_PATH } from "@/app/lib/routes";
import {
  archivePostedProjects,
  readProjectArchive,
  type ArchivedClimateProject,
} from "@/app/lib/climate-funding";
import {
  fanVotingWindowCopy,
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

function campaignProjects(campaign: S4PCampaign): CampaignProject[] {
  return campaign.featuredProject
    ? [campaign.featuredProject, ...campaign.projects]
    : campaign.projects;
}

export default function VotePage() {
  const [campaigns, setCampaigns] = useState<S4PCampaign[]>([]);
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
        const posted = await getMyS4PCampaigns(supporter);
        setCampaigns(posted);
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
              Check Received totals here at any time. Vote on My S4P. Open a
              climate project group Folder to see every previous project your
              club Sustainability Director posted, and how much it received
              during its 5-day Vote. {fanVotingWindowCopy()}
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
          <div className="mt-10 space-y-8">
            <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900 p-8">
              <p className="text-slate-300">
                No Match Day climate projects are posted yet. When your club
                Sustainability Director posts Climate Projects, the running
                Received totals appear here for 5 days.
              </p>
            </div>
            <ClimateProjectGroupFolders clubName="your club" archive={[]} />
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
  const clubId = campaign.postedClubId ?? campaign.clubId;
  const [numbered, setNumbered] = useState<NumberedClimateProject[]>([]);
  const [archive, setArchive] = useState<ArchivedClimateProject[]>([]);
  const [currentWindowId, setCurrentWindowId] = useState<string | null>(null);
  const votingWindow = resolveVotingWindow({
    kickoff: campaign.kickoffAt,
    opensAt: campaign.votingOpens,
    closesAt: campaign.votingCloses,
    postedAt: campaign.postedAt,
  });

  useEffect(() => {
    const listed = campaignProjects(campaign);
    const fallback = listed.map((project, index) => ({
      id: project.id,
      name: project.name,
      number: index + 1,
      fundedGbp: 0,
      votesReceived: project.votesReceived,
    }));
    function refresh() {
      const next = visibleMatchDayFolderForClub({
        clubId,
        clubName: campaign.clubName,
      });
      const projects = fanVisibleProjects(next, clubId, fallback);
      setNumbered(projects);
      const fundingWindow = {
        postedAt: next?.submittedAt ?? campaign.postedAt,
        matchDate: next?.matchDate ?? null,
        windowId: next?.submittedAt || next?.matchDate || campaign.postedAt,
      };
      if (clubId && projects.length > 0) {
        archivePostedProjects(clubId, projects, fundingWindow);
      }
      setCurrentWindowId(fundingWindow.windowId ?? null);
      setArchive(clubId ? readProjectArchive(clubId) : []);
    }
    refresh();
    const timer = window.setInterval(refresh, 5000);
    window.addEventListener("storage", refresh);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("storage", refresh);
    };
  }, [clubId, campaign]);

  return (
    <section className="mt-10 space-y-8">
      <div className="rounded-2xl border border-green-500/30 bg-slate-900 p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-green-400">
          Project Voted For this Match Day
        </p>
        <h2 className="mt-2 text-2xl font-black">{campaign.clubName}</h2>
        <p className="mt-1 text-sm text-slate-400">
          Cumulative Received for the 5-day Vote
          {campaign.kickoffAt
            ? `. ${fanVotingWindowForMatchCopy(votingWindow)}`
            : ""}
          .
        </p>
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
        <h2 className="text-2xl font-black">Current Climate Project List</h2>
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
              <p className="mt-3 text-sm text-slate-400">Received</p>
              <p className="text-xl font-black text-green-400">
                {formatWalletGbp(project.fundedGbp)}
              </p>
            </li>
          ))}
        </ol>
      </div>

      <ClimateProjectGroupFolders
        clubName={campaign.clubName}
        archive={archive}
        currentWindowId={currentWindowId}
      />
    </section>
  );
}
