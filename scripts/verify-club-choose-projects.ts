import { readFileSync } from "fs";
import {
  CLUB_ADDRESS_BOOKS_ID,
  CLUB_ADMIN_ADDRESS_BOOKS_PATH,
  CLUB_SELECT_PROJECTS_PATH,
  CLUB_SPONSORS_ADDRESS_BOOKS_PATH,
  CLUB_SPONSORS_PATH,
} from "../app/lib/routes";
import {
  SELECT_CLIMATE_PROJECTS_LABEL,
  SEND_INVITATION_LABEL,
  clubDashboardClimateProjectsIntroCopy,
} from "../app/lib/partner-projects";
import {
  CLIMATE_PROJECT_SCOPE_PROMPT,
  CLIMATE_PROJECT_SCOPES,
  climateProjectScopeButtonLabel,
  climateProjectScopeHeading,
  climateProjectScopeLabel,
  climateProjectsForScope,
  otherClimateProjectScopes,
} from "../app/lib/s4p-climate-projects";
import { stadiumSiteForClub } from "../app/lib/project-site";
import { nearbyClimateProjectsForClub } from "../app/lib/stadium-nearby-projects";

const failures: string[] = [];

function assert(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

assert(
  clubDashboardClimateProjectsIntroCopy() ===
    "Press the blue Select Climate Projects button to choose only one Featured Global Schools Solar project and 4 Climate Partner Projects from List provided",
  "Choose Projects intro is the Press the blue Select Climate Projects sentence"
);
assert(
  SELECT_CLIMATE_PROJECTS_LABEL === "Select Climate Projects" &&
    SEND_INVITATION_LABEL === "Send Invitation to Sponsors",
  "Blue tab stays Select Climate Projects; after picks the button is Send Invitation to Sponsors"
);
assert(
  CLIMATE_PROJECT_SCOPES.join(",") === "local,national,international" &&
    climateProjectScopeLabel("local") === "Local" &&
    climateProjectScopeLabel("national") === "National" &&
    climateProjectScopeLabel("international") === "International" &&
    climateProjectScopeButtonLabel("local") === "Local Projects" &&
    climateProjectScopeHeading("national") === "National Climate Projects" &&
    otherClimateProjectScopes("local").join(",") === "national,international" &&
    otherClimateProjectScopes("national").join(",") === "local,international" &&
    otherClimateProjectScopes("international").join(",") === "local,national" &&
    CLIMATE_PROJECT_SCOPE_PROMPT ===
      "Which Climate Projects do you need to see?",
  "Climate Project lists are asked as Local, National and International"
);
assert(
  climateProjectsForScope("local", {
    local: ["national"],
    international: ["world"],
    nearby: ["stadium"],
  }).join(",") === "stadium" &&
    climateProjectsForScope("national", {
      local: ["national"],
      international: ["world"],
      nearby: ["stadium"],
    }).join(",") === "national" &&
    climateProjectsForScope("international", {
      local: ["national"],
      international: ["world"],
      nearby: ["stadium"],
    }).join(",") === "world",
  "Local is near the stadium, National is the country list, International is the world list"
);
assert(
  stadiumSiteForClub("Everton")?.postcode === "L3 0BT" &&
    nearbyClimateProjectsForClub("Everton").length > 0,
  "Everton Local Climate Projects use Hill Dickinson Stadium so the list is not empty"
);
assert(
  CLUB_ADDRESS_BOOKS_ID === "address-books" &&
    CLUB_SPONSORS_ADDRESS_BOOKS_PATH === `${CLUB_SPONSORS_PATH}#address-books` &&
    CLUB_ADMIN_ADDRESS_BOOKS_PATH === CLUB_SPONSORS_ADDRESS_BOOKS_PATH &&
    CLUB_SELECT_PROJECTS_PATH === "/club/s4p-climate-projects",
  "Send Invitation to Sponsors opens Sponsors Address Books"
);

const dashboard = readFileSync("app/club/dashboard/page.tsx", "utf8");
const chooser = readFileSync(
  "app/components/club/ClubChooseProjectsCopy.tsx",
  "utf8"
);
const picker = readFileSync("app/club/projects/select/page.tsx", "utf8");
const scopes = readFileSync(
  "app/components/club/ClubClimateProjectScopeChooser.tsx",
  "utf8"
);
const admin = readFileSync("app/club/admin/page.tsx", "utf8");
const preview = readFileSync(
  "app/preview/club-choose-projects/page.tsx",
  "utf8"
);
const overlay = readFileSync("apply-club-choose-projects.mjs", "utf8");

assert(
  dashboard.includes("onClubMatchSelected") &&
    dashboard.includes("clubDashboardProjectsSentCopy") &&
    dashboard.includes("CLUB_SELECT_MATCH_SENT_STAMP") &&
    !dashboard.includes("ClubChooseProjectsCopy") &&
    !dashboard.includes("SELECT_CLIMATE_PROJECTS_LABEL") &&
    !dashboard.includes("SendInvitationToSponsorsLink") &&
    !dashboard.includes("function ProjectGrid") &&
    !dashboard.includes("CLUB_CHOOSE_PROJECTS_STEPS") &&
    !chooser.includes("CLUB_CHOOSE_PROJECTS_STEPS") &&
    !dashboard.includes("<h2") &&
    !dashboard.includes("<ClubClimateSponsorTabs") &&
    !dashboard.includes("Our Climate Sponsors") &&
    !dashboard.includes("Open Sponsors listings"),
  "Dashboard is Select Match only; Choose Projects starts after the fixture is picked"
);
assert(
  chooser.includes("clubDashboardClimateProjectsIntroCopy") &&
    picker.includes("ClubChooseProjectsCopy") &&
    picker.includes("ClubClimateProjectScopeChooser") &&
    picker.includes("ClubClimateProjectScopeTabs") &&
    picker.includes("listOpen") &&
    picker.includes("SEND_INVITATION_LABEL") &&
    picker.includes("CLUB_SPONSORS_ADDRESS_BOOKS_PATH") &&
    picker.includes("ClimatePartnerSupplyCard") &&
    picker.includes("climatePartnerSupplyBadge") &&
    picker.includes("club-choose-projects-scopes-v1") &&
    scopes.includes("CLIMATE_PROJECT_SCOPE_PROMPT") &&
    scopes.includes("otherClimateProjectScopes") &&
    !admin.includes("ClubAddressBookPanel") &&
    preview.includes("ClubClimateProjectScopeChooser") &&
    preview.includes("SEND_INVITATION_LABEL") &&
    preview.includes("ClimatePartnerSupplyCard") &&
    preview.includes("preview/club-sponsors-address-books#"),
  "Blue tab asks Local/National/International, other lists sit at the end, Send Invitation lands on Sponsors Address Books"
);
assert(
  overlay.includes("app/club/projects/select/page.tsx") &&
    overlay.includes("app/components/club/ClubClimateProjectScopeChooser.tsx") &&
    overlay.includes("club-choose-projects-scopes-v1") &&
    overlay.includes('BUST = "club-choose-projects-pc-3"') &&
    overlay.includes("git fetch") &&
    overlay.includes("Working folder:") &&
    overlay.includes('rmSync(".next"') &&
    overlay.includes("S4P_OVERLAY_SELF") &&
    picker.includes("club-choose-projects-scopes-v1"),
  "PC overlay pulls the shortened Choose Projects flow and clears the Next.js cache"
);

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(
  "Choose Projects is the blue Select Climate Projects prompt, grouped Local/National/International, then Send Invitation to Sponsors Address Books."
);
