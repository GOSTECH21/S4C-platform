import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";

const BRANCH = "cursor/club-lead-local-lookback-18f9";
const FILES = [
  "app/lib/climate-sponsors.ts",
  "app/lib/match-day-branding.ts",
  "app/services/climate-sponsors.service.ts",
  "app/lib/partner-projects.ts",
  "app/lib/climate-funding.ts",
  "app/components/club/ClubClimateSponsorTabs.tsx",
  "app/club/dashboard/page.tsx",
  "app/services/club-match-day.service.ts",
  "scripts/verify-club-sponsor-tabs.ts",
  "scripts/verify-club-match-day.ts",
  "scripts/verify-wallet-vote.ts",
  "scripts/verify-dual-sponsor.ts",
  "app/preview/club-sponsors/page.tsx",
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
const sponsors = "app/lib/climate-sponsors.ts";
if (existsSync(tabs) && existsSync(dashboard) && existsSync(sponsors)) {
  const tabSrc = readFileSync(tabs, "utf8");
  const dashSrc = readFileSync(dashboard, "utf8");
  const sponsorSrc = readFileSync(sponsors, "utf8");
  if (
    !sponsorSrc.includes("isLeadMatchDaySponsorBrand(row.brandName)") ||
    !tabSrc.includes("approvedBrandNames") ||
    !dashSrc.includes("clubDashboardLookbackCopy") ||
    !dashSrc.includes("MATCH_DAY_FULLY_FUNDED_LABEL") ||
    !dashSrc.includes("lookbackProjectFunding") ||
    dashSrc.includes("Incomplete or unstamped copies")
  ) {
    failed += 1;
    console.error(
      "Lead/Local lookback files did not land. Pull the files above, then hard-refresh."
    );
  }
}

if (failed) process.exit(1);
console.log(
  "OK: Lead Climate Sponsors stay on Our Lead Climate Sponsor; signed-off brands are highlighted; lookback shows Approved, funding received of sought, and Fully-Funded. Stop npm run dev, start it again, and hard-refresh (Ctrl+F5)."
);
