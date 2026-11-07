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
  nav.includes('data-fan-tabs="6"') &&
    nav.includes('data-fan-tabs-style="club-buttons"') &&
    nav.includes("flex flex-wrap items-center gap-2") &&
    nav.includes("s4pTabClass") &&
    !nav.includes("grid-cols-6") &&
    nav.includes('label: "My S4P"') &&
    nav.includes('label: "Matchrav"') &&
    nav.includes("SUPPORTER_MATCHRAV_PATH") &&
    nav.includes('label: "P4P"') &&
    nav.includes('label: "Climate Projects"') &&
    nav.includes('label: "CIFT"') &&
    nav.includes("Logout") &&
    !nav.includes('label: "My Teams"') &&
    !nav.includes('label: "Climate Sponsors"'),
  "Fan nav is six Club-style wrap buttons with Matchrav after My S4P"
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

assert(
  readFileSync("apply-fan-tabs-club-buttons.mjs", "utf8").includes(
    "cursor/fan-tabs-club-buttons-18f9"
  ) &&
    readFileSync("app/dashboard/supporter/components/FanTabBar.tsx", "utf8").includes(
      "s4pTabClass"
    ),
  "PC overlay pulls the Club-style supporter tabs"
);

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(
  "Fan tabs wrap like Club Select Match: My S4P (with My Teams), Matchrav, P4P, Climate Projects (with Climate Sponsors), CIFT, Logout."
);
