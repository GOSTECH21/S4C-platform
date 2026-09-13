import {
  MATCH_DAY_CHOICE_COUNT,
  MATCH_DAY_PROJECT_COUNT,
  PARTNER_PAGE_SIZE,
  partnerPageCount,
  partnerProjectPage,
} from "../app/lib/partner-projects";
import { ciltPositionLabel, premierLeagueCilt, scottishPremiershipCilt, climateImpactLeagueTable } from "../app/lib/cilt";
import { leagueForClubName } from "../app/lib/current-season";
import { SELECTABLE_MATCH_DAY_CATALOG, selectableCatalogForCountry } from "../app/lib/sccan-catalog";
import {
  climateProjectCountryLabel,
  featuredClimateProjectCountryLabel,
  featuredClimateProjectCountryLabelForClubs,
  localCatalogCountryForClub,
  selectableCatalogForClub,
} from "../app/lib/featured-climate-country";

const failures: string[] = [];

function assert(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

const ids = Array.from({ length: 20 }, (_, index) => index + 1);
assert(partnerProjectPage(ids, 0).length === PARTNER_PAGE_SIZE, "Page 1 has 10 projects");
assert(partnerProjectPage(ids, 1).join(",") === "11,12,13,14,15,16,17,18,19,20", "Page 2 has the next 10");
assert(partnerPageCount(20) === 2, "20 partner projects paginate into 2 pages");
assert(MATCH_DAY_PROJECT_COUNT === 5, "Match Day portfolio is 5 projects including featured GSS");
assert(MATCH_DAY_CHOICE_COUNT === 4, "SD chooses 4 partner projects; GSS is included as a must");
assert(
  partnerProjectPage(SELECTABLE_MATCH_DAY_CATALOG, 0).every((project) =>
    /scotland/i.test(project.country)
  ),
  "Default page 1 is Scotland-based Climate Partner projects"
);
assert(
  partnerProjectPage(SELECTABLE_MATCH_DAY_CATALOG, 1).some(
    (project) => project.name === "Ugandan Cookstove"
  ),
  "Page 2 includes Ugandan Cookstove"
);
assert(
  localCatalogCountryForClub({ clubName: "Hearts of Midlothian FC" }) === "Scotland",
  "Hearts local catalog is Scotland"
);
assert(
  localCatalogCountryForClub({ clubName: "Arsenal", country: "England" }) ===
    "England",
  "Arsenal local catalog is England"
);
assert(
  localCatalogCountryForClub({ clubName: "AC Milan" }) === "Italy",
  "AC Milan local catalog is Italy"
);
assert(
  selectableCatalogForClub({ clubName: "Arsenal" })
    .slice(0, 10)
    .every((project) => project.country === "England"),
  "Arsenal chooses from 10 England projects on page 1"
);
assert(
  selectableCatalogForCountry("Italy")
    .slice(0, 10)
    .every((project) => project.country === "Italy"),
  "AC Milan chooses from 10 Italy projects on page 1"
);
assert(
  selectableCatalogForClub({ clubName: "Hearts of Midlothian FC" })
    .slice(10)
    .some((project) => project.name === "Ugandan Cookstove"),
  "Every club still sees international projects including Ugandan Cookstove"
);

const table = premierLeagueCilt("Arsenal FC");
assert(table.length === 20, "CILT ranks all 20 Premier League clubs");
assert(table[0].position === 1, "First row is position 1");
const arsenal = table.find((row) => row.isClub);
assert(Boolean(arsenal), "Arsenal FC is highlighted on the CILT");
assert(
  (arsenal?.position ?? 0) >= 1 && (arsenal?.tonnes ?? 0) > 0,
  "Arsenal has a CILT position and carbon tonnage"
);
assert(ciltPositionLabel(table[0]).endsWith("st"), "1st uses the st suffix");

assert(
  leagueForClubName("Hearts of Midlothian FC") === "Scottish Premiership",
  "Hearts of Midlothian FC is a Scottish Premiership club"
);
assert(
  leagueForClubName("Arsenal") === "Premier League",
  "Arsenal remains a Premier League club"
);

const spl = scottishPremiershipCilt("Hearts of Midlothian FC");
assert(spl.length === 12, "CILT ranks all 12 Scottish Premiership clubs");
const hearts = spl.find((row) => row.isClub);
assert(Boolean(hearts), "Hearts is highlighted on the Scottish Premiership CILT");
assert((hearts?.position ?? 99) <= 3, "Hearts starts in the Scottish Premiership top 3");

const climbed = scottishPremiershipCilt("Hearts of Midlothian FC", 3000);
const climbedHearts = climbed.find((row) => row.isClub);
const celtic = climbed.find((row) => row.club === "Celtic");
assert(
  (climbedHearts?.position ?? 99) < (hearts?.position ?? 0),
  "Hearts climbs the Scottish Premiership CILT when extra carbon impact is added"
);
assert(
  (climbedHearts?.tonnes ?? 0) > (celtic?.tonnes ?? 0) ||
    (climbedHearts?.position ?? 99) <= 2,
  "Hearts can overtake higher Scottish Premiership clubs on the CILT"
);

assert(
  leagueForClubName("Real Madrid") === "La Liga",
  "Real Madrid is a La Liga club"
);
const laLiga = climateImpactLeagueTable("La Liga", "Real Madrid");
assert(laLiga.length === 20, "CILT ranks all 20 La Liga clubs");
assert(
  Boolean(laLiga.find((row) => row.isClub)),
  "Real Madrid is highlighted on the La Liga CILT"
);
assert(
  leagueForClubName("Arsenal") === "Premier League",
  "Arsenal remains a Premier League club"
);

assert(
  featuredClimateProjectCountryLabel({ clubName: "Hearts of Midlothian FC" }) ===
    "UK and International",
  "Hearts sees Global Schools Solar as UK and International"
);
assert(
  featuredClimateProjectCountryLabel({
    clubName: "Arsenal",
    country: "England",
  }) === "UK and International",
  "Arsenal sees Global Schools Solar as UK and International"
);
assert(
  featuredClimateProjectCountryLabel({ clubName: "AC Milan" }) ===
    "Italy and International",
  "An AC Milan club or supporter sees Global Schools Solar as Italy and International"
);
assert(
  featuredClimateProjectCountryLabel({ clubName: "Real Madrid" }) ===
    "Spain and International",
  "A La Liga club sees Global Schools Solar as Spain and International"
);
assert(
  featuredClimateProjectCountryLabel() === "International",
  "Without a club, Global Schools Solar stays International"
);
assert(
  climateProjectCountryLabel(
    { name: "Ugandan Cookstove", country: "Uganda" },
    { clubName: "Arsenal" }
  ) === "Uganda",
  "Partner project countries stay as stored"
);
assert(
  featuredClimateProjectCountryLabelForClubs([
    { clubName: "Arsenal" },
    { clubName: "AC Milan" },
  ]) === "UK, Italy and International",
  "A fan who supports Arsenal and AC Milan sees both home countries plus International"
);

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("Club match-day pagination and CILT ranking passed.");
