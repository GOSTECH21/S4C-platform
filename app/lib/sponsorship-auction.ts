/** Goal-scored funding: the sponsor pays only for Goals scored by the club. */

export const DEFAULT_MINIMUM_SPONSORSHIP = 1000;
/** Fallback when a Sustainability Director has not yet inserted a match minimum. */
export const OPENING_SPONSORSHIP = DEFAULT_MINIMUM_SPONSORSHIP;
export const DEFAULT_GBP_PER_VOTE = 0.02;
export const DEFAULT_PROJECTED_VOTES = 500_000;

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

/**
 * Amount payable per Goal: stipulated £/Vote × fans who voted,
 * never below the Sustainability Director's match Minimum Amount.
 */
export function currentSponsorshipAmount({
  votesReceived,
  gbpPerVote = DEFAULT_GBP_PER_VOTE,
  minimumAmount = DEFAULT_MINIMUM_SPONSORSHIP,
}: {
  votesReceived: number;
  gbpPerVote?: number;
  minimumAmount?: number;
}): number {
  const voteBased = expectedSponsorshipFromVotes({
    projectedVotes: votesReceived,
    gbpPerVote,
  });
  const floor = Math.max(0, Number(minimumAmount) || 0);
  return Math.max(floor, voteBased);
}

/** Final amount the sponsor pays: live £/Goal × Goals scored by the club. */
export function totalSponsorshipPayable({
  amountPerGoal,
  goalsScored,
}: {
  amountPerGoal: number;
  goalsScored: number;
}): number {
  const perGoal = Math.max(0, Math.round(Number(amountPerGoal) || 0));
  const goals = Math.max(0, Math.round(Number(goalsScored) || 0));
  return perGoal * goals;
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
  return `${formatGbpPerVote(rate)}/Vote`;
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
  minimumAmount = DEFAULT_MINIMUM_SPONSORSHIP,
}: {
  amount: number;
  scoreLabel: string;
  minimumAmount?: number;
}): string {
  const rate = formatSponsorshipRate(amount, scoreLabel);
  if (amount <= minimumAmount) return `${rate} (Min)`;
  return rate;
}

export function formatVoteCount(votes: number): string {
  return votes.toLocaleString("en-GB");
}
