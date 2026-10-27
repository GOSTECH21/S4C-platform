/** Platform Sponsors directory: Global Brands and Local Business listings, Match Day invites, 8-hour lock-in. */

import { brandsMatch, brandKey } from "./climate-sponsors";
import {
  MATCH_DAY_APPROVED_LABEL,
  MATCH_DAY_PENDING_APPROVAL_LABEL,
  MATCH_DAY_PROJECT_COUNT,
} from "./partner-projects";

export const GLOBAL_BRAND_INVITE_COUNT = 5;
export const LOCAL_BUSINESS_INVITE_COUNT = 10;
export const GLOBAL_SPONSORS_ACCEPTED_PER_MATCH = 1;
export const GLOBAL_INVITE_WINDOW_HOURS = 8;
export const GLOBAL_INVITE_WINDOW_MS = GLOBAL_INVITE_WINDOW_HOURS * 60 * 60 * 1000;

export const SPONSOR_DIRECTORY_STORAGE = "s4p.sponsor.listings";
export const SPONSOR_INVITE_ROUNDS_STORAGE = "s4p.sponsor.invite-rounds";

export type SponsorListingKind = "global" | "local";

export type MoneyRange = {
  id: string;
  label: string;
  minGbp: number;
  maxGbp: number | null;
};

export const GLOBAL_COMMITMENT_FEE_RANGES: MoneyRange[] = [
  { id: "fee-1-2.5", label: "£1,000 – £2,500", minGbp: 1000, maxGbp: 2500 },
  { id: "fee-2.5-5", label: "£2,500 – £5,000", minGbp: 2500, maxGbp: 5000 },
  { id: "fee-5-10", label: "£5,000 – £10,000", minGbp: 5000, maxGbp: 10000 },
  { id: "fee-10-25", label: "£10,000 – £25,000", minGbp: 10000, maxGbp: 25000 },
  { id: "fee-25-plus", label: "£25,000+", minGbp: 25000, maxGbp: null },
];

/** Lead Climate Sponsors list one Match-Sponsorship range, not fee + £/Goal. */
export const GLOBAL_MATCH_SPONSORSHIP_RANGES = GLOBAL_COMMITMENT_FEE_RANGES;
export const GLOBAL_SPONSORSHIP_GOAL_RANGES: MoneyRange[] = [];

export const LOCAL_SPONSORSHIP_AMOUNT_RANGES: MoneyRange[] = [
  { id: "local-500-1k", label: "£500 – £1,000", minGbp: 500, maxGbp: 1000 },
  { id: "local-1k-2.5k", label: "£1,000 – £2,500", minGbp: 1000, maxGbp: 2500 },
  { id: "local-2.5k-5k", label: "£2,500 – £5,000", minGbp: 2500, maxGbp: 5000 },
  { id: "local-5k-plus", label: "£5,000+", minGbp: 5000, maxGbp: null },
];

export type SponsorListing = {
  id: string;
  kind: SponsorListingKind;
  brandName: string;
  contactName: string;
  email: string;
  logoUrl?: string | null;
  commitmentFeeRangeId?: string;
  sponsorshipGoalRangeId?: string;
  amountRangeId?: string;
  createdAt: string;
  source?: "seeded" | "registered";
};

export type GlobalInviteFunding = {
  matchSponsorshipGbp?: number;
  commitmentFeeGbp: number;
  gbpPerGoal: number;
  maximumSponsorshipGbp: number;
};

export type SponsorInviteCommitment = GlobalInviteFunding & {
  listingId: string;
  brandName: string;
  amountGbp: number;
  receivedAt: string;
};

export const MATCH_SPONSORSHIP_LABEL = "Match-Sponsorship";
export const MATCH_SPONSORSHIP_RANGE_LABEL = "Match-Sponsorship Range";
export const MATCH_SPONSORSHIP_HINT =
  "One amount for this Match Day. The highest Match-Sponsorship within 8 hours is accepted.";
export const MATCH_SPONSORSHIP_COMMIT_LABEL = "Commit Match-Sponsorship";
export const INVITE_COMMITMENT_FEE_LABEL = MATCH_SPONSORSHIP_LABEL;
export const INVITE_GBP_PER_GOAL_LABEL = MATCH_SPONSORSHIP_LABEL;
export const INVITE_MAXIMUM_LABEL = MATCH_SPONSORSHIP_LABEL;
export const INVITE_COMMITMENT_FEE_HINT = MATCH_SPONSORSHIP_HINT;
export const INVITE_GBP_PER_GOAL_HINT = MATCH_SPONSORSHIP_HINT;
export const INVITE_MAXIMUM_HINT = MATCH_SPONSORSHIP_HINT;
export const INVITE_LOCKED_NEXT_COPY =
  "Proceed to Approval and Payment section";
export const INVITE_PROCEED_APPROVAL_LABEL = "Proceed to Approval & Payment";
export const LOCAL_INVITE_AMOUNT_LABEL = "Sponsorship amount for this Match Day (£)";
export const LOCAL_INVITE_SIGN_LABEL = "Sign and proceed to Payment";
export const LOCAL_INVITE_NEXT_COPY =
  "Enter how much you are putting up for this Match Day, tick the Terms & Conditions, sign the sponsorship, then proceed to Payment.";

export function matchSponsorshipGbpFrom(
  value:
    | number
    | Partial<GlobalInviteFunding>
    | Partial<SponsorInviteCommitment>
    | null
    | undefined
): number {
  if (typeof value === "number") {
    return Math.max(0, Math.round(Number(value) || 0));
  }
  return Math.max(
    0,
    Math.round(
      Number(value?.matchSponsorshipGbp) ||
        Number(value?.amountGbp) ||
        Number(value?.commitmentFeeGbp) ||
        Number(value?.maximumSponsorshipGbp) ||
        0
    )
  );
}

export function normalizeInviteFunding(
  value: number | GlobalInviteFunding
): GlobalInviteFunding {
  const amount = matchSponsorshipGbpFrom(value);
  return {
    matchSponsorshipGbp: amount,
    commitmentFeeGbp: amount,
    gbpPerGoal: 0,
    maximumSponsorshipGbp: amount,
  };
}

export function rankingAmountGbp(
  row: Pick<
    SponsorInviteCommitment,
    "amountGbp" | "maximumSponsorshipGbp" | "commitmentFeeGbp" | "matchSponsorshipGbp"
  >
): number {
  return matchSponsorshipGbpFrom(row);
}

export function formatInviteGbp(value: unknown): string {
  return `£${Math.max(0, Math.round(Number(value) || 0)).toLocaleString("en-GB")}`;
}

export function hydrateInviteCommitment(
  row: Partial<SponsorInviteCommitment> | null | undefined
): SponsorInviteCommitment | null {
  if (!row) return null;
  const amount = Math.max(
    0,
    Math.round(Number(row.amountGbp) || Number(row.maximumSponsorshipGbp) || Number(row.commitmentFeeGbp) || 0)
  );
  const funding = normalizeInviteFunding({
    commitmentFeeGbp: Number(row.commitmentFeeGbp) || amount,
    gbpPerGoal: Number(row.gbpPerGoal) || 0,
    maximumSponsorshipGbp: Number(row.maximumSponsorshipGbp) || amount,
  });
  return {
    listingId: String(row.listingId ?? ""),
    brandName: String(row.brandName ?? ""),
    receivedAt: String(row.receivedAt ?? ""),
    amountGbp: rankingAmountGbp({ ...funding, amountGbp: amount }),
    ...funding,
  };
}

export function lockedInviteSummary(
  row?: Partial<SponsorInviteCommitment> | null,
  fallbackAmount?: number | null
): string {
  const hydrated = hydrateInviteCommitment(
    row ??
      (fallbackAmount
        ? {
            listingId: "locked",
            brandName: "",
            amountGbp: fallbackAmount,
            receivedAt: "",
          }
        : null)
  );
  const amount = hydrated
    ? rankingAmountGbp(hydrated)
    : Math.max(0, Math.round(Number(fallbackAmount) || 0));
  if (amount <= 0) return "";
  return ` — ${MATCH_SPONSORSHIP_LABEL} ${formatInviteGbp(amount)}`;
}

export function hydrateInviteRound(round: SponsorInviteRound): SponsorInviteRound {
  return {
    ...round,
    commitments: (round.commitments ?? [])
      .map((row) => hydrateInviteCommitment(row))
      .filter((row): row is SponsorInviteCommitment => Boolean(row?.listingId)),
  };
}

export function sponsorInvitationsNavLabel(count: number): string {
  const n = Math.max(0, Math.round(Number(count) || 0));
  return n > 0 ? `Invitations (${n})` : "Invitations";
}

export function invitationCountForBrand(
  rounds: SponsorInviteRound[],
  brandName: string,
  listings: SponsorListing[],
  now: Date | string = new Date()
): number {
  const pending = pendingInvitesForBrand(rounds, brandName, listings, now);
  return new Set(pending.map((row) => row.clubId)).size;
}

export type SponsorInviteRound = {
  id: string;
  clubId: string;
  clubName: string;
  directorName: string;
  matchLabel: string;
  projectIds: string[];
  projectNames: string[];
  sentAt: string;
  expiresAt: string;
  globalInviteeIds: string[];
  localInviteeIds: string[];
  localInvitedAt?: string | null;
  commitments: SponsorInviteCommitment[];
  lockedListingId?: string | null;
  lockedBrandName?: string | null;
  lockedAmountGbp?: number | null;
  lockedAt?: string | null;
  approvedProjectIds?: string[];
};

export const SPONSORS_SECTION_TITLE = "Sponsors";
export const GLOBAL_BRANDS_TAB_LABEL = "Global Brands";
export const LOCAL_BUSINESS_TAB_LABEL = "Local Business Sponsors";

export const GLOBAL_INVITE_SUBJECT = "Invitation to Sponsor";
export const LOCAL_INVITE_SUBJECT = "Invitation to Sponsor";

export function sponsorsSectionIntroCopy(): string {
  return `Registered Global Brands and Local Business Sponsors are listed only here. Tick ${GLOBAL_BRAND_INVITE_COUNT} Global Brands and send an ${GLOBAL_INVITE_SUBJECT} — only ${GLOBAL_SPONSORS_ACCEPTED_PER_MATCH} Sponsor is accepted, based on (i) sponsorships received within ${GLOBAL_INVITE_WINDOW_HOURS} hours and (ii) the highest committed amount. Once that Global Brand is locked in, Climate Projects tagged ${MATCH_DAY_PENDING_APPROVAL_LABEL} change to ${MATCH_DAY_APPROVED_LABEL} and appear to your fans. Also tick ${LOCAL_BUSINESS_INVITE_COUNT} Local Business Climate Sponsors for a simple ${LOCAL_INVITE_SUBJECT}.`;
}

export function globalInviteMustChooseProjectsCopy(): string {
  return `Choose your ${MATCH_DAY_PROJECT_COUNT} Climate Projects for this Match Day before you open Sponsors listings and send invitations.`;
}

export function globalInviteCountCopy(): string {
  return `Tick exactly ${GLOBAL_BRAND_INVITE_COUNT} Global Brands, then send ${GLOBAL_INVITE_SUBJECT}. Only ${GLOBAL_SPONSORS_ACCEPTED_PER_MATCH} Sponsor will be accepted.`;
}

export function localInviteCountCopy(): string {
  return `Tick exactly ${LOCAL_BUSINESS_INVITE_COUNT} Local Business Climate Sponsors, then send a simple ${LOCAL_INVITE_SUBJECT}.`;
}

export const LOCAL_INVITE_RECEIVED_STATUS =
  "Delivered to their Invitations inbox";

export function localInvitesSentCopy(count: number): string {
  const n = Math.max(0, Math.round(Number(count) || 0));
  return `${LOCAL_INVITE_SUBJECT} sent to ${n} Local Business Climate Sponsors.`;
}

export function localInvitesDeliveredCopy(count: number): string {
  const n = Math.max(0, Math.round(Number(count) || 0));
  return `All ${n} invitations were delivered. Each Local Business now has this Match Day invite in their Invitations inbox when they log in.`;
}

export type InviteReceiptRow = {
  listingId: string;
  brandName: string;
  email: string;
  status: string;
};

export function inviteReceiptsForKind(
  round: SponsorInviteRound | null | undefined,
  listings: SponsorListing[],
  kind: SponsorListingKind
): InviteReceiptRow[] {
  if (!round) return [];
  const ids = kind === "global" ? round.globalInviteeIds : round.localInviteeIds;
  return listings
    .filter((row) => ids.includes(row.id))
    .map((row) => ({
      listingId: row.id,
      brandName: row.brandName,
      email: row.email,
      status: LOCAL_INVITE_RECEIVED_STATUS,
    }));
}

export function rangeById(
  ranges: MoneyRange[],
  id: string | null | undefined
): MoneyRange | null {
  const key = String(id ?? "").trim();
  if (!key) return null;
  return ranges.find((row) => row.id === key) ?? null;
}

export function formatRangeLabel(
  ranges: MoneyRange[],
  id: string | null | undefined
): string {
  return rangeById(ranges, id)?.label ?? "Range not set";
}

export function listingIdFor(kind: SponsorListingKind, brandName: string, email: string): string {
  const brand = brandKey(brandName) || "sponsor";
  const mail = email.trim().toLowerCase() || "no-email";
  return `${kind}:${brand}:${mail}`;
}

export function listingsOfKind(
  listings: SponsorListing[],
  kind: SponsorListingKind
): SponsorListing[] {
  return listings
    .filter((row) => row.kind === kind && row.brandName.trim())
    .sort((left, right) => left.brandName.localeCompare(right.brandName));
}

export function upsertSponsorListing(
  listings: SponsorListing[],
  incoming: SponsorListing
): SponsorListing[] {
  const id = incoming.id || listingIdFor(incoming.kind, incoming.brandName, incoming.email);
  const next: SponsorListing = { ...incoming, id };
  const index = listings.findIndex(
    (row) =>
      row.id === id ||
      (row.kind === next.kind &&
        brandsMatch(row.brandName, next.brandName) &&
        row.email.trim().toLowerCase() === next.email.trim().toLowerCase())
  );
  if (index < 0) return [...listings, next];
  const copy = [...listings];
  copy[index] = { ...copy[index], ...next, id: copy[index].id };
  return copy;
}

export function seededSponsorListings(now = "2026-08-01T09:00:00.000Z"): SponsorListing[] {
  const globals: Array<Omit<SponsorListing, "id" | "kind" | "createdAt" | "source">> = [
    {
      brandName: "Diageo",
      contactName: "Sponsorship Manager",
      email: "sponsors@diageo.test",
      commitmentFeeRangeId: "fee-10-25",
      sponsorshipGoalRangeId: "goal-5-10",
    },
    {
      brandName: "Gillette",
      contactName: "Sponsorship Manager",
      email: "sponsors@gillette.test",
      commitmentFeeRangeId: "fee-5-10",
      sponsorshipGoalRangeId: "goal-3-5",
    },
    {
      brandName: "Budweiser",
      contactName: "Sponsorship Manager",
      email: "sponsors@budweiser.test",
      commitmentFeeRangeId: "fee-5-10",
      sponsorshipGoalRangeId: "goal-3-5",
    },
    {
      brandName: "Puma",
      contactName: "Sponsorship Manager",
      email: "sponsors@puma.test",
      commitmentFeeRangeId: "fee-2.5-5",
      sponsorshipGoalRangeId: "goal-1-3",
    },
    {
      brandName: "American Express",
      contactName: "Sponsorship Manager",
      email: "sponsors@amex.test",
      commitmentFeeRangeId: "fee-10-25",
      sponsorshipGoalRangeId: "goal-5-10",
    },
    {
      brandName: "Heineken",
      contactName: "Sponsorship Manager",
      email: "sponsors@heineken.test",
      commitmentFeeRangeId: "fee-5-10",
      sponsorshipGoalRangeId: "goal-3-5",
    },
  ];
  const locals: Array<Omit<SponsorListing, "id" | "kind" | "createdAt" | "source">> = [
    {
      brandName: "Tax Assist",
      contactName: "Owner",
      email: "hello@taxassist.test",
      amountRangeId: "local-1k-2.5k",
    },
    {
      brandName: "Top Cellar",
      contactName: "Owner",
      email: "hello@topcellar.test",
      amountRangeId: "local-500-1k",
    },
    {
      brandName: "Kokobean Cafe",
      contactName: "Owner",
      email: "hello@kokobean.test",
      amountRangeId: "local-500-1k",
    },
    {
      brandName: "Mash Tun",
      contactName: "Owner",
      email: "hello@mashtun.test",
      amountRangeId: "local-1k-2.5k",
    },
    {
      brandName: "Interval",
      contactName: "Owner",
      email: "hello@interval.test",
      amountRangeId: "local-1k-2.5k",
    },
    {
      brandName: "The Fountain",
      contactName: "Owner",
      email: "hello@fountain.test",
      amountRangeId: "local-2.5k-5k",
    },
    {
      brandName: "Piazza Italiana",
      contactName: "Owner",
      email: "hello@piazza.test",
      amountRangeId: "local-1k-2.5k",
    },
    {
      brandName: "Stadium Cafe",
      contactName: "Owner",
      email: "hello@stadiumcafe.test",
      amountRangeId: "local-500-1k",
    },
    {
      brandName: "High Street Bakery",
      contactName: "Owner",
      email: "hello@highstreetbakery.test",
      amountRangeId: "local-500-1k",
    },
    {
      brandName: "Matchday Motors",
      contactName: "Owner",
      email: "hello@matchdaymotors.test",
      amountRangeId: "local-2.5k-5k",
    },
    {
      brandName: "Kick-Off Gym",
      contactName: "Owner",
      email: "hello@kickoffgym.test",
      amountRangeId: "local-1k-2.5k",
    },
  ];
  return [
    ...globals.map((row) => ({
      ...row,
      kind: "global" as const,
      createdAt: now,
      source: "seeded" as const,
      id: listingIdFor("global", row.brandName, row.email),
    })),
    ...locals.map((row) => ({
      ...row,
      kind: "local" as const,
      createdAt: now,
      source: "seeded" as const,
      id: listingIdFor("local", row.brandName, row.email),
    })),
  ];
}

export function mergeSeededSponsorListings(
  listings: SponsorListing[],
  seeds = seededSponsorListings()
): SponsorListing[] {
  let next = [...listings];
  for (const seed of seeds) {
    const exists = next.some(
      (row) =>
        row.kind === seed.kind && brandsMatch(row.brandName, seed.brandName)
    );
    if (!exists) next = upsertSponsorListing(next, seed);
  }
  return next;
}

export function requireExactInviteCount(
  selectedIds: string[],
  expected: number,
  kind: SponsorListingKind
): string | null {
  if (selectedIds.length === expected) return null;
  if (kind === "global") {
    return `Tick exactly ${GLOBAL_BRAND_INVITE_COUNT} Global Brands Sponsors. You have ${selectedIds.length} selected.`;
  }
  return `Tick exactly ${LOCAL_BUSINESS_INVITE_COUNT} Local Business Climate Sponsors. You have ${selectedIds.length} selected.`;
}

export function inviteWindowOpen(
  round: Pick<SponsorInviteRound, "sentAt" | "expiresAt">,
  now: Date | string
): boolean {
  const at = toTime(now);
  return at >= toTime(round.sentAt) && at <= toTime(round.expiresAt);
}

export function inviteDeadlineLabel(expiresAt: string): string {
  const date = new Date(expiresAt);
  if (Number.isNaN(date.getTime())) return expiresAt;
  return date.toLocaleString("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function highestCommitment(
  commitments: SponsorInviteCommitment[]
): SponsorInviteCommitment | null {
  if (commitments.length === 0) return null;
  return [...commitments].sort((left, right) => {
    const rightMax = rankingAmountGbp(right);
    const leftMax = rankingAmountGbp(left);
    if (rightMax !== leftMax) return rightMax - leftMax;
    const rightGoal = Number(right.gbpPerGoal) || 0;
    const leftGoal = Number(left.gbpPerGoal) || 0;
    if (rightGoal !== leftGoal) return rightGoal - leftGoal;
    const rightFee = Number(right.commitmentFeeGbp) || 0;
    const leftFee = Number(left.commitmentFeeGbp) || 0;
    if (rightFee !== leftFee) return rightFee - leftFee;
    return toTime(left.receivedAt) - toTime(right.receivedAt);
  })[0];
}

export function commitmentsInsideWindow(
  round: SponsorInviteRound
): SponsorInviteCommitment[] {
  const end = toTime(round.expiresAt);
  return round.commitments.filter((row) => toTime(row.receivedAt) <= end);
}

export function createInviteRound({
  clubId,
  clubName,
  directorName,
  matchLabel,
  projectIds,
  projectNames,
  globalInviteeIds,
  localInviteeIds,
  sentAt,
}: {
  clubId: string;
  clubName: string;
  directorName: string;
  matchLabel: string;
  projectIds: string[];
  projectNames: string[];
  globalInviteeIds?: string[];
  localInviteeIds?: string[];
  sentAt: Date | string;
}): SponsorInviteRound {
  const sent = toDate(sentAt);
  const expires = new Date(sent.getTime() + GLOBAL_INVITE_WINDOW_MS);
  return {
    id: `invite:${clubId}:${sent.toISOString()}`,
    clubId,
    clubName,
    directorName: directorName.trim() || "Sustainability Director",
    matchLabel: matchLabel.trim() || `${clubName} Match Day`,
    projectIds: [...new Set(projectIds.filter(Boolean))],
    projectNames: projectNames.filter(Boolean),
    sentAt: sent.toISOString(),
    expiresAt: expires.toISOString(),
    globalInviteeIds: [...new Set(globalInviteeIds ?? [])],
    localInviteeIds: [...new Set(localInviteeIds ?? [])],
    localInvitedAt:
      (localInviteeIds ?? []).length > 0 ? sent.toISOString() : null,
    commitments: [],
  };
}

export function mergeInviteRound(
  existing: SponsorInviteRound | null,
  patch: SponsorInviteRound
): SponsorInviteRound {
  if (!existing) return patch;
  return {
    ...existing,
    ...patch,
    globalInviteeIds: uniqueIds(
      existing.globalInviteeIds,
      patch.globalInviteeIds
    ),
    localInviteeIds: uniqueIds(existing.localInviteeIds, patch.localInviteeIds),
    commitments: existing.commitments,
    lockedListingId: existing.lockedListingId ?? patch.lockedListingId,
    lockedBrandName: existing.lockedBrandName ?? patch.lockedBrandName,
    lockedAmountGbp: existing.lockedAmountGbp ?? patch.lockedAmountGbp,
    lockedAt: existing.lockedAt ?? patch.lockedAt,
    approvedProjectIds: existing.approvedProjectIds ?? patch.approvedProjectIds,
    localInvitedAt: patch.localInvitedAt || existing.localInvitedAt || null,
  };
}

export function currentRoundForClub(
  rounds: SponsorInviteRound[],
  clubId: string
): SponsorInviteRound | null {
  const matches = rounds.filter((row) => row.clubId === clubId);
  if (matches.length === 0) return null;
  return [...matches].sort((left, right) => toTime(right.sentAt) - toTime(left.sentAt))[0];
}

export function upsertInviteRound(
  rounds: SponsorInviteRound[],
  round: SponsorInviteRound
): SponsorInviteRound[] {
  const index = rounds.findIndex((row) => row.id === round.id);
  if (index < 0) return [...rounds, round];
  const copy = [...rounds];
  copy[index] = round;
  return copy;
}

export type CommitGlobalResult = {
  round: SponsorInviteRound;
  locked: boolean;
  winnerChanged: boolean;
  error?: string;
};

export function commitGlobalSponsorship(
  round: SponsorInviteRound,
  listing: Pick<SponsorListing, "id" | "brandName" | "kind">,
  funding: number | GlobalInviteFunding,
  now: Date | string
): CommitGlobalResult {
  if (listing.kind !== "global") {
    return { round, locked: Boolean(round.lockedListingId), winnerChanged: false, error: "Only Global Brands can lock this Match Day." };
  }
  if (!round.globalInviteeIds.includes(listing.id)) {
    return {
      round,
      locked: Boolean(round.lockedListingId),
      winnerChanged: false,
      error: `${listing.brandName} was not invited for this Match Day.`,
    };
  }
  const at = toDate(now);
  if (at.getTime() > toTime(round.expiresAt)) {
    return {
      round: freezeHighest(round),
      locked: Boolean(round.lockedListingId),
      winnerChanged: false,
      error: `The ${GLOBAL_INVITE_WINDOW_HOURS}-hour invitation window has closed.`,
    };
  }
  const amounts = normalizeInviteFunding(funding);
  const amount = rankingAmountGbp(amounts);
  if (amount <= 0) {
    return {
      round,
      locked: Boolean(round.lockedListingId),
      winnerChanged: false,
      error: `Enter how much you wish to sponsor this Match for (${MATCH_SPONSORSHIP_LABEL}).`,
    };
  }
  const commitment: SponsorInviteCommitment = {
    listingId: listing.id,
    brandName: listing.brandName,
    amountGbp: amount,
    matchSponsorshipGbp: amounts.matchSponsorshipGbp,
    commitmentFeeGbp: amounts.commitmentFeeGbp,
    gbpPerGoal: amounts.gbpPerGoal,
    maximumSponsorshipGbp: amounts.maximumSponsorshipGbp || amount,
    receivedAt: at.toISOString(),
  };
  const commitments = [
    ...round.commitments.filter((row) => row.listingId !== listing.id),
    commitment,
  ];
  const next = lockHighestInWindow({ ...round, commitments }, at);
  return {
    round: next,
    locked: Boolean(next.lockedListingId),
    winnerChanged: next.lockedListingId !== round.lockedListingId ||
      next.lockedAmountGbp !== round.lockedAmountGbp,
  };
}

export function resolveInviteRound(
  round: SponsorInviteRound,
  now: Date | string
): SponsorInviteRound {
  const at = toDate(now);
  if (at.getTime() <= toTime(round.expiresAt)) {
    return lockHighestInWindow(round, at);
  }
  return freezeHighest(round);
}

export function inviteRoundApprovesProjects(
  round: SponsorInviteRound | null | undefined
): boolean {
  return Boolean(round?.lockedListingId && (round.approvedProjectIds?.length || round.projectIds.length));
}

export function approvedProjectIdsFromInvite(
  round: SponsorInviteRound | null | undefined
): string[] {
  if (!inviteRoundApprovesProjects(round) || !round) return [];
  const ids = round.approvedProjectIds?.length ? round.approvedProjectIds : round.projectIds;
  return [...new Set(ids.filter(Boolean))];
}

export function pendingInvitesForBrand(
  rounds: SponsorInviteRound[],
  brandName: string,
  listings: SponsorListing[],
  now: Date | string = new Date()
): SponsorInviteRound[] {
  const listing = listings.find((row) => brandsMatch(row.brandName, brandName));
  if (!listing) return [];
  return rounds.filter((round) => {
    const invited =
      round.globalInviteeIds.includes(listing.id) ||
      round.localInviteeIds.includes(listing.id);
    if (!invited) return false;
    if (listing.kind === "local") return true;
    return inviteWindowOpen(round, now) || Boolean(round.lockedListingId);
  });
}

export function globalInvitationEmailBody({
  clubName,
  directorName,
  brandName,
  matchLabel,
  expiresAt,
}: {
  clubName: string;
  directorName: string;
  brandName: string;
  matchLabel: string;
  expiresAt: string;
}): string {
  return [
    `Dear ${brandName} Sponsorship Manager,`,
    "",
    `${directorName}, Sustainability Director at ${clubName}, invites ${brandName} to sponsor ${matchLabel}.`,
    "",
    `This is an Invitation to Sponsor. Only ${GLOBAL_SPONSORS_ACCEPTED_PER_MATCH} Global Brand Sponsor will be accepted, based on:`,
    `(i) Sponsorships received within ${GLOBAL_INVITE_WINDOW_HOURS} hours of this invitation (deadline ${inviteDeadlineLabel(expiresAt)});`,
    `(ii) A Sponsor that has committed the highest amount of sponsorship.`,
    "",
    `Please log in to Score-For-Planet, see this Club's chosen Climate Projects, and enter your ${MATCH_SPONSORSHIP_LABEL} amount before the deadline.`,
    "",
    "Kind regards,",
    directorName,
    `Sustainability Director, ${clubName}`,
  ].join("\n");
}

export function localInvitationEmailBody({
  clubName,
  directorName,
  brandName,
  matchLabel,
}: {
  clubName: string;
  directorName: string;
  brandName: string;
  matchLabel: string;
}): string {
  return [
    `Dear ${brandName},`,
    "",
    `${directorName}, Sustainability Director at ${clubName}, invites ${brandName} to sponsor ${matchLabel} as a Local Business Climate Sponsor.`,
    "",
    "This is a simple Invitation to Sponsor. Please log in to Score-For-Planet to accept.",
    "",
    "Kind regards,",
    directorName,
    `Sustainability Director, ${clubName}`,
  ].join("\n");
}

export function invitationMailto(email: string, subject: string, body: string): string {
  return `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export type InvitationMailto = {
  brandName: string;
  href: string;
};

export function globalInviteMailtos(
  round: SponsorInviteRound,
  listings: SponsorListing[]
): InvitationMailto[] {
  return listings
    .filter((row) => round.globalInviteeIds.includes(row.id))
    .map((row) => ({
      brandName: row.brandName,
      href: invitationMailto(
        row.email,
        `${GLOBAL_INVITE_SUBJECT} — ${round.clubName}`,
        globalInvitationEmailBody({
          clubName: round.clubName,
          directorName: round.directorName,
          brandName: row.brandName,
          matchLabel: round.matchLabel,
          expiresAt: round.expiresAt,
        })
      ),
    }));
}

export function localInviteMailtos(
  round: SponsorInviteRound,
  listings: SponsorListing[]
): InvitationMailto[] {
  return listings
    .filter((row) => round.localInviteeIds.includes(row.id))
    .map((row) => ({
      brandName: row.brandName,
      href: invitationMailto(
        row.email,
        `${LOCAL_INVITE_SUBJECT} — ${round.clubName}`,
        localInvitationEmailBody({
          clubName: round.clubName,
          directorName: round.directorName,
          brandName: row.brandName,
          matchLabel: round.matchLabel,
        })
      ),
    }));
}

function lockHighestInWindow(
  round: SponsorInviteRound,
  now: Date
): SponsorInviteRound {
  const winner = highestCommitment(commitmentsInsideWindow(round));
  if (!winner) return round;
  const alreadySame =
    round.lockedListingId === winner.listingId &&
    round.lockedAmountGbp === winner.amountGbp;
  if (alreadySame) {
    return {
      ...round,
      approvedProjectIds: round.approvedProjectIds?.length
        ? round.approvedProjectIds
        : round.projectIds,
    };
  }
  return {
    ...round,
    lockedListingId: winner.listingId,
    lockedBrandName: winner.brandName,
    lockedAmountGbp: winner.amountGbp,
    lockedAt: now.toISOString(),
    approvedProjectIds: round.projectIds,
  };
}

function freezeHighest(round: SponsorInviteRound): SponsorInviteRound {
  if (round.lockedListingId) {
    return {
      ...round,
      approvedProjectIds: round.approvedProjectIds?.length
        ? round.approvedProjectIds
        : round.projectIds,
    };
  }
  const winner = highestCommitment(commitmentsInsideWindow(round));
  if (!winner) return round;
  return {
    ...round,
    lockedListingId: winner.listingId,
    lockedBrandName: winner.brandName,
    lockedAmountGbp: winner.amountGbp,
    lockedAt: round.expiresAt,
    approvedProjectIds: round.projectIds,
  };
}

function uniqueIds(...groups: string[][]): string[] {
  return [...new Set(groups.flat().filter(Boolean))];
}

function toDate(value: Date | string): Date {
  if (value instanceof Date) return value;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

function toTime(value: Date | string): number {
  return toDate(value).getTime();
}
