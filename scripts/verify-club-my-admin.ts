import { readFileSync } from "fs";
import {
  CLUB_ADMIN_PATH,
  CLUB_DASHBOARD_PATH,
  CLUB_SELECT_PROJECTS_PATH,
} from "../app/lib/routes";
import {
  CLUB_CHOOSE_PROJECTS_NOTE,
  CLUB_CHOOSE_PROJECTS_STEPS,
  SELECT_CLIMATE_PROJECTS_LABEL,
  clubDashboardChosenProjectsCopy,
  clubDashboardClimateProjectsIntroCopy,
} from "../app/lib/partner-projects";
import {
  clubAddressBookListingId,
  clubAddressBookPrompt,
  clubAddressBookSubtitle,
  clubAddressBookTitle,
  normalizeContact,
  sponsorListingFromAddressBookContact,
} from "../app/lib/club-address-book";
import {
  clubMatchDayLabel,
  clubSelectedMatchFixtureLabel,
  matchesClubSelectedMatch,
} from "../app/lib/club-selected-match";
import {
  GLOBAL_BRAND_INVITE_COUNT,
  LOCAL_BUSINESS_INVITE_COUNT,
  MIN_LEAD_CLIMATE_SPONSOR_INVITES_EXCLUSIVE,
  MIN_LOCAL_BUSINESS_INVITES_EXCLUSIVE,
  SEND_INVITATIONS_LABEL,
} from "../app/lib/sponsor-listings";
import { howS4pSelectMatchCopy } from "../app/lib/how-s4p-works";
import { ciltBaselineStanding } from "../app/lib/cilt";
import {
  FAN_FOOTPRINT_NAME,
  FAN_FOOTPRINT_TABS,
  fanFootprintReport,
} from "../app/lib/fan-footprint";
import { formatMoney } from "../app/lib/sponsorship-auction";

const failures: string[] = [];

function assert(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

assert(CLUB_ADMIN_PATH === "/club/admin", "My Admin lives at /club/admin");
assert(
  formatMoney(1320) === "£1,320",
  "Collapsed sponsorships end on Match-Sponsorship: £1,320"
);
assert(
  ciltBaselineStanding("Rangers")?.league === "Scottish Premiership" &&
    ciltBaselineStanding("Rangers")?.position === 2 &&
    ciltBaselineStanding("Rangers")?.size === 12,
  "Rangers FanFootprint league position uses the Scottish Premiership table"
);
assert(
  FAN_FOOTPRINT_NAME === "FanFootprint Analytics" &&
    FAN_FOOTPRINT_TABS.map((row) => row.label).join(",") ===
      "Core Dashboard,Match Analysis,Scenario Simulator,Compliance,Commercial" &&
    fanFootprintReport({ clubName: "Rangers" }).clubName === "Rangers" &&
    fanFootprintReport({ clubName: "Rangers" }).leagueName ===
      "Scottish Premiership",
  "FanFootprint Analytics is the Sustainability Director reference board"
);
assert(
  SELECT_CLIMATE_PROJECTS_LABEL === "Select Climate Projects",
  "Choose Projects defaults to the blue Select Climate Projects label"
);
assert(
  clubDashboardClimateProjectsIntroCopy().includes(SELECT_CLIMATE_PROJECTS_LABEL),
  "Dashboard intro points at the blue Select Climate Projects button"
);
assert(
  CLUB_CHOOSE_PROJECTS_STEPS.length === 4 &&
    clubDashboardChosenProjectsCopy().includes(CLUB_CHOOSE_PROJECTS_STEPS[0]) &&
    clubDashboardChosenProjectsCopy().includes('Press "Send Invitations"') &&
    clubDashboardChosenProjectsCopy().includes(CLUB_CHOOSE_PROJECTS_NOTE) &&
    CLUB_CHOOSE_PROJECTS_NOTE.includes("more than 1 Lead Climate Sponsor") &&
    CLUB_CHOOSE_PROJECTS_NOTE.includes("more than 5 Local Business Climate Sponsors"),
  "Address Book and Send Invitations copy still exists for My Admin"
);
assert(
  GLOBAL_BRAND_INVITE_COUNT === 1 &&
    LOCAL_BUSINESS_INVITE_COUNT === 4 &&
    MIN_LEAD_CLIMATE_SPONSOR_INVITES_EXCLUSIVE === 1 &&
    MIN_LOCAL_BUSINESS_INVITES_EXCLUSIVE === 5,
  "Invite more than 1 Lead Climate Sponsor and more than 5 Local Business Climate Sponsors"
);
assert(
  SEND_INVITATIONS_LABEL === "Send Invitations",
  "Sponsors send with Send Invitations"
);

const clubCopy = howS4pSelectMatchCopy("club");
assert(
  clubCopy.title === "Select the Match" &&
    clubCopy.caption.includes("Select the Match you want to get sponsorship for") &&
    clubCopy.caption.includes("fixtures are in this list") &&
    !clubCopy.caption.includes("on this phone"),
  "Club Select Match heading is Select the Match"
);

assert(
  clubMatchDayLabel(
    {
      club: "Everton",
      matchId: "m1",
      fixtureName: "Newcastle United v Everton",
      league: "Premier League",
      date: "2026-11-02",
      kickoff: "20:00",
      venue: "St. James' Park",
      savedAt: "2026-11-02T00:00:00.000Z",
    },
    "Everton"
  ) === "Newcastle United vs Everton" &&
    clubSelectedMatchFixtureLabel({
      fixtureName: "Everton v Coventry City",
    }) === "Everton vs Coventry City" &&
    matchesClubSelectedMatch(
      { id: "m1", fixtureName: "Newcastle United v Everton" },
      {
        club: "Everton",
        matchId: "m1",
        fixtureName: "Newcastle United v Everton",
        league: "Premier League",
        date: "2026-11-02",
        kickoff: "20:00",
        venue: "St. James' Park",
        savedAt: "2026-11-02T00:00:00.000Z",
      }
    ),
  "The tapped fixture is the registered Match Day label for the rest of the process"
);

const contact = normalizeContact({
  name: "Alex Brand",
  email: "alex@brand.test",
  businessName: "Brand Co",
  phone: "01234567890",
});
assert(
  Boolean(contact) &&
    clubAddressBookTitle("lead") === "Address Book 1" &&
    clubAddressBookTitle("local") === "Address Book 2" &&
    clubAddressBookSubtitle("lead").includes("Lead Climate Sponsors") &&
    clubAddressBookPrompt("lead") ===
      "Enter details of New Lead Climate Sponsors" &&
    clubAddressBookPrompt("local") ===
      "Enter details of New Local Business Climate Sponsors" &&
    clubAddressBookSubtitle("local").includes("Local Business") &&
    sponsorListingFromAddressBookContact(contact!, "lead").kind === "global" &&
    sponsorListingFromAddressBookContact(contact!, "local").kind === "local" &&
    clubAddressBookListingId("lead", contact!.id).startsWith("ab:lead:"),
  "Address Book 1 is Lead Climate Sponsors and Address Book 2 is Local Businesses"
);

const nav = readFileSync("app/components/club/ClubNav.tsx", "utf8");
assert(
  nav.includes('label: "Select Match"') &&
    nav.includes('label: "Choose Projects"') &&
    nav.includes('label: "My Admin"') &&
    nav.includes("CLUB_ADMIN_PATH") &&
    nav.includes("CLUB_SELECT_PROJECTS_PATH") &&
    nav.includes("text-base sm:text-lg") &&
    !nav.includes('label: "Dashboard"') &&
    !nav.includes('label: "Climate Projects"'),
  "Club nav is Select Match, Choose Projects, Sponsors, My Admin"
);

const how = readFileSync("app/components/home/HowS4pSelectMatch.tsx", "utf8");
const fixtures = readFileSync(
  "app/components/home/SelectMatchFixtures.tsx",
  "utf8"
);
assert(
  how.includes("copy.title") &&
    how.includes('audience === "club"') &&
    how.includes("text-4xl") &&
    how.includes("md:text-6xl") &&
    fixtures.includes("rememberClubSelectedMatch") &&
    fixtures.includes("persistClubMatch") &&
    fixtures.includes('if (mode === "club") return null') &&
    fixtures.includes("text-[10px]") &&
    fixtures.includes("text-base sm:text-lg") &&
    fixtures.includes('framed={mode !== "club"}') &&
    fixtures.includes("data-select-this-match") &&
    fixtures.includes("sm:text-base md:text-lg"),
  "Select the Match type is larger and a club tap registers the fixture"
);

const dashboard = readFileSync("app/club/dashboard/page.tsx", "utf8");
const picker = readFileSync("app/club/projects/select/page.tsx", "utf8");
const admin = readFileSync("app/club/admin/page.tsx", "utf8");
const sponsors = readFileSync("app/club/sponsors/page.tsx", "utf8");
const listings = readFileSync(
  "app/components/club/ClubSponsorsListings.tsx",
  "utf8"
);
assert(
  dashboard.includes("HowS4pSelectMatch") &&
    dashboard.includes("ClubChooseProjectsCopy") &&
    dashboard.includes("SELECT_CLIMATE_PROJECTS_LABEL") &&
    dashboard.includes("hydrateLocalSponsorRecords") &&
    !dashboard.includes("Club Representative") &&
    !dashboard.includes("Start this club afresh") &&
    !dashboard.includes("Selected and Funded Projects, kept for lookback") &&
    !dashboard.includes("S4P Climate Impact League Table") &&
    !dashboard.includes("<ClubClimateSponsorTabs"),
  "Select Match stays on login landing; lookback, CILT and Brands Our Climate Sponsors leave the dashboard"
);

const preview = readFileSync("app/preview/club-admin/page.tsx", "utf8");
assert(
  preview.includes("ClubAdminLookbackAndCilt") &&
    !preview.includes("ClubAddressBookPanel") &&
    preview.includes("Match Day File Record") === false,
  "My Admin preview renders lookback and CILT without Address Books"
);

const overlay = readFileSync("apply-club-my-admin.mjs", "utf8");
const localService = readFileSync(
  "app/services/local-sponsor.service.ts",
  "utf8"
);
assert(
  overlay.includes("app/services/local-sponsor.service.ts") &&
    overlay.includes("app/lib/local-sponsor.ts") &&
    overlay.includes("app/components/club/ClubAdminLookbackAndCilt.tsx") &&
    overlay.includes("app/components/club/ClubClimateProjectScopeChooser.tsx") &&
    overlay.includes('BUST = "club-my-admin-pc-7"') &&
    overlay.includes("app/components/home/PhoneFrame.tsx") &&
    overlay.includes('framed={mode !== "club"}') &&
    overlay.includes("S4P_OVERLAY_SELF") &&
    overlay.includes("dashboardSrc.includes") &&
    localService.includes("export async function hydrateLocalSponsorRecords"),
  "PC overlay refreshes itself and pulls lookback/CILT onto My Admin"
);
const chooser = readFileSync(
  "app/components/club/ClubClimateProjectScopeChooser.tsx",
  "utf8"
);
assert(
  picker.includes("SELECT_CLIMATE_PROJECTS_LABEL") &&
    picker.includes("ClubClimateProjectScopeChooser") &&
    picker.includes("SEND_INVITATION_LABEL") &&
    picker.includes("CLUB_SPONSORS_ADDRESS_BOOKS_PATH") &&
    picker.includes("ClubSelectedMatchBanner") &&
    chooser.includes("bg-blue-600") &&
    chooser.includes("climateProjectScopeButtonLabel"),
  "Choose Projects opens Local, National and International lists, then Send Invitation to Sponsors"
);
assert(
    admin.includes("My Admin") &&
    admin.includes("Club Representative") &&
    admin.includes("Start this club afresh") &&
    !admin.includes("ClubAddressBookPanel") &&
    admin.includes("ClubAdminLookbackAndCilt"),
  "My Admin combines club stats, the representative, lookback and CILT"
);

const lookback = readFileSync(
  "app/components/club/ClubAdminLookbackAndCilt.tsx",
  "utf8"
);
assert(
  lookback.includes("Match Day File Record") &&
    lookback.includes("Selected and Funded Projects, kept for lookback") &&
    lookback.includes("clubDashboardLookbackCopy") &&
    lookback.includes("S4P Climate Impact League Table") &&
    lookback.includes("climateImpactLeagueTable") &&
    lookback.includes("Download file record") &&
    lookback.includes('data-lookback-accordion="lookback-accordion-v1"') &&
    lookback.includes("aria-expanded") &&
    lookback.includes("Match-Sponsorship:") &&
    lookback.includes("FanFootprintAnalytics"),
  "My Admin holds the Match Day File Record, collapsed sponsorships, FanFootprint and CILT"
);
const footprintUi = readFileSync(
  "app/components/club/FanFootprintAnalytics.tsx",
  "utf8"
);
assert(
  footprintUi.includes("Travel Emissions per Match") &&
    footprintUi.includes("Transport Mode Split") &&
    footprintUi.includes("Export Report") &&
    footprintUi.includes("FAN_FOOTPRINT_FUTURE_NOTE") &&
    readFileSync("app/globals.css", "utf8").includes(
      '[data-fan-footprint="fan-footprint-v1"]'
    ),
  "FanFootprint Analytics matches the Core Dashboard layout"
);
assert(
    sponsors.includes("resolveClubSelectedMatch") &&
    sponsors.includes("sponsorListingsFromAddressBooks") &&
    sponsors.includes("ClubSponsorsAddressBooks") &&
    !sponsors.includes('invite("all")') &&
    listings.includes("SEND_INVITATIONS_LABEL") &&
    listings.includes("EXISTING_SPONSORS_HEADING") &&
    !listings.includes("onInviteAll") &&
    listings.includes("club-sponsors-invite-counts-v1"),
  "Sponsors use the registered Match, Address Books, Existing Sponsors and one Send Invitations button"
);
assert(
  CLUB_DASHBOARD_PATH === "/club/dashboard" &&
    CLUB_SELECT_PROJECTS_PATH === "/club/s4p-climate-projects",
  "Login still lands on Select Match; Choose Projects is the picker path"
);

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(
  "Club My Admin, Select Match persistence, and Choose Projects copy are in place."
);
