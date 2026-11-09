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

assert(
  premierLeague.includes("Arsenal") &&
    premierLeague.includes("Chelsea") &&
    premierLeague.includes("Liverpool"),
  "Premier League catalog includes Arsenal, Chelsea and Liverpool"
);
assert(
  Boolean(championship?.includes("Norwich City")),
  "EFL Championship catalog includes Norwich City"
);
assert(
  scottish.includes("Hearts") &&
    scottish.includes("Hibernian") &&
    scottish.includes("Celtic") &&
    scottish.includes("Rangers"),
  "Scottish Premiership catalog includes Hearts, Hibernian, Celtic and Rangers"
);
assert(
  currentSeasonTeamCount() > 3,
  "Sports Teams counts every Sporting Calendar club, not only three"
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
  clubInCurrentSeasonLeague("Premier League", "Chelsea"),
  "Chelsea is a Premier League club on the platform"
);
assert(
  clubInCurrentSeasonLeague("EFL Championship", "Norwich City"),
  "Norwich City is an EFL Championship club on the platform"
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
  clubInCurrentSeasonLeague("Scottish Premiership", "Celtic"),
  "Celtic is a Scottish Premiership club on the platform"
);
assert(
  clubInCurrentSeasonLeague("NFL", "New England Patriots"),
  "NFL clubs are on the platform"
);
assert(
  clubInCurrentSeasonLeague("La Liga", "Real Madrid"),
  "La Liga clubs are on the platform"
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
assert(scoreLabelForSport("Cricket") === "Six", "Cricket sponsorship is per Six");
assert(
  SPORT_SELECT_OPTIONS.join(",") === "Football,Rugby,NFL,NBA,Cricket",
  "Club sport picker lists every platform sport: Football, Rugby, NFL, NBA, Cricket"
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
  isCurrentSeasonLeagueFixture("Premier League", "Chelsea", "Liverpool"),
  "Chelsea v Liverpool stays on the platform"
);
assert(
  isCurrentSeasonLeagueFixture(
    "EFL Championship",
    "Norwich City",
    "Birmingham City"
  ),
  "Championship fixtures stay on the platform"
);

const registerCopy = readFileSync("app/register/page.tsx", "utf8");
assert(
  registerCopy.includes("FAN_REGISTER_INTRO") &&
    registerCopy.includes("FAN_REGISTER_TEAMS_COPY") &&
    registerCopy.includes("loadFanRegisterCatalog") &&
    registerCopy.includes("showScorePrice={false}") &&
    !registerCopy.includes("You've been invited to help put remaining Carbon Wallet") &&
    !registerCopy.includes("This demo includes") &&
    !registerCopy.includes("£10,000/Goal"),
  "Fan registration is a worldwide form, not the three-club demo invite"
);

function main() {
  if (failures.length > 0) {
    console.error(failures.join("\n"));
    process.exit(1);
  }

  console.log("Sporting Calendar club membership and fixture rules passed.");

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
      if (!names.some((name) => /arsenal/i.test(name))) {
        throw new Error("Live catalog is missing Arsenal in the Premier League.");
      }
      if (!names.some((name) => /chelsea/i.test(name))) {
        throw new Error("Live catalog is missing Chelsea in the Premier League.");
      }
      if (
        !championshipGroup?.teams?.some((team) =>
          /norwich/i.test(team.displayName)
        )
      ) {
        throw new Error("Live catalog is missing Norwich City in the Championship.");
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
      for (const group of catalog) {
        for (const competition of group.competitions) {
          const ids = competition.teams.map((team) => team.id);
          if (new Set(ids).size !== ids.length) {
            throw new Error(
              `Live catalog has duplicate team ids in ${competition.name}.`
            );
          }
        }
      }
      const scottishLive = football?.competitions.find(
        (competition) => competition.name === "Scottish Premiership"
      );
      const scottishNames = (scottishLive?.teams ?? []).map((team) => team.displayName);
      if (!scottishNames.some((name) => /heart/i.test(name))) {
        throw new Error("Live catalog is missing Hearts of Midlothian.");
      }
      if (!scottishNames.some((name) => /hibernian/i.test(name))) {
        throw new Error("Live catalog is missing Hibernian.");
      }
      if (!scottishNames.some((name) => /celtic/i.test(name))) {
        throw new Error("Live catalog is missing Celtic.");
      }
      console.log(
        "Live catalog includes the Sporting Calendar, not only Arsenal, Hearts and Hibernian."
      );
    })
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

main();
