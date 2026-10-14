import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";

const BRANCH = "cursor/cup-competitions-18f9";
const FILES = [
  "app/data/published-fixtures.json",
  "app/lib/sporting-calendar-leagues.ts",
  "app/lib/sporting-calendar.ts",
  "app/lib/upcoming-matches.ts",
  "app/lib/club-fixtures.ts",
  "app/components/sponsor/SportingCalendarBoard.tsx",
  "scripts/verify-sporting-calendar.ts",
  "scripts/mine-cup-competitions.py",
  "scripts/mine-published-fixtures.py",
];

let failed = 0;
for (const rel of FILES) {
  const url = `https://raw.githubusercontent.com/GOSTECH21/S4C-platform/${BRANCH}/${rel}`;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    mkdirSync(dirname(join(rel)), { recursive: true });
    writeFileSync(rel, Buffer.from(await response.arrayBuffer()));
    console.log("Pulled", rel);
  } catch (err) {
    failed += 1;
    console.error(
      `Could not pull ${rel}. Stay in the S4C-platform folder and check the network.`,
      err instanceof Error ? err.message : err
    );
  }
}

const board = "app/components/sponsor/SportingCalendarBoard.tsx";
const leagues = "app/lib/sporting-calendar-leagues.ts";
const catalog = "app/data/published-fixtures.json";
if (existsSync(board) && existsSync(leagues) && existsSync(catalog)) {
  const ui = readFileSync(board, "utf8");
  const lib = readFileSync(leagues, "utf8");
  const json = readFileSync(catalog, "utf8");
  if (
    !ui.includes("Sponsor a club in a Cup") ||
    !ui.includes("Club you wish to sponsor") ||
    !lib.includes("Champions League") ||
    !lib.includes("Europa Conference League") ||
    !lib.includes("Carabao Cup") ||
    !json.includes('"league": "Champions League"') ||
    !json.includes('"league": "Scottish Cup"')
  ) {
    failed += 1;
    console.error(
      "Cup competitions did not land. Pull the files above, then hard-refresh."
    );
  }
}

if (failed) process.exit(1);
console.log(
  "OK: Champions League, Europa Cup, Europa Conference League, FA Cup, Carabao Cup, Scottish Cup, Italian Cup, German Cup, French Cup and Spanish Cup are on the Sporting Calendar. Stop npm run dev, start it again, and hard-refresh (Ctrl+F5). Search a club, see their Cup Match, tick Sponsor."
);
