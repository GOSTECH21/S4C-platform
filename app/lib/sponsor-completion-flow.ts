/** Seamless Lead Climate Sponsor lock → wallet → receive → sign-off. */

import {
  brandsMatch,
  type MatchDayClubLock,
} from "./climate-sponsors";

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

export function notifySignedSponsorship(detail: SignedSponsorshipLiveDetail) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(SIGNED_SPONSORSHIP_EVENT, { detail })
  );
}
