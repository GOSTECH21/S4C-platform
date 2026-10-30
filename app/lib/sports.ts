/** The four S4P sport categories and the score that unlocks sponsorship. */

export type SportCategory = {
  name: string;
  scoreLabel: string;
  scoreEvent: string;
  exampleS2PS: string;
  icon: string;
  summary: string;
};

const FAN_POOL_SENTENCE = "80% is the Fan Participation Pool for the Campaign.";
const THIRD_UNLOCK =
  "If the score is 0–0, no payment will be unlocked. Any score during the Match will unlock one-third of the 20% amount until the total amount reads £0.00.";

export const SPORT_CATEGORIES: SportCategory[] = [
  {
    name: "Football",
    scoreLabel: "Goal",
    scoreEvent: "Goal scored",
    exampleS2PS: "£10,000 Match-Sponsorship",
    icon: "⚽",
    summary:
      `A Lead Climate Sponsor pays one Match-Sponsorship amount for a Match, plus a 5% Platform Fee. ${FAN_POOL_SENTENCE} 20% is the Score Impact Pool, unlocked by Goals scored by the sponsored team. ${THIRD_UNLOCK} Extra Goals after that pool is unlocked still count in S4P statistics but do not add sponsor liabilities. A Global Brand can also be a Game-Time Sponsor: buy a 30-minute slot of Predict-For Planet fan engagement — P4P does not include Goal scored.`,
  },
  {
    name: "Rugby",
    scoreLabel: "Try",
    scoreEvent: "Try scored",
    exampleS2PS: "£10,000 Match-Sponsorship",
    icon: "🏉",
    summary:
      `An S4P Lead Sponsor pays one fixed Match-Sponsorship. ${FAN_POOL_SENTENCE} Tries scored by the sponsored team unlock the 20% Score Impact Pool. ${THIRD_UNLOCK} Further Tries after that pool is unlocked still count in S4P statistics but do not add sponsor liabilities.`,
  },
  {
    name: "NFL",
    scoreLabel: "Touchdown",
    scoreEvent: "Touchdown scored",
    exampleS2PS: "£10,000 Match-Sponsorship",
    icon: "🏈",
    summary:
      `An S4P Lead Sponsor pays one fixed Match-Sponsorship. ${FAN_POOL_SENTENCE} Touchdowns scored by the sponsored team unlock the 20% Score Impact Pool. ${THIRD_UNLOCK} Further Touchdowns after that pool is unlocked still count in S4P statistics but do not add sponsor liabilities.`,
  },
  {
    name: "NBA",
    scoreLabel: "3-Point",
    scoreEvent: "3-Point Score",
    exampleS2PS: "£10,000 Match-Sponsorship",
    icon: "🏀",
    summary:
      `An S4P Lead Sponsor pays one fixed Match-Sponsorship. ${FAN_POOL_SENTENCE} 3-Point scores by the sponsored team unlock the 20% Score Impact Pool. ${THIRD_UNLOCK} Further 3-Point scores after that pool is unlocked still count in S4P statistics but do not add sponsor liabilities.`,
  },
];

export const PRIMARY_SPORTS = SPORT_CATEGORIES.map((sport) => sport.name);

/** Club registration and similar pickers: every sport on the platform. */
export const SPORT_SELECT_OPTIONS = [...PRIMARY_SPORTS] as const;

export const SPORT_ORDER = [...PRIMARY_SPORTS];

const CATEGORY_BY_NAME = new Map(
  SPORT_CATEGORIES.map((sport) => [sport.name.toLowerCase(), sport])
);

export function sportCategory(
  sport: string | null | undefined
): SportCategory | null {
  const value = (sport ?? "").trim().toLowerCase();
  if (!value) return null;
  const direct = CATEGORY_BY_NAME.get(value);
  if (direct) return direct;
  if (value.includes("rugby")) return CATEGORY_BY_NAME.get("rugby") ?? null;
  if (value.includes("nfl") || value.includes("american football")) {
    return CATEGORY_BY_NAME.get("nfl") ?? null;
  }
  if (value.includes("nba") || value.includes("basketball")) {
    return CATEGORY_BY_NAME.get("nba") ?? null;
  }
  if (value.includes("football") || value.includes("soccer")) {
    return CATEGORY_BY_NAME.get("football") ?? null;
  }
  return null;
}

export function scoreLabelForSport(sport: string | null | undefined): string {
  return sportCategory(sport)?.scoreLabel ?? "Goal";
}

export function scoreEventForSport(sport: string | null | undefined): string {
  return sportCategory(sport)?.scoreEvent ?? "Goal scored";
}

export function isPrimarySport(sport: string | null | undefined): boolean {
  return sportCategory(sport) != null;
}
