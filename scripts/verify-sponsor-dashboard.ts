import {
  pairSignedSponsorships,
  unsignedMatchOffers,
  sponsorshipFolderStats,
  signedCopyPayload,
  signedCopyDownloadName,
  clubsMatch,
  proposalMatchesClub,
  sponsorshipSelectedProposals,
  sponsorshipFundedProposals,
  bestClubMatch,
  normalizeClubName,
  votedProjectsOnSignedOffer,
  assignLookbackSponsors,
  dedupeLookbackRecords,
  findCurrentLookbackRecord,
  lookbackSponsorForRecord,
  lookbackTimesClose,
  preferFullerLookbackSelected,
  fanCountFromVotedProjects,
  fanVotesOnSignedOffers,
} from "../app/lib/sponsor-dashboard";
import {
  LOCAL_SPONSOR_HOME_PATH,
  SPONSOR_DASHBOARD_PATH,
  SPONSOR_WALLET_PATH,
  SPONSOR_OFFER_SIGN_SECTION_ID,
  SPONSOR_RECEIVE_SECTION_ID,
  SPONSOR_SIGNED_SECTION_ID,
  isNewSponsorshipRequest,
  sponsorDashboardReceivePath,
  sponsorNewSponsorshipPath,
  sponsorOfferSignOffPath,
  sponsorWalletPath,
} from "../app/lib/routes";
import {
  cistRowsForSponsor,
  committedGbpForSignedHome,
  defaultCalendarMonth,
  fundedClimateProjectsFromSigned,
  fundedClimateProjectsForHome,
  hasCompletedMatchSponsorship,
  matchesOnDate,
  monthCells,
  showsSignedSponsorHome,
  picksForSignedSponsorHome,
  sponsoredMatchesForHome,
  sponsoredMatchesFromLock,
  sponsoredMatchesFromSigned,
} from "../app/lib/sponsor-signed-home";
import { signedOrPostedBrandForClub } from "../app/lib/campaign-sponsor";
import { sponsorHomePath } from "../app/lib/sponsor-home";
import { localLockCopy, lockCopy } from "../app/lib/climate-sponsors";
import {
  applyWalletFundingLock,
  includeBrandOnTargets,
  isWalletFundingLocked,
  shouldFillLockedOfferWithUploads,
  shouldPullLockedClubUploads,
  SIGNED_SPONSORSHIP_EVENT,
} from "../app/lib/sponsor-completion-flow";
import { readFileSync } from "fs";

const failures: string[] = [];

function assert(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

const offer = {
  id: "offer-1",
  clubId: "club-united",
  clubName: "Manchester United",
  headline: "Manchester United Match Day — Goal Sponsor",
  matchTitle: "Manchester United Match Day",
  matchDate: "2026-09-20T15:00:00.000Z",
  projectIds: ["gss", "local-1", "local-2", "int-1", "int-2"],
  projects: [
    { id: "gss", name: "Global Schools Solar", estimated_co2: 120 },
    { id: "local-1", name: "Local One", estimated_co2: 40 },
    { id: "local-2", name: "Local Two", estimated_co2: 10 },
    { id: "int-1", name: "Ugandan Cookstove", estimated_co2: 80 },
    { id: "int-2", name: "International Two", estimated_co2: 5 },
  ],
  postedAt: "2026-09-13T10:00:00.000Z",
  sponsorshipAmountGbp: 1000,
};

const otherOffer = {
  ...offer,
  id: "offer-2",
  clubId: "club-arsenal",
  clubName: "Arsenal",
  headline: "Arsenal Match Day — Goal Sponsor",
  postedAt: "2026-09-14T10:00:00.000Z",
};

const signature = {
  id: "sig-1",
  offerId: "offer-1",
  sponsorId: "sponsor-1",
  signerName: "Alex Manager",
  brandName: "Puma",
  acceptedTerms: true,
  signedAt: "2026-09-14T11:00:00.000Z",
};

assert(clubsMatch("Manchester United", "Man United") === false, "Exact club helper still matches substrings only when contained");
assert(clubsMatch("Manchester United FC", "Manchester United"), "Club names match when one contains the other");

const pendingBefore = unsignedMatchOffers([offer, otherOffer], []);
assert(pendingBefore.length === 2, "Unsigned inbox shows both club offers before sign-off");

const signed = pairSignedSponsorships([offer, otherOffer], [signature]);
assert(signed.length === 1, "Folder contains only signed offers");
assert(signed[0].offer.id === "offer-1", "Signed folder lodges the United offer");
assert(
  unsignedMatchOffers([offer, otherOffer], [signature]).map((row) => row.id).join(",") ===
    "offer-2",
  "Option 1 inbox drops an offer once it is signed"
);

const stats = sponsorshipFolderStats(signed, 17);
assert(stats.projectCount === 5, "Dashboard counts the five signed Climate Projects");
assert(stats.carbonTonnes === 255, "Dashboard sums carbon impact from signed projects");
assert(stats.expenditureGbp === 1000, "Dashboard records expenditure for the signed offer");
assert(stats.fanVotes === 17, "Dashboard shows fans who voted and saw the brand");

const clubCopy = pairSignedSponsorships([offer, otherOffer], [signature], {
  clubId: "club-united",
  clubName: "Manchester United",
});
assert(clubCopy.length === 1, "Club SD receives the signed copy for their club");
assert(
  pairSignedSponsorships([offer, otherOffer], [signature], {
    clubId: "club-arsenal",
    clubName: "Arsenal",
  }).length === 0,
  "Arsenal SD does not receive United's signed copy"
);
assert(
  pairSignedSponsorships([offer, otherOffer], [signature], {
    sponsorId: "new-login-id",
    brandName: "Puma",
  })[0]?.offer.id === "offer-1",
  "Re-login still lodges the signed folder when the brand matches and the sponsor id changed"
);
assert(
  pairSignedSponsorships([offer, otherOffer], [signature], {
    sponsorId: "new-login-id",
    brandName: "Pepsi Cola",
  }).length === 0,
  "A different brand on re-login does not inherit another sponsor's signed folder"
);

const payload = signedCopyPayload(signed[0]);
assert(payload.brand === "Puma", "Signed copy names the brand");
assert(payload.signedBy === "Alex Manager", "Signed copy names the signer");
assert(payload.climateProjects.length === 5, "Signed copy lists the five projects");
assert(
  String(payload.payable).includes("Base Match Sponsorship") ||
    String(payload.payablePerGoal).includes("Base Match Sponsorship"),
  "Signed copy states the Base Match Sponsorship"
);
assert(
  signedCopyDownloadName("Manchester United", "Puma").includes(
    "s4p-signed-sponsorship"
  ),
  "Club can download a named signed copy file"
);

assert(
  proposalMatchesClub(
    { clubId: "name:Arsenal", clubName: "Arsenal" },
    "club-uuid",
    "Arsenal FC"
  ),
  "Sponsor list sent to Arsenal appears on the Arsenal FC dashboard"
);
assert(
  !proposalMatchesClub(
    { clubId: "name:Arsenal", clubName: "Arsenal" },
    "other-id",
    "Manchester United"
  ),
  "Arsenal sponsor list does not appear on United's dashboard"
);

const incoming = [
  { clubName: "Arsenal", status: "sent" },
  { clubName: "Arsenal", status: "posted" },
];
assert(
  sponsorshipSelectedProposals(incoming).length === 1,
  "Unposted Option 2 lists are Sponsorship Selected Projects"
);
assert(
  sponsorshipFundedProposals(incoming).length === 1,
  "Posted Option 2 lists are Sponsorship Funded Projects"
);

assert(
  normalizeClubName("Arsenal FC") === "arsenal",
  "Arsenal FC normalizes to the same club key as Arsenal"
);
assert(
  clubsMatch("Hearts of Midlothian FC", "Hearts"),
  "Hearts picker name matches the registered club title"
);
assert(
  bestClubMatch(
    [{ name: "Arsenal Women" }, { name: "Arsenal FC" }],
    "Arsenal"
  )?.name === "Arsenal FC",
  "Arsenal picker resolves to Arsenal FC, not Arsenal Women"
);

const votedOnOffer = votedProjectsOnSignedOffer(offer, [
  { id: "gss" },
  { id: "int-1" },
  { id: "local-1" },
  { id: "other" },
]);
assert(
  votedOnOffer.map((project) => project.id).join(",") === "gss,local-1,int-1",
  "Sponsor folder shows the fan-funded projects from the signed five"
);
assert(
  fanCountFromVotedProjects(5) === 1,
  "Five FUND-IT allocations from one Match Day five count as one fan"
);
assert(
  fanCountFromVotedProjects(3) === 1,
  "Fewer than five FUND-IT allocations still count as one fan"
);
assert(
  fanCountFromVotedProjects(0) === 0,
  "No voted projects means no fans who voted"
);
assert(
  fanVotesOnSignedOffers(
    [{ offer: { clubId: "club-united", projects: offer.projects } }],
    { "club-united": [{ id: "gss" }, { id: "local-1" }, { id: "int-1" }] },
    0
  ) === 1,
  "American Express sees 1 fan when Voted by fans lists FUND-IT allocations"
);

const budweiserSig = {
  ...signature,
  id: "sig-bud",
  brandName: "Budweiser",
  signedAt: "2026-09-18T14:47:04.000Z",
};
const gilletteSig = {
  ...signature,
  id: "sig-gil",
  offerId: "offer-gil",
  brandName: "Gillette",
  signedAt: "2026-09-18T12:00:00.000Z",
};
const gilletteOffer = { ...offer, id: "offer-gil" };
const villaSigned = pairSignedSponsorships(
  [offer, gilletteOffer],
  [budweiserSig, gilletteSig]
);
const logos: Record<string, string> = {
  Budweiser: "/sponsors/budweiser.svg",
  Gillette: "/sponsors/gillette.svg",
};
const logoFor = (name: string) => logos[name] ?? null;
const lookbacks = [
  {
    savedAt: "2026-09-18T15:00:41.000Z",
    selected: offer.projects,
  },
  {
    savedAt: "2026-09-18T12:50:10.000Z",
    selected: offer.projects,
  },
];
const stamped = assignLookbackSponsors(lookbacks, villaSigned, logoFor);
assert(
  stamped[0].sponsorName === "Budweiser" &&
    stamped[0].sponsorLogoUrl === "/sponsors/budweiser.svg",
  "Later Match Day lookback is stamped Budweiser"
);
assert(
  stamped[1].sponsorName === "Gillette" &&
    stamped[1].sponsorLogoUrl === "/sponsors/gillette.svg",
  "Earlier Match Day lookback is stamped Gillette"
);

const named = findCurrentLookbackRecord(
  [
    {
      campaignId: null,
      savedAt: "2026-09-18T15:00:41.000Z",
      selected: offer.projects,
      sponsorName: "Budweiser",
    },
    {
      campaignId: null,
      savedAt: "2026-09-18T12:50:10.000Z",
      selected: offer.projects,
      sponsorName: "Gillette",
    },
  ],
  {
    campaignId: null,
    selected: offer.projects,
    sponsorName: "Gillette",
    today: "2026-09-18",
  }
);
assert(
  named?.sponsorName === "Gillette",
  "Gillette lookback is not merged into the Budweiser file record"
);

const liverpoolFive = offer.projects;
const liverpoolLookbacks = [
  {
    id: "liv-unsigned",
    campaignId: "liv-campaign",
    savedAt: "2026-09-20T16:15:50.000Z",
    selected: liverpoolFive,
    voted: [],
  },
  {
    id: "liv-amex",
    campaignId: "liv-campaign",
    savedAt: "2026-09-20T12:06:00.000Z",
    selected: liverpoolFive,
    voted: [],
    sponsorName: "American Express",
    sponsorLogoUrl: "/sponsors/amex.svg",
  },
  {
    id: "liv-gss",
    campaignId: null,
    savedAt: "2026-09-20T11:40:01.000Z",
    selected: [liverpoolFive[0]],
    voted: [],
  },
];
const collapsed = dedupeLookbackRecords(liverpoolLookbacks);
assert(collapsed.length === 1, "Liverpool Match Day lookbacks collapse to one card");
assert(
  collapsed[0].sponsorName === "American Express",
  "The surviving Liverpool lookback keeps the American Express stamp"
);
assert(
  collapsed[0].selected.map((project) => project.id).join(",") ===
    liverpoolFive.map((project) => project.id).join(","),
  "The surviving Liverpool lookback keeps the confirmed five"
);

assert(
  findCurrentLookbackRecord(liverpoolLookbacks, {
    campaignId: "liv-campaign",
    selected: liverpoolFive,
    today: "2026-09-20",
  })?.id === "liv-unsigned",
  "An unsigned save updates the existing unsigned Liverpool lookback"
);
assert(
  findCurrentLookbackRecord(
    liverpoolLookbacks.filter((row) => row.id !== "liv-unsigned"),
    {
      campaignId: "liv-campaign",
      selected: liverpoolFive,
      today: "2026-09-20",
    }
  )?.sponsorName === "American Express",
  "An unsigned save does not create a second table next to a stamped American Express lookback"
);
assert(
  preferFullerLookbackSelected([liverpoolFive[0]], liverpoolFive).length === 5,
  "A later full five replaces an earlier GSS-only lookback"
);
assert(
  preferFullerLookbackSelected(liverpoolFive, [liverpoolFive[0]]).length === 5,
  "A later GSS-only save does not shrink the confirmed five"
);

const villaWithUnsigned = dedupeLookbackRecords([
  {
    id: "villa-unsigned",
    campaignId: null,
    savedAt: "2026-09-18T16:00:00.000Z",
    selected: offer.projects,
  },
  {
    id: "villa-bud",
    campaignId: null,
    savedAt: "2026-09-18T15:00:41.000Z",
    selected: offer.projects,
    sponsorName: "Budweiser",
  },
  {
    id: "villa-gil",
    campaignId: null,
    savedAt: "2026-09-18T12:50:10.000Z",
    selected: offer.projects,
    sponsorName: "Gillette",
  },
]);
assert(
  villaWithUnsigned.length === 2 &&
    villaWithUnsigned.some((row) => row.sponsorName === "Budweiser") &&
    villaWithUnsigned.some((row) => row.sponsorName === "Gillette"),
  "Budweiser and Gillette keep separate stamped lookbacks for the same five"
);

const midnightSplit = dedupeLookbackRecords([
  {
    id: "bournemouth-later",
    campaignId: "campaign-b",
    savedAt: "2026-10-17T00:28:12.000Z",
    selected: liverpoolFive,
  },
  {
    id: "bournemouth-earlier",
    campaignId: null,
    savedAt: "2026-10-16T23:56:08.000Z",
    selected: liverpoolFive,
  },
]);
assert(
  midnightSplit.length === 1 && midnightSplit[0].id === "bournemouth-earlier",
  "Unsigned copies of the same five do not appear twice across UTC midnight"
);
assert(
  lookbackTimesClose("2026-10-16T23:56:08.000Z", "2026-10-17T00:28:12.000Z"),
  "Lookback merge window covers the UTC midnight split"
);

const renamedIds = dedupeLookbackRecords([
  {
    id: "names-a",
    campaignId: null,
    savedAt: "2026-10-17T01:28:12.000Z",
    selected: liverpoolFive.map((project, index) => ({
      ...project,
      id: `new-${index}`,
    })),
  },
  {
    id: "names-b",
    campaignId: null,
    savedAt: "2026-10-17T00:56:08.000Z",
    selected: liverpoolFive,
  },
]);
assert(
  renamedIds.length === 1,
  "The same project names still collapse when catalog ids change"
);

const laterMatch = dedupeLookbackRecords([
  {
    id: "week-later",
    campaignId: null,
    savedAt: "2026-10-24T12:00:00.000Z",
    selected: liverpoolFive,
  },
  {
    id: "this-week",
    campaignId: null,
    savedAt: "2026-10-17T00:56:08.000Z",
    selected: liverpoolFive,
  },
]);
assert(
  laterMatch.length === 2,
  "A later Match Day keeps its own lookback of the same five"
);

const clubDashboard = readFileSync("app/club/dashboard/page.tsx", "utf8");
assert(
  clubDashboard.includes("dedupeLookbackRecords") &&
    clubDashboard.includes("lookbackRecords"),
  "The club dashboard renders one collapsed lookback list"
);

assert(
  lookbackSponsorForRecord(
    {
      savedAt: "2026-09-18T15:00:41.000Z",
      selected: offer.projects,
      sponsorName: "Budweiser",
    },
    villaSigned,
    logoFor
  )?.name === "Budweiser",
  "Stored sponsor name wins on a lookback card"
);

assert(
  sponsorOfferSignOffPath("abc/def") ===
    "/sponsor/offers/sign-off?id=abc%2Fdef",
  "Agree and sign off uses a static route and encodes the offer id"
);
assert(
  sponsorOfferSignOffPath("offer-1") ===
    "/sponsor/offers/sign-off?id=offer-1",
  "A normal offer id signs off at /sponsor/offers/sign-off"
);
assert(
  !sponsorOfferSignOffPath("offer-1").startsWith("/sponsor/offers/offer-1"),
  "Sign-off does not navigate to a missing /sponsor/offers/[id] page"
);

const offerListPage = readFileSync("app/sponsor/offers/page.tsx", "utf8");
assert(
  offerListPage.includes("OfferSignOffForm"),
  "Agree and sign off stays on New Sponsorship/Score Offer"
);
assert(
  offerListPage.includes("SPONSOR_OFFER_SIGN_SECTION_ID") &&
    offerListPage.includes("scrollIntoView"),
  "Once the uploaded five are in view, New Sponsorship/Score Offer opens Signed Sponsorship"
);
assert(
  !offerListPage.includes("${SPONSOR_OFFERS_PATH}/${"),
  "The offer list does not link to /sponsor/offers/[id]"
);
assert(
  readFileSync("app/sponsor/offers/OfferSignOff.tsx", "utf8").includes(
    "SPONSOR_OFFER_SIGN_SECTION_ID"
  ) &&
    readFileSync("app/sponsor/offers/OfferSignOff.tsx", "utf8").includes(
      "Signed Sponsorship"
    ) &&
    readFileSync("app/sponsor/offers/OfferSignOff.tsx", "utf8").includes(
      "resolveCommittedMatchFunding"
    ),
  "The sign-off form is the Signed Sponsorship section"
);

const sponsorDashboardPage = readFileSync(
  "app/sponsor/dashboard/page.tsx",
  "utf8"
);
assert(
  !sponsorDashboardPage.includes("LocalLeftoverPanel") &&
    !sponsorDashboardPage.includes("Match Day card") &&
    !sponsorDashboardPage.includes("Local Business Climate Sponsor"),
  "The S4P Sponsorship Dashboard no longer shows the Local Business Climate Sponsor block"
);
assert(
  !sponsorDashboardPage.includes("{LEAD_CLIMATE_SPONSOR_LABEL} only.") &&
    !sponsorDashboardPage.includes(
      "Top up your Climate Sponsorship Wallet so fans can take cash"
    ),
  "The S4P Sponsorship Dashboard heading no longer explains Lead-only wallet copy"
);
assert(
  lockCopy().includes("choose the Match you wish to lock-in") &&
    lockCopy().includes("Goal-Sponsorship") &&
    lockCopy().includes("this Club's Match Day chosen Climate Projects") &&
    lockCopy().includes("sign-off your Match Day sponsorship") &&
    !lockCopy().includes("choose a Club you wish to sponsor"),
  "Match Day lock-in tells Lead Climate Sponsors to lock the Match for the club already chosen at register"
);
assert(
  localLockCopy().includes("the specific Match") &&
    localLockCopy().includes("insert your Sponsorship amount") &&
    localLockCopy().includes("Accept the Terms & Conditions") &&
    localLockCopy().includes("Sign-off your sponsorship") &&
    !localLockCopy().includes("Goal-Sponsorship") &&
    !localLockCopy().includes("Goals-scored Sponsorship"),
  "Local Business Climate Sponsors are told to insert a Sponsorship amount, not Goals-scored"
);
assert(
  sponsorDashboardPage.includes("lockCopy()") &&
    !sponsorDashboardPage.includes("localLockCopy()"),
  "The S4P Sponsorship Dashboard keeps Goal-Sponsorship lock-in copy for Lead Climate Sponsors"
);
assert(
  readFileSync("app/sponsor/wallet/page.tsx", "utf8").includes("localLockCopy()") &&
    readFileSync("app/sponsor/wallet/page.tsx", "utf8").includes("ClubLeagueMenu") &&
    readFileSync("app/sponsor/dashboard/page.tsx", "utf8").includes(
      "isLeadSponsorHome(sponsorName, { jobTitle })"
    ),
  "Locals lock a Club and Match on the wallet; the Lead dashboard sends them there"
);
assert(
  sponsorDashboardPage.includes("Match Day Lock-In") &&
    !sponsorDashboardPage.includes("Select a Club") &&
    !sponsorDashboardPage.includes(
      "Select a club from Premier League or Scottish Premiership"
    ) &&
    sponsorDashboardPage.includes("SeeMatchDetails") &&
    sponsorDashboardPage.includes("ClubLeagueMenu") &&
    sponsorDashboardPage.includes("clubs={registeredClubs}") &&
    sponsorDashboardPage.includes("MatchFixtureMenu") &&
    sponsorDashboardPage.includes("loadClubFixtures") &&
    sponsorDashboardPage.includes("registeredClubForLockIn") &&
    sponsorDashboardPage.includes('id="match-day-lock-in"'),
  "Match Day Lock-In auto-fills the registered club and lists that club's Matches"
);
assert(
  readFileSync("app/components/sponsor/ClubMatchMenus.tsx", "utf8").includes(
    "Registered clubs"
  ) &&
    readFileSync("app/components/sponsor/ClubMatchMenus.tsx", "utf8").includes(
      "fromRegister"
    ) &&
    readFileSync("app/components/sponsor/ClubMatchMenus.tsx", "utf8").includes(
      "clubs !== undefined"
    ) &&
    readFileSync("app/components/sponsor/ClubMatchMenus.tsx", "utf8").includes(
      "readOnly"
    ),
  "The Club box shows the registered club instead of a Premier League picker"
);
assert(
  readFileSync("app/components/sponsor/SeeMatchDetails.tsx", "utf8").includes(
    "See Match details"
  ) &&
    readFileSync("app/components/sponsor/SeeMatchDetails.tsx", "utf8").includes(
      "defaultOpen"
    ) &&
    sponsorDashboardPage.includes("defaultOpen"),
  "After a Match is selected, sponsors can See Match details"
);
assert(
  !sponsorDashboardPage.includes("ClubNetworkPicker") &&
    !sponsorDashboardPage.includes('id="goal-sponsorship-network"') &&
    !sponsorDashboardPage.includes("lockClubFromNetwork") &&
    !sponsorDashboardPage.includes("scrollToLockIn") &&
    !sponsorDashboardPage.includes("scrollToClubTable") &&
    !sponsorDashboardPage.includes("Goal Sponsorship Network"),
  "The S4P Sponsorship Dashboard no longer duplicates Goal Sponsorship Network as a second club picker"
);
assert(
  sponsorDashboardPage.indexOf("Match Day Lock-In") <
    sponsorDashboardPage.indexOf("The club&apos;s 5 chosen Climate Projects") &&
    sponsorDashboardPage.indexOf("id={SPONSOR_RECEIVE_SECTION_ID}") <
      sponsorDashboardPage.indexOf("Top up the cash fans will put into Climate Projects") &&
    sponsorDashboardPage.indexOf("SeeMatchDetails") <
      sponsorDashboardPage.indexOf("Open Climate Sponsorship Wallet"),
  "Match Day Lock-In and the five Climate Projects record sit above the Climate Sponsorship Wallet"
);
assert(
  sponsorDashboardPage.includes("loadClubFixtures") &&
    sponsorDashboardPage.includes("ensureGoalNetwork") &&
    (sponsorDashboardPage.includes("See Match details") ||
      sponsorDashboardPage.includes("SeeMatchDetails")),
  "Locking a listed club and Match still records the Goal Sponsorship Network behind the scenes"
);
assert(
  sponsorDashboardPage.includes("The club's 5 chosen Climate Projects") ||
    sponsorDashboardPage.includes(
      "The club&apos;s 5 chosen Climate Projects"
    ),
  "Sponsorship dashboard keeps the club's 5 chosen Climate Projects as a record"
);
assert(
  sponsorDashboardPage.includes("SPONSOR_RECEIVE_SECTION_ID") &&
    sponsorDashboardPage.includes("SPONSOR_SIGNED_SECTION_ID") &&
    sponsorDashboardPage.includes("scrollIntoView") &&
    sponsorDashboardPage.includes("Match Day carbon footprint offset") &&
    sponsorDashboardPage.includes("MATCH_DAY_GOALS_SCORED_COPY") &&
    sponsorDashboardPage.includes("loadClubChosenClimateProjects") &&
    sponsorDashboardPage.includes("MATCH_DAY_PROJECTS_WAITING_COPY") &&
    sponsorDashboardPage.indexOf('id="match-day-lock-in"') <
      sponsorDashboardPage.indexOf("id={SPONSOR_RECEIVE_SECTION_ID}"),
  "The five Climate Projects record sits under Match Day Lock-In and fills when the Sustainability Director uploads them"
);
assert(
  sponsorDashboardPage.includes("FUND-IT up to 5 times") &&
    !sponsorDashboardPage.includes("The 3 Climate Projects they choose") &&
    !sponsorDashboardPage.includes("Fans who voted and saw your brand"),
  "Sponsors are told fans FUND-IT up to 5 times, not vote for 3 Projects"
);
assert(
  !sponsorDashboardPage.includes("Create Your Sponsorship Campaign"),
  "Sponsorship dashboard no longer shows Option 2 campaign creation"
);
assert(
  !sponsorDashboardPage.includes("SPONSOR_CREATE_CAMPAIGN_PATH"),
  "Sponsorship dashboard does not link to the Option 2 campaign picker"
);
assert(
  !sponsorDashboardPage.includes("Option 2 campaigns you sent"),
  "Sponsorship dashboard no longer lists Option 2 campaigns you sent"
);
assert(
  /import \{[^}]*\bformatMoney\b[^}]*\} from ["']@\/app\/lib\/sponsorship-auction["']/.test(
    sponsorDashboardPage.replace(/\n/g, " ")
  ),
  "Sponsorship dashboard imports formatMoney for the committed-spend tile"
);
assert(
  sponsorDashboardPage.includes("formatMoney(stats.expenditureGbp)"),
  "Committed-spend tile still formats expenditure with formatMoney"
);

assert(
  signedOrPostedBrandForClub(
    "Liverpool",
    [
      {
        id: "liv-offer",
        clubName: "Liverpool Football Club",
        postedAt: "2026-09-20T13:00:00.000Z",
        targetBrandNames: ["American Express"],
      },
    ],
    []
  ) === "American Express",
  "Liverpool fans see American Express from the posted Match Day offer"
);
assert(
  signedOrPostedBrandForClub(
    "Liverpool Football Club",
    [
      {
        id: "liv-offer",
        clubName: "Liverpool Football Club",
        postedAt: "2026-09-20T13:00:00.000Z",
        targetBrandNames: ["American Express"],
      },
    ],
    [{ offerId: "other", brandName: "Budweiser" }]
  ) === "American Express",
  "A Budweiser signature on another offer does not replace American Express"
);
assert(
  signedOrPostedBrandForClub(
    "Liverpool",
    [
      {
        id: "liv-offer",
        clubName: "Liverpool Football Club",
        postedAt: "2026-09-20T14:00:00.000Z",
        targetBrandNames: ["American Express"],
      },
    ],
    [{ offerId: "liv-offer", brandName: "American Express" }]
  ) === "American Express",
  "A signed American Express offer stays American Express"
);

assert(
  sponsorHomePath("Puma") === SPONSOR_DASHBOARD_PATH,
  "Puma as a Lead Climate Sponsor lands on the S4P Sponsorship Dashboard"
);
assert(
  sponsorHomePath("American Express") === SPONSOR_DASHBOARD_PATH,
  "American Express stays on the Lead Climate Sponsor dashboard"
);
assert(
  sponsorHomePath("Top Cellar") === LOCAL_SPONSOR_HOME_PATH &&
    sponsorHomePath("The Fountain") === LOCAL_SPONSOR_HOME_PATH &&
    sponsorHomePath("Piazza Italiana") === LOCAL_SPONSOR_HOME_PATH,
  "Local Business Climate Sponsors land on the LOBI home, not the Lead dashboard"
);

const localRegisterPage = readFileSync("app/sponsor/local/register/page.tsx", "utf8");
assert(
  localRegisterPage.includes("LOCAL_SPONSOR_HOME_PATH") &&
    !localRegisterPage.includes("SPONSOR_DASHBOARD_PATH"),
  "Local Business Climate Sponsors register into the LOBI home, not the Lead dashboard"
);

const walletPage = readFileSync("app/sponsor/wallet/page.tsx", "utf8");
assert(
  walletPage.includes("lockWalletFundingToClub") &&
    walletPage.includes("ensureCarbonOffsetSponsorshipOffer") &&
    walletPage.includes("sponsorOfferSignOffPath") &&
    walletPage.includes("ensureMatchDayClubLock") &&
    walletPage.includes("bindFundedSponsorToClub") &&
    !walletPage.includes("sponsorDashboardReceivePath") &&
    !walletPage.includes("clubNameForLocalBrand") &&
    !walletPage.includes("isLeadSponsorHome(brand) && !lock?.clubName"),
  "Depositing into the Climate Sponsorship Wallet locks funding to the selected club and opens Terms & Conditions + sign-off"
);
assert(
  readFileSync("app/sponsor/dashboard/page.tsx", "utf8").includes(
    "sponsorWalletPath(lockClub)"
  ) &&
    sponsorWalletPath("Hearts of Midlothian FC").includes("club=") &&
    sponsorWalletPath("") === SPONSOR_WALLET_PATH,
  "Open Climate Sponsorship Wallet carries the locked club onto the wallet"
);
assert(
  sponsorDashboardPage.includes("setChosenFixture(fixture)") &&
    sponsorDashboardPage.includes("setLockFixture(fixture.fixtureName)") &&
    !sponsorDashboardPage.includes('setLockClub(persisted?.clubName ?? "")'),
  "A rejected second Lead still keeps the chosen Club, Match and Match details on screen"
);

const offerService = readFileSync(
  "app/services/sponsor-offers.service.ts",
  "utf8"
);
assert(
  offerService.includes("ensureCarbonOffsetSponsorshipOffer") &&
    offerService.includes("attachProjectsToClubSponsorships") &&
    offerService.includes("hydrateClubSponsorsFromSigned") &&
    offerService.includes("publishSignedSponsorshipToFans") &&
    offerService.includes("recordSignedLeadClimateSponsor") &&
    offerService.includes("firstLeadHoldsChosenProjects") &&
    offerService.includes("canClaimLeadClimateSponsor"),
  "Sponsors sign off the Match Day carbon offset; the SD's five later attach as a record and publish to fans"
);
assert(
  readFileSync("scripts/verify-sponsor-completion-flow.ts", "utf8").includes(
    "lockWalletFundingToClub"
  ) &&
    readFileSync("scripts/verify-sponsor-completion-flow.ts", "utf8").includes(
      "ensureCarbonOffsetSponsorshipOffer"
    ) &&
    readFileSync("scripts/verify-lead-tab-after-signoff.ts", "utf8").includes(
      "recordSignedLeadClimateSponsor"
    ),
  "A completion-flow verify covers lock, wallet funding, pull, live fan publish, and Lead-tab activation after sign-off"
);

assert(
  readFileSync("app/club/dashboard/page.tsx", "utf8").includes(
    "SIGNED_SPONSORSHIP_EVENT"
  ) &&
    readFileSync("app/components/fan/FanCampaignWorkspace.tsx", "utf8").includes(
      "SIGNED_SPONSORSHIP_EVENT"
    ) &&
    readFileSync("app/dashboard/supporter/vote/page.tsx", "utf8").includes(
      "SIGNED_SPONSORSHIP_EVENT"
    ),
  "Club Sustainability Directors and fans refresh as soon as the sponsor signs off"
);

const fundingLock = applyWalletFundingLock(
  {
    brandKey: "puma",
    clubName: "Hibernian",
    matchLabel: "Scottish Premiership Match",
    lockedAt: "2026-10-07T10:00:00.000Z",
  },
  { commitmentFeeGbp: 2500, gbpPerGoal: 3500, maximumSponsorshipGbp: 7500 }
);
assert(
  isWalletFundingLocked(fundingLock) &&
    fundingLock.commitmentFeeGbp === 2500 &&
    fundingLock.clubName === "Hibernian",
  "A Climate Sponsorship Wallet deposit locks funding to the sponsored club"
);
assert(
  !isWalletFundingLocked({
    brandKey: "puma",
    clubName: "Hibernian",
    matchLabel: "Scottish Premiership Match",
    lockedAt: "2026-10-07T10:00:00.000Z",
  }),
  "Lock-in without a wallet deposit is not yet funding-locked"
);
assert(
  includeBrandOnTargets(["American Express"], "Puma").join(",") ===
    "American Express,Puma",
  "Opening the uploaded five adds the locked-in brand to the offer targets"
);
assert(
  shouldPullLockedClubUploads({
    pendingForClub: 0,
    uploadedProjectCount: 5,
  }) &&
    !shouldPullLockedClubUploads({
      pendingForClub: 1,
      uploadedProjectCount: 5,
    }),
  "Uploaded Climate Projects are pulled when the locked club has no pending offer yet"
);
assert(
  shouldFillLockedOfferWithUploads({
    pendingProjectCount: 0,
    uploadedProjectCount: 5,
  }) &&
    shouldFillLockedOfferWithUploads({
      pendingProjectCount: 2,
      uploadedProjectCount: 5,
    }) &&
    !shouldFillLockedOfferWithUploads({
      pendingProjectCount: 5,
      uploadedProjectCount: 5,
    }),
  "An empty or partial pending offer still receives the SD's uploaded five"
);
assert(
  !offerService.includes("isDemoClubName(offer.clubName)") &&
    offerService.includes("stampOfferWithLockedUploads") &&
    offerService.includes("findStoredClubSelectionByName"),
  "Match Day Climate Projects lists any locked calendar club, not only the 3-club Sports Teams demo"
);
assert(
  sponsorDashboardReceivePath() ===
    `${SPONSOR_DASHBOARD_PATH}#${SPONSOR_RECEIVE_SECTION_ID}` &&
    SPONSOR_SIGNED_SECTION_ID === "signed-folder" &&
    SPONSOR_OFFER_SIGN_SECTION_ID === "signed-sponsorship" &&
    SIGNED_SPONSORSHIP_EVENT === "s4p-signed-sponsorship",
  "Receive, Signed Sponsorship, and live sign-off anchors stay stable"
);

const sponsorNav = readFileSync("app/sponsor/sponsor-nav.tsx", "utf8");
assert(
  sponsorNav.includes("flex items-center gap-2") &&
    sponsorNav.includes("Dashboard") &&
    sponsorNav.includes("Logout") &&
    sponsorNav.includes("bg-s4p-mark text-slate-950") &&
    sponsorNav.includes("sponsorHomePath") &&
    !sponsorNav.includes("bg-emerald-400"),
  "Dashboard and Logout sit on one header line; Dashboard opens the Local wallet or Lead home"
);
assert(
  !sponsorDashboardPage.includes("Logout") &&
    !sponsorDashboardPage.includes("logoutSponsor"),
  "Logout is not a second tab in the dashboard body"
);
assert(
  sponsorDashboardPage.includes("Open Climate Sponsorship Wallet") &&
    sponsorDashboardPage.includes(
      "inline-flex rounded-xl bg-s4p-mark px-5 py-3 font-bold text-slate-950"
    ) &&
    !sponsorDashboardPage.includes("bg-emerald-400"),
  "Open Climate Sponsorship Wallet uses the same lime tab as Register, with black copy"
);

const clubPicker = readFileSync(
  "app/components/sponsor/ClubNetworkPicker.tsx",
  "utf8"
);
assert(
  clubPicker.includes("bg-s4p-mark text-slate-950") &&
    !clubPicker.includes("bg-amber-400") &&
    !clubPicker.includes("bg-green-400"),
  "Match Day club tabs use the lime mark green with black copy"
);
assert(
  readFileSync("app/globals.css", "utf8").includes(".bg-red-500.text-white"),
  "Logout keeps cream copy on the red tab so it stays readable"
);

const applyMixed = readFileSync("apply-single-club-match-block.mjs", "utf8");
assert(
  applyMixed.includes("app/lib/sponsor-home.ts") &&
    applyMixed.includes("rememberLocalSponsorSession") &&
    applyMixed.includes("isLocalClimateSponsor"),
  "The apply script pulls sponsor-home so mixed gss-lead-split files still build"
);
assert(
  applyMixed.includes("app/components/sponsor/SignedSponsorHome.tsx") &&
    applyMixed.includes("app/lib/sponsor-signed-home.ts") &&
    applyMixed.includes("app/preview/signed-sponsor-home/page.tsx") &&
    applyMixed.includes("Click here to initiate a New Sponsorship"),
  "The apply script pulls the signed-off Match-Day calendar home onto mixed PC files"
);
const applyLoginHome = readFileSync(
  "apply-sponsor-login-calendar.mjs",
  "utf8"
);
assert(
  applyLoginHome.includes("app/lib/sponsor-signed-home.ts") &&
    applyLoginHome.includes("app/sponsor/dashboard/page.tsx") &&
    applyLoginHome.includes("hasCompletedMatchSponsorship"),
  "The login-calendar apply script pulls the returning-sponsor home onto mixed PC files"
);

const amexHeartsSigned = {
  offer: {
    id: "amex-hearts-aberdeen",
    clubId: "hearts-demo",
    clubName: "Hearts",
    headline: "Hearts v Aberdeen Goal Sponsor",
    matchTitle: "Hearts v Aberdeen",
    matchDate: "2026-10-31",
    projectIds: ["gss", "spoke"],
    projects: [
      { id: "gss", name: "Global Schools Solar", fundedGbp: 2300 },
      { id: "spoke", name: "Wee Spoke Hub", fundedGbp: 0 },
    ],
    postedAt: "2026-10-12T12:00:00.000Z",
    sponsorshipAmountGbp: 2300,
  },
  signature: {
    id: "sig-amex",
    offerId: "amex-hearts-aberdeen",
    sponsorId: "amex",
    signerName: "American Express",
    brandName: "American Express",
    acceptedTerms: true,
    signedAt: "2026-10-12T17:36:00.000Z",
  },
};
const amexMatches = sponsoredMatchesFromSigned([amexHeartsSigned]);
assert(
  amexMatches.length === 1 &&
    amexMatches[0].date === "2026-10-31" &&
    amexMatches[0].fixtureName === "Hearts v Aberdeen",
  "The signed-off calendar lists Hearts v Aberdeen on 31 October"
);
assert(
  matchesOnDate(amexMatches, "2026-10-31")[0]?.fixtureName ===
    "Hearts v Aberdeen" &&
    matchesOnDate(amexMatches, "2026-10-24").length === 0,
  "Clicking 31 October shows Hearts v Aberdeen and other days stay empty"
);
const october = monthCells(2026, 9);
assert(
  october.some((cell) => cell.date === "2026-10-31") &&
    defaultCalendarMonth(amexMatches).month === 9,
  "October 2026 calendar includes the 31st and opens on that Match Day month"
);
const funded = fundedClimateProjectsFromSigned([amexHeartsSigned], {
  "hearts-demo": [{ id: "gss", fundedGbp: 2300 }],
});
assert(
  funded.find((row) => row.id === "gss")?.fanFunded === true &&
    funded.find((row) => row.id === "gss")?.fundedGbp === 2300,
  "The collapsible list shows Climate Projects fans funded from the sponsor's money"
);
const cist = cistRowsForSponsor({
  rows: [
    { name: "Puma", donationGbp: 5000 },
    { name: "Diageo", donationGbp: 1200 },
  ],
  brandName: "American Express",
  ownFundingGbp: 2300,
});
assert(
  cist.find((row) => row.highlighted)?.name === "American Express" &&
    cist.find((row) => row.name === "American Express")?.rank === 2,
  "Climate Impact Sponsorship Table highlights American Express in position"
);
const cistRaised = cistRowsForSponsor({
  rows: [
    { name: "Puma", donationGbp: 5000 },
    { name: "American Express", donationGbp: 1000 },
  ],
  brandName: "American Express",
  ownFundingGbp: 7500,
});
assert(
  cistRaised.find((row) => row.highlighted)?.rank === 1 &&
    cistRaised.find((row) => row.name === "American Express")?.funding.includes(
      "7,500"
    ),
  "CIST uses the signed Commitment Fee and Goals-scored Sponsorship for the highlighted position"
);
assert(
  showsSignedSponsorHome(1, false) &&
    !showsSignedSponsorHome(1, true) &&
    !showsSignedSponsorHome(0, false) &&
    showsSignedSponsorHome(0, false, true) &&
    !showsSignedSponsorHome(0, true, true),
  "Login shows calendar home after a signed or funded Match, and lock-in only for New Sponsorship"
);
const pepsiLock = {
  brandKey: "pepsi cola",
  clubName: "Arsenal",
  matchLabel: "Premier League Match",
  fixtureName: "Manchester City v Arsenal",
  fixtureDate: "2026-11-21",
  lockedAt: "2026-10-12T12:00:00.000Z",
  fundingLockedAt: "2026-10-12T12:30:00.000Z",
  commitmentFeeGbp: 2300,
  gbpPerGoal: 4000,
  maximumSponsorshipGbp: 7500,
};
assert(
  hasCompletedMatchSponsorship(pepsiLock) &&
    !hasCompletedMatchSponsorship({
      ...pepsiLock,
      fundingLockedAt: undefined,
      commitmentFeeGbp: 0,
    }) &&
    hasCompletedMatchSponsorship(
      {
        ...pepsiLock,
        fundingLockedAt: undefined,
        commitmentFeeGbp: 0,
      },
      { commitmentFeeGbp: 2300 }
    ),
  "Sponsoring a club and its Goals scored counts as a completed Match for login"
);
const pepsiMatches = sponsoredMatchesFromLock(pepsiLock);
assert(
  pepsiMatches[0]?.fixtureName === "Manchester City v Arsenal" &&
    pepsiMatches[0]?.date === "2026-11-21" &&
    sponsoredMatchesForHome([], pepsiLock)[0]?.clubName === "Arsenal" &&
    picksForSignedSponsorHome("Pepsi Cola", [], pepsiLock)[0]?.fixtureName ===
      "Manchester City v Arsenal" &&
    picksForSignedSponsorHome("Pepsi Cola", [], pepsiLock)[0]?.clubName ===
      "Arsenal",
  "Returning Pepsi Cola login keeps the sponsored Arsenal Match on the all-inclusive calendar"
);
assert(
  committedGbpForSignedHome({
    signedExpenditureGbp: 0,
    lock: pepsiLock,
  }) === 2300,
  "CIST uses the deposited Commitment Fee when the signed folder is empty"
);
assert(
  fundedClimateProjectsForHome(
    [],
    [
      {
        clubId: "arsenal-demo",
        clubName: "Arsenal",
        matchTitle: "Manchester City v Arsenal",
        projects: [
          { id: "gss", name: "Global Schools Solar", fundedGbp: 2300 },
        ],
      },
    ],
    { "arsenal-demo": [{ id: "gss", fundedGbp: 2300 }] }
  )[0]?.name === "Global Schools Solar",
  "Where your money went lists Climate Projects even before signatures pair"
);
assert(
  sponsorDashboardPage.includes("showsSignedSponsorHome") &&
    sponsorDashboardPage.includes("hasCompletedMatchSponsorship") &&
    sponsorDashboardPage.includes("completedMatch") &&
    sponsorDashboardPage.indexOf("loadSponsorFolder") <
      sponsorDashboardPage.indexOf("setLoading(false)"),
  "The dashboard waits for signed or funded Matches before leaving the loading state"
);
assert(
  offerService.includes("pairSignedSponsorships(allOffers, signatures") &&
    offerService.includes("brandName,"),
  "The sponsor folder pairs signatures against every brand offer, not the lock-filtered inbox"
);
assert(
  sponsorNewSponsorshipPath() === `${SPONSOR_DASHBOARD_PATH}?new=1` &&
    isNewSponsorshipRequest("?new=1") &&
    !isNewSponsorshipRequest(""),
  "New Sponsorship opens the lock-in flow from the signed-off home"
);
const signedHomeSource = readFileSync(
  "app/components/sponsor/SignedSponsorHome.tsx",
  "utf8"
);
const sportingBoard = readFileSync(
  "app/components/sponsor/SportingCalendarBoard.tsx",
  "utf8"
);
const cistSource = readFileSync(
  "app/components/sponsor/SponsorCistTable.tsx",
  "utf8"
);
assert(
  sponsorDashboardPage.includes("SignedSponsorHome") &&
    sponsorDashboardPage.includes("lock={lock}") &&
    signedHomeSource.includes("picksForSignedSponsorHome") &&
    signedHomeSource.includes("SportingCalendarBoard") &&
    !signedHomeSource.includes("SponsoredMatchCalendar") &&
    signedHomeSource.includes("SPONSOR_NEW_SPONSORSHIP_LABEL") &&
    signedHomeSource.includes('role="tab"') &&
    signedHomeSource.includes("sponsorLogoSrc") &&
    signedHomeSource.indexOf("<SponsorCistTable") <
      signedHomeSource.indexOf('role="tab"') &&
    sportingBoard.includes("calendarDatesInMonth") &&
    sportingBoard.includes("BrandMark") &&
    sportingBoard.includes("Signed in as {brandName}") &&
    cistSource.includes("Impact Moments") &&
    cistSource.includes("Climate Impact") &&
    readFileSync(
      "app/sponsor/offers/OfferSignOff.tsx",
      "utf8"
    ).includes("router.replace(sponsorHomePath(signed.brandName)"),
  "After sign-off the dashboard is the all-inclusive Sporting Calendar, funded projects, CIST and New Sponsorship"
);

if (failures.length > 0) {
  console.error("verify-sponsor-dashboard failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("verify-sponsor-dashboard: ok");
