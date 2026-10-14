import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";

const BRANCH = "cursor/global-match-day-calendar-18f9";
const FILES = [
  "app/lib/sporting-calendar-leagues.ts",
  "app/lib/sporting-calendar.ts",
  "app/lib/global-match-day.ts",
  "app/lib/climate-sponsors.ts",
  "app/lib/routes.ts",
  "app/services/climate-sponsors.service.ts",
  "app/components/sponsor/SportingCalendarBoard.tsx",
  "app/sponsor/calendar/page.tsx",
  "app/sponsor/dashboard/page.tsx",
  "app/sponsor/sponsor-nav.tsx",
  "app/components/sponsor/SignedSponsorHome.tsx",
  "app/preview/sporting-calendar/page.tsx",
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
    !catalog.includes("2026-10-31") ||
    !catalog.includes("Premier League") ||
    !ui.includes("Lock these Matches as Goal Sponsor")
  ) {
    failed += 1;
    console.error(
      "The 2026/27 Sporting Calendar did not land. Pull the files above, then hard-refresh."
    );
  }
}

if (failed) process.exit(1);
console.log(
  "OK: 2026/27 Sporting Calendar is on this PC. Stop npm run dev, start it again, and hard-refresh (Ctrl+F5). Open /sponsor/calendar or /preview/sporting-calendar."
);
