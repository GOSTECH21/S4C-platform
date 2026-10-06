import { readFileSync } from "fs";
import {
  allocateWalletVote,
  createLeadWallet,
  createLocalWallet,
  DEFAULT_WALLET_VOTE_GBP,
  FUND_IT_LABEL,
  FUND_IT_MAX_TIMES,
  LEAD_WALLET_VOTE_GBP,
  LOCAL_MANAGEMENT_FEE_RATE,
  leadSponsorshipFromGoalsGbp,
  leadCarbonWalletGbp,
  formatLeadSponsorshipGbp,
  normalizeClimateWallet,
  localWalletTopUp,
  remainingGbp,
  capLocalWalletSponsorship,
  walletVoteAmount,
  totalAllocatedGbp,
  canPressFundIt,
  formatWalletGbp,
} from "../app/lib/sponsor-wallet";
import {
  buildProjectsFile,
  buildSponsorsFile,
  canSubmitMatchDayFolder,
  climateProjectsFileName,
  emptyMatchDayFolder,
  fanFundingIsOpen,
  isMatchDayFolderVisible,
  MATCH_DAY_FOLDER_NAME,
  saveProjectsIntoFolder,
  saveSponsorsIntoFolder,
  sponsorRowsFromWallets,
  sponsorsFileName,
  submitMatchDayFolder,
} from "../app/lib/match-day-folder";
import {
  MS_PER_DAY,
  isVotingOpen,
  resolveVotingWindow,
  votingPhase,
} from "../app/lib/voting-window";
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
assert(FUND_IT_MAX_TIMES === 5, "Fans can FUND-IT up to 5 times");
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

const fountainWallet = {
  ...createLocalWallet({
    clubName: "Arsenal",
    brandName: "The Fountain",
    sponsorshipGbp: 1550,
  }),
  allocatedGbp: 0.2,
};
assert(
  remainingGbp(fountainWallet) === 1549.8,
  "An uncapped Fountain wallet still shows the inflated remainder"
);
const fountainCapped = capLocalWalletSponsorship(fountainWallet, 800);
assert(
  fountainCapped.sponsorshipGbp === 800 && remainingGbp(fountainCapped) === 799.8,
  "The Fountain Carbon Wallet caps at the submitted £800 match amount, minus FUND-IT already taken"
);
assert(
  readFileSync("app/services/match-day-folder.service.ts", "utf8").includes(
    "healLocalWalletsForClub"
  ) &&
    readFileSync("app/services/sponsor-wallet.service.ts", "utf8").includes(
      "capLocalWalletSponsorship"
    ),
  "My S4P heals inflated local wallets down to the submitted Match amount"
);

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
assert(
  leadSponsorshipFromGoalsGbp(amex) === 0,
  "Sponsorship/Goal-Scored starts at £0 before any goal"
);
assert(
  leadSponsorshipFromGoalsGbp({ ...amex, goalsScored: 1 }) === 3000,
  "One goal multiplies Goals-scored Sponsorship Cash by 1"
);
assert(
  leadSponsorshipFromGoalsGbp({ ...amex, goalsScored: 2 }) === 6000,
  "A second goal doubles Sponsorship/Goal-Scored"
);
assert(
  formatLeadSponsorshipGbp(0) === "£0.0",
  "Sponsorship/Goal-Scored reads £0.0 when Goals-Scored is 0"
);
assert(
  leadCarbonWalletGbp(amex) === 3000,
  "Amount in CARBON WALLET starts as the Commitment Fee"
);
assert(
  leadCarbonWalletGbp({ ...amex, goalsScored: 1 }) === 6000,
  "Amount in CARBON WALLET is Commitment Fee plus Sponsorship/Goal-Scored"
);

const puma = createLeadWallet({
  clubName: "Arsenal",
  brandName: "Puma",
  commitmentFeeGbp: 3000,
  gbpPerGoal: 4000,
  maximumSponsorshipGbp: 12000,
});
assert(
  leadSponsorshipFromGoalsGbp(puma) === 0,
  "Puma Sponsorship/Goal-Scored is £0 before a live goal"
);
assert(
  leadSponsorshipFromGoalsGbp({ ...puma, goalsScored: 1 }) === 4000,
  "One Arsenal goal copies the Sponsorship/Goal-Scored rate"
);
assert(
  leadSponsorshipFromGoalsGbp({ ...puma, goalsScored: 2 }) === 8000,
  "Two Arsenal goals multiply the rate by 2"
);
assert(
  leadSponsorshipFromGoalsGbp({ ...puma, goalsScored: 3 }) === 12000,
  "Three Arsenal goals reach the Maximum Sponsorship Amount"
);
assert(
  leadSponsorshipFromGoalsGbp({ ...puma, goalsScored: 4 }) === 12000,
  "Further goals stay at the Maximum Sponsorship Amount"
);
assert(
  leadCarbonWalletGbp({ ...puma, goalsScored: 1 }) === 7000,
  "CARBON WALLET is £3,000 + £4,000 after one goal"
);

const leftoverMax = normalizeClimateWallet({
  ...createLeadWallet({
    clubName: "Arsenal",
    brandName: "Puma",
    commitmentFeeGbp: 3000,
    gbpPerGoal: 4000,
  }),
  goalsScored: 12000,
  maximumSponsorshipGbp: 0,
});
assert(
  leftoverMax.goalsScored === 0 && leftoverMax.maximumSponsorshipGbp === 12000,
  "A leftover 12000 goal count is restored as Maximum Sponsorship Amount"
);
assert(
  leadSponsorshipFromGoalsGbp(leftoverMax) === 0,
  "After restoring Maximum Sponsorship Amount, Sponsorship/Goal-Scored is £0.0"
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

assert(
  sponsorRowsFromWallets([amex, topCellar]).length === 2,
  "Lead and local wallets both appear in the Sponsors File"
);

const pumaArsenal = createLeadWallet({
  clubName: "Arsenal",
  brandName: "Puma",
  commitmentFeeGbp: 3500,
  gbpPerGoal: 4000,
});
const pumaArsenalFc = createLeadWallet({
  clubName: "Arsenal FC",
  brandName: "Puma",
  commitmentFeeGbp: 3500,
  gbpPerGoal: 4000,
});
assert(
  pumaArsenal.id !== pumaArsenalFc.id,
  "Arsenal and Arsenal FC can store separate Puma wallet ids"
);
assert(
  sponsorRowsFromWallets([pumaArsenal, pumaArsenalFc]).length === 1,
  "The same brand cannot appear twice in the Sponsors File"
);
assert(
  buildSponsorsFile({
    matchDate: "2026-10-10",
    sponsors: [
      ...sponsorRowsFromWallets([pumaArsenal]),
      ...sponsorRowsFromWallets([pumaArsenalFc]),
    ],
  }).sponsors.length === 1,
  "Saving the Sponsors File collapses duplicate Puma rows"
);

const folderPanel = readFileSync(
  "app/components/club/MatchDayFolderPanel.tsx",
  "utf8"
);
assert(
  folderPanel.includes("uniqueSponsorRows"),
  "The Match-Day folder de-duplicates sponsor rows before listing them"
);

assert(
  canPressFundIt({
    remainingGbp: 3500,
    projectNumber: "3",
    projectCount: 5,
  }),
  "FUND-IT turns on when a Climate Project Number is in the Checkbox"
);
assert(
  !canPressFundIt({
    remainingGbp: 3500,
    projectNumber: "3",
    projectCount: 5,
    fundingOpen: false,
  }),
  "FUND-IT stays off after the vote has closed"
);
assert(
  canPressFundIt({
    remainingGbp: 3500,
    projectNumber: "3",
    projectCount: 5,
    used: true,
  }) === false,
  "FUND-IT stays off once that sponsor has already been used"
);

const earlyKickoff = resolveVotingWindow({
  kickoff: "2026-10-10T15:00:00.000Z",
});
assert(
  !isVotingOpen(earlyKickoff, "2026-10-01T21:00:00.000Z"),
  "Kick-off voting is still closed nine days before the match"
);
assert(
  votingPhase(earlyKickoff, "2026-10-01T21:55:00.000Z") === "upcoming",
  "1 October is still before the kick-off voting window"
);
assert(
  fanFundingIsOpen({
    folder: null,
    votingWindow: earlyKickoff,
    now: "2026-10-01T21:55:00.000Z",
  }),
  "FUND-IT turns on when a project number is entered even before kick-off − 3 days"
);
const postedFolder = submitMatchDayFolder(
  folder,
  "2026-10-01T21:00:00.000Z"
);
assert(
  fanFundingIsOpen({
    folder: postedFolder,
    votingWindow: earlyKickoff,
    now: "2026-10-01T21:55:00.000Z",
  }),
  "FUND-IT is live as soon as the Match-Day folder is submitted"
);
assert(
  !fanFundingIsOpen({
    folder: null,
    votingWindow: earlyKickoff,
    now: "2026-10-13T16:00:00.000Z",
  }),
  "FUND-IT turns off after the 5-day vote has closed"
);

const clubPage = readFileSync("app/club/dashboard/page.tsx", "utf8");
assert(clubPage.includes("MatchDayFolderPanel"), "The club dashboard has a Match-Day folder");
assert(clubPage.includes("SUBMIT"), "The club dashboard posts the two files with SUBMIT");
assert(
  clubPage.includes("FUND-IT up to 5 times") &&
    !clubPage.includes("pick 3 of 5") &&
    clubPage.includes("No FUND-IT allocations yet"),
  "The club dashboard tells SDs that fans FUND-IT up to 5 times"
);
const clubSelect = readFileSync("app/club/projects/select/page.tsx", "utf8");
assert(
  !clubSelect.includes("Goal-scored funding for this Match") &&
    clubSelect.includes("DEFAULT_WALLET_VOTE_GBP") &&
    clubSelect.includes("leadWalletMatchFunding"),
  "Club Climate Projects does not set Goal-scored funding; FUND-IT stays £0.20"
);

const fanPage = readFileSync("app/supporter/dashboard/page.tsx", "utf8");
const votePage = readFileSync("app/dashboard/supporter/vote/page.tsx", "utf8");
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
assert(
  fanPage.includes("FUND-IT up to 5 times"),
  "My S4P tells fans they can FUND-IT up to 5 times"
);

const fanLogin = readFileSync("app/fan/login/page.tsx", "utf8");
const supporterLogin = readFileSync("app/supporter/login/page.tsx", "utf8");
const registerPage = readFileSync("app/register/page.tsx", "utf8");
assert(
  fanLogin.includes("FUND up to 5 Projects shown to you") &&
    supporterLogin.includes("FUND up to 5 Projects shown to you") &&
    registerPage.includes("FUND-IT up to 5 times") &&
    !fanLogin.includes("vote on your club's climate projects") &&
    !supporterLogin.includes("vote on your club's climate projects"),
  "Fan login says FUND up to 5 Projects shown to you"
);

const votesService = readFileSync("app/services/votes.service.ts", "utf8");
const clubMatchDayService = readFileSync(
  "app/services/club-match-day.service.ts",
  "utf8"
);
assert(
  votesService.includes("maximum_votes: FUND_IT_MAX_TIMES") &&
    clubMatchDayService.includes("maximum_votes: FUND_IT_MAX_TIMES") &&
    !votesService.includes("maximum_votes: 3") &&
    !clubMatchDayService.includes("maximum_votes: 3"),
  "Match campaigns allow FUND-IT up to 5 times, not a 3-project vote cap"
);

const sponsorsUi = readFileSync("app/components/fan/ClimateProjectSponsors.tsx", "utf8");
assert(
  sponsorsUi.includes("Carbon Wallet") &&
    sponsorsUi.includes(">Checkbox<") &&
    !sponsorsUi.includes("Checkbox 1") &&
    !sponsorsUi.includes("Checkbox 2") &&
    sponsorsUi.includes("FUND_IT_LABEL") &&
    sponsorsUi.includes("canPressFundIt") &&
    !sponsorsUi.includes(">Vote<"),
  "Each Carbon Wallet has one Checkbox and a FUND-IT tab"
);
assert(
  sponsorsUi.includes("fundItCopy") &&
    readFileSync("app/lib/sponsor-wallet.ts", "utf8").includes(
      "You can ${FUND_IT_LABEL} up to ${FUND_IT_MAX_TIMES} times"
    ) &&
    readFileSync("app/lib/sponsor-wallet.ts", "utf8").includes(
      "Choose a Climate Project Number; Insert it into the Checkbox next to that wallet; Press"
    ) &&
    readFileSync("app/lib/sponsor-wallet.ts", "utf8").includes(
      "goes from Wallet to Project"
    ),
  "Fans are told they can FUND-IT 5 times with the single FUND-IT instruction"
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

assert(
  fanPage.includes("fanFundingIsOpen") &&
    votePage.includes("fanFundingIsOpen"),
  "My S4P and Climate Projects enable FUND-IT after the Match-Day folder is submitted"
);
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

const walletForm = readFileSync(
  "app/components/sponsor/ClimateSponsorshipWallet.tsx",
  "utf8"
);
assert(
  walletForm.includes("Maximum Sponsorship Amount"),
  "Lead wallet labels the Maximum Sponsorship Amount field"
);
assert(
  walletForm.includes("Sponsorship/Goal-Scored"),
  "Lead wallet shows a Sponsorship/Goal-Scored block"
);
assert(
  walletForm.includes("Goals-Scored"),
  "Lead wallet shows a Goals-Scored block"
);
assert(
  walletForm.includes("Amount in CARBON WALLET"),
  "Lead wallet shows Amount in CARBON WALLET"
);
assert(
  walletForm.includes("formatLeadSponsorshipGbp"),
  "Sponsorship/Goal-Scored reads £0.0 before a live goal"
);
assert(
  walletForm.includes("readOnly") &&
    walletForm.includes("Stays at 0 until a live broadcast goal is received."),
  "Goals-Scored is not typed in; it waits for a live goal"
);
assert(
  walletPage.includes("SPONSORED_GOAL_EVENT"),
  "The wallet refreshes when a live sponsored goal is posted"
);
assert(
  walletForm.includes("maximumSponsorshipGbp"),
  "Maximum Sponsorship Amount is stored separately from goals scored"
);
assert(
  !walletForm.includes("goalsScored: Number(goalsScored)"),
  "Depositing the lead wallet does not overwrite Goals-Scored from the form"
);
assert(
  walletForm.includes(
    "As a Lead Climate Project Sponsor, you deposit a Commitment Fee on Day 1 (in case Match ends as 0 - 0), well before kick-off, and agrees to pay Goals-scored Sponsorship Cash for every goal the sponsored Team players score"
  ),
  "Lead wallet explains the Day 1 Commitment Fee and Goals-scored cash"
);
assert(
  !walletForm.includes("Goals scored so far"),
  "Lead wallet no longer uses Goals scored so far"
);
assert(
  walletForm.includes('kind === "local"') && walletForm.includes('label="Remaining"'),
  "Remaining is only shown on the local wallet"
);
assert(
  !walletForm.includes("Sponsorship amount (from") &&
    !walletForm.includes("Pay into Climate Sponsorship Wallet"),
  "Local wallet does not ask for a second sponsorship amount"
);
assert(
  walletPage.includes(
    "Commitment Fee ${formatWalletGbp(next.commitmentFeeGbp)} is in the wallet."
  ),
  "Lead deposit notice does not show Remaining"
);
assert(
  !walletPage.includes(
    "is in the wallet (${formatWalletGbp(remainingGbp(next))} Remaining)"
  ),
  "Lead deposit notice no longer appends Remaining"
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
