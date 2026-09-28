import { readFileSync } from "fs";
import {
  IMPACT_TABLE_FULL_LIMIT,
  IMPACT_TABLE_INTRO,
  IMPACT_TABLE_PAGE_SIZE,
  IMPACT_TABLE_TOP_COUNT,
  climateImpactLeagueRowsFor,
  impactTableHeading,
  impactTablePageCount,
  impactTablePageRows,
  impactTablesHref,
  overallClimateImpactLeagueRows,
  parseCiltFilter,
  parseImpactTableId,
  publicFanName,
  rankImpactRows,
} from "../app/lib/s4p-impact-tables";
import { S4P_IMPACT_TABLES_PATH } from "../app/lib/routes";

const failures: string[] = [];

function assert(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

assert(IMPACT_TABLE_TOP_COUNT === 5, "Homepage shows five performers");
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
  ranked[0].climateImpact === "12,840 tCO₂e" && ranked[0].funding === "£0",
  "Ranked rows carry Climate Impact and Funding columns"
);
assert(
  impactTablePageCount(20) === 4 && impactTablePageRows(ranked, 1).length <= 5,
  "20 entries become four pages of five"
);

const cilt = overallClimateImpactLeagueRows();
assert(cilt.length === IMPACT_TABLE_FULL_LIMIT, "CILT full table has 20 clubs");
assert(cilt[0].rank === 1 && cilt[9].rank === 10, "CILT top ten is numbered 1 to 10");

const football = climateImpactLeagueRowsFor(
  parseCiltFilter({ scope: "sport", sport: "Football" })
);
assert(
  football[0].name === "Arsenal" &&
    !football.some((row) => /Falcons|Patriots|Chiefs/i.test(row.name)),
  "Football CILT keeps football clubs only"
);

const premier = climateImpactLeagueRowsFor(
  parseCiltFilter({ competition: "Premier League" })
);
assert(
  premier[0].name === "Arsenal" &&
    premier.every((row) =>
      [
        "Arsenal",
        "Liverpool",
        "Chelsea",
        "Manchester City",
        "Manchester United",
        "Tottenham Hotspur",
        "Newcastle United",
        "Aston Villa",
        "Nottingham Forest",
        "Brighton & Hove Albion",
        "Fulham",
        "Bournemouth",
        "Crystal Palace",
        "Everton",
        "Brentford",
        "Leeds United",
        "Sunderland",
        "Ipswich Town",
        "Coventry City",
        "Hull City",
      ].includes(row.name)
    ),
  "Premier League CILT ranks Premier League clubs"
);
assert(
  impactTableHeading("cilt", parseCiltFilter({ competition: "Premier League" })) ===
    "Premier League CILT",
  "Filtered CILT heading names the competition"
);
assert(
  impactTableHeading("cist") === "Climate Impact Sponsorship Table (CIST)",
  "CIST heading includes the acronym"
);
assert(
  impactTableHeading("cift") === "Climate Impact Fans Table (CIFT)",
  "CIFT heading includes the acronym"
);
assert(
  impactTablesHref({ tab: "cilt", filter: parseCiltFilter({ sport: "NFL" }) }).includes(
    "sport=NFL"
  ),
  "NFL CILT filter is encoded in the URL"
);

assert(
  IMPACT_TABLE_INTRO.includes("Sports Clubs, Climate Sponsors and Fans"),
  "Shared intro explains clubs, sponsors and fans"
);

const page = readFileSync("app/s4p-impact-tables/page.tsx", "utf8");
assert(
  page.includes("Previous") && page.includes("Next") && page.includes("impactTablesHref"),
  "Full table pages CILT, CIST and CIFT in batches"
);
assert(
  page.includes("Pos") &&
    page.includes("Impact Moments") &&
    page.includes("Climate Funding") &&
    page.includes("Climate Impact") &&
    page.includes("md:hidden") &&
    page.includes("hidden md:block"),
  "Desktop table has extra columns and mobile keeps the simple view"
);
const lib = readFileSync("app/lib/s4p-impact-tables.ts", "utf8");
assert(
  page.includes("Filter CILT") &&
    page.includes("CILT_SCOPES") &&
    lib.includes('label: "Global"') &&
    lib.includes('label: "Sport"') &&
    lib.includes('label: "Competition"') &&
    lib.includes('label: "Country"') &&
    lib.includes('label: "Season"'),
  "CILT offers Global, Sport, Competition, Country and Season filters"
);
assert(
  page.includes("text-amber-300") &&
    page.includes("{row.metric}") &&
    page.includes("{board.emptyLabel}"),
  "Full CILT, CIST and CIFT subtexts use the gold metric colour"
);
assert(
  page.includes("{IMPACT_TABLE_INTRO}") && page.includes("{board.description}"),
  "Full page intro and tab description change with CILT, CIST and CIFT"
);

const widget = readFileSync("app/components/home/S4pImpactTables.tsx", "utf8");
assert(
  widget.includes("Table sponsored by") &&
    widget.includes(S4P_IMPACT_TABLES_PATH) &&
    widget.includes("text-amber-300"),
  "Each table can be sponsored by a brand later and uses gold metric text"
);
assert(
  widget.includes("h-fit") &&
    widget.includes("self-center") &&
    !widget.includes("h-full") &&
    !widget.includes("flex-1") &&
    !widget.includes("min-h-["),
  "Homepage table box shrinks to the five rows so View Full sits under the list"
);

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("S4P Impact Tables: columns, mobile simple view, CILT filters.");
