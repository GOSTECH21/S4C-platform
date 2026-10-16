import { readFileSync } from "fs";
import { currentSeasonTeamCount } from "../app/lib/current-season";
import {
  calendarClubNamesOnly,
  isSportingCalendarClub,
  sportingCalendarClubCount,
  sportingCalendarClubGroups,
} from "../app/lib/calendar-clubs";

const failures: string[] = [];

function assert(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

assert(
  currentSeasonTeamCount() === 3,
  "Homepage Sports Teams stays the three-club demo"
);

const groups = sportingCalendarClubGroups();
const byLeague = Object.fromEntries(
  groups.map((group) => [group.league, group.clubs])
);

assert(
  (byLeague["Premier League"]?.length ?? 0) === 20,
  "Premier League lists all 20 clubs on register"
);
assert(
  (byLeague["Scottish Premiership"]?.length ?? 0) === 12,
  "Scottish Premiership lists all 12 clubs on register"
);
assert(
  (byLeague["EFL Championship"]?.length ?? 0) >= 20 &&
    (byLeague["La Liga"]?.length ?? 0) >= 18 &&
    (byLeague["NFL"]?.length ?? 0) === 32 &&
    (byLeague["NBA"]?.length ?? 0) === 30 &&
    (byLeague["Top 14"]?.length ?? 0) >= 14 &&
    (byLeague["Six Nations"]?.length ?? 0) === 6,
  "Register lists Championship, La Liga, NFL, NBA, Top 14 and Six Nations clubs"
);
assert(
  !groups.some((group) => group.league === "Champions League"),
  "Cup competitions without a club roster are not a register league table"
);
assert(
  sportingCalendarClubCount() > 200,
  "The register picker has a comprehensive sporting-calendar club list"
);
assert(
  isSportingCalendarClub("Chelsea") &&
    isSportingCalendarClub("Barcelona") &&
    isSportingCalendarClub("New England Patriots") &&
    isSportingCalendarClub("Toulouse") &&
    isSportingCalendarClub("Arsenal"),
  "Sponsors can pick Chelsea, Barcelona, Patriots, Toulouse and Arsenal"
);
assert(
  calendarClubNamesOnly(["Chelsea", "Kelty Hearts", "Arsenal"]).join(",") ===
    "Chelsea,Arsenal",
  "Goal networks keep sporting-calendar clubs and drop unknown names"
);

const picker = readFileSync(
  "app/components/sponsor/ClubNetworkPicker.tsx",
  "utf8"
);
assert(
  picker.includes("sportingCalendarClubGroups") &&
    !picker.includes("CURRENT_SEASON_LEAGUES") &&
    picker.includes("Search clubs or type Arsenal, Barcelona, Patriots") &&
    picker.includes("border-slate-300 bg-white"),
  "The register club picker uses the sporting calendar on paper cards"
);

const registerPage = readFileSync("app/sponsor/register/page.tsx", "utf8");
assert(
  registerPage.includes("ClubNetworkPicker") &&
    registerPage.includes("Clubs whose Goals you would like to sponsor") &&
    registerPage.includes("League through NBA"),
  "National sponsor registration still uses the club picker"
);

const localPage = readFileSync("app/sponsor/local/register/page.tsx", "utf8");
assert(
  localPage.includes("ClubNetworkPicker") &&
    localPage.includes("Sporting Calendar") &&
    !localPage.includes("Hearts, Hibernian and Arsenal each have"),
  "Local registration uses the same comprehensive club list"
);

const service = readFileSync(
  "app/services/climate-sponsors.service.ts",
  "utf8"
);
assert(
  service.includes("calendarClubNamesOnly") &&
    service.includes("isSportingCalendarClub") &&
    !service.includes("demoClubNamesOnly") &&
    !service.includes("demoOnlyNetwork"),
  "Saved Goal Sponsorship Networks keep the clubs picked on register"
);

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(
  `Register club picker passed (${sportingCalendarClubCount()} clubs across ${groups.length} competitions).`
);
