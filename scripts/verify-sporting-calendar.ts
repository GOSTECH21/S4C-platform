import { readFileSync } from "fs";
import { currentSeasonTeamCount } from "../app/lib/current-season";
import {
  GLOBAL_MATCH_DAY_EXAMPLE_DATE,
  NFL_EXAMPLE_DATE,
  SPORTING_CALENDAR_LEAGUE_ORDER,
  SPORTING_CALENDAR_SEASON,
  calendarLeagueDomId,
  findCalendarMatch,
  leagueMatchCountOnDate,
  matchesByLeagueOnDate,
  matchesOnCalendarDate,
  publishedFixtureSource,
  sportingCalendarMatches,
} from "../app/lib/sporting-calendar";
import {
  BUDWEISER_EXAMPLE_FIXTURES,
  budweiserExamplePicks,
  canAddGlobalPick,
  countPicksByLeague,
  defaultLeadClubForMatch,
  describeGlobalPicks,
  pickFromCalendarMatch,
  syntheticLockFromPicks,
} from "../app/lib/global-match-day";
import { SPONSOR_CALENDAR_PATH } from "../app/lib/routes";
import {
  FIXTURE_ACCORDION_PREVIEW,
  fixtureAccordionHint,
  fixtureListIsCollapsible,
  hiddenAccordionCount,
  visibleAccordionItems,
} from "../app/lib/fixture-accordion";

const failures: string[] = [];

function assert(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

assert(
  currentSeasonTeamCount() === 3,
  "The three-club demo catalog is unchanged by the sporting calendar"
);
assert(
  SPORTING_CALENDAR_SEASON === "2026/27",
  "Sporting calendar season is 2026/27"
);
assert(
  SPORTING_CALENDAR_LEAGUE_ORDER.join(" | ") ===
    [
      "Premier League",
      "EFL Championship",
      "EFL League One",
      "Women's Super League",
      "Scottish Premiership",
      "Bundesliga",
      "La Liga",
      "Ligue 1",
      "Serie A",
      "NFL",
      "Premiership Rugby",
      "Super League",
      "NBA",
    ].join(" | "),
  "Calendar mines the requested football leagues plus NFL, Rugby Union, Rugby League and NBA"
);
assert(
  publishedFixtureSource().toLowerCase().includes("espn"),
  "The calendar is sourced from published ESPN fixtures, not a generated round-robin"
);

const catalog = sportingCalendarMatches();
assert(catalog.length > 2000, "The mined 2026/27 calendar has a full season of Matches");
assert(
  catalog.every((row) => row.date.startsWith("2026") || row.date.startsWith("2027")),
  "Published Matches sit in the 2026/27 season window"
);

const october31 = matchesByLeagueOnDate(GLOBAL_MATCH_DAY_EXAMPLE_DATE);
const octoberNames = october31.map((row) => row.league);
for (const league of [
  "Premier League",
  "EFL Championship",
  "EFL League One",
  "Women's Super League",
  "Scottish Premiership",
  "Bundesliga",
  "La Liga",
  "Ligue 1",
  "Serie A",
]) {
  assert(
    octoberNames.includes(league),
    `Saturday 31 October 2026 lists published ${league} Matches`
  );
}

assert(
  leagueMatchCountOnDate(GLOBAL_MATCH_DAY_EXAMPLE_DATE, "Premier League") === 8,
  "Premier League has eight published Matches on 31 October 2026"
);
assert(
  leagueMatchCountOnDate(GLOBAL_MATCH_DAY_EXAMPLE_DATE, "Scottish Premiership") === 3,
  "Scottish Premiership has three published Matches on 31 October 2026"
);
assert(
  leagueMatchCountOnDate(GLOBAL_MATCH_DAY_EXAMPLE_DATE, "La Liga") === 4,
  "La Liga has four published Matches on 31 October 2026"
);
assert(
  leagueMatchCountOnDate(GLOBAL_MATCH_DAY_EXAMPLE_DATE, "Premiership Rugby") === 4,
  "Premiership Rugby has four published Matches on 31 October 2026"
);
assert(
  leagueMatchCountOnDate(GLOBAL_MATCH_DAY_EXAMPLE_DATE, "NBA") >= 1,
  "NBA has published Matches on 31 October 2026 after daily fill"
);
assert(
  !findCalendarMatch(GLOBAL_MATCH_DAY_EXAMPLE_DATE, "Chelsea v Arsenal"),
  "Invented Chelsea v Arsenal is not on the published 31 October slate"
);
assert(
  findCalendarMatch(GLOBAL_MATCH_DAY_EXAMPLE_DATE, "Chelsea v Manchester United")
    ?.league === "Premier League",
  "Chelsea v Manchester United is the published 12:30 Premier League Match on 31 October"
);
assert(
  findCalendarMatch(GLOBAL_MATCH_DAY_EXAMPLE_DATE, "Dundee United v Hearts")
    ?.league === "Scottish Premiership",
  "Dundee United v Hearts is on the published Scottish Premiership 31 October slate"
);

function uniqueTeams(league: string): boolean {
  const names = matchesOnCalendarDate(GLOBAL_MATCH_DAY_EXAMPLE_DATE)
    .filter((row) => row.league === league)
    .flatMap((row) => [row.homeName, row.awayName]);
  return new Set(names).size === names.length && names.length > 0;
}

assert(uniqueTeams("Premier League"), "Premier League 31 October teams are unique");
assert(uniqueTeams("La Liga"), "La Liga 31 October teams are unique");
assert(
  uniqueTeams("Scottish Premiership"),
  "Scottish Premiership 31 October teams are unique"
);
assert(uniqueTeams("Serie A"), "Serie A 31 October teams are unique");

const picks = budweiserExamplePicks();
const counts = Object.fromEntries(
  countPicksByLeague(picks).map((row) => [row.league, row.count])
);
assert(picks.length === 6, "Budweiser example locks six named Matches");
assert(counts["Premier League"] === 2, "Budweiser example has 2 Premier League Matches");
assert(
  counts["Scottish Premiership"] === 1,
  "Budweiser example has 1 Scottish Premiership Match"
);
assert(counts["La Liga"] === 3, "Budweiser example has 3 La Liga Matches");
assert(
  describeGlobalPicks(picks) ===
    "2 Premier League Matches; 1 Scottish Premiership Match; 3 La Liga Matches",
  "Same-day slate is described as 2 Premier League, 1 Scottish Premiership, 3 La Liga"
);
assert(
  BUDWEISER_EXAMPLE_FIXTURES.every((row) =>
    picks.some(
      (pick) =>
        pick.fixtureName === row.fixtureName && pick.clubName === row.clubName
    )
  ),
  "Budweiser example names Chelsea, Manchester City, Motherwell, Atletico Madrid, Rayo Vallecano and Barcelona"
);

const hibs = findCalendarMatch("2026-10-25", "Hibernian v Celtic");
assert(Boolean(hibs), "Hibernian v Celtic is a published Scottish Premiership Match");
assert(
  defaultLeadClubForMatch(hibs!, "Budweiser") === "Celtic",
  "Budweiser cannot occupy Hibernian and defaults to Celtic"
);
assert(
  pickFromCalendarMatch(hibs!, "Budweiser", "Hibernian") === null,
  "Budweiser cannot pick Hibernian as Lead on Hibernian v Celtic"
);

const budweiserLock = syntheticLockFromPicks("Budweiser", picks);
const chelsea = pickFromCalendarMatch(
  findCalendarMatch(GLOBAL_MATCH_DAY_EXAMPLE_DATE, "Chelsea v Manchester United")!,
  "Gillette",
  "Chelsea"
);
assert(Boolean(chelsea), "Gillette can name Chelsea v Manchester United");
assert(
  canAddGlobalPick({
    pick: chelsea!,
    brandName: "Gillette",
    locks: budweiserLock ? [budweiserLock] : [],
  }).ok === false,
  "A second Lead is rejected for Chelsea on the same named Match"
);
assert(
  canAddGlobalPick({
    pick: picks[0],
    brandName: "Budweiser",
    locks: budweiserLock ? [budweiserLock] : [],
  }).ok,
  "Budweiser keeps the six Matches it already holds"
);

const unitedSide = pickFromCalendarMatch(
  findCalendarMatch(GLOBAL_MATCH_DAY_EXAMPLE_DATE, "Chelsea v Manchester United")!,
  "Puma",
  "Manchester United"
);
assert(
  Boolean(unitedSide) &&
    canAddGlobalPick({
      pick: unitedSide!,
      brandName: "Puma",
      locks: budweiserLock ? [budweiserLock] : [],
    }).ok,
  "Puma can still Lead Manchester United on the same named Match"
);

assert(SPONSOR_CALENDAR_PATH === "/sponsor/calendar", "Calendar lives at /sponsor/calendar");

const dashboard = readFileSync("app/sponsor/dashboard/page.tsx", "utf8");
assert(
  dashboard.includes("SPONSOR_CALENDAR_PATH") &&
    dashboard.includes("Open 2026/27 Sporting Calendar") &&
    dashboard.includes("ClubLeagueMenu"),
  "The Lead dashboard opens the 2026/27 Sporting Calendar and keeps the three-club lock-in"
);

const board = readFileSync(
  "app/components/sponsor/SportingCalendarBoard.tsx",
  "utf8"
);
assert(
  board.includes("bg-s4p-mark") &&
    !board.includes("bg-green-400") &&
    !board.includes("bg-slate-950"),
  "Sporting Calendar days use paper and lime, not dark fills"
);
assert(
  board.includes("GLOBAL_MATCH_DAY_STEPS") &&
    board.includes("list-decimal") &&
    !board.includes("Open any day on the 2026/27 Sporting Calendar"),
  "The calendar intro is the five numbered steps, not the long league paragraph"
);
assert(
  board.includes("visibleAccordionItems") &&
    board.includes("toggleLeague") &&
    board.includes("aria-expanded"),
  "Leagues with more than two Matches collapse behind a clickable accordion heading"
);

assert(FIXTURE_ACCORDION_PREVIEW === 2, "A league shows two fixtures until it is opened");
assert(!fixtureListIsCollapsible(1), "A one-Match league stays fully listed");
assert(!fixtureListIsCollapsible(2), "A two-Match league stays fully listed");
assert(fixtureListIsCollapsible(3), "A three-Match league uses the accordion");
assert(
  visibleAccordionItems(["a", "b", "c", "d", "e", "f"], false).join(",") ===
    "a,b",
  "A collapsed six-Match league shows the first two fixtures"
);
assert(
  visibleAccordionItems(
    ["a", "b", "c", "d"],
    false,
    (row) => row === "d"
  ).join(",") === "a,b,d",
  "A sponsored Match stays visible even when the rest of the league is collapsed"
);
assert(
  visibleAccordionItems(["a", "b", "c"], true).join(",") === "a,b,c",
  "Clicking the league heading reveals the hidden fixtures"
);
assert(
  hiddenAccordionCount(6, 2) === 4 &&
    fixtureAccordionHint(6, 2, false) === "4 more Matches",
  "Collapsed Premier League copy says how many Matches are still hidden"
);

const picker = readFileSync(
  "app/components/sponsor/MatchSponsorshipPicker.tsx",
  "utf8"
);
assert(
  picker.includes("visibleAccordionItems") && picker.includes("aria-expanded"),
  "Club fixture lists use the same accordion when they have more than two Matches"
);

const matchDay = readFileSync("app/lib/global-match-day.ts", "utf8");
assert(
  matchDay.includes("Look at the Sporting Calendar") &&
    matchDay.includes("Select any Day of the week") &&
    matchDay.includes(
      "Scroll below to see all Sporting Events on that day in various Sports & Leagues"
    ) &&
    matchDay.includes("Select the Games you wish to Sponsor & Lock them in") &&
    matchDay.includes(
      "Proceed to your Carbon Wallet to complete transaction"
    ) &&
    !matchDay.includes("Open any day on the 2026/27 Sporting Calendar"),
  "Global Match Day copy lists the five Sporting Calendar steps"
);

const calendarLib = readFileSync("app/lib/sporting-calendar.ts", "utf8");
assert(
  calendarLib.includes("published-fixtures.json") &&
    !calendarLib.includes("function generateLeague") &&
    !calendarLib.includes("OCTOBER_31_2026_SLATES"),
  "The sporting calendar loads published-fixtures.json instead of generating slates"
);

const currentSeason = readFileSync("app/lib/current-season.ts", "utf8");
assert(
  currentSeason.includes('Premier League": ["Arsenal"]') &&
    currentSeason.includes('"Hearts", "Hibernian"'),
  "CURRENT_SEASON_LEAGUES stays the three-club demo"
);

assert(
  NFL_EXAMPLE_DATE === "2026-11-01",
  "The NFL example Sunday is 1 November 2026"
);
const nflSundayCount = leagueMatchCountOnDate(NFL_EXAMPLE_DATE, "NFL");
assert(
  nflSundayCount >= 10,
  "Sunday 1 November 2026 has a published NFL slate"
);
assert(
  fixtureListIsCollapsible(nflSundayCount),
  "The NFL Sunday slate uses the same collapsible list as football leagues"
);
assert(
  matchesByLeagueOnDate(NFL_EXAMPLE_DATE).some((row) => row.league === "NFL") &&
    matchesByLeagueOnDate("2026-11-29").some(
      (row) => row.league === "NFL" && row.matches.length >= 8
    ),
  "NFL fixtures are grouped on Sunday 1 November and Sunday 29 November"
);
assert(
  board.includes("Load NFL Sunday 1 November") &&
    board.includes("loadNflSunday") &&
    board.includes("jumpToLeague") &&
    board.includes("calendarLeagueDomId") &&
    calendarLeagueDomId("NFL") === "calendar-league-NFL",
  "The calendar jumps to NFL and lists that Sunday's collapsible fixtures"
);
assert(
  board.includes("NFL fixtures are on Sundays") &&
    board.includes("pendingScrollLeague"),
  "The calendar explains that NFL sits on Sundays and scrolls to the collapsible NFL list"
);
assert(
  findCalendarMatch(NFL_EXAMPLE_DATE, "Buffalo Bills v Baltimore Ravens")
    ?.league === "NFL",
  "NFL Sunday names published fixtures such as Buffalo Bills v Baltimore Ravens"
);

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(
  `2026/27 published fixtures passed (${catalog.length} Matches; Budweiser ${describeGlobalPicks(picks)}).`
);
