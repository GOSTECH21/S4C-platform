import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";

const BRANCH = "cursor/calendar-club-first-steps-18f9";
const FILES = [
  "app/lib/global-match-day.ts",
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

const copy = "app/lib/global-match-day.ts";
const board = "app/components/sponsor/SportingCalendarBoard.tsx";
if (existsSync(copy) && existsSync(board)) {
  const steps = readFileSync(copy, "utf8");
  const ui = readFileSync(board, "utf8");
  if (
    !steps.includes("Type-in the Name of the Club you wish to sponsor") ||
    !steps.includes("Lock-in that Match") ||
    ui.includes("Load NFL Sunday 1 November") ||
    ui.includes("Sponsor a club in a Cup") ||
    ui.includes("Click a club, see their Cup Match, tick Sponsor") ||
    !ui.includes("Club you wish to sponsor") ||
    !ui.includes("matchesForClub")
  ) {
    failed += 1;
    console.error(
      "Club-first calendar steps did not land. Pull the files above, then hard-refresh."
    );
  }
}

if (failed) process.exit(1);
console.log(
  "OK: Sporting Calendar now starts with typing a club, drops the green Load tabs, and lists that club's League and Cup Matches. Stop npm run dev, start it again, and hard-refresh (Ctrl+F5)."
);
