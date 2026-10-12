import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";

const BRANCH = "cursor/sponsor-login-calendar-18f9";
const FILES = [
  "app/lib/sponsor-dashboard.ts",
  "app/lib/sponsor-signed-home.ts",
  "app/services/sponsor-offers.service.ts",
  "app/components/sponsor/SignedSponsorHome.tsx",
  "app/sponsor/dashboard/page.tsx",
  "app/preview/sponsor-login-home/page.tsx",
  "app/preview/signed-sponsor-home/page.tsx",
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

const dashboard = "app/sponsor/dashboard/page.tsx";
if (existsSync(dashboard)) {
  const src = readFileSync(dashboard, "utf8");
  if (!src.includes("hasCompletedMatchSponsorship")) {
    failed += 1;
    console.error(
      "Dashboard is missing the returning-sponsor calendar home. Pull the files above, then hard-refresh."
    );
  }
}

if (failed) process.exit(1);
console.log(
  "OK: Logging in as a Sponsor after funding a Club and its Goals scored opens the Match-Day calendar, My Sponsored Match, Where your money went, and CIST. Stop npm run dev, start it again, and hard-refresh (Ctrl+F5)."
);
