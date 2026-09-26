"use client";

import { useEffect, useMemo, useState } from "react";
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
import { FAN_LOGIN_PATH, SUPPORTER_TEAMS_PATH } from "@/app/lib/routes";
import { campaignHeadline } from "@/app/lib/sponsorship-auction";
import { MatchDayProjectCard } from "@/app/components/fan/MatchDayProjectCard";
import { ClimateProjectSponsors } from "@/app/components/fan/ClimateProjectSponsors";
import { liveMatchDayBranding } from "@/app/services/match-day-branding.service";
import { readFanPostSchedule } from "@/app/lib/match-day-post";
import {
  fanVotingWindowCopy,
  isVotingOpen,
  resolveVotingWindow,
} from "@/app/lib/voting-window";
import {
  applyFanWalletVote,
  fanVisibleProjects,
  fanVisibleSponsors,
  identifyClubSponsorWallets,
  visibleMatchDayFolderForClub,
} from "@/app/services/match-day-folder.service";
import {
  formatWalletGbp,
  remainingGbp,
  type NumberedClimateProject,
} from "@/app/lib/sponsor-wallet";
import { captureClimateInviteFromSearch, fanVotedSponsorNames } from "@/app/lib/climate-funding";
import type { MatchDayFolder } from "@/app/lib/match-day-folder";
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
    captureClimateInviteFromSearch();
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

  if (teams.length === 0 && campaigns.length === 0) {
    return (
      <main className="px-8 pb-16 text-white">
        <div className="mx-auto max-w-5xl rounded-2xl border border-slate-800 bg-slate-900 p-8">
          <h2 className="text-2xl font-bold">Choose the teams you support</h2>
          <p className="mt-3 text-slate-300">
            My S4P only shows matches for your teams. Select clubs across
            football, rugby and other sports so you receive their climate
            projects on match day.
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
            You support{" "}
            {teams.length
              ? teams.map((team) => team.displayName).join(", ")
              : "an invited club"}
            . When a club Sustainability Director posts Climate Projects, they
            appear here for 5 days.
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
  const voteable = voteableProjects(campaign);
  const clubId = campaign.postedClubId ?? campaign.clubId;
  const [folder, setFolder] = useState<MatchDayFolder | null>(() =>
    visibleMatchDayFolderForClub({ clubId, clubName: campaign.clubName })
  );
  const [projects, setProjects] = useState<NumberedClimateProject[]>(() =>
    fanVisibleProjects(
      folder,
      clubId,
      voteable.map((project, index) => ({
        id: project.id,
        name: project.name,
        number: index + 1,
        fundedGbp: 0,
        votesReceived: project.votesReceived,
      }))
    )
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
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const votingWindow = resolveVotingWindow({
    kickoff: campaign.kickoffAt,
    opensAt: campaign.votingOpens,
    closesAt: campaign.votingCloses,
    postedAt: campaign.postedAt,
  });
  const votingOpen = isVotingOpen(votingWindow);
  const headline = campaignHeadline(campaign.matchTitle);
  const schedule = readFanPostSchedule(clubId);
  const branding = liveMatchDayBranding({
    clubId,
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

  useEffect(() => {
    function refreshWallets() {
      const next = visibleMatchDayFolderForClub({
        clubId,
        clubName: campaign.clubName,
      });
      setFolder(next);
      setProjects((prev) => fanVisibleProjects(next, clubId, prev));
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
    const timer = window.setInterval(refreshWallets, 5000);
    window.addEventListener("storage", refreshWallets);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("storage", refreshWallets);
    };
  }, [clubId, campaign.clubName, campaign.minimumAmount, campaign.gbpPerGoal, supporterId]);

  const leadSponsor = useMemo(() => {
    const fromWallets = sponsors.find((row) => row.kind === "lead");
    if (fromWallets) {
      return {
        brandName: fromWallets.brandName,
        kind: "lead" as const,
        remainingGbp: fromWallets.remainingGbp,
        logoUrl: leadLogoUrl,
      };
    }
    if (!leadName) return null;
    const live = identifyClubSponsorWallets({
      clubId,
      clubName: campaign.clubName,
      minAmount: campaign.minimumAmount,
      gbpPerGoal: campaign.gbpPerGoal,
    }).find((wallet) => wallet.kind === "lead");
    return {
      brandName: leadName,
      kind: "lead" as const,
      remainingGbp: live ? remainingGbp(live) : campaign.minimumAmount,
      logoUrl: leadLogoUrl,
    };
  }, [
    sponsors,
    leadName,
    leadLogoUrl,
    clubId,
    campaign.clubName,
    campaign.minimumAmount,
    campaign.gbpPerGoal,
  ]);

  const localSponsors = useMemo(() => {
    const fromWallets = sponsors.filter((row) => row.kind === "local");
    if (fromWallets.length > 0) {
      return fromWallets.map((row) => ({
        brandName: row.brandName,
        kind: "local" as const,
        remainingGbp: row.remainingGbp,
        logoUrl:
          rankedLocals.find((local) => local.brandName === row.brandName)?.logoUrl ??
          null,
      }));
    }
    return rankedLocals.map((local) => ({
      brandName: local.brandName,
      kind: "local" as const,
      remainingGbp: local.pledgeGbp,
      logoUrl: local.logoUrl ?? null,
    }));
  }, [sponsors, rankedLocals]);

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
        projects,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setFolder(result.folder ?? folder);
      setProjects(result.projects);
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
      try {
        await submitCampaignVotes(
          supporterId,
          [...new Set([...votedIds, ...votedNow])],
          voteable.map((project) => project.id),
          campaign.campaignId,
          clubId
        );
        await onVotesChanged();
      } catch {
        // Wallet cash has already moved even if the campaign vote row cannot be stored.
      }
      setNotice(
        split
          ? `Vote shared ${formatWalletGbp(result.amount)} from ${result.wallet.brandName}'s Carbon Wallet across all 5 Climate Projects. Carbon Wallet now ${formatWalletGbp(remainingGbp(result.wallet))}.`
          : `Vote moved ${formatWalletGbp(result.amount)} from ${result.wallet.brandName}'s Carbon Wallet into Project ${result.project.number}. Carbon Wallet now ${formatWalletGbp(remainingGbp(result.wallet))}.`
      );
    } catch (err) {
      console.error("Failed to submit vote:", describeDataError(err));
      setError(describeDataError(err, "Failed to submit your vote."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="pb-8 text-white">
      <div className="mx-auto max-w-[90rem] px-4 md:px-8">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-300">
            {campaign.clubName}
          </p>
          <h1 className="mt-2 text-3xl font-black md:text-5xl">{headline}</h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-400">
            {fanVotingWindowCopy()} Climate Projects posted by the{" "}
            {campaign.clubName} Sustainability Director disappear after 5 days.
            Bring every Carbon Wallet to {formatWalletGbp(0)}.
          </p>
        </div>

        {error && (
          <div className="mt-6 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-center text-red-300">
            {error}
          </div>
        )}

        {notice && !error && (
          <div className="mt-6 rounded-xl border border-green-500/40 bg-green-500/10 p-4 text-center text-green-300">
            ✓ {notice}
          </div>
        )}

        <section className="mt-10">
          <h2 className="text-3xl font-black">Climate Projects List</h2>
          <p className="mt-2 text-sm text-slate-400">
            Use the bold project number in Checkbox 1 when you Vote.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {voteable.map((project, index) => {
              const funded = projects.find((row) => row.id === project.id);
              return (
                <MatchDayProjectCard
                  key={project.id}
                  project={project}
                  cardIndex={funded?.number ?? index + 1}
                  clubName={campaign.clubName}
                  showVote={false}
                  showSponsors={false}
                  fundedGbp={funded?.fundedGbp ?? 0}
                />
              );
            })}
          </div>
        </section>

        <div className="mt-12">
          <ClimateProjectSponsors
            lead={leadSponsor}
            locals={localSponsors}
            projectCount={projects.length || 5}
            busy={busy}
            votingOpen={votingOpen}
            usedSponsorNames={usedSponsors}
            clubId={clubId}
            clubName={campaign.clubName}
            onVote={({ brandName, projectNumber, split }) =>
              void voteFromWallet({
                brandName,
                projectNumber,
                split,
              })
            }
          />
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
