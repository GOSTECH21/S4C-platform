import {
  CURRENT_SEASON_LEAGUES,
  clubInCurrentSeasonLeague,
  currentSeasonTeamCount,
  demoClubNamesOnly,
  isCurrentSeasonLeagueFixture,
  isDemoClubName,
  seasonNamesMatch,
} from "../app/lib/current-season";
import { loadTeamCatalogFromDatabase } from "../app/services/teams.service";
import { SPORT_SELECT_OPTIONS, scoreLabelForSport } from "../app/lib/sports";
import { readFileSync } from "fs";

const failures: string[] = [];

function assert(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

const premierLeague = CURRENT_SEASON_LEAGUES["Premier League"];
const championship = CURRENT_SEASON_LEAGUES["EFL Championship"];
const scottish = CURRENT_SEASON_LEAGUES["Scottish Premiership"];

assert(premierLeague.length === 1, "Premier League demo catalog is Arsenal only");
assert(premierLeague[0] === "Arsenal", "Premier League demo club is Arsenal");
assert(!championship, "EFL Championship is not in the three-club demo catalog");
assert(scottish.length === 2, "Scottish Premiership demo catalog is Hearts and Hibernian");
assert(
  scottish.includes("Hearts") && scottish.includes("Hibernian"),
  "Scottish Premiership demo clubs are Hearts and Hibernian"
);
assert(
  currentSeasonTeamCount() === 3,
  "Sports Teams must be exactly the three demo clubs"
);

assert(isDemoClubName("Arsenal FC"), "Arsenal FC is a demo club");
assert(isDemoClubName("Hearts of Midlothian FC"), "Hearts of Midlothian FC is a demo club");
assert(isDemoClubName("Hibernian Football Club"), "Hibernian is a demo club");
assert(!isDemoClubName("Chelsea"), "Chelsea is not a selectable demo club");
assert(!isDemoClubName("Liverpool"), "Liverpool is not a selectable demo club");
assert(!isDemoClubName("Celtic"), "Celtic is not a selectable demo club");
assert(!isDemoClubName("American Express"), "Brand names are not treated as demo clubs");
assert(
  demoClubNamesOnly(["Arsenal", "Liverpool", "Hibernian", "Celtic"]).join(",") ===
    "Arsenal,Hibernian",
  "Sponsor networks keep only Hearts/Hibs/Arsenal club links"
);

assert(
  !clubInCurrentSeasonLeague("Premier League", "Chelsea"),
  "Chelsea must not be selectable in the Premier League demo"
);
assert(
  !clubInCurrentSeasonLeague("EFL Championship", "West Ham United"),
  "Championship clubs are outside the three-club demo"
);
assert(
  clubInCurrentSeasonLeague("Premier League", "Arsenal"),
  "Arsenal remains the Premier League demo club"
);
assert(
  clubInCurrentSeasonLeague("Scottish Premiership", "Hearts"),
  "Hearts remains a Scottish Premiership demo club"
);
assert(
  clubInCurrentSeasonLeague("Scottish Premiership", "Hibernian"),
  "Hibernian remains a Scottish Premiership demo club"
);
assert(
  !clubInCurrentSeasonLeague("Scottish Premiership", "Celtic"),
  "Celtic must not remain in the Scottish Premiership demo"
);
assert(
  !clubInCurrentSeasonLeague("NFL", "New England Patriots"),
  "NFL clubs are outside the three-club demo"
);
assert(
  !clubInCurrentSeasonLeague("La Liga", "Real Madrid"),
  "La Liga clubs are outside the three-club demo"
);

assert(
  seasonNamesMatch("Hearts of Midlothian FC", "Heart of Midlothian"),
  "Hearts of Midlothian FC matches the catalog Hearts club"
);
assert(
  seasonNamesMatch("Hearts of Midlothian FC", "Hearts"),
  "Hearts of Midlothian FC matches the short Hearts name"
);
assert(
  !seasonNamesMatch("Dundee", "Dundee United"),
  "Dundee and Dundee United are different clubs"
);
assert(
  seasonNamesMatch("Liverpool", "Liverpool Football Club"),
  "Opponent name matching still works for fixture titles"
);
assert(
  !seasonNamesMatch("Liverpool", "Manchester United"),
  "Liverpool does not match Manchester United"
);

assert(scoreLabelForSport("Football") === "Goal", "Football sponsorship is per Goal");
assert(scoreLabelForSport("Rugby") === "Try", "Rugby sponsorship is per Try");
assert(scoreLabelForSport("NFL") === "Touchdown", "NFL sponsorship is per Touchdown");
assert(scoreLabelForSport("NBA") === "3-Point", "NBA sponsorship is per 3-Point");
assert(
  SPORT_SELECT_OPTIONS.join(",") === "Football,Rugby,NFL,Basketball",
  "Club sport picker is Football, Rugby, NFL, Basketball"
);

assert(
  isCurrentSeasonLeagueFixture("Premier League", "Arsenal", "Chelsea"),
  "Arsenal vs Chelsea remains a valid demo fixture title"
);
assert(
  isCurrentSeasonLeagueFixture("Scottish Premiership", "Dundee United", "Hibernian"),
  "Hibernian vs an opponent remains a valid demo fixture title"
);
assert(
  !isCurrentSeasonLeagueFixture("Premier League", "Chelsea", "Liverpool"),
  "Fixtures with no Hearts, Hibernian, or Arsenal side are dropped"
);
assert(
  !isCurrentSeasonLeagueFixture("EFL Championship", "West Ham United", "Burnley"),
  "Championship-only fixtures are outside the three-club demo"
);

const registerCopy = readFileSync("app/register/page.tsx", "utf8");
assert(
  registerCopy.includes("Hearts of Midlothian FC") &&
    registerCopy.includes("Hibernian FC") &&
    registerCopy.includes("Arsenal FC"),
  "Fan registration names the three demo clubs"
);
assert(
  !registerCopy.includes("Boston Celtics") &&
    !registerCopy.includes("West Ham United") &&
    !registerCopy.includes("New England Patriots"),
  "Fan registration no longer lists clubs outside the three-club demo"
);

function main() {
  if (failures.length > 0) {
    console.error(failures.join("\n"));
    process.exit(1);
  }

  console.log("Three-club demo membership and fixture rules passed.");

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return;

  loadTeamCatalogFromDatabase()
    .then((catalog) => {
      const football = catalog.find((group) => group.sport === "Football");
      const premier = football?.competitions.find(
        (competition) => competition.name === "Premier League"
      );
      const championshipGroup = football?.competitions.find(
        (competition) => competition.name === "EFL Championship"
      );
      const names = (premier?.teams ?? []).map((team) => team.displayName);
      console.log("Premier League catalog:", names.join(", "));
      if (names.length !== 1 || !names.some((name) => /arsenal/i.test(name))) {
        throw new Error("Live catalog must show only Arsenal in the Premier League.");
      }
      if (names.some((name) => /chelsea|liverpool|west ham/i.test(name))) {
        throw new Error("Live catalog still includes a non-demo Premier League club.");
      }
      if (championshipGroup?.teams?.length) {
        throw new Error("Live catalog still includes the Championship.");
      }
      const needed = [
        ["Football", "Premier League", "Arsenal"],
        ["Football", "Scottish Premiership", "Hearts"],
        ["Football", "Scottish Premiership", "Hibernian"],
      ] as const;
      for (const [sport, league, team] of needed) {
        const group = catalog.find((item) => item.sport === sport);
        const competition = group?.competitions.find((item) => item.name === league);
        const found = competition?.teams.some((item) =>
          new RegExp(team, "i").test(item.displayName + " " + item.name)
        );
        if (!found) {
          throw new Error(`Live catalog is missing ${team} in ${league}.`);
        }
      }
      const forbidden = ["Chelsea", "Liverpool", "Celtic", "Real Madrid", "AC Milan"];
      for (const group of catalog) {
        for (const competition of group.competitions) {
          const ids = competition.teams.map((team) => team.id);
          if (new Set(ids).size !== ids.length) {
            throw new Error(
              `Live catalog has duplicate team ids in ${competition.name}.`
            );
          }
          for (const team of competition.teams) {
            if (
              forbidden.some((name) =>
                new RegExp(name, "i").test(`${team.displayName} ${team.name}`)
              )
            ) {
              throw new Error(
                `Live catalog still lists ${team.displayName} in ${competition.name}.`
              );
            }
          }
        }
      }
      const scottishLive = football?.competitions.find(
        (competition) => competition.name === "Scottish Premiership"
      );
      const scottishNames = (scottishLive?.teams ?? []).map((team) => team.displayName);
      if (scottishNames.length !== 2) {
        throw new Error(
          `Live Scottish Premiership catalog has ${scottishNames.length} clubs, expected 2.`
        );
      }
      if (!scottishNames.some((name) => /heart/i.test(name))) {
        throw new Error("Live catalog is missing Hearts of Midlothian.");
      }
      if (!scottishNames.some((name) => /hibernian/i.test(name))) {
        throw new Error("Live catalog is missing Hibernian.");
      }
      console.log(
        "Live catalog: three demo clubs only — Arsenal, Hearts, Hibernian."
      );
    })
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

main();
