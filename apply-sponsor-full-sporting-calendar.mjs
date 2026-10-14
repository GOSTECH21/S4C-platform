import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";

const BRANCH = "cursor/sponsor-full-sporting-calendar-18f9";
const FILES = [
  "app/lib/sponsor-signed-home.ts",
  "app/components/sponsor/SignedSponsorHome.tsx",
  "app/components/sponsor/SportingCalendarBoard.tsx",
  "app/sponsor/calendar/page.tsx",
  "app/services/teams.service.ts",
  "app/preview/signed-sponsor-home/page.tsx",
  "app/preview/sporting-calendar/page.tsx",
  "public/sponsors/amex.svg",
  "scripts/verify-sporting-calendar.ts",
  "scripts/verify-sponsor-dashboard.ts",
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

const home = "app/components/sponsor/SignedSponsorHome.tsx";
const board = "app/components/sponsor/SportingCalendarBoard.tsx";
if (existsSync(home) && existsSync(board)) {
  const signed = readFileSync(home, "utf8");
  const ui = readFileSync(board, "utf8");
  if (
    !signed.includes("SportingCalendarBoard") ||
    signed.includes("SponsoredMatchCalendar") ||
    !ui.includes("Signed in as {brandName}") ||
    !ui.includes("logoUrl") ||
    !ui.includes("disabled={!cell.inMonth}")
  ) {
    failed += 1;
    console.error(
      "The logged-in Sporting Calendar did not land. Pull the files above, then hard-refresh."
    );
  }
}

if (failed) process.exit(1);
console.log(
  "OK: A logged-in Lead sees the all-inclusive 2026/27 Sporting Calendar under their own name and logo. Stop npm run dev, start it again, and hard-refresh (Ctrl+F5). Click any date to see every Match that day."
);
