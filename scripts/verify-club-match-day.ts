import {
  MATCH_DAY_PROJECT_COUNT,
  PARTNER_PAGE_SIZE,
  partnerPageCount,
  partnerProjectPage,
} from "../app/lib/partner-projects";
import { ciltPositionLabel, premierLeagueCilt } from "../app/lib/cilt";

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

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("Club match-day pagination and CILT ranking passed.");
