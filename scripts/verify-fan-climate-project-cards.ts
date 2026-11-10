import { readFileSync } from "fs";
import {
  FAN_CLIMATE_PROJECT_PAGE_COUNT,
  FUND_IT_ALLOCATED_LABEL,
  FUND_IT_HOW_IT_WORKS,
  FUND_IT_HOW_IT_WORKS_TITLE,
  climateProjectPageLabel,
  howItWorksHeadings,
  pairFanClimateProjectPages,
  readyToAllocateCopy,
} from "../app/lib/fan-climate-project-cards";
import {
  LOCAL_CHOOSE_ONE_PROJECT_COPY,
  LOCAL_COMMIT_AMOUNT_LABEL,
} from "../app/lib/local-sponsor";
import {
  allocateWalletVote,
  createLeadWallet,
  createLocalWallet,
  remainingGbp,
} from "../app/lib/sponsor-wallet";
import { FEATURED_PROJECT_NAME } from "../app/lib/sccan-catalog";

const failures: string[] = [];
function assert(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

assert(FAN_CLIMATE_PROJECT_PAGE_COUNT === 5, "Fans page five Climate Projects");
assert(
  climateProjectPageLabel(0) === "1/5" && climateProjectPageLabel(4) === "5/5",
  "Pages are labelled 1/5 through 5/5"
);
assert(
  FUND_IT_HOW_IT_WORKS_TITLE === "How it works" &&
    howItWorksHeadings().join("|") ===
      "Fan selects FUND-IT|Fan confirms £0.20|Fan sees confirmation",
  "How it works shows only the three FUND-IT headings"
);
assert(
  FUND_IT_HOW_IT_WORKS.every((step) => step.backend.length > 20),
  "Backend allocation text is stored but not required on the card"
);

const pager = readFileSync("app/components/fan/FanClimateProjectPager.tsx", "utf8");
assert(
  pager.includes("FUND_IT_HOW_IT_WORKS_TITLE") &&
    pager.includes("step.heading") &&
    !pager.includes("step.backend") &&
    !pager.includes("{number}. {step.heading}"),
  "How it works keeps the circle numbers and does not repeat 1. 2. 3. in the headings"
);
assert(
  pager.includes("fan-pager-shade-v1") &&
    pager.includes("ring-4 ring-emerald-400") &&
    pager.includes("shadow-[0_0_0_8px_rgba(167,243,208,0.95)]"),
  "The active 1/5 page has a mint shade around the highlighted number"
);
assert(
  pager.includes("fundItButtonLabel") &&
    pager.includes("Confirm") &&
    pager.includes("FUND_IT_ALLOCATED_LABEL"),
  "FUND-IT is select, then confirm £0.20, then Allocated"
);
assert(
  readyToAllocateCopy("Community Rooftop Solar").includes("Community Rooftop Solar") &&
    readyToAllocateCopy("Community Rooftop Solar").includes("not a payment from your bank account"),
  "Ready to allocate copy names the project and is not a bank payment"
);

const numbered = [
  { id: "gss", name: FEATURED_PROJECT_NAME, number: 1, fundedGbp: 0, votesReceived: 0 },
  { id: "rooftop", name: "Community Rooftop Solar", number: 2, fundedGbp: 0, votesReceived: 0 },
  { id: "energy", name: "Local Community Energy", number: 3, fundedGbp: 0, votesReceived: 0 },
  { id: "river", name: "Riverside Restoration", number: 4, fundedGbp: 0, votesReceived: 0 },
  { id: "heat", name: "Shared Clean Heat Loop", number: 5, fundedGbp: 0, votesReceived: 0 },
];
const pages = pairFanClimateProjectPages({
  numbered,
  details: numbered.map((row) => ({ id: row.id, name: row.name })),
  lead: {
    brandName: "American Express",
    kind: "lead",
    remainingGbp: 9599.8,
  },
  locals: [
    {
      brandName: "Scotmid Coop",
      kind: "local",
      remainingGbp: 1149.8,
      sponsoredProjectId: "rooftop",
      sponsoredProjectName: "Community Rooftop Solar",
    },
  ],
});
assert(pages.length === 5, "Pairing always returns five pages");
assert(
  pages[0]?.kind === "featured" &&
    pages[0]?.sponsor?.brandName === "American Express" &&
    pages[0]?.project?.name === FEATURED_PROJECT_NAME,
  "Page 1/5 is Global Schools Solar with the Lead Climate Sponsor"
);
assert(
  pages[1]?.kind === "local" &&
    pages[1]?.project?.name === "Community Rooftop Solar" &&
    pages[1]?.sponsor?.brandName === "Scotmid Coop",
  "The Local Business Climate Sponsor who chose a project is paired with that project"
);
assert(
  pages[2]?.sponsor == null && pages[3]?.sponsor == null,
  "Unchosen local projects wait for a Local Business Climate Sponsor"
);

const locked = createLocalWallet({
  clubName: "Everton",
  brandName: "Scotmid Coop",
  sponsorshipGbp: 1150,
  sponsoredProjectId: "rooftop",
  sponsoredProjectName: "Community Rooftop Solar",
});
const voted = allocateWalletVote({
  wallet: locked,
  projects: numbered,
  projectNumber: 4,
});
assert(
  voted.ok && voted.ok && voted.project.id === "rooftop",
  "A local FUND-IT is locked to the Climate Project that sponsor committed to"
);
assert(
  voted.ok && remainingGbp(voted.wallet) === 1149.8,
  "The locked FUND-IT still takes £0.20 from the local Carbon Wallet"
);

const leadWallet = createLeadWallet({
  clubName: "Everton",
  brandName: "American Express",
  commitmentFeeGbp: 9600,
});
assert(leadWallet.kind === "lead", "Lead wallets stay on the featured page");

const votePage = readFileSync("app/dashboard/supporter/vote/page.tsx", "utf8");
assert(
  votePage.includes("SUPPORTER_CAMPAIGN_PATH") &&
    votePage.includes("window.location.replace") &&
    !votePage.includes("Projects Voted for") &&
    !votePage.includes("Climate Project list"),
  "The old Climate Projects URL opens My S4P"
);
assert(
  readFileSync("app/components/fan/FanClimateProjectPager.tsx", "utf8").includes(
    "InviteFriendsRemainingFunds"
  ) &&
    readFileSync("app/components/fan/FanClimateProjectPager.tsx", "utf8").includes(
      "FAN_CLIMATE_AUTO_ADVANCE_MS"
    ),
  "The 1/5 pager auto-advances after FUND-IT and shows Invite friends on 5/5"
);

const wallet = readFileSync("app/sponsor/wallet/page.tsx", "utf8");
assert(
  wallet.includes("LOCAL_CHOOSE_ONE_PROJECT_COPY") &&
    wallet.includes("selectable={kind === \"local\"}") &&
    wallet.includes("sponsoredProjectId: chosenProject.id"),
  "Local Business Climate Sponsors must pick 1 Climate Project before committing cash"
);
assert(
  LOCAL_CHOOSE_ONE_PROJECT_COPY.includes("1 Climate Project") &&
    LOCAL_COMMIT_AMOUNT_LABEL.includes("commit to this Project"),
  "Local operational copy is choose 1 project and the commitment amount"
);

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("Fan Climate Projects live on My S4P as 1/5 cards with How it works headings and paired sponsors.");
