import { readFileSync } from "fs";
import {
  CLUB_HOW_IT_WORKS_LABEL,
  CLUB_HOW_IT_WORKS_STAMP,
  isClubHowItWorksPath,
} from "../app/lib/club-how-it-works";
import {
  CLUB_ADMIN_PATH,
  CLUB_DASHBOARD_PATH,
  CLUB_SELECT_PROJECTS_PATH,
  CLUB_SPONSORS_PATH,
} from "../app/lib/routes";
import {
  GO_TO_EXISTING_SPONSORS_LABEL,
  sponsorsSectionIntroCopy,
} from "../app/lib/sponsor-listings";

const failures: string[] = [];

function assert(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

assert(
  CLUB_HOW_IT_WORKS_LABEL === "How it works" &&
    CLUB_HOW_IT_WORKS_STAMP === "club-how-it-works-flow-v1" &&
    isClubHowItWorksPath(CLUB_DASHBOARD_PATH) &&
    isClubHowItWorksPath(CLUB_SELECT_PROJECTS_PATH) &&
    isClubHowItWorksPath(CLUB_SPONSORS_PATH) &&
    isClubHowItWorksPath("/preview/club-choose-projects") &&
    !isClubHowItWorksPath(CLUB_ADMIN_PATH),
  "How it works covers Select Match, Choose Projects and Sponsors"
);

assert(
  sponsorsSectionIntroCopy() ===
    `Register new Lead Climate Sponsors in Address Book 1; and new Local Business Climate Sponsors in Address Book 2. Alternatively, click the "${GO_TO_EXISTING_SPONSORS_LABEL}" Tab to make your selection.` &&
    GO_TO_EXISTING_SPONSORS_LABEL === "Go to Existing Sponsors" &&
    !sponsorsSectionIntroCopy().includes("American Express") &&
    !sponsorsSectionIntroCopy().includes("locked in") &&
    !sponsorsSectionIntroCopy().includes("Invite more than"),
  "Sponsors intro is Address Book 1/2 plus Go to Existing Sponsors only"
);

const nav = readFileSync("app/components/club/ClubNav.tsx", "utf8");
const dashboard = readFileSync("app/club/dashboard/page.tsx", "utf8");
const picker = readFileSync("app/club/projects/select/page.tsx", "utf8");
const listings = readFileSync(
  "app/components/club/ClubSponsorsListings.tsx",
  "utf8"
);
const books = readFileSync(
  "app/components/club/ClubSponsorsAddressBooks.tsx",
  "utf8"
);
const card = readFileSync(
  "app/components/climate/ClimatePartnerSupplyCard.tsx",
  "utf8"
);
const chooser = readFileSync(
  "app/components/club/ClubClimateProjectScopeChooser.tsx",
  "utf8"
);
const fixtures = readFileSync(
  "app/components/home/SelectMatchFixtures.tsx",
  "utf8"
);

assert(
  nav.includes(`label: CLUB_HOW_IT_WORKS_LABEL`) &&
    nav.includes('label: "My Admin"') &&
    nav.includes("Logout") &&
    !nav.includes('label: "Select Match"') &&
    !nav.includes('label: "Choose Projects"') &&
    !nav.includes('label: "Sponsors"') &&
    nav.includes("isClubHowItWorksPath") &&
    nav.includes("CLUB_HOW_IT_WORKS_STAMP"),
  "Club headings are How it works, My Admin and Logout"
);

assert(
  dashboard.includes("onClubMatchSelected") &&
    dashboard.includes("CLUB_SELECT_PROJECTS_PATH") &&
    !dashboard.includes("ClubChooseProjectsCopy") &&
    !dashboard.includes("SELECT_CLIMATE_PROJECTS_LABEL") &&
    fixtures.includes("onClubMatchSelected?.(match)"),
  "Selecting a Match moves the Club on to Choose Projects"
);

assert(
  picker.includes("ClubChooseProjectsCopy") &&
    picker.includes("ClubClimateProjectScopeChooser") &&
    picker.includes("listOpen") &&
    picker.includes("SELECT_CLIMATE_PROJECTS_LABEL") &&
    picker.includes("ClimatePartnerSupplyCard") &&
    picker.includes("SEND_INVITATION_LABEL") &&
    picker.includes("CLUB_SPONSORS_ADDRESS_BOOKS_PATH") &&
    chooser.includes("CLIMATE_PROJECT_SCOPE_PROMPT") &&
    chooser.includes("selected === scope"),
  "Choose Projects shows Image 3 plus the current copy before Select Climate Projects opens the list"
);

assert(
  card.includes("climate-platform-project-card-v1") &&
    card.includes("ClimateProjectCivBlock") &&
    card.includes('tone="paper"') &&
    card.includes("h-16") &&
    card.includes("Project details") &&
    card.includes("climateImpactTags"),
  "Every platform Climate Project card uses funding progress, a smaller photo and an accordion"
);

assert(
  listings.includes("sponsorsSectionIntroCopy") &&
    !listings.includes("is locked in") &&
    !listings.includes("American Express") &&
    books.includes("GO_TO_EXISTING_SPONSORS_LABEL") &&
    !books.includes("Go to {EXISTING_SPONSORS_HEADING}"),
  "Send Invitation lands on the short Sponsors copy with Go to Existing Sponsors"
);

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(
  "Club How it works is three headings: Select Match, then Choose Projects, then Sponsors."
);
