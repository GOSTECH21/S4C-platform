import { readFileSync } from "fs";

const failures: string[] = [];
function assert(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

const fan = readFileSync("app/components/fan/FanMyTeamsPanel.tsx", "utf8");
const fixtures = readFileSync(
  "app/components/home/SelectMatchFixtures.tsx",
  "utf8"
);
const select = readFileSync(
  "app/components/home/HowS4pSelectMatch.tsx",
  "utf8"
);
const preview = readFileSync("app/preview/my-teams/page.tsx", "utf8");

assert(
  fan.includes('audience="fan"') &&
    fan.includes("clubOptions={selected.map((team) => team.name)}") &&
    fan.includes("HowS4pSelectMatch") &&
    !fan.includes("UpcomingMatches") &&
    !fan.includes("MyTeamsList") &&
    !fan.includes("loadFixtures") &&
    !fan.includes("/api/fan/next-fixtures"),
  "My Teams shows Select Match only, not a second fixture dump"
);

assert(
  fixtures.includes('data-select-match-contained="select-match-contained-v1"') &&
    fixtures.includes("max-md:h-[28rem]") &&
    fixtures.includes("shownMatches") &&
    fixtures.includes(".slice(0, 10)") &&
    fixtures.includes("clubOptions.includes(club)") &&
    fixtures.includes("showSelectedClub") &&
    fixtures.includes("confirmClub") &&
    fixtures.includes("appliedInitialClub") &&
    fixtures.includes("value={pendingClub}") &&
    fixtures.includes("data-see-upcoming-matches") &&
    fixtures.includes("data-select-match-picker") &&
    fixtures.includes("match.homeName.toLowerCase().includes(name)") &&
    fixtures.includes("match.awayName.toLowerCase().includes(name)"),
  "The match phone stays contained, capped at 10, and only lists the selected club"
);

assert(
  select.includes("order-2 lg:order-1") &&
    select.includes("order-1 min-w-0 flex-1 lg:order-2") &&
    !select.includes("Confirm your Selection") &&
    !select.includes("data-confirm-club-selection"),
  "On a phone, Choose your club sits above the contained 10-match list"
);

assert(
  preview.includes("HowS4pSelectMatch") &&
    preview.includes('clubOptions={["Real Madrid", "Everton"]}') &&
    !preview.includes("MyTeamsList"),
  "My Teams preview uses Select Match with one club at a time, not a fixture dump"
);

if (failures.length > 0) {
  console.error("verify-fan-select-match-only failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("verify-fan-select-match-only: ok");
