import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";

const BRANCH = "cursor/lock-in-club-match-calendar-18f9";
const FILES = [
  "app/lib/sporting-calendar.ts",
  "app/lib/global-match-day.ts",
  "app/components/sponsor/ClubMatchMenus.tsx",
  "app/components/sponsor/ClubMatchCalendar.tsx",
  "app/components/sponsor/MatchDayLockIn.tsx",
  "app/sponsor/dashboard/page.tsx",
  "app/sponsor/calendar/page.tsx",
  "app/preview/match-day-lock-in/page.tsx",
  "scripts/verify-sporting-calendar.ts",
  "scripts/verify-sponsor-dashboard.ts",
  "scripts/verify-club-sponsor-tabs.ts",
  "scripts/verify-local-new-sponsorship.ts",
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

const lockIn = "app/components/sponsor/MatchDayLockIn.tsx";
const calendar = "app/components/sponsor/ClubMatchCalendar.tsx";
const dashboard = "app/sponsor/dashboard/page.tsx";
const page = "app/sponsor/calendar/page.tsx";
const helper = "app/lib/sporting-calendar.ts";
if (
  existsSync(lockIn) &&
  existsSync(calendar) &&
  existsSync(dashboard) &&
  existsSync(page) &&
  existsSync(helper)
) {
  const lockSrc = readFileSync(lockIn, "utf8");
  const calSrc = readFileSync(calendar, "utf8");
  const dashSrc = readFileSync(dashboard, "utf8");
  const pageSrc = readFileSync(page, "utf8");
  const libSrc = readFileSync(helper, "utf8");
  if (
    !lockSrc.includes("ClubTypeInMenu") ||
    !lockSrc.includes("ClubMatchCalendar") ||
    !calSrc.includes("CLUB_MATCH_CALENDAR_COUNT") ||
    !calSrc.includes("bg-s4p-mark") ||
    !dashSrc.includes("MatchDayLockIn") ||
    dashSrc.includes("Open 2026/27 Sporting Calendar") ||
    !pageSrc.includes("MatchDayLockIn") ||
    pageSrc.includes("SportingCalendarBoard") ||
    !libSrc.includes("nextClubMatches")
  ) {
    failed += 1;
    console.error(
      "Club Match calendar files did not land. Pull the files above, then hard-refresh."
    );
  }
}

if (failed) process.exit(1);
console.log(
  "OK: Match Day Lock-In is first. Type a Club, then Select the Match to see that Club's next 10 League and Cup dates. Stop npm run dev, start it again, and hard-refresh (Ctrl+F5)."
);
