import {
  MATCH_DAY_PROJECT_COUNT,
  PARTNER_PAGE_SIZE,
  partnerPageCount,
  partnerProjectPage,
} from "../app/lib/partner-projects";
import { ciltPositionLabel, premierLeagueCilt, scottishPremiershipCilt } from "../app/lib/cilt";
import { leagueForClubName } from "../app/lib/current-season";

const failures: string[] = [];

function assert(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

const ids = Array.from({ length: 20 }, (_, index) => index + 1);
assert(partnerProjectPage(ids, 0).length === PARTNER_PAGE_SIZE, "Page 1 has 10 projects");
assert(partnerProjectPage(ids, 1).join(",") === "11,12,13,14,15,16,17,18,19,20", "Page 2 has the next 10");
assert(partnerPageCount(20) === 2, "20 partner projects paginate into 2 pages");
assert(MATCH_DAY_PROJECT_COUNT === 5, "SD selects 5 projects for the match");

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

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("Club match-day pagination and CILT ranking passed.");
