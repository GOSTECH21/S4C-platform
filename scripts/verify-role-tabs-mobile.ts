import { readFileSync } from "fs";
import {
  HOME_ROLE_TABS_STAMP,
  HOME_STAKEHOLDERS,
} from "../app/lib/home-stakeholders";

const failures: string[] = [];
function assert(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

const roles = readFileSync("app/components/home/HomeRoleSection.tsx", "utf8");
const clubs = HOME_STAKEHOLDERS.find((card) => card.title === "Sports Clubs");

assert(
  HOME_ROLE_TABS_STAMP === "role-tabs-mobile-v1" &&
    roles.includes(HOME_ROLE_TABS_STAMP) &&
    roles.includes("data-role-tabs-mobile") &&
    roles.includes("Who are you joining as?") &&
    roles.includes("Different roles. One mission.") &&
    roles.includes('role="tablist"') &&
    roles.includes('role="tab"') &&
    roles.includes('role="tabpanel"') &&
    roles.includes("md:hidden") &&
    roles.includes("hidden md:grid"),
  "Mobile roles use Image 1 tabs and keep the six-card grid for desktop"
);

assert(
  HOME_STAKEHOLDERS.length === 6 &&
    HOME_STAKEHOLDERS.every(
      (card) =>
        Boolean(card.tabHeading) &&
        Boolean(card.tabDescription) &&
        Boolean(card.tabCta) &&
        Boolean(card.image)
    ),
  "Each role tab has a heading, brief description, CTA and image"
);

assert(
  clubs?.tabHeading === "Turn every match into a climate mission." &&
    clubs?.tabDescription.includes(
      "address your match-day carbon footprint through funded, measurable climate projects"
    ) &&
    clubs?.tabCta.includes("Explore Club Partnership") &&
    clubs?.image.includes("role-club"),
  "Sports Clubs tab uses Image 1 copy and still shows the club photograph"
);

assert(
  roles.includes("selected.image") &&
    roles.includes("selected.tabHeading") &&
    roles.includes("selected.tabDescription") &&
    roles.includes("setSelectedTitle") &&
    !roles.includes("data-role-cards-scroller"),
  "Selecting a tab reveals that role image, heading and brief description"
);

if (failures.length > 0) {
  console.error("verify-role-tabs-mobile failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("verify-role-tabs-mobile: ok");
