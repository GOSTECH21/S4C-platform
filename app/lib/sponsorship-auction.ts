/** Match Day sponsorship: Base Match Sponsorship + £/Goal, up to a cap. */

export const DEFAULT_MINIMUM_SPONSORSHIP = 1000;
/** Fallback when a Sustainability Director has not yet inserted a match minimum. */
export const OPENING_SPONSORSHIP = DEFAULT_MINIMUM_SPONSORSHIP;
/** Stipulated amount per Climate Project — brand-exposure counter, not payment. */
export const DEFAULT_GBP_PER_VOTE = 0.02;
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
 * Final amount the sponsor pays: Base Match Sponsorship plus £/Goal × Goals,
 * never above the SD cap, and never below the base (0–0 still pays the base).
 */
export function totalMatchSponsorshipPayable({
  baseAmount,
  gbpPerGoal,
  goalsScored,
  maxAmount,
}: {
  baseAmount: number;
  gbpPerGoal: number;
  goalsScored: number;
  maxAmount?: number | null;
}): number {
  const base = Math.max(0, Math.round(Number(baseAmount) || 0));
  const perGoal = Math.max(0, Math.round(Number(gbpPerGoal) || 0));
  const goals = Math.max(0, Math.round(Number(goalsScored) || 0));
  const payable = base + perGoal * goals;
  const cap = Math.max(0, Math.round(Number(maxAmount) || 0));
  if (cap <= 0) return payable;
  return Math.min(payable, Math.max(cap, base));
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
  gbpPerGoal,
  maxAmount,
}: {
  baseAmount?: number | null;
  gbpPerGoal?: number | null;
  maxAmount?: number | null;
}): string {
  const parts: string[] = [];
  if (Number(baseAmount) > 0) {
    parts.push(`${formatMoney(Number(baseAmount))} Base Match Sponsorship`);
  }
  if (Number(gbpPerGoal) > 0) {
    parts.push(`${formatMoney(Number(gbpPerGoal))}/Goal`);
  }
  if (Number(maxAmount) > 0) {
    parts.push(`up to a maximum of ${formatMoney(Number(maxAmount))}`);
  }
  return parts.join(" · ");
}

export function formatSponsorPayableCopy({
  baseAmount,
  gbpPerGoal,
  maxAmount,
  clubName,
}: {
  baseAmount: number;
  gbpPerGoal?: number | null;
  maxAmount?: number | null;
  clubName?: string;
}): string {
  const perGoal = Number(gbpPerGoal) > 0 ? Number(gbpPerGoal) : 0;
  const cap = Number(maxAmount) > 0 ? Number(maxAmount) : 0;
  const who = clubName ? `${clubName} players` : "the club";
  const capBit =
    cap > 0 ? `, up to a maximum of ${formatMoney(cap)}` : "";
  if (perGoal > 0) {
    return `You pay the ${formatMoney(baseAmount)} Base Match Sponsorship even if ${who} score no Goals, plus ${formatMoney(perGoal)} for each Goal scored${capBit}.`;
  }
  return `You pay the ${formatMoney(baseAmount)} Base Match Sponsorship even if ${who} score no Goals${capBit}.`;
}
