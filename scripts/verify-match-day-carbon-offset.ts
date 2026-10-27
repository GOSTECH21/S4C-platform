import { readFileSync } from "fs";
import {
  carbonOffsetHeadline,
  chosenProjectsReadyForMatchDay,
  climateWalletFansCopy,
  climateWalletHeading,
  MATCH_DAY_GOALS_SCORED_COPY,
  MATCH_DAY_PROJECTS_RECORD_COPY,
  MATCH_DAY_PROJECTS_RECORD_LABEL,
  matchDaySignOffIsPending,
  shouldPublishChosenMatchDayProjects,
} from "../app/lib/match-day-carbon-offset";
import {
  isLeadMatchDaySponsorBrand,
  pickSoleLeadClimateSponsor,
} from "../app/lib/climate-sponsors";
import { splitClubClimateSponsorsForTabs } from "../app/lib/match-day-branding";

const failures: string[] = [];
function assert(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

assert(
  isLeadMatchDaySponsorBrand("Pepsi Cola") &&
    isLeadMatchDaySponsorBrand("American Express") &&
    isLeadMatchDaySponsorBrand("Puma") &&
    !isLeadMatchDaySponsorBrand("Top Cellar") &&
    !isLeadMatchDaySponsorBrand("The Fountain") &&
    !isLeadMatchDaySponsorBrand("Piazza Italiana"),
  "Lead Match Day occupancy includes Pepsi Cola and listed Leads, never Local Business Climate Sponsors"
);

const pepsi = pickSoleLeadClimateSponsor(
  [
    {
      brandKey: "pepsi cola",
      brandName: "Pepsi Cola",
      email: null,
      matches: ["Manchester City v Arsenal"],
      lockedAt: "2026-10-12T12:00:00.000Z",
      inNetwork: true,
    },
  ],
  "Arsenal"
);
assert(
  pepsi?.brandName === "Pepsi Cola",
  "A registered Lead like Pepsi Cola occupies Our Lead Climate Sponsor after signing the Match Day carbon offset"
);

const tabs = splitClubClimateSponsorsForTabs({
  clubName: "Arsenal",
  leadSponsors: [
    {
      brandKey: "pepsi cola",
      brandName: "Pepsi Cola",
      email: null,
      matches: ["Manchester City v Arsenal"],
      lockedAt: "2026-10-12T12:00:00.000Z",
      inNetwork: true,
    },
  ],
  localSponsors: [
    {
      brandName: "Top Cellar",
      email: "",
      clubName: "Arsenal",
      pledgeGbp: 750,
      createdAt: "2026-10-12T12:00:00.000Z",
      submittedAt: "2026-10-12T12:00:00.000Z",
      acceptedTerms: true,
      signerName: "Alex",
      signedAt: "2026-10-12T12:00:00.000Z",
      source: "registered",
    },
  ],
});
assert(
  tabs.leads[0]?.brandName === "Pepsi Cola" &&
    tabs.locals.some((row) => row.brandName === "Top Cellar"),
  "Lead and Local Business Climate Sponsors both appear on the club tabs after Match Day sign-off"
);

assert(
  chosenProjectsReadyForMatchDay(5) &&
    !chosenProjectsReadyForMatchDay(4) &&
    matchDaySignOffIsPending(0) &&
    matchDaySignOffIsPending(4) &&
    !matchDaySignOffIsPending(5) &&
    shouldPublishChosenMatchDayProjects({
      projectCount: 5,
      inboundSponsorCount: 1,
    }) &&
    shouldPublishChosenMatchDayProjects({
      projectCount: 5,
      inboundSponsorCount: 0,
    }) &&
    !shouldPublishChosenMatchDayProjects({
      projectCount: 4,
    }),
  "The SD's five appear for interested sponsors as soon as chosen; fans still wait for Approved sign-off"
);

assert(
  carbonOffsetHeadline({
    clubName: "Arsenal",
    matchTitle: "Manchester City v Arsenal",
  }).includes("Match Day carbon footprint offset") &&
    MATCH_DAY_PROJECTS_RECORD_LABEL.includes("5 chosen Climate Projects"),
  "Sign-off names the carbon offset; the five are the club record"
);

const wallet = readFileSync("app/sponsor/wallet/page.tsx", "utf8");
const dashboard = readFileSync("app/sponsor/dashboard/page.tsx", "utf8");
const offers = readFileSync("app/services/sponsor-offers.service.ts", "utf8");
const offersPage = readFileSync("app/sponsor/offers/page.tsx", "utf8");
const clubDash = readFileSync("app/club/dashboard/page.tsx", "utf8");
const matchDay = readFileSync("app/services/club-match-day.service.ts", "utf8");
const chosenPanel = readFileSync(
  "app/components/sponsor/ClubChosenProjectsPanel.tsx",
  "utf8"
);
assert(
  wallet.includes("sponsorPayPath") &&
    wallet.includes("ClubChosenProjectsPanel") &&
    dashboard.includes("LeadSponsorHome") &&
    dashboard.includes("loadClubChosenClimateProjects") &&
    chosenPanel.includes("MATCH_DAY_GOALS_SCORED_COPY") &&
    MATCH_DAY_GOALS_SCORED_COPY.includes(
      "selected Match Day Climate Projects"
    ) &&
    MATCH_DAY_GOALS_SCORED_COPY.includes("Match-Sponsorship") &&
    MATCH_DAY_PROJECTS_RECORD_COPY.includes(
      "saved in a Folder for your Record"
    ) &&
    chosenPanel.includes("MATCH_DAY_PROJECTS_RECORD_LABEL") &&
    readFileSync("app/lib/lead-sponsor-home.ts", "utf8").includes(
      "Match Day carbon footprint offset"
    ) &&
    readFileSync("app/sponsor/calendar/page.tsx", "utf8").includes(
      'id="match-day-lock-in"'
    ) &&
    offers.includes("hydrateClubSponsorsFromSigned") &&
    clubDash.includes("hydrateClubSponsorsFromSigned") &&
    matchDay.includes("publishChosenProjectsToSponsorsAndFans") &&
    matchDay.includes("attachProjectsToClubSponsorships") &&
    matchDay.includes("occupyingLeadBrandNames") &&
    matchDay.includes("leadNames.length === 0") &&
    !matchDay.includes("leadNames.length ? leadNames : undefined") &&
    offers.includes("stampOfferWithLockedUploads") &&
    offers.includes("resolveClubForSponsor") &&
    offers.includes("findStoredClubSelectionByName") &&
    !offers.includes("isDemoClubName(offer.clubName)") &&
    offersPage.includes("MATCH_DAY_PROJECTS_WAITING_COPY") &&
    offersPage.includes("MATCH_DAY_PROJECTS_BEFORE_SIGNOFF_COPY") &&
    !offersPage.includes("you do not wait for this list") &&
    offersPage.includes("appear here automatically") &&
    readFileSync("apply-match-day-carbon-offset.mjs", "utf8").includes(
      "app/lib/match-day-carbon-offset.ts"
    ) &&
    readFileSync("app/preview/match-day-carbon-offset/page.tsx", "utf8").includes(
      "MATCH_DAY_GOALS_SCORED_COPY"
    ) &&
    readFileSync("app/preview/match-day-carbon-offset/page.tsx", "utf8").indexOf(
      "Signed sponsorships"
    ) <
      readFileSync("app/preview/match-day-carbon-offset/page.tsx", "utf8").indexOf(
        "{MATCH_DAY_PROJECTS_RECORD_LABEL}"
      ),
  "Wallet sign-off, SD login occupancy, and SD-chosen five publish are wired through"
);

if (failures.length > 0) {
  console.error("verify-match-day-carbon-offset failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("verify-match-day-carbon-offset: ok");
