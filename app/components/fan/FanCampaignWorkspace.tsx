"use client";

import { useEffect, useMemo, useState } from "react";
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
import {
  getSupportedTeams,
  sponsorLogoSrc,
  type TeamOption,
} from "@/app/services/teams.service";
import { loadBrandLogo } from "@/app/services/climate-sponsors.service";
import { FAN_LOGIN_PATH } from "@/app/lib/routes";
import { CampaignMatchHeader } from "@/app/components/fan/CampaignMatchHeader";
import { FanClimateProjectPager } from "@/app/components/fan/FanClimateProjectPager";
import { liveMatchDayBranding } from "@/app/services/match-day-branding.service";
import { readFanPostSchedule } from "@/app/lib/match-day-post";
import { resolveVotingWindow } from "@/app/lib/voting-window";
import {
  applyFanWalletVote,
  fanFundItProjects,
  fanVisibleSponsors,
  identifyClubSponsorWallets,
  visibleMatchDayFolderForClub,
} from "@/app/services/match-day-folder.service";
import { withFeaturedGssVersions } from "@/app/lib/featured-gss";
import {
  brandsMatch,
  normalizeBrandKey,
  remainingGbp,
  walletVoteNotice,
  type NumberedClimateProject,
} from "@/app/lib/sponsor-wallet";
import { fanVotedSponsorNames } from "@/app/lib/climate-funding";
import { filterCampaignsForFan } from "@/app/lib/fan-campaign-scope";
import {
  localSponsorsForClub,
  totalLocalPledge,
  type LocalSponsorRecord,
} from "@/app/lib/local-sponsor";
import { fanFundingIsOpen, type MatchDayFolder } from "@/app/lib/match-day-folder";
import { FanGoalAlertBanner } from "@/app/components/fan/FanGoalAlertBanner";
import { SPONSORED_GOAL_EVENT } from "@/app/lib/sponsored-goal";
import { SIGNED_SPONSORSHIP_EVENT } from "@/app/lib/sponsor-completion-flow";
import { isLeadWalletLabel } from "@/app/lib/dual-sponsor";

export function FanCampaignWorkspace({
  section,
}: {
  section: "projects" | "sponsors" | "cards";
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
        void import("@/app/services/fan-activity.service").then(
          ({ syncFanActivityToStaff }) => syncFanActivityToStaff(current.id)
        );
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
          <a
            href={`${SUPPORTER_CAMPAIGN_PATH}#my-teams`}
            className="mt-6 inline-flex rounded-lg bg-green-500 px-5 py-3 font-bold text-slate-950"
          >
            Choose my teams
          </a>
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
          <a
            href={`${SUPPORTER_CAMPAIGN_PATH}#my-teams`}
            className="mt-6 inline-flex rounded-lg border border-green-500/40 px-5 py-3 font-bold text-green-300"
          >
            Update my teams
          </a>
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
  section: "projects" | "sponsors" | "cards";
}) {
  const voteable = voteableProjects(campaign);
  const clubId = campaign.postedClubId ?? campaign.clubId;
  const [folder, setFolder] = useState<MatchDayFolder | null>(() =>
    visibleMatchDayFolderForClub({ clubId, clubName: campaign.clubName })
  );
  const [projects, setProjects] = useState<NumberedClimateProject[]>(() =>
    fanFundItProjects(
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
      fixtureName: campaign.matchTitle,
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
      setProjects((prev) => fanFundItProjects(next, clubId, prev));
      setSponsors(
        fanVisibleSponsors(next, {
          clubId,
          clubName: campaign.clubName,
          minAmount: campaign.minimumAmount,
          gbpPerGoal: campaign.gbpPerGoal,
          fixtureName: campaign.matchTitle,
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
    const wallets = identifyClubSponsorWallets({
      clubId,
      clubName: campaign.clubName,
      minAmount: campaign.minimumAmount,
      gbpPerGoal: campaign.gbpPerGoal,
      fixtureName: campaign.matchTitle,
    });
    const liveLead =
      wallets.find(
        (wallet) => wallet.kind === "lead" && !isLeadWalletLabel(wallet.brandName)
      ) ?? wallets.find((wallet) => wallet.kind === "lead");
    const fromFile = sponsors.find((row) => row.kind === "lead");
    const brand =
      (liveLead && !isLeadWalletLabel(liveLead.brandName)
        ? liveLead.brandName
        : null) ||
      (fromFile && !isLeadWalletLabel(fromFile.brandName)
        ? fromFile.brandName
        : null) ||
      (isLeadWalletLabel(leadName) ? liveLead?.brandName || fromFile?.brandName : leadName) ||
      liveLead?.brandName ||
      fromFile?.brandName ||
      leadName;
    if (!brand) return null;
    return {
      brandName: brand,
      kind: "lead" as const,
      remainingGbp: liveLead
        ? remainingGbp(liveLead)
        : fromFile?.remainingGbp ?? campaign.minimumAmount,
      committedGbp: liveLead
        ? remainingGbp(liveLead) + liveLead.allocatedGbp
        : fromFile?.committedGbp ?? campaign.minimumAmount,
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
    campaign.matchTitle,
  ]);

  const localSponsors = useMemo(() => {
    const records = localSponsorsForClub(campaign.clubName);
    const remainingByBrand = new Map<
      string,
      {
        brandName: string;
        remainingGbp: number;
        committedGbp?: number;
        logoUrl?: string | null;
        sponsoredProjectId?: string | null;
        sponsoredProjectName?: string | null;
      }
    >();
    for (const row of sponsors.filter((item) => item.kind === "local")) {
      const record = records.find((local) =>
        brandsMatch(local.brandName, row.brandName)
      );
      remainingByBrand.set(normalizeBrandKey(row.brandName), {
        brandName: row.brandName,
        remainingGbp: row.remainingGbp,
        committedGbp: row.committedGbp,
        logoUrl:
          rankedLocals.find((local) => local.brandName === row.brandName)?.logoUrl ??
          record?.logoUrl ??
          null,
        sponsoredProjectId: record?.sponsoredProjectId ?? null,
        sponsoredProjectName: record?.sponsoredProjectName ?? null,
      });
    }
    for (const wallet of identifyClubSponsorWallets({
      clubId,
      clubName: campaign.clubName,
      minAmount: campaign.minimumAmount,
      gbpPerGoal: campaign.gbpPerGoal,
      fixtureName: campaign.matchTitle,
    }).filter((item) => item.kind === "local")) {
      const key = normalizeBrandKey(wallet.brandName);
      remainingByBrand.set(key, {
        brandName: remainingByBrand.get(key)?.brandName ?? wallet.brandName,
        remainingGbp: remainingGbp(wallet),
        committedGbp: remainingGbp(wallet) + wallet.allocatedGbp,
        logoUrl: remainingByBrand.get(key)?.logoUrl ?? null,
        sponsoredProjectId:
          wallet.sponsoredProjectId ??
          remainingByBrand.get(key)?.sponsoredProjectId ??
          null,
        sponsoredProjectName:
          wallet.sponsoredProjectName ??
          remainingByBrand.get(key)?.sponsoredProjectName ??
          null,
      });
    }
    for (const local of rankedLocals) {
      const key = normalizeBrandKey(local.brandName);
      const existing = remainingByBrand.get(key);
      if (existing) {
        remainingByBrand.set(key, {
          ...existing,
          logoUrl: local.logoUrl ?? existing.logoUrl,
          sponsoredProjectId:
            local.sponsoredProjectId ?? existing.sponsoredProjectId ?? null,
          sponsoredProjectName:
            local.sponsoredProjectName ?? existing.sponsoredProjectName ?? null,
        });
        continue;
      }
      remainingByBrand.set(key, {
        brandName: local.brandName,
        remainingGbp: totalLocalPledge(local),
        committedGbp: totalLocalPledge(local),
        logoUrl: local.logoUrl ?? null,
        sponsoredProjectId: local.sponsoredProjectId ?? null,
        sponsoredProjectName: local.sponsoredProjectName ?? null,
      });
    }
    return [...remainingByBrand.values()].map((row) => ({
      brandName: row.brandName,
      kind: "local" as const,
      remainingGbp: row.remainingGbp,
      committedGbp: row.committedGbp,
      logoUrl: row.logoUrl ?? null,
      sponsoredProjectId: row.sponsoredProjectId ?? null,
      sponsoredProjectName: row.sponsoredProjectName ?? null,
    }));
  }, [
    sponsors,
    rankedLocals,
    clubId,
    campaign.clubName,
    campaign.minimumAmount,
    campaign.gbpPerGoal,
    campaign.matchTitle,
  ]);

  async function voteFromWallet({
    brandName,
    projectNumber,
    split = false,
  }: {
    brandName: string;
    projectNumber?: string;
    split?: boolean;
  }): Promise<boolean> {
    const fanId = supporterId || "fan-local";
    if (!fundingOpen) {
      setError("Voting is not open for this match yet, or it has already closed.");
      return false;
    }
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const leadTake =
        isLeadWalletLabel(brandName) ||
        Boolean(leadSponsor && brandsMatch(leadSponsor.brandName, brandName));
      const result = applyFanWalletVote({
        clubId,
        clubName: campaign.clubName,
        brandName,
        projectNumber,
        split,
        supporterId: fanId,
        projects,
        minAmount: campaign.minimumAmount,
        gbpPerGoal: campaign.gbpPerGoal,
        displayedRemaining: leadTake ? leadSponsor?.remainingGbp : undefined,
        fixtureName: campaign.matchTitle,
        createLeadIfMissing: leadTake,
      });
      if (!result.ok) {
        setError(result.error);
        return false;
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
          fixtureName: campaign.matchTitle,
        })
      );
      const votedNow = [result.project.id];
      try {
        if (supporterId) {
          await submitCampaignVotes(
            supporterId,
            [...new Set([...votedIds, ...votedNow])],
            voteable.map((project) => project.id),
            campaign.campaignId,
            clubId
          );
          await onVotesChanged();
        }
      } catch {
        // Wallet cash has already moved even if the campaign vote row cannot be stored.
      }
      setNotice(walletVoteNotice(result));
      return true;
    } catch (err) {
      console.error("Failed to submit vote:", describeDataError(err));
      setError(describeDataError(err, "Failed to submit your vote."));
      return false;
    } finally {
      setBusy(false);
    }
  }

  const sponsoredByName = (leadSponsor?.brandName || leadName || "").trim();
  const sponsoredByLogo =
    leadSponsor?.logoUrl ||
    leadLogoUrl ||
    (sponsoredByName ? loadBrandLogo(sponsoredByName) : null) ||
    (sponsoredByName ? sponsorLogoSrc(sponsoredByName, null) : null);

  return (
    <main
      data-workspace-section={section}
      className="pb-8 text-slate-950"
    >
      <div className="mx-auto max-w-[90rem] px-4 md:px-8">
        <div className="mb-6">
          <FanGoalAlertBanner
            clubNames={[campaign.clubName]}
            matchTitle={campaign.matchTitle}
            sponsorName={leadSponsor?.brandName || leadName}
            sponsorRemainingGbp={leadSponsor?.remainingGbp}
          />
        </div>
        <CampaignMatchHeader
          clubName={campaign.clubName}
          matchTitle={campaign.matchTitle}
          sponsorName={sponsoredByName}
          sponsorLogoUrl={sponsoredByLogo}
          kickoffAt={campaign.kickoffAt ?? folder?.matchDate ?? null}
          venue={campaign.venue ?? null}
        />

        <div className="mt-8">
          <FanClimateProjectPager
            clubName={campaign.clubName}
            clubId={clubId}
            numbered={projects}
            details={voteable}
            lead={leadSponsor}
            locals={localSponsors}
            fundingOpen={fundingOpen}
            busy={busy}
            usedSponsorNames={usedSponsors}
            voteError={error}
            voteNotice={notice}
            onFund={({ brandName, projectNumber }) =>
              voteFromWallet({ brandName, projectNumber, split: false })
            }
          />
        </div>
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
