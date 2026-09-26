"use client";

import { useEffect, useState } from "react";
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
import { ClimateProjectSponsors } from "@/app/components/fan/ClimateProjectSponsors";
import { FAN_LOGIN_PATH, SUPPORTER_CAMPAIGN_PATH } from "@/app/lib/routes";
import { fanVotedSponsorNames } from "@/app/lib/climate-funding";
import {
  fanVotingWindowCopy,
  fanVotingWindowForMatchCopy,
  isVotingOpen,
  resolveVotingWindow,
} from "@/app/lib/voting-window";
import {
  applyFanWalletVote,
  fanVisibleProjects,
  fanVisibleSponsors,
  visibleMatchDayFolderForClub,
} from "@/app/services/match-day-folder.service";
import {
  formatWalletGbp,
  remainingGbp,
  type NumberedClimateProject,
} from "@/app/lib/sponsor-wallet";
import type { MatchDayFolder } from "@/app/lib/match-day-folder";

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
              Received amounts are cumulative for the 5-day Vote. Check them
              here at any time. You can take money once from each sponsor.{" "}
              {fanVotingWindowCopy()}
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
              supporterId={supporter?.id ?? null}
              votedIds={votedIds}
              onVoted={(projectId) =>
                setVotedIds((prev) => new Set([...prev, projectId]))
              }
            />
          ))
        )}
      </div>
    </main>
  );
}

function CampaignClimateBoard({
  campaign,
  supporterId,
  votedIds,
  onVoted,
}: {
  campaign: S4PCampaign;
  supporterId: string | null;
  votedIds: Set<string>;
  onVoted: (projectId: string) => void;
}) {
  const listed = campaignProjects(campaign);
  const clubId = campaign.postedClubId ?? campaign.clubId;
  const [folder, setFolder] = useState<MatchDayFolder | null>(() =>
    visibleMatchDayFolderForClub({ clubId, clubName: campaign.clubName })
  );
  const fallback = listed.map((project, index) => ({
    id: project.id,
    name: project.name,
    number: index + 1,
    fundedGbp: 0,
    votesReceived: project.votesReceived,
  }));
  const [numbered, setNumbered] = useState<NumberedClimateProject[]>(() =>
    fanVisibleProjects(folder, clubId, fallback)
  );
  const [sponsors, setSponsors] = useState(() =>
    fanVisibleSponsors(folder, {
      clubId,
      clubName: campaign.clubName,
      minAmount: campaign.minimumAmount,
      gbpPerGoal: campaign.gbpPerGoal,
    })
  );
  const [usedSponsors, setUsedSponsors] = useState<string[]>(() =>
    fanVotedSponsorNames(supporterId, clubId)
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const votingWindow = resolveVotingWindow({
    kickoff: campaign.kickoffAt,
    opensAt: campaign.votingOpens,
    closesAt: campaign.votingCloses,
    postedAt: campaign.postedAt,
  });
  const votingOpen = isVotingOpen(votingWindow);

  useEffect(() => {
    function refresh() {
      const next = visibleMatchDayFolderForClub({
        clubId,
        clubName: campaign.clubName,
      });
      setFolder(next);
      setNumbered((prev) => fanVisibleProjects(next, clubId, prev));
      setSponsors(
        fanVisibleSponsors(next, {
          clubId,
          clubName: campaign.clubName,
          minAmount: campaign.minimumAmount,
          gbpPerGoal: campaign.gbpPerGoal,
        })
      );
      setUsedSponsors(fanVotedSponsorNames(supporterId, clubId));
    }
    refresh();
    const timer = window.setInterval(refresh, 5000);
    window.addEventListener("storage", refresh);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("storage", refresh);
    };
  }, [clubId, campaign.clubName, campaign.minimumAmount, campaign.gbpPerGoal, supporterId]);

  async function voteFromWallet({
    brandName,
    projectNumber,
    split = false,
  }: {
    brandName: string;
    projectNumber?: string;
    split?: boolean;
  }) {
    if (!supporterId) return;
    if (!votingOpen) {
      setError("Voting is not open for this match yet, or it has already closed.");
      return;
    }
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const result = applyFanWalletVote({
        clubId,
        clubName: campaign.clubName,
        brandName,
        projectNumber,
        split,
        supporterId,
        projects: numbered,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setFolder(result.folder ?? folder);
      setNumbered(result.projects);
      setUsedSponsors(fanVotedSponsorNames(supporterId, clubId));
      setSponsors(
        fanVisibleSponsors(result.folder ?? folder, {
          clubId,
          clubName: campaign.clubName,
          minAmount: campaign.minimumAmount,
          gbpPerGoal: campaign.gbpPerGoal,
        })
      );
      const votedNow = split
        ? result.projects.map((project) => project.id)
        : [result.project.id];
      votedNow.forEach(onVoted);
      try {
        await submitCampaignVotes(
          supporterId,
          [...new Set([...votedIds, ...votedNow])],
          listed.map((project) => project.id),
          campaign.campaignId,
          clubId
        );
      } catch {
        // Wallet cash has already moved.
      }
      setNotice(
        split
          ? `Vote shared ${formatWalletGbp(result.amount)} from ${result.wallet.brandName}. Carbon Wallet now ${formatWalletGbp(remainingGbp(result.wallet))}.`
          : `${result.wallet.brandName}'s Carbon Wallet now ${formatWalletGbp(remainingGbp(result.wallet))}; Project ${result.project.number} has received ${formatWalletGbp(result.project.fundedGbp)}.`
      );
    } catch (err) {
      setError(describeDataError(err, "Could not save your vote."));
    } finally {
      setBusy(false);
    }
  }

  const lead = sponsors.find((row) => row.kind === "lead") ?? null;
  const locals = sponsors.filter((row) => row.kind === "local");

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
        <ul className="mt-4 space-y-1 text-slate-300">
          {numbered.map((project) => (
            <li key={project.id}>
              • Project {project.number}: {project.name} —{" "}
              {formatWalletGbp(project.fundedGbp)}
            </li>
          ))}
        </ul>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-red-300">
          {error}
        </div>
      )}
      {notice && !error && (
        <div className="rounded-xl border border-green-500/40 bg-green-500/10 p-4 text-green-300">
          ✓ {notice}
        </div>
      )}

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
              <p className="mt-3 text-sm text-slate-400">Received</p>
              <p className="text-xl font-black text-green-400">
                {formatWalletGbp(project.fundedGbp)}
              </p>
            </li>
          ))}
        </ol>
      </div>

      <ClimateProjectSponsors
        lead={
          lead
            ? {
                brandName: lead.brandName,
                kind: "lead",
                remainingGbp: lead.remainingGbp,
              }
            : null
        }
        locals={locals.map((row) => ({
          brandName: row.brandName,
          kind: "local" as const,
          remainingGbp: row.remainingGbp,
        }))}
        projectCount={numbered.length || 5}
        busy={busy}
        votingOpen={votingOpen}
        usedSponsorNames={usedSponsors}
        clubId={clubId}
        clubName={campaign.clubName}
        onVote={({ brandName, projectNumber, split }) =>
          void voteFromWallet({ brandName, projectNumber, split })
        }
      />
    </section>
  );
}
