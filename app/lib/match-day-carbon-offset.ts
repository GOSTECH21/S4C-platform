/** Sponsors fund a Club's Match Day carbon footprint offset, not the five themselves. */

import { MATCH_DAY_PROJECT_COUNT } from "./partner-projects";
import {
  isLeadMatchDaySponsorBrand,
  isNamedFixture,
} from "./climate-sponsors";

export { isLeadMatchDaySponsorBrand };

export const MATCH_DAY_CARBON_OFFSET_LABEL =
  "Match Day carbon footprint offset";

export const MATCH_DAY_PROJECTS_RECORD_LABEL =
  "The club's 5 chosen Climate Projects";

export const MATCH_DAY_GOALS_SCORED_COPY =
  "You are sponsoring this Club's selected Match Day Climate Projects (as shown or to be shown here) to help them offset their carbon footprint with one fixed Match-Sponsorship. 80% is the Fan Participation Pool; 20% is the Score Impact Pool unlocked by confirmed scores.";

export const MATCH_DAY_PROJECTS_RECORD_COPY =
  "Sponsored Projects will be saved in a Folder for your Record";

export const MATCH_DAY_PROJECTS_WAITING_COPY =
  "Waiting for the club Sustainability Director to choose the Climate Projects for this Match Day. When they do, those Projects appear here as your record, and Fans can FUND-IT onto them.";

export const MATCH_DAY_PROJECTS_BEFORE_SIGNOFF_COPY =
  "When you type a Club you wish to sponsor, you see that Club's chosen Climate Projects first. You may sign the sponsorship only after they are visible. If the Club has not uploaded them yet, sign-off stays pending approval until they do.";

export const MATCH_DAY_SIGNOFF_PENDING_COPY =
  "Sign-off stays pending approval until this Club uploads its Climate Projects. You will see those Projects here before you can sign.";

export const MATCH_DAY_PROJECTS_SEEN_COPY =
  "You have seen this Club's chosen Climate Projects. You may now sign the sponsorship.";

export const TOP_UP_CASH_HEADING =
  "Top up the cash fans will put into Climate Projects";

/** Local Business Climate Sponsors keep the five as a record — no Goals-scored copy. */
export const LOCAL_FIVE_RECORD_COPY =
  "The five Climate Projects the Sustainability Director chooses for this Match Day are kept here as your record. Fans FUND-IT onto that list. Sign off after you insert your Sponsorship amount — you do not wait for the five.";

export function chosenProjectsReadyForMatchDay(
  projectCount: number
): boolean {
  return projectCount >= MATCH_DAY_PROJECT_COUNT;
}

export function matchDaySignOffIsPending(projectCount: number): boolean {
  return !chosenProjectsReadyForMatchDay(projectCount);
}

export function shouldPublishChosenMatchDayProjects({
  projectCount,
}: {
  projectCount: number;
  inboundSponsorCount?: number;
}): boolean {
  return chosenProjectsReadyForMatchDay(projectCount);
}

export function climateWalletHeading({
  clubName,
  fixtureName,
}: {
  clubName?: string | null;
  fixtureName?: string | null;
}): string {
  const club = String(clubName ?? "").trim();
  const fixture = String(fixtureName ?? "").trim();
  const match = isNamedFixture(fixture)
    ? fixture
    : club
      ? `${club} v Selected Opponent`
      : "";
  return match
    ? `Climate Sponsorship Wallet (${match})`
    : "Climate Sponsorship Wallet";
}

export function climateWalletFansCopy(clubName?: string | null): string {
  const club = String(clubName ?? "").trim() || "your club";
  return `Fans of ${club} take cash from this wallet and put that cash into their Preferred Climate Project`;
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
