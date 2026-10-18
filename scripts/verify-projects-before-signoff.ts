import { readFileSync } from "fs";
import {
  MATCH_DAY_PROJECTS_BEFORE_SIGNOFF_COPY,
  MATCH_DAY_PROJECTS_SEEN_COPY,
  MATCH_DAY_SIGNOFF_PENDING_COPY,
  chosenProjectsReadyForMatchDay,
  matchDaySignOffIsPending,
} from "../app/lib/match-day-carbon-offset";
import { MATCH_DAY_PENDING_APPROVAL_LABEL } from "../app/lib/partner-projects";

const failures: string[] = [];
function assert(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

assert(
  matchDaySignOffIsPending(0) &&
    matchDaySignOffIsPending(4) &&
    !matchDaySignOffIsPending(5) &&
    chosenProjectsReadyForMatchDay(5),
  "Lead sign-off stays pending until the Club has uploaded five Climate Projects"
);

assert(
  MATCH_DAY_PROJECTS_BEFORE_SIGNOFF_COPY.includes(
    "You may sign the sponsorship only after they are visible"
  ) &&
    MATCH_DAY_SIGNOFF_PENDING_COPY.includes("pending approval") &&
    MATCH_DAY_PROJECTS_SEEN_COPY.includes("You may now sign"),
  "Copy tells the sponsor to see the Club's Projects before signing"
);

const typeIn = readFileSync(
  "app/components/sponsor/ClubMatchMenus.tsx",
  "utf8"
);
assert(
  typeIn.includes("resolveSportingCalendarClub(next)") &&
    typeIn.includes("next.trim().toLowerCase()") &&
    typeIn.includes("resolved.trim().toLowerCase()"),
  "Typing a Club name does not auto-expand mid-keystroke, so Leeds United stays Leeds United"
);

const lockIn = readFileSync("app/components/sponsor/MatchDayLockIn.tsx", "utf8");
const panel = readFileSync(
  "app/components/sponsor/ClubChosenProjectsPanel.tsx",
  "utf8"
);
const wallet = readFileSync("app/sponsor/wallet/page.tsx", "utf8");
const offersPage = readFileSync("app/sponsor/offers/page.tsx", "utf8");
const signOff = readFileSync("app/sponsor/offers/OfferSignOff.tsx", "utf8");
const offerService = readFileSync(
  "app/services/sponsor-offers.service.ts",
  "utf8"
);
const terms = signOff.includes("GOAL_SPONSOR_TERMS")
  ? signOff
  : "";

assert(
  lockIn.includes("ClubChosenProjectsPanel") &&
    lockIn.includes("lockClub") &&
    panel.includes("loadClubChosenClimateProjects") &&
    panel.includes("MATCH_DAY_PENDING_APPROVAL_LABEL") &&
    MATCH_DAY_PENDING_APPROVAL_LABEL === "pending approval",
  "Typing a Club shows that Club's chosen Climate Projects tagged pending approval"
);

assert(
  wallet.includes("ClubChosenProjectsPanel") &&
    wallet.includes("chosenProjectsReadyForMatchDay") &&
    wallet.includes("MATCH_DAY_SIGNOFF_PENDING_COPY") &&
    wallet.includes("openLeadSignOffAfterProjects") &&
    wallet.indexOf("<ClubChosenProjectsPanel") <
      wallet.indexOf("<ClimateSponsorshipWallet"),
  "The Carbon Wallet shows the Club's Projects before deposit and only opens sign-off after they are visible"
);

assert(
  offersPage.includes("MATCH_DAY_PROJECTS_BEFORE_SIGNOFF_COPY") &&
    !offersPage.includes("you do not wait for this list") &&
    signOff.includes("projectsReady") &&
    signOff.includes("MATCH_DAY_SIGNOFF_PENDING_COPY") &&
    terms.includes("You must see the Club's five chosen Climate Projects before you sign") &&
    offerService.includes("MATCH_DAY_SIGNOFF_PENDING_COPY") &&
    offerService.includes("chosenProjectsReadyForMatchDay"),
  "Lead sign-off is blocked until the Club's five Climate Projects have been seen"
);

if (failures.length > 0) {
  console.error("verify-projects-before-signoff failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("verify-projects-before-signoff: ok");
