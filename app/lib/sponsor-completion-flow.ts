/** Seamless Lead Climate Sponsor lock → wallet → receive → sign-off. */

import {
  brandsMatch,
  type MatchDayClubLock,
} from "./climate-sponsors";
import { MATCH_DAY_PROJECT_COUNT } from "./partner-projects";

export const SPONSOR_RECEIVE_SECTION_ID = "receive-club-projects";
export const SPONSOR_SIGNED_SECTION_ID = "signed-folder";
export const SPONSOR_OFFER_SIGN_SECTION_ID = "signed-sponsorship";
export const SIGNED_SPONSORSHIP_EVENT = "s4p-signed-sponsorship";

export type SignedSponsorshipLiveDetail = {
  clubId: string;
  clubName: string;
  brandName: string;
  projectIds: string[];
};

export function applyWalletFundingLock(
  lock: MatchDayClubLock,
  funding: {
    commitmentFeeGbp: number;
    gbpPerGoal?: number;
    maximumSponsorshipGbp?: number;
  }
): MatchDayClubLock {
  return {
    ...lock,
    fundingLockedAt: new Date().toISOString(),
    commitmentFeeGbp: Math.max(0, Number(funding.commitmentFeeGbp) || 0),
    gbpPerGoal: Math.max(0, Number(funding.gbpPerGoal) || 0),
    maximumSponsorshipGbp: Math.max(
      0,
      Number(funding.maximumSponsorshipGbp) || 0
    ),
  };
}

export function isWalletFundingLocked(
  lock: MatchDayClubLock | null | undefined
): boolean {
  if (!lock?.clubName?.trim()) return false;
  if (lock.fundingLockedAt) return true;
  return Number(lock.commitmentFeeGbp) > 0;
}

function firstPositiveGbp(
  ...values: Array<number | string | null | undefined>
): number {
  for (const value of values) {
    const amount = Number(value);
    if (amount > 0) return amount;
  }
  return 0;
}

/** Wallet deposit for this Match wins over a leftover £1,000 posted offer. */
export function resolveCommittedMatchFunding({
  lock,
  wallet,
  offer,
}: {
  lock?: {
    commitmentFeeGbp?: number | null;
    gbpPerGoal?: number | null;
    maximumSponsorshipGbp?: number | null;
  } | null;
  wallet?: {
    commitmentFeeGbp?: number | null;
    gbpPerGoal?: number | null;
    maximumSponsorshipGbp?: number | null;
  } | null;
  offer?: {
    sponsorshipAmountGbp?: number | null;
    gbpPerGoal?: number | null;
    maxAmount?: number | null;
  } | null;
}): {
  baseAmount: number;
  gbpPerGoal: number;
  maxAmount: number;
} {
  return {
    baseAmount: firstPositiveGbp(
      lock?.commitmentFeeGbp,
      wallet?.commitmentFeeGbp,
      offer?.sponsorshipAmountGbp
    ),
    gbpPerGoal: firstPositiveGbp(
      lock?.gbpPerGoal,
      wallet?.gbpPerGoal,
      offer?.gbpPerGoal
    ),
    maxAmount: firstPositiveGbp(
      lock?.maximumSponsorshipGbp,
      wallet?.maximumSponsorshipGbp,
      offer?.maxAmount
    ),
  };
}

export function includeBrandOnTargets(
  targets: string[] | null | undefined,
  brandName: string
): string[] {
  const names = (targets ?? []).map((name) => name.trim()).filter(Boolean);
  const brand = brandName.trim();
  if (!brand) return names;
  if (names.some((name) => brandsMatch(name, brand))) return names;
  return [...names, brand];
}

export function shouldPullLockedClubUploads({
  pendingForClub,
  uploadedProjectCount,
}: {
  pendingForClub: number;
  uploadedProjectCount: number;
}): boolean {
  return pendingForClub === 0 && uploadedProjectCount > 0;
}

/** An empty or partial pending offer still receives the SD's uploaded five. */
export function shouldFillLockedOfferWithUploads({
  pendingProjectCount,
  uploadedProjectCount,
}: {
  pendingProjectCount: number;
  uploadedProjectCount: number;
}): boolean {
  return (
    uploadedProjectCount > 0 &&
    pendingProjectCount < MATCH_DAY_PROJECT_COUNT &&
    uploadedProjectCount > pendingProjectCount
  );
}

export function notifySignedSponsorship(detail: SignedSponsorshipLiveDetail) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(SIGNED_SPONSORSHIP_EVENT, { detail })
  );
}
