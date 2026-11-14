import { readFileSync } from "fs";

const failures: string[] = [];
function assert(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

const roster = readFileSync("app/services/season-roster.service.ts", "utf8");
const catalog = readFileSync("app/services/teams.service.ts", "utf8");
const teamsPanel = readFileSync(
  "app/components/fan/FanMyTeamsPanel.tsx",
  "utf8"
);
const picker = readFileSync("app/components/fan/TeamPicker.tsx", "utf8");

assert(
  roster.includes('typeof window !== "undefined"') &&
    roster.includes("return Promise.resolve()") &&
    roster.includes("download the whole fixtures table"),
  "Fan browsers do not sync or delete the fixtures table"
);
assert(
  /async function hydrateFanRegisterCatalog[\s\S]*?fanRegisterCatalog\(\);/.test(
    catalog
  ) &&
    catalog.includes("fanRegisterCatalogPromise") &&
    !/async function hydrateFanRegisterCatalog[\s\S]*?ensureCurrentSeasonRoster\(\);/.test(
      catalog
    ),
  "My S4P team catalog does not rebuild the season roster on the phone"
);
assert(
  teamsPanel.includes("setEditing(false)") &&
    teamsPanel.includes("HowS4pSelectMatch"),
  "A returning fan opens Select Match for their clubs, not the full catalog"
);
assert(
  picker.includes("catalogAccordion && !query.trim() && !browseOpen") &&
    picker.includes("? null"),
  "The closed My Teams accordion does not mount every club button"
);

if (failures.length > 0) {
  console.error("verify-fan-mys4p-client-roster failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("verify-fan-mys4p-client-roster: ok");
