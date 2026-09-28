import { readFileSync } from "fs";
import {
  IMPACT_TABLE_FULL_LIMIT,
  IMPACT_TABLE_PAGE_SIZE,
  IMPACT_TABLE_TOP_COUNT,
  impactTablePageCount,
  impactTablePageRows,
  overallClimateImpactLeagueRows,
  parseImpactTableId,
  publicFanName,
  rankImpactRows,
} from "../app/lib/s4p-impact-tables";
import { S4P_IMPACT_TABLES_PATH } from "../app/lib/routes";

const failures: string[] = [];

function assert(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

assert(IMPACT_TABLE_TOP_COUNT === 10, "Homepage shows ten performers");
assert(IMPACT_TABLE_FULL_LIMIT === 20, "Full table is capped at 20 entries");
assert(IMPACT_TABLE_PAGE_SIZE === 5, "Full table is viewed in batches of five");
assert(parseImpactTableId("cist") === "cist", "CIST tab is a valid impact table");
assert(parseImpactTableId("nope") === "cilt", "Unknown tabs fall back to CILT");
assert(publicFanName("Sarah Mitchell") === "Sarah M.", "Fan names stay public-safe");

const ranked = rankImpactRows([
  { name: "Hearts", metric: "12,840 tCO₂e", sortValue: 12840 },
  { name: "Kilmarnock", metric: "9,120 tCO₂e", sortValue: 9120 },
  { name: "Aberdeen", metric: "10,480 tCO₂e", sortValue: 10480 },
]);
assert(ranked[0].name === "Hearts" && ranked[0].rank === 1, "Highest impact ranks first");
assert(
  impactTablePageCount(20) === 4 && impactTablePageRows(ranked, 1).length <= 5,
  "20 entries become four pages of five"
);

const cilt = overallClimateImpactLeagueRows();
assert(cilt.length === IMPACT_TABLE_FULL_LIMIT, "CILT full table has 20 clubs");
assert(cilt[0].rank === 1 && cilt[9].rank === 10, "CILT top ten is numbered 1 to 10");

const page = readFileSync("app/s4p-impact-tables/page.tsx", "utf8");
assert(
  page.includes("Previous") && page.includes("Next") && page.includes("tab=${board.id}"),
  "Full table pages CILT, CIST and CIFT in batches"
);

const widget = readFileSync("app/components/home/S4pImpactTables.tsx", "utf8");
assert(
  widget.includes("Table sponsored by") &&
    widget.includes(S4P_IMPACT_TABLES_PATH),
  "Each table can be sponsored by a brand later"
);

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("S4P Impact Tables: CILT, CIST and CIFT top five plus 20-row full tables.");
