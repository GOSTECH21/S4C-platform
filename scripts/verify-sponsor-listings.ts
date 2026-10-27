import { readFileSync } from "fs";
import {
  MATCH_DAY_APPROVED_LABEL,
  MATCH_DAY_PENDING_APPROVAL_LABEL,
  MATCH_DAY_PROJECT_COUNT,
  clubDashboardChosenProjectsCopy,
} from "../app/lib/partner-projects";
import {
  LOCAL_SPONSOR_HOME_PATH,
  SPONSOR_INVITATIONS_PATH,
  localSponsorLoginPath,
} from "../app/lib/routes";
import {
  GLOBAL_BRANDS_TAB_LABEL,
  GLOBAL_BRAND_INVITE_COUNT,
  GLOBAL_COMMITMENT_FEE_RANGES,
  GLOBAL_INVITE_SUBJECT,
  GLOBAL_INVITE_WINDOW_HOURS,
  GLOBAL_SPONSORSHIP_GOAL_RANGES,
  GLOBAL_SPONSORS_ACCEPTED_PER_MATCH,
  INVITE_COMMITMENT_FEE_LABEL,
  INVITE_GBP_PER_GOAL_LABEL,
  INVITE_LOCKED_NEXT_COPY,
  INVITE_MAXIMUM_LABEL,
  INVITE_PROCEED_APPROVAL_LABEL,
  LOCAL_INVITE_AMOUNT_LABEL,
  LOCAL_INVITE_NEXT_COPY,
  LOCAL_INVITE_SIGN_LABEL,
  LOCAL_BUSINESS_INVITE_COUNT,
  LOCAL_BUSINESS_TAB_LABEL,
  LOCAL_INVITE_SUBJECT,
  LOCAL_SPONSORSHIP_AMOUNT_RANGES,
  SPONSORS_SECTION_TITLE,
  approvedProjectIdsFromInvite,
  commitGlobalSponsorship,
  createInviteRound,
  invitationCountForBrand,
  inviteReceiptsForKind,
  localInvitesDeliveredCopy,
  localInvitesSentCopy,
  lockedInviteSummary,
  sponsorInvitationsNavLabel,
  globalInvitationEmailBody,
  listingsOfKind,
  localInvitationEmailBody,
  mergeSeededSponsorListings,
  requireExactInviteCount,
  resolveInviteRound,
  seededSponsorListings,
  sponsorsSectionIntroCopy,
  upsertSponsorListing,
} from "../app/lib/sponsor-listings";

const failures: string[] = [];

function assert(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

const listings = seededSponsorListings();
const globals = listingsOfKind(listings, "global");
const locals = listingsOfKind(listings, "local");
assert(SPONSORS_SECTION_TITLE === "Sponsors", "Standalone section is titled Sponsors");
assert(
  GLOBAL_BRANDS_TAB_LABEL === "Global Brands" &&
    LOCAL_BUSINESS_TAB_LABEL === "Local Business Sponsors",
  "Sponsors splits into Global Brands and Local Business Sponsors"
);
assert(
  globals.length >= GLOBAL_BRAND_INVITE_COUNT &&
    locals.length >= LOCAL_BUSINESS_INVITE_COUNT,
  "Directory seeds enough Global Brands and Local Businesses to invite"
);
assert(
  globals.every((row) => row.commitmentFeeRangeId && row.sponsorshipGoalRangeId) &&
    locals.every((row) => row.amountRangeId),
  "Global listings carry fee and goal ranges; locals carry an amount range"
);
assert(
  GLOBAL_COMMITMENT_FEE_RANGES.length >= 4 &&
    GLOBAL_SPONSORSHIP_GOAL_RANGES.length >= 4 &&
    LOCAL_SPONSORSHIP_AMOUNT_RANGES.length >= 4,
  "Register forms have Commitment Fee, Sponsorship/Goal, and local amount ranges"
);

const registered = upsertSponsorListing(listings, {
  id: "",
  kind: "global",
  brandName: "New Global Co",
  contactName: "Pat",
  email: "pat@newglobal.test",
  commitmentFeeRangeId: "fee-5-10",
  sponsorshipGoalRangeId: "goal-3-5",
  createdAt: "2026-10-26T09:00:00.000Z",
  source: "registered",
});
assert(
  listingsOfKind(registered, "global").some((row) => row.brandName === "New Global Co") &&
    mergeSeededSponsorListings([]).length === listings.length,
  "Sign-up upserts a listing onto the same directory used by clubs"
);

assert(
  requireExactInviteCount(globals.slice(0, 4).map((row) => row.id), 5, "global") &&
    requireExactInviteCount(globals.slice(0, 5).map((row) => row.id), 5, "global") === null &&
    requireExactInviteCount(locals.slice(0, 10).map((row) => row.id), 10, "local") === null,
  "SD must tick exactly 5 Global Brands and 10 Local Businesses"
);

const sentAt = "2026-10-26T09:00:00.000Z";
const projectIds = ["gss", "cook", "mangrove", "solar", "amazon"];
const round = createInviteRound({
  clubId: "hearts",
  clubName: "Hearts",
  directorName: "Alex Director",
  matchLabel: "Hearts v Rangers",
  projectIds,
  projectNames: ["Global Schools Solar", "Cookstoves", "Mangroves", "Solar", "Amazon"],
  globalInviteeIds: globals.slice(0, 5).map((row) => row.id),
  localInviteeIds: locals.slice(0, 10).map((row) => row.id),
  sentAt,
});
assert(
  round.expiresAt === "2026-10-26T17:00:00.000Z" &&
    GLOBAL_INVITE_WINDOW_HOURS === 8 &&
    GLOBAL_SPONSORS_ACCEPTED_PER_MATCH === 1,
  "Global invitations open an 8-hour window and accept only one sponsor"
);

const low = commitGlobalSponsorship(
  round,
  globals[0],
  8000,
  "2026-10-26T10:00:00.000Z"
);
assert(
  low.locked &&
    low.round.lockedBrandName === globals[0].brandName &&
    approvedProjectIdsFromInvite(low.round).join(",") === projectIds.join(","),
  "First Global Brand commitment within 8 hours locks in and approves the five projects"
);

const high = commitGlobalSponsorship(
  low.round,
  globals[1],
  15000,
  "2026-10-26T12:00:00.000Z"
);
assert(
  high.round.lockedBrandName === globals[1].brandName &&
    high.round.lockedAmountGbp === 15000 &&
    GLOBAL_SPONSORS_ACCEPTED_PER_MATCH === 1,
  "A higher amount inside the window replaces the locked Global Brand; still only one accepted"
);
const funded = commitGlobalSponsorship(
  high.round,
  globals[0],
  {
    commitmentFeeGbp: 4000,
    gbpPerGoal: 6000,
    maximumSponsorshipGbp: 18000,
  },
  "2026-10-26T13:00:00.000Z"
);
assert(
  funded.round.lockedBrandName === globals[0].brandName &&
    funded.round.lockedAmountGbp === 18000 &&
    funded.round.commitments.find((row) => row.listingId === globals[0].id)
      ?.gbpPerGoal === 6000,
  "Highest Maximum Sponsorship wins; Commitment Fee and Sponsorship/Goal-Scored are stored"
);
assert(
  sponsorInvitationsNavLabel(0) === "Invitations" &&
    sponsorInvitationsNavLabel(1) === "Invitations (1)" &&
    sponsorInvitationsNavLabel(2) === "Invitations (2)" &&
    invitationCountForBrand([funded.round], globals[0].brandName, listings) === 1,
  "Invitations tab shows the number of club invites waiting"
);
assert(
  lockedInviteSummary({ amountGbp: 13000 }).includes("13,000") &&
    !lockedInviteSummary({ amountGbp: 13000 }).includes("undefined") &&
    lockedInviteSummary({
      amountGbp: 18000,
      commitmentFeeGbp: 4000,
      gbpPerGoal: 6000,
      maximumSponsorshipGbp: 18000,
    }).includes("4,000") &&
    lockedInviteSummary(undefined, 13000).includes("13,000"),
  "Lock-in copy formats old single amounts and the three new funding fields"
);

const late = commitGlobalSponsorship(
  high.round,
  globals[2],
  20000,
  "2026-10-26T18:00:00.000Z"
);
assert(
  Boolean(late.error) && late.round.lockedBrandName === globals[1].brandName,
  "Commitments after 8 hours are rejected; the highest in-window amount stays locked"
);

const frozen = resolveInviteRound(high.round, "2026-10-26T18:00:00.000Z");
assert(
  frozen.lockedBrandName === globals[1].brandName &&
    approvedProjectIdsFromInvite(frozen).length === MATCH_DAY_PROJECT_COUNT,
  "After the window, pending approval projects stay Approved for the winning brand"
);

const globalMail = globalInvitationEmailBody({
  clubName: "Hearts",
  directorName: "Alex Director",
  brandName: "Diageo",
  matchLabel: "Hearts v Rangers",
  expiresAt: round.expiresAt,
});
assert(
  globalMail.includes("Invitation to Sponsor") &&
    globalMail.includes("Only 1 Global Brand Sponsor will be accepted") &&
    globalMail.includes("within 8 hours") &&
    globalMail.includes("highest amount"),
  "Global invitation email states one winner, 8 hours, and highest amount"
);
assert(
  localInvitationEmailBody({
    clubName: "Hearts",
    directorName: "Alex Director",
    brandName: "Mash Tun",
    matchLabel: "Hearts v Rangers",
  }).includes("simple Invitation to Sponsor"),
  "Local invitation email is a simple Invitation to Sponsor"
);

assert(
  clubDashboardChosenProjectsCopy().includes("Invitation to Sponsor") &&
    clubDashboardChosenProjectsCopy().includes(MATCH_DAY_PENDING_APPROVAL_LABEL) &&
    clubDashboardChosenProjectsCopy().includes(MATCH_DAY_APPROVED_LABEL) &&
    clubDashboardChosenProjectsCopy().includes("published to your fans") &&
    sponsorsSectionIntroCopy().includes("listed only here"),
  "Club copy sends the SD from chosen projects to Sponsors listings, then lock-in publishes to fans"
);

const nav = readFileSync("app/components/club/ClubNav.tsx", "utf8");
const sponsorsPage = readFileSync("app/club/sponsors/page.tsx", "utf8");
const dashboard = readFileSync("app/club/dashboard/page.tsx", "utf8");
const globalRegister = readFileSync("app/sponsor/register/page.tsx", "utf8");
const localRegister = readFileSync("app/sponsor/local/register/page.tsx", "utf8");
assert(
  nav.includes('label: "Sponsors"') &&
    nav.includes("CLUB_SPONSORS_PATH") &&
    sponsorsPage.includes("ClubSponsorsListings") &&
    dashboard.includes("Open Sponsors listings") &&
    dashboard.includes("approvedIdsForClubMatch") &&
    readFileSync("app/club/projects/select/page.tsx", "utf8").includes(
      "CLUB_SPONSORS_PATH"
    ),
  "Club nav Sponsors opens the listings; after choosing 5 projects the SD lands on invitations"
);
assert(
  globalRegister.includes("Commitment Fee Range") &&
    globalRegister.includes("Sponsorship/Goal range") &&
    globalRegister.includes("registerSponsorListing") &&
    localRegister.includes("Sponsorship amount range") &&
    localRegister.includes('kind: "local"'),
  "Global and Local sign-up write range fields onto the Sponsors directory"
);
const invitePage = readFileSync("app/sponsor/invitations/page.tsx", "utf8");
const sponsorNav = readFileSync("app/sponsor/sponsor-nav.tsx", "utf8");
const inbox = readFileSync("app/components/sponsor/SponsorInviteInbox.tsx", "utf8");
assert(
  invitePage.includes("SponsorInviteInbox") &&
    !invitePage.includes("SponsorNav") &&
    readFileSync("app/sponsor/layout.tsx", "utf8").includes("SponsorNav") &&
    readFileSync("app/services/sponsor-listings.service.ts", "utf8").includes(
      "publishSignedSponsorshipToFans"
    ),
  "Invitations uses the header nav only, and lock-in publishes Approved projects to club fans"
);
assert(
  sponsorNav.includes("s4pTabClass(onInvitations)") &&
    sponsorNav.includes("s4pTabClass(onDashboard)") &&
    sponsorNav.includes("s4pTabClass(onCalendar)") &&
    sponsorNav.includes("sponsorInvitationsNavLabel") &&
    inbox.includes("INVITE_COMMITMENT_FEE_LABEL") &&
    inbox.includes("INVITE_GBP_PER_GOAL_LABEL") &&
    inbox.includes("INVITE_MAXIMUM_LABEL") &&
    INVITE_COMMITMENT_FEE_LABEL === "Commitment Fee (Day 1)" &&
    INVITE_GBP_PER_GOAL_LABEL === "Sponsorship/Goal-Scored" &&
    INVITE_MAXIMUM_LABEL === "Maximum Sponsorship Amount" &&
    INVITE_LOCKED_NEXT_COPY === "Proceed to Approval and Payment section" &&
    INVITE_PROCEED_APPROVAL_LABEL === "Proceed to Approval & Payment" &&
    inbox.includes("INVITE_LOCKED_NEXT_COPY") &&
    inbox.includes("INVITE_PROCEED_APPROVAL_LABEL") &&
    inbox.includes("prepareInviteApprovalPath") &&
    !inbox.includes("Projects are Approved") &&
    readFileSync("app/lib/routes.ts", "utf8").includes("sponsorInviteApprovalPath") &&
    readFileSync("app/sponsor/offers/OfferSignOff.tsx", "utf8").includes(
      "LEAD_APPROVED_SECTION_ID"
    ) &&
    !readFileSync("app/sponsor/offers/OfferSignOff.tsx", "utf8").includes(
      "sponsorWalletPath"
    ) &&
    readFileSync("app/lib/routes.ts", "utf8").includes("sponsorPayPath") &&
    readFileSync("app/sponsor/wallet/page.tsx", "utf8").includes("sponsorPayPath") &&
    !readFileSync("app/sponsor/wallet/page.tsx", "utf8").includes(
      "Sign off this Match Day sponsorship"
    ),
  "After lock-in the green tab proceeds to Approval, then Pay, then the wallet confirmation and card payment"
);

const listingsUi = readFileSync("app/components/club/ClubSponsorsListings.tsx", "utf8");
const clubSponsorsPage = readFileSync("app/club/sponsors/page.tsx", "utf8");
const sendButtonIndex = listingsUi.indexOf("{sending ? \"Sending...\" : inviteLabel}");
const noticeAfterButton = listingsUi.indexOf("{notice &&", sendButtonIndex);
assert(
  sendButtonIndex >= 0 &&
    noticeAfterButton > sendButtonIndex &&
    !listingsUi.includes("window.open(") &&
    !clubSponsorsPage.includes("openInvitationMailtos") &&
    clubSponsorsPage.includes("noticeKind") &&
    listingsUi.includes("Stay on this page"),
  "Send Invitation stays on Sponsors and shows the sent notice under the green button"
);

const localRound = createInviteRound({
  clubId: "hearts",
  clubName: "Hearts",
  directorName: "Alex Director",
  matchLabel: "Hearts v Rangers",
  projectIds,
  projectNames: projectIds,
  localInviteeIds: locals.slice(0, LOCAL_BUSINESS_INVITE_COUNT).map((row) => row.id),
  sentAt: "2026-10-26T09:00:00.000Z",
});
const localReceipts = inviteReceiptsForKind(localRound, listings, "local");
assert(
  localInvitesSentCopy(10).includes("10 Local Business Climate Sponsors") &&
    localInvitesDeliveredCopy(10).includes("Invitations inbox") &&
    localReceipts.length === LOCAL_BUSINESS_INVITE_COUNT &&
    localReceipts.every((row) => row.status.includes("Invitations inbox")) &&
    Boolean(localRound.localInvitedAt) &&
    listingsUi.includes("inviteReceiptsForKind") &&
    listingsUi.includes("receipts.map"),
  "Local Business send lists each of the 10 invitees as delivered to their Invitations inbox"
);
assert(
  localSponsorLoginPath(2) === SPONSOR_INVITATIONS_PATH &&
    localSponsorLoginPath(0) === LOCAL_SPONSOR_HOME_PATH &&
    LOCAL_INVITE_AMOUNT_LABEL.includes("Sponsorship amount") &&
    LOCAL_INVITE_SIGN_LABEL === "Sign and proceed to Payment" &&
    LOCAL_INVITE_NEXT_COPY.includes("Terms & Conditions") &&
    inbox.includes("LOCAL_INVITE_SIGN_LABEL") &&
    inbox.includes("LOCAL_SIGNOFF_TERMS") &&
    inbox.includes("acceptLocalInviteSponsorship") &&
    !inbox.includes("when you are ready to pay") &&
    readFileSync("app/sponsor/login/page.tsx", "utf8").includes(
      "localSponsorLoginPath"
    ),
  "Local Business login opens invitations first; each invite has amount, Terms, sign, then Payment"
);

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log("Sponsors listings, 8-hour Global Brand lock-in, and local invites passed.");
