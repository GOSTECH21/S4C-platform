/** Highest-bidder sponsorship that rises with votes during the 72-hour window. */

export const OPENING_SPONSORSHIP = 1000;
export const DEFAULT_GBP_PER_VOTE = 0.01;
export const DEFAULT_PROJECTED_VOTES = 500_000;
/** Default peak: 500,000 votes × £0.01/vote. */
export const DEFAULT_MAX_SPONSORSHIP = 5_000;
export const VOTE_TARGET_FOR_MAX = DEFAULT_PROJECTED_VOTES;

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

export function currentSponsorshipAmount({
  votesReceived,
  openingAmount = OPENING_SPONSORSHIP,
  maxAmount = DEFAULT_MAX_SPONSORSHIP,
  voteTarget = VOTE_TARGET_FOR_MAX,
}: {
  votesReceived: number;
  openingAmount?: number;
  maxAmount?: number;
  voteTarget?: number;
}): number {
  const opening = Math.max(0, openingAmount);
  const peak = Math.max(opening, maxAmount);
  if (voteTarget <= 0) return peak;
  const progress = Math.min(1, Math.max(0, votesReceived / voteTarget));
  return Math.round(opening + (peak - opening) * progress);
}

export function voteProgress({
  votesReceived,
  voteTarget = VOTE_TARGET_FOR_MAX,
}: {
  votesReceived: number;
  voteTarget?: number;
}): number {
  if (voteTarget <= 0) return 1;
  return Math.min(1, Math.max(0, votesReceived / voteTarget));
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

export function formatSponsorshipRate(
  amount: number,
  scoreLabel: string
): string {
  return `${formatMoney(amount)}/${scoreLabel}`;
}

export function formatSponsorshipBadge({
  amount,
  scoreLabel,
  openingAmount = OPENING_SPONSORSHIP,
  maxAmount = DEFAULT_MAX_SPONSORSHIP,
}: {
  amount: number;
  scoreLabel: string;
  openingAmount?: number;
  maxAmount?: number;
}): string {
  const rate = formatSponsorshipRate(amount, scoreLabel);
  if (amount <= openingAmount) return `${rate} (Min)`;
  if (amount >= maxAmount) return `${rate} (Max)`;
  return rate;
}

export function formatVoteCount(votes: number): string {
  return votes.toLocaleString("en-GB");
}
