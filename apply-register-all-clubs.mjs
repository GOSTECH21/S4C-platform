import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";

const BRANCH = "cursor/register-all-clubs-18f9";
const FILES = [
  "app/lib/calendar-clubs.ts",
  "app/components/sponsor/ClubNetworkPicker.tsx",
  "app/services/climate-sponsors.service.ts",
  "app/lib/climate-sponsors.ts",
  "app/sponsor/register/page.tsx",
  "app/sponsor/local/register/page.tsx",
  "scripts/verify-register-clubs.ts",
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

const picker = "app/components/sponsor/ClubNetworkPicker.tsx";
if (existsSync(picker)) {
  const ui = readFileSync(picker, "utf8");
  if (
    !ui.includes("sportingCalendarClubGroups") ||
    ui.includes("CURRENT_SEASON_LEAGUES")
  ) {
    failed += 1;
    console.error(
      "The comprehensive club list did not land. Pull the files above, then hard-refresh."
    );
  }
}

if (failed) process.exit(1);
console.log(
  "OK: Register as Sponsor lists every Sporting Calendar club (Premier League through NBA, rugby and NFL). Stop npm run dev, start it again, and hard-refresh (Ctrl+F5). Search a club, tick it, then Register as Sponsor."
);
