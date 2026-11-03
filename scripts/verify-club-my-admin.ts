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
  SEND_INVITATIONS_LABEL,
} from "../app/lib/sponsor-listings";
import { howS4pSelectMatchCopy } from "../app/lib/how-s4p-works";

const failures: string[] = [];

function assert(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

assert(CLUB_ADMIN_PATH === "/club/admin", "My Admin lives at /club/admin");
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
    CLUB_CHOOSE_PROJECTS_NOTE.includes("1 Lead Climate Sponsor") &&
    CLUB_CHOOSE_PROJECTS_NOTE.includes("4 Local Business Climate Sponsors"),
  "Choose Projects copy is the numbered Address Book / Send Invitations steps"
);
assert(
  GLOBAL_BRAND_INVITE_COUNT === 1 && LOCAL_BUSINESS_INVITE_COUNT === 4,
  "Only 1 Lead Climate Sponsor and 4 Local Business Climate Sponsors are eligible"
);
assert(
  SEND_INVITATIONS_LABEL === "Send Invitations",
  "Sponsors send with Send Invitations"
);

const clubCopy = howS4pSelectMatchCopy("club");
assert(
  clubCopy.title === "Select the Match" &&
    clubCopy.caption.includes("Select the Match you want to get sponsorship for"),
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
    clubAddressBookSubtitle("local").includes("Local Business") &&
    sponsorListingFromAddressBookContact(contact!, "lead").kind === "global" &&
    sponsorListingFromAddressBookContact(contact!, "local").kind === "local" &&
    clubAddressBookListingId("lead", contact!.id).startsWith("ab:lead:"),
  "My Admin keeps Address Book 1 for Lead Climate Sponsors and Address Book 2 for Local Businesses"
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
    fixtures.includes("text-base sm:text-lg"),
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
    !dashboard.includes("S4P Climate Impact League Table"),
  "Select Match stays on login landing; Images 3 and 4, lookback and CILT leave the dashboard"
);

const preview = readFileSync("app/preview/club-admin/page.tsx", "utf8");
assert(
  preview.includes("ClubAdminLookbackAndCilt") &&
    preview.includes("Match Day File Record") === false,
  "My Admin preview renders the shared lookback and CILT component"
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
    overlay.includes('BUST = "club-my-admin-pc-5"') &&
    overlay.includes("S4P_OVERLAY_SELF") &&
    overlay.includes("dashboardSrc.includes") &&
    localService.includes("export async function hydrateLocalSponsorRecords"),
  "PC overlay refreshes itself and pulls lookback/CILT onto My Admin"
);
assert(
  picker.includes("SELECT_CLIMATE_PROJECTS_LABEL") &&
    picker.includes("id=\"select-climate-projects\"") &&
    picker.includes("ClubChooseProjectsCopy") &&
    picker.includes("ClubSelectedMatchBanner") &&
    picker.includes("bg-blue-600"),
  "Choose Projects opens on the blue Select Climate Projects picker"
);
assert(
  admin.includes("My Admin") &&
    admin.includes("Club Representative") &&
    admin.includes("Start this club afresh") &&
    admin.includes('kind="lead"') &&
    admin.includes('kind="local"') &&
    admin.includes("ClubAddressBookPanel") &&
    admin.includes("ClubAdminLookbackAndCilt"),
  "My Admin combines club stats, the representative, lookback, CILT, and two address books"
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
    lookback.includes("Download file record"),
  "My Admin holds the Match Day File Record and CILT sections"
);
assert(
  sponsors.includes("resolveClubSelectedMatch") &&
    sponsors.includes("sponsorListingsFromAddressBooks") &&
    sponsors.includes('invite("all")') &&
    listings.includes("SEND_INVITATIONS_LABEL") &&
    listings.includes("CLUB_ADMIN_PATH") &&
    listings.includes("onInviteAll"),
  "Sponsors use the registered Match, Address Books, and Send Invitations"
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
