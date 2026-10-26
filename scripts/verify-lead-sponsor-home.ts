import { readFileSync } from "fs";
import {
  LEAD_ACCEPT_LABEL,
  LEAD_APPROVED_SECTION_ID,
  LEAD_APPROVED_TITLE,
  LEAD_AWAITING_SECTION_ID,
  LEAD_AWAITING_TITLE,
  LEAD_CIST_SECTION_ID,
  LEAD_CIST_TITLE,
  LEAD_PAID_EMPTY,
  LEAD_PAID_INTRO,
  LEAD_PAID_SECTION_ID,
  LEAD_PAID_TITLE,
  clubsNeedingChosenProjects,
  leadSponsorHomeSections,
} from "../app/lib/lead-sponsor-home";
import type { FolderOffer, SignedSponsorship } from "../app/lib/sponsor-dashboard";
import { SPONSOR_CALENDAR_PATH, sponsorOfferSignOffPath } from "../app/lib/routes";

const failures: string[] = [];

function assert(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

const pending: FolderOffer = {
  id: "mfc-upload",
  clubId: "middlesbrough-demo",
  clubName: "Middlesbrough",
  headline: "Middlesbrough Match Day",
  matchTitle: "Middlesbrough v West Bromwich Albion",
  matchDate: "2026-11-07",
  projectIds: ["gss-mfc", "cookstoves"],
  projects: [
    { id: "gss-mfc", name: "Global Schools Solar" },
    { id: "cookstoves", name: "Clean Cookstoves Kenya" },
  ],
  postedAt: "2026-10-25T14:00:00.000Z",
};

const heartsSigned: SignedSponsorship = {
  offer: {
    id: "hearts-offer",
    clubId: "hearts-demo",
    clubName: "Hearts",
    headline: "Hearts v Aberdeen",
    matchTitle: "Hearts v Aberdeen",
    matchDate: "2026-10-31",
    projectIds: ["lauriston", "spoke"],
    projects: [
      { id: "lauriston", name: "Lauriston Agroecology Farm" },
      { id: "spoke", name: "Wee Spoke Hub" },
    ],
    postedAt: "2026-10-12T12:00:00.000Z",
    sponsorshipAmountGbp: 2300,
  },
  signature: {
    id: "sig-hearts",
    offerId: "hearts-offer",
    sponsorId: "amex",
    signerName: "American Express",
    brandName: "American Express",
    acceptedTerms: true,
    signedAt: "2026-10-12T17:36:00.000Z",
  },
};

const arsenalSigned: SignedSponsorship = {
  offer: {
    id: "arsenal-offer",
    clubId: "arsenal-demo",
    clubName: "Arsenal",
    headline: "Manchester City v Arsenal",
    matchTitle: "Manchester City v Arsenal",
    matchDate: "2026-11-21",
    projectIds: ["gss", "islington"],
    projects: [
      { id: "gss", name: "Global Schools Solar", fundedGbp: 2300 },
      { id: "islington", name: "Islington Tree Canopy", fundedGbp: 0.2 },
    ],
    postedAt: "2026-10-12T12:00:00.000Z",
    sponsorshipAmountGbp: 2300,
  },
  signature: {
    id: "sig-arsenal",
    offerId: "arsenal-offer",
    sponsorId: "amex",
    signerName: "American Express",
    brandName: "American Express",
    acceptedTerms: true,
    signedAt: "2026-10-12T18:10:00.000Z",
  },
};

const sections = leadSponsorHomeSections({
  pending: [pending],
  signed: [heartsSigned, arsenalSigned],
  votedByClub: {
    "arsenal-demo": [
      { id: "gss", fundedGbp: 2300 },
      { id: "islington", fundedGbp: 0.2 },
    ],
  },
  folder: [
    {
      key: "amex|arsenal|manchester city v arsenal",
      brandName: "American Express",
      offerId: "arsenal-offer",
      clubId: "arsenal-demo",
      clubName: "Arsenal",
      matchTitle: "Manchester City v Arsenal",
      matchDate: "2026-11-21",
      headline: "Manchester City v Arsenal",
      status: "paid",
      signedAt: "2026-10-12T18:10:00.000Z",
      paidAt: "2026-10-12T18:40:00.000Z",
      signerName: "American Express",
      projects: [],
      sponsorshipAmountGbp: 2300,
      gbpPerGoal: 4000,
      maxAmount: 7500,
    },
  ],
});

assert(
  sections.awaiting.length === 1 &&
    sections.awaiting[0]?.clubName === "Middlesbrough" &&
    sections.awaiting[0]?.projects.map((row) => row.name).join("|") ===
      "Global Schools Solar|Clean Cookstoves Kenya" &&
    sections.awaiting[0]?.actionHref === sponsorOfferSignOffPath("mfc-upload") &&
    sections.awaiting[0]?.actionLabel === LEAD_ACCEPT_LABEL,
  "SD-uploaded Match Day Climate Projects sit in awaiting acceptance & approval"
);

assert(
  sections.approved.length === 1 &&
    sections.approved[0]?.clubName === "Hearts" &&
    sections.approved[0]?.projects.length === 2 &&
    sections.approved[0]?.projects.every((row) => row.fundedGbp === 0),
  "Signed Climate Projects with no payment sit in approved"
);

assert(
  sections.paid.length === 1 &&
    sections.paid[0]?.clubName === "Arsenal" &&
    sections.paid[0]?.projects.some((row) => row.name === "Global Schools Solar") &&
    sections.paid[0]?.projects.some((row) => row.fundedGbp === 2300),
  "Fan-funded Climate Projects sit in paid"
);

const fromChosen = leadSponsorHomeSections({
  pending: [],
  signed: [],
  chosenByClub: {
    Middlesbrough: [
      { id: "gss-mfc", name: "Global Schools Solar" },
      { id: "cookstoves", name: "Clean Cookstoves Kenya" },
    ],
  },
  lock: {
    brandKey: "american express",
    clubName: "Middlesbrough",
    matchLabel: "Championship Match",
    fixtureName: "Middlesbrough v West Bromwich Albion",
    fixtureDate: "2026-11-07",
    lockedAt: "2026-10-25T12:00:00.000Z",
  },
});

assert(
  fromChosen.awaiting[0]?.projects.length === 2 &&
    fromChosen.awaiting[0]?.matchTitle ===
      "Middlesbrough v West Bromwich Albion" &&
    fromChosen.approved.length === 0 &&
    fromChosen.paid.length === 0,
  "A Club Sustainability Director upload appears in (a) before the Lead signs"
);

const stillApproved = leadSponsorHomeSections({
  pending: [
    {
      ...heartsSigned.offer,
      id: "hearts-offer-republished",
    },
  ],
  signed: [heartsSigned],
  chosenByClub: {
    Hearts: heartsSigned.offer.projects,
  },
  lock: {
    brandKey: "american express",
    clubName: "Hearts",
    matchLabel: "Premiership Match",
    fixtureName: "Hearts v Aberdeen",
    lockedAt: "2026-10-12T12:00:00.000Z",
    fundingLockedAt: "2026-10-12T12:30:00.000Z",
    commitmentFeeGbp: 2300,
  },
});

assert(
  stillApproved.awaiting.length === 0 &&
    stillApproved.approved[0]?.clubName === "Hearts" &&
    stillApproved.paid.length === 0,
  "Accept & approve empties awaiting and moves the list to approved, even if the wallet was already locked"
);

const walletPaid = leadSponsorHomeSections({
  pending: [],
  signed: [heartsSigned],
  folder: [
    {
      key: "amex|hearts|hearts v aberdeen",
      brandName: "American Express",
      offerId: "hearts-offer",
      clubId: "hearts-demo",
      clubName: "Hearts",
      matchTitle: "Hearts v Aberdeen",
      matchDate: "2026-10-31",
      headline: "Hearts v Aberdeen",
      status: "paid",
      signedAt: "2026-10-12T17:36:00.000Z",
      paidAt: "2026-10-12T18:00:00.000Z",
      signerName: "American Express",
      projects: heartsSigned.offer.projects.map((project) => ({
        id: project.id,
        name: project.name,
        description: null,
        country: null,
        estimated_co2: null,
        fundedGbp: 0,
      })),
      sponsorshipAmountGbp: 2300,
      gbpPerGoal: null,
      maxAmount: null,
    },
  ],
});

assert(
  walletPaid.awaiting.length === 0 &&
    walletPaid.approved.length === 0 &&
    walletPaid.paid[0]?.clubName === "Hearts" &&
    walletPaid.paid[0]?.projects.length === 2,
  "After the Lead pays, approved Projects move into the paid master folder and stay there"
);

assert(
  clubsNeedingChosenProjects({
    pending: [pending],
    signed: [heartsSigned],
    lock: { clubName: "Arsenal" },
  }).join("|") === "Middlesbrough|Hearts|Arsenal",
  "Chosen Climate Projects are loaded for pending, signed, and locked clubs"
);

const dashboard = readFileSync("app/sponsor/dashboard/page.tsx", "utf8");
const home = readFileSync("app/components/sponsor/LeadSponsorHome.tsx", "utf8");
const lib = readFileSync("app/lib/lead-sponsor-home.ts", "utf8");
const preview = readFileSync(
  "app/preview/lead-sponsor-dashboard/page.tsx",
  "utf8"
);
const calendar = readFileSync("app/sponsor/calendar/page.tsx", "utf8");

assert(
  dashboard.includes("LeadSponsorHome") &&
    dashboard.includes("loadClubChosenClimateProjects") &&
    dashboard.includes("clubsNeedingChosenProjects") &&
    !dashboard.includes("SignedSponsorHome") &&
    !dashboard.includes("MatchDayLockIn") &&
    !dashboard.includes("SportingCalendarBoard") &&
    !dashboard.includes("Open Climate Sponsorship Wallet") &&
    !dashboard.includes("SPONSOR_NEW_SPONSORSHIP_LABEL") &&
    dashboard.includes("isLeadSponsorHome(sponsorName, { jobTitle })") &&
    dashboard.indexOf("loadSponsorFolder") < dashboard.indexOf("setLoading(false)"),
  "The Lead dashboard always renders the four-section home, not calendar/lock-in/wallet"
);

assert(
  LEAD_PAID_INTRO.includes("Master folder") &&
    LEAD_PAID_EMPTY.includes("master folder") &&
    home.includes("LEAD_PAID_INTRO"),
  "Paid Climate Projects are a master folder of every list the Lead has backed"
);

assert(
  readFileSync("app/services/sponsor-offers.service.ts", "utf8").includes(
    "signedForMatch"
  ) &&
    readFileSync("app/services/sponsor-offers.service.ts", "utf8").includes(
      "recordLeadMatchApproved"
    ) &&
    readFileSync("app/services/climate-sponsors.service.ts", "utf8").includes(
      "recordLeadMatchPaid"
    ),
  "Sign-off records approved lists and does not republish them as awaiting uploads"
);

assert(
  dashboard.includes("isNewSponsorshipRequest") &&
    dashboard.includes("SPONSOR_CALENDAR_PATH") &&
    calendar.includes("MatchDayLockIn"),
  "New Sponsorship still opens Match Day Lock-In on the Calendar tab"
);

assert(
  home.includes("LEAD_AWAITING_TITLE") &&
    home.includes("LEAD_APPROVED_TITLE") &&
    home.includes("LEAD_PAID_TITLE") &&
    home.includes("SponsorCistTable") &&
    home.includes("LEAD_CIST_TITLE") &&
    home.includes("Section (d)") &&
    home.includes('letter="a"') &&
    home.includes('letter="b"') &&
    home.includes('letter="c"') &&
    !home.includes("SportingCalendarBoard") &&
    !home.includes("FundedClimateProjectsList") &&
    !home.includes("MatchDayLockIn"),
  "Lead home shows only awaiting, approved, paid, and CIST"
);

assert(
  LEAD_AWAITING_SECTION_ID === "awaiting-acceptance" &&
    LEAD_APPROVED_SECTION_ID === "approved-projects" &&
    LEAD_PAID_SECTION_ID === "paid-projects" &&
    LEAD_CIST_SECTION_ID === "cist" &&
    LEAD_CIST_TITLE === "Climate Impact Sponsors Table (CIST)" &&
    lib.includes("Match Day carbon footprint offset"),
  "Section ids and CIST title stay stable for the Lead dashboard"
);

assert(
  preview.includes("LeadSponsorHome") &&
    preview.includes("Middlesbrough") &&
    preview.includes("Hearts v Aberdeen") &&
    preview.includes("Manchester City v Arsenal") &&
    preview.includes("American Express"),
  "The preview shows populated (a) (b) (c) and CIST for a Lead Climate Sponsor"
);

assert(
  sponsorOfferSignOffPath("mfc-upload").includes("mfc-upload") &&
    SPONSOR_CALENDAR_PATH === "/sponsor/calendar",
  "Accept & approve opens sign-off; lock-in stays on Calendar"
);

const localHome = readFileSync("app/sponsor/local/page.tsx", "utf8");
assert(
  localHome.includes("LocalSignedSponsorHome") &&
    !localHome.includes("LeadSponsorHome"),
  "Local Business Climate Sponsors keep the LOBI home"
);

if (failures.length > 0) {
  console.error("verify-lead-sponsor-home failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("verify-lead-sponsor-home: ok");
