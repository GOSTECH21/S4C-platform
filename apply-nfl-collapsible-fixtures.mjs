import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";

const BRANCH = "cursor/nfl-collapsible-fixtures-18f9";
const FILES = [
  "app/lib/sporting-calendar.ts",
  "app/components/sponsor/SportingCalendarBoard.tsx",
  "scripts/verify-sporting-calendar.ts",
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
if (existsSync(calendar) && existsSync(board)) {
  const catalog = readFileSync(calendar, "utf8");
  const ui = readFileSync(board, "utf8");
  if (
    !catalog.includes('NFL_EXAMPLE_DATE = "2026-11-01"') ||
    !ui.includes("Load NFL Sunday 1 November") ||
    !ui.includes("jumpToLeague") ||
    !ui.includes("calendarLeagueDomId") ||
    !ui.includes("NFL fixtures are on Sundays")
  ) {
    failed += 1;
    console.error(
      "NFL collapsible fixtures did not land. Pull the files above, then hard-refresh."
    );
  }
}

if (failed) process.exit(1);
console.log(
  "OK: NFL Sundays are on the Sporting Calendar with the same collapsible lists. Stop npm run dev, start it again, and hard-refresh (Ctrl+F5). Click Load NFL Sunday 1 November, or pick a Sunday and the NFL button in the competition row."
);
