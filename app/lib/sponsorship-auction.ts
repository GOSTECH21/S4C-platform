/** Match Day sponsorship: one Match-Sponsorship amount plus a 5% Platform Fee. */

import {
  PLATFORM_FEE_PERCENT_LABEL,
  matchSponsorshipTopUp,
} from "./sponsor-wallet";

export const DEFAULT_MINIMUM_SPONSORSHIP = 1000;
/** Fallback when a Sustainability Director has not yet inserted a match minimum. */
export const OPENING_SPONSORSHIP = DEFAULT_MINIMUM_SPONSORSHIP;
/** Each FUND-IT from a Climate Sponsorship Wallet puts this amount on a Climate Project. */
export const DEFAULT_GBP_PER_VOTE = 0.2;
export const DEFAULT_GBP_PER_GOAL = 3000;
/** One post to a fan is 1 eyeball and this many brand exposures. */
export const EXPOSURES_PER_POST = 5;
/** Kept for stored-selection compatibility; the SD form no longer asks for a fan count. */
export const DEFAULT_PROJECTED_VOTES = 0;

export function expectedSponsorshipFromVotes({
  projectedVotes,
  gbpPerVote = DEFAULT_GBP_PER_VOTE,
}: {
  projectedVotes: number;
  gbpPerVote?: number;
}): number {
  const votes = Math.max(0, Number(projectedVotes) || 0);
  const rate = Math.max(0, Number(gbpPerVote) || 0);
  return Math.round(votes * rate);
}

export function gbpPerVoteFromExpected({
  projectedVotes,
  expectedSponsorship,
}: {
  projectedVotes: number;
  expectedSponsorship: number;
}): number {
  const votes = Math.max(0, Number(projectedVotes) || 0);
  if (votes <= 0) return DEFAULT_GBP_PER_VOTE;
  return Math.round((Number(expectedSponsorship) / votes) * 10_000) / 10_000;
}

export function votesToClearMinimum({
  gbpPerVote = DEFAULT_GBP_PER_VOTE,
  minimumAmount = DEFAULT_MINIMUM_SPONSORSHIP,
}: {
  gbpPerVote?: number;
  minimumAmount?: number;
}): number {
  const rate = Math.max(0, Number(gbpPerVote) || 0);
  const floor = Math.max(0, Number(minimumAmount) || 0);
  if (rate <= 0) return 0;
  return Math.ceil(floor / rate);
}

/** Each post to a fan is 1 eyeball and EXPOSURES_PER_POST brand exposures. */
export function brandExposuresFromPosts(posts: number): number {
  const eyeballs = Math.max(0, Math.round(Number(posts) || 0));
  return eyeballs * EXPOSURES_PER_POST;
}

/** Stipulated amount/Climate Project × exposures (5 per posted fan). */
export function brandExposureValue({
  posts,
  gbpPerProject = DEFAULT_GBP_PER_VOTE,
}: {
  posts: number;
  gbpPerProject?: number;
}): number {
  const rate = Math.max(0, Number(gbpPerProject) || 0);
  return Math.round(brandExposuresFromPosts(posts) * rate * 100) / 100;
}

/**
 * Amount payable per Goal: the Sustainability Director's posted figure.
 * Votes no longer scale this amount.
 */
export function currentSponsorshipAmount({
  gbpPerGoal,
  minimumAmount = DEFAULT_MINIMUM_SPONSORSHIP,
}: {
  votesReceived?: number;
  gbpPerVote?: number;
  gbpPerGoal?: number;
  minimumAmount?: number;
}): number {
  const perGoal = Math.max(0, Math.round(Number(gbpPerGoal) || 0));
  if (perGoal > 0) return perGoal;
  return Math.max(0, Math.round(Number(minimumAmount) || 0));
}

/**
 * Match-Sponsorship is one fixed amount. Extra scores do not add sponsor liabilities.
 */
export function totalMatchSponsorshipPayable({
  baseAmount,
}: {
  baseAmount: number;
  gbpPerGoal?: number;
  goalsScored?: number;
  maxAmount?: number | null;
}): number {
  return Math.max(0, Math.round(Number(baseAmount) || 0));
}

export function totalSponsorshipPayable({
  amountPerGoal,
  goalsScored,
  baseAmount = 0,
  maxAmount,
}: {
  amountPerGoal: number;
  goalsScored: number;
  baseAmount?: number;
  maxAmount?: number | null;
}): number {
  return totalMatchSponsorshipPayable({
    baseAmount,
    gbpPerGoal: amountPerGoal,
    goalsScored,
    maxAmount,
  });
}

/** Familiar match-day names. Catalog pages can still use the legal club title. */
const SHORT_CLUB_NAMES: Array<[RegExp, string]> = [
  [/hearts of midlothian(?:\s+fc)?/gi, "Hearts"],
  [/heart of midlothian(?:\s+fc)?/gi, "Hearts"],
  [/manchester city/gi, "Man City"],
  [/manchester united/gi, "Man United"],
  [/wolverhampton wanderers/gi, "Wolves"],
  [/tottenham hotspur/gi, "Tottenham"],
  [/west ham united/gi, "West Ham"],
  [/newcastle united/gi, "Newcastle"],
  [/nottingham forest/gi, "Nottm Forest"],
  [/brighton(?:\s+and|\s+&)?\s+hove albion/gi, "Brighton"],
  [/st\.?\s*mirren/gi, "St Mirren"],
];

export function shortMatchClubName(name: string): string {
  let value = name.trim();
  for (const [pattern, short] of SHORT_CLUB_NAMES) {
    value = value.replace(pattern, short);
  }
  return value.replace(/\s+/g, " ").trim();
}

export function formatMatchHeadline(title: string | null | undefined): string {
  if (!title) return "Match";
  const cleaned = shortMatchClubName(
    title
      .replace(/\s+climate campaign$/i, "")
      .replace(/\s+versus\s+/gi, " v ")
      .replace(/\s+vs\.?\s+/gi, " v ")
      .replace(/\s+/g, " ")
      .trim()
  );
  return cleaned || "Match";
}

export function campaignHeadline(title: string | null | undefined): string {
  return `${formatMatchHeadline(title)} Climate Campaign`;
}

export function voteProgress({
  votesReceived,
  votesNeeded,
}: {
  votesReceived: number;
  votesNeeded: number;
}): number {
  if (votesNeeded <= 0) return 1;
  return Math.min(1, Math.max(0, votesReceived / votesNeeded));
}

export function formatMoney(amount: number): string {
  return `£${amount.toLocaleString("en-GB")}`;
}

export function formatGbpPerVote(rate: number): string {
  return `£${rate.toLocaleString("en-GB", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatStipulatedRate(rate: number): string {
  return `${formatGbpPerVote(rate)}/Climate Project`;
}

export function formatSponsorshipRate(
  amount: number,
  scoreLabel: string
): string {
  return `${formatMoney(amount)}/${scoreLabel}`;
}

export function formatSponsorshipBadge({
  amount,
  scoreLabel,
}: {
  amount: number;
  scoreLabel: string;
  minimumAmount?: number;
}): string {
  return formatSponsorshipRate(amount, scoreLabel);
}

export function formatVoteCount(votes: number): string {
  return votes.toLocaleString("en-GB");
}

export function formatBrandExposureLabel(posts?: number | null): string {
  const eyeballs = Math.max(0, Math.round(Number(posts) || 0));
  if (eyeballs > 0) {
    return `${brandExposuresFromPosts(eyeballs).toLocaleString("en-GB")} (${eyeballs.toLocaleString("en-GB")} posted fan${eyeballs === 1 ? "" : "s"} × ${EXPOSURES_PER_POST})`;
  }
  return `${EXPOSURES_PER_POST} per posted fan`;
}

export function formatMatchFundingLine({
  baseAmount,
  maxAmount,
}: {
  baseAmount?: number | null;
  gbpPerGoal?: number | null;
  maxAmount?: number | null;
}): string {
  const matchAmount =
    Number(baseAmount) > 0
      ? Number(baseAmount)
      : Number(maxAmount) > 0
        ? Number(maxAmount)
        : 0;
  if (!(matchAmount > 0)) return "";
  return `${formatMoney(matchAmount)} Match-Sponsorship`;
}

export function formatSponsorPayableCopy({
  baseAmount,
  maxAmount,
  clubName,
}: {
  baseAmount: number;
  gbpPerGoal?: number | null;
  maxAmount?: number | null;
  clubName?: string;
}): string {
  const matchAmount =
    Number(baseAmount) > 0
      ? Number(baseAmount)
      : Number(maxAmount) > 0
        ? Number(maxAmount)
        : 0;
  const who = clubName ? `${clubName}` : "this Match";
  const topUp = matchSponsorshipTopUp(matchAmount);
  return `You pay the ${formatMoney(topUp.matchSponsorshipGbp)} Match-Sponsorship for ${who}, plus a ${PLATFORM_FEE_PERCENT_LABEL} Platform Fee of ${formatMoney(topUp.platformFeeGbp)} (total ${formatMoney(topUp.paidGbp)}) via Stripe.`;
}

/** Local Business Climate Sponsors pay a Match amount — they do not sponsor Goals. */
export function formatLocalSponsorPayableCopy({
  sponsorshipGbp,
  clubName,
}: {
  sponsorshipGbp: number;
  clubName?: string;
}): string {
  const amount =
    Number(sponsorshipGbp) > 0
      ? formatMoney(Number(sponsorshipGbp))
      : "the amount you put into the Climate Sponsorship Wallet";
  const club = String(clubName ?? "").trim();
  if (club) return `You pay ${amount} for this ${club} Match.`;
  return `You pay ${amount} for this Match.`;
}
