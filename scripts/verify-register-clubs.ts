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

const premier = byLeague["Premier League"] ?? [];
const championship = byLeague["EFL Championship"] ?? [];
const leagueOne = byLeague["EFL League One"] ?? [];
const wsl = byLeague["Women's Super League"] ?? [];
const scottish = byLeague["Scottish Premiership"] ?? [];
const bundesliga = byLeague["Bundesliga"] ?? [];
const laLiga = byLeague["La Liga"] ?? [];
const ligue1 = byLeague["Ligue 1"] ?? [];
const serieA = byLeague["Serie A"] ?? [];
const superLeague = byLeague["Super League"] ?? [];

assert(premier.length === 20, "Premier League lists all 20 clubs on register");
assert(
  premier.includes("Coventry City") &&
    premier.includes("Hull City") &&
    premier.includes("Ipswich Town") &&
    !premier.includes("Burnley") &&
    !premier.includes("West Ham United") &&
    !premier.includes("Wolverhampton Wanderers"),
  "Premier League 2026/27 has Coventry, Hull and Ipswich, not Burnley, West Ham or Wolves"
);
assert(championship.length === 24, "Championship lists all 24 2026/27 clubs");
assert(
  championship.includes("West Ham United") &&
    championship.includes("Burnley") &&
    championship.includes("Wolverhampton Wanderers") &&
    championship.includes("Lincoln City") &&
    !championship.includes("Coventry City"),
  "Championship 2026/27 has the three Premier League relegated clubs and League One promoted clubs"
);
assert(
  leagueOne.length === 24 &&
    leagueOne.includes("Leicester City") &&
    leagueOne.includes("Bromley") &&
    leagueOne.includes("Milton Keynes Dons") &&
    !leagueOne.includes("Lincoln City"),
  "League One 2026/27 has Leicester, Bromley and MK Dons"
);
assert(
  wsl.length === 14 &&
    wsl.includes("Birmingham City Women") &&
    wsl.includes("Crystal Palace Women") &&
    wsl.includes("Charlton Athletic Women") &&
    !wsl.includes("Leicester City Women"),
  "Women's Super League 2026/27 is 14 clubs after expansion"
);
assert(scottish.length === 12, "Scottish Premiership lists all 12 clubs on register");
assert(
  scottish.includes("St Johnstone") && !scottish.includes("Livingston"),
  "Scottish Premiership 2026/27 has St Johnstone, not Livingston"
);
assert(
  bundesliga.length === 18 &&
    bundesliga.includes("Schalke 04") &&
    bundesliga.includes("SV Elversberg") &&
    bundesliga.includes("SC Paderborn") &&
    !bundesliga.includes("VfL Wolfsburg") &&
    !bundesliga.includes("St Pauli"),
  "Bundesliga 2026/27 has Schalke, Elversberg and Paderborn"
);
assert(
  laLiga.length === 20 &&
    laLiga.includes("Racing Santander") &&
    laLiga.includes("Deportivo La Coruna") &&
    laLiga.includes("Malaga") &&
    !laLiga.includes("Girona") &&
    !laLiga.includes("Mallorca") &&
    !laLiga.includes("Real Oviedo"),
  "La Liga 2026/27 has Racing, Deportivo and Malaga"
);
assert(
  ligue1.length === 18 &&
    ligue1.includes("Troyes") &&
    ligue1.includes("Le Mans") &&
    !ligue1.includes("Metz") &&
    !ligue1.includes("Nantes"),
  "Ligue 1 2026/27 has Troyes and Le Mans"
);
assert(
  serieA.length === 20 &&
    serieA.includes("Venezia") &&
    serieA.includes("Frosinone") &&
    serieA.includes("Monza") &&
    !serieA.includes("Cremonese") &&
    !serieA.includes("Hellas Verona") &&
    !serieA.includes("Pisa"),
  "Serie A 2026/27 has Venezia, Frosinone and Monza"
);
assert(
  superLeague.length === 14 &&
    superLeague.includes("Bradford Bulls") &&
    superLeague.includes("York Knights") &&
    superLeague.includes("Toulouse Olympique") &&
    !superLeague.includes("Salford Red Devils"),
  "Super League 2026 is 14 clubs after expansion"
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
