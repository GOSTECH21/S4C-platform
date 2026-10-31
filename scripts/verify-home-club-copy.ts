import { readFileSync } from "fs";
import { HOME_STAKEHOLDERS } from "../app/lib/home-stakeholders";

const failures: string[] = [];
function assert(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

const banner = readFileSync("app/components/home/HomeTopBanner.tsx", "utf8");
const roles = readFileSync("app/components/home/HomeRoleSection.tsx", "utf8");
const clubs = HOME_STAKEHOLDERS.find((card) => card.title === "Sports Clubs");

assert(
  banner.includes(
    "We help your club address match-day carbon emissions & fund meaningful"
  ) &&
    banner.includes("global brands, local businesses & supporters") &&
    !banner.includes("We help your team to offset its Match Day carbon emissions") &&
    !banner.includes("Global Brands & Businesses"),
  "Homepage support line uses the club, brands, local businesses and supporters copy"
);

assert(
  clubs?.description.includes(
    "address your match-day carbon footprint through funded, measurable climate projects"
  ) &&
    clubs?.tabDescription.includes(
      "address your match-day carbon footprint through funded, measurable climate projects"
    ) &&
    !clubs?.description.includes("& offset your Match Day carbon footprint"),
  "Sports Clubs card and tab describe funded, measurable climate projects"
);

assert(
  roles.includes('label: "Built for"') &&
    roles.includes("Fans Worldwide") &&
    !roles.includes("of Fans Worldwide") &&
    !roles.includes('label: "Millions"'),
  "Forest box says Built for Fans Worldwide"
);

if (failures.length > 0) {
  console.error("verify-home-club-copy failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("verify-home-club-copy: ok");
