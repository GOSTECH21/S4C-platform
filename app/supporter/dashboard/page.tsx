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
} from "@/app/lib/sponsorship-auction";
import { MatchDayProjectCard } from "@/app/components/fan/MatchDayProjectCard";
import { MatchDayWalletVote } from "@/app/components/fan/MatchDayWalletVote";
import { TodaysClimateSponsors } from "@/app/components/fan/TodaysClimateSponsors";
import { liveMatchDayBranding } from "@/app/services/match-day-branding.service";
import { readFanPostSchedule } from "@/app/lib/match-day-post";
import type { LocalSponsorRecord } from "@/app/lib/local-sponsor";
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
  DEFAULT_WALLET_VOTE_GBP,
  formatWalletGbp,
  remainingGbp,
  type NumberedClimateProject,
} from "@/app/lib/sponsor-wallet";
import type { MatchDayFolder } from "@/app/lib/match-day-folder";

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
            appear here straight away so you can take cash from a sponsor wallet
            and put it on a numbered Climate Project.
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
            The same alert is sent to your phone. Look up a sponsor wallet,
            insert a project number, then press VOTE. Each vote takes{" "}
            {formatWalletGbp(DEFAULT_WALLET_VOTE_GBP)} from that wallet and
            puts it into the Climate Project.
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
  const voteable = voteableProjects(campaign);
  const clubId = campaign.postedClubId ?? campaign.clubId;
  const [folder, setFolder] = useState<MatchDayFolder | null>(() =>
    visibleMatchDayFolderForClub({ clubId, clubName: campaign.clubName })
  );
  const [projects, setProjects] = useState<NumberedClimateProject[]>(() =>
    fanVisibleProjects(folder).length
      ? fanVisibleProjects(folder)
      : voteable.map((project, index) => ({
          id: project.id,
          name: project.name,
          number: index + 1,
          fundedGbp: 0,
          votesReceived: project.votesReceived,
        }))
  );
  const [sponsors, setSponsors] = useState(() => fanVisibleSponsors(folder));
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const funded = voteable.filter((project) =>
    projects.some((row) => row.id === project.id && row.fundedGbp > 0) ||
    votedIds.has(project.id)
  );
  const impact = summariseImpact(funded.length ? funded : []);
  const votingWindow = resolveVotingWindow({
    kickoff: campaign.kickoffAt,
    opensAt: campaign.votingOpens,
    closesAt: campaign.votingCloses,
    postedAt: campaign.postedAt,
  });
  const votingOpen = isVotingOpen(votingWindow);
  const votingCopy = campaign.kickoffAt
    ? fanVotingWindowForMatchCopy(votingWindow)
    : fanVotingWindowCopy();
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

  async function voteFromWallet(brandName: string, projectNumber: string) {
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
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setFolder(result.folder ?? folder);
      setProjects(fanVisibleProjects(result.folder ?? folder));
      setSponsors(fanVisibleSponsors(result.folder ?? folder));
      const nextIds = [...new Set([...votedIds, result.project.id])];
      try {
        await submitCampaignVotes(
          supporterId,
          nextIds,
          voteable.map((project) => project.id),
          campaign.campaignId,
          clubId
        );
        await onVotesChanged();
      } catch {
        // Wallet cash has already moved even if the campaign vote row cannot be stored.
      }
      setNotice(
        `VOTE moved ${formatWalletGbp(result.amount)} from ${result.wallet.brandName}'s wallet into Project ${result.project.number}. ${result.wallet.brandName} now shows ${formatWalletGbp(remainingGbp(result.wallet))} Remaining; Project ${result.project.number} has received ${formatWalletGbp(result.project.fundedGbp)}.`
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
            {campaign.clubName} fans power climate action
          </p>
          <h1 className="mt-2 text-3xl font-black md:text-5xl">{headline}</h1>
          <p className="mx-auto mt-3 max-w-3xl text-slate-300">
            Take cash from a sponsor&apos;s Climate Wallet and put it into a
            numbered Climate Project. These five projects were selected by the{" "}
            {campaign.clubName} Sustainability Team. Each VOTE is worth{" "}
            {formatWalletGbp(DEFAULT_WALLET_VOTE_GBP)}.
          </p>
          <p className="mx-auto mt-3 max-w-3xl text-sm text-slate-400">
            {votingCopy}
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

        {notice && !error && (
          <div className="mt-6 rounded-xl border border-green-500/40 bg-green-500/10 p-4 text-center text-green-300">
            ✓ {notice}
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
              showVote={false}
            />
          ))}
        </div>

        <div className="mt-10">
          <MatchDayWalletVote
            clubName={campaign.clubName}
            projects={projects}
            sponsors={sponsors}
            onVote={(brandName, projectNumber) =>
              void voteFromWallet(brandName, projectNumber)
            }
            busy={busy}
            votingOpen={votingOpen}
            votingMessage={`${votingCopy} Insert a project number next to a wallet and press VOTE. Each vote takes ${formatWalletGbp(DEFAULT_WALLET_VOTE_GBP)} from that wallet.`}
          />
        </div>

        {funded.length > 0 && impact.totalCo2 > 0 && (
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
