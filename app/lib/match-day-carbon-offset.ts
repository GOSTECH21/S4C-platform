/** Sponsors fund a Club's Match Day carbon footprint offset, not the five themselves. */

import { MATCH_DAY_PROJECT_COUNT } from "./partner-projects";
import { isLeadMatchDaySponsorBrand } from "./climate-sponsors";

export { isLeadMatchDaySponsorBrand };

export const MATCH_DAY_CARBON_OFFSET_LABEL =
  "Match Day carbon footprint offset";

export const MATCH_DAY_PROJECTS_RECORD_LABEL =
  "The club's 5 chosen Climate Projects";

export const MATCH_DAY_PROJECTS_RECORD_COPY =
  "These are the Climate Projects the Sustainability Director chose for the Match Day you sponsored. They are your record of how the Club's Match Day carbon footprint offset is delivered. Fans FUND-IT onto this list.";

export const MATCH_DAY_PROJECTS_WAITING_COPY =
  "Waiting for the club Sustainability Director to choose the Climate Projects for this Match Day. When they do, those Projects appear here as your record, and Fans can FUND-IT onto them.";

export function chosenProjectsReadyForMatchDay(
  projectCount: number
): boolean {
  return projectCount >= MATCH_DAY_PROJECT_COUNT;
}

export function shouldPublishChosenMatchDayProjects({
  projectCount,
  inboundSponsorCount,
}: {
  projectCount: number;
  inboundSponsorCount: number;
}): boolean {
  return (
    chosenProjectsReadyForMatchDay(projectCount) && inboundSponsorCount > 0
  );
}

export function carbonOffsetHeadline({
  clubName,
  matchTitle,
}: {
  clubName: string;
  matchTitle?: string | null;
}): string {
  const fixture = String(matchTitle ?? "").trim();
  const during = /\sv\s/i.test(fixture) ? fixture : `${clubName} Match Day`;
  return `${MATCH_DAY_CARBON_OFFSET_LABEL} for ${clubName} during ${during}`;
}
