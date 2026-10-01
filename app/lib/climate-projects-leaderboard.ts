import { DEFAULT_MINIMUM_SPONSORSHIP } from "./sponsorship-auction";

export type ClimateProjectVoteRow = {
  id: string;
  name: string;
  votesReceived: number;
  fundingGoal?: number | null;
};

export type RankedClimateProjectVoteRow = ClimateProjectVoteRow & {
  rank: number;
};

/** Rank climate projects from the most votes to the fewest. */
export function rankClimateProjectsByVotes(
  projects: ClimateProjectVoteRow[]
): RankedClimateProjectVoteRow[] {
  return [...projects]
    .sort((left, right) => {
      if (right.votesReceived !== left.votesReceived) {
        return right.votesReceived - left.votesReceived;
      }
      return left.name.localeCompare(right.name);
    })
    .map((row, index) => ({ ...row, rank: index + 1 }));
}

export function stipulatedVoteAmount(amountPerVote: number): number {
  return Math.max(0, Number(amountPerVote) || 0);
}

export function votePoolAmount(totalAmount: number | null | undefined): number {
  const total = Number(totalAmount) || 0;
  return total > 0 ? total : DEFAULT_MINIMUM_SPONSORSHIP;
}

/** Remaining pool after votes, each costing the club-stipulated amount. */
export function remainingAmountAfterVotes({
  totalAmount,
  votes,
  amountPerVote,
}: {
  totalAmount: number;
  votes: number;
  amountPerVote: number;
}): number {
  const start = votePoolAmount(totalAmount);
  const cost =
    stipulatedVoteAmount(amountPerVote) * Math.max(0, Math.round(Number(votes) || 0));
  return Math.max(0, Math.round((start - cost) * 100) / 100);
}

export function formatRemainingAmount(amount: number): string {
  const value = Math.max(0, Number(amount) || 0);
  const hasPence = Math.round(value * 100) % 100 !== 0;
  return `£${value.toLocaleString("en-GB", {
    minimumFractionDigits: hasPence ? 2 : 0,
    maximumFractionDigits: 2,
  })}`;
}
