import { readFileSync } from "fs";
import {
  allocateWalletVote,
  createLeadWallet,
  createLocalWallet,
  DEFAULT_WALLET_VOTE_GBP,
  FUND_IT_LABEL,
  LEAD_WALLET_VOTE_GBP,
  LOCAL_MANAGEMENT_FEE_RATE,
  localWalletTopUp,
  remainingGbp,
  walletVoteAmount,
  totalAllocatedGbp,
  formatWalletGbp,
} from "../app/lib/sponsor-wallet";
import {
  buildProjectsFile,
  buildSponsorsFile,
  canSubmitMatchDayFolder,
  climateProjectsFileName,
  emptyMatchDayFolder,
  isMatchDayFolderVisible,
  MATCH_DAY_FOLDER_NAME,
  saveProjectsIntoFolder,
  saveSponsorsIntoFolder,
  sponsorRowsFromWallets,
  sponsorsFileName,
  submitMatchDayFolder,
} from "../app/lib/match-day-folder";
import { MS_PER_DAY } from "../app/lib/voting-window";
import {
  fanInviteRegisterPath,
  mergeNumberedFunding,
} from "../app/lib/climate-funding";
import { mergePlatformStats, formatFundingGbp } from "../app/lib/platform-stats";
import { withWalletTakes } from "../app/lib/climate-wallet-takes";

const failures: string[] = [];

function assert(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

assert(DEFAULT_WALLET_VOTE_GBP === 0.2, "Each FUND-IT is worth £0.20");
assert(
  LEAD_WALLET_VOTE_GBP === DEFAULT_WALLET_VOTE_GBP,
  "Lead and Local Business Climate Sponsors use the same £0.20 FUND-IT"
);
assert(LOCAL_MANAGEMENT_FEE_RATE === 0.1, "Local wallets add a 10% management fee");
assert(FUND_IT_LABEL === "FUND-IT", "The action tab is labelled FUND-IT");

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
assert(walletVoteAmount(topCellar) === 0.2, "A local FUND-IT takes £0.20");

const amex = createLeadWallet({
  clubName: "Hibernian",
  brandName: "American Express",
  commitmentFeeGbp: 3000,
  gbpPerGoal: 3000,
});
assert(
  remainingGbp(amex) === 3000,
  "American Express deposits the Commitment Fee into the Carbon Wallet"
);
assert(
  remainingGbp({ ...amex, goalsScored: 1 }) === 6000,
  "The Carbon Wallet increases when the sponsored team scores"
);
assert(walletVoteAmount(amex) === 0.2, "An Amex FUND-IT takes £0.20");

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
assert(voted.ok, "Inserting 2 next to Top Cellar and pressing FUND-IT succeeds");
if (voted.ok) {
  assert(
    remainingGbp(voted.wallet) === 749.8,
    "Top Cellar's wallet then displays £749.80 Remaining"
  );
  assert(
    voted.project.number === 2 && voted.project.fundedGbp === 0.2,
    "Project 2 displays that it has received £0.20 in Climate funding"
  );
  assert(
    formatWalletGbp(remainingGbp(voted.wallet)) === "£749.80",
    "Remaining cash is shown with pence"
  );
}

const leadVoted = allocateWalletVote({
  wallet: amex,
  projects,
  projectNumber: 2,
});
assert(leadVoted.ok, "Inserting 2 in the Puma Checkbox and pressing FUND-IT succeeds");
if (leadVoted.ok) {
  assert(
    remainingGbp(leadVoted.wallet) === 2999.8,
    "Amex Carbon Wallet then displays £2,999.80"
  );
  assert(
    leadVoted.project.number === 2 && leadVoted.project.fundedGbp === 0.2,
    "Project 2 receives £0.20 from the Amex Carbon Wallet"
  );
  assert(
    totalAllocatedGbp([leadVoted.wallet]) === 0.2,
    "Allocated Carbon Wallet cash is the amount taken by fans"
  );
  assert(
    formatFundingGbp(
      withWalletTakes(mergePlatformStats({ fundingMobilisedGbp: 1816000 }), 0.2)
        .fundingMobilisedGbp
    ) === "£0.20",
    "The homepage bar becomes £0.20 after a £0.20 take from a Carbon Wallet"
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
assert(
  isMatchDayFolderVisible(folder, "2026-10-10T15:00:00.000Z"),
  "Posted Climate Projects stay on My S4P during the 5-day window"
);
assert(
  !isMatchDayFolderVisible(
    folder,
    new Date(new Date("2026-10-07T15:00:00.000Z").getTime() + 5 * MS_PER_DAY + 1)
  ),
  "Posted Climate Projects disappear 5 days after they are uploaded"
);

const clubPage = readFileSync("app/club/dashboard/page.tsx", "utf8");
assert(clubPage.includes("MatchDayFolderPanel"), "The club dashboard has a Match-Day folder");
assert(clubPage.includes("SUBMIT"), "The club dashboard posts the two files with SUBMIT");

const fanPage = readFileSync("app/supporter/dashboard/page.tsx", "utf8");
assert(
  fanPage.includes("ClimateProjectSponsors"),
  "My S4P lets fans take cash from a Carbon Wallet"
);
assert(
  fanPage.includes("Climate Projects List"),
  "My S4P uses the Climate Projects List heading"
);
assert(
  !fanPage.includes("Climate Project list"),
  "My S4P no longer duplicates Climate Project list"
);
assert(
  fanPage.includes("showSponsors={false}"),
  "My S4P Climate Projects List has no sponsor logo or name"
);
assert(!fanPage.includes("MatchDayWalletVote"), "My S4P no longer uses the mixed wallet list");
assert(!fanPage.includes("TodaysClimateSponsors"), "My S4P does not mix local logos into the Amex bar");
assert(!fanPage.includes("Choose three"), "Fans no longer pick 3 of 5 Climate Projects");

const sponsorsUi = readFileSync("app/components/fan/ClimateProjectSponsors.tsx", "utf8");
assert(
  sponsorsUi.includes("Carbon Wallet") &&
    sponsorsUi.includes(">Checkbox<") &&
    !sponsorsUi.includes("Checkbox 1") &&
    !sponsorsUi.includes("Checkbox 2") &&
    sponsorsUi.includes("FUND_IT_LABEL") &&
    !sponsorsUi.includes(">Vote<"),
  "Each Carbon Wallet has one Checkbox and a FUND-IT tab"
);
assert(
  sponsorsUi.includes("fundItCopy") &&
    readFileSync("app/lib/sponsor-wallet.ts", "utf8").includes(
      "Choose a Climate Project Number; Insert it into the Checkbox next to any Climate Wallet; Press"
    ) &&
    readFileSync("app/lib/sponsor-wallet.ts", "utf8").includes(
      "goes from Wallet to Project"
    ),
  "Local Business Climate Sponsors use the single FUND-IT instruction"
);
assert(
  sponsorsUi.includes("Invite friends") && sponsorsUi.includes("Already used"),
  "Fans can invite friends to drain remaining wallets and only vote once per sponsor"
);

const kept = mergeNumberedFunding(
  [
    { id: "wee", name: "Wee Spoke Hub", number: 2, fundedGbp: 0, votesReceived: 0 },
  ],
  [
    { id: "wee", name: "Wee Spoke Hub", number: 2, fundedGbp: 0.7, votesReceived: 3 },
  ]
);
assert(
  kept[0]?.fundedGbp === 0.7,
  "Received amounts stay cumulative and are not erased on reload"
);
assert(
  fanInviteRegisterPath("hibs", "Hibernian").includes("club=hibs"),
  "The invite link sends friends to fan registration for this club"
);

const votePage = readFileSync("app/dashboard/supporter/vote/page.tsx", "utf8");
assert(votePage.includes("ClimateProjectSponsors"), "Climate Projects uses Carbon Wallet votes");
assert(votePage.includes("Projects Voted for"), "The Hibernian box is titled Projects Voted for");
assert(
  votePage.includes("Climate Project list"),
  "Climate Projects still shows the numbered Climate Project list"
);
assert(
  votePage.includes("formatWalletGbp(project.fundedGbp)"),
  "Projects Voted for and Climate Project list show the cumulative Received amount"
);

const walletPage = readFileSync("app/sponsor/wallet/page.tsx", "utf8");
assert(
  walletPage.includes("ClimateSponsorshipWallet"),
  "Sponsors have a Climate Sponsorship Wallet page"
);

const localPage = readFileSync("app/sponsor/local/register/page.tsx", "utf8");
assert(localPage.includes("10%"), "Local registration states the 10% management fee");

assert(MATCH_DAY_FOLDER_NAME === "Match-Day", "The folder is called Match-Day");

const preview = readFileSync("app/preview/my-s4p/page.tsx", "utf8");
assert(
  preview.includes("Climate Projects List") &&
    preview.includes("American Express") &&
    preview.includes("showSponsors={false}"),
  "The My S4P preview shows numbered Climate Projects without sponsor branding"
);

const folderService = readFileSync("app/services/match-day-folder.service.ts", "utf8");
assert(
  folderService.includes("persistClimateWalletTake"),
  "Match Day Votes record the cash taken from a Carbon Wallet"
);

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(
  "FUND-IT moves £0.20 from any Carbon Wallet into one numbered Climate Project; posts disappear after 5 days."
);
