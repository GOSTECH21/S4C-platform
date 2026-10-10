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
import {
  FAN_LOGIN_PATH,
  SUPPORTER_CAMPAIGN_PATH,
  SUPPORTER_CLIMATE_SPONSORS_PATH,
  SUPPORTER_TEAMS_PATH,
} from "@/app/lib/routes";
import { campaignHeadline } from "@/app/lib/sponsorship-auction";
import { MatchDayProjectCard } from "@/app/components/fan/MatchDayProjectCard";
import { ClimateProjectSponsors } from "@/app/components/fan/ClimateProjectSponsors";
import { liveMatchDayBranding } from "@/app/services/match-day-branding.service";
import { readFanPostSchedule } from "@/app/lib/match-day-post";
import {
  fanVotingWindowCopy,
  fanWalletDrainCopy,
  resolveVotingWindow,
} from "@/app/lib/voting-window";
import {
  applyFanWalletVote,
  fanVisibleProjects,
  fanVisibleSponsors,
  identifyClubSponsorWallets,
  visibleMatchDayFolderForClub,
} from "@/app/services/match-day-folder.service";
import { withFeaturedGssVersions } from "@/app/lib/featured-gss";
import {
  formatWalletGbp,
  remainingGbp,
  walletVoteNotice,
  type NumberedClimateProject,
} from "@/app/lib/sponsor-wallet";
import { fanVotedSponsorNames } from "@/app/lib/climate-funding";
import { filterCampaignsForFan } from "@/app/lib/fan-campaign-scope";
import { totalLocalPledge, type LocalSponsorRecord } from "@/app/lib/local-sponsor";
import { fanFundingIsOpen, type MatchDayFolder } from "@/app/lib/match-day-folder";
import { FanGoalAlertBanner } from "@/app/components/fan/FanGoalAlertBanner";
import { SPONSORED_GOAL_EVENT } from "@/app/lib/sponsored-goal";
import { SIGNED_SPONSORSHIP_EVENT } from "@/app/lib/sponsor-completion-flow";

export function FanCampaignWorkspace({
  section,
}: {
  section: "projects" | "sponsors";
}) {
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
    const ownCampaigns = filterCampaignsForFan(camps, supported);
    setTeams(supported);
    setCampaigns(ownCampaigns);
    setVotedIds(voted);
    await Promise.all(
      ownCampaigns.map((campaign) => {
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

  useEffect(() => {
    if (!supporter) return;
    function refreshLive() {
      void loadCampaigns(supporter);
    }
    window.addEventListener(SIGNED_SPONSORSHIP_EVENT, refreshLive);
    window.addEventListener("storage", refreshLive);
    return () => {
      window.removeEventListener(SIGNED_SPONSORSHIP_EVENT, refreshLive);
      window.removeEventListener("storage", refreshLive);
    };
  }, [supporter]);

  const clubNames = useMemo(
    () =>
      [
        ...teams.map((team) => team.displayName),
        ...teams.map((team) => team.name),
      ].filter(Boolean),
    [teams]
  );

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
        <div className="mx-auto max-w-5xl space-y-6">
          <FanGoalAlertBanner clubNames={clubNames} />
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8">
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
          section={section}
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
  section,
}: {
  campaign: S4PCampaign;
  supporterId: string | null;
  votedIds: Set<string>;
  onVotesChanged: () => Promise<void>;
  section: "projects" | "sponsors";
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
  const fundingOpen = fanFundingIsOpen({ folder, votingWindow });
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
    fixtureName: campaign.matchTitle,
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
    window.addEventListener(SPONSORED_GOAL_EVENT, refreshWallets);
    window.addEventListener(SIGNED_SPONSORSHIP_EVENT, refreshWallets);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("storage", refreshWallets);
      window.removeEventListener(SPONSORED_GOAL_EVENT, refreshWallets);
      window.removeEventListener(SIGNED_SPONSORSHIP_EVENT, refreshWallets);
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
      remainingGbp: totalLocalPledge(local),
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
    if (!fundingOpen) {
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
      const votedNow = [result.project.id];
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
      setNotice(walletVoteNotice(result));
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
        <div className="mb-6">
          <FanGoalAlertBanner
            clubNames={[campaign.clubName]}
            matchTitle={campaign.matchTitle}
            sponsorName={leadSponsor?.brandName || leadName}
            sponsorRemainingGbp={leadSponsor?.remainingGbp}
          />
        </div>
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-300">
            {campaign.clubName}
          </p>
          <h1 className="mt-2 text-3xl font-black md:text-5xl">{headline}</h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-400">
            {fanVotingWindowCopy()} {fanWalletDrainCopy(formatWalletGbp(0))}
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

        {section === "projects" ? (
          <section className="mt-10">
            <h2 className="text-3xl font-black">Climate Projects List</h2>
            <p className="mt-2 text-sm text-slate-400">
              Two Global Schools Solar versions sit at the top: a local school
              near the stadium, and a school anywhere in the world. Open a
              project to read the details. To put £0.20 into a school, open
              Climate Project Sponsors, select the project by name from the Lead
              Climate Sponsor box, then press FUND-IT. Local Business wallets
              fund the other Climate Projects. You can FUND-IT up to 5 times —
              £0.20 once from each Carbon Wallet.
            </p>
            <div className="mt-6 space-y-2">
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
            <div className="mt-8 rounded-2xl border border-emerald-400/30 bg-emerald-500/5 p-6">
              <h3 className="text-xl font-black">Climate Project Sponsors</h3>
              <p className="mt-2 max-w-3xl text-sm text-slate-300">
                The sponsor list and FUND-IT wallets are on a separate page.
                Choose a sponsor, pick the Climate Project from the drop-down,
                then press FUND-IT.
              </p>
              <Link
                href={SUPPORTER_CLIMATE_SPONSORS_PATH}
                className="mt-4 inline-flex rounded-xl bg-green-500 px-5 py-3 text-sm font-bold text-slate-950 hover:bg-green-400"
              >
                Open Climate Project Sponsors
              </Link>
            </div>
          </section>
        ) : (
          <div className="mt-10">
            <Link
              href={SUPPORTER_CAMPAIGN_PATH}
              className="mb-6 inline-flex text-sm font-semibold text-emerald-300 hover:text-emerald-200"
            >
              ← Climate Projects List
            </Link>
            <ClimateProjectSponsors
              lead={leadSponsor}
              locals={localSponsors}
              projects={projects.map((project) => ({
                number: project.number,
                name: project.name,
              }))}
              projectCount={projects.length || 5}
              busy={busy}
              votingOpen={fundingOpen}
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
        )}
      </div>
    </main>
  );
}

function voteableProjects(campaign: S4PCampaign): CampaignProject[] {
  const listed = campaign.featuredProject
    ? [campaign.featuredProject, ...campaign.projects]
    : campaign.projects;
  return withFeaturedGssVersions(listed);
}
