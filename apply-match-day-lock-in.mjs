import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";

const BRANCH = "cursor/match-day-lock-in-18f9";
const FILES = [
  "app/lib/climate-sponsors.ts",
  "app/components/sponsor/ClubMatchMenus.tsx",
  "app/sponsor/dashboard/page.tsx",
  "app/services/sponsor-offers.service.ts",
  "scripts/verify-sponsor-dashboard.ts",
  "scripts/verify-climate-sponsors.ts",
  "scripts/verify-match-day-carbon-offset.ts",
  "scripts/verify-club-sponsor-tabs.ts",
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

const dashboard = "app/sponsor/dashboard/page.tsx";
if (existsSync(dashboard)) {
  const src = readFileSync(dashboard, "utf8");
  if (
    !src.includes("Match Day Lock-In") ||
    src.includes("Select a Club") ||
    !src.includes("registeredClubForLockIn") ||
    !src.includes("loadClubChosenClimateProjects")
  ) {
    failed += 1;
    console.error(
      "Match Day Lock-In did not land. Pull the files above, then hard-refresh."
    );
  }
}

if (failed) process.exit(1);
console.log(
  "OK: After Register as Sponsor, the dashboard Club box shows that club. Choose the Match, view Match details, and see the club's 5 Climate Projects under Match Day Lock-In. Stop npm run dev, start it again, and hard-refresh (Ctrl+F5)."
);
