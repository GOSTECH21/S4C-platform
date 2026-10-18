import { readFileSync } from "fs";
import { currentSeasonTeamCount } from "../app/lib/current-season";
import {
  CUP_COMPETITION_NAMES,
  GLOBAL_MATCH_DAY_EXAMPLE_DATE,
  NFL_EXAMPLE_DATE,
  RUGBY_CHAMPIONSHIP_EXAMPLE_DATE,
  SIX_NATIONS_EXAMPLE_DATE,
  SPORTING_CALENDAR_LEAGUE_ORDER,
  SPORTING_CALENDAR_SEASON,
  busyCupDate,
  calendarLeagueDomId,
  clubsOnSportingCalendar,
  CLUB_MATCH_CALENDAR_COUNT,
  cupCalendarHints,
  cupMatchesForClub,
  isUpcomingCalendarDate,
  matchesForClub,
  nextClubMatches,
  findCalendarMatch,
  isCupCompetitionName,
  leagueMatchCountOnDate,
  matchesByLeagueOnDate,
  resolveSportingCalendarClub,
  rugbyCalendarHints,
  matchesOnCalendarDate,
  publishedFixtureSource,
  sportingCalendarMatches,
} from "../app/lib/sporting-calendar";
import {
  BUDWEISER_EXAMPLE_FIXTURES,
  GLOBAL_MATCH_DAY_STEPS,
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
      "Champions League",
      "Europa Cup",
      "Europa Conference League",
      "FA Cup",
      "Carabao Cup",
      "Scottish Cup",
      "Italian Cup",
      "German Cup",
      "French Cup",
      "Spanish Cup",
      "NFL",
      "Premiership Rugby",
      "Top 14",
      "Six Nations",
      "The Rugby Championship",
      "Nations Championship",
      "Super League",
      "NBA",
    ].join(" | "),
  "Calendar mines football, cup competitions, NFL, Premiership Rugby, Top 14, Six Nations, The Rugby Championship, rugby league and NBA"
);
assert(
  CUP_COMPETITION_NAMES.join(" | ") ===
    [
      "Champions League",
      "Europa Cup",
      "Europa Conference League",
      "FA Cup",
      "Carabao Cup",
      "Scottish Cup",
      "Italian Cup",
      "German Cup",
      "French Cup",
      "Spanish Cup",
    ].join(" | "),
  "All ten cup competitions sit on the Sporting Calendar"
);
assert(
  CUP_COMPETITION_NAMES.every((name) => isCupCompetitionName(name)),
  "Each cup competition uses the calendar cup name"
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
  "Top 14",
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
const calendarPage = readFileSync("app/sponsor/calendar/page.tsx", "utf8");
const lockIn = readFileSync(
  "app/components/sponsor/MatchDayLockIn.tsx",
  "utf8"
);
const clubCalendar = readFileSync(
  "app/components/sponsor/ClubMatchCalendar.tsx",
  "utf8"
);
assert(
  dashboard.includes("MatchDayLockIn") &&
    dashboard.includes('id="match-day-lock-in"') &&
    !dashboard.includes("Open 2026/27 Sporting Calendar") &&
    !dashboard.includes("ClubLeagueMenu") &&
    dashboard.indexOf("MatchDayLockIn") <
      dashboard.indexOf("The club&apos;s 5 chosen Climate Projects"),
  "Match Day Lock-In sits above the Climate Projects record; the Sporting Calendar is not a standalone card"
);
assert(
  calendarPage.includes("MatchDayLockIn") &&
    !calendarPage.includes("SportingCalendarBoard") &&
    calendarPage.includes("onMatchLocked") &&
    calendarPage.includes("sponsorWalletPath") &&
    !calendarPage.includes("Proceed to your Carbon Wallet") &&
    lockIn.includes("ClubTypeInMenu") &&
    lockIn.includes("ClubMatchCalendar") &&
    lockIn.includes("onMatchLocked") &&
    clubCalendar.includes("bg-s4p-mark") &&
    clubCalendar.includes("CLUB_MATCH_CALENDAR_COUNT") &&
    clubCalendar.includes("League and Cup Dates"),
  "Choosing a Match takes the sponsor straight to the Carbon Wallet"
);

const signedHome = readFileSync(
  "app/components/sponsor/SignedSponsorHome.tsx",
  "utf8"
);
assert(
  signedHome.includes("SportingCalendarBoard") &&
    signedHome.includes("picksForSignedSponsorHome") &&
    signedHome.includes("sponsorLogoSrc") &&
    !signedHome.includes("SponsoredMatchCalendar") &&
    signedHome.includes("Your 2026/27 Sporting Calendar"),
  "A logged-in Lead sees the all-inclusive Sporting Calendar on home, not a separate preview file"
);

const board = readFileSync(
  "app/components/sponsor/SportingCalendarBoard.tsx",
  "utf8"
);
assert(
  signedHome.includes("onChosenMatch") &&
    signedHome.includes("sponsorWalletPath") &&
    board.includes("onChosenMatch") &&
    readFileSync("app/sponsor/wallet/page.tsx", "utf8").includes(
      "SPONSOR_ANOTHER_TEAM_PROMPT"
    ) &&
    readFileSync("app/sponsor/wallet/page.tsx", "utf8").includes(
      "SPONSOR_CLUB_TYPE_IN_PATH"
    ) &&
    readFileSync("app/lib/routes.ts", "utf8").includes(
      "Want to see or sponsor another team?"
    ),
  "After a Match is chosen the wallet is next; Click here returns to Club type-in"
);
assert(
  board.includes("BrandMark") &&
    board.includes("logoUrl") &&
    board.includes("Signed in as {brandName}") &&
    board.includes("{brandName} · 2026/27 Sporting Calendar") &&
    board.includes("disabled={!cell.inMonth || !upcoming}"),
  "The Sporting Calendar names the logged-in sponsor with their logo and lets them open upcoming days"
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
    !board.includes("Open any day on the 2026/27 Sporting Calendar") &&
    GLOBAL_MATCH_DAY_STEPS[0] ===
      "Type-in the Name of the Club you wish to sponsor" &&
    GLOBAL_MATCH_DAY_STEPS[3].includes("Lock-in that Match") &&
    GLOBAL_MATCH_DAY_STEPS[3].includes("Carbon Wallet") &&
    GLOBAL_MATCH_DAY_STEPS[4].includes("sponsorship amounts"),
  "The calendar intro is the five numbered club-first steps"
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
  matchDay.includes("Type-in the Name of the Club you wish to sponsor") &&
    matchDay.includes("Click Select the Match") &&
    matchDay.includes(
      "Choose one of this Club's next 10 League or Cup Matches"
    ) &&
    matchDay.includes("Lock-in that Match and go straight to your Carbon Wallet") &&
    matchDay.includes("Enter your sponsorship amounts") &&
    !matchDay.includes("Look at the Sporting Calendar") &&
    !matchDay.includes("Open any day on the 2026/27 Sporting Calendar") &&
    !matchDay.includes(
      "Scroll below to see all Sporting Events on that day in various Sports & Leagues"
    ),
  "Global Match Day copy lists the five type-in then Select the Match steps"
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
  !board.includes("Load NFL Sunday 1 November") &&
    !board.includes("loadNflSunday") &&
    board.includes("jumpToLeague") &&
    board.includes("calendarLeagueDomId") &&
    calendarLeagueDomId("NFL") === "calendar-league-NFL",
  "The calendar lists NFL fixtures without a green Load NFL tab"
);
assert(
  board.includes("NFL fixtures are on Sundays") &&
    !board.includes("Click Load NFL Sunday 1 November") &&
    board.includes("pendingScrollLeague"),
  "The calendar explains that NFL sits on Sundays without a Load tab"
);
assert(
  findCalendarMatch(NFL_EXAMPLE_DATE, "Buffalo Bills v Baltimore Ravens")
    ?.league === "NFL",
  "NFL Sunday names published fixtures such as Buffalo Bills v Baltimore Ravens"
);

const top14Count = leagueMatchCountOnDate(
  GLOBAL_MATCH_DAY_EXAMPLE_DATE,
  "Top 14"
);
assert(top14Count >= 6, "Saturday 31 October 2026 has a published Top 14 round");
assert(
  fixtureListIsCollapsible(top14Count),
  "The Top 14 Saturday round uses the same collapsible list as football leagues"
);
assert(
  findCalendarMatch(
    GLOBAL_MATCH_DAY_EXAMPLE_DATE,
    "Clermont v Racing 92"
  )?.league === "Top 14",
  "Top 14 names published fixtures such as Clermont v Racing 92"
);

assert(
  SIX_NATIONS_EXAMPLE_DATE === "2027-03-13",
  "The Six Nations example is Super Saturday 13 March 2027"
);
const sixNationsCount = leagueMatchCountOnDate(
  SIX_NATIONS_EXAMPLE_DATE,
  "Six Nations"
);
assert(sixNationsCount === 3, "Super Saturday has the three Six Nations Matches");
assert(
  fixtureListIsCollapsible(sixNationsCount),
  "Six Nations Super Saturday uses the collapsible fixture list"
);
assert(
  findCalendarMatch(SIX_NATIONS_EXAMPLE_DATE, "Ireland v France")?.league ===
    "Six Nations" &&
    findCalendarMatch("2027-02-05", "Ireland v England")?.league ===
      "Six Nations",
  "Six Nations names published 2027 fixtures such as Ireland v England and Ireland v France"
);

assert(
  RUGBY_CHAMPIONSHIP_EXAMPLE_DATE === "2027-07-10",
  "The Rugby Championship example is 10 July 2027"
);
assert(
  findCalendarMatch(
    RUGBY_CHAMPIONSHIP_EXAMPLE_DATE,
    "Australia v Argentina"
  )?.league === "The Rugby Championship" &&
    findCalendarMatch(
      RUGBY_CHAMPIONSHIP_EXAMPLE_DATE,
      "Australia v Argentina"
    )?.kickoff === "",
  "The Rugby Championship names Rugby Australia's published 2027 opener Australia v Argentina, kickoff TBC"
);
assert(
  leagueMatchCountOnDate("2026-07-04", "Nations Championship") >= 6 &&
    fixtureListIsCollapsible(
      leagueMatchCountOnDate("2026-07-04", "Nations Championship")
    ),
  "2026 is a Nations Championship year with a collapsible July round"
);

assert(
  !board.includes("Load Top 14 Saturday 31 October") &&
    !board.includes("Load Six Nations Super Saturday 13 March") &&
    !board.includes("Load The Rugby Championship 10 July") &&
    !board.includes("loadTop14Saturday") &&
    !board.includes("loadSixNations") &&
    !board.includes("loadRugbyChampionship") &&
    calendarLeagueDomId("Top 14") === "calendar-league-Top-14" &&
    calendarLeagueDomId("Six Nations") === "calendar-league-Six-Nations" &&
    calendarLeagueDomId("The Rugby Championship") ===
      "calendar-league-The-Rugby-Championship",
  "Rugby championships stay on the calendar without green Load tabs"
);

const octHints = rugbyCalendarHints(
  matchesByLeagueOnDate(GLOBAL_MATCH_DAY_EXAMPLE_DATE).map((row) => row.league)
);
assert(
  octHints.some((hint) => hint.includes("Top 14 is in the competition row")) &&
    octHints.some((hint) => hint.includes("Six Nations is in February")) &&
    octHints.some((hint) => hint.includes("The Rugby Championship returns")),
  "Saturday 31 October explains Top 14 is here and the other rugby championships sit on later dates"
);
assert(
  catalog.filter((row) => row.league === "Top 14").length >= 150 &&
    catalog.filter((row) => row.league === "Six Nations").length === 15,
  "Top 14 has a published 2026/27 season and Six Nations has the 15-Match 2027 championship"
);

for (const cup of [
  "Champions League",
  "Europa Cup",
  "Europa Conference League",
  "Carabao Cup",
  "Scottish Cup",
  "Italian Cup",
  "German Cup",
  "Spanish Cup",
] as const) {
  const count = catalog.filter((row) => row.league === cup).length;
  assert(count >= 8, `${cup} has published 2026/27 Matches (${count})`);
  assert(Boolean(busyCupDate(cup)), `${cup} has a date a sponsor can load`);
}

const champions = catalog.filter((row) => row.league === "Champions League");
assert(champions.length >= 50, "Champions League has a published league-phase catalog");
const cupClub = champions[0]?.homeName ?? "";
assert(
  Boolean(cupClub) &&
    cupMatchesForClub(cupClub).some((row) => row.league === "Champions League"),
  "Clicking a Champions League club returns that club's Cup Match"
);
assert(
  cupMatchesForClub("Arsenal").some((row) => row.league === "Champions League") &&
    cupMatchesForClub("Arsenal").some((row) => row.league === "Carabao Cup") &&
    findCalendarMatch("2026-10-21", "Bayern Munich v Arsenal")?.league ===
      "Champions League",
  "Arsenal's club picker lists Champions League and Carabao Cup Matches"
);
assert(
  cupMatchesForClub("Hearts").some(
    (row) => row.league === "Europa Conference League"
  ) &&
    cupMatchesForClub("Hearts").every(
      (row) =>
        row.homeName === "Hearts" || row.awayName === "Hearts"
    ) &&
    !cupMatchesForClub("Hearts").some((row) =>
      /kelty/i.test(row.fixtureName)
    ),
  "Hearts' club picker lists Europa Conference League Matches, not Kelty Hearts"
);
assert(
  clubsOnSportingCalendar().includes("Arsenal") &&
    clubsOnSportingCalendar().includes("Hearts") &&
    clubsOnSportingCalendar().includes("Barcelona"),
  "The club picker lists Sporting Calendar clubs including Arsenal, Hearts and Barcelona"
);
assert(
  board.includes("Sponsor any Club of your choice") &&
    board.includes(
      "Type-in their Name and see all their League and Cup Matches"
    ) &&
    board.includes("Club you wish to sponsor") &&
    !board.includes("Sponsor a club in a Cup") &&
    !board.includes("Click a club, see their Cup Match, tick Sponsor") &&
    !board.includes("Champions League, Europa Cup, Europa Conference League") &&
    board.includes("selectClub") &&
    board.includes("matchesForClub") &&
    board.includes("onSelectClub") &&
    !board.includes("loadCupDate") &&
    !board.includes("Load {league}"),
  "Sponsors type a club name and see that club's League and Cup Matches"
);
assert(
  matchesForClub("Arsenal").some((row) => row.league === "Premier League") &&
    matchesForClub("Arsenal").some((row) => row.league === "Champions League"),
  "Typing Arsenal lists League and Cup Matches"
);
const arsenalTen = nextClubMatches("Arsenal", { fromDate: "2026-10-18" });
assert(
  CLUB_MATCH_CALENDAR_COUNT === 10 &&
    arsenalTen.length === 10 &&
    arsenalTen.every(
      (row) => row.homeName === "Arsenal" || row.awayName === "Arsenal"
    ) &&
    arsenalTen.some((row) => row.league === "Premier League") &&
    arsenalTen.some((row) => isCupCompetitionName(row.league)) &&
    !arsenalTen.some((row) => row.league === "Women's Super League") &&
    !arsenalTen.some((row) => row.league === "NFL" || row.league === "NBA") &&
    resolveSportingCalendarClub("Arsenal FC") === "Arsenal",
  "Select the Match shows only this Club's next 10 League and Cup Matches"
);
assert(
  isUpcomingCalendarDate("2026-10-18", "2026-10-17") &&
    isUpcomingCalendarDate("2026-10-17", "2026-10-17") &&
    !isUpcomingCalendarDate("2026-08-23", "2026-10-17"),
  "Upcoming Matches include today and later dates, not August results"
);
const bournemouthFromToday = matchesForClub("Bournemouth", {
  fromDate: "2026-10-17",
});
assert(
  bournemouthFromToday.length > 0 &&
    bournemouthFromToday.every((row) => row.date >= "2026-10-17") &&
    !bournemouthFromToday.some((row) =>
      /manchester city v bournemouth/i.test(row.fixtureName)
    ) &&
    bournemouthFromToday.some((row) => /sunderland/i.test(row.fixtureName)),
  "Bournemouth's club list is upcoming Matches only"
);
assert(
  board.includes("isUpcomingCalendarDate") &&
    board.includes("No upcoming Matches") &&
    !board.includes("No published Matches for {selectedClub} yet."),
  "The club picker hides Matches that have already been played"
);
const octCupHints = cupCalendarHints(
  matchesByLeagueOnDate(GLOBAL_MATCH_DAY_EXAMPLE_DATE).map((row) => row.league)
);
assert(
  !octCupHints.some((hint) => hint.includes("Click a club")) &&
    !octCupHints.some((hint) => hint.includes("Spanish Cup")),
  "The selected day does not repeat the Cup competition search paragraph"
);
assert(
  currentSeasonTeamCount() === 3,
  "Cup competitions do not add clubs to the three-club demo catalog"
);

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(
  `2026/27 published fixtures passed (${catalog.length} Matches; Budweiser ${describeGlobalPicks(picks)}).`
);
