/** The four S4P sport categories and the score that unlocks sponsorship. */

export type SportCategory = {
  name: string;
  scoreLabel: string;
  scoreEvent: string;
  exampleS2PS: string;
  icon: string;
  summary: string;
};

export const SPORT_CATEGORIES: SportCategory[] = [
  {
    name: "Football",
    scoreLabel: "Goal",
    scoreEvent: "Goal scored",
    exampleS2PS: "£10,000/Goal",
    icon: "⚽",
    summary:
      "Each Goal scored (for example Arsenal vs Manchester United) releases the sponsor amount agreed for that match.",
  },
  {
    name: "Rugby",
    scoreLabel: "Try",
    scoreEvent: "Try scored",
    exampleS2PS: "£10,000/Try",
    icon: "🏉",
    summary:
      "Each Try scored (for example Scotland in the Six Nations) releases the sponsor amount agreed for that match.",
  },
  {
    name: "NFL",
    scoreLabel: "Touchdown",
    scoreEvent: "Touchdown scored",
    exampleS2PS: "£10,000/Touchdown",
    icon: "🏈",
    summary:
      "Each Touchdown scored by an NFL team releases the sponsor amount agreed for that game.",
  },
  {
    name: "NBA",
    scoreLabel: "3-Point",
    scoreEvent: "3-Point Score",
    exampleS2PS: "£10,000/3-Point",
    icon: "🏀",
    summary:
      "Each 3-Point Score Sponsorship releases the sponsor amount agreed for that game.",
  },
];

export const PRIMARY_SPORTS = SPORT_CATEGORIES.map((sport) => sport.name);

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
