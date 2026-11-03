import { readFileSync } from "fs";

const failures: string[] = [];
function assert(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

const picker = readFileSync("app/components/fan/TeamPicker.tsx", "utf8");
const panel = readFileSync("app/components/fan/FanMyTeamsPanel.tsx", "utf8");
const overlay = readFileSync("apply-my-s4p-teams-accordion.mjs", "utf8");
const register = readFileSync("app/register/page.tsx", "utf8");

assert(
  picker.includes("catalogAccordion") &&
    picker.includes('data-catalog-accordion="my-s4p-teams-accordion-v1"') &&
    picker.includes("Choose a team") &&
    picker.includes("Football, Rugby, NFL, NBA, Cricket") &&
    picker.includes("browseOpen") &&
    picker.includes("selected.length === 0") &&
    picker.includes('data-sport-accordion="sport-accordion-v1"'),
  "My S4P team catalog hides Football, Rugby, NFL, NBA and Cricket in an accordion"
);
assert(
  panel.includes("catalogAccordion") &&
    panel.includes('editing ? "Add or change teams"') &&
    panel.includes("FAN_REGISTER_TEAMS_COPY") &&
    panel.includes("Show my teams") &&
    panel.includes("<TeamPicker"),
  "My S4P keeps the intro and team choice, then accordion-hides the sport list"
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
    overlay.includes("app/preview/my-s4p-teams/page.tsx") &&
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
