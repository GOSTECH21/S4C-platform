import { readFileSync } from "fs";

const failures: string[] = [];
function assert(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

const picker = readFileSync("app/components/fan/TeamPicker.tsx", "utf8");
const panel = readFileSync("app/components/fan/FanMyTeamsPanel.tsx", "utf8");
const overlay = readFileSync("apply-my-s4p-teams-accordion.mjs", "utf8");
const register = readFileSync("app/register/page.tsx", "utf8");
const myS4p = readFileSync("app/supporter/dashboard/page.tsx", "utf8");

assert(
  picker.includes("catalogAccordion") &&
    picker.includes('data-catalog-accordion="my-s4p-teams-accordion-v1"') &&
    picker.includes("Choose a team") &&
    picker.includes("Football, Rugby, NFL, NBA, Cricket") &&
    picker.includes("browseOpen") &&
    picker.includes("useState(false)") &&
    picker.includes('data-sport-accordion="sport-accordion-v1"'),
  "My S4P team catalog hides Football, Rugby, NFL, NBA and Cricket in an accordion"
);
assert(
  panel.includes("catalogAccordion") &&
    panel.includes("useState(true)") &&
    !panel.includes("setEditing(teams.length === 0)") &&
    panel.includes('editing ? "Add or change teams"') &&
    panel.includes("FAN_REGISTER_TEAMS_COPY") &&
    panel.includes("Show my teams") &&
    panel.includes("<TeamPicker"),
  "My S4P opens on Add or change teams with the sport list accordion-hidden"
);
assert(
  myS4p.includes('from "@/app/components/fan/FanMyTeamsPanel"') &&
    !myS4p.includes('() => import("@/app/components/fan/FanMyTeamsPanel")'),
  "My S4P ships FanMyTeamsPanel in the first phone payload"
);
assert(
  picker.indexOf("Search teams, leagues, or sports") <
    picker.indexOf("data-catalog-accordion") &&
    picker.indexOf("Supporting {selected.length}") <
      picker.indexOf("data-catalog-accordion"),
  "Search and the supported-team line stay visible above the sport accordion"
);
assert(
  !register.includes("catalogAccordion"),
  "Fan registration still shows the sport list without the extra My S4P accordion"
);
assert(
  overlay.includes("app/components/fan/TeamPicker.tsx") &&
    overlay.includes("app/components/fan/FanMyTeamsPanel.tsx") &&
    overlay.includes("app/supporter/dashboard/page.tsx") &&
    overlay.includes("app/preview/my-s4p-teams/page.tsx") &&
    overlay.includes('BUST = "my-s4p-teams-accordion-2"') &&
    overlay.includes("my-s4p-teams-accordion-v1"),
  "PC overlay pulls the My S4P team accordion"
);

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(
  "My S4P keeps Add or change teams copy visible and accordion-hides the sport list until needed."
);
