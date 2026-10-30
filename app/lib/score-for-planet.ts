/* s4p-score-impact-pool-v2 */
/** Score-For-Planet (S4P): Match-Sponsorship with scoring-triggered climate funding. */

function roundGbp(value: number): number {
  return Math.round((Number(value) || 0) * 100) / 100;
}

export const S4P_LABEL = "Score-For-Planet";
export const S4P_SHORT = "S4P";
export const FAN_PARTICIPATION_POOL_LABEL = "Fan Participation Pool";
export const SCORE_IMPACT_POOL_LABEL = "Score Impact Pool";
export const FAN_PARTICIPATION_POOL_RATE = 0.8;
export const SCORE_IMPACT_POOL_RATE = 0.2;
export const SCORE_IMPACT_TRANCHE_COUNT = 3;
export const S4P_CAMPAIGN_DAYS = 5;

export const S4P_SCORE_EXCLUSIVE_COPY =
  "The S4P Lead Sponsor has exclusive rights to scoring-triggered climate funding (Goals, Tries, Touchdowns and equivalent scores). Predict-For Planet does not include Goal scored.";

export const S4P_CAMPAIGN_COPY = `An S4P Match-Sponsorship is a ${S4P_CAMPAIGN_DAYS}-day campaign for a selected Match Day.`;

export const S4P_POOL_SPLIT_COPY =
  "80% of the Match-Sponsorship is the Fan Participation Pool for eligible fan-directed allocations throughout the campaign. The remaining 20% is the Score Impact Pool, unlocked by a confirmed score from the sponsored team.";

export const S4P_CAP_COPY =
  "Further scores after that pool is unlocked still count in S4P statistics but do not add sponsor liabilities.";

export const S4P_THIRD_UNLOCK_COPY =
  "If the score is 0–0, no payment will be unlocked. Any score during the Match will unlock one-third of the 20% amount until the total amount reads £0.00.";

export function matchSponsorshipGbp(amount: number): number {
  return roundGbp(Math.max(0, Number(amount) || 0));
}

export function fanParticipationPoolGbp(matchSponsorship: number): number {
  return roundGbp(matchSponsorshipGbp(matchSponsorship) * FAN_PARTICIPATION_POOL_RATE);
}

export function scoreImpactPoolGbp(matchSponsorship: number): number {
  const total = matchSponsorshipGbp(matchSponsorship);
  return roundGbp(total - fanParticipationPoolGbp(total));
}

/** Split the Score Impact Pool into three equal scoring unlocks, exhausting the pool. */
export function scoreImpactTranches(poolGbp: number): number[] {
  const pool = roundGbp(Math.max(0, Number(poolGbp) || 0));
  if (pool <= 0) return [];
  const first = roundGbp(pool / SCORE_IMPACT_TRANCHE_COUNT);
  const second = roundGbp(pool / SCORE_IMPACT_TRANCHE_COUNT);
  const third = roundGbp(pool - first - second);
  return [first, second, third].filter((part) => part > 0);
}

export function scoreImpactUnlockedGbp({
  matchSponsorshipGbp: amount,
  goalsScored,
}: {
  matchSponsorshipGbp: number;
  goalsScored?: number;
  matchFinished?: boolean;
}): number {
  const pool = scoreImpactPoolGbp(amount);
  if (pool <= 0) return 0;
  const scores = Math.max(0, Math.round(Number(goalsScored) || 0));
  if (scores <= 0) return 0;
  const tranches = scoreImpactTranches(pool);
  return roundGbp(
    tranches.slice(0, scores).reduce((sum, part) => sum + part, 0)
  );
}

export function scoreImpactLockedGbp(input: {
  matchSponsorshipGbp: number;
  goalsScored?: number;
  matchFinished?: boolean;
}): number {
  return roundGbp(scoreImpactPoolGbp(input.matchSponsorshipGbp) - scoreImpactUnlockedGbp(input));
}

/** Spendable Carbon Wallet cash: 80% now, plus unlocked Score Impact Pool. Extra scores add £0. */
export function s4pSpendableGbp(input: {
  matchSponsorshipGbp: number;
  goalsScored?: number;
  matchFinished?: boolean;
}): number {
  return roundGbp(
    fanParticipationPoolGbp(input.matchSponsorshipGbp) +
      scoreImpactUnlockedGbp(input)
  );
}

export function s4pCommittedGbp(matchSponsorship: number): number {
  return matchSponsorshipGbp(matchSponsorship);
}

export function furtherScoresAddLiability(
  matchSponsorship: number,
  goalsScored: number
): boolean {
  const pool = scoreImpactPoolGbp(matchSponsorship);
  const unlocked = scoreImpactUnlockedGbp({
    matchSponsorshipGbp: matchSponsorship,
    goalsScored,
  });
  return unlocked < pool;
}

export function s4pLeadSponsorCopy(matchSponsorship = 0): string {
  const amount = matchSponsorshipGbp(matchSponsorship);
  const example =
    amount > 0
      ? ` Of ${formatS4pGbp(amount)}, ${formatS4pGbp(fanParticipationPoolGbp(amount))} is the ${FAN_PARTICIPATION_POOL_LABEL} and ${formatS4pGbp(scoreImpactPoolGbp(amount))} is the ${SCORE_IMPACT_POOL_LABEL}.`
      : "";
  return `${S4P_CAMPAIGN_COPY} ${S4P_POOL_SPLIT_COPY}${example} ${S4P_THIRD_UNLOCK_COPY} ${S4P_CAP_COPY} ${S4P_SCORE_EXCLUSIVE_COPY}`;
}

export function formatS4pGbp(amount: number): string {
  const value = roundGbp(amount);
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(value);
}
