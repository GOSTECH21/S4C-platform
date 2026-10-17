import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";

const BRANCH = "cursor/calendar-future-matches-18f9";
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

const helper = "app/lib/sporting-calendar.ts";
const board = "app/components/sponsor/SportingCalendarBoard.tsx";
if (existsSync(helper) && existsSync(board)) {
  const lib = readFileSync(helper, "utf8");
  const ui = readFileSync(board, "utf8");
  if (
    !lib.includes("isUpcomingCalendarDate") ||
    !lib.includes("fromDate") ||
    !ui.includes("No upcoming Matches") ||
    !ui.includes("isUpcomingCalendarDate")
  ) {
    failed += 1;
    console.error(
      "Upcoming-only club Matches did not land. Pull the files above, then hard-refresh."
    );
  }
}

if (failed) process.exit(1);
console.log(
  "OK: The Sporting Calendar now lists only upcoming Matches for a club. Stop npm run dev, start it again, and hard-refresh (Ctrl+F5)."
);
