import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";

const BRANCH = "cursor/local-lobi-home-18f9";
const FILES = [
  "app/lib/lobi.ts",
  "app/lib/local-sponsor-home.ts",
  "app/lib/routes.ts",
  "app/lib/sponsor-home.ts",
  "app/components/sponsor/LocalSignedSponsorHome.tsx",
  "app/components/sponsor/SponsorLobiTable.tsx",
  "app/components/sponsor/SponsoredMatchCalendar.tsx",
  "app/components/sponsor/FundedClimateProjectsList.tsx",
  "app/sponsor/local/page.tsx",
  "app/sponsor/local/register/page.tsx",
  "app/sponsor/wallet/page.tsx",
  "app/sponsor/dashboard/page.tsx",
  "app/sponsor/sponsor-nav.tsx",
  "app/preview/local-sponsor-home/page.tsx",
  "scripts/verify-local-lobi-home.ts",
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

const home = "app/lib/sponsor-home.ts";
if (existsSync(home)) {
  const src = readFileSync(home, "utf8");
  if (!src.includes("LOCAL_SPONSOR_HOME_PATH")) {
    failed += 1;
    console.error(
      "Local login still points at the wallet. Pull the files above, then hard-refresh."
    );
  }
}

if (failed) process.exit(1);
console.log(
  "OK: Local Business Climate Sponsors log into calendar, sponsored Matches, where money went, and LOBI. Stop npm run dev, start it again, and hard-refresh (Ctrl+F5)."
);
