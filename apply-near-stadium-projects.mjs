import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";

const BRANCH = "cursor/near-stadium-projects-18f9";
const FILES = [
  "app/club/projects/select/page.tsx",
  "app/sponsor/campaigns/select/page.tsx",
  "app/lib/sccan-catalog.ts",
  "app/lib/stadium-nearby-projects.ts",
  "app/lib/project-site.ts",
  "app/lib/partner-projects.ts",
  "app/lib/s4p-climate-projects.ts",
  "app/lib/featured-climate-country.ts",
  "app/services/club-match-day.service.ts",
  "app/services/partner.service.ts",
  "app/components/climate/ProjectSiteLine.tsx",
  "app/components/climate/ClimateProjectListingForm.tsx",
  "app/dashboard/supporter/vote/page.tsx",
  "app/preview/nearby-projects/page.tsx",
  "app/global-schools-solar/page.tsx",
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

function read(rel) {
  return existsSync(rel) ? readFileSync(rel, "utf8") : "";
}

const select = read("app/club/projects/select/page.tsx");
const catalog = read("app/lib/sccan-catalog.ts");
const nearby = read("app/lib/stadium-nearby-projects.ts");
const labels = read("app/lib/s4p-climate-projects.ts");
if (
  !select.includes("climateProjectListLabel(3") ||
  !select.includes("setNearbyProjects") ||
  !select.includes("Climate Projects near my Stadium") ||
  !catalog.includes("Stoke Canal Rewilding") ||
  !catalog.includes("COUNTRY_PROJECT_LIST_SIZE") ||
  !nearby.includes("nearbyClimateProjectsForClub") ||
  !labels.includes('CLIMATE_PROJECTS_NEAR_STADIUM_LABEL')
) {
  failed += 1;
  console.error(
    "The third Climate Projects list did not land. Pull the files above, then hard-refresh."
  );
}

if (failed) process.exit(1);
console.log(
  "OK: Club Climate Projects has List 1 England (20), List 2 International, and Climate Projects near my Stadium (20 within 20 miles). Stop npm run dev, start it again, and hard-refresh (Ctrl+F5)."
);
