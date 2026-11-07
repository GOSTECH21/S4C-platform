import {
  calendarMatchesAsUpcoming,
  canonicalPublishedTeamName,
  matchesForClub,
  nextClubMatches,
} from "../app/lib/sporting-calendar";
import { PREMIER_LEAGUE_TEAMS } from "../app/lib/sporting-calendar-leagues";

const failures: string[] = [];
function assert(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

const fromDate = "2026-11-07";
const everton = matchesForClub("Everton", { fromDate });
const evertonWomen = matchesForClub("Everton Women", { fromDate });
const evertonMatchrav = calendarMatchesAsUpcoming("Everton", { fromDate }).slice(
  0,
  12
);

assert(
  canonicalPublishedTeamName("Women's Super League", "Everton") ===
    "Everton Women" &&
    canonicalPublishedTeamName("Premier League", "Everton") === "Everton" &&
    canonicalPublishedTeamName("Women's Super League", "Chelsea") ===
      "Chelsea Women",
  "Published WSL names resolve onto the women's roster"
);

assert(
  everton.length > 0 &&
    everton.every(
      (row) => row.homeName === "Everton" || row.awayName === "Everton"
    ) &&
    !everton.some((row) => row.league === "Women's Super League") &&
    everton[0]?.fixtureName === "Brentford v Everton" &&
    !everton.some(
      (row) => row.date === "2026-11-07" && /chelsea/i.test(row.fixtureName)
    ) &&
    everton.filter((row) => row.date === "2026-12-12").length === 1,
  "Everton FC no longer lists Chelsea Women or two matches on 12 Dec"
);

assert(
  evertonMatchrav.every(
    (row) =>
      (row.homeName === "Everton" || row.awayName === "Everton") &&
      row.competition !== "Women's Super League"
  ) &&
    evertonMatchrav[0]?.homeName === "Brentford" &&
    evertonMatchrav[0]?.awayName === "Everton",
  "Matchrav Everton fixture options start at Brentford vs Everton"
);

assert(
  evertonWomen[0]?.fixtureName === "Chelsea Women v Everton Women" &&
    evertonWomen.every((row) => row.league === "Women's Super League"),
  "Everton Women keep the Women's Super League list"
);

assert(
  PREMIER_LEAGUE_TEAMS.every((team) => {
    const rows = matchesForClub(team.name, { fromDate });
    const leagueDates = rows
      .filter((row) => row.league === "Premier League")
      .map((row) => row.date);
    return (
      rows.length > 0 &&
      rows.every(
        (row) => row.homeName === team.name || row.awayName === team.name
      ) &&
      !rows.some((row) => row.league === "Women's Super League") &&
      new Set(leagueDates).size === leagueDates.length &&
      nextClubMatches(team.name, { fromDate }).every(
        (row) => row.homeName === team.name || row.awayName === team.name
      )
    );
  }),
  "Every Premier League club list is that club only, with one league match per day"
);

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(
  "Club fixture lists keep men's and women's teams apart for every Premier League club."
);
