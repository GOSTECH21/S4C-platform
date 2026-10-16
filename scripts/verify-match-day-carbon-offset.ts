import { readFileSync } from "fs";
import {
  carbonOffsetHeadline,
  chosenProjectsReadyForMatchDay,
  MATCH_DAY_PROJECTS_RECORD_LABEL,
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
    shouldPublishChosenMatchDayProjects({
      projectCount: 5,
      inboundSponsorCount: 1,
    }) &&
    !shouldPublishChosenMatchDayProjects({
      projectCount: 5,
      inboundSponsorCount: 0,
    }),
  "The SD's five go live for sponsors and fans only on a sponsored Match Day"
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
const clubDash = readFileSync("app/club/dashboard/page.tsx", "utf8");
const matchDay = readFileSync("app/services/club-match-day.service.ts", "utf8");
assert(
  wallet.includes("ensureCarbonOffsetSponsorshipOffer") &&
    dashboard.includes("Match Day carbon footprint offset") &&
    dashboard.includes("MATCH_DAY_GOALS_SCORED_COPY") &&
    readFileSync("app/lib/match-day-carbon-offset.ts", "utf8").includes(
      "You are sponsoring this Club's Match Day Goals-scored to help offset their carbon footprint."
    ) &&
    (dashboard.includes("The club's 5 chosen Climate Projects") ||
      dashboard.includes("The club&apos;s 5 chosen Climate Projects")) &&
    dashboard.indexOf('id="match-day-lock-in"') <
      dashboard.indexOf("id={SPONSOR_RECEIVE_SECTION_ID}") &&
    offers.includes("hydrateClubSponsorsFromSigned") &&
    clubDash.includes("hydrateClubSponsorsFromSigned") &&
    matchDay.includes("publishChosenProjectsToSponsorsAndFans") &&
    matchDay.includes("attachProjectsToClubSponsorships") &&
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
