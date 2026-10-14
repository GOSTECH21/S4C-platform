import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";

const BRANCH = "cursor/rugby-championships-18f9";
const FILES = [
  "app/data/published-fixtures.json",
  "app/data/official-rugby-union-calendars.json",
  "app/lib/sporting-calendar-leagues.ts",
  "app/lib/sporting-calendar.ts",
  "app/components/sponsor/SportingCalendarBoard.tsx",
  "scripts/verify-sporting-calendar.ts",
  "scripts/mine-rugby-championships.py",
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

const calendar = "app/lib/sporting-calendar.ts";
const board = "app/components/sponsor/SportingCalendarBoard.tsx";
const catalog = "app/data/published-fixtures.json";
if (existsSync(calendar) && existsSync(board) && existsSync(catalog)) {
  const lib = readFileSync(calendar, "utf8");
  const ui = readFileSync(board, "utf8");
  const json = readFileSync(catalog, "utf8");
  if (
    !lib.includes('SIX_NATIONS_EXAMPLE_DATE = "2027-03-13"') ||
    !lib.includes('RUGBY_CHAMPIONSHIP_EXAMPLE_DATE = "2027-07-10"') ||
    !ui.includes("Load Top 14 Saturday 31 October") ||
    !ui.includes("Load Six Nations Super Saturday 13 March") ||
    !ui.includes("Load The Rugby Championship 10 July") ||
    !json.includes('"league": "Top 14"') ||
    !json.includes('"league": "Six Nations"') ||
    !json.includes('"league": "The Rugby Championship"')
  ) {
    failed += 1;
    console.error(
      "Rugby championships did not land. Pull the files above, then hard-refresh."
    );
  }
}

if (failed) process.exit(1);
console.log(
  "OK: Top 14, Six Nations and The Rugby Championship are on the Sporting Calendar with collapsible lists. Stop npm run dev, start it again, and hard-refresh (Ctrl+F5). Saturday 31 October shows Top 14. Click Load Six Nations Super Saturday 13 March or Load The Rugby Championship 10 July."
);
