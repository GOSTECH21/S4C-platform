/** Club Sustainability Director: How it works is Select Match → Choose Projects → Sponsors. */

import {
  CLUB_DASHBOARD_PATH,
  CLUB_SELECT_PROJECTS_ALIASES,
  CLUB_SPONSOR_LEADERBOARD_PATH,
  CLUB_SPONSORS_PATH,
} from "./routes";

export const CLUB_HOW_IT_WORKS_LABEL = "How it works";
export const CLUB_HOW_IT_WORKS_STAMP = "club-how-it-works-flow-v1";
export const CLUB_CHOOSE_PROJECTS_HEADING = "Choose Projects";

export function clubHowItWorksPaths(): string[] {
  return [
    CLUB_DASHBOARD_PATH,
    ...CLUB_SELECT_PROJECTS_ALIASES,
    CLUB_SPONSORS_PATH,
    CLUB_SPONSOR_LEADERBOARD_PATH,
  ];
}

export function isClubHowItWorksPath(
  pathname: string | null | undefined
): boolean {
  const path = String(pathname ?? "").split("?")[0].split("#")[0];
  if (clubHowItWorksPaths().includes(path)) return true;
  return (
    path.startsWith("/preview/club-") &&
    !path.includes("admin") &&
    !path.includes("register")
  );
}
