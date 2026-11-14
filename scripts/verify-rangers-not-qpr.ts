import { readFileSync } from "fs";
import { clubsMatch } from "../app/lib/sponsor-dashboard";
import { namesMatch, namesExactlyMatch } from "../app/lib/upcoming-matches";
import { seasonNamesMatch } from "../app/lib/current-season";
import { stadiumSiteForClub } from "../app/lib/project-site";
import { calendarVenueForClub } from "../app/lib/matchrav-journey";
import {
  nextClubMatches,
  resolveSportingCalendarClub,
} from "../app/lib/sporting-calendar";
import { offerBelongsToClub } from "../app/lib/campaign-sponsor";

const failures: string[] = [];
function assert(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

assert(
  namesMatch("Rangers", "Rangers FC") && namesExactlyMatch("Rangers", "Rangers"),
  "Rangers still matches Rangers FC"
);
assert(
  !namesMatch("Rangers", "Queens Park Rangers") &&
    !clubsMatch("Rangers", "Queens Park Rangers"),
  "A Rangers fan is not treated as a Queens Park Rangers fan"
);
assert(
  !namesMatch("Rangers", "Berwick Rangers") &&
    !namesMatch("Rangers", "New York Rangers"),
  "Scottish Rangers does not absorb other Rangers clubs"
);
assert(
  namesMatch("Queens Park Rangers", "QPR") &&
    clubsMatch("Queens Park Rangers", "QPR"),
  "QPR remains an alias of Queens Park Rangers"
);
assert(
  namesMatch("Rangers", "Glasgow Rangers") &&
    clubsMatch("Rangers", "Glasgow Rangers"),
  "Glasgow Rangers is an alias of Rangers, not a different club"
);
assert(
  !offerBelongsToClub("Queens Park Rangers", "Rangers") &&
    offerBelongsToClub("Rangers FC", "Rangers") &&
    offerBelongsToClub("Liverpool Football Club", "Liverpool"),
  "A Rangers climate offer is not a Queens Park Rangers offer"
);
assert(
  resolveSportingCalendarClub("Rangers") === "Rangers" &&
    resolveSportingCalendarClub("Queens Park Rangers") ===
      "Queens Park Rangers" &&
    resolveSportingCalendarClub("QPR") === "Queens Park Rangers",
  "Select Match resolves Rangers and QPR to different clubs"
);
assert(
  clubsMatch("Everton", "Everton") && !clubsMatch("Everton", "Everton Women"),
  "Everton fans stay on Everton, not Everton Women"
);
assert(
  clubsMatch("Hearts of Midlothian FC", "Hearts"),
  "Hearts short name still matches the registered club title"
);

const rangersVenue = calendarVenueForClub("Rangers");
assert(
  /ibrox/i.test(rangersVenue),
  `Rangers home ground is Ibrox, not Loftus Road (${rangersVenue || "empty"})`
);
assert(
  /ibrox/i.test(stadiumSiteForClub("Rangers")?.address ?? ""),
  "Rangers stadium site is Ibrox"
);

const rangersMatches = nextClubMatches("Rangers");
assert(
  rangersMatches.length > 0 &&
    rangersMatches.every(
      (row) =>
        namesExactlyMatch(row.homeName, "Rangers") ||
        namesExactlyMatch(row.awayName, "Rangers")
    ) &&
    rangersMatches.every(
      (row) =>
        !/queens park rangers/i.test(row.homeName) &&
        !/queens park rangers/i.test(row.awayName)
    ),
  "Rangers upcoming matches do not include Queens Park Rangers"
);

assert(
  namesMatch(undefined, "Everton") === false &&
    namesMatch("Rangers", null) === false &&
    clubsMatch(undefined, "Everton") === false &&
    seasonNamesMatch(undefined, "Rangers") === false,
  "Club matching never throws when a fixture or campaign is missing a name"
);

const teamsService = readFileSync("app/services/teams.service.ts", "utf8");
const preferenceLookup = teamsService.slice(
  teamsService.indexOf("export async function findClubByPreferenceName"),
  teamsService.indexOf("export function flattenCatalog")
);
assert(
  !teamsService.includes('.ilike("name", `%${name}%`)') &&
    !preferenceLookup.includes('.from("clubs")') &&
    teamsService.includes("fanRegisterCatalogPromise"),
  "Looking up a supporter's club stays on the Sporting Calendar and does not download every club again"
);

const workspace = readFileSync(
  "app/components/fan/FanCampaignWorkspace.tsx",
  "utf8"
);
assert(
  workspace.includes("SUPPORTER_CAMPAIGN_PATH") &&
    workspace.includes('from "@/app/lib/routes"') &&
    workspace.includes("Could not load My S4P"),
  "My S4P shows a load error instead of crashing when a campaign is missing"
);

if (failures.length > 0) {
  console.error("verify-rangers-not-qpr failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("verify-rangers-not-qpr: ok");
