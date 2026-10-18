import { supabase } from "../lib/supabase";
import {
  LEAGUE_SPORT,
  leagueForClubName,
} from "../lib/current-season";
import {
  brandsMatch,
  canClaimLeadClimateSponsor,
  displayLockFixture,
  isLeadMatchDaySponsorBrand,
  isNamedFixture,
  isRemovedSponsorBrand,
  networkHasClub,
  offerMatchesLockedMatch,
  offersForLockedSponsor,
} from "../lib/climate-sponsors";
import { sameNamedFixture } from "../lib/club-fixtures";
import {
  includeBrandOnTargets,
  isWalletFundingLocked,
  notifySignedSponsorship,
  resolveCommittedMatchFunding,
  shouldFillLockedOfferWithUploads,
  shouldPullLockedClubUploads,
} from "../lib/sponsor-completion-flow";
import { scoreLabelForSport } from "../lib/sports";
import { sponsorOfferHeadline } from "../lib/s4p-climate-projects";
import { carbonOffsetHeadline } from "../lib/match-day-carbon-offset";
import { OPENING_SPONSORSHIP } from "../lib/sponsorship-auction";
import {
  bestClubMatch,
  clubsMatch,
  pairSignedSponsorships,
  proposalMatchesClub,
  unsignedMatchOffers,
  sponsorshipFolderStats,
  type SignedSponsorship,
  type SponsorDashboardStats,
} from "../lib/sponsor-dashboard";
import type { ClimateProject } from "./votes.service";
import { getCurrentSponsor } from "./current-sponsor.service";
import {
  ensureGoalNetwork,
  listGoalNetworks,
  listMatchDayLocks,
  loadGoalNetwork,
  loadMatchDayLock,
} from "./climate-sponsors.service";
import { readClimateWallet } from "./sponsor-wallet.service";
import { signedOrPostedBrandForClub as brandFromPostedOffers } from "../lib/campaign-sponsor";
import { clubShouldStartBlank } from "../lib/clear-club-data";

export type SponsorOfferProject = {
  id: string;
  name: string;
  description: string | null;
  country: string | null;
  category: string | null;
  estimated_co2: number | null;
  funding_goal?: number | null;
  status?: string | null;
  location?: string | null;
};

export type SponsorMatchOffer = {
  id: string;
  clubId: string;
  clubName: string;
  clubEmail: string | null;
  matchTitle: string;
  matchDate: string | null;
  scoreLabel: string;
  projectIds: string[];
  projects: SponsorOfferProject[];
  postedAt: string;
  headline: string;
  sponsorshipAmountGbp: number;
  gbpPerVote?: number | null;
  gbpPerGoal?: number | null;
  maxAmount?: number | null;
  targetBrandNames?: string[] | null;
};

export type SponsorOfferSignature = {
  id: string;
  offerId: string;
  sponsorId: string | null;
  signerName: string;
  brandName: string;
  acceptedTerms: boolean;
  signedAt: string;
};

export type SponsorProjectProposal = {
  id: string;
  clubId: string;
  clubName: string;
  sponsorId: string | null;
  sponsorName: string;
  sponsorEmail: string | null;
  projectIds: string[];
  projects: SponsorOfferProject[];
  createdAt: string;
  status: string;
};

const OFFER_STORAGE = "s4p.sponsor.matchOffers";
const SIGN_STORAGE = "s4p.sponsor.offerSignatures";
const PROPOSAL_STORAGE = "s4p.sponsor.projectProposals";

function snapshotProject(project: ClimateProject): SponsorOfferProject {
  return {
    id: project.id,
    name: project.name,
    description: project.description ?? null,
    country: project.country ?? null,
    category: project.category ?? null,
    estimated_co2: project.estimated_co2 ?? null,
    funding_goal: project.funding_goal ?? null,
    status: project.status ?? null,
    location: project.location ?? null,
  };
}

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

function mergeById<T extends { id: string }>(left: T[], right: T[]): T[] {
  const byId = new Map<string, T>();
  for (const item of right) byId.set(item.id, item);
  for (const item of left) byId.set(item.id, item);
  return [...byId.values()];
}

export async function lookupClubMatchContext(
  clubId: string,
  clubName: string
): Promise<{ matchTitle: string; matchDate: string | null; scoreLabel: string }> {
  const league = leagueForClubName(clubName);
  const sport = league ? LEAGUE_SPORT[league] ?? "Football" : "Football";
  const scoreLabel = scoreLabelForSport(sport);

  const { data: campaign } = await supabase
    .from("match_campaigns")
    .select("title, voting_closes, match_id")
    .eq("club_id", clubId)
    .eq("status", "open")
    .maybeSingle();

  let matchTitle = (campaign?.title as string | null) ?? `${clubName} Match Day`;
  let matchDate = (campaign?.voting_closes as string | null) ?? null;

  const fixtureId = campaign?.match_id as string | null;
  if (fixtureId) {
    const { data: fixture } = await supabase
      .from("fixtures")
      .select("*")
      .eq("id", fixtureId)
      .maybeSingle();
    if (fixture) {
      const kickoff =
        (fixture.kickoff_at as string | null) ??
        (fixture.kick_off as string | null) ??
        (fixture.starts_at as string | null) ??
        (fixture.match_date as string | null);
      if (kickoff) matchDate = kickoff;
    }
  }

  if (!campaign) {
    const { data: fixture } = await supabase
      .from("fixtures")
      .select("*")
      .or(`home_club_id.eq.${clubId},away_club_id.eq.${clubId}`)
      .limit(1)
      .maybeSingle();
    if (fixture) {
      const kickoff =
        (fixture.kickoff_at as string | null) ??
        (fixture.kick_off as string | null) ??
        (fixture.starts_at as string | null) ??
        (fixture.match_date as string | null);
      if (kickoff) matchDate = kickoff;
    }
  }

  return { matchTitle, matchDate, scoreLabel };
}

function sameClubMatchOffer(
  left: Pick<SponsorMatchOffer, "clubName" | "matchTitle">,
  right: Pick<SponsorMatchOffer, "clubName" | "matchTitle">
): boolean {
  if (!clubsMatch(left.clubName, right.clubName)) return false;
  if (isNamedFixture(left.matchTitle) && isNamedFixture(right.matchTitle)) {
    return sameNamedFixture(left.matchTitle, right.matchTitle);
  }
  return left.matchTitle.trim() === right.matchTitle.trim();
}

export async function publishSponsorMatchOffer({
  clubId,
  clubName,
  clubEmail,
  projects,
  sponsorshipAmountGbp,
  gbpPerVote,
  gbpPerGoal,
  maxAmount,
  targetBrandNames,
  matchTitle,
  matchDate,
}: {
  clubId: string;
  clubName: string;
  clubEmail?: string | null;
  projects: ClimateProject[];
  sponsorshipAmountGbp?: number | null;
  gbpPerVote?: number | null;
  gbpPerGoal?: number | null;
  maxAmount?: number | null;
  targetBrandNames?: string[] | null;
  matchTitle?: string | null;
  matchDate?: string | null;
}): Promise<SponsorMatchOffer> {
  const context = await lookupClubMatchContext(clubId, clubName);
  const title = String(matchTitle ?? "").trim() || context.matchTitle;
  const date = String(matchDate ?? "").trim() || context.matchDate;
  const offer: SponsorMatchOffer = {
    id: crypto.randomUUID(),
    clubId,
    clubName,
    clubEmail: clubEmail ?? null,
    matchTitle: title,
    matchDate: date,
    scoreLabel: context.scoreLabel,
    projectIds: projects.map((project) => project.id),
    projects: projects.map(snapshotProject),
    postedAt: new Date().toISOString(),
    headline: sponsorOfferHeadline({
      clubName,
      matchTitle: title,
      matchDate: date,
      scoreLabel: context.scoreLabel,
    }),
    sponsorshipAmountGbp:
      Number(sponsorshipAmountGbp) || OPENING_SPONSORSHIP,
    gbpPerVote:
      Number(gbpPerVote) > 0 ? Number(gbpPerVote) : null,
    gbpPerGoal: Number(gbpPerGoal) > 0 ? Number(gbpPerGoal) : null,
    maxAmount: Number(maxAmount) > 0 ? Number(maxAmount) : null,
    targetBrandNames: (() => {
      const names = (targetBrandNames ?? []).filter(Boolean);
      return names.length ? names : undefined;
    })(),
  };

  const local = readJson<SponsorMatchOffer[]>(OFFER_STORAGE, []);
  writeJson(
    OFFER_STORAGE,
    [
      offer,
      ...local.filter(
        (row) => row.id !== offer.id && !sameClubMatchOffer(row, offer)
      ),
    ].slice(0, 50)
  );

  void supabase.from("sponsor_match_offers").insert({
    id: offer.id,
    club_id: offer.clubId,
    club_name: offer.clubName,
    club_email: offer.clubEmail,
    match_title: offer.matchTitle,
    match_date: offer.matchDate,
    score_label: offer.scoreLabel,
    project_ids: offer.projectIds,
    projects: offer.projects,
    posted_at: offer.postedAt,
    headline: offer.headline,
    status: "open",
    target_brand_names: offer.targetBrandNames,
    gbp_per_vote: offer.gbpPerVote,
    sponsorship_amount_gbp: offer.sponsorshipAmountGbp,
  });

  return offer;
}

function writeLocalOffer(offer: SponsorMatchOffer): SponsorMatchOffer {
  const local = readJson<SponsorMatchOffer[]>(OFFER_STORAGE, []);
  writeJson(
    OFFER_STORAGE,
    [offer, ...local.filter((row) => row.id !== offer.id)].slice(0, 50)
  );
  return offer;
}

function stampCommittedFundingOnOffer(
  offer: SponsorMatchOffer,
  brandName: string,
  lock: ReturnType<typeof loadMatchDayLock>
): SponsorMatchOffer {
  const funding = resolveCommittedMatchFunding({
    lock,
    wallet: lock?.clubName
      ? readClimateWallet(lock.clubName, brandName)
      : null,
    offer,
  });
  const next = {
    ...offer,
    sponsorshipAmountGbp: funding.baseAmount || offer.sponsorshipAmountGbp,
    gbpPerGoal: funding.gbpPerGoal || offer.gbpPerGoal || null,
    maxAmount: funding.maxAmount || offer.maxAmount || null,
  };
  if (
    next.sponsorshipAmountGbp === offer.sponsorshipAmountGbp &&
    next.gbpPerGoal === offer.gbpPerGoal &&
    next.maxAmount === offer.maxAmount
  ) {
    return offer;
  }
  return writeLocalOffer(next);
}

function includeBrandOnStoredOffer(
  offer: SponsorMatchOffer,
  brandName: string
): SponsorMatchOffer {
  const targetBrandNames = includeBrandOnTargets(
    offer.targetBrandNames,
    brandName
  );
  if (
    (offer.targetBrandNames ?? []).length === targetBrandNames.length &&
    targetBrandNames.every((name) =>
      (offer.targetBrandNames ?? []).some((row) => brandsMatch(row, name))
    )
  ) {
    return offer;
  }
  return writeLocalOffer({ ...offer, targetBrandNames });
}

export async function loadClubChosenClimateProjects(clubName: string) {
  return uploadedProjectsForLockedClub(clubName);
}

async function uploadedProjectsForLockedClub(clubName: string): Promise<{
  clubId: string;
  clubName: string;
  projects: ClimateProject[];
  minAmount?: number | null;
  gbpPerGoal?: number | null;
  maxAmount?: number | null;
  gbpPerVote?: number | null;
} | null> {
  const { findClubByPreferenceName } = await import("./teams.service");
  const {
    findStoredClubSelectionByName,
    loadClubProjectBoard,
    loadProjectsByIds,
    readStoredMatchDay,
  } = await import("./club-match-day.service");
  const { uploadedMatchDayFolderForClub } = await import(
    "./match-day-folder.service"
  );
  const { readAllFanPostSchedules, readAllMatchDayStores } = await import(
    "../lib/match-day-post"
  );

  let team: { id: string; name: string } | null = null;
  try {
    team = await findClubByPreferenceName(clubName);
  } catch {
    team = null;
  }
  let registered: { id: string | null; name: string } = {
    id: null,
    name: clubName,
  };
  try {
    registered = await resolveClubForSponsor(clubName);
  } catch {
    registered = { id: null, name: clubName };
  }
  const folder = uploadedMatchDayFolderForClub(clubName);
  const schedule = readAllFanPostSchedules().find((row) =>
    clubsMatch(row.clubName, clubName)
  );
  const fileRecord = findStoredClubSelectionByName(clubName);
  const candidateIds = [
    team?.id,
    registered.id,
    folder?.clubId,
    schedule?.clubId,
    fileRecord?.clubId,
  ].filter((id): id is string => Boolean(id));
  const store = readAllMatchDayStores().find((row) =>
    candidateIds.includes(row.clubId)
  );
  const clubId = candidateIds[0] || store?.clubId || "";
  if (!clubId) return null;
  const displayName =
    team?.name || registered.name || folder?.clubName || clubName;

  try {
    const board = await loadClubProjectBoard(clubId, displayName);
    if (board.selected.length > 0) {
      return {
        clubId,
        clubName: displayName,
        projects: board.selected,
        minAmount: board.minAmount,
      };
    }
  } catch {
    // Fall through to stored Match Day ids and the Climate Projects File.
  }

  const stored = readStoredMatchDay(clubId);
  const folderIds = (folder?.projectsFile?.projects ?? []).map(
    (project) => project.id
  );
  const ids = [
    ...(stored?.projectIds ?? []),
    ...(schedule?.projectIds ?? []),
    ...(store?.projectIds ?? []),
    ...(fileRecord?.projectIds ?? []),
    ...folderIds,
  ].filter(Boolean);
  const uniqueIds = [...new Set(ids)];
  let projects: ClimateProject[] = [];
  if (uniqueIds.length > 0) {
    try {
      projects = await loadProjectsByIds(uniqueIds);
    } catch {
      projects = [];
    }
  }
  if (projects.length === 0 && folder?.projectsFile?.projects.length) {
    projects = folder.projectsFile.projects.map((project) => ({
      id: project.id,
      name: project.name,
      description: null,
      category: null,
      country: null,
      estimated_co2: null,
      funding_goal: null,
      image_url: null,
      status: null,
    }));
  }
  if (projects.length === 0 && fileRecord?.projects.length) {
    projects = fileRecord.projects.map((project) => ({
      id: project.id,
      name: project.name,
      description: project.description,
      category: project.category,
      country: project.country,
      estimated_co2: project.estimated_co2,
      funding_goal: null,
      image_url: null,
      status: null,
    }));
  }
  if (projects.length === 0) return null;
  return {
    clubId,
    clubName: displayName,
    projects,
    minAmount: stored?.minAmount ?? fileRecord?.minAmount ?? null,
    gbpPerGoal: stored?.gbpPerGoal ?? null,
    maxAmount: stored?.maxAmount ?? null,
    gbpPerVote: stored?.gbpPerVote ?? null,
  };
}

async function stampOfferWithLockedUploads(
  offer: SponsorMatchOffer,
  uploaded: Awaited<ReturnType<typeof uploadedProjectsForLockedClub>>,
  brandName: string,
  lock: NonNullable<ReturnType<typeof loadMatchDayLock>>
): Promise<SponsorMatchOffer> {
  const stamped = stampCommittedFundingOnOffer(
    includeBrandOnStoredOffer(offer, brandName),
    brandName,
    lock
  );
  if (
    !uploaded ||
    !shouldFillLockedOfferWithUploads({
      pendingProjectCount: stamped.projects.length,
      uploadedProjectCount: uploaded.projects.length,
    })
  ) {
    return stamped;
  }
  const fixture = displayLockFixture(lock);
  const filled = await attachProjectsToClubSponsorships({
    clubId: uploaded.clubId || stamped.clubId,
    clubName: uploaded.clubName || stamped.clubName,
    projects: uploaded.projects,
    matchTitle: isNamedFixture(fixture) ? fixture : stamped.matchTitle,
    matchDate: lock.fixtureDate || stamped.matchDate,
    minAmount: uploaded.minAmount,
    gbpPerGoal: uploaded.gbpPerGoal,
    maxAmount: uploaded.maxAmount,
    gbpPerVote: uploaded.gbpPerVote,
    targetBrandNames: [brandName],
  });
  const next =
    filled.find((row) => row.id === stamped.id) ??
    filled.find((row) => offerMatchesLockedMatch(row, lock)) ??
    filled[0] ??
    stamped;
  return stampCommittedFundingOnOffer(
    includeBrandOnStoredOffer(next, brandName),
    brandName,
    lock
  );
}

function firstLeadHoldsChosenProjects(
  brandName: string,
  clubName: string,
  fixtureName?: string | null
): boolean {
  if (!isLeadMatchDaySponsorBrand(brandName)) return true;
  return canClaimLeadClimateSponsor({
    clubName,
    brandName,
    fixtureName,
    networks: listGoalNetworks(),
    locks: listMatchDayLocks(),
  });
}

export async function ensureCarbonOffsetSponsorshipOffer(options: {
  brandName: string;
  brandEmail?: string | null;
}): Promise<SponsorMatchOffer | null> {
  const brandName = options.brandName.trim();
  if (!brandName) return null;
  const lock = loadMatchDayLock(brandName);
  if (!lock?.clubName?.trim()) return null;
  const fixture = displayLockFixture(lock);
  if (!isNamedFixture(fixture)) return null;
  if (!firstLeadHoldsChosenProjects(brandName, lock.clubName, fixture)) {
    return null;
  }
  const wallet = readClimateWallet(lock.clubName, brandName);
  if (!isWalletFundingLocked(lock) && !(Number(wallet?.commitmentFeeGbp) > 0)) {
    return null;
  }
  ensureGoalNetwork({
    brandName,
    email: options.brandEmail,
    clubNames: [lock.clubName],
  });
  const uploaded = await uploadedProjectsForLockedClub(lock.clubName);
  const allOffers = await listSponsorMatchOffers();
  const signatures = await listOfferSignatures();
  const existing = allOffers.find(
    (offer) =>
      offerMatchesLockedMatch(offer, lock) &&
      (!offer.targetBrandNames?.length ||
        offer.targetBrandNames.some((name) => brandsMatch(name, brandName)))
  );
  if (existing) {
    return stampOfferWithLockedUploads(existing, uploaded, brandName, lock);
  }
  const signedForMatch = pairSignedSponsorships(allOffers, signatures, {
    brandName,
    clubName: lock.clubName,
  }).find((row) => offerMatchesLockedMatch(row.offer, lock));
  if (signedForMatch) {
    return stampCommittedFundingOnOffer(
      includeBrandOnStoredOffer(signedForMatch.offer, brandName),
      brandName,
      lock
    );
  }
  const funding = resolveCommittedMatchFunding({ lock, wallet });
  const projects = uploaded?.projects ?? [];
  return publishSponsorMatchOffer({
    clubId: uploaded?.clubId || `name:${lock.clubName}`,
    clubName: uploaded?.clubName || lock.clubName,
    projects,
    sponsorshipAmountGbp: funding.baseAmount || uploaded?.minAmount,
    gbpPerGoal: funding.gbpPerGoal || uploaded?.gbpPerGoal,
    maxAmount: funding.maxAmount || uploaded?.maxAmount,
    gbpPerVote: uploaded?.gbpPerVote,
    targetBrandNames: [brandName],
    matchTitle: fixture,
    matchDate: lock.fixtureDate,
  }).then((offer) => {
    const headline = projects.length
      ? offer.headline
      : carbonOffsetHeadline({
          clubName: offer.clubName,
          matchTitle: fixture,
        });
    return stampCommittedFundingOnOffer(
      writeLocalOffer({ ...offer, headline }),
      brandName,
      lock
    );
  });
}

export async function attachProjectsToClubSponsorships({
  clubId,
  clubName,
  projects,
  matchTitle,
  matchDate,
  minAmount,
  gbpPerGoal,
  maxAmount,
  gbpPerVote,
  targetBrandNames,
}: {
  clubId: string;
  clubName: string;
  projects: ClimateProject[];
  matchTitle?: string | null;
  matchDate?: string | null;
  minAmount?: number | null;
  gbpPerGoal?: number | null;
  maxAmount?: number | null;
  gbpPerVote?: number | null;
  targetBrandNames?: string[] | null;
}): Promise<SponsorMatchOffer[]> {
  if (!clubName.trim() || projects.length === 0) return [];
  const fixture = String(matchTitle ?? "").trim();
  const allOffers = await listSponsorMatchOffers();
  const next: SponsorMatchOffer[] = [];
  let touched = false;
  for (const offer of allOffers) {
    if (!clubsMatch(offer.clubName, clubName)) {
      next.push(offer);
      continue;
    }
    if (
      fixture &&
      isNamedFixture(fixture) &&
      isNamedFixture(offer.matchTitle) &&
      !sameNamedFixture(offer.matchTitle, fixture)
    ) {
      next.push(offer);
      continue;
    }
    touched = true;
    next.push(
      writeLocalOffer({
        ...offer,
        clubId: offer.clubId || clubId,
        matchTitle: fixture || offer.matchTitle,
        matchDate: String(matchDate ?? offer.matchDate ?? "").trim() || offer.matchDate,
        projectIds: projects.map((project) => project.id),
        projects: projects.map(snapshotProject),
        headline: sponsorOfferHeadline({
          clubName: offer.clubName,
          matchTitle: fixture || offer.matchTitle,
          matchDate: matchDate || offer.matchDate,
          scoreLabel: offer.scoreLabel,
        }),
        sponsorshipAmountGbp:
          Number(minAmount) || offer.sponsorshipAmountGbp,
        gbpPerGoal: Number(gbpPerGoal) > 0 ? Number(gbpPerGoal) : offer.gbpPerGoal,
        maxAmount: Number(maxAmount) > 0 ? Number(maxAmount) : offer.maxAmount,
        gbpPerVote: Number(gbpPerVote) > 0 ? Number(gbpPerVote) : offer.gbpPerVote,
        targetBrandNames: (() => {
          const names = includeBrandOnTargets(
            offer.targetBrandNames ?? targetBrandNames,
            (targetBrandNames ?? [])[0] ?? ""
          );
          return names.length
            ? names
            : offer.targetBrandNames ?? targetBrandNames;
        })(),
      })
    );
  }
  if (!touched) {
    const published = await publishSponsorMatchOffer({
      clubId,
      clubName,
      projects,
      sponsorshipAmountGbp: minAmount,
      gbpPerGoal,
      maxAmount,
      gbpPerVote,
      targetBrandNames,
      matchTitle: fixture || undefined,
      matchDate: matchDate || undefined,
    });
    return [published];
  }
  return next.filter((offer) => clubsMatch(offer.clubName, clubName));
}

export async function hydrateClubSponsorsFromSigned(
  clubId: string,
  clubName: string
): Promise<void> {
  const { recordSignedLeadClimateSponsor, hydrateLeadOccupancyFromLocks } =
    await import("./climate-sponsors.service");
  hydrateLeadOccupancyFromLocks(clubName);
  const signed = await listClubSignedSponsorships(clubId, clubName);
  for (const row of signed) {
    recordSignedLeadClimateSponsor({
      brandName: row.signature.brandName,
      clubName: row.offer.clubName,
      clubId: row.offer.clubId,
      fixtureName: row.offer.matchTitle,
      fixtureDate: row.offer.matchDate,
    });
  }
}

export async function ensureOfferFromLockedClubUploads(options: {
  brandName: string;
  brandEmail?: string | null;
}): Promise<SponsorMatchOffer | null> {
  const brandName = options.brandName.trim();
  if (!brandName) return null;
  const lock = loadMatchDayLock(brandName);
  const network = loadGoalNetwork(brandName, options.brandEmail);
  if (!lock?.clubName || !networkHasClub(network, lock.clubName)) return null;
  if (
    !firstLeadHoldsChosenProjects(
      brandName,
      lock.clubName,
      displayLockFixture(lock)
    )
  ) {
    return null;
  }

  const uploaded = await uploadedProjectsForLockedClub(lock.clubName);
  const allOffers = await listSponsorMatchOffers();
  const signatures = await listOfferSignatures();
  const matchOffers = allOffers.filter((offer) =>
    offerMatchesLockedMatch(offer, lock)
  );
  const visiblePending = unsignedMatchOffers(
    offersForLockedSponsor(matchOffers, { brandName, network, lock }),
    signatures
  );
  if (visiblePending[0]) {
    return stampOfferWithLockedUploads(
      visiblePending[0],
      uploaded,
      brandName,
      lock
    );
  }

  if (
    !uploaded ||
    !shouldPullLockedClubUploads({
      pendingForClub: 0,
      uploadedProjectCount: uploaded.projects.length,
    })
  ) {
    return null;
  }

  const fixture = displayLockFixture(lock);
  const funding = resolveCommittedMatchFunding({
    lock,
    wallet: readClimateWallet(lock.clubName, brandName),
    offer: {
      sponsorshipAmountGbp: uploaded.minAmount,
      gbpPerGoal: uploaded.gbpPerGoal,
      maxAmount: uploaded.maxAmount,
    },
  });
  return publishSponsorMatchOffer({
    clubId: uploaded.clubId,
    clubName: uploaded.clubName,
    projects: uploaded.projects,
    sponsorshipAmountGbp: funding.baseAmount || uploaded.minAmount,
    gbpPerGoal: funding.gbpPerGoal || uploaded.gbpPerGoal,
    maxAmount: funding.maxAmount || uploaded.maxAmount,
    gbpPerVote: uploaded.gbpPerVote,
    targetBrandNames: [brandName],
    matchTitle: isNamedFixture(fixture) ? fixture : undefined,
    matchDate: lock.fixtureDate,
  });
}

function mapOfferRow(row: Record<string, unknown>): SponsorMatchOffer {
  const clubName = String(row.club_name ?? "Club");
  const matchTitle = String(row.match_title ?? `${clubName} Match Day`);
  const matchDate = (row.match_date as string | null) ?? null;
  const scoreLabel = String(row.score_label ?? "Goal");
  return {
    id: String(row.id),
    clubId: String(row.club_id ?? ""),
    clubName,
    clubEmail: (row.club_email as string | null) ?? null,
    matchTitle,
    matchDate,
    scoreLabel,
    projectIds: (row.project_ids as string[]) ?? [],
    projects: (row.projects as SponsorOfferProject[]) ?? [],
    postedAt: String(row.posted_at ?? new Date().toISOString()),
    headline:
      (row.headline as string | null) ??
      sponsorOfferHeadline({ clubName, matchTitle, matchDate, scoreLabel }),
    sponsorshipAmountGbp:
      Number(row.sponsorship_amount_gbp) || OPENING_SPONSORSHIP,
    gbpPerVote:
      Number(row.gbp_per_vote) > 0 ? Number(row.gbp_per_vote) : null,
    gbpPerGoal:
      Number(row.gbp_per_goal) > 0 ? Number(row.gbp_per_goal) : null,
    maxAmount: Number(row.max_amount) > 0 ? Number(row.max_amount) : null,
    targetBrandNames: Array.isArray(row.target_brand_names)
      ? (row.target_brand_names as string[])
      : undefined,
  };
}

export async function listSponsorMatchOffers(): Promise<SponsorMatchOffer[]> {
  const local = readJson<SponsorMatchOffer[]>(OFFER_STORAGE, []);
  const { data } = await supabase
    .from("sponsor_match_offers")
    .select("*")
    .order("posted_at", { ascending: false });
  const remote = (data ?? []).map((row) => mapOfferRow(row as Record<string, unknown>));
  return mergeById(local, remote)
    .map((offer) => ({
      ...offer,
      sponsorshipAmountGbp:
        Number(offer.sponsorshipAmountGbp) || OPENING_SPONSORSHIP,
      gbpPerVote:
        Number(offer.gbpPerVote) > 0 ? Number(offer.gbpPerVote) : offer.gbpPerVote ?? null,
      gbpPerGoal:
        Number(offer.gbpPerGoal) > 0 ? Number(offer.gbpPerGoal) : offer.gbpPerGoal ?? null,
      maxAmount:
        Number(offer.maxAmount) > 0 ? Number(offer.maxAmount) : offer.maxAmount ?? null,
      targetBrandNames: offer.targetBrandNames,
    }))
    .sort((a, b) => b.postedAt.localeCompare(a.postedAt));
}

export async function getSponsorMatchOffer(
  id: string
): Promise<SponsorMatchOffer | null> {
  const offers = await listSponsorMatchOffers();
  return offers.find((offer) => offer.id === id) ?? null;
}

export async function listOfferSignatures(): Promise<SponsorOfferSignature[]> {
  const local = readJson<SponsorOfferSignature[]>(SIGN_STORAGE, []);
  const { data } = await supabase
    .from("sponsor_offer_signatures")
    .select("*")
    .order("signed_at", { ascending: false });
  const remote = (data ?? []).map((row) => ({
    id: String(row.id),
    offerId: String(row.offer_id),
    sponsorId: (row.sponsor_id as string | null) ?? null,
    signerName: String(row.signer_name ?? ""),
    brandName: String(row.brand_name ?? ""),
    acceptedTerms: Boolean(row.accepted_terms),
    signedAt: String(row.signed_at ?? ""),
  }));
  return mergeById(local, remote).filter(
    (row) => !isRemovedSponsorBrand(row.brandName)
  );
}

export async function signSponsorOffer({
  offerId,
  signerName,
  brandName,
}: {
  offerId: string;
  signerName: string;
  brandName: string;
}): Promise<SponsorOfferSignature> {
  if (isRemovedSponsorBrand(brandName)) {
    throw new Error("This brand is not available as a Climate Sponsor.");
  }
  let sponsorId: string | null = null;
  try {
    const sponsor = await getCurrentSponsor();
    sponsorId = String(sponsor.id);
  } catch {
    sponsorId = null;
  }

  const signature: SponsorOfferSignature = {
    id: crypto.randomUUID(),
    offerId,
    sponsorId,
    signerName: signerName.trim(),
    brandName: brandName.trim(),
    acceptedTerms: true,
    signedAt: new Date().toISOString(),
  };

  const local = readJson<SponsorOfferSignature[]>(SIGN_STORAGE, []);
  writeJson(SIGN_STORAGE, [
    signature,
    ...local.filter((row) => row.offerId !== offerId || row.sponsorId !== sponsorId),
  ]);

  await supabase.from("sponsor_offer_signatures").insert({
    id: signature.id,
    offer_id: signature.offerId,
    sponsor_id: signature.sponsorId,
    signer_name: signature.signerName,
    brand_name: signature.brandName,
    accepted_terms: true,
    signed_at: signature.signedAt,
  });

  try {
    const offer = await getSponsorMatchOffer(offerId);
    if (offer?.clubName) {
      const { recordSignedLeadClimateSponsor } = await import(
        "./climate-sponsors.service"
      );
      recordSignedLeadClimateSponsor({
        brandName: signature.brandName,
        clubName: offer.clubName,
        clubId: offer.clubId,
        fixtureName: offer.matchTitle,
        fixtureDate: offer.matchDate,
      });
    }
    if (offer?.clubId && offer.clubName) {
      if (offer.projects.length > 0) {
        const { publishSignedSponsorshipToFans } = await import(
          "./club-match-day.service"
        );
        await publishSignedSponsorshipToFans({
          clubId: offer.clubId,
          clubName: offer.clubName,
          brandName: signature.brandName,
          projects: offer.projects,
          minAmount: offer.sponsorshipAmountGbp,
          gbpPerGoal: offer.gbpPerGoal,
          maxAmount: offer.maxAmount,
          gbpPerVote: offer.gbpPerVote,
        });
      }
      notifySignedSponsorship({
        clubId: offer.clubId,
        clubName: offer.clubName,
        brandName: signature.brandName,
        projectIds: offer.projectIds ?? [],
      });
    }
  } catch {
    // Signature is stored even if the live fan/club publish cannot complete.
  }

  return signature;
}

export async function signedBrandForClub(
  clubName: string
): Promise<string | null> {
  return signedOrPostedBrandForClub(clubName);
}

export async function signedOrPostedBrandForClub(
  clubName: string
): Promise<string | null> {
  const [offers, signatures] = await Promise.all([
    listSponsorMatchOffers(),
    listOfferSignatures(),
  ]);
  return brandFromPostedOffers(clubName, offers, signatures);
}

export async function sendSponsorProposalToClub({
  clubId,
  clubName,
  sponsorName,
  sponsorEmail,
  projects,
}: {
  clubId: string;
  clubName: string;
  sponsorName: string;
  sponsorEmail?: string | null;
  projects: ClimateProject[];
}): Promise<SponsorProjectProposal> {
  let sponsorId: string | null = null;
  try {
    const sponsor = await getCurrentSponsor();
    sponsorId = String(sponsor.id);
  } catch {
    sponsorId = null;
  }

  const proposal: SponsorProjectProposal = {
    id: crypto.randomUUID(),
    clubId,
    clubName,
    sponsorId,
    sponsorName,
    sponsorEmail: sponsorEmail ?? null,
    projectIds: projects.map((project) => project.id),
    projects: projects.map(snapshotProject),
    createdAt: new Date().toISOString(),
    status: "sent",
  };

  const local = readJson<SponsorProjectProposal[]>(PROPOSAL_STORAGE, []);
  writeJson(PROPOSAL_STORAGE, [proposal, ...local.filter((row) => row.id !== proposal.id)].slice(0, 50));

  const remoteClubId = isUuid(proposal.clubId) ? proposal.clubId : null;
  await supabase.from("sponsor_project_proposals").insert({
    id: proposal.id,
    club_id: remoteClubId,
    club_name: proposal.clubName,
    sponsor_id: proposal.sponsorId,
    sponsor_name: proposal.sponsorName,
    sponsor_email: proposal.sponsorEmail,
    project_ids: proposal.projectIds,
    projects: proposal.projects,
    created_at: proposal.createdAt,
    status: proposal.status,
  });

  return proposal;
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

export async function markSponsorProposalPosted(proposalId: string) {
  const local = readJson<SponsorProjectProposal[]>(PROPOSAL_STORAGE, []);
  writeJson(
    PROPOSAL_STORAGE,
    local.map((row) =>
      row.id === proposalId ? { ...row, status: "posted" } : row
    )
  );
  await supabase
    .from("sponsor_project_proposals")
    .update({ status: "posted" })
    .eq("id", proposalId);
}

function mapProposalRow(
  row: Record<string, unknown>,
  fallbackClubId = "",
  fallbackClubName = ""
): SponsorProjectProposal {
  return {
    id: String(row.id),
    clubId: String(row.club_id ?? fallbackClubId),
    clubName: String(row.club_name ?? fallbackClubName),
    sponsorId: (row.sponsor_id as string | null) ?? null,
    sponsorName: String(row.sponsor_name ?? "Sponsor"),
    sponsorEmail: (row.sponsor_email as string | null) ?? null,
    projectIds: (row.project_ids as string[]) ?? [],
    projects: (row.projects as SponsorOfferProject[]) ?? [],
    createdAt: String(row.created_at ?? ""),
    status: String(row.status ?? "sent"),
  };
}

export async function resolveClubForSponsor(clubName: string): Promise<{
  id: string | null;
  name: string;
  email: string | null;
}> {
  const { data } = await supabase.from("clubs").select("id, name");
  const matched = bestClubMatch(
    (data ?? []).map((row) => ({
      id: String(row.id),
      name: String(row.name ?? ""),
    })),
    clubName
  );
  if (!matched) {
    return { id: null, name: clubName, email: null };
  }
  const { data: account } = await supabase
    .from("club_accounts")
    .select("email")
    .eq("club_id", matched.id)
    .limit(1)
    .maybeSingle();
  return {
    id: matched.id,
    name: matched.name || clubName,
    email: (account?.email as string | null) ?? null,
  };
}

export async function listAllSponsorProposals(): Promise<SponsorProjectProposal[]> {
  const local = readJson<SponsorProjectProposal[]>(PROPOSAL_STORAGE, []);
  const { data } = await supabase
    .from("sponsor_project_proposals")
    .select("*")
    .order("created_at", { ascending: false });
  const remote = (data ?? []).map((row) =>
    mapProposalRow(row as Record<string, unknown>)
  );
  return mergeById(local, remote).sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt)
  );
}

export async function listSponsorSentProposals(
  sponsorId?: string | null,
  sponsorName?: string | null
): Promise<SponsorProjectProposal[]> {
  const all = await listAllSponsorProposals();
  return all.filter((row) => {
    if (sponsorId && row.sponsorId && row.sponsorId === sponsorId) return true;
    if (
      sponsorName &&
      row.sponsorName.trim().toLowerCase() === sponsorName.trim().toLowerCase()
    ) {
      return true;
    }
    if (!row.sponsorId) return true;
    return false;
  });
}

export async function listClubSponsorProposals(
  clubId: string,
  clubName: string
): Promise<SponsorProjectProposal[]> {
  if (clubShouldStartBlank(clubId, clubName)) return [];
  const all = await listAllSponsorProposals();
  return all.filter((row) => proposalMatchesClub(row, clubId, clubName));
}

export function proposalMailtoToDirector(
  clubEmail: string | null,
  proposal: SponsorProjectProposal
): string {
  const subject = encodeURIComponent(
    `S4P Climate Projects from ${proposal.sponsorName} for ${proposal.clubName}`
  );
  const body = encodeURIComponent(
    `Dear Sustainability Director,\n\nPlease find our 5 Climate Projects for ${proposal.clubName} fans to vote on:\n\n${proposal.projects.map((project) => `• ${project.name}`).join("\n")}\n\nPlease push this list to your Fans/Supporters on S4P.\n\nKind regards,\nSponsorship Manager\n${proposal.sponsorName}`
  );
  return `mailto:${clubEmail ?? ""}?subject=${subject}&body=${body}`;
}

export async function countFansWhoVotedOnProjects(
  projectIds: string[]
): Promise<number> {
  const ids = [...new Set(projectIds.filter(Boolean))];
  if (ids.length === 0) return 0;
  const { data } = await supabase
    .from("supporter_votes")
    .select("supporter_id")
    .in("climate_project_id", ids);
  return new Set((data ?? []).map((row) => String(row.supporter_id))).size;
}

export async function loadSponsorFolder(options?: {
  sponsorId?: string | null;
  brandName?: string | null;
  brandEmail?: string | null;
}): Promise<{
  offers: SponsorMatchOffer[];
  signatures: SponsorOfferSignature[];
  pending: SponsorMatchOffer[];
  signed: SignedSponsorship[];
  stats: SponsorDashboardStats;
}> {
  const brandName = options?.brandName ?? "";
  if (brandName) {
    await ensureOfferFromLockedClubUploads({
      brandName,
      brandEmail: options?.brandEmail,
    });
  }
  const [allOffers, signatures] = await Promise.all([
    listSponsorMatchOffers(),
    listOfferSignatures(),
  ]);
  const lock = brandName ? loadMatchDayLock(brandName) : null;
  const network = brandName
    ? loadGoalNetwork(brandName, options?.brandEmail)
    : null;
  const inbox = brandName
    ? offersForLockedSponsor(allOffers, {
        brandName,
        network,
        lock,
      })
    : allOffers;
  const signed = pairSignedSponsorships(allOffers, signatures, {
    sponsorId: options?.sponsorId,
    brandName,
  });
  const pending = unsignedMatchOffers(inbox, signatures);
  const fanVotes = await countFansWhoVotedOnProjects(
    signed.flatMap((row) => row.offer.projectIds)
  );
  return {
    offers: inbox,
    signatures,
    pending,
    signed,
    stats: sponsorshipFolderStats(signed, fanVotes),
  };
}

export async function listClubSignedSponsorships(
  clubId: string,
  clubName: string
): Promise<SignedSponsorship[]> {
  if (clubShouldStartBlank(clubId, clubName)) return [];
  const [offers, signatures] = await Promise.all([
    listSponsorMatchOffers(),
    listOfferSignatures(),
  ]);
  return pairSignedSponsorships(offers, signatures, { clubId, clubName });
}

export type { SignedSponsorship, SponsorDashboardStats };
