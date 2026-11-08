import { readFileSync } from "fs";
import {
  clubInCurrentSeasonLeague,
  currentSeasonTeamCount,
  isCurrentSeasonLeagueFixture,
} from "../app/lib/current-season";
import { sportingCalendarClubCount } from "../app/lib/calendar-clubs";

const failures: string[] = [];
function assert(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

const admin = readFileSync("app/services/s4p-admin.service.ts", "utf8");
const supporters = readFileSync("app/services/supporters.service.ts", "utf8");
const stats = readFileSync("app/services/platform-stats.service.ts", "utf8");
const roster = readFileSync("app/services/season-roster.service.ts", "utf8");
const season = readFileSync("app/lib/current-season.ts", "utf8");
const sql = readFileSync(
  "supabase/migrations/0021_all_clubs_no_three_club_prune.sql",
  "utf8"
);

assert(
  !admin.includes("isDemoClubName") &&
    !supporters.includes("isDemoClubName") &&
    !stats.includes("isDemoClubName"),
  "Admin, supporter lists and homepage stats no longer hide non-demo clubs"
);
assert(
  !roster.includes("isDemoClubName") &&
    roster.includes("Keep every stored fixture"),
  "Season roster no longer deletes fixtures that are not Arsenal, Hearts or Hibernian"
);
assert(
  season.includes("SPORTING_CALENDAR_LEAGUES") &&
    isCurrentSeasonLeagueFixture("Premier League", "Chelsea", "Liverpool") &&
    isCurrentSeasonLeagueFixture("Scottish Premiership", "Celtic", "Rangers") &&
    clubInCurrentSeasonLeague("Premier League", "Manchester City"),
  "League fixtures and club pickers include the whole Sporting Calendar"
);
assert(
  currentSeasonTeamCount() === sportingCalendarClubCount() &&
    currentSeasonTeamCount() > 3,
  "Sports Teams equals the Sporting Calendar club count"
);
assert(
  sql.includes("Three-club prune is retired") &&
    sql.includes("select true"),
  "Supabase no longer prunes Fan, Club and Sponsor rows down to three clubs"
);

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(
  "The platform lists every Sporting Calendar club in Admin, stats and fixtures."
);
