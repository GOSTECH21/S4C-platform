import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";

const BRANCH = "cursor/lead-tab-open-slot-18f9";
const FILES = [
  "app/lib/partner-projects.ts",
  "app/lib/climate-sponsors.ts",
  "app/components/club/ClubClimateSponsorTabs.tsx",
  "app/club/dashboard/page.tsx",
  "app/services/club-match-day.service.ts",
  "app/services/sponsor-offers.service.ts",
  "app/preview/club-sponsors/page.tsx",
  "scripts/verify-club-sponsor-tabs.ts",
  "scripts/verify-club-match-day.ts",
  "scripts/verify-match-day-carbon-offset.ts",
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

const tabs = "app/components/club/ClubClimateSponsorTabs.tsx";
const dashboard = "app/club/dashboard/page.tsx";
const matchDay = "app/services/club-match-day.service.ts";
if (existsSync(tabs) && existsSync(dashboard) && existsSync(matchDay)) {
  const tabSrc = readFileSync(tabs, "utf8");
  const dashSrc = readFileSync(dashboard, "utf8");
  const matchSrc = readFileSync(matchDay, "utf8");
  if (
    !tabSrc.includes("leadTabCount") ||
    !dashSrc.includes("clubDashboardLeadTabCount") ||
    !matchSrc.includes("occupyingLeadBrandNames") ||
    matchSrc.includes("leadNames.length ? leadNames : undefined")
  ) {
    failed += 1;
    console.error(
      "Lead tab (1) slot files did not land. Pull the files above, then hard-refresh."
    );
  }
}

if (failed) process.exit(1);
console.log(
  "OK: Our Lead Climate Sponsor shows (1) when the SD's chosen list is visible. The first Lead to sign off that Match Day sees the list and locks out other Leads. Stop npm run dev, start it again, and hard-refresh (Ctrl+F5)."
);
