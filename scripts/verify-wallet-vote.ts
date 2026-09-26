import { readFileSync } from "fs";
import {
  allocateWalletVote,
  createLeadWallet,
  createLocalWallet,
  DEFAULT_WALLET_VOTE_GBP,
  formatWalletGbp,
  LOCAL_MANAGEMENT_FEE_RATE,
  localWalletTopUp,
  remainingGbp,
} from "../app/lib/sponsor-wallet";
import {
  buildProjectsFile,
  buildSponsorsFile,
  canSubmitMatchDayFolder,
  climateProjectsFileName,
  emptyMatchDayFolder,
  MATCH_DAY_FOLDER_NAME,
  saveProjectsIntoFolder,
  saveSponsorsIntoFolder,
  sponsorRowsFromWallets,
  sponsorsFileName,
  submitMatchDayFolder,
} from "../app/lib/match-day-folder";

const failures: string[] = [];

function assert(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

assert(DEFAULT_WALLET_VOTE_GBP === 0.1, "Each vote is worth £0.10");
assert(LOCAL_MANAGEMENT_FEE_RATE === 0.1, "Local wallets add a 10% management fee");

const topUp = localWalletTopUp(750);
assert(topUp.sponsorshipGbp === 750, "£750 stays as spendable cash in the wallet");
assert(topUp.managementFeeGbp === 75, "10% of £750 is the £75 management fee");
assert(topUp.paidGbp === 825, "The local sponsor pays £750 + 10% = £825");

const topCellar = createLocalWallet({
  clubName: "Hibernian",
  brandName: "Top Cellar",
  sponsorshipGbp: 750,
});
assert(
  remainingGbp(topCellar) === 750,
  "Top Cellar's wallet indicates £750 before any vote"
);

const amex = createLeadWallet({
  clubName: "Hibernian",
  brandName: "American Express",
  commitmentFeeGbp: 1000,
  gbpPerGoal: 3000,
});
assert(
  remainingGbp(amex) === 1000,
  "A Lead Climate Project Sponsor deposits the Commitment Fee on Day 1"
);
assert(
  remainingGbp({ ...amex, goalsScored: 2 }) === 7000,
  "Goals-scored Sponsorship Cash is added for each goal the sponsored team scores"
);

const projects = [
  { id: "gss", name: "Global Schools Solar", number: 1, fundedGbp: 0, votesReceived: 0 },
  { id: "wee", name: "Wee Spoke Hub", number: 2, fundedGbp: 0, votesReceived: 0 },
  { id: "retrofit", name: "Edinburgh Building Retrofit Collective", number: 3, fundedGbp: 0, votesReceived: 0 },
  { id: "porty", name: "Porty Community Energy", number: 4, fundedGbp: 0, votesReceived: 0 },
  { id: "craigshill", name: "Growing Together Craigshill", number: 5, fundedGbp: 0, votesReceived: 0 },
];

const voted = allocateWalletVote({
  wallet: topCellar,
  projects,
  projectNumber: 2,
});
assert(voted.ok, "Inserting 2 next to Top Cellar and pressing VOTE succeeds");
if (voted.ok) {
  assert(
    remainingGbp(voted.wallet) === 749.9,
    "Top Cellar's wallet then displays £749.90 Remaining"
  );
  assert(
    voted.project.number === 2 && voted.project.fundedGbp === 0.1,
    "Project 2 displays that it has received £0.10 in Climate funding"
  );
  assert(
    formatWalletGbp(remainingGbp(voted.wallet)) === "£749.90",
    "Remaining cash is shown with pence"
  );
}

const blocked = allocateWalletVote({
  wallet: { ...topCellar, allocatedGbp: 750 },
  projects,
  projectNumber: 2,
});
assert(!blocked.ok, "A vote is refused when the wallet has no cash remaining");

assert(
  sponsorsFileName("2026-10-10") === "Sponsors File 10th October 2026",
  "The Sponsors File uses the match date in the filename"
);
assert(
  climateProjectsFileName("2026-10-10") ===
    "Climate Projects File 10th October 2026",
  "The Climate Projects File uses the match date in the filename"
);

let folder = emptyMatchDayFolder({
  clubId: "hibs",
  clubName: "Hibernian",
  matchDate: "2026-10-10",
});
assert(!canSubmitMatchDayFolder(folder), "SUBMIT stays off until both files are saved");
folder = saveSponsorsIntoFolder(
  folder,
  buildSponsorsFile({
    matchDate: "2026-10-10",
    sponsors: sponsorRowsFromWallets([amex, topCellar]),
  })
);
folder = saveProjectsIntoFolder(
  folder,
  buildProjectsFile({ matchDate: "2026-10-10", projects })
);
assert(canSubmitMatchDayFolder(folder), "Both Match-Day files can be submitted");
folder = submitMatchDayFolder(folder, "2026-10-07T15:00:00.000Z");
assert(
  Boolean(folder.submittedAt) &&
    folder.sponsorsFile?.fileName === "Sponsors File 10th October 2026" &&
    folder.projectsFile?.fileName === "Climate Projects File 10th October 2026",
  "SUBMIT stamps the Match-Day folder so fans can see both files"
);

const clubPage = readFileSync("app/club/dashboard/page.tsx", "utf8");
assert(clubPage.includes("MatchDayFolderPanel"), "The club dashboard has a Match-Day folder");
assert(clubPage.includes("SUBMIT"), "The club dashboard posts the two files with SUBMIT");

const fanPage = readFileSync("app/supporter/dashboard/page.tsx", "utf8");
assert(fanPage.includes("MatchDayWalletVote"), "My S4P lets fans take cash from a sponsor wallet");
assert(!fanPage.includes("Choose three"), "Fans no longer pick 3 of 5 Climate Projects");

const votePage = readFileSync("app/dashboard/supporter/vote/page.tsx", "utf8");
assert(votePage.includes("MatchDayWalletVote"), "Climate Projects uses wallet votes");
assert(votePage.includes("Projects Voted for"), "The Hibernian box is titled Projects Voted for");

const walletPage = readFileSync("app/sponsor/wallet/page.tsx", "utf8");
assert(
  walletPage.includes("ClimateSponsorshipWallet"),
  "Sponsors have a Climate Sponsorship Wallet page"
);

const localPage = readFileSync("app/sponsor/local/register/page.tsx", "utf8");
assert(localPage.includes("10%"), "Local registration states the 10% management fee");

assert(MATCH_DAY_FOLDER_NAME === "Match-Day", "The folder is called Match-Day");

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(
  "Wallet votes move £0.10 from a sponsor wallet into a numbered Climate Project; Match-Day files submit as Sponsors File and Climate Projects File."
);
