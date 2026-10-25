/** Lead Climate Sponsor dashboard: awaiting, approved, paid, and CIST only. */

import {
  clubsMatch,
  type FolderOffer,
  type FolderProject,
  type SignedSponsorship,
} from "./sponsor-dashboard";
import {
  displayLockFixture,
  isNamedFixture,
  type MatchDayClubLock,
} from "./climate-sponsors";
import { isWalletFundingLocked } from "./sponsor-completion-flow";
import { fixtureLabelFromOffer } from "./sponsor-signed-home";
import {
  SPONSOR_CALENDAR_PATH,
  sponsorOfferSignOffPath,
  sponsorWalletPath,
} from "./routes";
import { DEFAULT_WALLET_VOTE_GBP } from "./sponsor-wallet";

export const LEAD_AWAITING_SECTION_ID = "awaiting-acceptance";
export const LEAD_APPROVED_SECTION_ID = "approved-projects";
export const LEAD_PAID_SECTION_ID = "paid-projects";
export const LEAD_CIST_SECTION_ID = "cist";

export const LEAD_AWAITING_TITLE =
  "Projects that are awaiting for my acceptance & approval";
export const LEAD_APPROVED_TITLE = "Projects that I have approved";
export const LEAD_PAID_TITLE = "Projects that I have Paid for";
export const LEAD_CIST_TITLE = "Climate Impact Sponsors Table (CIST)";

export const LEAD_AWAITING_INTRO =
  "When a Club Sustainability Director compiles Climate Projects for a Match Day and uploads them, they appear here. Accept and approve the list to sponsor that Club's Match Day carbon footprint offset.";
export const LEAD_APPROVED_INTRO =
  "Climate Projects you have accepted and approved. Pay from your Climate Sponsorship Wallet to fund them.";
export const LEAD_PAID_INTRO =
  "Climate Projects you have paid for. Fans take this cash from your Climate Sponsorship Wallet and FUND-IT onto numbered Climate Projects — up to 5 times on a Match Day five.";
export const LEAD_AWAITING_EMPTY =
  "No Climate Projects are waiting. When a Club Sustainability Director uploads Match Day Climate Projects, they appear here for your acceptance and approval.";
export const LEAD_APPROVED_EMPTY =
  "You have not approved any Climate Projects yet. Accept and approve a Match Day list in the section above.";
export const LEAD_PAID_EMPTY =
  "You have not paid for any Climate Projects yet. After you approve a list, pay from your Climate Sponsorship Wallet and the funded Projects appear here.";

export const LEAD_ACCEPT_LABEL = "Accept & approve";
export const LEAD_PAY_LABEL = "Pay for these Climate Projects";

export type LeadSponsorProject = {
  id: string;
  name: string;
  description: string | null;
  country: string | null;
  estimated_co2: number | null;
  fundedGbp: number;
  fanFunded: boolean;
};

export type LeadSponsorMatchGroup = {
  key: string;
  clubId: string;
  clubName: string;
  matchTitle: string;
  matchDate: string | null;
  headline: string;
  offerId: string | null;
  signedAt: string | null;
  signerName: string | null;
  sponsorshipAmountGbp: number | null;
  gbpPerGoal: number | null;
  maxAmount: number | null;
  projects: LeadSponsorProject[];
  actionHref: string;
  actionLabel: string;
};

export type LeadSponsorHomeSections = {
  awaiting: LeadSponsorMatchGroup[];
  approved: LeadSponsorMatchGroup[];
  paid: LeadSponsorMatchGroup[];
};

export type ChosenProjectInput = {
  id: string;
  name: string;
  description?: string | null;
  country?: string | null;
  estimated_co2?: number | null;
  fundedGbp?: number | null;
};

type VotedProjectInput = { id: string; fundedGbp?: number | null };

function asProject(project: ChosenProjectInput): LeadSponsorProject {
  return {
    id: project.id,
    name: project.name,
    description: project.description ?? null,
    country: project.country ?? null,
    estimated_co2: project.estimated_co2 ?? null,
    fundedGbp: Number(project.fundedGbp) || 0,
    fanFunded: false,
  };
}

export function chosenProjectsForClub(
  chosenByClub: Record<string, ChosenProjectInput[]>,
  clubName: string,
  clubId?: string | null
): ChosenProjectInput[] {
  if (clubId && (chosenByClub[clubId] ?? []).length > 0) {
    return chosenByClub[clubId];
  }
  if ((chosenByClub[clubName] ?? []).length > 0) return chosenByClub[clubName];
  const match = Object.entries(chosenByClub).find(([key]) =>
    clubsMatch(key, clubName)
  );
  return match?.[1] ?? [];
}

export function clubsNeedingChosenProjects({
  pending,
  signed,
  lock,
}: {
  pending: Array<{ clubName?: string | null }>;
  signed: Array<{ offer: { clubName?: string | null } }>;
  lock?: { clubName?: string | null } | null;
}): string[] {
  const names = [
    ...pending.map((row) => String(row.clubName ?? "").trim()),
    ...signed.map((row) => String(row.offer.clubName ?? "").trim()),
    String(lock?.clubName ?? "").trim(),
  ].filter(Boolean);
  const unique: string[] = [];
  for (const name of names) {
    if (!unique.some((row) => clubsMatch(row, name))) unique.push(name);
  }
  return unique;
}

function mergeProjectLists(
  offerProjects: ChosenProjectInput[],
  uploaded: ChosenProjectInput[]
): ChosenProjectInput[] {
  if (uploaded.length === 0) return offerProjects;
  if (offerProjects.length === 0) return uploaded;
  const byId = new Map(offerProjects.map((project) => [project.id, project]));
  for (const project of uploaded) {
    if (!byId.has(project.id)) byId.set(project.id, project);
  }
  return [...byId.values()];
}

function withVoteFunding(
  project: LeadSponsorProject,
  voted: VotedProjectInput[]
): LeadSponsorProject {
  const hit = voted.find((row) => row.id === project.id);
  if (!hit) return project;
  const fromVotes = Number(hit.fundedGbp) || 0;
  const fundedGbp = Math.max(
    project.fundedGbp,
    fromVotes,
    DEFAULT_WALLET_VOTE_GBP
  );
  return { ...project, fundedGbp, fanFunded: true };
}

function isProjectPaid(project: LeadSponsorProject, clubPaid: boolean) {
  if (clubPaid) return true;
  return project.fanFunded || project.fundedGbp > 0;
}

function clubFundingLocked(
  lock: MatchDayClubLock | null | undefined,
  clubName: string
) {
  if (!lock?.clubName?.trim()) return false;
  if (!clubsMatch(lock.clubName, clubName)) return false;
  return isWalletFundingLocked(lock);
}

function signedProjectIds(signed: SignedSponsorship[]) {
  const ids = new Set<string>();
  for (const row of signed) {
    for (const project of row.offer.projects) ids.add(project.id);
    for (const id of row.offer.projectIds ?? []) ids.add(id);
  }
  return ids;
}

function matchTitleFor(
  offer: Pick<FolderOffer, "matchTitle" | "clubName">,
  lock?: MatchDayClubLock | null
) {
  const fromOffer = fixtureLabelFromOffer(offer.matchTitle, offer.clubName);
  if (fromOffer && isNamedFixture(fromOffer)) return fromOffer;
  if (lock && clubsMatch(lock.clubName, offer.clubName)) {
    const fixture = displayLockFixture(lock);
    if (isNamedFixture(fixture)) return fixture;
  }
  return fromOffer || `${offer.clubName} Match Day`;
}

function groupFromOffer({
  offer,
  projects,
  signedAt,
  signerName,
  actionHref,
  actionLabel,
  key,
}: {
  offer: Pick<
    FolderOffer,
    | "id"
    | "clubId"
    | "clubName"
    | "headline"
    | "matchTitle"
    | "matchDate"
    | "sponsorshipAmountGbp"
    | "gbpPerGoal"
    | "maxAmount"
  >;
  projects: LeadSponsorProject[];
  signedAt?: string | null;
  signerName?: string | null;
  actionHref: string;
  actionLabel: string;
  key: string;
}): LeadSponsorMatchGroup {
  return {
    key,
    clubId: offer.clubId,
    clubName: offer.clubName,
    matchTitle: offer.matchTitle,
    matchDate: offer.matchDate,
    headline: offer.headline,
    offerId: offer.id || null,
    signedAt: signedAt ?? null,
    signerName: signerName ?? null,
    sponsorshipAmountGbp: offer.sponsorshipAmountGbp ?? null,
    gbpPerGoal: offer.gbpPerGoal ?? null,
    maxAmount: offer.maxAmount ?? null,
    projects,
    actionHref,
    actionLabel,
  };
}

function awaitingActionHref(
  offerId: string | null,
  clubName: string,
  lock?: MatchDayClubLock | null
) {
  if (offerId) return sponsorOfferSignOffPath(offerId);
  if (lock && clubsMatch(lock.clubName, clubName)) {
    return sponsorWalletPath(clubName);
  }
  return SPONSOR_CALENDAR_PATH;
}

export function leadSponsorHomeSections({
  pending,
  signed,
  chosenByClub = {},
  votedByClub = {},
  lock,
}: {
  pending: FolderOffer[];
  signed: SignedSponsorship[];
  chosenByClub?: Record<string, ChosenProjectInput[]>;
  votedByClub?: Record<string, VotedProjectInput[]>;
  lock?: MatchDayClubLock | null;
}): LeadSponsorHomeSections {
  const takenIds = signedProjectIds(signed);
  const awaiting: LeadSponsorMatchGroup[] = [];
  const coveredClubs: string[] = [];

  for (const offer of pending) {
    const uploaded = chosenProjectsForClub(
      chosenByClub,
      offer.clubName,
      offer.clubId
    );
    const merged = mergeProjectLists(offer.projects, uploaded).filter(
      (project) => !takenIds.has(project.id)
    );
    if (merged.length === 0) continue;
    coveredClubs.push(offer.clubName);
    awaiting.push(
      groupFromOffer({
        offer: {
          ...offer,
          matchTitle: matchTitleFor(offer, lock),
        },
        projects: merged.map(asProject),
        actionHref: awaitingActionHref(offer.id, offer.clubName, lock),
        actionLabel: LEAD_ACCEPT_LABEL,
        key: `awaiting:${offer.id}`,
      })
    );
  }

  const extraClubs = clubsNeedingChosenProjects({ pending, signed, lock });
  for (const clubName of extraClubs) {
    if (coveredClubs.some((row) => clubsMatch(row, clubName))) continue;
    if (signed.some((row) => clubsMatch(row.offer.clubName, clubName))) continue;
    const uploaded = chosenProjectsForClub(chosenByClub, clubName).filter(
      (project) => !takenIds.has(project.id)
    );
    if (uploaded.length === 0) continue;
    const fixture =
      lock && clubsMatch(lock.clubName, clubName)
        ? displayLockFixture(lock)
        : `${clubName} Match Day`;
    awaiting.push(
      groupFromOffer({
        offer: {
          id: "",
          clubId: `name:${clubName}`,
          clubName,
          headline: `${clubName} · uploaded Climate Projects`,
          matchTitle: isNamedFixture(fixture) ? fixture : `${clubName} Match Day`,
          matchDate: lock?.fixtureDate ?? null,
          sponsorshipAmountGbp: lock?.commitmentFeeGbp ?? null,
          gbpPerGoal: lock?.gbpPerGoal ?? null,
          maxAmount: lock?.maximumSponsorshipGbp ?? null,
        },
        projects: uploaded.map(asProject),
        actionHref: awaitingActionHref(null, clubName, lock),
        actionLabel: LEAD_ACCEPT_LABEL,
        key: `awaiting:chosen:${clubName}`,
      })
    );
  }

  const approved: LeadSponsorMatchGroup[] = [];
  const paid: LeadSponsorMatchGroup[] = [];

  for (const row of signed) {
    const voted =
      votedByClub[row.offer.clubId] ??
      Object.entries(votedByClub).find(([key]) =>
        clubsMatch(key, row.offer.clubName)
      )?.[1] ??
      [];
    const clubPaid = clubFundingLocked(lock, row.offer.clubName);
    const projects = row.offer.projects.map((project) =>
      withVoteFunding(asProject(project as FolderProject), voted)
    );
    const paidProjects = projects.filter((project) =>
      isProjectPaid(project, clubPaid)
    );
    const approvedProjects = clubPaid
      ? []
      : projects.filter((project) => !isProjectPaid(project, false));
    const matchTitle = matchTitleFor(row.offer, lock);
    const headlineOffer = { ...row.offer, matchTitle };

    if (approvedProjects.length > 0) {
      approved.push(
        groupFromOffer({
          offer: headlineOffer,
          projects: approvedProjects,
          signedAt: row.signature.signedAt,
          signerName: row.signature.signerName,
          actionHref: sponsorWalletPath(row.offer.clubName),
          actionLabel: LEAD_PAY_LABEL,
          key: `approved:${row.signature.id}`,
        })
      );
    }
    if (paidProjects.length > 0) {
      paid.push(
        groupFromOffer({
          offer: headlineOffer,
          projects: paidProjects,
          signedAt: row.signature.signedAt,
          signerName: row.signature.signerName,
          actionHref: row.offer.id
            ? sponsorOfferSignOffPath(row.offer.id)
            : sponsorWalletPath(row.offer.clubName),
          actionLabel: "Open signed copy",
          key: `paid:${row.signature.id}`,
        })
      );
    }
  }

  return { awaiting, approved, paid };
}

export function leadSponsorSectionIds() {
  return [
    LEAD_AWAITING_SECTION_ID,
    LEAD_APPROVED_SECTION_ID,
    LEAD_PAID_SECTION_ID,
    LEAD_CIST_SECTION_ID,
  ];
}
