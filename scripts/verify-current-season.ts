import {
  CURRENT_SEASON_LEAGUES,
  clubInCurrentSeasonLeague,
  isCurrentSeasonLeagueFixture,
  seasonNamesMatch,
} from "../app/lib/current-season";
import { loadTeamCatalogFromDatabase } from "../app/services/teams.service";
import { SPORT_SELECT_OPTIONS, scoreLabelForSport } from "../app/lib/sports";

const failures: string[] = [];

function assert(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

const premierLeague = CURRENT_SEASON_LEAGUES["Premier League"];
const championship = CURRENT_SEASON_LEAGUES["EFL Championship"];
const scottish = CURRENT_SEASON_LEAGUES["Scottish Premiership"];

assert(premierLeague.length === 20, "Premier League must have 20 clubs");
assert(championship.length === 24, "EFL Championship must have 24 clubs");
assert(scottish.length === 12, "Scottish Premiership must have 12 clubs");

for (const relegated of [
  "West Ham United",
  "Burnley",
  "Wolverhampton Wanderers",
]) {
  assert(
    !clubInCurrentSeasonLeague("Premier League", relegated),
    `${relegated} must not be in the 2026/27 Premier League`
  );
  assert(
    clubInCurrentSeasonLeague("EFL Championship", relegated),
    `${relegated} must be in the 2026/27 EFL Championship`
  );
}

for (const promoted of ["Coventry City", "Ipswich Town", "Hull City"]) {
  assert(
    clubInCurrentSeasonLeague("Premier League", promoted),
    `${promoted} must be in the 2026/27 Premier League`
  );
  assert(
    !clubInCurrentSeasonLeague("EFL Championship", promoted),
    `${promoted} must not remain in the Championship`
  );
}

assert(
  seasonNamesMatch("Hearts of Midlothian FC", "Heart of Midlothian"),
  "Hearts of Midlothian FC matches the catalog Hearts club"
);
assert(
  seasonNamesMatch("Hearts of Midlothian FC", "Hearts"),
  "Hearts of Midlothian FC matches the short Hearts name"
);

assert(
  clubInCurrentSeasonLeague("NFL", "New England Patriots"),
  "New England Patriots must be in the current NFL catalog"
);
assert(
  clubInCurrentSeasonLeague("La Liga", "Real Madrid"),
  "Real Madrid must be in La Liga"
);
assert(
  clubInCurrentSeasonLeague("Serie A", "AC Milan"),
  "AC Milan must be in Serie A"
);
assert(scoreLabelForSport("Football") === "Goal", "Football sponsorship is per Goal");
assert(scoreLabelForSport("Rugby") === "Try", "Rugby sponsorship is per Try");
assert(scoreLabelForSport("NFL") === "Touchdown", "NFL sponsorship is per Touchdown");
assert(scoreLabelForSport("NBA") === "3-Point", "NBA sponsorship is per 3-Point");
assert(
  scoreLabelForSport("Basketball") === "3-Point",
  "Basketball uses the NBA 3-Point sponsorship trigger"
);
assert(
  SPORT_SELECT_OPTIONS.join(",") === "Football,Rugby,NFL,Basketball",
  "Club sport picker is Football, Rugby, NFL, Basketball"
);
assert(
  !(SPORT_SELECT_OPTIONS as readonly string[]).includes("Cricket"),
  "Cricket is not a selectable S4P sport"
);
assert(
  clubInCurrentSeasonLeague("NBA", "Boston Celtics"),
  "Boston Celtics must be in the NBA catalog"
);

assert(
  !isCurrentSeasonLeagueFixture(
    "Premier League",
    "Arsenal",
    "West Ham United"
  ),
  "Arsenal cannot play West Ham in the Premier League this season"
);

assert(
  isCurrentSeasonLeagueFixture("EFL Championship", "West Ham United", "Burnley"),
  "West Ham vs Burnley is a valid Championship fixture"
);

assert(
  isCurrentSeasonLeagueFixture("Premier League", "Arsenal", "Chelsea"),
  "Arsenal vs Chelsea remains a valid Premier League fixture"
);

assert(
  clubInCurrentSeasonLeague("Scottish Premiership", "Falkirk"),
  "Falkirk must be in the current Scottish Premiership"
);
assert(
  !clubInCurrentSeasonLeague("Scottish Premiership", "Ross County"),
  "Ross County must not remain in the Scottish Premiership"
);

function main() {
  if (failures.length > 0) {
    console.error(failures.join("\n"));
    process.exit(1);
  }

  console.log("Current-season membership and fixture rules passed.");

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
      if (names.some((name) => /west ham|burnley|wolves/i.test(name))) {
        throw new Error(
          "Live catalog still includes a relegated Premier League club."
        );
      }
      if (!names.some((name) => /coventry/i.test(name))) {
        throw new Error(
          "Live catalog is missing Coventry City from the Premier League."
        );
      }
      const championshipNames = (championshipGroup?.teams ?? []).map(
        (team) => team.displayName
      );
      if (!championshipNames.some((name) => /west ham/i.test(name))) {
        throw new Error(
          "Live catalog is missing West Ham United from the Championship."
        );
      }
      const needed = [
        ["Football", "Premier League", "Arsenal"],
        ["Football", "Scottish Premiership", "Hearts"],
        ["Football", "La Liga", "Real Madrid"],
        ["Football", "Serie A", "AC Milan"],
        ["Rugby", "Six Nations", "Scotland"],
        ["NFL", "NFL", "New England Patriots"],
        ["NBA", "NBA", "Boston Celtics"],
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
      console.log(
        "Live catalog: Premier League",
        names.length,
        "clubs; Championship includes West Ham; fan scenario teams present."
      );
    })
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

main();
