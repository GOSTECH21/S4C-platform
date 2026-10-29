import { readFileSync } from "fs";

const failures: string[] = [];
function assert(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

const nav =
  readFileSync("app/dashboard/supporter/components/FanNav.tsx", "utf8") +
  readFileSync(
    "app/dashboard/supporter/components/FanTabBar.tsx",
    "utf8"
  );
const routes = readFileSync("app/lib/routes.ts", "utf8");
const myS4p = readFileSync("app/supporter/dashboard/page.tsx", "utf8");
const teams = readFileSync("app/components/fan/FanMyTeamsPanel.tsx", "utf8");
const prefs = readFileSync(
  "app/dashboard/supporter/preferences/page.tsx",
  "utf8"
);
const vote = readFileSync("app/dashboard/supporter/vote/page.tsx", "utf8");
const sponsors = readFileSync(
  "app/supporter/dashboard/climate-sponsors/page.tsx",
  "utf8"
);
const ciftPage = readFileSync("app/supporter/dashboard/cift/page.tsx", "utf8");
const cift = readFileSync("app/components/fan/FanCiftTable.tsx", "utf8");

assert(
  nav.includes('data-fan-tabs="5"') &&
    nav.includes("grid-cols-5") &&
    nav.includes("overflow-x-hidden") &&
    nav.includes('label: "My S4P"') &&
    nav.includes('label: "P4P"') &&
    nav.includes('label: "Climate Projects"') &&
    nav.includes('label: "CIFT"') &&
    nav.includes("Logout") &&
    !nav.includes('label: "My Teams"') &&
    !nav.includes('label: "Climate Sponsors"'),
  "Fan nav is five non-scrolling tabs with My Teams and Climate Sponsors off the bar"
);
assert(
  routes.includes('SUPPORTER_CIFT_PATH = "/supporter/dashboard/cift"') &&
    routes.includes('SUPPORTER_CLIMATE_SPONSORS_HASH = "climate-sponsors"'),
  "CIFT and Climate Sponsors hash routes exist"
);
assert(
  myS4p.includes("FanMyTeamsPanel") &&
    myS4p.includes("FanCampaignWorkspace") &&
    teams.includes('id="my-teams"') &&
    teams.includes('audience="fan"') &&
    prefs.includes("SUPPORTER_CAMPAIGN_PATH") &&
    prefs.includes("#my-teams"),
  "My Teams lives inside My S4P; the old tab URL jumps there"
);
assert(
  vote.includes('section="sponsors"') &&
    vote.includes("SUPPORTER_CLIMATE_SPONSORS_HASH") &&
    sponsors.includes("SUPPORTER_PROJECTS_PATH") &&
    sponsors.includes("SUPPORTER_CLIMATE_SPONSORS_HASH"),
  "Climate Sponsors lives inside Climate Projects; the old tab URL jumps there"
);
assert(
  readFileSync(
    "app/dashboard/supporter/components/FanTabBar.tsx",
    "utf8"
  ).includes("FanTabBar") &&
  ciftPage.includes("FanCiftTable") &&
    cift.includes("Your position") &&
    cift.includes("loadFanCiftRows") &&
    cift.includes("data-cift-self") &&
    cift.includes("You are #") &&
    readFileSync("app/services/s4p-impact-tables.service.ts", "utf8").includes(
      "export async function loadFanCiftRows"
    ),
  "CIFT tab shows the signed-in fan their position on the Climate Impact Fans Table"
);

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(
  "Fan tabs: My S4P (with My Teams), P4P, Climate Projects (with Climate Sponsors), CIFT, Logout."
);
